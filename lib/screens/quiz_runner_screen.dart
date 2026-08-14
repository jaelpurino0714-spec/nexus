import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/quiz_provider.dart';
import '../models/question_model.dart';

class QuizRunnerScreen extends ConsumerStatefulWidget {
  final String topicId;
  final String topicTitle;
  final String quizType;
  final String questionType;
  final int? customTimeLimit;
  final int? customQuestionCount;
  final List<QuestionModel>? customQuestions;
  final String? lobbyAccessCode;
  final String? participantId;

  const QuizRunnerScreen({
    super.key,
    required this.topicId,
    this.topicTitle = 'Science Topic',
    required this.quizType,
    this.questionType = 'multiple_choice',
    this.customTimeLimit,
    this.customQuestionCount,
    this.customQuestions,
    this.lobbyAccessCode,
    this.participantId,
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
            customTimeLimit: widget.customTimeLimit,
            customQuestionCount: widget.customQuestionCount,
            customQuestions: widget.customQuestions,
            lobbyAccessCode: widget.lobbyAccessCode,
            participantId: widget.participantId,
          );
    });
  }

  @override
  void dispose() {
    _idInputController.dispose();
    super.dispose();
  }

  void _submitUserAnswer(String ans) {
    final quizState = ref.read(quizProvider);
    if (quizState != null && quizState.currentQuestion != null) {
      final currentQ = quizState.currentQuestion!.question;
      bool isCorrect = false;
      if (currentQ.questionType == 'identification') {
        final sel = ans.trim().toLowerCase();
        final corr = currentQ.correctAnswer.trim().toLowerCase();
        isCorrect = sel.isNotEmpty && (sel == corr || corr.contains(sel) || sel.contains(corr));
      } else {
        isCorrect = ans.trim().toUpperCase() == currentQ.correctAnswer.trim().toUpperCase();
      }

      ref.read(characterProvider.notifier).triggerFloatingReaction(
            isCorrect ? 'correct_answer' : 'wrong_answer',
          );
    }

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
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Text(
                  'Question ${quizState.currentIndex + 1} of ${quizState.questions.length}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold),
                ),
                const Text(' • ', style: TextStyle(color: Colors.grey, fontSize: 12)),
                Text(
                  'Points: ${quizState.totalPoints}',
                  style: const TextStyle(fontSize: 12, color: Color(0xFFF59E0B), fontWeight: FontWeight.w800),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.25)),
                  ),
                  child: Text(
                    '🔥 ${quizState.streak}',
                    style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444), fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF8B5CF6).withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.25)),
              ),
              child: Text(
                '${widget.quizType.toUpperCase()} (${widget.questionType.toUpperCase()}) • ${widget.topicTitle}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, color: Color(0xFF6D28D9), fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: TextButton.icon(
              style: TextButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444).withOpacity(0.15),
                foregroundColor: const Color(0xFFEF4444),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              onPressed: () => context.pop(),
              icon: const Icon(Icons.pause, size: 16),
              label: const Text('Exit Quiz', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAlignment.stretch,
          children: [
            // Dark Speed Tapping Countdown Time Card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF0B0F19),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.4), width: 1.5),
                boxShadow: const [
                  BoxShadow(color: Colors.black26, blurRadius: 12, offset: Offset(0, 4)),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: Color(0xFF111827),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Text('⚡', style: TextStyle(fontSize: 22)),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAlignment.end,
                    children: [
                      const Text(
                        'SPEED TAPPING COUNTDOWN TIME',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFF59E0B),
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        '${quizState.secondsRemaining < 10 ? "0" : ""}${quizState.secondsRemaining}.00s',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Main Light Question Card
            Container(
              padding: const EdgeInsets.all(22.0),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(24),
                boxShadow: const [
                  BoxShadow(color: Colors.black12, blurRadius: 14, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    currentQ.question.question,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 24),

                  if (qType == 'identification') ...[
                    TextField(
                      controller: _idInputController,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      decoration: InputDecoration(
                        hintText: 'Type your answer here...',
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.all(18),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(18),
                          borderSide: const BorderSide(color: Color(0xFFCBD5E1), width: 2),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(18),
                          borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 2),
                        ),
                      ),
                      onSubmitted: (val) => _submitUserAnswer(val),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                        elevation: 4,
                      ),
                      onPressed: () => _submitUserAnswer(_idInputController.text),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Submit Answer', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          SizedBox(width: 8),
                          CircleAvatar(
                            radius: 12,
                            backgroundColor: Color(0xFF2563EB),
                            child: Icon(Icons.arrow_forward, size: 14, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ] else if (qType == 'true_false') ...[
                    Row(
                      children: [
                        Expanded(
                          child: _buildOptionButton('True', 'T', '✅', () => _submitUserAnswer('True')),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildOptionButton('False', 'F', '❌', () => _submitUserAnswer('False')),
                        ),
                      ],
                    ),
                  ] else ...[
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.6,
                      children: [
                        _buildOptionButton(
                          currentQ.shuffledOptions.isNotEmpty ? currentQ.shuffledOptions[0] : 'Option A',
                          'A',
                          _getOptionIcon(currentQ.shuffledOptions.isNotEmpty ? currentQ.shuffledOptions[0] : '', 0),
                          () => _submitUserAnswer(currentQ.shuffledOptions[0]),
                        ),
                        if (currentQ.shuffledOptions.length > 1)
                          _buildOptionButton(
                            currentQ.shuffledOptions[1],
                            'B',
                            _getOptionIcon(currentQ.shuffledOptions[1], 1),
                            () => _submitUserAnswer(currentQ.shuffledOptions[1]),
                          ),
                        if (currentQ.shuffledOptions.length > 2)
                          _buildOptionButton(
                            currentQ.shuffledOptions[2],
                            'C',
                            _getOptionIcon(currentQ.shuffledOptions[2], 2),
                            () => _submitUserAnswer(currentQ.shuffledOptions[2]),
                          ),
                        if (currentQ.shuffledOptions.length > 3)
                          _buildOptionButton(
                            currentQ.shuffledOptions[3],
                            'D',
                            _getOptionIcon(currentQ.shuffledOptions[3], 3),
                            () => _submitUserAnswer(currentQ.shuffledOptions[3]),
                          ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getOptionIcon(String text, int index) {
    if (text.isEmpty) return ['🧪', '⚛️', '🔬', '⚡'][index % 4];
    final lower = text.toLowerCase();
    
    if (lower.contains('heat') || lower.contains('fire') || lower.contains('temperature') || lower.contains('warm') || lower.contains('thermal') || lower.contains('burn') || lower.contains('combust')) {
      return '🔥';
    }
    if (lower.contains('gas') || lower.contains('vapor') || lower.contains('evaporat') || lower.contains('bubble') || lower.contains('air') || lower.contains('oxygen') || lower.contains('carbon')) {
      return '💨';
    }
    if (lower.contains('liquid') || lower.contains('water') || lower.contains('fluid') || lower.contains('solution') || lower.contains('acid') || lower.contains('base') || lower.contains('aqueous')) {
      return '💧';
    }
    if (lower.contains('solid') || lower.contains('precipitat') || lower.contains('down') || lower.contains('crystal') || lower.contains('sediment') || lower.contains('metal') || lower.contains('rock')) {
      return '🔻';
    }
    if (lower.contains('electricity') || lower.contains('power') || lower.contains('voltage') || lower.contains('current') || lower.contains('charge') || lower.contains('electron') || lower.contains('energy')) {
      return '⚡';
    }
    if (lower.contains('light') || lower.contains('sun') || lower.contains('solar') || lower.contains('photon') || lower.contains('ray')) {
      return '☀️';
    }
    if (lower.contains('force') || lower.contains('motion') || lower.contains('speed') || lower.contains('velocity') || lower.contains('accel') || lower.contains('projectile') || lower.contains('momentum') || lower.contains('collision')) {
      return '🚀';
    }
    if (lower.contains('cell') || lower.contains('dna') || lower.contains('gene') || lower.contains('bio') || lower.contains('organism') || lower.contains('homeostasis') || lower.contains('life')) {
      return '🧬';
    }
    if (lower.contains('earth') || lower.contains('plate') || lower.contains('tectonic') || lower.contains('volcano') || lower.contains('climate') || lower.contains('ecosystem') || lower.contains('global')) {
      return '🌍';
    }
    if (lower.contains('chemical') || lower.contains('reaction') || lower.contains('atom') || lower.contains('element') || lower.contains('compound') || lower.contains('molecule')) {
      return '⚛️';
    }
    
    final fallbacks = ['🧪', '⚛️', '🔬', '⚡'];
    return fallbacks[index % fallbacks.length];
  }

  Widget _buildOptionButton(String text, String letter, String icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFE2E8F0), width: 2),
          boxShadow: const [
            BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2)),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFEDE9FE),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Text(letter, style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF6D28D9), fontSize: 13)),
                  const SizedBox(width: 4),
                  Text(icon, style: const TextStyle(fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                text,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
