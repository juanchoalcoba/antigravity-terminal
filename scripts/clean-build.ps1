Write-Host "Killing zombie Rust/Node processes..."
Stop-Process -Name "rustc", "cargo", "rust-analyzer", "node" -Force -ErrorAction SilentlyContinue

Write-Host "Cleaning local target folders (if any)..."
if (Test-Path "target") { Remove-Item -Recurse -Force "target" }
if (Test-Path "apps/desktop/src-tauri/target") { Remove-Item -Recurse -Force "apps/desktop/src-tauri/target" }

Write-Host "Cleaning redirected target folder (C:\Users\juanc\.cargo\target\antigravity)..."
if (Test-Path "C:\Users\juanc\.cargo\target\antigravity") {
    Remove-Item -Recurse -Force "C:\Users\juanc\.cargo\target\antigravity"
}

Write-Host "Cleaning Vite caches..."
if (Test-Path "node_modules\.vite") { Remove-Item -Recurse -Force "node_modules\.vite" }
if (Test-Path "apps\desktop\node_modules\.vite") { Remove-Item -Recurse -Force "apps\desktop\node_modules\.vite" }

Write-Host "Build environment cleaned!"
