import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';
import '../services/api_service.dart' show ApiException;

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  User? get user => _authService.currentUser;
  bool get isAuthenticated => _authService.isAuthenticated;
  bool get isLoading => _isLoading;

  bool _isLoading = false;
  String? _errorMessage;

  String? get errorMessage => _errorMessage;

  /// Initialize auth provider
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.initialize();
      
      // Check session validity if user is logged in
      final user = _authService.currentUser;
      if (user != null && user.role == 'employee') {
        await _checkSessionValidity();
      }
      
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Check if current session is still valid
  Future<void> _checkSessionValidity() async {
    try {
      final user = _authService.currentUser;
      if (user == null) {
        return;
      }

      final apiService = ApiService();
      // Always use email for lookup since employeeId might not match
      final employeeId = user.employeeId ?? user.id;
      final email = user.email;
      // Build endpoint with query parameters (ApiService.get will prepend baseUrl)
      final endpoint = '${ApiConfig.checkSessionEndpoint}?employeeId=$employeeId&email=${Uri.encodeComponent(email)}';
      
      print('[AuthProvider] Checking session for employee: $employeeId, email: $email');
      final response = await apiService.get(endpoint);
      print('[AuthProvider] Session check response: ${response.toString()}');

      if (response['valid'] == false || response['requiresReauth'] == true) {
        print('[AuthProvider] Session expired - logging out');
        // Session expired - logout
        await logout();
      } else {
        print('[AuthProvider] Session is valid');
      }
    } catch (e) {
      print('[AuthProvider] Session check error: $e');
      // Check if it's a session expiration error
      if (e is ApiException && e.requiresReauth) {
        await logout();
        return;
      }
      // If check fails, don't logout (might be network issue)
      // Session will be validated on next API call
    }
  }

  /// Login with email and password
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.login(email, password);
      _errorMessage = null;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logout user
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
