import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/quiz_provider.dart';
import '../models/question_model.dart';
import '../services/audio_service.dart';
import '../providers/character_provider.dart';

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
  String? _userSelectedAns;
  bool _hasAnswered = false;
  bool _isAnswerCorrect = false;

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
    AudioService.instance.stopTimerAudio();
    _idInputController.dispose();
    super.dispose();
  }

  void _onAnswerSelected(String ans) {
    if (_hasAnswered) return;
    AudioService.instance.stopTimerAudio();

    final quizState = ref.read(quizProvider);
    if (quizState != null && quizState.currentQuestion != null) {
      final currentQ = quizState.currentQuestion!.question;
      bool isCorrect = false;
      final selStr = ans.trim();
      final corrStr = currentQ.correctAnswer.trim();

      if (currentQ.questionType == 'identification') {
        final sel = selStr.toLowerCase();
        final corr = corrStr.toLowerCase();
        isCorrect = sel.isNotEmpty && (sel == corr || corr.contains(sel) || sel.contains(corr));
      } else if (currentQ.questionType == 'true_false') {
        final sel = selStr.toLowerCase();
        final corr = corrStr.toLowerCase();
        isCorrect = (sel == corr) ||
            (sel.startsWith('t') && corr.startsWith('t')) ||
            (sel.startsWith('f') && corr.startsWith('f'));
      } else {
        Map<String, String> indexToLetter = {'0': 'A', '1': 'B', '2': 'C', '3': 'D'};
        Map<String, String> optionMap = {
          'A': currentQ.optionA.trim(),
          'B': currentQ.optionB.trim(),
          'C': (currentQ.optionC ?? '').trim(),
          'D': (currentQ.optionD ?? '').trim(),
        };
        String upperSel = indexToLetter[selStr.toUpperCase()] ?? selStr.toUpperCase();
        String upperCorr = indexToLetter[corrStr.toUpperCase()] ?? corrStr.toUpperCase();

        if (upperSel == upperCorr) {
          isCorrect = true;
        } else if (optionMap.containsKey(upperSel)) {
          String selOptionText = optionMap[upperSel]!.toUpperCase();
          isCorrect = (selOptionText == upperCorr) || (upperCorr.length == 1 && upperSel == upperCorr);
        } else if (optionMap.containsKey(upperCorr)) {
          String corrOptionText = optionMap[upperCorr]!.toUpperCase();
          isCorrect = (upperSel == corrOptionText) ||
              (corrOptionText.isNotEmpty && (upperSel.contains(corrOptionText) || corrOptionText.contains(upperSel)));
        }
      }

      setState(() {
        _userSelectedAns = ans;
        _hasAnswered = true;
        _isAnswerCorrect = isCorrect;
      });

      ref.read(characterProvider.notifier).triggerFloatingReaction(
            isCorrect ? 'correct_answer' : 'wrong_answer',
          );
    }
  }

  void _proceedNextQuestion() {
    final durationSec = ((DateTime.now().millisecondsSinceEpoch - _startTime) / 1000).round();
    _startTime = DateTime.now().millisecondsSinceEpoch;
    _idInputController.clear();
    setState(() {
      _userSelectedAns = null;
      _hasAnswered = false;
      _isAnswerCorrect = false;
    });
    ref.read(quizProvider.notifier).submitAnswer(
          selectedAnswer: _userSelectedAns ?? '',
          timeTaken: durationSec,
        );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<ActiveQuizState?>(quizProvider, (previous, next) {
      if (next != null && next.secondsRemaining == 0 && !_hasAnswered && !next.isCompleted) {
        setState(() {
          _hasAnswered = true;
          _isAnswerCorrect = false;
          _userSelectedAns = '[Time Expired]';
        });
      }
    });

    final quizState = ref.watch(quizProvider);

    if (quizState == null || quizState.questions.isEmpty) {
      return const Scaffold(
        backgroundColor: Color(0xFF060214),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF00F2FE))),
      );
    }

    if (quizState.isCompleted) {
      Future.microtask(() => context.go('/student/result'));
      return const Scaffold(
        backgroundColor: Color(0xFF060214),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF00F2FE))),
      );
    }

    final currentQ = quizState.currentQuestion!;
    final qType = currentQ.question.questionType;

    return Scaffold(
      backgroundColor: const Color(0xFF060214),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF00F2FE)),
          onPressed: () => context.pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Text(
                  'Question ${quizState.currentIndex + 1} of ${quizState.questions.length}',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF), fontWeight: FontWeight.bold),
                ),
                const Text(' • ', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 12)),
                Text(
                  'Points: ${quizState.totalPoints}',
                  style: const TextStyle(fontSize: 12, color: Color(0xFFF59E0B), fontWeight: FontWeight.w800),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
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
                color: const Color(0xFFA855F7).withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.3)),
              ),
              child: Text(
                '${widget.quizType.toUpperCase()} (${widget.questionType.toUpperCase()}) • ${widget.topicTitle}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, color: Color(0xFFC084FC), fontWeight: FontWeight.w700),
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
              icon: const Icon(Icons.pause_rounded, size: 16),
              label: const Text('Exit Quiz', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Dark Speed Tapping Countdown Time Card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF130A2A), Color(0xFF090518)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.4), width: 1.5),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.6), blurRadius: 16, offset: const Offset(0, 4)),
                  BoxShadow(color: const Color(0xFFA855F7).withOpacity(0.15), blurRadius: 20),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1044),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.5), width: 1.5),
                    ),
                    child: const Center(
                      child: Text('⚡', style: TextStyle(fontSize: 22)),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text(
                        'SPEED TAPPING COUNTDOWN TIME',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFC084FC),
                          letterSpacing: 0.6,
                        ),
                      ),
                      Text(
                        '${quizState.secondsRemaining < 10 ? "0" : ""}${quizState.secondsRemaining}.00s',
                        style: const TextStyle(
                          fontSize: 24,
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

            // Main Question Card with Feedback Card below
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF09041A), Color(0xFF0D0626)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF9333EA).withOpacity(0.4), width: 1.5),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.7), blurRadius: 30, offset: const Offset(0, 8)),
                  BoxShadow(color: const Color(0xFF9333EA).withOpacity(0.15), blurRadius: 25),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    currentQ.question.question,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 24),

                  if (qType == 'identification') ...[
                    TextField(
                      controller: _idInputController,
                      enabled: !_hasAnswered,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Type your answer here...',
                        hintStyle: const TextStyle(color: Color(0xFF71717A)),
                        filled: true,
                        fillColor: const Color(0xFF120A2E),
                        contentPadding: const EdgeInsets.all(18),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(18),
                          borderSide: BorderSide(color: const Color(0xFFA855F7).withOpacity(0.5), width: 2),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(18),
                          borderSide: const BorderSide(color: Color(0xFF00F2FE), width: 2),
                        ),
                      ),
                      onSubmitted: (val) => _onAnswerSelected(val),
                    ),
                    if (!_hasAnswered) ...[
                      const SizedBox(height: 18),
                      Container(
                        width: double.infinity,
                        height: 52,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFA855F7), Color(0xFF06B6D4)],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFA855F7).withOpacity(0.35),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          onPressed: () => _onAnswerSelected(_idInputController.text),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Submit Answer',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              SizedBox(width: 8),
                              Icon(Icons.arrow_forward_rounded, size: 20, color: Colors.white),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ] else if (qType == 'true_false') ...[
                    Row(
                      children: [
                        Expanded(
                          child: _buildOptionButton(
                            'True',
                            'T',
                            currentQ.question.correctAnswer,
                            () => _onAnswerSelected('True'),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: _buildOptionButton(
                            'False',
                            'F',
                            currentQ.question.correctAnswer,
                            () => _onAnswerSelected('False'),
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    LayoutBuilder(
                      builder: (context, constraints) {
                        bool isMobile = constraints.maxWidth < 520;
                        if (isMobile) {
                          return Column(
                            children: [
                              _buildOptionButton(
                                currentQ.shuffledOptions.isNotEmpty ? currentQ.shuffledOptions[0] : 'Option A',
                                'A',
                                currentQ.question.correctAnswer,
                                () => _onAnswerSelected(currentQ.shuffledOptions[0]),
                              ),
                              if (currentQ.shuffledOptions.length > 1) ...[
                                const SizedBox(height: 12),
                                _buildOptionButton(
                                  currentQ.shuffledOptions[1],
                                  'B',
                                  currentQ.question.correctAnswer,
                                  () => _onAnswerSelected(currentQ.shuffledOptions[1]),
                                ),
                              ],
                              if (currentQ.shuffledOptions.length > 2) ...[
                                const SizedBox(height: 12),
                                _buildOptionButton(
                                  currentQ.shuffledOptions[2],
                                  'C',
                                  currentQ.question.correctAnswer,
                                  () => _onAnswerSelected(currentQ.shuffledOptions[2]),
                                ),
                              ],
                              if (currentQ.shuffledOptions.length > 3) ...[
                                const SizedBox(height: 12),
                                _buildOptionButton(
                                  currentQ.shuffledOptions[3],
                                  'D',
                                  currentQ.question.correctAnswer,
                                  () => _onAnswerSelected(currentQ.shuffledOptions[3]),
                                ),
                              ],
                            ],
                          );
                        } else {
                          return GridView.count(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisCount: 2,
                            crossAxisSpacing: 14,
                            mainAxisSpacing: 14,
                            childAspectRatio: 2.2,
                            children: [
                              _buildOptionButton(
                                currentQ.shuffledOptions.isNotEmpty ? currentQ.shuffledOptions[0] : 'Option A',
                                'A',
                                currentQ.question.correctAnswer,
                                () => _onAnswerSelected(currentQ.shuffledOptions[0]),
                              ),
                              if (currentQ.shuffledOptions.length > 1)
                                _buildOptionButton(
                                  currentQ.shuffledOptions[1],
                                  'B',
                                  currentQ.question.correctAnswer,
                                  () => _onAnswerSelected(currentQ.shuffledOptions[1]),
                                ),
                              if (currentQ.shuffledOptions.length > 2)
                                _buildOptionButton(
                                  currentQ.shuffledOptions[2],
                                  'C',
                                  currentQ.question.correctAnswer,
                                  () => _onAnswerSelected(currentQ.shuffledOptions[2]),
                                ),
                              if (currentQ.shuffledOptions.length > 3)
                                _buildOptionButton(
                                  currentQ.shuffledOptions[3],
                                  'D',
                                  currentQ.question.correctAnswer,
                                  () => _onAnswerSelected(currentQ.shuffledOptions[3]),
                                ),
                            ],
                          );
                        }
                      },
                    ),
                  ],

                  // Feedback Box Banner (Matches Image 2 Dark Neon Sci-Fi Theme)
                  if (_hasAnswered) ...[
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: _isAnswerCorrect
                              ? [const Color(0xFA091E16), const Color(0xFA04120D)]
                              : [const Color(0xFA240A18), const Color(0xFA17050F)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _isAnswerCorrect
                              ? const Color(0xFF10B981)
                              : const Color(0xFFF43F5E),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: _isAnswerCorrect
                                ? const Color(0xFF10B981).withOpacity(0.35)
                                : const Color(0xFFF43F5E).withOpacity(0.35),
                            blurRadius: 24,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _isAnswerCorrect
                                ? '✅ Correct!'
                                : (_userSelectedAns == '[Time Expired]'
                                    ? '⏰ Time\'s Up! (Wrong - 0 pts)'
                                    : '❌ Incorrect!'),
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: _isAnswerCorrect ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                            ),
                          ),
                          const SizedBox(height: 6),
                          if (!_isAnswerCorrect) ...[
                            const SizedBox(height: 6),
                            Text(
                              'Correct Answer: ${currentQ.question.correctAnswer}',
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF38BDF8),
                                fontWeight: FontWeight.w700,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                          const SizedBox(height: 14),
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: Container(
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [Color(0xFF9333EA), Color(0xFF06B6D4)],
                                  begin: Alignment.centerLeft,
                                  end: Alignment.centerRight,
                                ),
                                borderRadius: BorderRadius.circular(9999),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF9333EA).withOpacity(0.4),
                                    blurRadius: 16,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9999)),
                                ),
                                onPressed: _proceedNextQuestion,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      quizState.currentIndex >= quizState.questions.length - 1
                                          ? 'Finish Quiz 🏁'
                                          : 'Next Question',
                                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white),
                                    ),
                                    const SizedBox(width: 10),
                                    const CircleAvatar(
                                      radius: 14,
                                      backgroundColor: Colors.white24,
                                      child: Icon(Icons.arrow_forward_rounded, size: 16, color: Colors.white),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
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

  Widget _buildOptionButton(String text, String letter, String correctAnswer, VoidCallback onTap) {
    bool isSelected = _userSelectedAns == text;
    bool isCorrectOpt = text.trim().toLowerCase() == correctAnswer.trim().toLowerCase() ||
        letter.trim().toLowerCase() == correctAnswer.trim().toLowerCase();

    Color cardBgStart = const Color(0xEA140C30);
    Color cardBgEnd = const Color(0xEA0C0720);
    Color borderColor = const Color(0xFF9333EA).withOpacity(0.4);
    Color textColor = Colors.white;
    Color badgeBg = const Color(0xFF1E1044);
    Color badgeBorder = const Color(0xFFA855F7).withOpacity(0.5);
    Color badgeLetterColor = const Color(0xFFD946EF);
    List<BoxShadow> boxShadows = [const BoxShadow(color: Colors.black45, blurRadius: 10, offset: Offset(0, 4))];

    if (_hasAnswered) {
      if (isSelected && !_isAnswerCorrect) {
        // Wrong Selection by user (Dark Ruby Glow Card)
        cardBgStart = const Color(0xFA2A0A18);
        cardBgEnd = const Color(0xFA1E0712);
        borderColor = const Color(0xFFF43F5E);
        textColor = Colors.white;
        badgeBg = const Color(0xFFEF4444);
        badgeBorder = const Color(0xFFDC2626);
        badgeLetterColor = Colors.white;
        boxShadows = [
          BoxShadow(color: const Color(0xFFF43F5E).withOpacity(0.5), blurRadius: 18, offset: const Offset(0, 4))
        ];
      } else if (isCorrectOpt) {
        // Correct Option (Dark Emerald Glow Card)
        cardBgStart = const Color(0xFA052A1D);
        cardBgEnd = const Color(0xFA031B12);
        borderColor = const Color(0xFF10B981);
        textColor = Colors.white;
        badgeBg = const Color(0xFF10B981);
        badgeBorder = const Color(0xFF059669);
        badgeLetterColor = Colors.white;
        boxShadows = [
          BoxShadow(color: const Color(0xFF10B981).withOpacity(0.5), blurRadius: 18, offset: const Offset(0, 4))
        ];
      } else {
        // Dimmed unselected cards when answered
        cardBgStart = const Color(0xAA0D0720);
        cardBgEnd = const Color(0xAA080415);
        borderColor = const Color(0xFF9333EA).withOpacity(0.2);
        textColor = Colors.white54;
      }
    }

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [cardBgStart, cardBgEnd],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor, width: 1.5),
        boxShadow: boxShadows,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          splashColor: const Color(0xFF00F2FE).withOpacity(0.15),
          highlightColor: const Color(0xFFA855F7).withOpacity(0.08),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: badgeBorder, width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      letter,
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        color: badgeLetterColor,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    text,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: textColor,
                      height: 1.3,
                    ),
                    maxLines: 4,
                    overflow: TextOverflow.visible,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
