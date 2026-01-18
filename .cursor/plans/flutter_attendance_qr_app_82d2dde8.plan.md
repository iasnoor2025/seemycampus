---
name: ""
overview: ""
todos: []
---

---

name: Flutter Attendance QR App

overview: A professional Flutter mobile app for SeeMyCampus employee attendance tracking with QR code scanning, offline support, and Google Sheets integration via Next.js API. The app features a modern Material Design 3 UI with SeeMyCampus branding, supports both employee and admin users, and includes comprehensive offline sync capabilities. Employees can self-check-in/out using daily QR codes that change automatically each day.

todos:

  - id: create_employee_database_schema

content: "Add employees, daily_qr_codes, and attendanceRecords tables to database schema"

status: completed

  - id: create_employee_api_endpoints

content: Create Next.js API routes for employee CRUD operations (create, read, update, delete, list)

status: completed

  - id: create_employee_dashboard_page

content: Create admin dashboard page for managing employees with list, create, edit, delete functionality

status: completed

  - id: create_daily_qr_system

content: Create daily QR code system - single QR code per day for all employees

status: completed

  - id: create_daily_qr_dashboard

content: Create dashboard page to display daily QR code for printing/display

status: completed

  - id: create_attendance_api

content: Create API endpoints for attendance recording (daily QR, record attendance)

status: completed

  - id: implement_attendance_logic

content: Implement attendance logic: first scan = check-in, subsequent = check-out

status: completed

  - id: create_google_apps_script

content: Create Google Apps Script web app to handle Google Sheets read/write operations for attendance only

status: pending

  - id: setup_flutter_project

content: Initialize Flutter project in attendance_app/ directory with proper structure

status: completed

  - id: setup_dependencies

content: Configure pubspec.yaml with required packages (mobile_scanner, sqflite, http, etc.)

status: completed

  - id: create_models

content: Create data models: AttendanceRecord, Employee, User

status: completed

  - id: implement_auth

content: Build authentication system with login screen calling Next.js API

status: completed

  - id: setup_local_db

content: Set up SQLite database with StorageService for offline storage

status: completed

  - id: implement_qr_scanner

content: Create QR scanner widget and screen with camera integration using mobile_scanner

status: completed

  - id: implement_qr_fetch

content: Fetch daily QR code from API and validate scans

status: completed

  - id: implement_attendance_recording

content: Create attendance recording logic with automatic check-in/out detection

status: completed

  - id: build_api_service

content: Create API service in Flutter to communicate with Next.js endpoints

status: completed

  - id: create_sync_service

content: Build sync service with queue management and retry logic

status: completed

  - id: build_ui_screens

content: Create all UI screens: Home, QR Scanner, History with professional design

status: completed

  - id: add_offline_support

content: Implement offline queue and background sync functionality

status: completed

  - id: implement_branding

content: Add SeeMyCampus logo and branding throughout the app

status: completed

  - id: implement_admin_features

content: Add admin login support and admin-only features (View History)

status: completed

  - id: ui_redesign

content: Professional UI redesign with gradients, shadows, and modern Material Design 3

status: completed

  - id: test_and_polish

content: Add error handling, loading states, and user feedback

status: pending

---

# Flutter Attendance QR Code App - Implementation Plan

## Project Structure

The Flutter app will be created in `f:\seemycampus\attendance_app\` as a separate Flutter project within the workspace.

```
attendance_app/
├── lib/
│   ├── main.dart
│   ├── models/
│   │   ├── attendance_record.dart
│   │   ├── employee.dart
│   │   └── user.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── qr_service.dart
│   │   ├── storage_service.dart
│   │   ├── google_sheets_service.dart
│   │   └── sync_service.dart
│   ├── screens/
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── qr_scanner_screen.dart
│   │   ├── attendance_history_screen.dart
│   │   └── settings_screen.dart
│   ├── widgets/
│   │   ├── qr_scanner_widget.dart
│   │   ├── attendance_card.dart
│   │   └── sync_indicator.dart
│   └── utils/
│       ├── constants.dart
│       └── helpers.dart
├── pubspec.yaml
└── README.md
```

## Architecture Overview

The system uses a three-tier architecture:

1. **Flutter Mobile App**: Frontend for employees to scan QR codes and view attendance
2. **Next.js API**: Backend API endpoints that handle business logic and authentication
3. **Google Apps Script**: Web app that manages Google Sheets read/write operations

### QR Code System

**Single Daily QR Code**: Instead of individual QR codes per employee, the system uses ONE QR code per day that all employees scan:

- QR code changes automatically every day at midnight
- All employees use the same QR code for the day
- First scan of the day = Check-In
- Subsequent scans on the same day = Check-Out
- QR code is displayed in admin dashboard and can be printed/displayed at office entrance
```mermaid
flowchart TD
    A[Flutter App] -->|HTTP Requests| B[Next.js API]
    B -->|HTTP POST| C[Google Apps Script]
    C -->|Read/Write| D[Google Sheets]
    B -->|Validate & Process| E[Database/Storage]
    
    A -->|Offline| F[Local SQLite DB]
    F -->|Sync Queue| B
    
    subgraph FlutterApp["Flutter App"]
        G[Login Screen]
        H[QR Scanner]
        I[Attendance History]
        J[Sync Service]
    end
    
    subgraph NextJSAPI["Next.js API"]
        K[/api/attendance/login]
        L[/api/attendance/record]
        M[/api/attendance/employees]
        N[/api/attendance/sync]
    end
    
    subgraph AppsScript["Google Apps Script"]
        O[doPost Handler]
        P[Read Employees]
        Q[Write Attendance]
    end
```


## Core Dependencies

### Flutter App

- `flutter`: Core framework
- `qr_code_scanner`: QR code scanning functionality
- `sqflite`: Local SQLite database for offline storage
- `http`: HTTP requests to Next.js API
- `shared_preferences`: User preferences and auth tokens
- `path_provider`: File system paths
- `intl`: Date/time formatting
- `crypto`: QR code generation

### Next.js API

- Existing Next.js setup
- `http` or `fetch` for calling Google Apps Script
- Authentication middleware (using existing auth system)

## Next.js API Endpoints

### Attendance API Routes (`src/app/api/attendance/`)

1. **POST `/api/attendance/login`**

   - Authenticate employee using email/password or employeeId
   - Return JWT token or session
   - Validate credentials against database

2. **GET `/api/attendance/employees`**

   - Fetch employee list from database
   - Return employee data (id, name, employeeId, email)
   - Filter active employees only

3. **GET `/api/attendance/daily-qr`**

   - Get current day's QR code
   - Auto-generates if not exists for today
   - Returns QR code data and expiration time
   - Accessible by authenticated employees

4. **POST `/api/attendance/record`**

   - Receive attendance record from Flutter app (employeeId, scanTime, qrCodeData)
   - Validate QR code is valid for today
   - Determine if first scan (check-in) or subsequent scan (check-out)
   - Store attendance record in database
   - Forward to Google Apps Script for Google Sheets sync
   - Return success/error response with check-in/out status

4. **POST `/api/attendance/sync`**

   - Batch sync multiple attendance records
   - Handle sync queue from Flutter app
   - Return sync status

### Employee Management API Routes (`src/app/api/employees/`)

1. **GET `/api/employees`**

   - List all employees (admin only)
   - Support pagination and filtering
   - Return employee list with metadata

2. **POST `/api/employees`**

   - Create new employee (admin only)
   - Validate unique employeeId and email
   - Create linked user account with "employee" role
   - Return created employee data

3. **GET `/api/employees/[id]`**

   - Get single employee by ID
   - Return employee details

4. **PUT `/api/employees/[id]`**

   - Update employee (admin only)
   - Validate data
   - Update linked user account
   - Return updated employee

5. **DELETE `/api/employees/[id]`**

   - Soft delete employee (set isActive = false)
   - Delete linked user account if no attendance records
   - Return success status

## Google Apps Script Web App

A Google Apps Script will be deployed as a web app with the following functions:

**Note**: Google Apps Script now only handles attendance records, not employee management. Employees are managed in the database through the admin dashboard.

1. **`doPost(e)`** - Handle POST requests from Next.js API

   - Parse attendance data
   - Write to Google Sheets Attendance sheet
   - Return success/error response

2. **Helper Functions**

   - `writeAttendanceRecord(data)` - Write attendance to sheet
   - `validateData(data)` - Validate incoming data
   - `formatAttendanceRow(data)` - Format data for sheet row

## Database Schema

### Employees Table

```typescript
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  employeeId: varchar("employee_id", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // Hashed password for login
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
```

**Note**: No individual QR codes - all employees use the daily QR code.

### Daily QR Codes Table

```typescript
export const dailyQRCodes = pgTable("daily_qr_codes", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(), // Date in YYYY-MM-DD format
  qrCode: text("qr_code").notNull(), // QR code data (JSON string)
  token: varchar("token", { length: 64 }).notNull(), // Validation token
  expiresAt: timestamp("expires_at").notNull(), // Expires at end of day
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

### Attendance Records Table

```typescript
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  date: date("date").notNull(),
  checkInTime: time("check_in_time"), // First scan of the day
  checkOutTime: time("check_out_time"), // Last scan of the day
  status: varchar("status", { length: 50 }).notNull(), // "present", "absent", "late"
  syncedToSheets: boolean("synced_to_sheets").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
```

<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>

run_terminal_cmd

## Implementation Phases

### Phase 1: Database & Employee Management (Backend)

1. Add employees and attendanceRecords tables to database schema
2. Create database migration
3. Create employee API endpoints (CRUD operations)
4. Add employee service functions in `src/lib/employees/`
5. Implement employee authentication logic
6. Create admin dashboard page at `/dashboard/employees`

   - Employee list view with search/filter
   - Create employee form
   - Edit employee form
   - Delete/Deactivate employee

7. Add "Employees" and "Attendance QR Code" menu items to dashboard sidebar
8. Create daily QR code dashboard page (`/dashboard/attendance-qr`)

   - Display current day's QR code
   - Show expiration time
   - Download and copy functionality

### Phase 2: Backend API Setup (Next.js) - COMPLETED ✅

1. ✅ Create API route structure in `src/app/api/attendance/`
2. ✅ Implement `/api/attendance/login` endpoint (supports both employees and admins)
3. ✅ Implement `/api/attendance/employees` endpoint
4. ✅ Implement `/api/attendance/daily-qr` endpoint (public and authenticated versions)
5. ✅ Implement `/api/attendance/record` endpoint with automatic check-in/out logic
6. ✅ Create daily QR code service (`src/lib/employees/dailyQR.ts`)
7. ✅ Create attendance recording service (`src/lib/employees/attendance.ts`)
8. ✅ Create daily QR code dashboard page (`/dashboard/attendance-qr`)

### Phase 2: Flutter Authentication System - COMPLETED ✅

1. ✅ Create `User` model and `AuthService`
2. ✅ Implement login screen with credentials validation
3. ✅ Store auth tokens using `shared_preferences`
4. ✅ Create auth state management with `AuthProvider` (logged in/out)
5. ✅ Add logout functionality
6. ✅ Support admin login in addition to employee login

### Phase 3: Local Storage & Models - COMPLETED ✅

1. ✅ Create `AttendanceRecord` model (name, date, time, in/out status, qrCodeData)
2. ✅ Create `Employee` model
3. ✅ Set up SQLite database using `sqflite`
4. ✅ Implement `StorageService` for CRUD operations
5. ✅ Create `DatabaseService` for schema management
6. ✅ Add `qr_code_data` field to attendance records for offline sync

### Phase 4: QR Code Functionality - COMPLETED ✅

1. ✅ Implement `QRService` for fetching and validating daily QR codes
2. ✅ Create QR scanner screen using `mobile_scanner` package
3. ✅ Build QR scanner screen with camera preview and overlay
4. ✅ Implement QR validation logic against daily QR code from API
5. ✅ Handle QR code scanning with proper error handling

### Phase 5: Attendance Recording - COMPLETED ✅

1. ✅ Create `AttendanceService` for attendance recording logic
2. ✅ Implement check-in/check-out detection (first scan = check-in, subsequent = check-out)
3. ✅ Store attendance records locally for offline support
4. ✅ Add validation and error handling
5. ✅ Create attendance history screen with list view

### Phase 6: API Integration - COMPLETED ✅

1. ✅ Create `ApiService` for HTTP communication with Next.js API
2. ✅ Implement API configuration with production/debug URL switching
3. ✅ Add Android emulator support (10.0.2.2:3000 for localhost)
4. ✅ Handle CORS and authentication headers
5. ✅ Add comprehensive error handling and debug logging

### Phase 7: Sync Service & Offline Support - COMPLETED ✅

1. ✅ Create `SyncService` to manage sync queue
2. ✅ Implement background sync when online
3. ✅ Add sync status indicator widget on home screen
4. ✅ Handle sync conflicts and errors
5. ✅ Implement retry logic for failed syncs
6. ✅ Add manual sync trigger button
7. ✅ Store QR code data with records for proper sync

### Phase 8: UI/UX Polish & Branding - COMPLETED ✅

1. ✅ Professional UI redesign with Material Design 3
2. ✅ Implement gradient backgrounds and modern card designs
3. ✅ Add SeeMyCampus logo and branding throughout app
4. ✅ Update app name to "SeeMyCampus Attendance"
5. ✅ Redesign login screen with logo and professional styling
6. ✅ Redesign home screen with gradient app bar and modern cards
7. ✅ Add animations and smooth transitions
8. ✅ Implement admin-only features (View History button)
9. ✅ Fix alignment issues in header and spacing

### Phase 9: Testing & Configuration - IN PROGRESS

1. ✅ Add environment configuration for API base URL (production/debug)
2. ✅ Create configuration file for API endpoints
3. ✅ Test offline functionality
4. ✅ Test sync functionality
5. ✅ Add error handling and user feedback
6. ⏳ Test on physical devices
7. ⏳ Performance optimization
8. ⏳ Final UI polish and edge case handling

## Google Sheets Structure

The Google Sheet now only contains attendance records (employees are managed in the database):

**Attendance Sheet**

- Column A: Employee Name
- Column B: Employee ID
- Column C: Date (YYYY-MM-DD)
- Column D: Check-In Time (HH:MM:SS)
- Column E: Check-Out Time (HH:MM:SS)
- Column F: Status (Present/Absent/Late)

## File Structure

### Next.js API Routes

```
src/app/api/
├── attendance/
│   ├── login/
│   │   └── route.ts          # POST /api/attendance/login
│   ├── employees/
│   │   └── route.ts          # GET /api/attendance/employees
│   ├── record/
│   │   └── route.ts          # POST /api/attendance/record
│   └── sync/
│       └── route.ts          # POST /api/attendance/sync
└── employees/
    ├── route.ts              # GET, POST /api/employees
    └── [id]/
        └── route.ts          # GET, PUT, DELETE /api/employees/[id]
```

### Admin Dashboard Pages

```
src/app/dashboard/
└── employees/
    ├── page.tsx              # Employee list page
    ├── new/
    │   └── page.tsx          # Create employee page
    └── [id]/
        └── page.tsx          # Edit employee page
```

### Google Apps Script

```
Code.gs                    # Main Apps Script file with doPost/doGet
```

### Flutter App

```
attendance_app/
├── lib/
│   ├── services/
│   │   ├── api_service.dart      # HTTP client for Next.js API
│   │   ├── auth_service.dart     # Authentication handling
│   │   ├── storage_service.dart  # Local SQLite operations
│   │   └── sync_service.dart     # Sync queue management
│   └── ...
```

### Employee Management Library

```
src/lib/employees/
├── index.ts                 # Export employee functions
├── service.ts               # Employee CRUD operations
└── utils.ts                 # QR code generation, validation
```

## Recent Updates & Improvements

### UI/UX Enhancements (Latest)

- ✅ Professional redesign with Material Design 3
- ✅ SeeMyCampus branding and logo integration
- ✅ Gradient backgrounds and modern card designs
- ✅ Smooth animations and transitions
- ✅ Improved spacing and alignment
- ✅ Admin-only feature visibility (View History)

### Authentication Updates

- ✅ Admin users can now login to Flutter app
- ✅ Role-based access control implemented
- ✅ Token-based authentication for Flutter app
- ✅ CORS headers properly configured

### Technical Improvements

- ✅ Migrated from `qr_code_scanner` to `mobile_scanner` for better compatibility
- ✅ Android emulator network fix (10.0.2.2:3000)
- ✅ Enhanced error handling and debug logging
- ✅ Offline sync with QR code data preservation
- ✅ Production-ready API configuration

### File Structure Updates

```
attendance_app/
├── assets/
│   └── images/
│       └── logo.png              # SeeMyCampus logo
├── lib/
│   ├── config/
│   │   └── api_config.dart      # API configuration with production/debug switching
│   ├── models/
│   │   ├── attendance_record.dart # Includes qrCodeData field
│   │   ├── employee.dart
│   │   └── user.dart
│   ├── providers/
│   │   └── auth_provider.dart
│   ├── screens/
│   │   ├── login_screen.dart     # Redesigned with logo
│   │   ├── home_screen.dart      # Professional redesign
│   │   ├── qr_scanner_screen.dart # Using mobile_scanner
│   │   └── attendance_history_screen.dart
│   └── services/
│       ├── api_service.dart      # Enhanced error handling
│       ├── auth_service.dart
│       ├── attendance_service.dart
│       ├── database_service.dart
│       ├── qr_service.dart
│       ├── storage_service.dart
│       └── sync_service.dart     # Complete sync implementation
└── pubspec.yaml                  # Updated with assets and mobile_scanner
```

## Important Notes

1. **Google Apps Script Security**: 

   - Deploy as web app with "Execute as: Me"
   - Set "Who has access: Anyone" or restrict to specific users
   - Use URL parameters or headers for basic authentication if needed
   - Store Apps Script URL in Next.js environment variables

2. **API Authentication**:

   - Use JWT tokens or Next.js session for Flutter app authentication
   - Store Apps Script web app URL securely in Next.js backend
   - Consider adding API key validation between Next.js and Apps Script

3. **QR Code Generation**: Dynamic QR codes will be generated per session and include:

   - Session ID
   - Timestamp
   - Validation token
   - Employee ID (optional, for validation)

4. **Offline Queue**: Failed syncs will be queued locally in Flutter app and retried when connection is restored.

5. **Permissions**: 

   - Flutter app: Camera permission for QR scanning, Internet permission
   - Google Apps Script: Read/Write access to Google Sheets

## Configuration Required

### Environment Variables (Next.js)

- `GOOGLE_APPS_SCRIPT_URL`: Web app URL from deployed Apps Script
- `ATTENDANCE_API_SECRET`: Secret key for API authentication (optional)
- `JWT_SECRET`: Secret for JWT token generation

### Google Apps Script Configuration

- Google Sheet ID
- Sheet names: "Employees", "Attendance"
- Web app deployment URL

### Flutter App Configuration

- `API_BASE_URL`: Base URL of Next.js API (e.g., `https://yourdomain.com/api/attendance`)
- API endpoint paths