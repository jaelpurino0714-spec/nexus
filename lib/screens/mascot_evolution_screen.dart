import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/character_provider.dart';
import '../widgets/mascot_3d_viewer.dart';
import '../widgets/mascot_expression_picker.dart';
import '../widgets/level_up_animation_flow.dart';
import '../widgets/mascot_key_traits_card.dart';

class MascotEvolutionScreen extends ConsumerStatefulWidget {
  const MascotEvolutionScreen({super.key});

  @override
  ConsumerState<MascotEvolutionScreen> createState() => _MascotEvolutionScreenState();
}

class _MascotEvolutionScreenState extends ConsumerState<MascotEvolutionScreen> {
  MascotStage _selectedStage = MascotStage.baby;
  String _activeExpression = 'happy';

  @override
  void initState() {
    super.initState();
    // Initialize stage from user's current character stage
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final stage = ref.read(characterProvider).stageConfig;
      if (stage.stage == 1) {
        _selectedStage = MascotStage.baby;
      } else if (stage.stage == 2) {
        _selectedStage = MascotStage.student;
      } else {
        _selectedStage = MascotStage.scientist;
      }
      setState(() {});
    });
  }

  void _onStageChanged(MascotStage newStage) {
    setState(() {
      _selectedStage = newStage;
      if (newStage == MascotStage.baby) {
        _activeExpression = 'happy';
      } else if (newStage == MascotStage.student) {
        _activeExpression = 'happy';
      } else {
        _activeExpression = 'smile';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0529), // Cosmic dark violet canvas matching reference poster
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'assets/images/mascot/nexus_logo.png',
              height: 28,
              fit: BoxFit.contain,
              errorBuilder: (ctx, err, stack) => const Text(
                'NEXUS',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                  letterSpacing: 2.0,
                ),
              ),
            ),
          ],
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAlignment: CrossAlignment.start,
            children: [
              // 1. Header Banner & Subtitle matching poster header
              Center(
                child: Column(
                  children: [
                    const Text(
                      'MASCOT EVOLUTION',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'From curiosity to knowledge, from learning to discovery —\nevolve with every answer!',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Color(0xFFC084FC),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Color Palette Dots matching reference poster
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildColorDot(const Color(0xFFA855F7)),
                        const SizedBox(width: 8),
                        _buildColorDot(const Color(0xFFEC4899)),
                        const SizedBox(width: 8),
                        _buildColorDot(const Color(0xFF06B6D4)),
                        const SizedBox(width: 8),
                        _buildColorDot(Colors.white),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 2. Stage Switcher Tabs (BABY / STUDENT / SCIENTIST)
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFF160B3A),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _buildStageTab(
                        stage: MascotStage.baby,
                        label: '🌱 BABY',
                        sublabel: 'Curious & Excited',
                        color: const Color(0xFFA855F7),
                      ),
                    ),
                    Expanded(
                      child: _buildStageTab(
                        stage: MascotStage.student,
                        label: '🎓 STUDENT',
                        sublabel: 'Learning & Growing',
                        color: const Color(0xFF06B6D4),
                      ),
                    ),
                    Expanded(
                      child: _buildStageTab(
                        stage: MascotStage.scientist,
                        label: '🔬 SCIENTIST',
                        sublabel: 'Exploring & Creating',
                        color: const Color(0xFFEC4899),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 3. Central 3D Interactive Mascot Viewer & Turnaround Controls
              Builder(
                builder: (context) {
                  final charState = ref.watch(characterProvider);
                  final userXP = charState.profile?.characterXp ?? 0;
                  bool isStageLocked = false;
                  if (_selectedStage == MascotStage.student && userXP < 1000) isStageLocked = true;
                  if (_selectedStage == MascotStage.scientist && userXP < 2000) isStageLocked = true;

                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF160B3A).withOpacity(0.6),
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: Mascot3DViewer(
                      stage: _selectedStage,
                      activeExpression: _activeExpression,
                      height: 260,
                      isLocked: isStageLocked,
                      showTurnaroundControls: true,
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),

              // 4. Expression Selector Bar
              MascotExpressionPicker(
                stage: _selectedStage,
                activeExpression: _activeExpression,
                onExpressionSelected: (exp) {
                  setState(() {
                    _activeExpression = exp;
                  });
                },
              ),
              const SizedBox(height: 24),

              // 5. Interactive Level Up Animation Flow Showcase
              const LevelUpAnimationFlow(),
              const SizedBox(height: 24),

              // 6. Key Traits Showcase Card
              const MascotKeyTraitsCard(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildColorDot(Color color) {
    return Container(
      height: 14,
      width: 14,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.6),
            blurRadius: 6,
            spreadRadius: 1,
          ),
        ],
      ),
    );
  }

  Widget _buildStageTab({
    required MascotStage stage,
    required String label,
    required String sublabel,
    required Color color,
  }) {
    final isSelected = _selectedStage == stage;

    return GestureDetector(
      onTap: () => _onStageChanged(stage),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.5),
                    blurRadius: 12,
                    spreadRadius: 1,
                  )
                ]
              : null,
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.white60,
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              sublabel,
              style: TextStyle(
                color: isSelected ? Colors.white90 : Colors.white38,
                fontSize: 9,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
