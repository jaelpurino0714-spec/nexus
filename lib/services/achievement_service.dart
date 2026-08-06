import 'package:uuid/uuid.dart';
import '../models/achievement_model.dart';
import 'supabase_service.dart';

class AchievementService {
  final _client = SupabaseService.instance.client;

  Future<List<AchievementModel>> getStudentAchievements(String studentId) async {
    final allAchievementsResponse = await _client.from('achievements').select();
    final unlockedResponse = await _client
        .from('student_achievements')
        .select()
        .eq('student_id', studentId);

    final unlockedMap = <String, DateTime>{};
    for (var item in unlockedResponse as List) {
      unlockedMap[item['achievement_id']] = DateTime.parse(item['unlocked_at']);
    }

    return (allAchievementsResponse as List).map((ach) {
      final isUnlocked = unlockedMap.containsKey(ach['id']);
      return AchievementModel.fromJson(
        ach,
        isUnlocked: isUnlocked,
        unlockedAt: unlockedMap[ach['id']],
      );
    }).toList();
  }

  Future<List<AchievementModel>> checkAndUnlockAchievements({
    required String studentId,
    required double lastQuizPercentage,
    required int totalQuizzesCompleted,
    required int streakCount,
  }) async {
    final achievements = await getStudentAchievements(studentId);
    List<AchievementModel> newlyUnlocked = [];

    for (var ach in achievements) {
      if (ach.isUnlocked) continue;

      bool shouldUnlock = false;
      if (ach.requirementType == 'quizzes_completed' && totalQuizzesCompleted >= ach.requirementValue) {
        shouldUnlock = true;
      } else if (ach.requirementType == 'score_percentage' && lastQuizPercentage >= ach.requirementValue) {
        shouldUnlock = true;
      } else if (ach.requirementType == 'streak' && streakCount >= ach.requirementValue) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        await _client.from('student_achievements').insert({
          'id': const Uuid().v4(),
          'student_id': studentId,
          'achievement_id': ach.id,
          'unlocked_at': DateTime.now().toIso8601String(),
        });
        newlyUnlocked.add(ach);
      }
    }

    return newlyUnlocked;
  }
}
