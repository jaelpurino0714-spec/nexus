import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../screens/splash_screen.dart';
import '../../screens/login_selection_screen.dart';
import '../../screens/student_profile_setup_screen.dart';
import '../../screens/teacher_login_screen.dart';
import '../../screens/student_home_screen.dart';
import '../../screens/term_selection_screen.dart';
import '../../screens/topic_selection_screen.dart';
import '../../screens/test_mode_selection_screen.dart';
import '../../screens/quiz_runner_screen.dart';
import '../../screens/quiz_result_screen.dart';
import '../../screens/student_analytics_screen.dart';
import '../../screens/teacher_dashboard_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final status = authState.status;

      if (status == AuthStatus.uninitialized) return '/';

      final isLoggingIn = state.matchedLocation == '/login' ||
          state.matchedLocation == '/student/profile-setup' ||
          state.matchedLocation == '/teacher/login';

      if (status == AuthStatus.unauthenticated && !isLoggingIn) {
        return '/login';
      }

      if (status == AuthStatus.authenticatedStudent && isLoggingIn) {
        return '/student/home';
      }

      if (status == AuthStatus.authenticatedTeacher && isLoggingIn) {
        return '/teacher/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginSelectionScreen(),
      ),
      GoRoute(
        path: '/student/profile-setup',
        builder: (context, state) => const StudentProfileSetupScreen(),
      ),
      GoRoute(
        path: '/teacher/login',
        builder: (context, state) => const TeacherLoginScreen(),
      ),
      GoRoute(
        path: '/student/home',
        builder: (context, state) => const StudentHomeScreen(),
      ),
      GoRoute(
        path: '/student/terms',
        builder: (context, state) => const TermSelectionScreen(),
      ),
      GoRoute(
        path: '/student/topics',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return TopicSelectionScreen(
            termNum: extra['termNum'] ?? 1,
          );
        },
      ),
      GoRoute(
        path: '/student/test-mode',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return TestModeSelectionScreen(
            termNum: extra['termNum'] ?? 1,
            topicTitle: extra['topicTitle'] ?? '',
            topicId: extra['topicId'] ?? '',
          );
        },
      ),
      GoRoute(
        path: '/student/quiz',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return QuizRunnerScreen(
            topicId: extra['topicId'] ?? '',
            topicTitle: extra['topicTitle'] ?? 'Science Topic',
            quizType: extra['quizType'] ?? 'pre_test',
            questionType: extra['questionType'] ?? 'multiple_choice',
          );
        },
      ),
      GoRoute(
        path: '/student/result',
        builder: (context, state) => const QuizResultScreen(),
      ),
      GoRoute(
        path: '/student/analytics',
        builder: (context, state) => const StudentAnalyticsScreen(),
      ),
      GoRoute(
        path: '/teacher/dashboard',
        builder: (context, state) => const TeacherDashboardScreen(),
      ),
    ],
  );
});
