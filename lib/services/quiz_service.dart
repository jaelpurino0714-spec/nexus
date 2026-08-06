import 'package:uuid/uuid.dart';
import '../models/answer_model.dart';
import '../models/quiz_attempt_model.dart';
import 'supabase_service.dart';

class QuizService {
  final _client = SupabaseService.instance.client;

  Future<QuizAttemptModel> saveQuizAttempt({
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
    final String attemptId = const Uuid().v4();
    final attempt = QuizAttemptModel(
      id: attemptId,
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

    await _client.from('quiz_attempts').insert(attempt.toJson());

    final List<Map<String, dynamic>> answersToInsert = answersData.map((a) {
      return {
        'id': const Uuid().v4(),
        'attempt_id': attemptId,
        'question_id': a['question_id'],
        'selected_answer': a['selected_answer'],
        'is_correct': a['is_correct'],
        'time_taken': a['time_taken'],
      };
    }).toList();

    await _client.from('answers').insert(answersToInsert);

    return attempt;
  }
}
