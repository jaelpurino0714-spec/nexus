import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/teacher_repository.dart';

final teacherRepositoryProvider = Provider<TeacherRepository>((ref) {
  return TeacherRepositoryImpl();
});
