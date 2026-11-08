use tauri::{AppHandle, Manager, PhysicalPosition, WindowEvent};

const PET_WINDOW: &str = "pet";
const PANEL_WINDOW: &str = "panel";

fn physical(logical_pixels: f64, scale_factor: f64) -> i32 {
    (logical_pixels * scale_factor).round() as i32
}

fn clamp_to_work_area(value: i32, start: i32, end: i32, size: u32) -> i32 {
    let size = size as i32;
    if end - start <= size {
        start
    } else {
        value.clamp(start, end - size)
    }
}

fn position_panel(
    app: &AppHandle,
    pet_position: Option<PhysicalPosition<i32>>,
    only_if_visible: bool,
) {
    let Some(pet) = app.get_webview_window(PET_WINDOW) else {
        return;
    };
    let Some(panel) = app.get_webview_window(PANEL_WINDOW) else {
        return;
    };
    if only_if_visible && !panel.is_visible().unwrap_or(false) {
        return;
    }

    let Ok(position) = pet_position.map(Ok).unwrap_or_else(|| pet.outer_position()) else {
        return;
    };
    let Ok(panel_size) = panel.outer_size() else {
        return;
    };
    let scale_factor = pet.scale_factor().unwrap_or(1.0);
    let monitor = pet.current_monitor().ok().flatten();
    let work_area = monitor.as_ref().map(|monitor| monitor.work_area());

    // Anchor the two visible surfaces, not their transparent webview margins.
    let pet_art_left = physical(32.0, scale_factor);
    let pet_art_right = physical(118.0, scale_factor);
    let panel_inset = physical(8.0, scale_factor);
    let visible_gap = physical(16.0, scale_factor);
    let panel_visible_width = panel_size.width as i32 - panel_inset;
    let right_x = position.x + pet_art_right + visible_gap - panel_inset;
    let left_x = position.x + pet_art_left - visible_gap - panel_visible_width;

    let mut x = if work_area
        .as_ref()
        .is_none_or(|area| right_x + panel_size.width as i32 <= area.position.x + area.size.width as i32)
    {
        right_x
    } else {
        left_x
    };
    let mut y = position.y + physical(12.0, scale_factor);

    if let Some(area) = work_area {
        x = clamp_to_work_area(
            x,
            area.position.x,
            area.position.x + area.size.width as i32,
            panel_size.width,
        );
        y = clamp_to_work_area(
            y,
            area.position.y,
            area.position.y + area.size.height as i32,
            panel_size.height,
        );
    }

    let next_position = PhysicalPosition::new(x, y);
    if panel.outer_position().ok() != Some(next_position) {
        let _ = panel.set_position(next_position);
    }
}

#[tauri::command]
fn position_panel_beside_pet(app: AppHandle) {
    position_panel(&app, None, false);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![position_panel_beside_pet])
        .on_window_event(|window, event| {
            if window.label() == PET_WINDOW {
                if let WindowEvent::Moved(position) = event {
                    position_panel(&window.app_handle(), Some(*position), true);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running desktop pet");
}
