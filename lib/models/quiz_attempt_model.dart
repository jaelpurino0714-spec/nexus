class QuizAttemptModel {
  final String id;
  final String studentId;
  final String topicId;
  final String quizType; // 'pre_test' | 'practice' | 'post_test' | 'custom'
  final int score;
  final int correct;
  final int wrong;
  final double percentage;
  final int duration; // in seconds
  final DateTime createdAt;

  QuizAttemptModel({
    required this.id,
    required this.studentId,
    required this.topicId,
    required this.quizType,
    required this.score,
    required this.correct,
    required this.wrong,
    required this.percentage,
    required this.duration,
    required this.createdAt,
  });

  factory QuizAttemptModel.fromJson(Map<String, dynamic> json) {
    return QuizAttemptModel(
      id: json['id'] as String,
      studentId: json['student_id'] as String,
      topicId: json['topic_id'] as String,
      quizType: json['quiz_type'] as String,
      score: (json['score'] as num).toInt(),
      correct: (json['correct'] as num).toInt(),
      wrong: (json['wrong'] as num).toInt(),
      percentage: (json['percentage'] as num).toDouble(),
      duration: (json['duration'] as num).toInt(),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'student_id': studentId,
      'topic_id': topicId,
      'quiz_type': quizType,
      'score': score,
      'correct': correct,
      'wrong': wrong,
      'percentage': percentage,
      'duration': duration,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
