import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/sync_service.dart';
import '../services/attendance_service.dart';

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
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

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
    
    _loadTodayStatus();
    _loadSyncStatus();
    
    // Start auto-sync
    _syncService.startAutoSync();
    
    // Listen to sync events
    _syncService.addSyncListener(_onSyncComplete);
  }

  @override
  void dispose() {
    _animationController.dispose();
    _syncService.stopAutoSync();
    super.dispose();
  }

  Future<void> _loadTodayStatus() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    
    if (user != null) {
      final employeeId = user.employeeId ?? user.id;
      final status = await _attendanceService.getTodayStatus(employeeId);
      
      if (mounted) {
        setState(() {
          _todayStatus = status;
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

  void _onSyncComplete(SyncResult result) {
    if (mounted) {
      _loadSyncStatus();
      
      if (result.syncedCount > 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.message),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Future<void> _handleManualSync() async {
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
            Text('Syncing...'),
          ],
        ),
        duration: Duration(seconds: 30),
      ),
    );

    final result = await _syncService.manualSync();
    
    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message),
          backgroundColor: result.success ? Colors.green : Colors.orange,
          duration: const Duration(seconds: 3),
        ),
      );
      
      _loadSyncStatus();
      _loadTodayStatus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: CustomScrollView(
          slivers: [
            // App Bar with gradient
            SliverAppBar(
              expandedHeight: 200,
              floating: false,
              pinned: true,
              elevation: 0,
              backgroundColor: colorScheme.primary,
              flexibleSpace: FlexibleSpaceBar(
                titlePadding: EdgeInsets.zero,
                centerTitle: false,
                title: Container(
                  padding: const EdgeInsets.only(left: 16, bottom: 16),
                  alignment: Alignment.bottomLeft,
                  child: const Text(
                    'Attendance',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
                  ),
                ),
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        colorScheme.primary,
                        colorScheme.primary.withOpacity(0.8),
                        colorScheme.secondary,
                      ],
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(24.0, 24.0, 24.0, 80.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.person,
                                  color: Colors.white,
                                  size: 24,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Welcome back,',
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(0.9),
                                        fontSize: 14,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      user?.name ?? 'Employee',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 16),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.logout, color: Colors.white),
                                onPressed: () async {
                                  await authProvider.logout();
                                  if (context.mounted) {
                                    Navigator.of(context).pushReplacementNamed('/login');
                                  }
                                },
                                tooltip: 'Logout',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            
            // Main Content
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 8),
                    
                    // Today's Status Card - Redesigned
                    if (!_isLoadingStatus)
                      _buildStatusCard(context, colorScheme),
                    
                    const SizedBox(height: 24),
                    
                    // Sync Status Card
                    if (_syncStatus != null && _syncStatus!.pendingCount > 0)
                      _buildSyncCard(context, colorScheme),
                    
                    const SizedBox(height: 32),
                    
                    // Action Buttons - Redesigned
                    _buildActionButton(
                      context: context,
                      colorScheme: colorScheme,
                      icon: Icons.qr_code_scanner_rounded,
                      label: 'Scan QR Code',
                      description: 'Record your attendance',
                      color: colorScheme.primary,
                      onPressed: () => Navigator.of(context).pushNamed('/scanner'),
                    ),
                    
                    // View History - Only visible to admin
                    if (user?.role == 'admin') ...[
                      const SizedBox(height: 16),
                      _buildActionButton(
                        context: context,
                        colorScheme: colorScheme,
                        icon: Icons.history_rounded,
                        label: 'View History',
                        description: 'Check past attendance records',
                        color: colorScheme.secondary,
                        onPressed: () => Navigator.of(context).pushNamed('/history'),
                      ),
                    ],
                    
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context, ColorScheme colorScheme) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white,
            colorScheme.primary.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.calendar_today_rounded,
                  color: colorScheme.primary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                "Today's Status",
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[900],
                    ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (_todayStatus == null)
            Center(
              child: Column(
                children: [
                  Icon(
                    Icons.access_time_rounded,
                    size: 48,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Not checked in today',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            )
          else
            Row(
              children: [
                Expanded(
                  child: _buildTimeCard(
                    context: context,
                    colorScheme: colorScheme,
                    icon: Icons.login_rounded,
                    label: 'Check-In',
                    time: _todayStatus!.checkInTime,
                    isActive: _todayStatus!.checkedIn,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildTimeCard(
                    context: context,
                    colorScheme: colorScheme,
                    icon: Icons.logout_rounded,
                    label: 'Check-Out',
                    time: _todayStatus!.checkOutTime,
                    isActive: _todayStatus!.checkedOut,
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildTimeCard({
    required BuildContext context,
    required ColorScheme colorScheme,
    required IconData icon,
    required String label,
    required DateTime? time,
    required bool isActive,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isActive 
            ? colorScheme.primary.withOpacity(0.1)
            : Colors.grey[100],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive 
              ? colorScheme.primary.withOpacity(0.3)
              : Colors.grey[300]!,
          width: 1.5,
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isActive 
                  ? colorScheme.primary
                  : Colors.grey[400],
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 20,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            time != null ? DateFormat('HH:mm').format(time) : '--',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isActive ? colorScheme.primary : Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSyncCard(BuildContext context, ColorScheme colorScheme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.orange[200]!,
          width: 1.5,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.orange[100],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.cloud_off_rounded,
              color: Colors.orange[700],
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Pending Sync',
                  style: TextStyle(
                    color: Colors.orange[900],
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${_syncStatus!.pendingCount} record(s) waiting',
                  style: TextStyle(
                    color: Colors.orange[800],
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(Icons.sync_rounded, color: Colors.orange[700]),
            onPressed: _handleManualSync,
            tooltip: 'Sync now',
            style: IconButton.styleFrom(
              backgroundColor: Colors.orange[100],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
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
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  color,
                  color.withOpacity(0.8),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
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
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        description,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
