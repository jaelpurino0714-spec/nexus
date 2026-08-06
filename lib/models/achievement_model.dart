class AchievementModel {
  final String id;
  final String title;
  final String description;
  final String icon;
  final String requirementType;
  final int requirementValue;
  final bool isUnlocked;
  final DateTime? unlockedAt;

  AchievementModel({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.requirementType,
    required this.requirementValue,
    this.isUnlocked = false,
    this.unlockedAt,
  });

  factory AchievementModel.fromJson(Map<String, dynamic> json, {bool isUnlocked = false, DateTime? unlockedAt}) {
    return AchievementModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      icon: json['icon'] as String,
      requirementType: json['requirement_type'] as String,
      requirementValue: (json['requirement_value'] as num).toInt(),
      isUnlocked: isUnlocked,
      unlockedAt: unlockedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'icon': icon,
      'requirement_type': requirementType,
      'requirement_value': requirementValue,
    };
  }
}
