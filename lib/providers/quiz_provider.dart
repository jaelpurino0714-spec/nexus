import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/question_model.dart';
import '../models/quiz_attempt_model.dart';
import '../repositories/question_repository.dart';
import '../repositories/quiz_repository.dart';
import '../services/question_service.dart';
import '../services/quiz_service.dart';
import '../services/sync_service.dart';
import '../core/network/connectivity_service.dart';

final questionServiceProvider = Provider<QuestionService>((ref) => QuestionService());
final quizServiceProvider = Provider<QuizService>((ref) => QuizService());
final syncServiceProvider = Provider<SyncService>((ref) => SyncService());
final connectivityServiceProvider = Provider<ConnectivityService>((ref) => ConnectivityService());

final questionRepositoryProvider = Provider<QuestionRepository>((ref) {
  return QuestionRepositoryImpl(ref.watch(questionServiceProvider));
});

final quizRepositoryProvider = Provider<QuizRepository>((ref) {
  return QuizRepositoryImpl(
    ref.watch(quizServiceProvider),
    ref.watch(syncServiceProvider),
    ref.watch(connectivityServiceProvider),
  );
});

class ActiveQuizState {
  final String topicId;
  final String quizType;
  final List<PreparedQuestion> questions;
  final int currentIndex;
  final int score;
  final int correctCount;
  final int wrongCount;
  final int secondsRemaining;
  final List<Map<String, dynamic>> recordedAnswers;
  final bool isCompleted;
  final QuizAttemptModel? resultAttempt;

  ActiveQuizState({
    required this.topicId,
    required this.quizType,
    required this.questions,
    this.currentIndex = 0,
    this.score = 0,
    this.correctCount = 0,
    this.wrongCount = 0,
    this.secondsRemaining = 30,
    this.recordedAnswers = const [],
    this.isCompleted = false,
    this.resultAttempt,
  });

  PreparedQuestion? get currentQuestion =>
      questions.isNotEmpty && currentIndex < questions.length
          ? questions[currentIndex]
          : null;

  ActiveQuizState copyWith({
    String? topicId,
    String? quizType,
    List<PreparedQuestion>? questions,
    int? currentIndex,
    int? score,
    int? correctCount,
    int? wrongCount,
    int? secondsRemaining,
    List<Map<String, dynamic>>? recordedAnswers,
    bool? isCompleted,
    QuizAttemptModel? resultAttempt,
  }) {
    return ActiveQuizState(
      topicId: topicId ?? this.topicId,
      quizType: quizType ?? this.quizType,
      questions: questions ?? this.questions,
      currentIndex: currentIndex ?? this.currentIndex,
      score: score ?? this.score,
      correctCount: correctCount ?? this.correctCount,
      wrongCount: wrongCount ?? this.wrongCount,
      secondsRemaining: secondsRemaining ?? this.secondsRemaining,
      recordedAnswers: recordedAnswers ?? this.recordedAnswers,
      isCompleted: isCompleted ?? this.isCompleted,
      resultAttempt: resultAttempt ?? this.resultAttempt,
    );
  }
}

class QuizNotifier extends StateNotifier<ActiveQuizState?> {
  final QuestionRepository _questionRepo;
  final QuizRepository _quizRepo;
  Timer? _timer;

  QuizNotifier(this._questionRepo, this._quizRepo) : super(null);

  Future<void> startQuiz({
    required String topicId,
    required String quizType,
  }) async {
    final questions = await _questionRepo.getPreparedQuestionsForQuiz(topicId);

    if (questions.isEmpty) return;

    state = ActiveQuizState(
      topicId: topicId,
      quizType: quizType,
      questions: questions,
      secondsRemaining: questions[0].question.timeLimit,
    );

    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state == null || state!.isCompleted) {
        timer.cancel();
        return;
      }

      if (state!.secondsRemaining > 1) {
        state = state!.copyWith(secondsRemaining: state!.secondsRemaining - 1);
      } else {
        // Time ran out for this question
        submitAnswer(selectedAnswer: 'NO_ANSWER', timeTaken: state!.currentQuestion!.question.timeLimit);
      }
    });
  }

  Future<void> submitAnswer({
    required String selectedAnswer,
    required int timeTaken,
  }) async {
    if (state == null || state!.isCompleted) return;

    _timer?.cancel();

    final currentQ = state!.currentQuestion!.question;
    bool isCorrect = selectedAnswer.toUpperCase() == currentQ.correctAnswer.toUpperCase();

    int newScore = state!.score + (isCorrect ? 10 : 0);
    int newCorrect = state!.correctCount + (isCorrect ? 1 : 0);
    int newWrong = state!.wrongCount + (isCorrect ? 0 : 1);

    final newAnswer = {
      'question_id': currentQ.id,
      'selected_answer': selectedAnswer,
      'is_correct': isCorrect,
      'time_taken': timeTaken,
    };

    final updatedAnswers = List<Map<String, dynamic>>.from(state!.recordedAnswers)..add(newAnswer);

    if (state!.currentIndex + 1 < state!.questions.length) {
      final nextIndex = state!.currentIndex + 1;
      state = state!.copyWith(
        currentIndex: nextIndex,
        score: newScore,
        correctCount: newCorrect,
        wrongCount: newWrong,
        recordedAnswers: updatedAnswers,
        secondsRemaining: state!.questions[nextIndex].question.timeLimit,
      );
      _startTimer();
    } else {
      // Quiz Finished!
      final double pct = ((newCorrect / state!.questions.length) * 100);
      state = state!.copyWith(
        score: newScore,
        correctCount: newCorrect,
        wrongCount: newWrong,
        recordedAnswers: updatedAnswers,
        isCompleted: true,
      );

      // Finish attempt
      final attempt = await _quizRepo.submitQuizAttempt(
        studentId: 'TEMP_STUDENT_ID',
        topicId: state!.topicId,
        quizType: state!.quizType,
        score: newScore,
        correct: newCorrect,
        wrong: newWrong,
        percentage: pct,
        duration: 120, // default placeholder
        answersData: updatedAnswers,
      );

      state = state!.copyWith(resultAttempt: attempt);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

final quizProvider = StateNotifierProvider<QuizNotifier, ActiveQuizState?>((ref) {
  return QuizNotifier(
    ref.watch(questionRepositoryProvider),
    ref.watch(quizRepositoryProvider),
  );
});
