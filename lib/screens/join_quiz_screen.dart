import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../services/lobby_service.dart';

class JoinQuizScreen extends ConsumerStatefulWidget {
  const JoinQuizScreen({super.key});

  @override
  ConsumerState<JoinQuizScreen> createState() => _JoinQuizScreenState();
}

class _JoinQuizScreenState extends ConsumerState<JoinQuizScreen> {
  final TextEditingController _codeController = TextEditingController();
  QuizLobby? _joinedLobby;
  StreamSubscription<QuizLobby>? _lobbySub;
  bool _isJoined = false;

  @override
  void dispose() {
    _codeController.dispose();
    _lobbySub?.cancel();
    super.dispose();
  }

  void _onJoinLobby() {
    final code = _codeController.text.trim();
    if (code.length != 7) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 7-digit lobby access code!'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    final authState = ref.read(authProvider);
    final studentName = authState.profile?.name ?? 'Student Participant';
    final studentId = authState.profile?.id ?? 'temp_student_${DateTime.now().millisecondsSinceEpoch}';
    final studentPhoto = authState.profile?.photoUrl;

    final success = LobbyService.instance.joinLobby(
      accessCode: code,
      participantId: studentId,
      participantName: studentName,
      photoUrl: studentPhoto,
    );

    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid lobby access code or quiz already started!'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    final lobby = LobbyService.instance.getLobby(code);

    setState(() {
      _joinedLobby = lobby;
      _isJoined = true;
    });

    _lobbySub = LobbyService.instance.lobbyStream.listen((updatedLobby) {
      if (updatedLobby.accessCode == code && mounted) {
        setState(() {
          _joinedLobby = updatedLobby;
        });

        // Auto transition participant to quiz runner when host starts
        if (updatedLobby.isStarted && ModalRoute.of(context)?.isCurrent == true) {
          context.push('/student/quiz', extra: {
            'topicId': 'lobby_topic',
            'topicTitle': updatedLobby.quizTitle,
            'quizType': 'custom',
            'questionType': 'multiple_choice',
            'customQuestions': updatedLobby.questions,
            'customTimeLimit': updatedLobby.timeLimitPerQuestion,
            'lobbyAccessCode': updatedLobby.accessCode,
            'participantId': studentId,
          });
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Join Quiz Lobby'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: _isJoined ? _buildParticipantLobbyView() : _buildCodeEntryView(),
      ),
    );
  }

  Widget _buildCodeEntryView() {
    return Column(
      crossAlignment: CrossAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.key, size: 70, color: Color(0xFF673AB7)),
        const SizedBox(height: 16),
        const Text(
          'Enter 7-Digit Access Code',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
        ),
        const SizedBox(height: 8),
        const Text(
          'Ask your teacher or host for the 7-digit lobby code',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey),
        ),
        const SizedBox(height: 32),

        TextField(
          controller: _codeController,
          keyboardType: TextInputType.number,
          maxLength: 7,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 4),
          decoration: InputDecoration(
            counterText: '',
            hintText: '7-DIGIT CODE',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
          ),
        ),
        const SizedBox(height: 24),

        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 18),
            backgroundColor: const Color(0xFF673AB7),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          icon: const Icon(Icons.login, size: 28),
          label: const Text('Join Lobby', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          onPressed: _onJoinLobby,
        ),
      ],
    );
  }

  Widget _buildParticipantLobbyView() {
    final lobby = _joinedLobby;
    if (lobby == null) return Container();

    return Column(
      crossAlignment: CrossAlignment.stretch,
      children: [
        // Host Info Header
        Card(
          color: const Color(0xFF4C1D95),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundImage: lobby.hostPhotoUrl != null ? NetworkImage(lobby.hostPhotoUrl!) : null,
                  child: lobby.hostPhotoUrl == null ? Text(lobby.hostName.characters.first, style: const TextStyle(fontSize: 20)) : null,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAlignment: CrossAlignment.start,
                    children: [
                      const Text('QUIZ HOST', style: TextStyle(color: Colors.amberAccent, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
                      const SizedBox(height: 4),
                      Text(lobby.hostName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                      Text('Quiz: ${lobby.quizTitle}', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Participants Joined (${lobby.participants.length})', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const Text('Waiting for Host...', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 12),

        Expanded(
          child: ListView.builder(
            itemCount: lobby.participants.length,
            itemBuilder: (context, index) {
              final p = lobby.participants[index];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundImage: p.photoUrl != null ? NetworkImage(p.photoUrl!) : null,
                    child: p.photoUrl == null ? Text(p.name.characters.first) : null,
                  ),
                  title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Participant'),
                  // Note: Participants CANNOT view other participants' profiles as required
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
