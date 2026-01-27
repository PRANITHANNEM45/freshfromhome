# Authentication Test Script for FreshFromFarm
# This script tests signup and login for both customer and admin users

Write-Host "`n=== FreshFromFarm Authentication Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Frontend Accessibility
Write-Host "[Test 1] Checking Frontend (http://localhost:3000)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "[OK] Frontend is running successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "[FAIL] Frontend is not accessible!" -ForegroundColor Red
    exit 1
}

# Test 2: Backend Accessibility
Write-Host "`n[Test 2] Checking Backend (http://localhost:5000)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/products"
    $productCount = $backendResponse.Count
    Write-Host "[OK] Backend is running! Found $productCount products." -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Backend is not accessible!" -ForegroundColor Red
    exit 1
}

# Test 3: Customer Registration
Write-Host "`n[Test 3] Testing Customer Registration..." -ForegroundColor Yellow
$randomUsername = "customer_$(Get-Random -Maximum 10000)"
$registerBody = @{
    username = $randomUsername
    password = "test123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "[OK] Customer registration successful! UserId: $($registerResponse.userId)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Customer registration failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 4: Customer Login
Write-Host "`n[Test 4] Testing Customer Login..." -ForegroundColor Yellow
$loginBody = @{
    username = $randomUsername
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "[OK] Customer login successful!" -ForegroundColor Green
    Write-Host "   Username: $($loginResponse.user.username)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
    Write-Host "   Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] Customer login failed!" -ForegroundColor Red
}

# Test 5: Admin Login
Write-Host "`n[Test 5] Testing Admin Login..." -ForegroundColor Yellow
$adminLoginBody = @{
    username = "pranith"
    password = "pranith123"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLoginBody -ContentType "application/json"
    Write-Host "[OK] Admin login successful!" -ForegroundColor Green
    Write-Host "   Username: $($adminLoginResponse.user.username)" -ForegroundColor Gray
    Write-Host "   Role: $($adminLoginResponse.user.role)" -ForegroundColor Gray
    Write-Host "   Token: $($adminLoginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] Admin login failed!" -ForegroundColor Red
}

# Test 6: Login Page Accessibility
Write-Host "`n[Test 6] Checking Login Page..." -ForegroundColor Yellow
try {
    $loginPageResponse = Invoke-WebRequest -Uri "http://localhost:3000/login" -Method GET -UseBasicParsing
    if ($loginPageResponse.StatusCode -eq 200) {
        Write-Host "[OK] Login page is accessible!" -ForegroundColor Green
    }
} catch {
    Write-Host "[FAIL] Login page is not accessible!" -ForegroundColor Red
}

Write-Host "`n=== All Tests Completed ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now access the application:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Customer Login: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "  Admin Credentials:" -ForegroundColor Cyan
Write-Host "     Username: pranith" -ForegroundColor Gray
Write-Host "     Password: pranith123" -ForegroundColor Gray
Write-Host ""

