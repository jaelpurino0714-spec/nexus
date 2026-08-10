import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/question_model.dart';
import '../models/quiz_attempt_model.dart';
import '../repositories/question_repository.dart';
import '../repositories/quiz_repository.dart';
import '../services/question_service.dart';
import '../services/quiz_service.dart';
import '../services/sync_service.dart';
import '../services/lobby_service.dart';
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
  final int streak;
  final int secondsRemaining;
  final List<Map<String, dynamic>> recordedAnswers;
  final bool isCompleted;
  final QuizAttemptModel? resultAttempt;
  final String? lobbyAccessCode;
  final String? participantId;

  ActiveQuizState({
    required this.topicId,
    required this.quizType,
    required this.questions,
    this.currentIndex = 0,
    this.score = 0,
    this.correctCount = 0,
    this.wrongCount = 0,
    this.streak = 0,
    this.secondsRemaining = 30,
    this.recordedAnswers = const [],
    this.isCompleted = false,
    this.resultAttempt,
    this.lobbyAccessCode,
    this.participantId,
  });

  int get totalPoints => score;

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
    int? streak,
    int? secondsRemaining,
    List<Map<String, dynamic>>: recordedAnswers,
    bool? isCompleted,
    QuizAttemptModel? resultAttempt,
    String? lobbyAccessCode,
    String? participantId,
  }) {
    return ActiveQuizState(
      topicId: topicId ?? this.topicId,
      quizType: quizType ?? this.quizType,
      questions: questions ?? this.questions,
      currentIndex: currentIndex ?? this.currentIndex,
      score: score ?? this.score,
      correctCount: correctCount ?? this.correctCount,
      wrongCount: wrongCount ?? this.wrongCount,
      streak: streak ?? this.streak,
      secondsRemaining: secondsRemaining ?? this.secondsRemaining,
      recordedAnswers: recordedAnswers ?? this.recordedAnswers,
      isCompleted: isCompleted ?? this.isCompleted,
      resultAttempt: resultAttempt ?? this.resultAttempt,
      lobbyAccessCode: lobbyAccessCode ?? this.lobbyAccessCode,
      participantId: participantId ?? this.participantId,
    );
  }
}

class QuizNotifier extends StateNotifier<ActiveQuizState?> {
  final QuestionRepository _questionRepo;
  final QuizRepository _quizRepo;
  final QuestionService _questionService;
  Timer? _timer;

  QuizNotifier(this._questionRepo, this._quizRepo, this._questionService) : super(null);

  Future<void> startQuiz({
    required String topicId,
    required String quizType,
    String? questionType,
    String topicTitle = 'Science Topic',
    List<QuestionModel>? customQuestions,
    int? customTimeLimit,
    int? customQuestionCount,
    String? lobbyAccessCode,
    String? participantId,
  }) async {
    List<PreparedQuestion> questions = [];

    if (customQuestions != null && customQuestions.isNotEmpty) {
      questions = _questionService.prepareQuizQuestions(customQuestions);
    } else {
      questions = await _questionRepo.getPreparedQuestionsForQuiz(
        topicId,
        questionType: questionType,
        quizType: quizType,
        topicTitle: topicTitle,
      );
    }

    if (customQuestionCount != null && customQuestionCount > 0 && questions.length > customQuestionCount) {
      questions = questions.sublist(0, customQuestionCount);
    }

    if (customTimeLimit != null && customTimeLimit >= 5) {
      questions = questions.map((pq) {
        final q = pq.question;
        final customQ = QuestionModel(
          id: q.id,
          topicId: q.topicId,
          questionTypeId: q.questionTypeId,
          quizType: q.quizType,
          question: q.question,
          questionType: q.questionType,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          imageUrl: q.imageUrl,
          timeLimit: customTimeLimit,
          isActive: q.isActive,
          createdBy: q.createdBy,
          createdAt: q.createdAt,
        );
        return PreparedQuestion(question: customQ, shuffledOptions: pq.shuffledOptions);
      }).toList();
    }

    if (questions.isEmpty) return;

    state = ActiveQuizState(
      topicId: topicId,
      quizType: quizType,
      questions: questions,
      secondsRemaining: questions[0].question.timeLimit,
      lobbyAccessCode: lobbyAccessCode,
      participantId: participantId,
    );

    _syncLobbyProgress();
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
    bool isCorrect = false;

    if (currentQ.questionType == 'identification') {
      final sel = selectedAnswer.trim().toLowerCase();
      final corr = currentQ.correctAnswer.trim().toLowerCase();
      isCorrect = sel.isNotEmpty && (sel == corr || corr.contains(sel) || sel.contains(corr));
    } else {
      isCorrect = selectedAnswer.trim().toUpperCase() == currentQ.correctAnswer.trim().toUpperCase();
    }

    int newScore = state!.score + (isCorrect ? 10 : 0);
    int newCorrect = state!.correctCount + (isCorrect ? 1 : 0);
    int newWrong = state!.wrongCount + (isCorrect ? 0 : 1);
    int newStreak = isCorrect ? state!.streak + 1 : 0;

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
        streak: newStreak,
        recordedAnswers: updatedAnswers,
        secondsRemaining: state!.questions[nextIndex].question.timeLimit,
      );
      _syncLobbyProgress();
      _startTimer();
    } else {
      // Quiz Finished!
      final double pct = ((newCorrect / state!.questions.length) * 100);
      state = state!.copyWith(
        score: newScore,
        correctCount: newCorrect,
        wrongCount: newWrong,
        streak: newStreak,
        recordedAnswers: updatedAnswers,
        isCompleted: true,
      );

      _syncLobbyProgress();

      final attempt = await _quizRepo.submitQuizAttempt(
        studentId: state!.participantId ?? 'TEMP_STUDENT_ID',
        topicId: state!.topicId,
        quizType: state!.quizType,
        score: newScore,
        correct: newCorrect,
        wrong: newWrong,
        percentage: pct,
        duration: 120,
        answersData: updatedAnswers,
      );

      state = state!.copyWith(resultAttempt: attempt);
    }
  }

  void _syncLobbyProgress() {
    if (state == null) return;
    if (state!.lobbyAccessCode != null && state!.participantId != null) {
      LobbyService.instance.updateParticipantProgress(
        accessCode: state!.lobbyAccessCode!,
        participantId: state!.participantId!,
        questionIndex: state!.currentIndex,
        score: state!.score,
        correctCount: state!.correctCount,
        wrongCount: state!.wrongCount,
        isFinished: state!.isCompleted,
      );
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
    ref.watch(questionServiceProvider),
  );
});
