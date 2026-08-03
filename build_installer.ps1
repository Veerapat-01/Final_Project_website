param(
    [string]$SourceFolder = ".",
    [string]$ZipFile = "app_package.zip"
)

Write-Host "Cleaning up old files..."
if (Test-Path $ZipFile) { Remove-Item $ZipFile -Force }
if (Test-Path "AIT_ARC_Installer.exe") { Remove-Item "AIT_ARC_Installer.exe" -Force }

Write-Host "Loading Zip assembly..."
Add-Type -AssemblyName System.IO.Compression.FileSystem

Write-Host "Creating zip package..."
$tempDir = Join-Path $env:TEMP "ait_arc_temp_zip"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

Write-Host "Copying files (excluding node_modules, .next, .git)..."
$excludes = @('node_modules', '.next', '.git', 'app_package.zip', 'AIT_ARC_Installer.exe', 'build_installer.ps1', 'installer.cs', 'launcher.cs', 'veerapat.exe', 'AIT_ARC_Setup.bat')
Get-ChildItem -Path $SourceFolder | Where-Object { $excludes -notcontains $_.Name } | Copy-Item -Destination $tempDir -Recurse -Force

Write-Host "Compressing..."
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, (Join-Path (Get-Location) $ZipFile))

Write-Host "Cleaning up temp dir..."
Remove-Item $tempDir -Recurse -Force

Write-Host "Compiling installer.cs to AIT_ARC_Installer.exe..."
# Compile installer.cs and embed app_package.zip as a resource
& "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /out:AIT_ARC_Installer.exe /resource:$ZipFile /reference:System.IO.Compression.FileSystem.dll /reference:System.IO.Compression.dll installer.cs

Write-Host "Done! AIT_ARC_Installer.exe has been generated."
