# Attendance App - Flutter

A Flutter mobile application for employee attendance tracking using QR codes.

## Features

- Employee authentication
- QR code scanning for check-in/check-out
- Offline support with automatic sync
- Attendance history viewing
- Daily QR code validation

## Setup

### Prerequisites

- Flutter SDK (3.10.7 or higher)
- Android Studio / Xcode for mobile development
- Next.js backend running (SeeMyCampus)

### Installation

1. Install dependencies:
```bash
flutter pub get
```

2. Configure API endpoint:
   - For **development**: Uses `http://localhost:3000` by default
   - For **production**: Automatically uses `https://seemycampus.com` in release builds
   - To override: Use `--dart-define=API_BASE_URL=<your-url>`

### Running the App

#### Development (localhost)
```bash
flutter run
```

#### Production (seemycampus.com)
```bash
flutter run --dart-define=API_BASE_URL=https://seemycampus.com
```

#### Build for Production

**Android APK:**
```bash
flutter build apk --release
# Or with explicit URL:
flutter build apk --release --dart-define=API_BASE_URL=https://seemycampus.com
```

**Android App Bundle:**
```bash
flutter build appbundle --release
```

**iOS:**
```bash
flutter build ios --release
```

### Environment Configuration

The app automatically detects the build mode:
- **Debug mode**: Uses `http://localhost:3000`
- **Release mode**: Uses `https://seemycampus.com`

You can override this by setting `API_BASE_URL`:
```bash
flutter run --dart-define=API_BASE_URL=https://seemycampus.com
```

### API Endpoints

The app connects to the following endpoints:
- `/api/attendance/login` - Employee login
- `/api/attendance/daily-qr/public` - Get daily QR code
- `/api/attendance/record` - Record attendance
- `/api/attendance/employees` - Get employee info
- `/api/attendance/sync` - Sync offline records

### Testing

1. Make sure the Next.js backend is running
2. Create an employee account in the admin dashboard
3. Run the Flutter app
4. Login with employee credentials
5. Scan QR codes for attendance

### Troubleshooting

**Connection Issues:**
- Check that the backend server is running
- Verify the API_BASE_URL is correct
- Check network connectivity

**Build Issues:**
- Run `flutter clean` and `flutter pub get`
- Ensure all dependencies are installed
- Check Flutter SDK version compatibility

## Project Structure

```
lib/
├── config/
│   └── api_config.dart      # API configuration
├── models/
│   ├── user.dart            # User model
│   ├── employee.dart        # Employee model
│   └── attendance_record.dart
├── services/
│   ├── api_service.dart     # HTTP client
│   ├── auth_service.dart    # Authentication
│   ├── qr_service.dart      # QR code handling
│   ├── attendance_service.dart
│   ├── storage_service.dart # Local database
│   └── sync_service.dart    # Offline sync
├── providers/
│   └── auth_provider.dart   # Auth state management
└── screens/
    ├── login_screen.dart
    ├── home_screen.dart
    ├── qr_scanner_screen.dart
    └── attendance_history_screen.dart
```

## License

See LICENSE file for details.
