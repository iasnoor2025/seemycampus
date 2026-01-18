# Production API Test Script (PowerShell)
# Usage: .\test_api.ps1

$BASE_URL = "https://seemycampus.com"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing SeeMyCampus Production API" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Daily QR Code (Public)
Write-Host "Test 1: Daily QR Code (Public Endpoint)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/attendance/daily-qr/public" -Method Get -ErrorAction Stop
    Write-Host "✓ Success" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2 | Select-Object -First 200)"
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "HTTP Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: CORS Preflight
Write-Host "Test 2: CORS Preflight (OPTIONS)" -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = $BASE_URL
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/attendance/login" -Method Options -Headers $headers -ErrorAction Stop
    Write-Host "✓ CORS Preflight Success (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ CORS Preflight Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Login Endpoint
Write-Host "Test 3: Login Endpoint" -ForegroundColor Yellow
$email = Read-Host "Enter test email (or press Enter for test@test.com)"
if ([string]::IsNullOrWhiteSpace($email)) {
    $email = "test@test.com"
}

$password = Read-Host "Enter test password (or press Enter for test123)"
if ([string]::IsNullOrWhiteSpace($password)) {
    $password = "test123"
}

try {
    $body = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        "Origin" = $BASE_URL
    }

    $response = Invoke-RestMethod -Uri "$BASE_URL/api/attendance/login" -Method Post -Body $body -Headers $headers -ErrorAction Stop
    Write-Host "✓ Login Success" -ForegroundColor Green
    Write-Host "User: $($response.user.name) ($($response.user.email))" -ForegroundColor Green
    Write-Host "Role: $($response.user.role)" -ForegroundColor Green
    if ($response.token) {
        Write-Host "Token received: $($response.token.Substring(0, [Math]::Min(20, $response.token.Length)))..." -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
