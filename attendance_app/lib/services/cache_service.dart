import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Simple cache service for API responses
class CacheService {
  static final CacheService _instance = CacheService._internal();
  factory CacheService() => _instance;
  CacheService._internal();

  // Cache daily QR code for the current day
  Future<void> cacheDailyQR(String qrData, String date) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('daily_qr_$date', qrData);
    await prefs.setString('daily_qr_date', date);
  }

  Future<String?> getCachedDailyQR(String date) async {
    final prefs = await SharedPreferences.getInstance();
    final cachedDate = prefs.getString('daily_qr_date');
    if (cachedDate == date) {
      return prefs.getString('daily_qr_$date');
    }
    return null;
  }

  Future<void> clearCache() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('daily_qr_date');
    // Clear all daily_qr_* keys
    final keys = prefs.getKeys();
    for (final key in keys) {
      if (key.startsWith('daily_qr_')) {
        await prefs.remove(key);
      }
    }
  }
}
