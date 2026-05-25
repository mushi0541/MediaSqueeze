use std::sync::Mutex;
use tauri_plugin_shell::process::CommandChild;
use sysinfo::System;

pub struct AppState {
    pub ffmpeg_child: Mutex<Option<CommandChild>>,
    pub sys: Mutex<System>,
}
