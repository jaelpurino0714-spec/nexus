class QuestionModel {
  final String id;
  final String topicId;
  final int questionTypeId;
  final String question;
  final String questionType; // 'multiple_choice' | 'true_false' | 'identification'
  final String optionA;
  final String optionB;
  final String? optionC;
  final String? optionD;
  final String correctAnswer;
  final String? explanation;
  final String difficulty;
  final String? imageUrl;
  final int timeLimit;
  final bool isActive;
  final String? createdBy;
  final DateTime? createdAt;

  QuestionModel({
    required this.id,
    required this.topicId,
    this.questionTypeId = 1,
    required this.question,
    required this.questionType,
    required this.optionA,
    required this.optionB,
    this.optionC,
    this.optionD,
    required this.correctAnswer,
    this.explanation,
    required this.difficulty,
    this.imageUrl,
    required this.timeLimit,
    required this.isActive,
    this.createdBy,
    this.createdAt,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    int typeId = (json['question_type_id'] as num?)?.toInt() ?? 1;
    String typeStr = json['question_type'] as String? ?? '';

    if (typeStr.isEmpty) {
      if (typeId == 2) typeStr = 'true_false';
      else if (typeId == 3) typeStr = 'identification';
      else typeStr = 'multiple_choice';
    }

    return QuestionModel(
      id: json['id'] as String,
      topicId: json['topic_id'] as String,
      questionTypeId: typeId,
      question: json['question'] as String,
      questionType: typeStr,
      optionA: (json['choice_a'] ?? json['option_a']) as String? ?? '',
      optionB: (json['choice_b'] ?? json['option_b']) as String? ?? '',
      optionC: (json['choice_c'] ?? json['option_c']) as String?,
      optionD: (json['choice_d'] ?? json['option_d']) as String?,
      correctAnswer: json['correct_answer'] as String? ?? '',
      explanation: json['explanation'] as String?,
      difficulty: json['difficulty'] as String? ?? 'Medium',
      imageUrl: json['image_url'] as String?,
      timeLimit: (json['time_limit'] as num?)?.toInt() ?? 20,
      isActive: json['is_active'] as bool? ?? true,
      createdBy: json['created_by'] as String?,
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'topic_id': topicId,
      'question_type_id': questionTypeId,
      'question': question,
      'question_type': questionType,
      'choice_a': optionA,
      'choice_b': optionB,
      'choice_c': optionC,
      'choice_d': optionD,
      'correct_answer': correctAnswer,
      'explanation': explanation,
      'difficulty': difficulty,
      'image_url': imageUrl,
      'time_limit': timeLimit,
      'is_active': isActive,
      'created_by': createdBy,
      'created_at': createdAt?.toIso8601String(),
    };
  }

  List<String> get optionsList {
    List<String> opts = [optionA, optionB];
    if (optionC != null && optionC!.isNotEmpty) opts.add(optionC!);
    if (optionD != null && optionD!.isNotEmpty) opts.add(optionD!);
    return opts;
  }
}
