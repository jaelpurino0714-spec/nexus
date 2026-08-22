import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../screens/splash_screen.dart';
import '../../screens/auth_screen.dart';
import '../../screens/login_selection_screen.dart';
import '../../screens/student_profile_setup_screen.dart';
import '../../screens/student_home_screen.dart';
import '../../screens/term_selection_screen.dart';
import '../../screens/topic_selection_screen.dart';
import '../../screens/test_mode_selection_screen.dart';
import '../../screens/quiz_runner_screen.dart';
import '../../screens/quiz_result_screen.dart';
import '../../screens/student_analytics_screen.dart';
import '../../screens/custom_play_screen.dart';
import '../../screens/host_quiz_screen.dart';
import '../../screens/join_quiz_screen.dart';
import '../../screens/full_character_screen.dart';
import '../../screens/mascot_evolution_screen.dart';

import '../../screens/teacher_login_screen.dart';
import '../../screens/teacher_dashboard_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final status = authState.status;

      if (status == AuthStatus.uninitialized) return '/';

      final isLoggingIn = state.matchedLocation == '/' ||
          state.matchedLocation == '/login' ||
          state.matchedLocation == '/student/profile-setup' ||
          state.matchedLocation == '/teacher/login';

      if (status == AuthStatus.unauthenticated && !isLoggingIn) {
        return '/login';
      }

      if (status == AuthStatus.authenticatedTeacher && isLoggingIn) {
        return '/teacher/dashboard';
      }

      if (status == AuthStatus.authenticatedStudent && isLoggingIn) {
        return '/student/home';
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
        builder: (context, state) => const AuthScreen(),
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
        path: '/teacher/dashboard',
        builder: (context, state) => const TeacherDashboardScreen(),
      ),


      // ShellRoute for Student Application
      ShellRoute(
        builder: (context, state, child) {
          return Scaffold(
            body: child,
          );
        },
        routes: [
          GoRoute(
            path: '/student/home',
            builder: (context, state) => const StudentHomeScreen(),
          ),
          GoRoute(
            path: '/student/character',
            builder: (context, state) => const FullCharacterScreen(),
          ),
          GoRoute(
            path: '/student/mascot-evolution',
            builder: (context, state) => const MascotEvolutionScreen(),
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
                termId: extra['termId'],
                termNum: extra['termNum'] ?? 1,
                termTitle: extra['termTitle'],
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
            path: '/student/custom-play',
            builder: (context, state) => const CustomPlayScreen(),
          ),
          GoRoute(
            path: '/student/host-quiz',
            builder: (context, state) => const HostQuizScreen(),
          ),
          GoRoute(
            path: '/student/join-quiz',
            builder: (context, state) => const JoinQuizScreen(),
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
                customTimeLimit: extra['customTimeLimit'],
                customQuestionCount: extra['customQuestionCount'],
                customQuestions: extra['customQuestions'],
                lobbyAccessCode: extra['lobbyAccessCode'],
                participantId: extra['participantId'],
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
        ],
      ),
    ],
  );
});
