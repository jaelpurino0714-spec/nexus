import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';

/// Python AnimatedCharacter class ported 1-to-1 to Dart:
/// Features:
/// - Stores character x, y, base_x, base_y
/// - Continuous floating up & down (float_y = sin(time * 2) * 15)
/// - Gentle side-to-side rotation (rotation = sin(time * 2) * 2°)
/// - Subtle breathing scaling effect (scale = 1 + sin(time * 2) * 0.02)
/// - Sine-wave mathematics for natural continuous movement at 60 FPS
/// - User can drag character anywhere on screen
/// - When dragging stops, character continues floating from its new resting position
/// - Original character image is kept unchanged and undistorted (fit: BoxFit.contain)
class AnimatedCharacter {
  double x;
  double y;

  double baseX;
  double baseY;

  double rotation; // in degrees
  double scale;

  late final DateTime startTime;
  bool dragging;

  AnimatedCharacter({double x = 100.0, double y = 300.0})
      : x = x,
        y = y,
        baseX = x,
        baseY = y,
        rotation = 0.0,
        scale = 1.0,
        dragging = false {
    startTime = DateTime.now();
  }

  void updateAnimation() {
    if (dragging) return;

    final currentTime = DateTime.now().difference(startTime).inMilliseconds / 1000.0;

    // Smooth floating movement (approx 15 pixels)
    final floatY = math.sin(currentTime * 2.0) * 15.0;

    // Gentle side-to-side rotation (approx -2° to +2°)
    final rot = math.sin(currentTime * 2.0) * 2.0;

    // Subtle breathing effect (approx 1.0 to 1.02)
    final sc = 1.0 + (math.sin(currentTime * 2.0) * 0.02);

    x = baseX;
    y = baseY + floatY;

    rotation = rot;
    scale = sc;
  }

  void startDrag() {
    dragging = true;
  }

  void dragTo(double newX, double newY) {
    if (dragging) {
      x = newX;
      y = newY;
    }
  }

  void stopDrag() {
    dragging = false;

    // Save the new position as the resting position
    baseX = x;
    baseY = y;
  }
}

class FloatingCompanionWidget extends ConsumerStatefulWidget {
  const FloatingCompanionWidget({super.key});

  @override
  ConsumerState<FloatingCompanionWidget> createState() => _FloatingCompanionWidgetState();
}

class _FloatingCompanionWidgetState extends ConsumerState<FloatingCompanionWidget>
    with SingleTickerProviderStateMixin {
  late Ticker _ticker;
  late AnimatedCharacter _character;
  bool _posInitialized = false;

  @override
  void initState() {
    super.initState();
    _character = AnimatedCharacter(x: 100.0, y: 300.0);

    // 60 FPS continuous update ticker using sine-wave logic
    _ticker = createTicker((elapsed) {
      if (mounted) {
        setState(() {
          _character.updateAnimation();
        });
      }
    })..start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final charState = ref.watch(characterProvider);
    final profile = charState.profile;
    if (profile == null) return const SizedBox.shrink();

    final stage = charState.stageConfig;
    final gender = profile.characterGender;
    final assetPath = CharacterService.instance.getStageAssetPath(stage.id, gender);

    final screenSize = MediaQuery.of(context).size;

    // Initialize resting position once if default position exists in state
    if (!_posInitialized) {
      final initialX = charState.floatingDx ?? (screenSize.width - 100.0);
      final initialY = charState.floatingDy ?? (screenSize.height - 180.0);
      _character.baseX = initialX.clamp(10.0, (screenSize.width - 100.0).clamp(10.0, screenSize.width));
      _character.baseY = initialY.clamp(50.0, (screenSize.height - 150.0).clamp(50.0, screenSize.height));
      _character.x = _character.baseX;
      _character.y = _character.baseY;
      _posInitialized = true;
    }

    final double clampedX = _character.x.clamp(10.0, (screenSize.width - 100.0).clamp(10.0, screenSize.width));
    final double clampedY = _character.y.clamp(50.0, (screenSize.height - 150.0).clamp(50.0, screenSize.height));

    return Positioned(
      left: clampedX,
      top: clampedY,
      child: GestureDetector(
        onPanStart: (details) {
          _character.startDrag();
        },
        onPanUpdate: (details) {
          final newX = (clampedX + details.delta.dx).clamp(10.0, (screenSize.width - 100.0).clamp(10.0, screenSize.width));
          final newY = (clampedY + details.delta.dy).clamp(50.0, (screenSize.height - 150.0).clamp(50.0, screenSize.height));
          _character.dragTo(newX, newY);
          ref.read(characterProvider.notifier).updateFloatingPosition(newX, newY);
        },
        onPanEnd: (details) {
          _character.stopDrag();
        },
        onPanCancel: () {
          _character.stopDrag();
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

            // Continuous Sine-Wave Floating, Tilt & Breathing Transform
            Transform(
              transform: Matrix4.identity()
                ..rotateZ(_character.rotation * math.pi / 180.0)
                ..scale(_character.scale, _character.scale, 1.0),
              alignment: Alignment.center,
              child: Container(
                height: 85,
                width: 85,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.92),
                  boxShadow: [
                    BoxShadow(
                      color: Color(int.parse(stage.colorHex.replaceFirst('#', '0xFF'))).withOpacity(0.4),
                      blurRadius: 14,
                      spreadRadius: 3,
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
                      style: const TextStyle(fontSize: 42),
                    ),
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
