# Create the directory for MongoDB
New-Item -ItemType Directory -Force -Path "C:\data\db"

# Download MongoDB
$url = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.8-signed.msi"
$output = "$env:TEMP\mongodb.msi"
Invoke-WebRequest -Uri $url -OutFile $output

# Install MongoDB
Start-Process msiexec.exe -Wait -ArgumentList "/i $output ADDLOCAL=ALL /qn"

# Add MongoDB to Path
$mongoPath = "C:\Program Files\MongoDB\Server\6.0\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$mongoPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$mongoPath", "Machine")
}
