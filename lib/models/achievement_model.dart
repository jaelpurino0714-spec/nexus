class AchievementModel {
  final String id;
  final String title;
  final String description;
  final String icon;
  final String requirementType;
  final int requirementValue;
  final String category;
  final String rarity;
  final bool isUnlocked;
  final DateTime? unlockedAt;

  AchievementModel({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.requirementType,
    required this.requirementValue,
    this.category = 'general',
    this.rarity = 'bronze',
    this.isUnlocked = false,
    this.unlockedAt,
  });

  factory AchievementModel.fromJson(Map<String, dynamic> json, {bool isUnlocked = false, DateTime? unlockedAt}) {
    return AchievementModel(
      id: json['id'] as String,
      title: (json['title'] ?? json['name'] ?? '') as String,
      description: (json['description'] ?? json['desc'] ?? '') as String,
      icon: (json['icon'] ?? '🏆') as String,
      requirementType: (json['requirement_type'] ?? json['statKey'] ?? '') as String,
      requirementValue: ((json['requirement_value'] ?? json['target'] ?? 1) as num).toInt(),
      category: (json['category'] ?? 'general') as String,
      rarity: (json['rarity'] ?? 'bronze') as String,
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
      'category': category,
      'rarity': rarity,
    };
  }
}
