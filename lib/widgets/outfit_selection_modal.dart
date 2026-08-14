import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';

class OutfitSelectionModal extends ConsumerWidget {
  const OutfitSelectionModal({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final charState = ref.watch(characterProvider);
    final currentOutfit = charState.characterOutfit;
    final currentStage = charState.stageConfig.stage;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAlignment: CrossAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '👕 Companion Outfits',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF4C1D95),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Customize your companion style. Outfits do not reset your streak or learning progress!',
              style: TextStyle(fontSize: 13, color: Colors.black54),
            ),
            const SizedBox(height: 16),

            ...CharacterService.outfits.map((outfit) {
              final isUnlocked = currentStage >= outfit.requiredStage;
              final isSelected = currentOutfit == outfit.id;

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFFF3E8FF)
                      : (isUnlocked ? Colors.grey[50] : Colors.grey[100]),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected
                        ? const Color(0xFF8B5CF6)
                        : (isUnlocked ? Colors.grey[300]! : Colors.grey[200]!),
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: ListTile(
                  leading: Text(
                    isUnlocked ? outfit.icon : '🔒',
                    style: const TextStyle(fontSize: 28),
                  ),
                  title: Text(
                    outfit.name,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isUnlocked ? Colors.black87 : Colors.grey,
                    ),
                  ),
                  subtitle: Text(
                    isUnlocked
                        ? outfit.description
                        : 'Unlocks at Evolution Stage ${outfit.requiredStage}',
                    style: TextStyle(
                      fontSize: 12,
                      color: isUnlocked ? Colors.black54 : Colors.grey[500],
                    ),
                  ),
                  trailing: isSelected
                      ? const Icon(Icons.check_circle, color: Color(0xFF8B5CF6))
                      : (isUnlocked
                          ? TextButton(
                              onPressed: () {
                                ref
                                    .read(characterProvider.notifier)
                                    .selectOutfit(outfit.id);
                                Navigator.of(context).pop();
                              },
                              child: const Text('Equip'),
                            )
                          : null),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
