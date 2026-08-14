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
      id: 'adult',
      stage: 4,
      title: 'ADULT',
      icon: '🧑',
      minXP: 600,
      nextXP: 999999,
      colorHex: '#F59E0B',
      defaultQuote: "Science Grandmaster & Expert!",
      description: 'Science Grandmaster & Expert!',
    ),
  ];

  EvolutionStageConfig getStageForXP(int xp) {
    if (xp >= 600) return stages[3];
    if (xp >= 300) return stages[2];
    if (xp >= 100) return stages[1];
    return stages[0];
  }

  String getStageAssetPath(String stageId, String? gender) {
    if (stageId == 'baby') {
      return 'assets/images/character/baby.png';
    }
    final g = (gender == 'female') ? 'female' : 'male';
    switch (stageId) {
      case 'student':
        return 'assets/images/character/$g/student.png';
      case 'graduate':
        return 'assets/images/character/$g/graduate.png';
      case 'adult':
        return 'assets/images/character/$g/adult.png';
      default:
        return 'assets/images/character/$g/student.png';
    }
  }

  String getTodayDateString() {
    final now = DateTime.now();
    return "${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
  }

  /// Calculates updated streak given the last activity date string (YYYY-MM-DD)
  /// Rules:
  /// - Same calendar day: streak unchanged
  /// - Next consecutive calendar day: streak += 1
  /// - Missed day(s): reset streak to 1 for this new learning activity
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
      // Activity on same day: streak doesn't increase multiple times
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
        // Consecutive day!
        final newStreak = currentStreak + 1;
        return {
          'currentStreak': newStreak,
          'longestStreak': max(newStreak, longestStreak),
          'lastActivityDate': todayStr,
          'streakIncreased': true,
        };
      } else {
        // Missed day(s): start fresh streak at 1
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

  /// Evaluates current character mood based on activity and date gap
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

  // Interactive message pools
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
