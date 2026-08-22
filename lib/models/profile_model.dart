class ProfileModel {
  final String id;
  final String role; // 'student' | 'teacher'
  final String name;
  final String fullName;
  final String username;
  final String? gradeLevel;
  final String? section;
  final String? photoUrl;
  final String? deviceId;
  final DateTime createdAt;

  // Character & Streak Companion fields
  final String? characterName;
  final String? characterOutfit; // 'default' | 'academic' | 'lab_coat' | 'casual' | 'golden'
  final String? characterGender; // 'male' | 'female'
  final int characterXp;
  final String characterStage; // 'baby' | 'student' | 'graduate' | 'worker'
  final String characterMood; // 'idle' | 'happy' | 'excited' | 'sleepy' | 'encouraging'
  final int currentStreak;
  final int longestStreak;
  final String? lastActivityDate; // 'YYYY-MM-DD'
  final DateTime? lastCharacterInteraction;

  final int coins;
  final List<String> unlockedOutfits;

  ProfileModel({
    required this.id,
    required this.role,
    required this.name,
    String? fullName,
    String? username,
    this.gradeLevel,
    this.section,
    this.photoUrl,
    this.deviceId,
    required this.createdAt,
    this.characterName,
    this.characterOutfit = 'default',
    this.characterGender,
    this.characterXp = 0,
    this.characterStage = 'baby',
    this.characterMood = 'idle',
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.lastActivityDate,
    this.lastCharacterInteraction,
    this.coins = 50,
    this.unlockedOutfits = const ['default'],
  })  : fullName = (fullName != null && fullName.isNotEmpty) ? fullName : name,
        username = username ?? '';

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    final realNameStr = (json['real_name'] as String?) ?? (json['full_name'] as String?) ?? (json['name'] as String?) ?? 'User';
    final nicknameStr = (json['nickname'] as String?) ?? (json['username'] as String?) ?? '';
    return ProfileModel(
      id: json['id'] as String,
      role: json['role'] as String? ?? 'student',
      name: realNameStr,
      fullName: realNameStr,
      username: nicknameStr,
      gradeLevel: json['grade_level'] as String?,
      section: json['section'] as String?,
      photoUrl: json['photo_url'] as String?,
      deviceId: json['device_id'] as String?,
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      characterName: json['character_name'] as String?,
      characterOutfit: json['character_outfit'] as String? ?? 'default',
      characterGender: json['character_gender'] as String?,
      characterXp: json['character_xp'] as int? ?? 0,
      characterStage: json['character_stage'] as String? ?? 'baby',
      characterMood: json['character_mood'] as String? ?? 'idle',
      currentStreak: json['current_streak'] as int? ?? 0,
      longestStreak: json['longest_streak'] as int? ?? 0,
      lastActivityDate: json['last_activity_date'] as String?,
      lastCharacterInteraction: json['last_character_interaction'] != null
          ? DateTime.parse(json['last_character_interaction'] as String)
          : null,
      coins: json['coins'] as int? ?? 50,
      unlockedOutfits: (json['unlocked_outfits'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const ['default'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role,
      'name': name,
      'real_name': name,
      'full_name': fullName,
      'nickname': username,
      'username': username,
      'grade_level': gradeLevel,
      'section': section,
      'photo_url': photoUrl,
      'device_id': deviceId,
      'created_at': createdAt.toIso8601String(),
      'character_name': characterName,
      'character_outfit': characterOutfit,
      'character_gender': characterGender,
      'character_xp': characterXp,
      'character_stage': characterStage,
      'character_mood': characterMood,
      'current_streak': currentStreak,
      'longest_streak': longestStreak,
      'last_activity_date': lastActivityDate,
      'last_character_interaction': lastCharacterInteraction?.toIso8601String(),
      'coins': coins,
      'unlocked_outfits': unlockedOutfits,
    };
  }

  ProfileModel copyWith({
    String? id,
    String? role,
    String? name,
    String? fullName,
    String? username,
    String? gradeLevel,
    String? section,
    String? photoUrl,
    String? deviceId,
    DateTime? createdAt,
    String? characterName,
    String? characterOutfit,
    String? characterGender,
    int? characterXp,
    String? characterStage,
    String? characterMood,
    int? currentStreak,
    int? longestStreak,
    String? lastActivityDate,
    DateTime? lastCharacterInteraction,
    int? coins,
    List<String>? unlockedOutfits,
  }) {
    return ProfileModel(
      id: id ?? this.id,
      role: role ?? this.role,
      name: name ?? this.name,
      fullName: fullName ?? this.fullName,
      username: username ?? this.username,
      gradeLevel: gradeLevel ?? this.gradeLevel,
      section: section ?? this.section,
      photoUrl: photoUrl ?? this.photoUrl,
      deviceId: deviceId ?? this.deviceId,
      createdAt: createdAt ?? this.createdAt,
      characterName: characterName ?? this.characterName,
      characterOutfit: characterOutfit ?? this.characterOutfit,
      characterGender: characterGender ?? this.characterGender,
      characterXp: characterXp ?? this.characterXp,
      characterStage: characterStage ?? this.characterStage,
      characterMood: characterMood ?? this.characterMood,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      lastActivityDate: lastActivityDate ?? this.lastActivityDate,
      lastCharacterInteraction: lastCharacterInteraction ?? this.lastCharacterInteraction,
      coins: coins ?? this.coins,
      unlockedOutfits: unlockedOutfits ?? this.unlockedOutfits,
    );
  }
}


