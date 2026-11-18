$env:PULSEPASS_CORS_ORIGINS = "http://localhost:5173"
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes); $rng.Dispose()
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($bytes)
$env:SPRING_PROFILES_ACTIVE = "local"
$env:PULSEPASS_BOOTSTRAP_ADMIN_PASSWORD = "una-frase-larga-admin-2026"
$env:PULSEPASS_BOOTSTRAP_STAFF_PASSWORD = "una-frase-larga-staff-2026"
Write-Host "Variables de PulsePass cargadas."