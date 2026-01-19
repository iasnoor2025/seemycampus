import '../models/attendance_record.dart';
import '../models/user.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../config/api_config.dart';

class AttendanceService {
  final StorageService _storageService = StorageService();
  final ApiService _apiService = ApiService();
  final AuthService _authService = AuthService();

  /// Record attendance by scanning QR code
  /// This is the ONLY way users can create/update attendance records
  /// First scan = Check-In, Subsequent scans = Check-Out
  Future<AttendanceResult> recordAttendance({
    required User user,
    required String qrCodeData,
    DateTime? scanTime,
  }) async {
    try {
      final now = scanTime ?? DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      
      // Get today's existing record if any
      final existingRecord = await _storageService.getTodayAttendanceRecord(
        user.employeeId ?? user.id,
      );

      // Call API to record attendance
      print('[AttendanceService] Calling API to record attendance...');
      final employeeId = user.employeeId ?? user.id;
      print('[AttendanceService] API request - employeeId: $employeeId, scanTime: ${now.toIso8601String()}, qrCodeData length: ${qrCodeData.length}');
      
      final response = await _apiService.post(
        ApiConfig.recordEndpoint,
        {
          'qrCodeData': qrCodeData,
          'scanTime': now.toIso8601String(),
          'employeeId': employeeId,
        },
      );

      print('[AttendanceService] API response: success=${response['success']}, type=${response['type']}, message=${response['message']}');

      if (response['success'] == true) {
        final type = response['type'] as String;

        // Create or update local record
        AttendanceRecord localRecord;
        
        print('[AttendanceService] Recording attendance - employeeId: $employeeId, type: $type, date: $today');
        
        if (existingRecord != null) {
          print('[AttendanceService] Updating existing record');
          // Update existing record
          localRecord = existingRecord.copyWith(
            checkOutTime: type == 'check-out' || type == 'check-out-updated'
                ? now
                : existingRecord.checkOutTime,
            status: 'present',
            syncedToServer: true, // Synced immediately since API call succeeded
            updatedAt: now,
          );
          await _storageService.updateAttendanceRecord(localRecord);
          print('[AttendanceService] Record updated: checkInTime=${localRecord.checkInTime}, checkOutTime=${localRecord.checkOutTime}');
        } else {
          print('[AttendanceService] Creating new record');
          // Create new record
          localRecord = AttendanceRecord(
            employeeId: employeeId,
            employeeName: user.name,
            date: today,
            checkInTime: now,
            checkOutTime: type == 'check-out' ? now : null,
            status: 'present',
            syncedToServer: true,
            qrCodeData: qrCodeData, // Store QR code for future sync if needed
            createdAt: now,
            updatedAt: now,
          );
          
          try {
            final insertId = await _storageService.insertAttendanceRecord(localRecord);
            print('[AttendanceService] Record created with id: $insertId, checkInTime=${localRecord.checkInTime}, checkOutTime=${localRecord.checkOutTime}');
          } catch (e, stackTrace) {
            print('[AttendanceService] ERROR saving record to local storage: $e');
            print('[AttendanceService] Stack trace: $stackTrace');
            // Still return success since API call succeeded, but log the error
          }
        }
        
        // Verify the record was saved correctly
        try {
          final verifyRecord = await _storageService.getTodayAttendanceRecord(employeeId);
          if (verifyRecord != null) {
            print('[AttendanceService] Verified saved record: date=${verifyRecord.date.toIso8601String().split('T')[0]}, checkInTime=${verifyRecord.checkInTime}');
          } else {
            print('[AttendanceService] WARNING: Could not verify saved record! Record may not have been saved to local storage.');
          }
        } catch (e) {
          print('[AttendanceService] ERROR verifying saved record: $e');
        }

        return AttendanceResult(
          success: true,
          type: type,
          message: response['message'] as String? ?? 'Attendance recorded',
          record: localRecord,
        );
      } else {
        // API failed, but save locally for sync later
        AttendanceRecord localRecord;
        
        if (existingRecord != null) {
          localRecord = existingRecord.copyWith(
            checkOutTime: now,
            updatedAt: now,
            syncedToServer: false,
          );
          await _storageService.updateAttendanceRecord(localRecord);
        } else {
          localRecord = AttendanceRecord(
            employeeId: user.employeeId ?? user.id,
            employeeName: user.name,
            date: today,
            checkInTime: now,
            status: 'present',
            syncedToServer: false,
            qrCodeData: qrCodeData, // Store QR code for sync
            createdAt: now,
          );
          await _storageService.insertAttendanceRecord(localRecord);
        }

        return AttendanceResult(
          success: false,
          type: 'check-in',
          message: response['error'] as String? ?? 'Failed to sync, saved locally',
          record: localRecord,
        );
      }
    } catch (e) {
      // Check if session expired
      if (e is ApiException && e.requiresReauth) {
        // Session expired - logout user
        await _authService.logout();
        return AttendanceResult(
          success: false,
          type: 'error',
          message: e.message,
          record: null,
        );
      }
      
      // Network error - save locally for sync later
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      
      final existingRecord = await _storageService.getTodayAttendanceRecord(
        user.employeeId ?? user.id,
      );

      AttendanceRecord localRecord;
      if (existingRecord != null) {
        localRecord = existingRecord.copyWith(
          checkOutTime: now,
          updatedAt: now,
          syncedToServer: false,
        );
        await _storageService.updateAttendanceRecord(localRecord);
      } else {
        localRecord = AttendanceRecord(
          employeeId: user.employeeId ?? user.id,
          employeeName: user.name,
          date: today,
          checkInTime: now,
          status: 'present',
          syncedToServer: false,
          qrCodeData: qrCodeData, // Store QR code for sync
          createdAt: now,
        );
        try {
          await _storageService.insertAttendanceRecord(localRecord);
          print('[AttendanceService] Saved record locally for sync (network error case)');
        } catch (e) {
          print('[AttendanceService] ERROR saving record locally: $e');
        }
      }

      return AttendanceResult(
        success: false,
        type: 'check-in',
        message: 'Network error. Saved locally for sync.',
        record: localRecord,
      );
    }
  }

  /// Get today's attendance status for current user
  /// First checks local storage, then fetches from API if not found
  Future<AttendanceStatus?> getTodayStatus(String employeeId, {String? employeeName, String? userEmail, String? userRole}) async {
    // Get today's date in YYYY-MM-DD format
    final today = DateTime.now();
    final todayStr = today.toIso8601String().split('T')[0];
    
    // Always fetch from API first to ensure we get today's latest data
    // Only use local storage as fallback if API fails
    try {
      final response = await _apiService.get(
        ApiConfig.myStatusEndpoint,
        userEmail: userEmail,
        userRole: userRole,
      );
      
      if (response['success'] == true) {
        // Verify the API returned data for today - REJECT if it's not today's data
        final apiDate = response['date'] as String?;
        if (apiDate != null && apiDate != todayStr) {
          return null; // Don't process yesterday's data as today's
        }
        
        if (response['hasRecord'] == true) {
          // Parse check-in and check-out times
          DateTime? checkInTime;
          DateTime? checkOutTime;
          
          if (response['checkInTime'] != null) {
            try {
              // Parse time string (HH:MM:SS) and combine with today's date
              final timeStr = response['checkInTime'] as String;
              final timeParts = timeStr.split(':');
              if (timeParts.length >= 2) {
                checkInTime = DateTime(
                  today.year,
                  today.month,
                  today.day,
                  int.parse(timeParts[0]),
                  int.parse(timeParts[1]),
                  timeParts.length > 2 ? int.parse(timeParts[2]) : 0,
                );
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
          
          if (response['checkOutTime'] != null) {
            try {
              final timeStr = response['checkOutTime'] as String;
              final timeParts = timeStr.split(':');
              if (timeParts.length >= 2) {
                checkOutTime = DateTime(
                  today.year,
                  today.month,
                  today.day,
                  int.parse(timeParts[0]),
                  int.parse(timeParts[1]),
                  timeParts.length > 2 ? int.parse(timeParts[2]) : 0,
                );
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
          
          // Always update local storage with API data to ensure we have today's record
          if (checkInTime != null) {
            final apiRecord = AttendanceRecord(
              employeeId: employeeId,
              employeeName: employeeName ?? 'Employee',
              date: today,
              checkInTime: checkInTime,
              checkOutTime: checkOutTime,
              status: response['status'] as String? ?? 'present',
              checkInStatus: response['checkInStatus'] as String?,
              checkOutStatus: response['checkOutStatus'] as String?,
              syncedToServer: true,
              createdAt: checkInTime,
              updatedAt: checkOutTime ?? checkInTime,
            );
            
            try {
              await _storageService.insertAttendanceRecord(apiRecord);
            } catch (e) {
              // Ignore storage errors
            }
          }
          
          return AttendanceStatus(
            checkedIn: response['checkedIn'] as bool? ?? false,
            checkedOut: response['checkedOut'] as bool? ?? false,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            checkInStatus: response['checkInStatus'] as String?,
            checkOutStatus: response['checkOutStatus'] as String?,
          );
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (e) {
      // If API fails, check local storage as fallback, but ONLY if it's for today
      final localRecord = await _storageService.getTodayAttendanceRecord(employeeId);
      
      if (localRecord != null) {
        final recordDateStr = localRecord.date.toIso8601String().split('T')[0];
        if (recordDateStr == todayStr) {
          return AttendanceStatus(
            checkedIn: localRecord.checkInTime != null,
            checkedOut: localRecord.checkOutTime != null,
            checkInTime: localRecord.checkInTime,
            checkOutTime: localRecord.checkOutTime,
          );
        }
      }
      return null;
    }
  }
}

class AttendanceResult {
  final bool success;
  final String type; // 'check-in', 'check-out', 'check-out-updated', 'error'
  final String message;
  final AttendanceRecord? record; // Can be null if session expired

  AttendanceResult({
    required this.success,
    required this.type,
    required this.message,
    required this.record,
  });
}

class AttendanceStatus {
  final bool checkedIn;
  final bool checkedOut;
  final DateTime? checkInTime;
  final DateTime? checkOutTime;
  final String? checkInStatus; // "early", "on-time", "late", or null
  final String? checkOutStatus; // "early", "on-time", "late", or null

  AttendanceStatus({
    required this.checkedIn,
    required this.checkedOut,
    this.checkInTime,
    this.checkOutTime,
    this.checkInStatus,
    this.checkOutStatus,
  });
}
