import '../models/achievement_model.dart';
import '../services/achievement_service.dart';

abstract class AchievementRepository {
  Future<List<AchievementModel>> getAchievements(String studentId);
  Future<List<AchievementModel>> checkAndUnlock({
    required String studentId,
    required double lastQuizPercentage,
    required int totalQuizzesCompleted,
    required int streakCount,
  });
}

class AchievementRepositoryImpl implements AchievementRepository {
  final AchievementService _service;

  AchievementRepositoryImpl(this._service);

  @override
  Future<List<AchievementModel>> getAchievements(String studentId) =>
      _service.getStudentAchievements(studentId);

  @override
  Future<List<AchievementModel>> checkAndUnlock({
    required String studentId,
    required double lastQuizPercentage,
    required int totalQuizzesCompleted,
    required int streakCount,
  }) =>
      _service.checkAndUnlockAchievements(
        studentId: studentId,
        lastQuizPercentage: lastQuizPercentage,
        totalQuizzesCompleted: totalQuizzesCompleted,
        streakCount: streakCount,
      );
}
