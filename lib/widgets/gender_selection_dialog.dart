import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/character_provider.dart';

class GenderSelectionDialog extends ConsumerStatefulWidget {
  const GenderSelectionDialog({super.key});

  @override
  ConsumerState<GenderSelectionDialog> createState() => _GenderSelectionDialogState();
}

class _GenderSelectionDialogState extends ConsumerState<GenderSelectionDialog> {
  String? _selectedGender;
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    final charState = ref.watch(characterProvider);
    final stage = charState.stageConfig;
    final maleAsset = CharacterService.instance.getStageAssetPath(stage.id, 'male');
    final femaleAsset = CharacterService.instance.getStageAssetPath(stage.id, 'female');
    final stageTitle = stage.title.isEmpty ? 'Companion' : (stage.title[0] + stage.title.substring(1).toLowerCase());

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              '✨ CHARACTER COMPANION ✨',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: Color(0xFF673AB7),
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Choose Your Companion',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Select a gender style for your $stageTitle stage. Your streak, XP, and history will be fully preserved!',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: Colors.black54),
            ),
            const SizedBox(height: 24),

            // Gender Cards Row
            Row(
              children: [
                // Male Card
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedGender = 'male'),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _selectedGender == 'male'
                            ? const Color(0xFFEFF6FF)
                            : Colors.grey[50],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _selectedGender == 'male'
                              ? const Color(0xFF3B82F6)
                              : Colors.grey[300]!,
                          width: _selectedGender == 'male' ? 3 : 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Image.asset(
                            maleAsset,
                            height: 90,
                            fit: BoxFit.contain,
                            errorBuilder: (ctx, err, stack) => const Text('👦', style: TextStyle(fontSize: 60)),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Male $stageTitle',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),

                // Female Card
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedGender = 'female'),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _selectedGender == 'female'
                            ? const Color(0xFFFDF2F8)
                            : Colors.grey[50],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _selectedGender == 'female'
                              ? const Color(0xFFEC4899)
                              : Colors.grey[300]!,
                          width: _selectedGender == 'female' ? 3 : 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Image.asset(
                            femaleAsset,
                            height: 90,
                            fit: BoxFit.contain,
                            errorBuilder: (ctx, err, stack) => const Text('👧', style: TextStyle(fontSize: 60)),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Female $stageTitle',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Confirm Button
            ElevatedButton(
              onPressed: (_selectedGender == null || _isSubmitting)
                  ? null
                  : () async {
                      setState(() => _isSubmitting = true);
                      await ref
                          .read(characterProvider.notifier)
                          .setGender(_selectedGender!);
                      if (mounted) Navigator.of(context).pop();
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF673AB7),
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: _isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text(
                      'Confirm Companion Choice',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
