use std::process::Command;
use serde::Serialize;

#[derive(Serialize)]
pub struct CommandResult {
    pub stdout: String,
    pub stderr: String,
    pub success: bool,
    pub exit_code: i32,
}

#[tauri::command]
pub fn execute_shell_command(command: String) -> CommandResult {
    let mut cmd = if cfg!(target_os = "windows") {
        let mut c = Command::new("powershell");
        c.arg("-Command").arg(&command);
        c
    } else {
        let mut c = Command::new("bash");
        c.arg("-c").arg(&command);
        c
    };

    match cmd.output() {
        Ok(output) => {
            CommandResult {
                stdout: String::from_utf8_lossy(&output.stdout).to_string(),
                stderr: String::from_utf8_lossy(&output.stderr).to_string(),
                success: output.status.success(),
                exit_code: output.status.code().unwrap_or(-1),
            }
        }
        Err(e) => {
            CommandResult {
                stdout: String::new(),
                stderr: e.to_string(),
                success: false,
                exit_code: -1,
            }
        }
    }
}
