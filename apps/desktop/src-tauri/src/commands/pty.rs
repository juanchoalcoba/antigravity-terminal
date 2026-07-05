use crate::pty::dispatcher::CommandDispatcher;
use crate::pty::manager::SessionManager;
use tauri::{AppHandle, State};

#[tauri::command]
pub fn create_pty_session(
    app: AppHandle,
    state: State<'_, SessionManager>,
    rows: u16,
    cols: u16,
) -> Result<String, String> {
    CommandDispatcher::create_session(&state, app, rows, cols)
}

#[tauri::command]
pub fn write_to_pty(
    state: State<'_, SessionManager>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    CommandDispatcher::write_pty(&state, &session_id, &data)
}

#[tauri::command]
pub fn resize_pty(
    state: State<'_, SessionManager>,
    session_id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    CommandDispatcher::resize_pty(&state, &session_id, rows, cols)
}

#[tauri::command]
pub fn destroy_pty_session(
    state: State<'_, SessionManager>,
    session_id: String,
) -> Result<(), String> {
    CommandDispatcher::destroy_session(&state, &session_id)
}
