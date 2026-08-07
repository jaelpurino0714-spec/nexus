import 'dart:math';
import '../models/question_model.dart';
import 'supabase_service.dart';

class PreparedQuestion {
  final QuestionModel question;
  final List<String> shuffledOptions;

  PreparedQuestion({required this.question, required this.shuffledOptions});
}

class QuestionService {
  final _client = SupabaseService.instance.client;

  Future<List<QuestionModel>> fetchActiveQuestionsByTopic(
    String topicId, {
    String? questionType,
    String? quizType,
    String topicTitle = 'Science Topic',
  }) async {
    List<QuestionModel> list = [];
    try {
      int? qTypeId;
      if (questionType == 'true_false') qTypeId = 2;
      else if (questionType == 'identification') qTypeId = 3;
      else if (questionType == 'multiple_choice') qTypeId = 1;

      var query = _client
          .from('questions')
          .select()
          .eq('is_active', true);

      if (topicId.isNotEmpty) {
        query = query.eq('topic_id', topicId);
      }

      if (qTypeId != null) {
        query = query.eq('question_type_id', qTypeId);
      }

      if (quizType != null && quizType.isNotEmpty) {
        query = query.eq('quiz_type', quizType);
      }

      final response = await query;
      list = (response as List).map((q) => QuestionModel.fromJson(q)).toList();
    } catch (e) {
      print('Error fetching questions from Supabase: $e');
    }

    return list;
  }

  List<PreparedQuestion> prepareQuizQuestions(List<QuestionModel> questions) {
    List<QuestionModel> shuffledQuestions = List.from(questions)..shuffle(Random());
    
    return shuffledQuestions.map((q) {
      List<String> options = [];
      if (q.questionType == 'true_false') {
        options = ['True', 'False'];
      } else if (q.questionType == 'identification') {
        options = [];
      } else {
        options = List.from(q.optionsList)..shuffle(Random());
      }
      return PreparedQuestion(question: q, shuffledOptions: options);
    }).toList();
  }
}
