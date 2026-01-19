import 'dart:io';

class ApiConfig {
  // Environment detection
  // Set API_BASE_URL when building:
  // flutter build apk --dart-define=API_BASE_URL=https://seemycampus.com
  // Or for development: flutter run --dart-define=API_BASE_URL=http://localhost:3000
  
  // Check if API_BASE_URL is explicitly set via --dart-define
  static const String _explicitBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  // Auto-detect environment if not explicitly set
  // In release builds, defaults to production
  // In debug builds, defaults to localhost (with Android emulator fix)
  static String get baseUrl {
    if (_explicitBaseUrl.isNotEmpty) {
      return _explicitBaseUrl;
    }
    
    // Check build mode
    const isRelease = bool.fromEnvironment('dart.vm.product');
    if (isRelease) {
      // Release mode - use production
      return 'https://seemycampus.com';
    } else {
      // Debug mode - use localhost
      // For Android emulator, use 10.0.2.2 instead of localhost
      // For iOS simulator, use localhost
      // For web/desktop, use localhost
      try {
        if (Platform.isAndroid) {
          return 'http://10.0.2.2:3000'; // Android emulator special IP
        } else {
          return 'http://localhost:3000';
        }
      } catch (e) {
        // If Platform is not available (e.g., in web), use localhost
        return 'http://localhost:3000';
      }
    }
  }

  // API Endpoints
  static const String loginEndpoint = '/api/attendance/login';
  static const String dailyQREndpoint = '/api/attendance/daily-qr/public';
  static const String recordEndpoint = '/api/attendance/record';
  static const String syncEndpoint = '/api/attendance/sync';
  static const String checkSessionEndpoint = '/api/attendance/check-session';
  static const String allRecordsEndpoint = '/api/attendance/records'; // Admin only
  static const String todayAttendanceEndpoint = '/api/attendance/today'; // Admin only - today's attendance
  static const String myStatusEndpoint = '/api/attendance/my-status'; // Employee - get own today's status
  static const String employeesEndpoint = '/api/employees'; // Admin only - get all employees

  // Helper method to build full URL
  static String getUrl(String endpoint) {
    return '$baseUrl$endpoint';
  }

  // Get current environment info (for debugging)
  static String get environmentInfo {
    return 'API Base URL: $baseUrl';
  }
  
  // Debug method to print current config
  static void printConfig() {
    print('=== API Configuration ===');
    print('Base URL: $baseUrl');
    print('Login Endpoint: $loginEndpoint');
    print('Daily QR Endpoint: $dailyQREndpoint');
    print('Record Endpoint: $recordEndpoint');
    print('========================');
  }
}
