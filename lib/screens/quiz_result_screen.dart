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
        backgroundColor: const Color(0xFF090A1A),
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
      backgroundColor: const Color(0xFF090A1A), // Deep dark cosmic background matching Image 1
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAlignment: CrossAlignment.stretch,
            children: [
              // 1. Top Header Bar (NEXUS Logo, Grade 10 Pill, Calculator Icon)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Text('🧬', style: TextStyle(fontSize: 22)),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAlignment.start,
                        children: const [
                          Text(
                            'NEXUS',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF38BDF8),
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            'DepEd Grade 10 Science',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFA5A3C4),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF7C3AED), Color(0xFF6366F1)],
                          ),
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF7C3AED).withOpacity(0.4),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: const Text(
                          'Grade 10',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.extrabold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E1B4B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF312E81)),
                        ),
                        child: const Icon(Icons.calculate_outlined, color: Colors.white, size: 18),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 2. Main Cosmic Card Container matching Image 1
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 26),
                decoration: BoxDecoration(
                  color: const Color(0xFF0E0F26),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: const Color(0xFF231648), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.5),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // 3D Trophy Icon
                    const Text('🏆', style: TextStyle(fontSize: 48)),
                    const SizedBox(height: 10),

                    // "Round Complete!" Header
                    const Text(
                      'Round Complete!',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 22),

                    // Glowing Circular Score Ring matching Image 1
                    Center(
                      child: Container(
                        width: 160,
                        height: 160,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF7C3AED).withOpacity(0.12),
                          border: Border.all(
                            color: const Color(0xFF8B5CF6),
                            width: 6,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF8B5CF6).withOpacity(0.4),
                              blurRadius: 24,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Floating sparkles around circle
                            const Positioned(top: 18, left: 16, child: Text('✦', style: TextStyle(color: Colors.white70, fontSize: 10))),
                            const Positioned(top: 36, right: 18, child: Text('✨', style: TextStyle(fontSize: 12))),
                            const Positioned(bottom: 24, left: 20, child: Text('✨', style: TextStyle(fontSize: 11))),
                            const Positioned(bottom: 30, right: 16, child: Text('✦', style: TextStyle(color: Colors.white70, fontSize: 10))),

                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  '${pct.toInt()}%',
                                  style: const TextStyle(
                                    fontSize: 44,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    height: 1.0,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'SCORE',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFFC4B5FD),
                                    letterSpacing: 1.8,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Companion XP Banner if earned
                    if (xpGained > 0)
                      Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E1B4B),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFF8B5CF6)),
                        ),
                        child: Text(
                          '⭐ +$xpGained Companion XP Earned!',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFFE9D5FF),
                          ),
                        ),
                      ),

                    // Perfect Score Bonus Banner matching Image 1
                    if (quizState.wrongCount == 0 || pct >= 100)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF583C08), Color(0xFF2D1E04)],
                          ),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFFF59E0B), width: 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFF59E0B).withOpacity(0.25),
                              blurRadius: 14,
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('🪙', style: TextStyle(fontSize: 16)),
                            SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                'PERFECT SCORE BONUS! +25 Science Coins (0 Wrong Answers) 🎉',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFFFDE68A),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 20),

                    // Correct & Incorrect Stat Cards Row matching Image 1
                    Row(
                      children: [
                        // Correct Answers Card
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFF064E3B).withOpacity(0.35),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF10B981), width: 1.5),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF10B981).withOpacity(0.15),
                                  blurRadius: 12,
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(Icons.check, color: Colors.white, size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAlignment: CrossAlignment.start,
                                    children: [
                                      Text(
                                        '${quizState.correctCount}',
                                        style: const TextStyle(
                                          fontSize: 26,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF34D399),
                                          height: 1.0,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      const Text(
                                        'Correct\nAnswers',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: Color(0xFFA7F3D0),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),

                        // Incorrect Answers Card
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFF881337).withOpacity(0.35),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFFF43F5E), width: 1.5),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFF43F5E).withOpacity(0.15),
                                  blurRadius: 12,
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF43F5E),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(Icons.close, color: Colors.white, size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAlignment: CrossAlignment.start,
                                    children: [
                                      Text(
                                        '${quizState.wrongCount}',
                                        style: const TextStyle(
                                          fontSize: 26,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFFFB7185),
                                          height: 1.0,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      const Text(
                                        'Incorrect\nAnswers',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: Color(0xFFFECDD3),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Hosted Leaderboard Section if applicable
                    if (quizState.lobbyAccessCode != null) ...[
                      _buildHostedLeaderboardSection(quizState.participantId),
                      const SizedBox(height: 24),
                    ],

                    // Play Again Button (Purple Gradient Pill Button matching Image 1)
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: () {
                          if (quizState.lobbyAccessCode != null) {
                            context.go('/student/home');
                          } else {
                            context.push('/quiz/runner');
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                        ),
                        child: Ink(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF7C3AED), Color(0xFF6366F1)],
                            ),
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF7C3AED).withOpacity(0.45),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Container(
                            alignment: Alignment.center,
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Play Again 🎮',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Return to Home Button (Dark Indigo Outlined Pill Button matching Image 1)
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: OutlinedButton(
                        onPressed: () => context.go('/student/home'),
                        style: OutlinedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F172A).withOpacity(0.6),
                          side: const BorderSide(color: Color(0xFF312E81), width: 1.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Return to Home 🏠',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFFE0E7FF),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
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

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1B4B).withOpacity(0.7),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF312E81)),
      ),
      child: Column(
        crossAlignment: CrossAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '🏆 Hosted Leaderboard',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: allFinished ? Colors.green.shade900 : Colors.amber.shade900,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  allFinished ? 'FINAL' : 'LIVE',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (participants.isEmpty)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text('Loading hosted game leaderboard...', textAlign: TextAlign.center, style: TextStyle(color: Colors.white70)),
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

                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: isCurrentStudent ? const Color(0xFF312E81) : const Color(0xFF0F1026),
                    borderRadius: BorderRadius.circular(14),
                    border: isCurrentStudent ? Border.all(color: const Color(0xFF8B5CF6), width: 1.5) : null,
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: rank == 1
                            ? Colors.amber.shade700
                            : (rank == 2
                                ? Colors.grey.shade600
                                : (rank == 3 ? Colors.brown.shade400 : Colors.purple.shade900)),
                        child: Text(
                          rankBadge,
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAlignment: CrossAlignment.start,
                          children: [
                            Text(
                              p.name + (isCurrentStudent ? ' (YOU)' : ''),
                              style: TextStyle(
                                fontWeight: isCurrentStudent ? FontWeight.w900 : FontWeight.bold,
                                color: isCurrentStudent ? const Color(0xFFC4B5FD) : Colors.white,
                                fontSize: 13,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              '✔️ ${p.correctCount}  ❌ ${p.wrongCount} • ${p.isFinished ? "Finished ✅" : "In Progress ⏳"}',
                              style: const TextStyle(fontSize: 10, color: Colors.white60),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '${p.score} pts',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF38BDF8)),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
