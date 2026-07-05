use serde::Serialize;
use tauri::{AppHandle, Emitter};

#[derive(Clone, Serialize)]
pub struct PtyPayload {
    pub data: String,
}

pub struct EventBus {
    app_handle: AppHandle,
}

impl EventBus {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    /// Emit stdout data from a PTY to the frontend.
    pub fn emit_pty_data(&self, session_id: &str, data: String) {
        let event_name = format!("pty-data-{}", session_id);
        let _ = self.app_handle.emit(&event_name, PtyPayload { data });
    }

    /// Emit an exit event when a PTY session closes.
    pub fn emit_pty_exit(&self, session_id: &str) {
        let event_name = format!("pty-exit-{}", session_id);
        let _ = self.app_handle.emit(&event_name, ());
    }
}
