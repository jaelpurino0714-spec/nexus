import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/quiz_provider.dart';

class QuizRunnerScreen extends ConsumerStatefulWidget {
  final String topicId;
  final String topicTitle;
  final String quizType;
  final String questionType;

  const QuizRunnerScreen({
    super.key,
    required this.topicId,
    this.topicTitle = 'Science Topic',
    required this.quizType,
    this.questionType = 'multiple_choice',
  });

  @override
  ConsumerState<QuizRunnerScreen> createState() => _QuizRunnerScreenState();
}

class _QuizRunnerScreenState extends ConsumerState<QuizRunnerScreen> {
  int _startTime = DateTime.now().millisecondsSinceEpoch;
  final TextEditingController _idInputController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(quizProvider.notifier).startQuiz(
            topicId: widget.topicId,
            topicTitle: widget.topicTitle,
            quizType: widget.quizType,
            questionType: widget.questionType,
          );
    });
  }

  @override
  void dispose() {
    _idInputController.dispose();
    super.dispose();
  }

  void _submitUserAnswer(String ans) {
    final durationSec = ((DateTime.now().millisecondsSinceEpoch - _startTime) / 1000).round();
    _startTime = DateTime.now().millisecondsSinceEpoch;
    _idInputController.clear();
    ref.read(quizProvider.notifier).submitAnswer(
          selectedAnswer: ans,
          timeTaken: durationSec,
        );
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
    final qType = currentQ.question.questionType;

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
      body: SingleChildScrollView(
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Text(
                  currentQ.question.question,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 32),

            if (qType == 'identification') ...[
              TextField(
                controller: _idInputController,
                decoration: const InputDecoration(
                  labelText: 'Type your answer...',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.edit),
                ),
                onSubmitted: (val) => _submitUserAnswer(val),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: const Color(0xFF673AB7),
                  foregroundColor: Colors.white,
                ),
                onPressed: () => _submitUserAnswer(_idInputController.text),
                child: const Text('Submit Answer', style: TextStyle(fontSize: 16)),
              ),
            ] else if (qType == 'true_false') ...[
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: Colors.green.shade600,
                  foregroundColor: Colors.white,
                ),
                onPressed: () => _submitUserAnswer('True'),
                child: const Text('True', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: Colors.red.shade600,
                  foregroundColor: Colors.white,
                ),
                onPressed: () => _submitUserAnswer('False'),
                child: const Text('False', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ] else ...[
              ...currentQ.shuffledOptions.map((option) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                      alignment: Alignment.centerLeft,
                    ),
                    onPressed: () => _submitUserAnswer(option),
                    child: Text(option, style: const TextStyle(fontSize: 16)),
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}
