import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';

abstract class TeacherRepository {
  Future<void> createCustomQuiz({
    required String teacherId,
    required String title,
    required String topicId,
    required List<String> questionIds,
  });
}

class TeacherRepositoryImpl implements TeacherRepository {
  SupabaseClient get _client => SupabaseService.instance.client;

  @override
  Future<void> createCustomQuiz({
    required String teacherId,
    required String title,
    required String topicId,
    required List<String> questionIds,
  }) async {
    final quizRes = await _client.from('custom_quizzes').insert({
      'teacher_id': teacherId,
      'title': title,
      'topic_id': topicId,
    }).select('id').single();

    final String quizId = quizRes['id'];

    final List<Map<String, dynamic>> quizQuestions = questionIds.map((qId) {
      return {
        'quiz_id': quizId,
        'question_id': qId,
      };
    }).toList();

    await _client.from('custom_quiz_questions').insert(quizQuestions);
  }
}
