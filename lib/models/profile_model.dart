class ProfileModel {
  final String id;
  final String role; // 'student' | 'teacher'
  final String name;
  final String? gradeLevel;
  final String? section;
  final String? photoUrl;
  final String? deviceId;
  final DateTime createdAt;

  ProfileModel({
    required this.id,
    required this.role,
    required this.name,
    this.gradeLevel,
    this.section,
    this.photoUrl,
    this.deviceId,
    required this.createdAt,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'] as String,
      role: json['role'] as String,
      name: json['name'] as String,
      gradeLevel: json['grade_level'] as String?,
      section: json['section'] as String?,
      photoUrl: json['photo_url'] as String?,
      deviceId: json['device_id'] as String?,
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role,
      'name': name,
      'grade_level': gradeLevel,
      'section': section,
      'photo_url': photoUrl,
      'device_id': deviceId,
      'created_at': createdAt.toIso8601String(),
    };
  }

  ProfileModel copyWith({
    String? id,
    String? role,
    String? name,
    String? gradeLevel,
    String? section,
    String? photoUrl,
    String? deviceId,
    DateTime? createdAt,
  }) {
    return ProfileModel(
      id: id ?? this.id,
      role: role ?? this.role,
      name: name ?? this.name,
      gradeLevel: gradeLevel ?? this.gradeLevel,
      section: section ?? this.section,
      photoUrl: photoUrl ?? this.photoUrl,
      deviceId: deviceId ?? this.deviceId,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
