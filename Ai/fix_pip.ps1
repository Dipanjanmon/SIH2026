$pipConfigDir = "$env:APPDATA\pip"
$pipConfigFile = "$pipConfigDir\pip.ini"
New-Item -ItemType Directory -Force -Path $pipConfigDir | Out-Null

$cert = python -c "import certifi; print(certifi.where())"

@"
[global]
cert = $cert
"@.Replace("`r`n","`n") | Out-File -FilePath $pipConfigFile -Encoding ascii -NoNewline

Write-Output "pip config set with cert: $cert"
Write-Output "Now installing..."
pip install --user -r requirements.txt
