import '../models/quiz_attempt_model.dart';
import '../models/student_analytics_model.dart';
import '../models/teacher_analytics_model.dart';
import 'supabase_service.dart';

class AnalyticsService {
  SupabaseClient get _client => SupabaseService.instance.client;

  Future<StudentAnalyticsModel> fetchStudentAnalytics(String studentId) async {
    final response = await _client
        .from('quiz_attempts')
        .select('*, topics(title)')
        .eq('student_id', studentId)
        .order('created_at', ascending: false);

    final rawList = response as List;
    if (rawList.isEmpty) {
      return StudentAnalyticsModel.empty();
    }

    final attempts = rawList.map((q) => QuizAttemptModel.fromJson(q)).toList();

    double totalPct = 0;
    double highest = 0;
    double lowest = 100;
    int totalCorrect = 0;
    int totalQuestions = 0;

    Map<String, List<double>> topicScores = {};

    for (var a in attempts) {
      totalPct += a.percentage;
      if (a.percentage > highest) highest = a.percentage;
      if (a.percentage < lowest) lowest = a.percentage;
      totalCorrect += a.correct;
      totalQuestions += (a.correct + a.wrong);

      topicScores.putIfAbsent(a.topicId, () => []).add(a.percentage);
    }

    double avgPct = totalPct / attempts.length;
    double accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    String strongestTopic = 'N/A';
    String weakestTopic = 'N/A';
    double maxTopicAvg = -1;
    double minTopicAvg = 101;

    topicScores.forEach((topicId, scores) {
      double avg = scores.reduce((a, b) => a + b) / scores.length;
      if (avg > maxTopicAvg) {
        maxTopicAvg = avg;
        strongestTopic = topicId;
      }
      if (avg < minTopicAvg) {
        minTopicAvg = avg;
        weakestTopic = topicId;
      }
    });

    int streak = 0;
    for (var a in attempts) {
      if (a.percentage >= 75) {
        streak++;
      } else {
        break;
      }
    }

    return StudentAnalyticsModel(
      averageScore: avgPct,
      highestScore: highest,
      lowestScore: lowest == 100 && attempts.isEmpty ? 0 : lowest,
      strongestTopic: strongestTopic,
      weakestTopic: weakestTopic,
      totalQuizzes: attempts.length,
      accuracyPercentage: accuracy,
      currentStreak: streak,
      quizHistory: attempts,
    );
  }

  Future<TeacherAnalyticsModel> fetchTeacherAnalytics() async {
    final attemptsResponse = await _client.from('quiz_attempts').select('*, profiles(name, section)');
    final studentsResponse = await _client.from('profiles').select().eq('role', 'student');
    final answersResponse = await _client.from('answers').select('*, question_bank(question)');

    final attempts = (attemptsResponse as List);
    final students = (studentsResponse as List);
    final answers = (answersResponse as List);

    if (attempts.isEmpty) {
      return TeacherAnalyticsModel.empty();
    }

    double totalPct = 0;
    for (var a in attempts) {
      totalPct += (a['percentage'] as num).toDouble();
    }
    double classAvg = totalPct / attempts.length;

    // Most missed questions
    Map<String, Map<String, dynamic>> missedMap = {};
    for (var ans in answers) {
      final qId = ans['question_id'] as String;
      final qText = ans['question_bank'] != null ? ans['question_bank']['question'] : 'Question';
      final isCorrect = ans['is_correct'] as bool;

      missedMap.putIfAbsent(qId, () => {'text': qText, 'total': 0, 'missed': 0});
      missedMap[qId]!['total'] = (missedMap[qId]!['total'] as int) + 1;
      if (!isCorrect) {
        missedMap[qId]!['missed'] = (missedMap[qId]!['missed'] as int) + 1;
      }
    }

    List<MissedQuestion> missedList = [];
    missedMap.forEach((qId, data) {
      int total = data['total'];
      int missed = data['missed'];
      double rate = total > 0 ? (missed / total) * 100 : 0.0;
      missedList.add(MissedQuestion(
        questionId: qId,
        question: data['text'],
        timesMissed: missed,
        totalAttempts: total,
        missRate: rate,
      ));
    });

    missedList.sort((a, b) => b.missRate.compareTo(a.missRate));

    return TeacherAnalyticsModel(
      classAverage: classAvg,
      participationRate: students.isNotEmpty ? (attempts.length / students.length) * 100 : 0.0,
      totalStudents: students.length,
      mostMissedQuestions: missedList.take(5).toList(),
      topicMastery: {},
      studentRankings: [],
    );
  }
}
