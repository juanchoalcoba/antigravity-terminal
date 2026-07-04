use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ProcessMode {
    Stream,
    Interactive,
    Pager,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ProcessState {
    Running,
    Waiting,
    Closed,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Process {
    pub id: String,
    pub command: String,
    pub executable: String,
    pub mode: ProcessMode,
    pub state: ProcessState,
    pub is_tty: bool,
}

impl Process {
    pub fn new(command_line: &str) -> Self {
        let trimmed = command_line.trim();
        let executable = trimmed
            .split_whitespace()
            .next()
            .unwrap_or("")
            .to_lowercase();

        let mode = match executable.as_str() {
            "less" | "more" | "man" | "bat" => ProcessMode::Pager,
            "node" | "python" | "python3" | "bash" | "zsh" | "fish"
            | "powershell" | "powershell.exe" | "cmd" | "cmd.exe"
            | "irb" | "iex" | "ghci" | "lua" | "perl" => ProcessMode::Interactive,
            _ => ProcessMode::Stream,
        };

        Self {
            id: Uuid::new_v4().to_string(),
            command: trimmed.to_string(),
            executable,
            mode,
            state: ProcessState::Running,
            is_tty: true,
        }
    }

    pub fn mark_closed(&mut self) {
        self.state = ProcessState::Closed;
    }
}
