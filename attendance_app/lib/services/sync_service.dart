import '../models/attendance_record.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';
import 'dart:async';

class SyncService {
  final StorageService _storageService = StorageService();
  final ApiService _apiService = ApiService();
  
  Timer? _syncTimer;
  bool _isSyncing = false;
  final List<Function(SyncResult)> _syncListeners = [];

  /// Start automatic background sync
  /// Syncs every 5 minutes when online
  void startAutoSync() {
    // Stop existing timer if any
    stopAutoSync();
    
    // Sync immediately
    syncPendingRecords();
    
    // Then sync every 5 minutes
    _syncTimer = Timer.periodic(
      const Duration(minutes: 5),
      (_) => syncPendingRecords(),
    );
  }

  /// Stop automatic background sync
  void stopAutoSync() {
    _syncTimer?.cancel();
    _syncTimer = null;
  }

  /// Add listener for sync events
  void addSyncListener(Function(SyncResult) listener) {
    _syncListeners.add(listener);
  }

  /// Remove sync listener
  void removeSyncListener(Function(SyncResult) listener) {
    _syncListeners.remove(listener);
  }

  /// Notify all listeners
  void _notifyListeners(SyncResult result) {
    for (var listener in _syncListeners) {
      listener(result);
    }
  }

  /// Sync all pending attendance records
  Future<SyncResult> syncPendingRecords() async {
    if (_isSyncing) {
      return SyncResult(
        success: false,
        message: 'Sync already in progress',
        syncedCount: 0,
        failedCount: 0,
      );
    }

    _isSyncing = true;
    int syncedCount = 0;
    int failedCount = 0;
    List<String> errors = [];

    try {
      // Get all unsynced records
      final unsyncedRecords = await _storageService.getUnsyncedRecords();

      if (unsyncedRecords.isEmpty) {
        _isSyncing = false;
        final result = SyncResult(
          success: true,
          message: 'All records are synced',
          syncedCount: 0,
          failedCount: 0,
        );
        _notifyListeners(result);
        return result;
      }

      // Sync each record
      for (var record in unsyncedRecords) {
        try {
          final success = await _syncSingleRecord(record);
          if (success) {
            syncedCount++;
            await _storageService.markAsSynced(record.id!);
          } else {
            failedCount++;
            errors.add('Failed to sync record for ${record.date}');
          }
        } catch (e) {
          failedCount++;
          errors.add('Error syncing ${record.date}: ${e.toString()}');
        }
      }

      final result = SyncResult(
        success: failedCount == 0,
        message: failedCount == 0
            ? 'Successfully synced $syncedCount record(s)'
            : 'Synced $syncedCount, failed $failedCount',
        syncedCount: syncedCount,
        failedCount: failedCount,
        errors: errors,
      );

      _notifyListeners(result);
      return result;
    } catch (e) {
      final result = SyncResult(
        success: false,
        message: 'Sync error: ${e.toString()}',
        syncedCount: syncedCount,
        failedCount: failedCount,
        errors: errors,
      );
      _notifyListeners(result);
      return result;
    } finally {
      _isSyncing = false;
    }
  }

  /// Sync a single attendance record
  Future<bool> _syncSingleRecord(AttendanceRecord record) async {
    try {
      // If we don't have QR code data, we can't sync (shouldn't happen)
      if (record.qrCodeData == null) {
        return false;
      }

      // Use the check-out time if available, otherwise use check-in time
      final scanTime = record.checkOutTime ?? record.checkInTime ?? record.createdAt;

      final response = await _apiService.post(
        ApiConfig.recordEndpoint,
        {
          'qrCodeData': record.qrCodeData!,
          'scanTime': scanTime.toIso8601String(),
          'employeeId': record.employeeId,
        },
      );

      return response['success'] == true;
    } catch (e) {
      // Network error or API error
      return false;
    }
  }

  /// Manual sync trigger
  Future<SyncResult> manualSync() async {
    return await syncPendingRecords();
  }

  /// Get sync status
  Future<SyncStatus> getSyncStatus() async {
    final unsyncedRecords = await _storageService.getUnsyncedRecords();
    return SyncStatus(
      isSyncing: _isSyncing,
      pendingCount: unsyncedRecords.length,
      lastSyncTime: DateTime.now(), // Could be stored in SharedPreferences
    );
  }
}

class SyncResult {
  final bool success;
  final String message;
  final int syncedCount;
  final int failedCount;
  final List<String> errors;

  SyncResult({
    required this.success,
    required this.message,
    required this.syncedCount,
    required this.failedCount,
    this.errors = const [],
  });
}

class SyncStatus {
  final bool isSyncing;
  final int pendingCount;
  final DateTime? lastSyncTime;

  SyncStatus({
    required this.isSyncing,
    required this.pendingCount,
    this.lastSyncTime,
  });
}
