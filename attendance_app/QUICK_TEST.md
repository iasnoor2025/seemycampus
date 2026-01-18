# Quick Production API Test

## Fastest Way to Test

### Option 1: Browser Test (Easiest)

1. Open your browser
2. Go to: `https://seemycampus.com/api/attendance/daily-qr/public`
3. You should see JSON response with QR code data

### Option 2: PowerShell Quick Test

Run these commands in PowerShell:

```powershell
# Test Daily QR Code
Invoke-RestMethod -Uri "https://seemycampus.com/api/attendance/daily-qr/public" -Method Get

# Test Login (replace with your credentials)
$body = @{ email = "test@test.com"; password = "test123" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://seemycampus.com/api/attendance/login" -Method Post -Body $body -ContentType "application/json"
```

### Option 3: Flutter App Test

```bash
cd attendance_app
flutter run --dart-define=API_BASE_URL=https://seemycampus.com
```

Then try logging in with your credentials.

### Option 4: Browser Console Test

1. Go to `https://seemycampus.com`
2. Open Developer Console (F12)
3. Paste and run:

```javascript
// Test Daily QR
fetch('https://seemycampus.com/api/attendance/daily-qr/public')
  .then(r => r.json())
  .then(d => console.log('✓ Daily QR:', d))
  .catch(e => console.error('✗ Error:', e));

// Test Login
fetch('https://seemycampus.com/api/attendance/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
})
  .then(r => r.json())
  .then(d => console.log('✓ Login:', d))
  .catch(e => console.error('✗ Error:', e));
```

## What to Look For

✅ **Success Indicators:**
- Daily QR endpoint returns JSON with `qrCode`, `date`, `expiresAt`
- Login endpoint returns JSON with `success: true`, `user` object, and `token`
- No CORS errors in browser console
- Response time < 2 seconds

❌ **Failure Indicators:**
- 404 Not Found → API route not deployed
- 500 Internal Server Error → Check server logs
- CORS errors → Check CORS headers in API
- Connection timeout → Check if API is running

## Next Steps After Testing

1. If all tests pass → Your API is working! 🎉
2. If tests fail → Check the error message and fix accordingly
3. Test with Flutter app → Build release APK and test on device
