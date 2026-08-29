import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';
import '../widgets/outfit_selection_modal.dart';
import '../widgets/mascot_3d_viewer.dart';

class FullCharacterScreen extends ConsumerStatefulWidget {
  const FullCharacterScreen({super.key});

  @override
  ConsumerState<FullCharacterScreen> createState() => _FullCharacterScreenState();
}

class _FullCharacterScreenState extends ConsumerState<FullCharacterScreen> {
  Color _parseHexColor(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }

  void _showEditNameDialog(String currentName) {
    final controller = TextEditingController(text: currentName);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit Scientist Name'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Companion Name',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.trim().isNotEmpty) {
                ref
                    .read(characterProvider.notifier)
                    .updateCharacterName(controller.text.trim());
              }
              Navigator.pop(ctx);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final charState = ref.watch(characterProvider);
    final profile = charState.profile;

    final stage = charState.stageConfig;
    final int xp = profile?.characterXp ?? 0;
    final int streak = profile?.currentStreak ?? 0;
    final String? gender = profile?.characterGender;
    final String charName = charState.characterName;

    final String assetPath = CharacterService.instance.getStageAssetPath(stage.id, gender);
    final Color stageColor = _parseHexColor(stage.colorHex);

    // Dynamic Growth Progress values
    double pct = 1.0;
    int neededXP = 1000;
    if (stage.nextXP < 999999) {
      final prevMin = stage.minXP;
      final currentLevelXP = xp - prevMin;
      neededXP = stage.nextXP - prevMin;
      pct = (currentLevelXP / neededXP).clamp(0.0, 1.0);
    }

    final genderBadge = '';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black87),
          onPressed: () => context.pop(),
        ),
        title: GestureDetector(
          onTap: () => _showEditNameDialog(charName),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                child: Text(
                  charName,
                  style: const TextStyle(
                    color: Colors.black87,
                    fontWeight: FontWeight.w800,
                    fontSize: 18,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              const Icon(Icons.edit, size: 16, color: Colors.grey),
            ],
          ),
        ),
        centerTitle: true,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: Colors.black87),
            onSelected: (val) {
              if (val == 'edit_name') {
                _showEditNameDialog(charName);
              }
            },
            itemBuilder: (ctx) => [
              const PopupMenuItem(
                value: 'edit_name',
                child: Row(
                  children: [
                    Icon(Icons.edit, size: 18, color: Colors.grey),
                    SizedBox(width: 8),
                    Text('Rename Scientist'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          children: [
            // 1. Prominent Science Microscope Streak Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF673AB7), Color(0xFF8E24AA)],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.purple.withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('🔬', style: TextStyle(fontSize: 24)),
                  const SizedBox(width: 8),
                  Text(
                    '$streak DAY STREAK',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                      letterSpacing: 1.1,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 2. Main Decorative Character Scene
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: stageColor.withOpacity(0.12),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Stage Badge Tag
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: stageColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'STAGE ${stage.stage} • ${stage.title}$genderBadge',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 12,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Speech Bubble (if active)
                  AnimatedOpacity(
                    duration: const Duration(milliseconds: 300),
                    opacity: charState.showSpeechBubble ? 1.0 : 0.0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3E8FF),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFD8B4FE)),
                      ),
                      child: Text(
                        charState.speechMessage,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF6B21A8),
                        ),
                      ),
                    ),
                  ),

                  // Interactive 3D Mascot Model with Turnaround Views
                  GestureDetector(
                    onTap: () {
                      ref.read(characterProvider.notifier).interactWithCharacter();
                    },
                    child: Mascot3DViewer(
                      stage: stage.id == 'baby'
                          ? MascotStage.baby
                          : stage.id == 'student'
                              ? MascotStage.student
                              : MascotStage.scientist,
                      activeExpression: 'happy',
                      height: 240,
                      showTurnaroundControls: true,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 3D Evolution Showcase Button & Outfits Button Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton.icon(
                        onPressed: () {
                          context.push('/student/mascot-evolution');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8B5CF6),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          elevation: 3,
                        ),
                        icon: const Icon(Icons.threed_rotation, size: 18),
                        label: const Text(
                          '3D Showcase',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                      const SizedBox(width: 10),

                      // Outfits Button
                      OutlinedButton.icon(
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (ctx) => const OutfitSelectionModal(),
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF673AB7),
                          side: const BorderSide(color: Color(0xFF673AB7), width: 1.5),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        ),
                        icon: const Icon(Icons.checkroom, size: 18),
                        label: const Text(
                          'Outfits',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Character Growth Progress Bar
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Scientist Growth',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: Colors.black87,
                            ),
                          ),
                          Text(
                            '$xp / $neededXP Growth Points',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                              color: stageColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: LinearProgressIndicator(
                          value: pct,
                          minHeight: 14,
                          backgroundColor: Colors.grey[200],
                          valueColor: AlwaysStoppedAnimation<Color>(stageColor),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 3. "Grow Your Scientist" Task Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Text('🧪', style: TextStyle(fontSize: 20)),
                      SizedBox(width: 8),
                      Text(
                        'Grow Your Scientist',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Complete Grade 10 Science learning activities to earn Growth Points!',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 16),

                  // Science Tasks List
                  ...charState.tasks.map((taskProgress) {
                    final task = taskProgress.config;
                    final isDone = taskProgress.isCompleted;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isDone ? const Color(0xFFF0FDF4) : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDone ? const Color(0xFF86EFAC) : Colors.grey[200]!,
                        ),
                      ),
                      child: Row(
                        children: [
                          // Status Icon
                          Container(
                            height: 36,
                            width: 36,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isDone ? const Color(0xFF22C55E) : Colors.grey[200],
                            ),
                            child: Center(
                              child: Text(
                                isDone ? '✓' : '○',
                                style: TextStyle(
                                  color: isDone ? Colors.white : Colors.black45,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),

                          // Task Details
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  task.title,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: isDone ? const Color(0xFF15803D) : Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '+${task.growthPoints} Growth Points',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFF673AB7),
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Action Button [GO]
                          if (!isDone)
                            ElevatedButton(
                              onPressed: () {
                                context.push(task.actionRoute);
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF673AB7),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              ),
                              child: Text(task.actionLabel, style: const TextStyle(fontWeight: FontWeight.bold)),
                            )
                          else
                            const Text(
                              'Done',
                              style: TextStyle(
                                color: Color(0xFF16A34A),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
