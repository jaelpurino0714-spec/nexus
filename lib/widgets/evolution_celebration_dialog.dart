import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';

class EvolutionCelebrationDialog extends ConsumerWidget {
  const EvolutionCelebrationDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final charState = ref.watch(characterProvider);
    final stage = charState.pendingEvolution ?? charState.stageConfig;
    final profile = charState.profile;
    final String assetPath = CharacterService.instance.getStageAssetPath(stage.id, profile?.characterGender);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              '🎉 CHARACTER EVOLVED! 🎉',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: Color(0xFF673AB7),
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 16),

            // Evolved Character Avatar Image
            Container(
              height: 130,
              width: 130,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFF3E8FF),
              ),
              child: Center(
                child: Image.asset(
                  assetPath,
                  height: 110,
                  width: 110,
                  fit: BoxFit.contain,
                  errorBuilder: (ctx, err, stack) => Text(stage.icon, style: const TextStyle(fontSize: 70)),
                ),
              ),
            ),
            const SizedBox(height: 16),

            Text(
              'Stage ${stage.stage}: ${stage.title}',
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              stage.description,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: Colors.black68),
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: () {
                ref.read(characterProvider.notifier).dismissEvolutionModal();
                Navigator.of(context).pop();
                context.push('/student/mascot-evolution');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEC4899),
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.threed_rotation, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'View 3D Evolution Showcase!',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            TextButton(
              onPressed: () {
                ref.read(characterProvider.notifier).dismissEvolutionModal();
                Navigator.of(context).pop();
              },
              child: const Text('Awesome!', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
