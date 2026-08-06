import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/student_analytics_model.dart';
import '../models/teacher_analytics_model.dart';
import '../services/analytics_service.dart';

final analyticsServiceProvider = Provider<AnalyticsService>((ref) => AnalyticsService());

final studentAnalyticsProvider = FutureProvider.family<StudentAnalyticsModel, String>((ref, studentId) async {
  final service = ref.watch(analyticsServiceProvider);
  return await service.fetchStudentAnalytics(studentId);
});

final teacherAnalyticsProvider = FutureProvider<TeacherAnalyticsModel>((ref) async {
  final service = ref.watch(analyticsServiceProvider);
  return await service.fetchTeacherAnalytics();
});
