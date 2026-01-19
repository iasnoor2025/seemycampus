import '../services/api_service.dart';
import '../config/api_config.dart';
import 'cache_service.dart';
import 'dart:convert';

class QRService {
  final ApiService _apiService = ApiService();
  final CacheService _cacheService = CacheService();
  
  DailyQRCode? _cachedQR;
  String? _cachedDate;

  /// Fetch today's daily QR code from the server with caching
  Future<DailyQRCode?> getTodayQRCode({bool forceRefresh = false}) async {
    try {
      final today = DateTime.now().toIso8601String().split('T')[0];
      
      // Return cached QR if available and not forcing refresh
      if (!forceRefresh && _cachedQR != null && _cachedDate == today) {
        return _cachedQR;
      }
      
      // Check shared preferences cache
      if (!forceRefresh) {
        final cachedQR = await _cacheService.getCachedDailyQR(today);
        if (cachedQR != null) {
          try {
            final qrData = jsonDecode(cachedQR);
            if (qrData['success'] == true) {
              _cachedQR = DailyQRCode(
                qrCode: qrData['qrCode'] as String,
                date: qrData['date'] as String,
                expiresAt: DateTime.parse(qrData['expiresAt'] as String),
              );
              _cachedDate = today;
              return _cachedQR;
            }
          } catch (e) {
            // Invalid cache, continue to fetch
          }
        }
      }

      final response = await _apiService.get(ApiConfig.dailyQREndpoint);

      if (response['success'] == true) {
        final qrCode = DailyQRCode(
          qrCode: response['qrCode'] as String,
          date: response['date'] as String,
          expiresAt: DateTime.parse(response['expiresAt'] as String),
        );
        
        // Cache the response
        _cachedQR = qrCode;
        _cachedDate = today;
        await _cacheService.cacheDailyQR(
          jsonEncode(response),
          today,
        );
        
        return qrCode;
      } else {
        return null;
      }
    } catch (e) {
      // Check if session expired
      if (e is ApiException && e.requiresReauth) {
        // Re-throw to be handled by caller
        rethrow;
      }
      // Return cached data if available even on error
      if (_cachedQR != null && _cachedDate == DateTime.now().toIso8601String().split('T')[0]) {
        return _cachedQR;
      }
      return null;
    }
  }

  /// Validate scanned QR code data
  /// Checks if the QR code is valid for today
  Future<bool> validateQRCode(String qrCodeData) async {
    try {
      // Get today's QR code from server
      final todayQR = await getTodayQRCode();
      
      if (todayQR == null) {
        return false;
      }

      // Compare the scanned QR code with today's QR code
      // The QR code data should match exactly
      return todayQR.qrCode == qrCodeData;
    } catch (e) {
      // If any error occurs, QR code is invalid
      return false;
    }
  }

  /// Check if QR code is expired
  bool isQRCodeExpired(DateTime expiresAt) {
    return DateTime.now().isAfter(expiresAt);
  }
  
  /// Clear cache (useful for testing or when date changes)
  Future<void> clearCache() async {
    _cachedQR = null;
    _cachedDate = null;
    await _cacheService.clearCache();
  }
}

class DailyQRCode {
  final String qrCode;
  final String date;
  final DateTime expiresAt;

  DailyQRCode({
    required this.qrCode,
    required this.date,
    required this.expiresAt,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}
