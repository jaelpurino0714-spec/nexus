class StudentRanking {
  final String studentId;
  final String name;
  final String section;
  final double averagePercentage;
  final int quizzesTaken;

  StudentRanking({
    required this.studentId,
    required this.name,
    required this.section,
    required this.averagePercentage,
    required this.quizzesTaken,
  });
}

class MissedQuestion {
  final String questionId;
  final String question;
  final int timesMissed;
  final int totalAttempts;
  final double missRate;

  MissedQuestion({
    required this.questionId,
    required this.question,
    required this.timesMissed,
    required this.totalAttempts,
    required this.missRate,
  });
}

class TeacherAnalyticsModel {
  final double classAverage;
  final double participationRate;
  final int totalStudents;
  final List<MissedQuestion> mostMissedQuestions;
  final Map<String, double> topicMastery;
  final List<StudentRanking> studentRankings;

  TeacherAnalyticsModel({
    required this.classAverage,
    required this.participationRate,
    required this.totalStudents,
    required this.mostMissedQuestions,
    required this.topicMastery,
    required this.studentRankings,
  });

  factory TeacherAnalyticsModel.empty() {
    return TeacherAnalyticsModel(
      classAverage: 0.0,
      participationRate: 0.0,
      totalStudents: 0,
      mostMissedQuestions: [],
      topicMastery: {},
      studentRankings: [],
    );
  }
}
