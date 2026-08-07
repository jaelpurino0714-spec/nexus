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

      final response = await query;
      list = (response as List).map((q) => QuestionModel.fromJson(q)).toList();
    } catch (e) {
      // Fallback
    }

    if (list.length < 15) {
      final generated = _generateFallbackQuestions(topicId, topicTitle, questionType ?? 'multiple_choice', 15 - list.length);
      list.addAll(generated);
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

  List<QuestionModel> _generateFallbackQuestions(String topicId, String topicTitle, String questionType, int count) {
    List<QuestionModel> generated = [];
    for (int i = 1; i <= count; i++) {
      if (questionType == 'true_false') {
        final bool isTrue = i % 2 != 0;
        generated.add(QuestionModel(
          id: 'gen_tf_$i',
          topicId: topicId.isEmpty ? 'topic_fallback' : topicId,
          question: '[$topicTitle] Statement $i: Is this scientific concept accurate for Grade 10 Science?',
          questionType: 'true_false',
          optionA: 'True',
          optionB: 'False',
          correctAnswer: isTrue ? 'True' : 'False',
          difficulty: 'Medium',
          timeLimit: 20,
          isActive: true,
        ));
      } else if (questionType == 'identification') {
        generated.add(QuestionModel(
          id: 'gen_id_$i',
          topicId: topicId.isEmpty ? 'topic_fallback' : topicId,
          question: 'Identify the core Grade 10 Science term associated with key concept #$i in $topicTitle.',
          questionType: 'identification',
          optionA: '',
          optionB: '',
          correctAnswer: topicTitle.split(' ').first,
          difficulty: 'Medium',
          timeLimit: 20,
          isActive: true,
        ));
      } else {
        generated.add(QuestionModel(
          id: 'gen_mc_$i',
          topicId: topicId.isEmpty ? 'topic_fallback' : topicId,
          question: 'Which fundamental principle governs $topicTitle regarding item #$i?',
          questionType: 'multiple_choice',
          optionA: 'Primary Principle of $topicTitle',
          optionB: 'Secondary Response Factor',
          optionC: 'External Ambient Variable',
          optionD: 'Inverse Reactivity Threshold',
          correctAnswer: 'Primary Principle of $topicTitle',
          difficulty: 'Medium',
          timeLimit: 20,
          isActive: true,
        ));
      }
    }
    return generated;
  }
}
