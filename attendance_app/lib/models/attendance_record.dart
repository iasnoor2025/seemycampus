class AttendanceRecord {
  final int? id;
  final String employeeId;
  final String employeeName;
  final DateTime date;
  final DateTime? checkInTime;
  final DateTime? checkOutTime;
  final String status; // "present", "absent", "late"
  final bool syncedToServer;
  final String? qrCodeData; // Original QR code data for syncing
  final DateTime createdAt;
  final DateTime? updatedAt;

  AttendanceRecord({
    this.id,
    required this.employeeId,
    required this.employeeName,
    required this.date,
    this.checkInTime,
    this.checkOutTime,
    required this.status,
    this.syncedToServer = false,
    this.qrCodeData,
    required this.createdAt,
    this.updatedAt,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id: json['id'] as int?,
      employeeId: json['employeeId'] as String,
      employeeName: json['employeeName'] as String,
      date: DateTime.parse(json['date'] as String),
      checkInTime: json['checkInTime'] != null
          ? DateTime.parse(json['checkInTime'] as String)
          : null,
      checkOutTime: json['checkOutTime'] != null
          ? DateTime.parse(json['checkOutTime'] as String)
          : null,
      status: json['status'] as String,
      syncedToServer: (json['syncedToServer'] as bool?) ?? false,
      qrCodeData: json['qrCodeData'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'employeeId': employeeId,
      'employeeName': employeeName,
      'date': date.toIso8601String().split('T')[0], // YYYY-MM-DD
      'checkInTime': checkInTime?.toIso8601String(),
      'checkOutTime': checkOutTime?.toIso8601String(),
      'status': status,
      'syncedToServer': syncedToServer,
      'qrCodeData': qrCodeData,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'employee_id': employeeId,
      'employee_name': employeeName,
      'date': date.toIso8601String().split('T')[0],
      'check_in_time': checkInTime?.toIso8601String(),
      'check_out_time': checkOutTime?.toIso8601String(),
      'status': status,
      'synced_to_server': syncedToServer ? 1 : 0,
      'qr_code_data': qrCodeData,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  factory AttendanceRecord.fromMap(Map<String, dynamic> map) {
    return AttendanceRecord(
      id: map['id'] as int?,
      employeeId: map['employee_id'] as String,
      employeeName: map['employee_name'] as String,
      date: DateTime.parse(map['date'] as String),
      checkInTime: map['check_in_time'] != null
          ? DateTime.parse(map['check_in_time'] as String)
          : null,
      checkOutTime: map['check_out_time'] != null
          ? DateTime.parse(map['check_out_time'] as String)
          : null,
      status: map['status'] as String,
      syncedToServer: (map['synced_to_server'] as int? ?? 0) == 1,
      qrCodeData: map['qr_code_data'] as String?,
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: map['updated_at'] != null
          ? DateTime.parse(map['updated_at'] as String)
          : null,
    );
  }

  AttendanceRecord copyWith({
    int? id,
    String? employeeId,
    String? employeeName,
    DateTime? date,
    DateTime? checkInTime,
    DateTime? checkOutTime,
    String? status,
    bool? syncedToServer,
    String? qrCodeData,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return AttendanceRecord(
      id: id ?? this.id,
      employeeId: employeeId ?? this.employeeId,
      employeeName: employeeName ?? this.employeeName,
      date: date ?? this.date,
      checkInTime: checkInTime ?? this.checkInTime,
      checkOutTime: checkOutTime ?? this.checkOutTime,
      status: status ?? this.status,
      syncedToServer: syncedToServer ?? this.syncedToServer,
      qrCodeData: qrCodeData ?? this.qrCodeData,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
