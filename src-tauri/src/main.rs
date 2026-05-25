#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

use state::AppState;
use std::sync::Mutex;

fn main() {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_cpu_usage();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            ffmpeg_child: Mutex::new(None),
            sys: Mutex::new(sys),
        })
        .invoke_handler(tauri::generate_handler![
            commands::check_ffmpeg,
            commands::get_video_info,
            commands::get_image_info,
            commands::compress_video,
            commands::compress_image,
            commands::cancel_compression,
            commands::load_history,
            commands::save_history,
            commands::reveal_file,
            commands::get_system_metrics,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
