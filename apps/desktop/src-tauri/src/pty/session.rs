use crate::pty::event_bus::EventBus;
use crate::pty::pty_manager::PtyHandle;
use portable_pty::PtySize;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;

pub struct TerminalSession {
    pub id: String,
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    master: Box<dyn portable_pty::MasterPty + Send>,
}

impl TerminalSession {
    pub fn new(id: String, mut pty_handle: PtyHandle, event_bus: EventBus) -> Self {
        let session_id_clone = id.clone();
        
        let writer = Arc::new(Mutex::new(pty_handle.writer));

        // Spawn a background thread to continuously read from the PTY stdout
        thread::spawn(move || {
            let mut buf = [0u8; 1024];
            loop {
                match pty_handle.reader.read(&mut buf) {
                    Ok(n) if n > 0 => {
                        let data = String::from_utf8_lossy(&buf[..n]).to_string();
                        // Dispatch to the event bus
                        event_bus.emit_pty_data(&session_id_clone, data);
                    }
                    Ok(_) => break,
                    Err(_) => break,
                }
            }
            // PTY exited
            event_bus.emit_pty_exit(&session_id_clone);
        });

        Self {
            id,
            writer,
            master: pty_handle.master,
        }
    }

    pub fn write(&self, data: &str) -> Result<(), String> {
        let mut writer = self.writer.lock().unwrap();
        writer
            .write_all(data.as_bytes())
            .map_err(|e| format!("Failed to write to session {}: {}", self.id, e))?;
        writer.flush().unwrap_or(());
        Ok(())
    }

    pub fn resize(&self, rows: u16, cols: u16) -> Result<(), String> {
        self.master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to resize session {}: {}", self.id, e))
    }
}
