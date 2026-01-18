class Employee {
  final int? id;
  final String employeeId;
  final String name;
  final String email;
  final bool isActive;

  Employee({
    this.id,
    required this.employeeId,
    required this.name,
    required this.email,
    this.isActive = true,
  });

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'] as int?,
      employeeId: json['employeeId'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      isActive: (json['isActive'] as bool?) ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'employeeId': employeeId,
      'name': name,
      'email': email,
      'isActive': isActive,
    };
  }

  Employee copyWith({
    int? id,
    String? employeeId,
    String? name,
    String? email,
    bool? isActive,
  }) {
    return Employee(
      id: id ?? this.id,
      employeeId: employeeId ?? this.employeeId,
      name: name ?? this.name,
      email: email ?? this.email,
      isActive: isActive ?? this.isActive,
    );
  }
}
