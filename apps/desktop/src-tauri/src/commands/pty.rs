use crate::pty::manager::PtyManager;
use tauri::{AppHandle, State};

#[tauri::command]
pub fn create_pty_session(
    app: AppHandle,
    state: State<'_, PtyManager>,
    rows: u16,
    cols: u16,
) -> Result<String, String> {
    state.create_session(app, rows, cols)
}

#[tauri::command]
pub fn write_to_pty(
    state: State<'_, PtyManager>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    state.write_to_session(&session_id, &data)
}

#[tauri::command]
pub fn resize_pty(
    state: State<'_, PtyManager>,
    session_id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    state.resize_session(&session_id, rows, cols)
}

#[tauri::command]
pub fn destroy_pty_session(
    state: State<'_, PtyManager>,
    session_id: String,
) -> Result<(), String> {
    state.destroy_session(&session_id)
}
