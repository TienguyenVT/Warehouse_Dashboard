# Download Mosquitto
$url = "https://mosquitto.org/files/binary/win64/mosquitto-2.0.15-install-windows-x64.exe"
$output = "$env:TEMP\mosquitto-installer.exe"
Invoke-WebRequest -Uri $url -OutFile $output

# Install Mosquitto
Start-Process -FilePath $output -ArgumentList "/quiet" -Wait

# Add Mosquitto to Path
$mosquittoPath = "C:\Program Files\Mosquitto"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$mosquittoPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$mosquittoPath", "Machine")
}

# Create and configure mosquitto.conf
$configContent = @"
listener 1883
allow_anonymous true
listener 9001
protocol websockets
"@

Set-Content -Path "C:\Program Files\Mosquitto\mosquitto.conf" -Value $configContent
