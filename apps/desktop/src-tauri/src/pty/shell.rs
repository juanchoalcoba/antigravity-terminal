pub struct ShellDetector;

impl ShellDetector {
    /// Detects the default shell for the current operating system.
    pub fn detect_default_shell() -> String {
        if cfg!(windows) {
            "powershell.exe".to_string()
        } else {
            std::env::var("SHELL").unwrap_or_else(|_| "bash".to_string())
        }
    }
}
