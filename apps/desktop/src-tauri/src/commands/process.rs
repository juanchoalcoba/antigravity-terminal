use crate::pty::dispatcher::CommandDispatcher;
use crate::pty::manager::SessionManager;
use tauri::{AppHandle, State};

#[tauri::command]
pub fn register_process(
    app: AppHandle,
    state: State<'_, SessionManager>,
    session_id: String,
    command: String,
) -> Result<(), String> {
    CommandDispatcher::register_process(&state, app, &session_id, &command)
}

#[tauri::command]
pub fn mark_process_ended(
    app: AppHandle,
    state: State<'_, SessionManager>,
    session_id: String,
) -> Result<(), String> {
    CommandDispatcher::mark_process_ended(&state, app, &session_id)
}
