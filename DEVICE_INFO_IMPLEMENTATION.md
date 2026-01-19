# Device Info & Last Login Implementation

## Overview
This implementation adds device information tracking and last login timestamp to the employee management system. Admins can now see which device each employee is using and when they last logged in.

## Changes Made

### 1. Database Schema (`src/db/schema.ts`)
- Added `deviceInfo` field (JSONB) to store device information
- Added `lastLogin` field (TIMESTAMP) to track last login time
- Fields are optional (nullable) to support existing employees

### 2. Login API (`src/app/api/attendance/login/route.ts`)
- Updated to accept `deviceInfo` in request body
- Updates `lastLogin` timestamp on successful login
- Updates `deviceInfo` with current device information
- Works for both employee-only logins and user table logins

### 3. Flutter App Changes

#### New Dependencies (`attendance_app/pubspec.yaml`)
- Added `device_info_plus: ^10.1.0` - Get device information
- Added `package_info_plus: ^8.0.0` - Get app version

#### New Service (`attendance_app/lib/services/device_info_service.dart`)
- `DeviceInfoService` singleton to collect device information
- Collects:
  - Platform (Android/iOS)
  - Device model
  - Device ID
  - OS version
  - App version
  - Manufacturer (for Android)

#### Updated Auth Service (`attendance_app/lib/services/auth_service.dart`)
- Collects device info before login
- Sends device info with login request
- Initializes device info service on login

### 4. Admin Dashboard (`src/components/dashboard/EmployeesList.tsx`)
- Added "Device Info" column showing:
  - Device model
  - Platform and OS version
  - App version
- Added "Last Login" column showing:
  - Formatted date
  - Relative time (e.g., "2 hours ago")
- Shows "Never logged in" for employees without login history
- Shows "Never" for last login if null

### 5. API Updates (`src/app/api/employees/route.ts`)
- Updated GET endpoint to include `deviceInfo` and `lastLogin` in response
- Fields are automatically included from database query

## Database Migration

Run the migration script to add the new columns:

```sql
-- See src/db/migrations/add-device-info-to-employees.sql
```

Or manually run:
```sql
ALTER TABLE employees ADD COLUMN IF NOT EXISTS device_info JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_employees_last_login ON employees(last_login);
```

## Usage

### For Employees
- No action needed - device info is automatically collected on login
- Information is sent securely with login credentials

### For Admins
- View device info and last login in the Employees dashboard
- See which devices employees are using
- Track employee activity through last login timestamps
- Filter and search employees as before

## Device Info Structure

```json
{
  "platform": "android",
  "deviceModel": "SM-G973F",
  "deviceId": "abc123...",
  "osVersion": "Android 12",
  "appVersion": "1.0.0",
  "manufacturer": "Samsung"
}
```

## Privacy & Security

- Device ID is hashed/unique identifier (not personally identifiable)
- Device info is only stored on successful login
- Only admins can view device information
- Last login is updated automatically - cannot be manually set

## Future Enhancements

- Device history (track multiple devices per employee)
- Login location tracking (if needed)
- Device management (revoke access from specific devices)
- Push notification device tokens
