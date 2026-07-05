use crate::pty::manager::SessionManager;
use tauri::AppHandle;

/// CommandDispatcher routes incoming requests from the frontend to the SessionManager.
/// In the future, this layer can intercept commands (e.g., validate, log, or parse).
pub struct CommandDispatcher;

impl CommandDispatcher {
    pub fn create_session(
        state: &SessionManager,
        app: AppHandle,
        rows: u16,
        cols: u16,
    ) -> Result<String, String> {
        state.create_session(app, rows, cols)
    }

    pub fn write_pty(state: &SessionManager, session_id: &str, data: &str) -> Result<(), String> {
        state.write_to_session(session_id, data)
    }

    pub fn resize_pty(
        state: &SessionManager,
        session_id: &str,
        rows: u16,
        cols: u16,
    ) -> Result<(), String> {
        state.resize_session(session_id, rows, cols)
    }

    pub fn destroy_session(state: &SessionManager, session_id: &str) -> Result<(), String> {
        state.destroy_session(session_id)
    }

    pub fn register_process(
        state: &SessionManager,
        app: AppHandle,
        session_id: &str,
        command: &str,
    ) -> Result<(), String> {
        state.register_process(app, session_id, command)
    }

    pub fn mark_process_ended(
        state: &SessionManager,
        app: AppHandle,
        session_id: &str,
    ) -> Result<(), String> {
        state.mark_process_ended(app, session_id)
    }
}

