import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import '../providers/auth_provider.dart';
import '../services/sync_service.dart';
import '../services/attendance_service.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  final SyncService _syncService = SyncService();
  final AttendanceService _attendanceService = AttendanceService();
  
  SyncStatus? _syncStatus;
  AttendanceStatus? _todayStatus;
  bool _isLoadingStatus = true;
  bool _isInitialLoad = true;
  Future<void>? _loadingFuture; // Track ongoing load operation to prevent concurrent loads
  DateTime? _lastLoadTime; // Track last load time for debouncing
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  Timer? _sessionCheckTimer;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    _animationController.forward();
    
    // Load today's status immediately - don't wait for session check
    _loadTodayStatus();
    _loadSyncStatus();
    
    // Check session validity in parallel (non-blocking, but don't reload data)
    _checkSessionValidity();
    
    // Start periodic session check (every 2 minutes)
    _startPeriodicSessionCheck();
    
    // Start auto-sync
    _syncService.startAutoSync();
    
    // Listen to sync events
    _syncService.addSyncListener(_onSyncComplete);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Skip initial load - we already loaded in initState
    if (_isInitialLoad) {
      _isInitialLoad = false;
      return;
    }
    
    // Refresh status when screen comes into focus (e.g., returning from scanner)
    // Only refresh if we're not already loading
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && _loadingFuture == null && !_isLoadingStatus) {
        _loadTodayStatus();
      }
    });
  }

  void _startPeriodicSessionCheck() {
    // Check session every 30 seconds for immediate logout detection
    _sessionCheckTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _checkSessionValidity(),
    );
  }

  Future<void> _checkSessionValidity() async {
    if (!mounted) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    
    if (user == null || user.role != 'employee') {
      return;
    }

    try {
      final apiService = ApiService();
      final employeeId = user.employeeId ?? user.id;
      final email = user.email;
      // Build endpoint with query parameters (ApiService.get will prepend baseUrl)
      final endpoint = '${ApiConfig.checkSessionEndpoint}?employeeId=$employeeId&email=${Uri.encodeComponent(email)}';
      
      print('[Session Check] Checking session for employee: $employeeId, email: $email');
      final response = await apiService.get(endpoint);
      
      print('[Session Check] Response: valid=${response['valid']}, requiresReauth=${response['requiresReauth']}');

      if (response['valid'] == false || response['requiresReauth'] == true) {
        print('[Session Check] Session expired - logging out');
        // Session expired - logout and redirect
        await authProvider.logout();
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/login');
        }
      } else {
        print('[Session Check] Session is valid');
      }
    } catch (e) {
      print('[Session Check] Error: $e');
      // Check if it's a session expiration error
      if (e is ApiException && e.requiresReauth) {
        print('[Session Check] Session expiration detected in exception - logging out');
        await authProvider.logout();
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/login');
        }
      }
      // If check fails, continue (might be network issue)
    }
  }


  @override
  void dispose() {
    _animationController.dispose();
    _sessionCheckTimer?.cancel();
    _syncService.stopAutoSync();
    super.dispose();
  }

  Future<void> _loadTodayStatus() async {
    // Prevent concurrent loads - if a load is already in progress, skip
    if (_loadingFuture != null) {
      print('[HomeScreen] Load already in progress, skipping duplicate call');
      return;
    }
    
    // Debounce: prevent loading if we just loaded less than 500ms ago
    final now = DateTime.now();
    if (_lastLoadTime != null && now.difference(_lastLoadTime!).inMilliseconds < 500) {
      print('[HomeScreen] Load debounced - last load was ${now.difference(_lastLoadTime!).inMilliseconds}ms ago');
      return;
    }
    
    _lastLoadTime = now;
    print('[HomeScreen] Starting _loadTodayStatus');
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    
    // Create and track the loading future
    _loadingFuture = _performLoadTodayStatus(authProvider, user);
    
    try {
      await _loadingFuture;
    } finally {
      // Clear the future when done
      _loadingFuture = null;
      print('[HomeScreen] Completed _loadTodayStatus');
    }
  }
  
  Future<void> _performLoadTodayStatus(AuthProvider authProvider, dynamic user) async {
    // Set loading state at the start - ensure it's visible
    if (mounted) {
      setState(() {
        _isLoadingStatus = true;
      });
    }
    
    if (user != null) {
      final employeeId = user.employeeId ?? user.id;
      print('[HomeScreen] Loading today status for employeeId: $employeeId');
      
      try {
        final status = await _attendanceService.getTodayStatus(
          employeeId,
          employeeName: user.name,
          userEmail: user.email,
          userRole: user.role,
        );
        print('[HomeScreen] Today status loaded: checkedIn=${status?.checkedIn}, checkInTime=${status?.checkInTime}, status is null: ${status == null}');
        
        if (mounted) {
          setState(() {
            _todayStatus = status; // This can be null when no record exists - UI will show "Not checked in today"
            _isLoadingStatus = false;
          });
        }
      } catch (e) {
        print('[HomeScreen] Error loading today status: $e');
        if (mounted) {
          setState(() {
            _todayStatus = null;
            _isLoadingStatus = false;
          });
        }
      }
    } else {
      if (mounted) {
        setState(() {
          _todayStatus = null;
          _isLoadingStatus = false;
        });
      }
    }
  }

  Future<void> _loadSyncStatus() async {
    final status = await _syncService.getSyncStatus();
    if (mounted) {
      setState(() {
        _syncStatus = status;
      });
    }
  }

  void _onSyncComplete(SyncResult result) async {
    if (!mounted) return;
    
    // Check if sync failed due to session expiration
    if (result.errors.isNotEmpty) {
      final hasSessionError = result.errors.any((error) => 
        error.contains('Session expired') || 
        error.contains('login again') ||
        error.contains('requiresReauth')
      );
      
      if (hasSessionError) {
        // Session expired - logout and redirect
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await authProvider.logout();
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/login');
        }
        return;
      }
    }
    
    _loadSyncStatus();
    _loadTodayStatus(); // Refresh today's status after sync
    
    if (result.syncedCount > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.cloud_done, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  result.message,
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 3),
        ),
      );
    } else if (result.failedCount > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.warning, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Some records failed to sync. Please try manual sync.',
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
          backgroundColor: Colors.orange,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  Future<void> _handleManualSync() async {
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
            SizedBox(width: 16),
            Text('Syncing attendance records...'),
          ],
        ),
        duration: Duration(seconds: 30),
      ),
    );

    final result = await _syncService.manualSync();
    
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              result.success ? Icons.check_circle : Icons.warning,
              color: Colors.white,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                result.message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: result.success ? Colors.green : Colors.orange,
        duration: Duration(seconds: result.success ? 3 : 5),
        action: result.success ? null : SnackBarAction(
          label: 'Retry',
          textColor: Colors.white,
          onPressed: _handleManualSync,
        ),
      ),
    );
    
    _loadSyncStatus();
    _loadTodayStatus();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      backgroundColor: const Color(0xFFE0E5EC), // Light Neumorphism background
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: CustomScrollView(
          slivers: [
            // Compact App Bar - Neumorphism style
            SliverAppBar(
              expandedHeight: 140,
              floating: false,
              pinned: true,
              elevation: 0,
              backgroundColor: const Color(0xFFE0E5EC),
              flexibleSpace: FlexibleSpaceBar(
                titlePadding: EdgeInsets.zero,
                centerTitle: false,
                title: Container(
                  padding: const EdgeInsets.only(left: 20, bottom: 12),
                  alignment: Alignment.bottomLeft,
                  child: const Text(
                    'Attendance',
                    style: TextStyle(
                      color: Color(0xFF2C3E50),
                      fontWeight: FontWeight.bold,
                      fontSize: 22,
                    ),
                  ),
                ),
                background: Container(
                  color: const Color(0xFFE0E5EC),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20.0, 16.0, 20.0, 60.0),
                      child: Row(
                        children: [
                          _buildNeumorphicContainer(
                            child: Icon(
                              Icons.person_rounded,
                              color: colorScheme.primary,
                              size: 24,
                            ),
                            size: 48,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Welcome back,',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  user?.name ?? 'Employee',
                                  style: const TextStyle(
                                    color: Color(0xFF2C3E50),
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          if (user?.role == 'admin')
                            _buildNeumorphicContainer(
                              child: Icon(
                                Icons.logout_rounded,
                                color: colorScheme.primary,
                                size: 20,
                              ),
                              size: 40,
                              onTap: () async {
                                await authProvider.logout();
                                if (context.mounted) {
                                  Navigator.of(context).pushReplacementNamed('/login');
                                }
                              },
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            
            // Main Content - Compact layout
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Today's Status Card - Compact Neumorphism
                    if (_isLoadingStatus)
                      Container(
                        padding: const EdgeInsets.all(40),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE0E5EC),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.white.withOpacity(0.8),
                              offset: const Offset(-6, -6),
                              blurRadius: 12,
                            ),
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              offset: const Offset(6, 6),
                              blurRadius: 12,
                            ),
                          ],
                        ),
                        child: const Center(
                          child: CircularProgressIndicator(),
                        ),
                      )
                    else
                      _buildStatusCardNeumorphic(context, colorScheme),
                    
                    const SizedBox(height: 16),
                    
                    // Sync Status Card - Compact
                    if (_syncStatus != null && _syncStatus!.pendingCount > 0)
                      _buildSyncCardNeumorphic(context, colorScheme),
                    
                    const SizedBox(height: 16),
                    
                    // Action Buttons - Compact Neumorphism
                    _buildActionButtonNeumorphic(
                      context: context,
                      colorScheme: colorScheme,
                      icon: Icons.qr_code_scanner_rounded,
                      label: 'Scan QR Code',
                      description: 'Record your attendance',
                      color: colorScheme.primary, // Primary lavender blue-purple
                      onPressed: () async {
                        final result = await Navigator.of(context).pushNamed('/scanner');
                        // Refresh status when returning from scanner
                        if (result == true || mounted) {
                          _loadTodayStatus();
                        }
                      },
                    ),
                    
                    // Admin Actions - Only visible to admin
                    if (user?.role == 'admin') ...[
                      const SizedBox(height: 12),
                      _buildActionButtonNeumorphic(
                        context: context,
                        colorScheme: colorScheme,
                        icon: Icons.today_rounded,
                        label: "Today's Attendance",
                        description: 'See who is present today',
                        color: colorScheme.primary.withOpacity(0.85), // Primary with slight variation
                        onPressed: () => Navigator.of(context).pushNamed('/today'),
                      ),
                      const SizedBox(height: 12),
                      _buildActionButtonNeumorphic(
                        context: context,
                        colorScheme: colorScheme,
                        icon: Icons.history_rounded,
                        label: 'View History',
                        description: 'Check past attendance records',
                        color: colorScheme.primary.withOpacity(0.75), // Primary with variation
                        onPressed: () => Navigator.of(context).pushNamed('/history'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNeumorphicContainer({
    required Widget child,
    double size = 56,
    VoidCallback? onTap,
    bool isPressed = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(size / 2),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: const Color(0xFFE0E5EC), // Light Neumorphism background
          shape: BoxShape.circle,
          boxShadow: isPressed
              ? [
                  // Debossed (pressed in) - reversed shadows
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    offset: const Offset(2, 2),
                    blurRadius: 4,
                    spreadRadius: 0,
                  ),
                  BoxShadow(
                    color: Colors.white.withOpacity(0.7),
                    offset: const Offset(-2, -2),
                    blurRadius: 4,
                    spreadRadius: 0,
                  ),
                ]
              : [
                  // Embossed (raised) - light from top-left, dark from bottom-right
                  BoxShadow(
                    color: Colors.white.withOpacity(0.8),
                    offset: const Offset(-4, -4),
                    blurRadius: 8,
                    spreadRadius: 0,
                  ),
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    offset: const Offset(4, 4),
                    blurRadius: 8,
                    spreadRadius: 0,
                  ),
                ],
        ),
        child: Center(child: child),
      ),
    );
  }

  Widget _buildStatusCardNeumorphic(BuildContext context, ColorScheme colorScheme) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFE0E5EC), // Light Neumorphism background
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          // Embossed effect - light from top-left, dark from bottom-right
          BoxShadow(
            color: Colors.white.withOpacity(0.8),
            offset: const Offset(-6, -6),
            blurRadius: 12,
            spreadRadius: 0,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            offset: const Offset(6, 6),
            blurRadius: 12,
            spreadRadius: 0,
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFE0E5EC), // Light Neumorphism background
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.white.withOpacity(0.8),
                      offset: const Offset(-3, -3),
                      blurRadius: 6,
                    ),
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      offset: const Offset(3, 3),
                      blurRadius: 6,
                    ),
                  ],
                  border: Border.all(
                    color: colorScheme.primary.withOpacity(0.3),
                    width: 1.5,
                  ),
                ),
                child: Icon(
                  Icons.calendar_today_rounded,
                  color: colorScheme.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Today's Status",
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF2C3E50), // Dark grey for primary text
                            fontSize: 18,
                          ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      DateFormat('EEEE, MMMM dd').format(DateTime.now()),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600], // Lighter grey for secondary text
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              // Refresh button
              InkWell(
                onTap: () {
                  _loadTodayStatus();
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0E5EC),
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.white.withOpacity(0.8),
                        offset: const Offset(-2, -2),
                        blurRadius: 4,
                      ),
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        offset: const Offset(2, 2),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.refresh,
                    color: colorScheme.primary,
                    size: 18,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          if (_todayStatus == null)
            Center(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0E5EC), // Light Neumorphism background
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.white.withOpacity(0.8),
                          offset: const Offset(-4, -4),
                          blurRadius: 8,
                        ),
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          offset: const Offset(4, 4),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.access_time_rounded,
                      size: 48,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Not checked in today',
                    style: TextStyle(
                      fontSize: 16,
                      color: const Color(0xFF2C3E50),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0E5EC), // Light Neumorphism background
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.white.withOpacity(0.8),
                          offset: const Offset(-2, -2),
                          blurRadius: 4,
                        ),
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          offset: const Offset(2, 2),
                          blurRadius: 4,
                        ),
                      ],
                      border: Border.all(
                        color: colorScheme.primary.withOpacity(0.3),
                        width: 1.5,
                      ),
                    ),
                    child: Text(
                      'Scan QR code to check in',
                      style: TextStyle(
                        fontSize: 13,
                        color: colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            Row(
              children: [
                Expanded(
                  child: _buildTimeCardNeumorphic(
                    context: context,
                    colorScheme: colorScheme,
                    icon: Icons.login_rounded,
                    label: 'Check-In',
                    time: _todayStatus!.checkInTime,
                    isActive: _todayStatus!.checkedIn,
                    checkInStatus: _todayStatus!.checkInStatus,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTimeCardNeumorphic(
                    context: context,
                    colorScheme: colorScheme,
                    icon: Icons.logout_rounded,
                    label: 'Check-Out',
                    time: _todayStatus!.checkOutTime,
                    isActive: _todayStatus!.checkedOut,
                    checkInStatus: _todayStatus!.checkOutStatus, // Use checkOutStatus for Check-Out card
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildTimeCardNeumorphic({
    required BuildContext context,
    required ColorScheme colorScheme,
    required IconData icon,
    required String label,
    required DateTime? time,
    required bool isActive,
    String? checkInStatus,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE0E5EC), // Light Neumorphism background
        borderRadius: BorderRadius.circular(16),
        boxShadow: isActive
            ? [
                // Debossed for active state
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  offset: const Offset(2, 2),
                  blurRadius: 4,
                ),
                BoxShadow(
                  color: Colors.white.withOpacity(0.7),
                  offset: const Offset(-2, -2),
                  blurRadius: 4,
                ),
              ]
            : [
                // Embossed for inactive state
                BoxShadow(
                  color: Colors.white.withOpacity(0.8),
                  offset: const Offset(-4, -4),
                  blurRadius: 8,
                ),
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  offset: const Offset(4, 4),
                  blurRadius: 8,
                ),
              ],
        border: Border.all(
          color: isActive 
              ? colorScheme.primary.withOpacity(0.3)
              : Colors.white.withOpacity(0.5),
          width: isActive ? 2 : 1.5,
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFE0E5EC), // Light Neumorphism background
              shape: BoxShape.circle,
              boxShadow: isActive
                  ? [
                      // Embossed effect for active
                      BoxShadow(
                        color: Colors.white.withOpacity(0.8),
                        offset: const Offset(-3, -3),
                        blurRadius: 6,
                      ),
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        offset: const Offset(3, 3),
                        blurRadius: 6,
                      ),
                    ]
                  : [
                      // Debossed effect for inactive
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        offset: const Offset(2, 2),
                        blurRadius: 4,
                      ),
                      BoxShadow(
                        color: Colors.white.withOpacity(0.7),
                        offset: const Offset(-2, -2),
                        blurRadius: 4,
                      ),
                    ],
              border: Border.all(
                color: isActive 
                    ? colorScheme.primary.withOpacity(0.3)
                    : Colors.grey.withOpacity(0.3),
                width: 1.5,
              ),
            ),
            child: Icon(
              icon,
              color: isActive ? colorScheme.primary : Colors.grey[600],
              size: 20,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isActive ? colorScheme.primary : const Color(0xFF7F8C8D),
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            time != null ? DateFormat('HH:mm').format(time) : '--',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isActive ? colorScheme.primary : const Color(0xFF95A5A6),
              letterSpacing: 1,
            ),
          ),
          // Show status badge for both Check-In and Check-Out cards
          if (checkInStatus != null && isActive) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: checkInStatus == 'early'
                    ? (label == 'Check-In' ? Colors.green[100] : Colors.red[100]) // Red for "Left Early"
                    : checkInStatus == 'late'
                        ? Colors.orange[100]
                        : Colors.blue[100],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: checkInStatus == 'early'
                      ? (label == 'Check-In' ? Colors.green[700]! : Colors.red[700]!) // Red for "Left Early"
                      : checkInStatus == 'late'
                          ? Colors.orange[700]!
                          : Colors.blue[700]!,
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    checkInStatus == 'early'
                        ? (label == 'Check-In' ? Icons.trending_up : Icons.trending_down) // Down arrow for "Left Early"
                        : checkInStatus == 'late'
                            ? Icons.trending_up // Up arrow for "Left Late"
                            : Icons.check_circle,
                    size: 12,
                    color: checkInStatus == 'early'
                        ? (label == 'Check-In' ? Colors.green[700] : Colors.red[700]) // Red for "Left Early"
                        : checkInStatus == 'late'
                            ? Colors.orange[700]
                            : Colors.blue[700],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    checkInStatus == 'early'
                        ? (label == 'Check-In' ? 'Early' : 'Left Early')
                        : checkInStatus == 'late'
                            ? (label == 'Check-In' ? 'Late' : 'Left Late')
                            : (label == 'Check-In' ? 'On Time' : 'On Time'),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: checkInStatus == 'early'
                          ? (label == 'Check-In' ? Colors.green[700] : Colors.red[700]) // Red for "Left Early"
                          : checkInStatus == 'late'
                              ? Colors.orange[700]
                              : Colors.blue[700],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSyncCardNeumorphic(BuildContext context, ColorScheme colorScheme) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFE0E5EC), // Light Neumorphism background
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: Colors.orange.withOpacity(0.3),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.white.withOpacity(0.8),
            offset: const Offset(-5, -5),
            blurRadius: 10,
            spreadRadius: 0,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            offset: const Offset(5, 5),
            blurRadius: 10,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFE0E5EC), // Light Neumorphism background
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.white.withOpacity(0.8),
                  offset: const Offset(-3, -3),
                  blurRadius: 6,
                ),
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  offset: const Offset(3, 3),
                  blurRadius: 6,
                ),
              ],
              border: Border.all(
                color: Colors.orange.withOpacity(0.3),
                width: 1.5,
              ),
            ),
            child: Icon(
              Icons.cloud_sync_rounded,
              color: Colors.orange[700],
              size: 20,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Pending Sync',
                  style: TextStyle(
                    color: const Color(0xFF2C3E50),
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${_syncStatus!.pendingCount} record(s) waiting to sync',
                  style: TextStyle(
                    color: Colors.grey[700],
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFE0E5EC), // Light Neumorphism background
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: Colors.white.withOpacity(0.8),
                  offset: const Offset(-2, -2),
                  blurRadius: 4,
                ),
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  offset: const Offset(2, 2),
                  blurRadius: 4,
                ),
              ],
              border: Border.all(
                color: Colors.orange.withOpacity(0.3),
                width: 1.5,
              ),
            ),
            child: IconButton(
              icon: Icon(Icons.sync_rounded, color: Colors.orange[700], size: 20),
              onPressed: _handleManualSync,
              tooltip: 'Sync now',
              padding: const EdgeInsets.all(8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtonNeumorphic({
    required BuildContext context,
    required ColorScheme colorScheme,
    required IconData icon,
    required String label,
    required String description,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFE0E5EC), // Light Neumorphism background
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          // Embossed effect
          BoxShadow(
            color: Colors.white.withOpacity(0.8),
            offset: const Offset(-6, -6),
            blurRadius: 12,
            spreadRadius: 0,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            offset: const Offset(6, 6),
            blurRadius: 12,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(20),
          splashColor: color.withOpacity(0.2),
          highlightColor: color.withOpacity(0.1),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFFE0E5EC), // Same background
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: color.withOpacity(0.3),
                width: 2,
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color, // Primary color background
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.white.withOpacity(0.8),
                        offset: const Offset(-3, -3),
                        blurRadius: 6,
                      ),
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        offset: const Offset(3, 3),
                        blurRadius: 6,
                      ),
                    ],
                  ),
                  child: Icon(
                    icon,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: TextStyle(
                          color: const Color(0xFF2C3E50),
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        description,
                        style: TextStyle(
                          color: Colors.grey[700],
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0E5EC), // Light Neumorphism background
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.white.withOpacity(0.8),
                        offset: const Offset(-2, -2),
                        blurRadius: 4,
                      ),
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        offset: const Offset(2, 2),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.arrow_forward_ios_rounded,
                    color: colorScheme.primary,
                    size: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
