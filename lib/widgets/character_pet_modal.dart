import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';
import 'outfit_selection_modal.dart';

class CharacterPetModal extends ConsumerStatefulWidget {
  const CharacterPetModal({super.key});

  @override
  ConsumerState<CharacterPetModal> createState() => _CharacterPetModalState();
}

class _CharacterPetModalState extends ConsumerState<CharacterPetModal> {
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
        title: const Text('Rename Character'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Character Name',
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

    // Calculate EXP Fill Progress
    double expRatio = 1.0;
    int neededXP = stage.nextXP;
    int currentLevelXP = xp;
    int neededLevelXP = stage.nextXP;

    if (stage.nextXP < 999999) {
      final prevMin = stage.minXP;
      currentLevelXP = (xp - prevMin).clamp(0, 999999);
      neededLevelXP = stage.nextXP - prevMin;
      expRatio = (currentLevelXP / neededLevelXP).clamp(0.0, 1.0);
    }

    final double screenHeight = MediaQuery.of(context).size.height;

    return Container(
      height: screenHeight * 0.92,
      decoration: const BoxDecoration(
        color: Color(0xFFCCFBF1), // Soft cyan pastel background matching Image 3
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        child: Scaffold(
          backgroundColor: const Color(0xFFE0F7FA), // Light turquoise canvas
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Column(
                crossAlignment: CrossAlignment.start,
                children: [
                  // 1. Top Navigation Bar (Close X, Title Pill, Dots Menu)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Close (X) button
                      GestureDetector(
                        onTap: () => Navigator.of(context).pop(),
                        child: Container(
                          height: 38,
                          width: 38,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.85),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.08),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.close, color: Colors.black54, size: 20),
                        ),
                      ),

                      // Title Pill: Character Name with Edit Pencil
                      GestureDetector(
                        onTap: () => _showEditNameDialog(charName),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.9),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.teal.shade200, width: 1.5),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.teal.withOpacity(0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Flexible(
                                child: Text(
                                  charName,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF0F766E),
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Text('✏️', style: TextStyle(fontSize: 12)),
                            ],
                          ),
                        ),
                      ),

                      // Options & Badge icons
                      Row(
                        children: [
                          // Coins Badge
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF08A),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFFACC15)),
                            ),
                            child: Row(
                              children: [
                                const Text('🪙', style: TextStyle(fontSize: 12)),
                                const SizedBox(width: 3),
                                Text(
                                  '${profile?.coins ?? 50}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF854D0E),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                          // Streak Badge
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFEDD5),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFFB923C)),
                            ),
                            child: Row(
                              children: [
                                const Text('🔥', style: TextStyle(fontSize: 12)),
                                const SizedBox(width: 3),
                                Text(
                                  '$streak',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF9A3412),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                          GestureDetector(
                            onTap: () => _showEditNameDialog(charName),
                            child: Container(
                              height: 34,
                              width: 34,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.85),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.more_horiz, color: Colors.black54, size: 20),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // 2. XP Header Display (Large Score/XP Number matching Image 3 top-left)
                  Padding(
                    padding: const EdgeInsets.only(left: 4.0),
                    child: Text(
                      '$xp XP',
                      style: const TextStyle(
                        fontSize: 34,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 3. Central Hero Area: Fluffy Cloud Platform & Interactive Character Artwork
                  Center(
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Soft Fluffy Cloud Platform Base
                        Container(
                          width: 240,
                          height: 150,
                          margin: const EdgeInsets.only(top: 80),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(100),
                            gradient: RadialGradient(
                              colors: [
                                const Color(0xFFDDD6FE).withOpacity(0.7),
                                const Color(0xFFF472B6).withOpacity(0.15),
                                Colors.transparent,
                              ],
                              radius: 0.85,
                            ),
                          ),
                        ),
                        // Cloud Graphic
                        Positioned(
                          bottom: 20,
                          child: Container(
                            height: 70,
                            width: 260,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.8),
                              borderRadius: BorderRadius.circular(40),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.purple.withOpacity(0.15),
                                  blurRadius: 20,
                                  spreadRadius: 4,
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Character Image inside Hero Scene (Tapping opens 3D Mascot Evolution Showcase)
                        GestureDetector(
                          onTap: () {
                            Navigator.of(context).pop();
                            context.push('/student/mascot-evolution');
                          },
                          child: Column(
                            children: [
                              Image.asset(
                                assetPath,
                                height: 210,
                                width: 210,
                                fit: BoxFit.contain,
                                errorBuilder: (ctx, err, stack) => Text(
                                  stage.icon,
                                  style: const TextStyle(fontSize: 110),
                                ),
                              ),
                              const SizedBox(height: 10),
                            ],
                          ),
                        ),

                        // Left Arrow '<' Button
                        Positioned(
                          left: 0,
                          child: IconButton(
                            icon: const Icon(Icons.chevron_left, size: 36, color: Colors.teal),
                            onPressed: () {
                              Navigator.of(context).pop();
                              context.push('/student/mascot-evolution');
                            },
                          ),
                        ),

                        // Right Arrow '>' Button
                        Positioned(
                          right: 0,
                          child: IconButton(
                            icon: const Icon(Icons.chevron_right, size: 36, color: Colors.teal),
                            onPressed: () {
                              Navigator.of(context).pop();
                              context.push('/student/mascot-evolution');
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // 4. Gender & Outfits & 3D Evolution Buttons Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // 3D Mascot Evolution Showcase Button
                      InkWell(
                        onTap: () {
                          Navigator.of(context).pop();
                          context.push('/student/mascot-evolution');
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.purple.withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.threed_rotation, color: Colors.white, size: 16),
                              SizedBox(width: 4),
                              Text(
                                '3D Evolution',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.extrabold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Gender Selection Button (Male / Female)
                      InkWell(
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (ctx) => const GenderSelectionDialog(),
                          );
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.06),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                gender == 'female' ? '👧 Female' : '👦 Male',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.extrabold,
                                  color: Color(0xFF0284C7),
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(Icons.swap_horiz, size: 16, color: Color(0xFF0284C7)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),

                      // Outfits Button
                      InkWell(
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (ctx) => const OutfitSelectionModal(),
                          );
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.06),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('🎭', style: TextStyle(fontSize: 16)),
                              SizedBox(width: 6),
                              Text(
                                'Outfits',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.extrabold,
                                  color: Color(0xFF0284C7),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // 5. EXP FILL PROGRESS BAR (Exact requirement matching Image 3, displaying EXP fill)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      children: [
                        // Striped / Gradient EXP Progress Bar
                        Container(
                          height: 36,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF38BDF8), width: 2),
                          ),
                          child: Stack(
                            children: [
                              // Filling EXP Bar
                              FractionallySizedBox(
                                widthFactor: expRatio,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(18),
                                    gradient: const LinearGradient(
                                      colors: [
                                        Color(0xFF38BDF8),
                                        Color(0xFF0284C7),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              // EXP Text inside/over bar (matching 1381/900 format from Image 3)
                              Center(
                                child: Text(
                                  neededXP < 999999 && stage.stage < 4
                                      ? '$xp / $neededXP EXP'
                                      : '$xp EXP (FINAL STAGE)',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    shadows: [
                                      Shadow(
                                        color: Colors.black45,
                                        blurRadius: 4,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Subtext link below EXP bar
                        InkWell(
                          onTap: () {
                            showDialog(
                              context: context,
                              builder: (ctx) => const OutfitSelectionModal(),
                            );
                          },
                          child: Text(
                            neededXP < 999999 && stage.stage < 4
                                ? '${stage.nextXP - xp} EXP until next evolution >'
                                : '🏆 Final Stage Reached! Additional XP contributes to achievements, streaks & stats >',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Colors.teal.shade700,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // 6. Unlock Outfits Promotion Card (matching Image 3 card)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          height: 42,
                          width: 42,
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE0F2FE),
                            shape: BoxShape.circle,
                          ),
                          child: ClipOval(
                            child: Image.asset(
                              assetPath,
                              fit: BoxFit.contain,
                              errorBuilder: (ctx, err, stack) => Text(stage.icon),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Unlock new outfits for your Pet with Nexus app!',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Colors.grey.shade800,
                            ),
                          ),
                        ),
                        Icon(Icons.chevron_right, color: Colors.grey.shade400),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 7. "Grow your Pet" / "Grow your Character" Task List (matching Image 3 task section)
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
                      crossAlignment: CrossAlignment.start,
                      children: [
                        const Text(
                          'Grow your Pet',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Tasks list
                        ...charState.tasks.map((taskProgress) {
                          final task = taskProgress.config;
                          final isDone = taskProgress.isCompleted;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: isDone ? const Color(0xFFF0FDF4) : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isDone ? const Color(0xFF86EFAC) : Colors.grey.shade200,
                              ),
                            ),
                            child: Row(
                              children: [
                                // Checkmark / Circle Status
                                Container(
                                  height: 32,
                                  width: 32,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isDone ? const Color(0xFF22C55E) : Colors.grey.shade100,
                                    border: isDone
                                        ? null
                                        : Border.all(color: Colors.grey.shade300, width: 1.5),
                                  ),
                                  child: Center(
                                    child: Icon(
                                      Icons.check,
                                      size: 18,
                                      color: isDone ? Colors.white : Colors.grey.shade400,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),

                                // Task Details
                                Expanded(
                                  child: Column(
                                    crossAlignment: CrossAlignment.start,
                                    children: [
                                      Text(
                                        task.title,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 13,
                                          color: isDone ? const Color(0xFF15803D) : Colors.black87,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '+${task.growthPoints} growth points',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: Color(0xFF0284C7),
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                                // Action Button: [Go] pill button matching Image 3
                                if (!isDone)
                                  ElevatedButton(
                                    onPressed: () {
                                      Navigator.of(context).pop();
                                      context.push(task.actionRoute);
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.black,
                                      foregroundColor: Colors.white,
                                      elevation: 0,
                                      minimumSize: const Size(56, 34),
                                      padding: const EdgeInsets.symmetric(horizontal: 16),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(18),
                                      ),
                                    ),
                                    child: const Text(
                                      'Go',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  )
                                else
                                  const Icon(Icons.check_circle, color: Color(0xFF22C55E)),
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
          ),
        ),
      ),
    );
  }
}
