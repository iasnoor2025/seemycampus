import '../services/api_service.dart';
import '../config/api_config.dart';

class QRService {
  final ApiService _apiService = ApiService();

  /// Fetch today's daily QR code from the server
  Future<DailyQRCode?> getTodayQRCode() async {
    try {
      final response = await _apiService.get(ApiConfig.dailyQREndpoint);

      if (response['success'] == true) {
        return DailyQRCode(
          qrCode: response['qrCode'] as String,
          date: response['date'] as String,
          expiresAt: DateTime.parse(response['expiresAt'] as String),
        );
      } else {
        return null;
      }
    } catch (e) {
      // Return null on error - will be handled by caller
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
