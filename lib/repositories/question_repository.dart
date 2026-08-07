import '../models/question_model.dart';
import '../services/question_service.dart';
import '../services/supabase_service.dart';

abstract class QuestionRepository {
  Future<List<PreparedQuestion>> getPreparedQuestionsForQuiz(
    String topicId, {
    String? questionType,
    String topicTitle = 'Science Topic',
  });
  Future<void> addQuestion(QuestionModel question);
  Future<void> updateQuestion(QuestionModel question);
  Future<void> deleteQuestion(String id);
}

class QuestionRepositoryImpl implements QuestionRepository {
  final QuestionService _questionService;
  final _client = SupabaseService.instance.client;

  QuestionRepositoryImpl(this._questionService);

  @override
  Future<List<PreparedQuestion>> getPreparedQuestionsForQuiz(
    String topicId, {
    String? questionType,
    String topicTitle = 'Science Topic',
  }) async {
    final rawQuestions = await _questionService.fetchActiveQuestionsByTopic(
      topicId,
      questionType: questionType,
      topicTitle: topicTitle,
    );
    return _questionService.prepareQuizQuestions(rawQuestions);
  }

  @override
  Future<void> addQuestion(QuestionModel question) async {
    await _client.from('question_bank').insert(question.toJson());
  }

  @override
  Future<void> updateQuestion(QuestionModel question) async {
    await _client.from('question_bank').update(question.toJson()).eq('id', question.id);
  }

  @override
  Future<void> deleteQuestion(String id) async {
    await _client.from('question_bank').delete().eq('id', id);
  }
}
