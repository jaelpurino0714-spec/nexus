class AnswerModel {
  final String id;
  final String attemptId;
  final String questionId;
  final String selectedAnswer;
  final bool isCorrect;
  final int timeTaken; // in seconds

  AnswerModel({
    required this.id,
    required this.attemptId,
    required this.questionId,
    required this.selectedAnswer,
    required this.isCorrect,
    required this.timeTaken,
  });

  factory AnswerModel.fromJson(Map<String, dynamic> json) {
    return AnswerModel(
      id: json['id'] as String,
      attemptId: json['attempt_id'] as String,
      questionId: json['question_id'] as String,
      selectedAnswer: json['selected_answer'] as String,
      isCorrect: json['is_correct'] as bool,
      timeTaken: (json['time_taken'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'attempt_id': attemptId,
      'question_id': questionId,
      'selected_answer': selectedAnswer,
      'is_correct': isCorrect,
      'time_taken': timeTaken,
    };
  }
}
