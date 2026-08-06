import '../models/quiz_attempt_model.dart';
import '../services/quiz_service.dart';
import '../services/sync_service.dart';
import '../core/network/connectivity_service.dart';

abstract class QuizRepository {
  Future<QuizAttemptModel> submitQuizAttempt({
    required String studentId,
    required String topicId,
    required String quizType,
    required int score,
    required int correct,
    required int wrong,
    required double percentage,
    required int duration,
    required List<Map<String, dynamic>> answersData,
  });
}

class QuizRepositoryImpl implements QuizRepository {
  final QuizService _quizService;
  final SyncService _syncService;
  final ConnectivityService _connectivityService;

  QuizRepositoryImpl(this._quizService, this._syncService, this._connectivityService);

  @override
  Future<QuizAttemptModel> submitQuizAttempt({
    required String studentId,
    required String topicId,
    required String quizType,
    required int score,
    required int correct,
    required int wrong,
    required double percentage,
    required int duration,
    required List<Map<String, dynamic>> answersData,
  }) async {
    final bool isOnline = await _connectivityService.checkConnected();

    if (isOnline) {
      return await _quizService.saveQuizAttempt(
        studentId: studentId,
        topicId: topicId,
        quizType: quizType,
        score: score,
        correct: correct,
        wrong: wrong,
        percentage: percentage,
        duration: duration,
        answersData: answersData,
      );
    } else {
      // Offline fallback: Queue for auto sync
      final Map<String, dynamic> offlinePayload = {
        'attempt': {
          'student_id': studentId,
          'topic_id': topicId,
          'quiz_type': quizType,
          'score': score,
          'correct': correct,
          'wrong': wrong,
          'percentage': percentage,
          'duration': duration,
          'created_at': DateTime.now().toIso8601String(),
        },
        'answers': answersData,
      };

      await _syncService.queueOfflineAttempt(offlinePayload);

      return QuizAttemptModel(
        id: 'offline_attempt_${DateTime.now().millisecondsSinceEpoch}',
        studentId: studentId,
        topicId: topicId,
        quizType: quizType,
        score: score,
        correct: correct,
        wrong: wrong,
        percentage: percentage,
        duration: duration,
        createdAt: DateTime.now(),
      );
    }
  }
}
