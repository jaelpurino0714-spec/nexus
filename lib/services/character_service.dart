import 'dart:math';

class EvolutionStageConfig {
  final String id;
  final int stage;
  final String title;
  final String icon;
  final int minXP;
  final int nextXP;
  final String colorHex;
  final String defaultQuote;
  final String description;

  const EvolutionStageConfig({
    required this.id,
    required this.stage,
    required this.title,
    required this.icon,
    required this.minXP,
    required this.nextXP,
    required this.colorHex,
    required this.defaultQuote,
    required this.description,
  });
}

class OutfitConfig {
  final String id;
  final String name;
  final String icon;
  final String description;
  final int requiredStage;
  final int priceCoins;

  const OutfitConfig({
    required this.id,
    required this.name,
    required this.icon,
    required this.description,
    required this.requiredStage,
    this.priceCoins = 0,
  });
}

class GrowthTaskConfig {
  final String id;
  final String title;
  final int growthPoints;
  final String actionRoute;
  final String actionLabel;
  final int targetCount;
  final bool isDaily;

  const GrowthTaskConfig({
    required this.id,
    required this.title,
    required this.growthPoints,
    required this.actionRoute,
    required this.actionLabel,
    this.targetCount = 1,
    this.isDaily = true,
  });
}

class CharacterService {
  static final CharacterService instance = CharacterService._internal();
  CharacterService._internal();

  static const List<EvolutionStageConfig> stages = [
    EvolutionStageConfig(
      id: 'baby',
      stage: 1,
      title: 'BABY',
      icon: '👶',
      minXP: 0,
      nextXP: 100,
      colorHex: '#38BDF8',
      defaultQuote: "Let's grow together!",
      description: 'Focusing on earning 100 XP to evolve into Student!',
    ),
    EvolutionStageConfig(
      id: 'student',
      stage: 2,
      title: 'STUDENT',
      icon: '🎒',
      minXP: 100,
      nextXP: 300,
      colorHex: '#10B981',
      defaultQuote: "Studying core Grade 10 concepts!",
      description: 'Learning core Grade 10 Science topics!',
    ),
    EvolutionStageConfig(
      id: 'graduate',
      stage: 3,
      title: 'GRADUATE',
      icon: '🎓',
      minXP: 300,
      nextXP: 600,
      colorHex: '#8B5CF6',
      defaultQuote: "Mastering trivia & simulations!",
      description: 'Mastered science trivia & simulations!',
    ),
    EvolutionStageConfig(
      id: 'worker',
      stage: 4,
      title: 'WORKER',
      icon: '💼',
      minXP: 600,
      nextXP: 999999,
      colorHex: '#F59E0B',
      defaultQuote: "Working hard & applying science knowledge!",
      description: 'Science Professional & Industry Worker!',
    ),
  ];

  static const List<OutfitConfig> outfits = [
    OutfitConfig(
      id: 'default',
      name: 'Standard Uniform',
      icon: '🎒',
      description: 'Classic Nexus student uniform',
      requiredStage: 1,
      priceCoins: 0,
    ),
    OutfitConfig(
      id: 'explorer',
      name: 'Explorer Gear',
      icon: '🤠',
      description: 'Outdoor field research & exploration gear',
      requiredStage: 1,
      priceCoins: 40,
    ),
    OutfitConfig(
      id: 'lab_coat',
      name: 'Science Lab Coat',
      icon: '🥼',
      description: 'Professional research & lab gear',
      requiredStage: 2,
      priceCoins: 50,
    ),
    OutfitConfig(
      id: 'astronaut',
      name: 'Astronaut Suit',
      icon: '👨‍🚀',
      description: 'High-tech space exploration suit',
      requiredStage: 2,
      priceCoins: 120,
    ),
    OutfitConfig(
      id: 'academic',
      name: 'Academic Regalia',
      icon: '🎓',
      description: 'Graduation gown and mortarboard',
      requiredStage: 3,
      priceCoins: 100,
    ),
    OutfitConfig(
      id: 'golden',
      name: 'Grandmaster Aura',
      icon: '👑',
      description: 'Exclusive golden science master style',
      requiredStage: 4,
      priceCoins: 200,
    ),
  ];

  static const List<GrowthTaskConfig> defaultGrowthTasks = [
    GrowthTaskConfig(
      id: 'task_complete_quiz',
      title: 'Complete a quiz',
      growthPoints: 4,
      actionRoute: '/student/terms',
      actionLabel: 'Go',
      targetCount: 1,
    ),
    GrowthTaskConfig(
      id: 'task_complete_topic',
      title: 'Complete a Science topic',
      growthPoints: 2,
      actionRoute: '/student/terms',
      actionLabel: 'Go',
      targetCount: 1,
    ),
    GrowthTaskConfig(
      id: 'task_answer_correct',
      title: 'Answer 10 questions correctly',
      growthPoints: 5,
      actionRoute: '/student/terms',
      actionLabel: 'Go',
      targetCount: 10,
    ),
    GrowthTaskConfig(
      id: 'task_maintain_streak',
      title: 'Maintain your learning streak',
      growthPoints: 5,
      actionRoute: '/student/terms',
      actionLabel: 'Go',
      targetCount: 1,
    ),
  ];

  EvolutionStageConfig getStageForXP(int xp) {
    if (xp >= 600) return stages[3];
    if (xp >= 300) return stages[2];
    if (xp >= 100) return stages[1];
    return stages[0];
  }

  String getStageAssetPath(String stageId, String? gender) {
    final g = (gender == 'female') ? 'female' : 'male';
    switch (stageId) {
      case 'baby':
        return 'assets/images/character/$g/baby.png';
      case 'student':
        return 'assets/images/character/$g/student.png';
      case 'graduate':
        return 'assets/images/character/$g/graduate.png';
      case 'worker':
      case 'adult':
        return 'assets/images/character/$g/worker.png';
      default:
        return 'assets/images/character/$g/baby.png';
    }
  }

  String getTodayDateString() {
    final now = DateTime.now();
    return "${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
  }

  Map<String, dynamic> calculateStreakOnActivity({
    required int currentStreak,
    required int longestStreak,
    required String? lastActivityDateStr,
  }) {
    final todayStr = getTodayDateString();

    if (lastActivityDateStr == null || lastActivityDateStr.isEmpty) {
      return {
        'currentStreak': 1,
        'longestStreak': max(1, longestStreak),
        'lastActivityDate': todayStr,
        'streakIncreased': true,
      };
    }

    if (lastActivityDateStr == todayStr) {
      return {
        'currentStreak': max(1, currentStreak),
        'longestStreak': max(currentStreak, longestStreak),
        'lastActivityDate': todayStr,
        'streakIncreased': false,
      };
    }

    try {
      final lastDate = DateTime.parse(lastActivityDateStr);
      final todayDate = DateTime.parse(todayStr);
      final differenceInDays = todayDate.difference(lastDate).inDays;

      if (differenceInDays == 1) {
        final newStreak = currentStreak + 1;
        return {
          'currentStreak': newStreak,
          'longestStreak': max(newStreak, longestStreak),
          'lastActivityDate': todayStr,
          'streakIncreased': true,
        };
      } else {
        return {
          'currentStreak': 1,
          'longestStreak': max(currentStreak, longestStreak),
          'lastActivityDate': todayStr,
          'streakIncreased': true,
        };
      }
    } catch (_) {
      return {
        'currentStreak': 1,
        'longestStreak': max(1, longestStreak),
        'lastActivityDate': todayStr,
        'streakIncreased': true,
      };
    }
  }

  String evaluateMood({
    required String? lastActivityDateStr,
    required int currentStreak,
  }) {
    if (lastActivityDateStr == null) return 'encouraging';
    final todayStr = getTodayDateString();
    if (lastActivityDateStr == todayStr) return 'happy';

    try {
      final lastDate = DateTime.parse(lastActivityDateStr);
      final todayDate = DateTime.parse(todayStr);
      final gapDays = todayDate.difference(lastDate).inDays;

      if (gapDays >= 2) {
        return 'sleepy';
      } else if (gapDays == 1) {
        return 'idle';
      }
    } catch (_) {}
    return 'idle';
  }

  static const List<String> tapMessages = [
    "Ready to learn?",
    "Let's keep the streak going!",
    "Science time! 🧪",
    "You're doing great! ⭐",
    "Let me help you level up! 🚀",
    "Keep it up!",
    "I'm ready when you are! 🎒",
    "Let's learn something new today! 💡",
    "Every quiz makes us stronger! ⚡",
    "Grade 10 Science master in the making! 🎓",
  ];

  String getRandomTapMessage() {
    final random = Random();
    return tapMessages[random.nextInt(tapMessages.length)];
  }

  String getFloatingReaction(String trigger) {
    switch (trigger) {
      case 'start_quiz':
        return "Ready? 🚀";
      case 'correct_answer':
        return "Nice! ✨";
      case 'wrong_answer':
        return "Keep going! 💪";
      case 'finish_quiz':
        return "Great job! 🎉";
      case 'streak_boost':
        return "Streak +1! 🔥";
      default:
        return "Let's learn!";
    }
  }

  String getEventSpeechMessage(String eventType, {int streak = 0}) {
    switch (eventType) {
      case 'quiz_complete':
        return "Nice job completing that quiz! 🎉";
      case 'streak_increased':
        return streak > 1 ? "🔥 We're on a $streak-day streak!" : "Awesome! Day 1 of our streak! 🔥";
      case 'streak_broken':
        return "It's okay! Let's build a new streak together. 💪";
      case 'evolution':
        return "Look at me! I evolved! ✨";
      case 'welcome_back':
        return "Welcome back! Ready for a quick quiz? 🚀";
      case 'sleepy_wakeup':
        return "Yawn... Oh! Welcome back! Let me stretch! ☀️";
      default:
        return "Let's keep learning!";
    }
  }
}
