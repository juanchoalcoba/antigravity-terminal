use crate::pty::process::{Process, ProcessMode};
use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

pub struct PtySession {
    pub master: Box<dyn MasterPty + Send>,
    pub writer: Box<dyn Write + Send>,
    pub current_process: Arc<Mutex<Option<Process>>>,
}

pub struct PtyManager {
    pub sessions: Mutex<HashMap<String, PtySession>>,
}

#[derive(Clone, serde::Serialize)]
struct PtyPayload {
    data: String,
}

#[derive(Clone, serde::Serialize)]
struct ProcessPayload {
    session_id: String,
    process: Process,
}

impl PtyManager {
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
        let pty_system = native_pty_system();

        let size = PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        };

        let pair = pty_system
            .openpty(size)
            .map_err(|e| format!("Failed to open pty: {}", e))?;

        let shell = if cfg!(windows) {
            "powershell.exe".to_string()
        } else {
            std::env::var("SHELL").unwrap_or_else(|_| "bash".to_string())
        };

        let cmd = CommandBuilder::new(shell);

        let _child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn command: {}", e))?;

        let mut reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| format!("Failed to clone reader: {}", e))?;

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("Failed to take writer: {}", e))?;

        let session_id = Uuid::new_v4().to_string();
        let session_id_clone = session_id.clone();

        let current_process: Arc<Mutex<Option<Process>>> = Arc::new(Mutex::new(None));
        let current_process_clone = current_process.clone();

        thread::spawn(move || {
            let mut buf = [0u8; 1024];
            loop {
                match reader.read(&mut buf) {
                    Ok(n) if n > 0 => {
                        let data = String::from_utf8_lossy(&buf[..n]).to_string();

                        // Check process mode to route the event
                        let mode = {
                            let guard = current_process_clone.lock().unwrap();
                            guard.as_ref().map(|p| p.mode.clone())
                        };

                        match mode {
                            Some(ProcessMode::Pager) => {
                                let _ = app_handle.emit(
                                    &format!("process-pager-active-{}", session_id_clone),
                                    PtyPayload { data: data.clone() },
                                );
                                // Still forward to xterm so user sees output
                                let _ = app_handle.emit(
                                    &format!("pty-data-{}", session_id_clone),
                                    PtyPayload { data },
                                );
                            }
                            _ => {
                                let _ = app_handle.emit(
                                    &format!("pty-data-{}", session_id_clone),
                                    PtyPayload { data },
                                );
                            }
                        }
                    }
                    Ok(_) => break,
                    Err(_) => break,
                }
            }
            let _ = app_handle.emit(&format!("pty-exit-{}", session_id_clone), ());
        });

        let session = PtySession {
            master: pair.master,
            writer,
            current_process,
        };
        self.sessions
            .lock()
            .unwrap()
            .insert(session_id.clone(), session);

        Ok(session_id)
    }

    pub fn register_process(
        &self,
        app_handle: &AppHandle,
        session_id: &str,
        command: &str,
    ) -> Result<(), String> {
        let sessions = self.sessions.lock().unwrap();
        if let Some(session) = sessions.get(session_id) {
            let process = Process::new(command);
            let mode = format!("{:?}", process.mode).to_lowercase();

            // Emit process-started
            let _ = app_handle.emit(
                "process-started",
                ProcessPayload {
                    session_id: session_id.to_string(),
                    process: process.clone(),
                },
            );

            // Emit mode-detected
            let _ = app_handle.emit(
                "process-mode-detected",
                serde_json::json!({
                    "session_id": session_id,
                    "mode": mode,
                    "executable": process.executable
                }),
            );

            *session.current_process.lock().unwrap() = Some(process);
            Ok(())
        } else {
            Err("Session not found".to_string())
        }
    }

    pub fn mark_process_ended(
        &self,
        app_handle: &AppHandle,
        session_id: &str,
    ) -> Result<(), String> {
        let sessions = self.sessions.lock().unwrap();
        if let Some(session) = sessions.get(session_id) {
            let mut guard = session.current_process.lock().unwrap();
            if let Some(process) = guard.as_mut() {
                process.mark_closed();
                let _ = app_handle.emit(
                    "process-ended",
                    ProcessPayload {
                        session_id: session_id.to_string(),
                        process: process.clone(),
                    },
                );
            }
            *guard = None;
            Ok(())
        } else {
            Err("Session not found".to_string())
        }
    }

    pub fn write_to_session(&self, session_id: &str, data: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock().unwrap();
        if let Some(session) = sessions.get_mut(session_id) {
            session
                .writer
                .write_all(data.as_bytes())
                .map_err(|e| format!("Failed to write: {}", e))?;
            session.writer.flush().unwrap_or(());
            Ok(())
        } else {
            Err("Session not found".to_string())
        }
    }

    pub fn resize_session(&self, session_id: &str, rows: u16, cols: u16) -> Result<(), String> {
        let sessions = self.sessions.lock().unwrap();
        if let Some(session) = sessions.get(session_id) {
            session
                .master
                .resize(PtySize {
                    rows,
                    cols,
                    pixel_width: 0,
                    pixel_height: 0,
                })
                .map_err(|e| format!("Failed to resize: {}", e))
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
}
