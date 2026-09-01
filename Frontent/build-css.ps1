$raw = Get-Content -Raw -LiteralPath "src\style-raw.css"
$raw = $raw -replace '(?m)^\s*@import url\([^\n]*\);\s*', ''
$raw = $raw.TrimStart()
$head = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`n@tailwind base;`n@tailwind components;`n@tailwind utilities;`n`n"
Set-Content -LiteralPath "src\index.css" -Value ($head + $raw) -Encoding UTF8
Write-Output ("OK " + (Get-Content -Raw "src\index.css").Length)