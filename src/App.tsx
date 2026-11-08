import { useEffect, useState, type MouseEvent, type PointerEvent } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { MysteryEgg } from "./components/MysteryEgg";

type PanelView = "closed" | "menu" | "settings" | "updates";

const PANEL_LABEL = "panel";

function App() {
  const [view, setView] = useState<PanelView>(() =>
    isTauri() && getCurrentWindow().label === PANEL_LABEL ? "menu" : "closed",
  );

  const openPanel = async () => {
    if (!isTauri()) {
      setView("menu");
      return;
    }
    if (getCurrentWindow().label !== "pet") return;

    const panelWindow = await WebviewWindow.getByLabel(PANEL_LABEL);
    if (!panelWindow) return;
    await invoke("position_panel_beside_pet");
    await panelWindow.show();
    await panelWindow.setFocus().catch(() => undefined);
  };

  const closePanel = async () => {
    if (!isTauri()) {
      setView("closed");
      return;
    }

    const currentWindow = getCurrentWindow();
    if (currentWindow.label === PANEL_LABEL) {
      setView("menu");
      await currentWindow.hide();
      return;
    }

    const panelWindow = await WebviewWindow.getByLabel(PANEL_LABEL);
    if (panelWindow) await panelWindow.hide();
    setView("closed");
  };

  const handleEggContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void openPanel();
  };

  const startPetDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button === 0 && isTauri()) {
      void getCurrentWindow().startDragging().catch(() => undefined);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && view !== "closed") void closePanel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view]);

  const exitApp = async () => {
    if (isTauri()) {
      const windows = await WebviewWindow.getAll();
      await Promise.all(windows.map((appWindow) => appWindow.close()));
    }
  };

  return (
    <main className={`desktop-shell ${view === "closed" ? "desktop-shell--pet-only" : "desktop-shell--panel"}`}>
      {view === "closed" ? (
        <button
          className="egg-on-desktop"
          aria-label="右鍵開啟寵物面板，左鍵拖曳移動"
          title="左鍵拖曳移動・右鍵開啟"
          onPointerDown={startPetDrag}
          onContextMenu={handleEggContextMenu}
        >
          <MysteryEgg size={101} />
          <span className="egg-hover-hint">右鍵開啟</span>
        </button>
      ) : (
        <section className="control-window" aria-label="寵物控制面板">
          <header className="window-header">
            <div className="header-brand">
              <span className="pixel-flower" aria-hidden="true">✳</span>
              <div>
                <p className="window-eyebrow">16-BIT DESK COMPANION</p>
                <h1>{view === "settings" ? "寵物設定" : view === "updates" ? "版本資訊" : "照顧面板"}</h1>
              </div>
            </div>
            <div className="header-tools">
              <span className="hatch-status"><i />尚未孵化</span>
              <button className="window-close" onClick={() => void closePanel()} aria-label="收起面板" title="收起">×</button>
            </div>
          </header>

          {view === "menu" && <CarePanel onSettings={() => setView("settings")} onUpdates={() => setView("updates")} onExit={() => void exitApp()} />}
          {view === "settings" && <SettingsPanel onBack={() => setView("menu")} />}
          {view === "updates" && <UpdatesPanel onBack={() => setView("menu")} />}
        </section>
      )}
    </main>
  );
}

function CarePanel({ onSettings, onUpdates, onExit }: { onSettings: () => void; onUpdates: () => void; onExit: () => void }) {
  return (
    <div className="panel-content">
      <section className="welcome-card">
        <div className="welcome-copy">
          <span className="mini-kicker">YOUR LITTLE WORLD</span>
          <h2>新的夥伴正在<br />蛋裡等你。</h2>
          <p>到設定中上傳圖片，<br />打造專屬的 16-bit 寵物。</p>
        </div>
        <div className="welcome-egg"><MysteryEgg size={83} /></div>
        <span className="welcome-spark spark-a">✦</span>
        <span className="welcome-spark spark-b">✧</span>
      </section>

      <section className="status-section">
        <div className="section-heading"><h2>寵物狀態</h2><span>建立寵物後顯示</span></div>
        <div className="status-grid">
          <StatusCard label="飽食" icon="▰" tone="mint" />
          <StatusCard label="口渴" icon="◆" tone="blue" />
          <StatusCard label="心情" icon="✦" tone="coral" />
          <StatusCard label="健康" icon="＋" tone="lilac" />
        </div>
      </section>

      <section className="care-section">
        <div className="section-heading"><h2>照顧與陪伴</h2><span className="preview-pill">介面預覽</span></div>
        <div className="care-grid">
          <ActionCard icon="▧" label="餵食" detail="補充飽食" tone="mint" />
          <ActionCard icon="◈" label="喝水" detail="補充口渴" tone="blue" />
          <ActionCard icon="＋" label="看醫生" detail="恢復健康" tone="coral" />
          <ActionCard icon="➜" label="散步" detail="提升心情" tone="lilac" />
          <ActionCard icon="»" label="跑步" detail="提升心情" tone="yellow" />
          <ActionCard icon="♡" label="撫摸" detail="提升心情" tone="pink" />
          <ActionCard icon="☾" label="睡覺" detail="休息恢復" tone="night" />
        </div>
      </section>

      <footer className="bottom-nav">
        <button onClick={onSettings}><span>⚙</span>設定</button>
        <button onClick={onUpdates}><span>↻</span>更新</button>
        <button className="exit-action" onClick={onExit}><span>↗</span>退出</button>
      </footer>
      <p className="prototype-note">照顧功能尚未啟用・目前為介面原型</p>
    </div>
  );
}

function StatusCard({ label, icon, tone }: { label: string; icon: string; tone: string }) {
  return (
    <div className={`status-card status-card--${tone}`}>
      <span className="status-icon">{icon}</span>
      <div className="status-meta"><span>{label}</span><b>—</b></div>
      <div className="status-track"><i /></div>
    </div>
  );
}

function ActionCard({ icon, label, detail, tone }: { icon: string; label: string; detail: string; tone: string }) {
  return (
    <button className={`action-card action-card--${tone}`} disabled title="功能尚未開放">
      <span className="action-icon">{icon}</span>
      <span className="action-text"><b>{label}</b><small>{detail}</small></span>
      <span className="action-lock" aria-label="尚未開放">· · ·</span>
    </button>
  );
}

function SettingsPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="panel-content settings-content">
      <button className="back-link" onClick={onBack}><span>←</span> 回到照顧面板</button>

      <section className="settings-section character-settings">
        <div className="section-heading"><div><span className="mini-kicker">MAKE IT YOURS</span><h2>建立你的寵物</h2></div><span className="preview-pill">尚未開放</span></div>
        <div className="upload-card">
          <div className="upload-symbol"><span>↑</span></div>
          <div><b>上傳角色圖片</b><p>讓 AI 將圖片轉成 16-bit 像素角色<br />並設計不同動作與反應。</p></div>
          <button disabled className="upload-button">選擇圖片</button>
        </div>
        <p className="quiet-note">角色生成介面預覽・目前不會上傳或處理圖片</p>
      </section>

      <section className="settings-section">
        <div className="section-heading"><h2>選擇寵物</h2><span>我的角色 0</span></div>
        <div className="pet-collection">
          <div className="pet-choice pet-choice--selected">
            <div className="choice-art"><MysteryEgg size={50} /></div>
            <b>神秘像素蛋</b><span>預設角色</span>
            <i className="choice-check">✓</i>
          </div>
          <button className="pet-choice pet-choice--empty" disabled>
            <div className="add-pet-mark">＋</div><b>新增寵物</b><span>上傳圖片生成</span>
          </button>
        </div>
      </section>

      <section className="settings-section movement-section">
        <div className="section-heading"><h2>桌面行為</h2><span>介面預覽</span></div>
        <div className="movement-options" aria-label="寵物移動方式">
          <button className="movement-choice is-selected" disabled><span>↝</span><b>自由漫遊</b><small>在桌面四處走動</small></button>
          <button className="movement-choice" disabled><span>⌖</span><b>固定位置</b><small>停留在指定位置</small></button>
        </div>
      </section>
      <p className="prototype-note">圖片生成、角色選擇與桌面行為設定尚未啟用</p>
    </div>
  );
}

function UpdatesPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="panel-content updates-content">
      <button className="back-link" onClick={onBack}><span>←</span> 回到照顧面板</button>
      <section className="update-card">
        <div className="update-mark">✳</div>
        <span className="mini-kicker">DESKTOP PET</span>
        <h2>目前版本</h2>
        <p className="version-number">0.1.0 <span>介面原型</span></p>
        <div className="update-divider" />
        <p className="update-copy">更新檢查介面預覽<br />自動更新功能尚未開放。</p>
        <button className="update-check" disabled>檢查更新 <span>↻</span></button>
      </section>
      <p className="prototype-note">像素小夥伴・正在慢慢成形</p>
    </div>
  );
}

export default App;
