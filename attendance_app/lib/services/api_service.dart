import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _authToken;

  void setAuthToken(String? token) {
    _authToken = token;
  }

  Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
      // For Next.js session-based auth, we might need cookies
      // This will be handled differently if using session cookies
    }
    
    return headers;
  }

  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    try {
      final url = ApiConfig.getUrl(endpoint);
      
      // Debug logging (remove in production)
      if (const bool.fromEnvironment('dart.vm.product') == false) {
        print('API Request: POST $url');
        print('Headers: $_headers');
        print('Body: ${jsonEncode(body)}');
      }
      
      final response = await http.post(
        Uri.parse(url),
        headers: _headers,
        body: jsonEncode(body),
      );
      
      // Debug logging
      if (const bool.fromEnvironment('dart.vm.product') == false) {
        print('API Response: ${response.statusCode}');
        print('Response Body: ${response.body}');
      }

      // Handle empty response body
      Map<String, dynamic> responseData;
      try {
        if (response.body.isEmpty) {
          responseData = {};
        } else {
          responseData = jsonDecode(response.body) as Map<String, dynamic>;
        }
      } catch (e) {
        throw ApiException(
          message: 'Invalid response format: ${response.body}',
          statusCode: response.statusCode,
        );
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return responseData;
      } else {
        throw ApiException(
          message: responseData['error'] as String? ?? 
                   'Request failed with status ${response.statusCode}',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      // Handle network errors more gracefully
      final errorMessage = e.toString();
      
      // Debug logging for errors
      if (const bool.fromEnvironment('dart.vm.product') == false) {
        print('API POST Error: $errorMessage');
      }
      
      if (errorMessage.contains('Failed host lookup') || 
          errorMessage.contains('Connection refused') ||
          errorMessage.contains('SocketException')) {
        throw ApiException(
          message: 'Cannot connect to server. Please check:\n1. Server is running on port 3000\n2. For Android emulator, use 10.0.2.2 instead of localhost\n3. Your internet connection',
          statusCode: 0,
        );
      }
      throw ApiException(
        message: 'Network error: $errorMessage',
        statusCode: 0,
      );
    }
  }

  Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final url = ApiConfig.getUrl(endpoint);
      
      // Debug logging (remove in production)
      if (const bool.fromEnvironment('dart.vm.product') == false) {
        print('API Request: GET $url');
        print('Headers: $_headers');
      }
      
      final response = await http.get(
        Uri.parse(url),
        headers: _headers,
      );
      
      // Debug logging
      if (const bool.fromEnvironment('dart.vm.product') == false) {
        print('API Response: ${response.statusCode}');
        print('Response Body: ${response.body}');
      }

      // Handle empty response body
      Map<String, dynamic> responseData;
      try {
        if (response.body.isEmpty) {
          responseData = {};
        } else {
          responseData = jsonDecode(response.body) as Map<String, dynamic>;
        }
      } catch (e) {
        throw ApiException(
          message: 'Invalid response format: ${response.body}',
          statusCode: response.statusCode,
        );
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return responseData;
      } else {
        throw ApiException(
          message: responseData['error'] as String? ?? 
                   'Request failed with status ${response.statusCode}',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      // Handle network errors more gracefully
      final errorMessage = e.toString();
      
      // Debug logging for errors
      if (const bool.fromEnvironment('dart.vm.product') == false) {
        print('API Error: $errorMessage');
      }
      
      if (errorMessage.contains('Failed host lookup') || 
          errorMessage.contains('Connection refused') ||
          errorMessage.contains('SocketException')) {
        throw ApiException(
          message: 'Cannot connect to server. Please check:\n1. Server is running on port 3000\n2. For Android emulator, use 10.0.2.2 instead of localhost\n3. Your internet connection',
          statusCode: 0,
        );
      }
      throw ApiException(
        message: 'Network error: $errorMessage',
        statusCode: 0,
      );
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException({required this.message, required this.statusCode});

  @override
  String toString() => message;
}
