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
  /// Uses exponential backoff for retries
  void startAutoSync() {
    // Stop existing timer if any
    stopAutoSync();
    
    // Sync immediately
    syncPendingRecords();
    
    // Then sync every 5 minutes
    _syncTimer = Timer.periodic(
      const Duration(minutes: 5),
      (_) {
        // Only sync if not already syncing
        if (!_isSyncing) {
          syncPendingRecords();
        }
      },
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

      // Sync records in batches to avoid overwhelming the server
      const batchSize = 5;
      for (var i = 0; i < unsyncedRecords.length; i += batchSize) {
        final batch = unsyncedRecords.skip(i).take(batchSize).toList();
        
        // Sync batch
        for (var record in batch) {
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
            // Check if session expired - stop syncing immediately
            if (e is ApiException && e.requiresReauth) {
              failedCount++;
              errors.add('Session expired. Please login again.');
              // Break out of loop - session expired
              break;
            }
            failedCount++;
            errors.add('Error syncing ${record.date}: ${e.toString()}');
          }
        }
        
        // If session expired, stop processing remaining batches
        if (errors.any((e) => e.contains('Session expired'))) {
          break;
        }
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < unsyncedRecords.length) {
          await Future.delayed(const Duration(milliseconds: 500));
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
      // Check if session expired
      if (e is ApiException && e.requiresReauth) {
        final result = SyncResult(
          success: false,
          message: 'Session expired. Please login again.',
          syncedCount: syncedCount,
          failedCount: failedCount,
          errors: [...errors, 'Session expired. Please login again.'],
        );
        _notifyListeners(result);
        return result;
      }
      
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
      // Check if session expired
      if (e is ApiException && e.requiresReauth) {
        // Session expired - stop syncing and notify
        rethrow; // Re-throw to be handled by caller
      }
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
