import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/quiz_provider.dart';
import '../providers/character_provider.dart';
import '../services/lobby_service.dart';
import '../widgets/evolution_celebration_dialog.dart';

class QuizResultScreen extends ConsumerStatefulWidget {
  const QuizResultScreen({super.key});

  @override
  ConsumerState<QuizResultScreen> createState() => _QuizResultScreenState();
}

class _QuizResultScreenState extends ConsumerState<QuizResultScreen> {
  bool _activityRecorded = false;
  QuizLobby? _hostedLobby;
  StreamSubscription<QuizLobby>? _lobbySub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _recordActivityIfNeeded();
      _setupLobbyListener();
    });
  }

  @override
  void dispose() {
    _lobbySub?.cancel();
    super.dispose();
  }

  void _setupLobbyListener() {
    final quizState = ref.read(quizProvider);
    if (quizState != null && quizState.lobbyAccessCode != null) {
      final code = quizState.lobbyAccessCode!;
      final initialLobby = LobbyService.instance.getLobby(code);
      if (initialLobby != null) {
        setState(() {
          _hostedLobby = initialLobby;
        });
      }

      _lobbySub = LobbyService.instance.lobbyStream.listen((updatedLobby) {
        if ((updatedLobby.accessCode == code || updatedLobby.accessCode.toUpperCase() == code.toUpperCase()) && mounted) {
          setState(() {
            _hostedLobby = updatedLobby;
          });
        }
      });
    }
  }

  void _recordActivityIfNeeded() async {
    if (_activityRecorded) return;
    final quizState = ref.read(quizProvider);
    if (quizState != null && quizState.questions.isNotEmpty) {
      _activityRecorded = true;
      final double pct = (quizState.correctCount / quizState.questions.length) * 100;
      await ref.read(characterProvider.notifier).recordLearningActivity(
            percentageScore: pct,
            correctAnswers: quizState.correctCount,
            totalQuestions: quizState.questions.length,
          );

      if (mounted) {
        final charState = ref.read(characterProvider);
        if (charState.pendingEvolution != null) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (ctx) => const EvolutionCelebrationDialog(),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
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
    final charState = ref.watch(characterProvider);
    final xpGained = charState.lastXpGained;

    return Scaffold(
      appBar: AppBar(title: const Text('Quiz Results'), automaticallyImplyLeading: false),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAlignment.stretch,
          children: [
            Text(
              pct >= 75 ? '🎉 Great Job!' : '💪 Keep Practicing!',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            if (xpGained > 0)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF08A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFFACC15)),
                ),
                child: Text(
                  '⭐ +$xpGained Companion XP Earned!',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF854D0E),
                  ),
                ),
              ),
            if (pct >= 100)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF86EFAC)),
                ),
                child: const Text(
                  '🪙 +25 Science Coins (100% Perfect Score!) 🎉',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF166534),
                  ),
                ),
              ),
            const SizedBox(height: 12),

            Text(
              '${pct.toStringAsFixed(1)}%',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 64,
                fontWeight: FontWeight.w900,
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
            const SizedBox(height: 28),

            // Render Hosted Game Leaderboard if this was a hosted game
            if (quizState.lobbyAccessCode != null) ...[
              _buildHostedLeaderboardSection(quizState.participantId),
              const SizedBox(height: 28),
            ],

            ElevatedButton(
              onPressed: () => context.go('/student/home'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF673AB7),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.all(16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Return to Home', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHostedLeaderboardSection(String? currentParticipantId) {
    final lobby = _hostedLobby;

    final List<LobbyParticipant> participants = lobby != null ? List<LobbyParticipant>.from(lobby.participants) : [];
    participants.sort((a, b) {
      int comp = b.score.compareTo(a.score);
      if (comp != 0) return comp;
      int comp2 = b.correctCount.compareTo(a.correctCount);
      if (comp2 != 0) return comp2;
      return a.name.compareTo(b.name);
    });

    final bool allFinished = participants.isNotEmpty && participants.every((p) => p.isFinished);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      color: const Color(0xFFFAF5FF),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '🏆 Hosted Leaderboard',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: allFinished ? Colors.green.shade100 : Colors.orange.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    allFinished ? 'FINAL' : 'LIVE',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: allFinished ? Colors.green.shade900 : Colors.orange.shade900,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            if (participants.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('Loading hosted game leaderboard...', textAlign: TextAlign.center),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: participants.length,
                itemBuilder: (context, index) {
                  final p = participants[index];
                  final rank = index + 1;
                  final isCurrentStudent = (currentParticipantId != null && p.id == currentParticipantId);
                  final rankBadge = rank == 1 ? '🥇' : (rank == 2 ? '🥈' : (rank == 3 ? '🥉' : '#$rank'));

                  return Card(
                    color: isCurrentStudent ? const Color(0xFFEDE9FE) : Colors.white,
                    elevation: isCurrentStudent ? 3 : 1,
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: isCurrentStudent
                          ? const BorderSide(color: Color(0xFF673AB7), width: 2)
                          : BorderSide.none,
                    ),
                    child: ListTile(
                      dense: true,
                      leading: CircleAvatar(
                        radius: 18,
                        backgroundColor: rank == 1
                            ? Colors.amber
                            : (rank == 2
                                ? Colors.grey.shade400
                                : (rank == 3 ? Colors.brown.shade300 : Colors.purple.shade100)),
                        child: Text(
                          rankBadge,
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                        ),
                      ),
                      title: Row(
                        children: [
                          Expanded(
                            child: Text(
                              p.name,
                              style: TextStyle(
                                fontWeight: isCurrentStudent ? FontWeight.w900 : FontWeight.bold,
                                color: isCurrentStudent ? const Color(0xFF4C1D95) : Colors.black87,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (isCurrentStudent)
                            Container(
                              margin: const EdgeInsets.only(left: 6),
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF673AB7),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'YOU',
                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                        ],
                      ),
                      subtitle: Text(
                        '✔️ ${p.correctCount}  ❌ ${p.wrongCount} • ${p.isFinished ? "Finished ✅" : "In Progress ⏳"}',
                        style: const TextStyle(fontSize: 11),
                      ),
                      trailing: Text(
                        '${p.score} pts',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.black, color: Color(0xFF673AB7)),
                      ),
                    ),
                  );
                },
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
