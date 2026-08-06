import 'quiz_attempt_model.dart';

class StudentAnalyticsModel {
  final double averageScore;
  final double highestScore;
  final double lowestScore;
  final String strongestTopic;
  final String weakestTopic;
  final int totalQuizzes;
  final double accuracyPercentage;
  final int currentStreak;
  final List<QuizAttemptModel> quizHistory;

  StudentAnalyticsModel({
    required this.averageScore,
    required this.highestScore,
    required this.lowestScore,
    required this.strongestTopic,
    required this.weakestTopic,
    required this.totalQuizzes,
    required this.accuracyPercentage,
    required this.currentStreak,
    required this.quizHistory,
  });

  factory StudentAnalyticsModel.empty() {
    return StudentAnalyticsModel(
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      strongestTopic: 'N/A',
      weakestTopic: 'N/A',
      totalQuizzes: 0,
      accuracyPercentage: 0,
      currentStreak: 0,
      quizHistory: [],
    );
  }
}
