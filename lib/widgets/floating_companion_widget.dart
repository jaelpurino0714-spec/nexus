import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';

class FloatingCompanionWidget extends ConsumerStatefulWidget {
  const FloatingCompanionWidget({super.key});

  @override
  ConsumerState<FloatingCompanionWidget> createState() => _FloatingCompanionWidgetState();
}

class _FloatingCompanionWidgetState extends ConsumerState<FloatingCompanionWidget> {
  double? _x;
  double? _y;

  @override
  Widget build(BuildContext context) {
    final charState = ref.watch(characterProvider);
    final profile = charState.profile;
    if (profile == null) return const SizedBox.shrink();

    final stage = charState.stageConfig;
    final gender = profile.characterGender;
    final assetPath = CharacterService.instance.getStageAssetPath(stage.id, gender);

    final screenSize = MediaQuery.of(context).size;
    final double defaultX = _x ?? charState.floatingDx ?? (screenSize.width - 100);
    final double defaultY = _y ?? charState.floatingDy ?? (screenSize.height - 180);

    return Positioned(
      left: defaultX.clamp(10.0, (screenSize.width - 100).clamp(10.0, screenSize.width)),
      top: defaultY.clamp(50.0, (screenSize.height - 150).clamp(50.0, screenSize.height)),
      child: GestureDetector(
        onPanUpdate: (details) {
          setState(() {
            _x = (defaultX + details.delta.dx).clamp(10.0, (screenSize.width - 100).clamp(10.0, screenSize.width));
            _y = (defaultY + details.delta.dy).clamp(50.0, (screenSize.height - 150).clamp(50.0, screenSize.height));
          });
          ref.read(characterProvider.notifier).updateFloatingPosition(_x!, _y!);
        },
        onTap: () {
          ref.read(characterProvider.notifier).interactWithCharacter();
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (charState.showSpeechBubble || charState.showFloatingSpeech)
              Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                constraints: const BoxConstraints(maxWidth: 160),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Text(
                  charState.showFloatingSpeech
                      ? charState.floatingSpeechMessage
                      : charState.speechMessage,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF673AB7)),
                  textAlign: TextAlign.center,
                ),
              ),
            Container(
              height: 80,
              width: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.9),
                boxShadow: [
                  BoxShadow(
                    color: Color(int.parse(stage.colorHex.replaceFirst('#', '0xFF'))).withOpacity(0.35),
                    blurRadius: 12,
                    spreadRadius: 2,
                  ),
                ],
              ),
              padding: const EdgeInsets.all(6),
              child: Image.asset(
                assetPath,
                fit: BoxFit.contain,
                errorBuilder: (ctx, err, stack) => Center(
                  child: Text(
                    stage.icon,
                    style: const TextStyle(fontSize: 40),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
