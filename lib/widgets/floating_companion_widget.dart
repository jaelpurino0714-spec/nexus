import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';

class FloatingCompanionWidget extends ConsumerStatefulWidget {
  const FloatingCompanionWidget({super.key});

  @override
  ConsumerState<FloatingCompanionWidget> createState() => _FloatingCompanionWidgetState();
}

class _FloatingCompanionWidgetState extends ConsumerState<FloatingCompanionWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _bobbingController;
  late Animation<double> _bobbingAnimation;

  @override
  void initState() {
    super.initState();
    _bobbingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _bobbingAnimation = Tween<double>(begin: 0.0, end: -6.0).animate(
      CurvedAnimation(parent: _bobbingController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _bobbingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final charState = ref.watch(characterProvider);
    final profile = charState.profile;

    // Hide floating companion on full character screen or when profile is missing
    final String currentRoute = GoRouterState.of(context).matchedLocation;
    if (currentRoute == '/student/character' || profile == null) {
      return const SizedBox.shrink();
    }

    final stage = charState.stageConfig;
    final String? gender = profile.characterGender;
    final String assetPath = CharacterService.instance.getStageAssetPath(stage.id, gender);

    return Positioned(
      right: 16,
      bottom: 24,
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAlignment: CrossAlignment.end,
          children: [
            // Floating Contextual Speech Bubble
            AnimatedOpacity(
              duration: const Duration(milliseconds: 300),
              opacity: charState.showFloatingSpeech ? 1.0 : 0.0,
              child: Container(
                margin: const EdgeInsets.only(bottom: 6, right: 4),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF673AB7),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Text(
                  charState.floatingSpeechMessage,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),

            // Animated Compact Floating Character Icon
            AnimatedBuilder(
              animation: _bobbingAnimation,
              builder: (context, child) {
                return Transform.translate(
                  offset: Offset(0, _bobbingAnimation.value),
                  child: child,
                );
              },
              child: GestureDetector(
                onTap: () {
                  context.push('/student/character');
                },
                child: Container(
                  height: 64,
                  width: 64,
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFF673AB7),
                      width: 2.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF673AB7).withOpacity(0.25),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Image.asset(
                      assetPath,
                      fit: BoxFit.contain,
                      errorBuilder: (ctx, err, stack) => Center(
                        child: Text(
                          stage.icon,
                          style: const TextStyle(fontSize: 32),
                        ),
                      ),
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
