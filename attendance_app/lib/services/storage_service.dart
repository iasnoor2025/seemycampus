import 'package:sqflite/sqflite.dart';
import '../models/attendance_record.dart';
import 'database_service.dart';

class StorageService {
  final DatabaseService _dbService = DatabaseService();

  /// Insert a new attendance record
  Future<int> insertAttendanceRecord(AttendanceRecord record) async {
    try {
      print('[StorageService] Inserting record: employeeId=${record.employeeId}, date=${record.date.toIso8601String().split('T')[0]}, checkInTime=${record.checkInTime}');
      final db = await _dbService.database;
      final recordMap = record.toMap();
      print('[StorageService] Record map: $recordMap');
      
      final result = await db.insert(
        'attendance_records',
        recordMap,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
      
      print('[StorageService] Record inserted successfully with id: $result');
      
      // Verify insertion
      final verifyMaps = await db.query(
        'attendance_records',
        where: 'employee_id = ? AND date = ?',
        whereArgs: [record.employeeId, record.date.toIso8601String().split('T')[0]],
        limit: 1,
      );
      print('[StorageService] Verification query returned ${verifyMaps.length} records');
      
      return result;
    } catch (e, stackTrace) {
      print('[StorageService] ERROR inserting record: $e');
      print('[StorageService] Stack trace: $stackTrace');
      rethrow;
    }
  }

  /// Get all attendance records
  Future<List<AttendanceRecord>> getAllAttendanceRecords() async {
    try {
      print('[StorageService] Getting all attendance records');
      final db = await _dbService.database;
      final List<Map<String, dynamic>> maps = await db.query(
        'attendance_records',
        orderBy: 'date DESC, created_at DESC',
      );

      print('[StorageService] Found ${maps.length} total records in database');
      if (maps.isNotEmpty) {
        print('[StorageService] First record: ${maps.first}');
      }

      return List.generate(
        maps.length,
        (i) => AttendanceRecord.fromMap(maps[i]),
      );
    } catch (e, stackTrace) {
      print('[StorageService] ERROR getting all records: $e');
      print('[StorageService] Stack trace: $stackTrace');
      rethrow;
    }
  }

  /// Get attendance records for a specific employee
  Future<List<AttendanceRecord>> getAttendanceRecordsByEmployee(
    String employeeId,
  ) async {
    final db = await _dbService.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'attendance_records',
      where: 'employee_id = ?',
      whereArgs: [employeeId],
      orderBy: 'date DESC, created_at DESC',
    );

    return List.generate(
      maps.length,
      (i) => AttendanceRecord.fromMap(maps[i]),
    );
  }

  /// Get today's attendance record for an employee
  Future<AttendanceRecord?> getTodayAttendanceRecord(
    String employeeId,
  ) async {
    try {
      print('[StorageService] Getting today record for employeeId: $employeeId');
      final db = await _dbService.database;
      final today = DateTime.now().toIso8601String().split('T')[0];
      print('[StorageService] Today date: $today');

      // First, check if table exists and has any records
      final allMaps = await db.query('attendance_records', limit: 1);
      print('[StorageService] Database has ${allMaps.length} records (sample check)');

      final List<Map<String, dynamic>> maps = await db.query(
        'attendance_records',
        where: 'employee_id = ? AND date = ?',
        whereArgs: [employeeId, today],
        limit: 1,
      );

      print('[StorageService] Query returned ${maps.length} records for employeeId=$employeeId, date=$today');
      if (maps.isNotEmpty) {
        print('[StorageService] Found record: ${maps[0]}');
      } else {
        // Check if there are any records with this employeeId
        final empMaps = await db.query(
          'attendance_records',
          where: 'employee_id = ?',
          whereArgs: [employeeId],
        );
        print('[StorageService] Found ${empMaps.length} total records for employeeId=$employeeId');
        if (empMaps.isNotEmpty) {
          print('[StorageService] Latest record date: ${empMaps.first['date']}');
        }
      }

      if (maps.isEmpty) {
        return null;
      }

      return AttendanceRecord.fromMap(maps[0]);
    } catch (e, stackTrace) {
      print('[StorageService] ERROR getting today record: $e');
      print('[StorageService] Stack trace: $stackTrace');
      rethrow;
    }
  }

  /// Update an attendance record (INTERNAL USE ONLY - System updates only)
  /// Users cannot manually update attendance records.
  /// This method is only called by the attendance service when processing QR scans.
  Future<int> updateAttendanceRecord(AttendanceRecord record) async {
    try {
      print('[StorageService] Updating record: id=${record.id}, employeeId=${record.employeeId}, date=${record.date.toIso8601String().split('T')[0]}');
      final db = await _dbService.database;
      final result = await db.update(
        'attendance_records',
        record.toMap(),
        where: 'id = ?',
        whereArgs: [record.id],
      );
      print('[StorageService] Record updated: $result rows affected');
      return result;
    } catch (e, stackTrace) {
      print('[StorageService] ERROR updating record: $e');
      print('[StorageService] Stack trace: $stackTrace');
      rethrow;
    }
  }

  /// Internal method to update check-out time (called by attendance service)
  /// Users cannot call this directly - only system can update via QR scan processing
  Future<int> updateCheckOutTime(int recordId, DateTime checkOutTime) async {
    final db = await _dbService.database;
    return await db.update(
      'attendance_records',
      {
        'check_out_time': checkOutTime.toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [recordId],
    );
  }

  /// Get all unsynced attendance records
  Future<List<AttendanceRecord>> getUnsyncedRecords() async {
    final db = await _dbService.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'attendance_records',
      where: 'synced_to_server = ?',
      whereArgs: [0],
      orderBy: 'created_at ASC',
    );

    return List.generate(
      maps.length,
      (i) => AttendanceRecord.fromMap(maps[i]),
    );
  }

  /// Mark attendance record as synced
  Future<int> markAsSynced(int recordId) async {
    final db = await _dbService.database;
    return await db.update(
      'attendance_records',
      {
        'synced_to_server': 1,
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [recordId],
    );
  }

  /// Delete an attendance record (INTERNAL USE ONLY - Admin/system operations)
  /// Users cannot delete their own attendance records.
  /// This method should only be used by admin functions or data cleanup operations.
  Future<int> deleteAttendanceRecord(int id) async {
    final db = await _dbService.database;
    return await db.delete(
      'attendance_records',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Get attendance records for a date range
  Future<List<AttendanceRecord>> getAttendanceRecordsByDateRange(
    DateTime startDate,
    DateTime endDate,
  ) async {
    final db = await _dbService.database;
    final start = startDate.toIso8601String().split('T')[0];
    final end = endDate.toIso8601String().split('T')[0];

    final List<Map<String, dynamic>> maps = await db.query(
      'attendance_records',
      where: 'date >= ? AND date <= ?',
      whereArgs: [start, end],
      orderBy: 'date DESC, created_at DESC',
    );

    return List.generate(
      maps.length,
      (i) => AttendanceRecord.fromMap(maps[i]),
    );
  }

  /// Clear all attendance records (ADMIN ONLY - Use with extreme caution)
  /// Users cannot clear attendance records.
  /// This method should only be used for data reset or admin maintenance.
  Future<int> clearAllRecords() async {
    final db = await _dbService.database;
    return await db.delete('attendance_records');
  }
}
