Write-Host "Building plugin..." -ForegroundColor Green

# ===============================
# CUSTOMIZABLE OPTIONS
# ===============================
# Include:
#   "*" → include everything in the folder
#   @("main.js", "settings.js") → include only specific files
$include = "*"

# Exclude:
#   @("README.md", "notes.txt") → ignore these
#   You can also ignore whole patterns like "*.md"
$exclude = @("README.md", "*.md", "*.mnaddon", ".gitignore", ".vscode", ".github", ".git", "node_modules", "*.ps1", "*.txt", "jsconfig.json")

# Plugin must always contain these (mandatory for any add-on)
$requiredFiles = @(
    "main.js",
    "mnaddon.json"
)

# Output file name
$folderName = Split-Path -Leaf (Get-Location)
$outputName = "$folderName.mnaddon"

# ===============================
# Resolve Included Files
# ===============================

if ($include -eq "*") {
    # Include everything except folder junk
    $filesToInclude = Get-ChildItem -File | Select-Object -ExpandProperty Name
} else {
    $filesToInclude = $include
}

# Apply Exclude Rules
foreach ($pattern in $exclude) {
    $filesToInclude = $filesToInclude | Where-Object { $_ -notlike $pattern }
}

# Ensure required files always included
foreach ($req in $requiredFiles) {
    if ($filesToInclude -notcontains $req) {
        $filesToInclude += $req
    }
}

# Check for missing required files
$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "ERROR: Missing required files:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

# ===============================
# Load version
# ===============================
$config = Get-Content "mnaddon.json" | ConvertFrom-Json
$version = $config.version -replace '\.', '_'

# ===============================
# Build
# ===============================
Get-ChildItem *.mnaddon | Remove-Item -Force

Write-Host "Creating $outputName..." -ForegroundColor Yellow
Compress-Archive -Path $filesToInclude -DestinationPath $outputName -Force

if (Test-Path $outputName) {
    $fileInfo = Get-Item $outputName
    Write-Host "✓ Build successful!" -ForegroundColor Green
    Write-Host "  Output: $outputName" -ForegroundColor Cyan
    Write-Host "  Size: $($fileInfo.Length) bytes" -ForegroundColor Cyan

    # Auto-copy to Drive
    $destinationPath = "G:\My Drive\__"
    Copy-Item $outputName -Destination $destinationPath -Force
    Write-Host "Copied to $destinationPath" -ForegroundColor White
} else {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
