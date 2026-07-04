# Run this script as Administrator to exclude the Cargo target directory from Windows Defender.
# This prevents Windows Defender from locking compiled binaries while rustc is linking them.

$TargetDir = "C:\Users\juanc\.cargo\target\antigravity"

Write-Host "Adding Windows Defender exclusion for: $TargetDir"
Add-MpPreference -ExclusionPath $TargetDir

Write-Host "Exclusion added successfully!"
