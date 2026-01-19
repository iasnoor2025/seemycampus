import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';
import '../models/attendance_record.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() => _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  final StorageService _storageService = StorageService();
  final ApiService _apiService = ApiService();
  List<AttendanceRecord> _allRecords = []; // Store all records
  List<AttendanceRecord> _filteredRecords = []; // Filtered records to display
  List<Map<String, dynamic>> _employees = []; // List of employees for filter
  DateTime? _selectedMonth; // Selected month for filtering
  String? _selectedEmployeeId; // Selected employee ID for filtering
  bool _isLoading = true;
  bool _isLoadingEmployees = false;

  @override
  void initState() {
    super.initState();
    _selectedMonth = DateTime.now(); // Default to current month
    _loadEmployees();
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user;
      
      if (user == null) {
        setState(() {
          _isLoading = false;
        });
        return;
      }

      List<AttendanceRecord> records = [];

      // Only admins can view attendance history
      if (user.role == 'admin') {
        try {
          final response = await _apiService.get(
            ApiConfig.allRecordsEndpoint,
            userEmail: user.email,
            userRole: user.role,
          );
          
          if (response['success'] == true && response['records'] != null) {
            final List<dynamic> recordsData = response['records'] as List<dynamic>;
            records = recordsData.map((recordData) {
              // Parse date string (YYYY-MM-DD)
              final dateParts = (recordData['date'] as String).split('-');
              final date = DateTime(
                int.parse(dateParts[0]),
                int.parse(dateParts[1]),
                int.parse(dateParts[2]),
              );
              
              // Parse time strings (HH:MM:SS or HH:MM)
              DateTime? checkInTime;
              DateTime? checkOutTime;
              
              if (recordData['checkInTime'] != null) {
                final timeStr = recordData['checkInTime'] as String;
                final timeParts = timeStr.split(':');
                checkInTime = DateTime(
                  date.year,
                  date.month,
                  date.day,
                  int.parse(timeParts[0]),
                  int.parse(timeParts[1]),
                );
              }
              
              if (recordData['checkOutTime'] != null) {
                final timeStr = recordData['checkOutTime'] as String;
                final timeParts = timeStr.split(':');
                checkOutTime = DateTime(
                  date.year,
                  date.month,
                  date.day,
                  int.parse(timeParts[0]),
                  int.parse(timeParts[1]),
                );
              }

              return AttendanceRecord(
                id: recordData['id'] as int?,
                employeeId: recordData['employeeId']?.toString() ?? '',
                employeeName: recordData['employeeName'] as String? ?? 'Unknown',
                date: date,
                checkInTime: checkInTime,
                checkOutTime: checkOutTime,
                status: recordData['status'] as String? ?? 'present',
                syncedToServer: true,
                createdAt: recordData['createdAt'] != null
                    ? DateTime.parse(recordData['createdAt'] as String)
                    : DateTime.now(),
                updatedAt: recordData['updatedAt'] != null
                    ? DateTime.parse(recordData['updatedAt'] as String)
                    : DateTime.now(),
              );
            }).toList();
          }
        } catch (e) {
          print('Error fetching records from API: $e');
          print('Error details: ${e.toString()}');
          // Show error to user
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Failed to load records: ${e.toString()}'),
                backgroundColor: Colors.red,
                duration: const Duration(seconds: 5),
              ),
            );
          }
          // Fall back to empty list for admin if API fails
          records = [];
        }
      }
      // Employees cannot view attendance history - show empty state
      
      setState(() {
        _allRecords = records;
        _applyFilters();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading records: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('MMM dd, yyyy').format(date);
  }

  String _formatTime(DateTime? time) {
    if (time == null) return '--';
    return DateFormat('HH:mm').format(time);
  }

  Widget _buildRecordsList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_filteredRecords.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF252538),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.white.withOpacity(0.05),
                      offset: const Offset(-4, -4),
                      blurRadius: 8,
                    ),
                    BoxShadow(
                      color: Colors.black.withOpacity(0.5),
                      offset: const Offset(4, 4),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: Icon(
                  Icons.history,
                  size: 64,
                  color: Colors.grey[500],
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'No attendance records',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2C3E50),
                ),
              ),
              const SizedBox(height: 8),
              Builder(
                builder: (context) {
                  final user = Provider.of<AuthProvider>(context, listen: false).user;
                  final isAdmin = user?.role == 'admin';
                  
                  return Column(
                    children: [
                      Text(
                        isAdmin
                            ? 'No attendance records found'
                            : 'Attendance history is only available to administrators',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                      if (!isAdmin) ...[
                        const SizedBox(height: 32),
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.white.withOpacity(0.05),
                                offset: const Offset(-4, -4),
                                blurRadius: 8,
                              ),
                              BoxShadow(
                                color: Colors.black.withOpacity(0.5),
                                offset: const Offset(4, 4),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.of(context).pop();
                            },
                            icon: const Icon(Icons.arrow_back),
                            label: const Text('Go Back'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey[700],
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 12,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: BorderSide(
                                  color: Colors.grey.withOpacity(0.3),
                                  width: 1.5,
                                ),
                              ),
                              elevation: 0,
                            ),
                          ),
                        ),
                      ] else ...[
                        const SizedBox(height: 32),
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.white.withOpacity(0.05),
                                offset: const Offset(-4, -4),
                                blurRadius: 8,
                              ),
                              BoxShadow(
                                color: Colors.black.withOpacity(0.5),
                                offset: const Offset(4, 4),
                                blurRadius: 8,
                              ),
                              BoxShadow(
                                color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                                blurRadius: 15,
                                offset: const Offset(0, 0),
                              ),
                            ],
                          ),
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.of(context).pushReplacementNamed('/scanner');
                            },
                            icon: const Icon(Icons.qr_code_scanner),
                            label: const Text('Scan QR Code'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Theme.of(context).colorScheme.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 12,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: BorderSide(
                                  color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                                  width: 1.5,
                                ),
                              ),
                              elevation: 0,
                            ),
                          ),
                        ),
                      ],
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadRecords,
      child: ListView.builder(
        padding: const EdgeInsets.all(8),
        itemCount: _filteredRecords.length,
        itemBuilder: (context, index) {
          final record = _filteredRecords[index];
          return Card(
            margin: const EdgeInsets.symmetric(
              horizontal: 8,
              vertical: 4,
            ),
            color: const Color(0xFFE0E5EC), // Light Neumorphism background
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(
                color: Colors.white.withOpacity(0.5),
                width: 1,
              ),
            ),
            child: ListTile(
              textColor: const Color(0xFF2C3E50),
              iconColor: const Color(0xFF2C3E50),
              leading: CircleAvatar(
                backgroundColor: record.checkOutTime != null
                    ? Colors.green
                    : Colors.orange,
                child: Icon(
                  record.checkOutTime != null
                      ? Icons.check_circle
                      : Icons.access_time,
                  color: Colors.white,
                ),
              ),
              title: Builder(
                builder: (context) {
                  final user = Provider.of<AuthProvider>(context, listen: false).user;
                  final isAdmin = user?.role == 'admin';
                  
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _formatDate(record.date),
                        style: const TextStyle(color: Color(0xFF2C3E50)),
                      ),
                      if (isAdmin && record.employeeName.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            record.employeeName,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.login, size: 16, color: Colors.green[700]),
                      const SizedBox(width: 4),
                      Text(
                        'In: ${_formatTime(record.checkInTime)}',
                        style: TextStyle(
                          color: const Color(0xFF2C3E50),
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.logout, size: 16, color: Colors.orange[700]),
                      const SizedBox(width: 4),
                      Text(
                        'Out: ${_formatTime(record.checkOutTime)}',
                        style: TextStyle(
                          color: const Color(0xFF2C3E50),
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  if (!record.syncedToServer)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Row(
                        children: [
                          Icon(
                            Icons.cloud_off,
                            size: 14,
                            color: Colors.orange[700],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Pending sync',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.orange[700],
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              trailing: Chip(
                label: Text(
                  record.status.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 10,
                    color: Color(0xFF2C3E50),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                backgroundColor: record.status == 'present'
                    ? Colors.green.withOpacity(0.3)
                    : Colors.grey.withOpacity(0.3),
                side: BorderSide(
                  color: record.status == 'present'
                      ? Colors.green.withOpacity(0.5)
                      : Colors.grey.withOpacity(0.5),
                  width: 1,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _loadEmployees() async {
    setState(() {
      _isLoadingEmployees = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user;
      
      if (user == null || user.role != 'admin') {
        setState(() {
          _isLoadingEmployees = false;
        });
        return;
      }

      final response = await _apiService.get(
        ApiConfig.employeesEndpoint,
        userEmail: user.email,
        userRole: user.role,
      );

      print('[Employees] API Response: ${response.toString()}');

      if (response['success'] == true && response['employees'] != null) {
        final List<dynamic> employeesData = response['employees'] as List<dynamic>;
        print('[Employees] Found ${employeesData.length} employees');
        setState(() {
          _employees = employeesData.map<Map<String, dynamic>>((emp) => <String, dynamic>{
            'id': emp['id'],
            'name': emp['name'] ?? 'Unknown',
            'email': emp['email'] ?? '',
            'employeeId': emp['employeeId']?.toString() ?? '',
          }).toList();
          _isLoadingEmployees = false;
        });
        print('[Employees] Employee list: ${_employees.map((e) => '${e['name']}: id=${e['id']}, employeeId=${e['employeeId']}').join(', ')}');
        print('[Employees] Loaded ${_employees.length} employees into dropdown');
      } else {
        print('[Employees] API response missing success or employees data');
        setState(() {
          _isLoadingEmployees = false;
        });
      }
    } catch (e) {
      print('Error loading employees: $e');
      print('Error details: ${e.toString()}');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load employees: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
      setState(() {
        _isLoadingEmployees = false;
      });
    }
  }

  void _applyFilters() {
    List<AttendanceRecord> filtered = List.from(_allRecords);

    // Filter by month
    if (_selectedMonth != null) {
      filtered = filtered.where((record) {
        return record.date.year == _selectedMonth!.year &&
               record.date.month == _selectedMonth!.month;
      }).toList();
    }

    // Filter by employee
    if (_selectedEmployeeId != null && _selectedEmployeeId!.isNotEmpty) {
      print('[Filter] Filtering by employeeId: $_selectedEmployeeId (type: ${_selectedEmployeeId.runtimeType})');
      print('[Filter] Total records before filter: ${filtered.length}');
      print('[Filter] Sample record employeeIds: ${filtered.take(3).map((r) => '${r.employeeName}: ${r.employeeId} (type: ${r.employeeId.runtimeType})').join(', ')}');
      filtered = filtered.where((record) {
        // Compare as strings to handle type mismatches
        final recordEmpId = record.employeeId.toString().trim();
        final selectedEmpId = _selectedEmployeeId!.toString().trim();
        final matches = recordEmpId == selectedEmpId;
        if (matches) {
          print('[Filter] Match found: ${record.employeeName} (record.employeeId: $recordEmpId == selected: $selectedEmpId)');
        }
        return matches;
      }).toList();
      print('[Filter] Total records after filter: ${filtered.length}');
    }

    setState(() {
      _filteredRecords = filtered;
    });
  }

  void _onMonthChanged(DateTime? month) {
    setState(() {
      _selectedMonth = month;
    });
    _applyFilters();
  }

  void _onEmployeeChanged(String? employeeId) {
    print('[Employee Changed] Selected employeeId: $employeeId');
    print('[Employee Changed] Current _selectedEmployeeId before: $_selectedEmployeeId');
    setState(() {
      _selectedEmployeeId = employeeId;
    });
    print('[Employee Changed] Current _selectedEmployeeId after: $_selectedEmployeeId');
    _applyFilters();
  }

  Widget _buildFilterBar() {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE0E5EC), // Light Neumorphism background
        boxShadow: [
          BoxShadow(
            color: Colors.white.withOpacity(0.8),
            offset: const Offset(0, -2),
            blurRadius: 8,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            offset: const Offset(0, 2),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.filter_list, color: colorScheme.primary, size: 20),
              const SizedBox(width: 8),
              Text(
                'Filters',
                style: TextStyle(
                  color: const Color(0xFF2C3E50),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              // Month Filter
              Flexible(
                flex: 2,
                child: Container(
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
                  ),
                  child: InkWell(
                    onTap: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: _selectedMonth ?? DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime.now(),
                        initialDatePickerMode: DatePickerMode.year,
                        helpText: 'Select Month',
                        builder: (context, child) {
                          return Theme(
                            data: Theme.of(context).copyWith(
                              colorScheme: ColorScheme.dark(
                                primary: colorScheme.primary,
                                onPrimary: Colors.white,
                                surface: const Color(0xFF252538),
                                onSurface: Colors.white,
                              ),
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (picked != null) {
                        _onMonthChanged(DateTime(picked.year, picked.month));
                      }
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.calendar_today, color: colorScheme.primary, size: 16),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              _selectedMonth != null
                                  ? DateFormat('MMM yyyy').format(_selectedMonth!)
                                  : 'Month',
                              style: const TextStyle(
                                color: Color(0xFF2C3E50),
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(Icons.arrow_drop_down, color: Colors.grey[600], size: 20),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Employee Filter
              Flexible(
                flex: 2,
                child: Container(
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
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedEmployeeId, // This should be the employee's database id as string
                      isExpanded: true,
                      // Ensure the dropdown shows the selected value even if employees haven't loaded yet
                      hint: null, // Remove hint since we're using selectedItemBuilder
                      items: [
                        DropdownMenuItem<String>(
                          value: null,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.people, color: colorScheme.primary, size: 16),
                                const SizedBox(width: 8),
                                Flexible(
                                  child: Text(
                                    'All Employees',
                                    style: const TextStyle(color: Color(0xFF2C3E50), fontSize: 13),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        if (_employees.isEmpty)
                          DropdownMenuItem<String>(
                            value: '__no_employees__',
                            enabled: false,
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                'No employees found',
                                style: TextStyle(color: Colors.grey[500], fontSize: 13),
                              ),
                            ),
                          )
                        else
                          ..._employees.map((employee) {
                            // Use database id for filtering (matches API employeeId field)
                            final empId = employee['id'].toString();
                            print('[Dropdown] Adding employee: ${employee['name']} with id: $empId');
                            return DropdownMenuItem<String>(
                              value: empId,
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                employee['name'] ?? 'Unknown',
                                style: const TextStyle(color: Color(0xFF2C3E50), fontSize: 13),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          );
                        }),
                      ],
                      onChanged: (value) {
                        print('[Dropdown onChanged] Value selected: $value');
                        if (value != '__no_employees__') {
                          _onEmployeeChanged(value);
                        } else {
                          print('[Dropdown onChanged] Ignoring __no_employees__ value');
                        }
                      },
                      dropdownColor: const Color(0xFFE0E5EC), // Light Neumorphism background
                      icon: Icon(Icons.arrow_drop_down, color: Colors.grey[600], size: 20),
                      style: const TextStyle(color: Color(0xFF2C3E50), fontSize: 13),
                      selectedItemBuilder: (BuildContext context) {
                        // selectedItemBuilder must return a list with the same length as items
                        // It's called for each item, but we only care about the selected one
                        print('[selectedItemBuilder] _selectedEmployeeId: $_selectedEmployeeId');
                        
                        // Build widgets for all items, but only the selected one will be displayed
                        final List<Widget> builders = [];
                        
                        // First item: "All Employees" (value: null)
                        builders.add(
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.person, color: colorScheme.primary, size: 16),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    'All',
                                    style: const TextStyle(
                                      color: Color(0xFF2C3E50),
                                      fontSize: 13,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                        
                        // Add builders for each employee
                        for (var employee in _employees) {
                          builders.add(
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.person, color: colorScheme.primary, size: 16),
                                  const SizedBox(width: 6),
                                  Flexible(
                                    child: Text(
                                      employee['name'] ?? 'Unknown',
                                      style: const TextStyle(color: Color(0xFF2C3E50), fontSize: 13),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }
                        
                        print('[selectedItemBuilder] Returning ${builders.length} builders');
                        return builders;
                      },
                    ),
                  ),
                ),
              ),
              // Clear Filters Button
              if (_selectedMonth != null || (_selectedEmployeeId != null && _selectedEmployeeId!.isNotEmpty)) ...[
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[700],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.grey.withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.clear, color: Colors.white, size: 18),
                    onPressed: () {
                      setState(() {
                        _selectedMonth = DateTime.now();
                        _selectedEmployeeId = null;
                      });
                      _applyFilters();
                    },
                    tooltip: 'Clear Filters',
                    padding: const EdgeInsets.all(8),
                    constraints: const BoxConstraints(
                      minWidth: 40,
                      minHeight: 40,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE0E5EC), // Light Neumorphism background
      appBar: AppBar(
        backgroundColor: const Color(0xFFE0E5EC),
        elevation: 0,
        title: const Text(
          'Attendance History',
          style: TextStyle(color: Color(0xFF2C3E50)),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFE0E5EC), // Light Neumorphism background
              shape: BoxShape.circle,
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
            child: IconButton(
              icon: Icon(Icons.refresh, color: Theme.of(context).colorScheme.primary),
              onPressed: _loadRecords,
              tooltip: 'Refresh',
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Bar
          if (!_isLoading) _buildFilterBar(),
          // Records List
          Expanded(
            child: _buildRecordsList(),
          ),
        ],
      ),
    );
  }
}
