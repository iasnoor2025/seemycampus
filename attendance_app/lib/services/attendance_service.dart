import '../models/attendance_record.dart';
import '../models/user.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class AttendanceService {
  final StorageService _storageService = StorageService();
  final ApiService _apiService = ApiService();

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
      final response = await _apiService.post(
        ApiConfig.recordEndpoint,
        {
          'qrCodeData': qrCodeData,
          'scanTime': now.toIso8601String(),
          'employeeId': user.employeeId ?? user.id,
        },
      );

      if (response['success'] == true) {
        final type = response['type'] as String;

        // Create or update local record
        AttendanceRecord localRecord;
        
        if (existingRecord != null) {
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
        } else {
          // Create new record
          localRecord = AttendanceRecord(
            employeeId: user.employeeId ?? user.id,
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
          await _storageService.insertAttendanceRecord(localRecord);
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
        await _storageService.insertAttendanceRecord(localRecord);
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
  Future<AttendanceStatus?> getTodayStatus(String employeeId) async {
    final record = await _storageService.getTodayAttendanceRecord(employeeId);
    
    if (record == null) {
      return null;
    }

    return AttendanceStatus(
      checkedIn: record.checkInTime != null,
      checkedOut: record.checkOutTime != null,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
    );
  }
}

class AttendanceResult {
  final bool success;
  final String type; // 'check-in', 'check-out', 'check-out-updated'
  final String message;
  final AttendanceRecord record;

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

  AttendanceStatus({
    required this.checkedIn,
    required this.checkedOut,
    this.checkInTime,
    this.checkOutTime,
  });
}
