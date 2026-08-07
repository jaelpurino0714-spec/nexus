class QuestionModel {
  final String id;
  final String topicId;
  final String question;
  final String questionType; // 'multiple_choice' | 'true_false'
  final String optionA;
  final String optionB;
  final String? optionC;
  final String? optionD;
  final String correctAnswer;
  final String? explanation;
  final String difficulty;
  final int timeLimit;
  final bool isActive;
  final String? createdBy;
  final DateTime? createdAt;

  QuestionModel({
    required this.id,
    required this.topicId,
    required this.question,
    required this.questionType,
    required this.optionA,
    required this.optionB,
    this.optionC,
    this.optionD,
    required this.correctAnswer,
    this.explanation,
    required this.difficulty,
    required this.timeLimit,
    required this.isActive,
    this.createdBy,
    this.createdAt,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    return QuestionModel(
      id: json['id'] as String,
      topicId: json['topic_id'] as String,
      question: json['question'] as String,
      questionType: json['question_type'] as String? ?? 'multiple_choice',
      optionA: json['option_a'] as String? ?? '',
      optionB: json['option_b'] as String? ?? '',
      optionC: json['option_c'] as String?,
      optionD: json['option_d'] as String?,
      correctAnswer: json['correct_answer'] as String? ?? '',
      explanation: json['explanation'] as String?,
      difficulty: json['difficulty'] as String? ?? 'Medium',
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
      'question': question,
      'question_type': questionType,
      'option_a': optionA,
      'option_b': optionB,
      'option_c': optionC,
      'option_d': optionD,
      'correct_answer': correctAnswer,
      'explanation': explanation,
      'difficulty': difficulty,
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
