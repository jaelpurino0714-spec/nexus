import 'dart:async';
import 'dart:math';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/question_model.dart';
import 'supabase_service.dart';

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

  Map<String, dynamic> toJson(String gameId) => {
    'game_id': gameId,
    'user_id': id.startsWith('temp_') ? null : id,
    'display_name': name,
    'photo_url': photoUrl,
    'score': score,
    'correct_answers': correctCount,
    'wrong_answers': wrongCount,
    'current_question_index': currentQuestionIndex,
    'is_finished': isFinished,
  };
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
  final String? id;

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
    this.id,
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
      code = (100000 + rng.nextInt(900000)).toString();
    } while (_lobbies.containsKey(code));
    return code;
  }

  Future<QuizLobby> createLobby({
    required String hostName,
    String? hostPhotoUrl,
    required String quizTitle,
    required List<QuestionModel> questions,
    required int timeLimitPerQuestion,
    required int maxParticipants,
  }) async {
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

    // Save room to Supabase Cloud DB for cross-device joining
    try {
      final client = SupabaseService.instance.client;
      final currentUser = client.auth.currentUser;
      final userId = currentUser?.id;

      // 1. Insert into multiplayer_games
      final res = await client.from('multiplayer_games').insert({
        'room_code': code,
        'host_id': userId,
        'answer_medium': 'multiple_choice',
        'question_count': questions.length,
        'status': 'waiting',
        'current_question_index': 0,
      }).select().maybeSingle();

      // 2. Insert into quiz_lobbies table as fallback
      try {
        await client.from('quiz_lobbies').insert({
          'access_code': code,
          'host_id': userId,
          'host_name': hostName,
          'photo_url': hostPhotoUrl,
          'status': 'waiting',
          'question_count': questions.length,
        });
      } catch (_) {}

      if (res != null && res['id'] != null) {
        final gameId = res['id'].toString();
        _listenToRoomRealtime(code, gameId);
      }
    } catch (e) {
      print('Supabase createLobby sync warning: $e');
    }

    return lobby;
  }

  QuizLobby? getLobby(String accessCode) {
    final cleanCode = accessCode.trim().toUpperCase();
    return _lobbies[cleanCode] ?? _lobbies[accessCode];
  }

  Future<bool> joinLobby({
    required String accessCode,
    required String participantId,
    required String participantName,
    String? photoUrl,
    String gradeLevel = 'Grade 10',
    String section = 'Section A',
  }) async {
    final cleanCode = accessCode.trim().toUpperCase();
    QuizLobby? lobby = _lobbies[cleanCode] ?? _lobbies[accessCode];

    // Query Supabase Cloud DB if not found in local RAM
    if (lobby == null) {
      try {
        final client = SupabaseService.instance.client;

        // Query multiplayer_games
        var res = await client
            .from('multiplayer_games')
            .select('*')
            .eq('room_code', cleanCode)
            .maybeSingle();

        if (res == null) {
          // Query quiz_lobbies
          final resLobby = await client
              .from('quiz_lobbies')
              .select('*')
              .eq('access_code', cleanCode)
              .maybeSingle();

          if (resLobby != null) {
            res = {
              'id': resLobby['id'],
              'room_code': resLobby['access_code'],
              'status': resLobby['status'] ?? 'waiting',
              'host_name': resLobby['host_name'] ?? 'Host Teacher',
              'photo_url': resLobby['photo_url'],
              'question_count': resLobby['question_count'] ?? 10,
            };
          }
        }

        if (res != null) {
          final status = res['status'] as String? ?? 'waiting';
          if (status == 'finished' || status == 'cancelled') {
            return false;
          }

          lobby = QuizLobby(
            id: res['id']?.toString(),
            accessCode: cleanCode,
            hostName: res['host_name'] ?? 'Quiz Host',
            hostPhotoUrl: res['photo_url'],
            quizTitle: 'Science Multiplayer Quiz',
            questions: [],
            timeLimitPerQuestion: 20,
            maxParticipants: 50,
            isStarted: status == 'active' || status == 'in_progress',
          );
          _lobbies[cleanCode] = lobby;
        }
      } catch (e) {
        print('Supabase joinLobby query warning: $e');
      }
    }

    if (lobby == null || lobby.isStarted) return false;

    final existingIndex = lobby.participants.indexWhere((p) => p.id == participantId || p.name == participantName);
    if (existingIndex == -1) {
      final newParticipant = LobbyParticipant(
        id: participantId,
        name: participantName,
        photoUrl: photoUrl,
        gradeLevel: gradeLevel,
        section: section,
        totalQuestions: lobby.questions.isNotEmpty ? lobby.questions.length : 15,
      );
      lobby.participants.add(newParticipant);

      if (lobby.id != null) {
        try {
          final client = SupabaseService.instance.client;
          await client.from('multiplayer_players').upsert(
            newParticipant.toJson(lobby.id!),
          );
        } catch (_) {}
      }
    }

    if (lobby.id != null) {
      _listenToRoomRealtime(cleanCode, lobby.id);
    }
    _notifyLobby(lobby);
    return true;
  }

  void startQuiz(String accessCode) {
    final cleanCode = accessCode.trim().toUpperCase();
    final lobby = _lobbies[cleanCode] ?? _lobbies[accessCode];
    if (lobby == null) return;
    lobby.isStarted = true;

    if (lobby.id != null) {
      try {
        final client = SupabaseService.instance.client;
        client.from('multiplayer_games').update({'status': 'active'}).eq('id', lobby.id!);
        client.from('quiz_lobbies').update({'status': 'active'}).eq('access_code', cleanCode);
      } catch (_) {}
    }

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
    final cleanCode = accessCode.trim().toUpperCase();
    final lobby = _lobbies[cleanCode] ?? _lobbies[accessCode];
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

    if (lobby.id != null) {
      try {
        final client = SupabaseService.instance.client;
        final updateData = {
          'score': score,
          'correct_answers': correctCount,
          'wrong_answers': wrongCount,
          'current_question_index': questionIndex,
          'is_finished': isFinished,
        };
        if (participantId.startsWith('temp_')) {
          client.from('multiplayer_players').update(updateData).eq('game_id', lobby.id!).eq('display_name', participant.name);
        } else {
          client.from('multiplayer_players').update(updateData).eq('game_id', lobby.id!).eq('user_id', participantId);
        }
      } catch (e) {
        print('Supabase updateParticipantProgress warning: $e');
      }
    }

    _notifyLobby(lobby);
  }

  void _listenToRoomRealtime(String roomCode, String? gameId) {
    if (gameId == null) return;
    try {
      final client = SupabaseService.instance.client;
      client.channel('game_room_$roomCode')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'multiplayer_players',
          callback: (payload) {
            _refreshRoomFromSupabase(roomCode, gameId);
          },
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'multiplayer_games',
          callback: (payload) {
            final record = payload.newRecord;
            final lobby = _lobbies[roomCode];
            if (lobby != null && record != null) {
              final status = record['status'] as String?;
              if (status == 'active' || status == 'in_progress') {
                lobby.isStarted = true;
                _notifyLobby(lobby);
              }
            }
          },
        )
        .subscribe();
    } catch (e) {
      print('Realtime room subscription error: $e');
    }
  }

  Future<void> _refreshRoomFromSupabase(String roomCode, String gameId) async {
    try {
      final client = SupabaseService.instance.client;
      final playersData = await client
          .from('multiplayer_players')
          .select('*')
          .eq('game_id', gameId);

      final lobby = _lobbies[roomCode];
      if (lobby != null && playersData != null) {
        final totalQCount = lobby.questions.isNotEmpty ? lobby.questions.length : 10;
        for (final p in playersData) {
          final isHost = p['is_host'] == true;
          if (isHost) continue;

          final pId = p['user_id']?.toString() ?? p['id']?.toString() ?? p['display_name'];
          final name = p['display_name'] as String? ?? 'Player';
          final photo = p['photo_url'] as String?;

          final existingIdx = lobby.participants.indexWhere((part) => part.id == pId || part.name == name);
          if (existingIdx == -1) {
            lobby.participants.add(LobbyParticipant(
              id: pId,
              name: name,
              photoUrl: photo,
              totalQuestions: totalQCount,
              score: p['score'] ?? 0,
              correctCount: p['correct_answers'] ?? 0,
              wrongCount: p['wrong_answers'] ?? 0,
              currentQuestionIndex: p['current_question_index'] ?? 0,
              isFinished: p['is_finished'] ?? false,
            ));
          } else {
            final part = lobby.participants[existingIdx];
            part.score = p['score'] ?? part.score;
            part.correctCount = p['correct_answers'] ?? part.correctCount;
            part.wrongCount = p['wrong_answers'] ?? part.wrongCount;
            part.currentQuestionIndex = p['current_question_index'] ?? part.currentQuestionIndex;
            part.isFinished = p['is_finished'] ?? part.isFinished;
            part.totalQuestions = totalQCount;
          }
        }
        if (lobby.participants.isNotEmpty && lobby.participants.every((p) => p.isFinished)) {
          lobby.isFinished = true;
        }
        _notifyLobby(lobby);
      }
    } catch (_) {}
  }

  void _notifyLobby(QuizLobby lobby) {
    _lobbyStreamController.add(lobby);
  }
}

