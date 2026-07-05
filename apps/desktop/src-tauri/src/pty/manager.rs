use crate::pty::event_bus::EventBus;
use crate::pty::pty_manager::PtyManager;
use crate::pty::session::TerminalSession;
use crate::pty::shell::ShellDetector;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::AppHandle;
use uuid::Uuid;

pub struct SessionManager {
    sessions: Mutex<HashMap<String, TerminalSession>>,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }

    pub fn create_session(
        &self,
        app_handle: AppHandle,
        rows: u16,
        cols: u16,
    ) -> Result<String, String> {
        let shell = ShellDetector::detect_default_shell();
        let pty_handle = PtyManager::spawn(&shell, rows, cols)?;
        
        let session_id = Uuid::new_v4().to_string();
        let event_bus = EventBus::new(app_handle);
        
        let session = TerminalSession::new(session_id.clone(), pty_handle, event_bus);
        
        self.sessions
            .lock()
            .unwrap()
            .insert(session_id.clone(), session);
            
        Ok(session_id)
    }

    pub fn write_to_session(&self, session_id: &str, data: &str) -> Result<(), String> {
        let sessions = self.sessions.lock().unwrap();
        if let Some(session) = sessions.get(session_id) {
            session.write(data)
        } else {
            Err("Session not found".to_string())
        }
    }

    pub fn resize_session(&self, session_id: &str, rows: u16, cols: u16) -> Result<(), String> {
        let sessions = self.sessions.lock().unwrap();
        if let Some(session) = sessions.get(session_id) {
            session.resize(rows, cols)
        } else {
            Err("Session not found".to_string())
        }
    }

    pub fn destroy_session(&self, session_id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock().unwrap();
        if sessions.remove(session_id).is_some() {
            Ok(())
        } else {
            Err("Session not found".to_string())
        }
    }

    pub fn register_process(
        &self,
        _app_handle: AppHandle,
        _session_id: &str,
        _command: &str,
    ) -> Result<(), String> {
        // Stub: Not implemented in Phase 1
        Ok(())
    }

    pub fn mark_process_ended(
        &self,
        _app_handle: AppHandle,
        _session_id: &str,
    ) -> Result<(), String> {
        // Stub: Not implemented in Phase 1
        Ok(())
    }
}
