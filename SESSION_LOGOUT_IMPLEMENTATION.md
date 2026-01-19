# Session Logout Implementation

## Overview
This implementation ensures that when an admin logs out an employee from the dashboard, the employee's device session is invalidated and they are forced to login again.

## How It Works

### 1. Database Schema
- Added `lastLogout` timestamp field to `employees` table
- Tracks when admin logs out an employee
- Used to invalidate sessions

### 2. Admin Logout Employee (`src/app/api/employees/[id]/logout/route.ts`)
- Sets `lastLogout` timestamp
- Clears `deviceInfo`
- Employee session becomes invalid

### 3. Session Validation (`src/lib/employees/session.ts`)
- `isEmployeeSessionValid()` checks if employee can use the app
- Compares `lastLogout` vs `lastLogin` timestamps
- Returns `false` if `lastLogout > lastLogin` or if `lastLogout` exists without `lastLogin`

### 4. API Endpoint Validation (`src/app/api/attendance/record/route.ts`)
- Validates session on every API call for Flutter app
- Returns `401` with `requiresReauth: true` if session invalid
- Employee must login again

### 5. Flutter App Handling
- `ApiException` now includes `requiresReauth` flag
- When `requiresReauth` is true:
  - App automatically logs out user
  - Clears local storage
  - Redirects to login screen
- Handled in:
  - `attendance_service.dart` - When recording attendance
  - `sync_service.dart` - When syncing records
  - `qr_scanner_screen.dart` - When scanning QR codes
  - `home_screen.dart` - When sync completes

## Flow Diagram

```
Admin clicks "Logout Employee"
    ↓
API sets lastLogout = now()
    ↓
Employee device makes API call (scan QR, sync, etc.)
    ↓
Server checks: lastLogout > lastLogin?
    ↓
YES → Return 401 with requiresReauth: true
    ↓
Flutter app catches 401
    ↓
Logout user + Clear storage + Redirect to login
```

## Testing

1. **Test Admin Logout:**
   - Login as admin
   - Go to `/dashboard/employees`
   - Click logout button for an employee
   - Verify success message

2. **Test Employee Session Invalidation:**
   - Employee logs in on device
   - Admin logs out employee from dashboard
   - Employee tries to scan QR code
   - Should be logged out and redirected to login screen

3. **Test Re-login:**
   - After logout, employee logs in again
   - `lastLogout` is cleared
   - `lastLogin` is updated
   - Session becomes valid again

## Important Notes

- **Employees cannot logout themselves** - Logout button only visible to admins
- **Session validation happens on API calls** - Not on app startup (to allow offline use)
- **Automatic logout** - App handles session expiration automatically
- **No manual intervention needed** - Employee just needs to login again

## API Endpoints with Session Validation

- ✅ `/api/attendance/record` - Recording attendance
- ✅ `/api/attendance/login` - Clears `lastLogout` on successful login

## Future Enhancements

- Add session validation to sync endpoint
- Add periodic session check on app startup
- Add push notification when admin logs out employee
- Add session timeout (auto-logout after inactivity)
