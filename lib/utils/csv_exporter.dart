import 'package:csv/csv.dart';
import '../models/teacher_analytics_model.dart';

class CsvExporter {
  static String exportTeacherAnalyticsToCsv(TeacherAnalyticsModel analytics) {
    List<List<dynamic>> rows = [
      ['NEXUS Grade 10 Science Trivia - Analytics Report'],
      [],
      ['Class Summary'],
      ['Class Average (%)', analytics.classAverage.toStringAsFixed(2)],
      ['Total Students', analytics.totalStudents],
      ['Participation Rate (%)', analytics.participationRate.toStringAsFixed(2)],
      [],
      ['Most Missed Questions'],
      ['Question ID', 'Question', 'Times Missed', 'Total Attempts', 'Miss Rate (%)'],
    ];

    for (var mq in analytics.mostMissedQuestions) {
      rows.add([
        mq.questionId,
        mq.question,
        mq.timesMissed,
        mq.totalAttempts,
        mq.missRate.toStringAsFixed(2),
      ]);
    }

    return const ListToCsvConverter().convert(rows);
  }
}
