import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/quiz_provider.dart';

class QuizRunnerScreen extends ConsumerStatefulWidget {
  final String topicId;
  final String quizType;

  const QuizRunnerScreen({
    super.key,
    required this.topicId,
    required this.quizType,
  });

  @override
  ConsumerState<QuizRunnerScreen> createState() => _QuizRunnerScreenState();
}

class _QuizRunnerScreenState extends ConsumerState<QuizRunnerScreen> {
  int _startTime = DateTime.now().millisecondsSinceEpoch;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(quizProvider.notifier).startQuiz(
            topicId: widget.topicId,
            quizType: widget.quizType,
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final quizState = ref.watch(quizProvider);

    if (quizState == null || quizState.questions.isEmpty) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (quizState.isCompleted) {
      Future.microtask(() => context.go('/student/result'));
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final currentQ = quizState.currentQuestion!;

    return Scaffold(
      appBar: AppBar(
        title: Text('Question ${quizState.currentIndex + 1}/${quizState.questions.length}'),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Center(
              child: Text(
                '⏱️ ${quizState.secondsRemaining}s',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.deepOrange),
              ),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAlignment.stretch,
          children: [
            LinearProgressIndicator(
              value: (quizState.currentIndex + 1) / quizState.questions.length,
            ),
            const SizedBox(height: 24),

            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Text(
                  currentQ.question.question,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 32),

            ...currentQ.shuffledOptions.map((option) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                    alignment: Alignment.centerLeft,
                  ),
                  onPressed: () {
                    final durationSec = ((DateTime.now().millisecondsSinceEpoch - _startTime) / 1000).round();
                    _startTime = DateTime.now().millisecondsSinceEpoch;
                    ref.read(quizProvider.notifier).submitAnswer(
                          selectedAnswer: option,
                          timeTaken: durationSec,
                        );
                  },
                  child: Text(option, style: const TextStyle(fontSize: 16)),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}
