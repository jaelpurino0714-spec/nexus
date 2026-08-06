import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/quiz_provider.dart';

class QuizResultScreen extends ConsumerWidget {
  const QuizResultScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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

    return Scaffold(
      appBar: AppBar(title: const Text('Quiz Results'), automaticallyImplyLeading: false),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAlignment.stretch,
          children: [
            Text(
              pct >= 75 ? '🎉 Great Job!' : '💪 Keep Practicing!',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            Text(
              '${pct.toStringAsFixed(1)}%',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 64,
                fontWeight: FontWeight.extrabold,
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
