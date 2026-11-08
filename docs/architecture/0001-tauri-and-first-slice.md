# ADR 0001：Tauri 2 與介面原型

- 狀態：採用；前端建置、原生編譯與 debug app build 通過，桌面視覺驗收待執行
- 日期：2026-11-08

## 背景

產品是 Windows 桌面像素寵物。使用者要平常只看見寵物本人，左鍵拖曳，對寵物按右鍵才展開控制面板。第一階段先確認介面方向，不做養成數值、圖像上傳、LLM 生成或寵物漫遊邏輯。

## 桌面框架評估

### Tauri 2

- Web 前端搭配 Rust 原生外殼。
- 視窗設定支援透明、無邊框、置頂等選項；視窗 API 提供程式調整尺寸和拖曳。
- Windows 使用 WebView2；發行部署時需留意 runtime。
- 優點：桌面視窗行為和原生功能有明確 API，不需隨應用包一份 Chromium。
- 代價：需要 Windows Rust/C++ 工具鏈和 WebView2，透明層需在 Windows 桌面實際驗收。

### Electron

- 使用 Web/Node.js 桌面外殼，透過 BrowserWindow 管理視窗。
- 優點：JavaScript 開發者上手快，Node 生態成熟。
- 代價：需隨應用程式散佈 Chromium/Node runtime；本專案目前已有 Rust 工具鏈，Tauri 的透明桌面視窗 API 更直接貼合首要需求。

## 決策與介面行為

採用 Tauri 2 + React + TypeScript + Vite。

- 寵物原生視窗 150×160、透明、無邊框、置頂、略過工作列，只顯示灰色 16-bit 問號像素蛋。
- 照顧面板使用獨立 220×620 透明無邊框視窗（相較原 440 CSS 像素寬度減半）；右鍵寵物時依可見蛋圖邊緣定位，與蛋保持小間距且上緣靠近蛋頂端，不遮住寵物。
- 左鍵拖曳移動寵物時，由 Rust/Tauri 原生 `WindowEvent::Moved` 處理器直接同步面板位置，避免依賴寵物 WebView 在原生拖曳期間更新；螢幕邊緣空間不足時將面板放到寵物另一側。
- 收起面板或按 Escape 只隱藏面板，不影響寵物視窗。
- 面板包含飽食、口渴、心情、健康、餵食、喝水、看醫生、散步、跑步、撫摸、睡覺，以及設定/更新/退出入口。
- 設定頁呈現上傳圖生成、選寵物、自由漫遊/固定位置；遊戲、狀態、圖片與生成按鈕均停用，明確標記為介面原型。
- 角色和面板以本機 SVG/CSS 繪製，不連外、不讀取使用者圖片。

## 第一里程碑驗收

1. 收起狀態只顯示灰色問號像素蛋。
2. 左鍵拖曳移動、蛋上右鍵展開、收起按鈕/Escape 收回。
3. 面板和設定/更新頁清楚顯示使用者列出的功能與目前未啟用狀態。
4. 退出按鈕可關閉應用程式。

## 參考

- [Tauri 架構](https://v2.tauri.app/concept/architecture/)
- [Tauri 視窗設定](https://v2.tauri.app/reference/config/)
- [Tauri JavaScript 視窗 API](https://v2.tauri.app/reference/javascript/api/namespacewebviewwindow/)
- [Electron 官方介紹](https://www.electronjs.org/docs/latest/)
