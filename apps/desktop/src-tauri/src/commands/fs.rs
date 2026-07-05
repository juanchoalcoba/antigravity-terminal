use serde::Serialize;
use std::fs;
use std::os::windows::fs::MetadataExt;
use std::path::Path;

#[derive(Serialize)]
pub struct FileInfo {
    pub name: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: u64,
    pub extension: Option<String>,
}

#[tauri::command]
pub fn get_directory_contents(path: String) -> Result<Vec<FileInfo>, String> {
    let p = Path::new(&path);
    if !p.exists() || !p.is_dir() {
        return Err("Invalid path or not a directory".to_string());
    }

    let mut entries = Vec::new();

    let read_dir = fs::read_dir(p).map_err(|e| format!("Failed to read dir: {}", e))?;

    for entry in read_dir {
        if let Ok(entry) = entry {
            let meta = entry.metadata().map_err(|e| format!("Failed metadata: {}", e))?;
            let name = entry.file_name().to_string_lossy().to_string();
            let is_dir = meta.is_dir();
            let size = meta.len();
            
            // Cross-platform friendly modified time (Unix timestamp)
            let modified = meta.modified()
                .map(|t| t.duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs())
                .unwrap_or(0);
                
            let extension = Path::new(&name)
                .extension()
                .map(|ext| ext.to_string_lossy().to_string());

            entries.push(FileInfo {
                name,
                is_dir,
                size,
                modified,
                extension,
            });
        }
    }

    // Sort: directories first, then files alphabetically
    entries.sort_by(|a, b| {
        if a.is_dir && !b.is_dir {
            std::cmp::Ordering::Less
        } else if !a.is_dir && b.is_dir {
            std::cmp::Ordering::Greater
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });

    Ok(entries)
}
