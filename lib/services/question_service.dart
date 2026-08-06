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

  Future<List<QuestionModel>> fetchActiveQuestionsByTopic(String topicId) async {
    final response = await _client
        .from('question_bank')
        .select()
        .eq('topic_id', topicId)
        .eq('is_active', true);

    return (response as List).map((q) => QuestionModel.fromJson(q)).toList();
  }

  List<PreparedQuestion> prepareQuizQuestions(List<QuestionModel> questions) {
    List<QuestionModel> shuffledQuestions = List.from(questions)..shuffle(Random());
    
    return shuffledQuestions.map((q) {
      List<String> options = List.from(q.optionsList)..shuffle(Random());
      return PreparedQuestion(question: q, shuffledOptions: options);
    }).toList();
  }
}
