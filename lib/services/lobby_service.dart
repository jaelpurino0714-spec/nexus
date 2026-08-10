import 'dart:async';
import 'dart:math';
import '../models/question_model.dart';

class LobbyParticipant {
  final String id;
  final String name;
  final String? photoUrl;
  final String gradeLevel;
  final String section;
  int currentQuestionIndex;
  int totalQuestions;
  int score;
  int correctCount;
  int wrongCount;
  bool isFinished;

  LobbyParticipant({
    required this.id,
    required this.name,
    this.photoUrl,
    this.gradeLevel = 'Grade 10',
    this.section = 'Section A',
    this.currentQuestionIndex = 0,
    this.totalQuestions = 15,
    this.score = 0,
    this.correctCount = 0,
    this.wrongCount = 0,
    this.isFinished = false,
  });
}

class QuizLobby {
  final String accessCode;
  final String hostName;
  final String? hostPhotoUrl;
  final String quizTitle;
  final List<QuestionModel> questions;
  final int timeLimitPerQuestion;
  final int maxParticipants;
  bool isStarted;
  bool isFinished;
  final List<LobbyParticipant> participants;

  QuizLobby({
    required this.accessCode,
    required this.hostName,
    this.hostPhotoUrl,
    required this.quizTitle,
    required this.questions,
    required this.timeLimitPerQuestion,
    required this.maxParticipants,
    this.isStarted = false,
    this.isFinished = false,
    List<LobbyParticipant>? participants,
  }) : participants = participants ?? [];
}

class LobbyService {
  static final LobbyService instance = LobbyService._internal();
  LobbyService._internal();

  final Map<String, QuizLobby> _lobbies = {};
  final StreamController<QuizLobby> _lobbyStreamController = StreamController<QuizLobby>.broadcast();

  Stream<QuizLobby> get lobbyStream => _lobbyStreamController.stream;

  String generateAccessCode() {
    final rng = Random();
    String code;
    do {
      code = (1000000 + rng.nextInt(9000000)).toString();
    } while (_lobbies.containsKey(code));
    return code;
  }

  QuizLobby createLobby({
    required String hostName,
    String? hostPhotoUrl,
    required String quizTitle,
    required List<QuestionModel> questions,
    required int timeLimitPerQuestion,
    required int maxParticipants,
  }) {
    final code = generateAccessCode();
    final lobby = QuizLobby(
      accessCode: code,
      hostName: hostName,
      hostPhotoUrl: hostPhotoUrl,
      quizTitle: quizTitle,
      questions: questions,
      timeLimitPerQuestion: timeLimitPerQuestion,
      maxParticipants: maxParticipants,
    );

    _lobbies[code] = lobby;
    _notifyLobby(lobby);
    return lobby;
  }

  QuizLobby? getLobby(String accessCode) {
    return _lobbies[accessCode];
  }

  bool joinLobby({
    required String accessCode,
    required String participantId,
    required String participantName,
    String? photoUrl,
    String gradeLevel = 'Grade 10',
    String section = 'Section A',
  }) {
    final lobby = _lobbies[accessCode];
    if (lobby == null || lobby.isStarted) return false;

    final existingIndex = lobby.participants.indexWhere((p) => p.id == participantId);
    if (existingIndex == -1) {
      lobby.participants.add(LobbyParticipant(
        id: participantId,
        name: participantName,
        photoUrl: photoUrl,
        gradeLevel: gradeLevel,
        section: section,
        totalQuestions: lobby.questions.length,
      ));
    }

    _notifyLobby(lobby);
    return true;
  }

  void startQuiz(String accessCode) {
    final lobby = _lobbies[accessCode];
    if (lobby == null) return;
    lobby.isStarted = true;
    _notifyLobby(lobby);
  }

  void updateParticipantProgress({
    required String accessCode,
    required String participantId,
    required int questionIndex,
    required int score,
    required int correctCount,
    required int wrongCount,
    required bool isFinished,
  }) {
    final lobby = _lobbies[accessCode];
    if (lobby == null) return;

    final participant = lobby.participants.firstWhere(
      (p) => p.id == participantId,
      orElse: () => LobbyParticipant(id: participantId, name: 'Student'),
    );

    participant.currentQuestionIndex = questionIndex;
    participant.score = score;
    participant.correctCount = correctCount;
    participant.wrongCount = wrongCount;
    participant.isFinished = isFinished;

    if (lobby.participants.isNotEmpty && lobby.participants.every((p) => p.isFinished)) {
      lobby.isFinished = true;
    }

    _notifyLobby(lobby);
  }

  void _notifyLobby(QuizLobby lobby) {
    _lobbyStreamController.add(lobby);
  }
}
