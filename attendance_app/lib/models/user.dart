class User {
  final String id;
  final String email;
  final String name;
  final String? employeeId;
  final String role;

  User({
    required this.id,
    required this.email,
    required this.name,
    this.employeeId,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      employeeId: json['employeeId'] as String?,
      role: json['role'] as String? ?? 'employee',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'employeeId': employeeId,
      'role': role,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? name,
    String? employeeId,
    String? role,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      employeeId: employeeId ?? this.employeeId,
      role: role ?? this.role,
    );
  }
}
