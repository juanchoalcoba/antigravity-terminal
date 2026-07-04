use crate::pty::manager::PtyManager;
use tauri::{AppHandle, State};

#[tauri::command]
pub fn register_process(
    app: AppHandle,
    state: State<'_, PtyManager>,
    session_id: String,
    command: String,
) -> Result<(), String> {
    state.register_process(&app, &session_id, &command)
}

#[tauri::command]
pub fn mark_process_ended(
    app: AppHandle,
    state: State<'_, PtyManager>,
    session_id: String,
) -> Result<(), String> {
    state.mark_process_ended(&app, &session_id)
}
