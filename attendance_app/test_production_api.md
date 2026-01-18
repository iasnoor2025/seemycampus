# Production API Testing Guide

## Quick Test Methods

### Method 1: Test from Flutter App (Recommended)

1. **Run Flutter app with production URL:**
   ```bash
   cd attendance_app
   flutter run --dart-define=API_BASE_URL=https://seemycampus.com
   ```

2. **Check the console output** - You should see:
   ```
   === API Configuration ===
   Base URL: https://seemycampus.com
   Login Endpoint: /api/attendance/login
   Daily QR Endpoint: /api/attendance/daily-qr/public
   Record Endpoint: /api/attendance/record
   ========================
   ```

3. **Try logging in** with your test credentials

### Method 2: Test API Endpoints Directly

#### Test 1: Daily QR Code (Public Endpoint - No Auth Required)
```bash
curl https://seemycampus.com/api/attendance/daily-qr/public
```

**Expected Response:**
```json
{
  "qrCode": "...",
  "date": "2026-01-18",
  "expiresAt": "..."
}
```

#### Test 2: Login Endpoint
```bash
curl -X POST https://seemycampus.com/api/attendance/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://seemycampus.com" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "test@test.com",
    "name": "...",
    "role": "employee",
    "employeeId": "..."
  },
  "token": "..."
}
```

#### Test 3: CORS Preflight (OPTIONS)
```bash
curl -X OPTIONS https://seemycampus.com/api/attendance/login \
  -H "Origin: https://seemycampus.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

**Expected Response:** Status 200 with CORS headers

### Method 3: Browser Test

1. Open browser console (F12)
2. Navigate to: `https://seemycampus.com`
3. Run this JavaScript:

```javascript
// Test Daily QR Code
fetch('https://seemycampus.com/api/attendance/daily-qr/public')
  .then(r => r.json())
  .then(data => console.log('Daily QR:', data))
  .catch(e => console.error('Error:', e));

// Test Login
fetch('https://seemycampus.com/api/attendance/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'test123'
  })
})
  .then(r => r.json())
  .then(data => console.log('Login:', data))
  .catch(e => console.error('Error:', e));
```

### Method 4: Using Postman/Insomnia

1. **Daily QR Code (GET)**
   - URL: `https://seemycampus.com/api/attendance/daily-qr/public`
   - Method: GET
   - No headers needed

2. **Login (POST)**
   - URL: `https://seemycampus.com/api/attendance/login`
   - Method: POST
   - Headers:
     - `Content-Type: application/json`
     - `Origin: https://seemycampus.com`
   - Body (JSON):
     ```json
     {
       "email": "test@test.com",
       "password": "test123"
     }
     ```

## Common Issues & Solutions

### Issue 1: CORS Errors
**Symptom:** Browser shows CORS error
**Solution:** Check that CORS headers are set in the API route

### Issue 2: Connection Refused
**Symptom:** Cannot connect to server
**Solution:** 
- Verify API is deployed and running
- Check if HTTPS is properly configured
- Verify domain DNS is pointing correctly

### Issue 3: 404 Not Found
**Symptom:** Endpoint returns 404
**Solution:**
- Check API routes are deployed
- Verify the endpoint path is correct
- Check Next.js routing configuration

### Issue 4: 500 Internal Server Error
**Symptom:** Server error
**Solution:**
- Check server logs
- Verify database connection
- Check environment variables

## Verification Checklist

- [ ] Daily QR endpoint returns valid QR code data
- [ ] Login endpoint accepts credentials and returns token
- [ ] CORS headers are present in responses
- [ ] API responds within reasonable time (< 2 seconds)
- [ ] HTTPS is working (no mixed content warnings)
- [ ] Flutter app can connect in release mode
- [ ] Authentication token is returned correctly
- [ ] Error messages are clear and helpful

## Production Build Test

To test with production build:

```bash
# Build release APK
flutter build apk --release --dart-define=API_BASE_URL=https://seemycampus.com

# Install on device
adb install build/app/outputs/flutter-apk/app-release.apk

# Check logs
adb logcat | grep -i "api\|flutter"
```

## Monitoring Production API

1. **Check API logs** on your hosting platform (Vercel/Netlify/etc.)
2. **Monitor error rates** in your analytics
3. **Test regularly** with real credentials
4. **Set up alerts** for API failures
