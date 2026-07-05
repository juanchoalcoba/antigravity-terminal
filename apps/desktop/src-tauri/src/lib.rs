mod commands;
mod pty;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(pty::manager::SessionManager::new())
    .invoke_handler(tauri::generate_handler![
      commands::shell::execute_shell_command,
      commands::pty::create_pty_session,
      commands::pty::write_to_pty,
      commands::pty::resize_pty,
      commands::pty::destroy_pty_session,
      commands::process::register_process,
      commands::process::mark_process_ended,
      commands::fs::get_directory_contents
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
