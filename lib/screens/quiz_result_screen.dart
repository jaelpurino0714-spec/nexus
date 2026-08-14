import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/quiz_provider.dart';
import '../providers/character_provider.dart';
import '../widgets/evolution_celebration_dialog.dart';

class QuizResultScreen extends ConsumerStatefulWidget {
  const QuizResultScreen({super.key});

  @override
  ConsumerState<QuizResultScreen> createState() => _QuizResultScreenState();
}

class _QuizResultScreenState extends ConsumerState<QuizResultScreen> {
  bool _activityRecorded = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _recordActivityIfNeeded();
    });
  }

  void _recordActivityIfNeeded() async {
    if (_activityRecorded) return;
    final quizState = ref.read(quizProvider);
    if (quizState != null && quizState.questions.isNotEmpty) {
      _activityRecorded = true;
      final double pct = (quizState.correctCount / quizState.questions.length) * 100;
      await ref.read(characterProvider.notifier).recordLearningActivity(
            percentageScore: pct,
            correctAnswers: quizState.correctCount,
            totalQuestions: quizState.questions.length,
          );

      if (mounted) {
        final charState = ref.read(characterProvider);
        if (charState.pendingEvolution != null) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (ctx) => const EvolutionCelebrationDialog(),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final quizState = ref.watch(quizProvider);

    if (quizState == null) {
      return Scaffold(
        body: Center(
          child: ElevatedButton(
            onPressed: () => context.go('/student/home'),
            child: const Text('Back to Home'),
          ),
        ),
      );
    }

    final double pct = (quizState.correctCount / quizState.questions.length) * 100;
    final charState = ref.watch(characterProvider);
    final xpGained = charState.lastXpGained;

    return Scaffold(
      appBar: AppBar(title: const Text('Quiz Results'), automaticallyImplyLeading: false),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              pct >= 75 ? '🎉 Great Job!' : '💪 Keep Practicing!',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            if (xpGained > 0)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 40, vertical: 8),
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF08A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFFACC15)),
                ),
                child: Text(
                  '⭐ +$xpGained Companion XP Earned!',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF854D0E),
                  ),
                ),
              ),
            const SizedBox(height: 12),

            Text(
              '${pct.toStringAsFixed(1)}%',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 64,
                fontWeight: FontWeight.w900,
                color: pct >= 75 ? Colors.green : Colors.orange,
              ),
            ),
            const SizedBox(height: 24),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _statTile('Score', '${quizState.score} pts'),
                _statTile('Correct', '${quizState.correctCount}'),
                _statTile('Wrong', '${quizState.wrongCount}'),
              ],
            ),
            const SizedBox(height: 48),

            ElevatedButton(
              onPressed: () => context.go('/student/home'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF673AB7),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.all(16),
              ),
              child: const Text('Return to Home', style: TextStyle(fontSize: 18)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statTile(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.black54)),
      ],
    );
  }
}
