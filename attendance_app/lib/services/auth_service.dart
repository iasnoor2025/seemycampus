import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final ApiService _apiService = ApiService();
  static const String _userKey = 'user_data';
  static const String _tokenKey = 'auth_token';

  User? _currentUser;
  String? _token;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  /// Initialize auth service - load saved user and token
  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Load token
      _token = prefs.getString(_tokenKey);
      if (_token != null) {
        _apiService.setAuthToken(_token);
      }

      // Load user data
      final userJson = prefs.getString(_userKey);
      if (userJson != null) {
        final userMap = jsonDecode(userJson) as Map<String, dynamic>;
        _currentUser = User.fromJson(userMap);
      }
    } catch (e) {
      // If there's an error loading saved data, clear it
      await logout();
    }
  }

  /// Login with email and password
  Future<User> login(String email, String password) async {
    try {
      final response = await _apiService.post(
        ApiConfig.loginEndpoint,
        {
          'email': email,
          'password': password,
        },
      );

      if (response['success'] == true) {
        final userData = response['user'] as Map<String, dynamic>;
        final user = User.fromJson(userData);
        
        // Save token if provided (API may not return token for session-based auth)
        final token = response['token'] as String?;
        if (token != null && token.isNotEmpty) {
          await _saveToken(token);
        } else {
          // For session-based auth, we still need to set a placeholder
          // The actual auth will be handled by cookies/session on the server
          _token = 'session_auth';
          _apiService.setAuthToken('session_auth');
        }

        // Save user data
        await _saveUser(user);

        _currentUser = user;
        return user;
      } else {
        throw AuthException(
          message: response['error'] as String? ?? 'Login failed',
        );
      }
    } catch (e) {
      if (e is AuthException) {
        rethrow;
      }
      throw AuthException(
        message: 'Login failed: ${e.toString()}',
      );
    }
  }

  /// Logout user
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userKey);
    await prefs.remove(_tokenKey);
    
    _currentUser = null;
    _token = null;
    _apiService.setAuthToken(null);
  }

  /// Save user data to local storage
  Future<void> _saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  /// Save auth token to local storage
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    _token = token;
    _apiService.setAuthToken(token);
  }
}

class AuthException implements Exception {
  final String message;

  AuthException({required this.message});

  @override
  String toString() => message;
}
