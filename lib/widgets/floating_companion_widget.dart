import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';
import 'character_pet_modal.dart';

class FloatingCompanionWidget extends ConsumerStatefulWidget {
  const FloatingCompanionWidget({super.key});

  @override
  ConsumerState<FloatingCompanionWidget> createState() => _FloatingCompanionWidgetState();
}

class _FloatingCompanionWidgetState extends ConsumerState<FloatingCompanionWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _bobbingController;
  late Animation<double> _bobbingAnimation;

  Offset? _localPos;
  double _totalDragDistance = 0.0;

  @override
  void initState() {
    super.initState();
    _bobbingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _bobbingAnimation = Tween<double>(begin: 0.0, end: -5.0).animate(
      CurvedAnimation(parent: _bobbingController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _bobbingController.dispose();
    super.dispose();
  }

  void _openPetModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const CharacterPetModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final charState = ref.watch(characterProvider);
    final profile = charState.profile;

    // Maintain floating companion across all student screens throughout game flow
    final String currentRoute = GoRouterState.of(context).matchedLocation;
    if (!currentRoute.startsWith('/student') || profile == null) {
      return const SizedBox.shrink();
    }

    final stage = charState.stageConfig;
    final String? gender = profile.characterGender;
    final String assetPath = CharacterService.instance.getStageAssetPath(stage.id, gender);

    final double topPadding = MediaQuery.of(context).padding.top + 16.0;
    final double bottomPadding = MediaQuery.of(context).padding.bottom + 80.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final double parentWidth = constraints.maxWidth;
        final double parentHeight = constraints.maxHeight;

        // Initial positioning at TOP RIGHT SIDE of app container by default
        final double defaultLeft = parentWidth - 80.0;
        final double defaultTop = topPadding + 40.0;

        final double currentDx = _localPos?.dx ?? (charState.floatingDx ?? defaultLeft);
        final double currentDy = _localPos?.dy ?? (charState.floatingDy ?? defaultTop);

        // Clamped positions to prevent dragging off app container
        final double clampedDx = currentDx.clamp(8.0, parentWidth - 72.0);
        final double clampedDy = currentDy.clamp(topPadding, parentHeight - bottomPadding);

        return Positioned(
          left: clampedDx,
          top: clampedDy,
          child: SafeArea(
            top: false,
            bottom: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAlignment: CrossAlignment.center,
              children: [
                // Floating Speech Bubble
                AnimatedOpacity(
                  duration: const Duration(milliseconds: 300),
                  opacity: charState.showFloatingSpeech ? 1.0 : 0.0,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0xFF673AB7),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.18),
                          blurRadius: 6,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Text(
                      charState.floatingSpeechMessage,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ),

                // Draggable Companion Icon
                GestureDetector(
                  onPanStart: (details) {
                    _totalDragDistance = 0.0;
                  },
                  onPanUpdate: (details) {
                    _totalDragDistance += details.delta.distance;
                    setState(() {
                      _localPos = Offset(
                        clampedDx + details.delta.dx,
                        clampedDy + details.delta.dy,
                      );
                    });
                  },
                  onPanEnd: (details) {
                    // Drag threshold check: distance >= 10px = Drag; < 10px = Tap
                    if (_totalDragDistance >= 10.0 && _localPos != null) {
                      ref
                          .read(characterProvider.notifier)
                          .updateFloatingPosition(_localPos!.dx, _localPos!.dy);
                    } else if (_totalDragDistance < 10.0) {
                      _openPetModal(context);
                    }
                  },
                  onTap: () {
                    _openPetModal(context);
                  },
                  child: AnimatedBuilder(
                    animation: _bobbingAnimation,
                    builder: (context, child) {
                      return Transform.translate(
                        offset: Offset(0, _bobbingAnimation.value),
                        child: child,
                      );
                    },
                    child: Container(
                      height: 64,
                      width: 64,
                      padding: const EdgeInsets.all(5),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFF673AB7),
                          width: 2.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF673AB7).withOpacity(0.3),
                            blurRadius: 10,
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
                              style: const TextStyle(fontSize: 30),
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
      },
    );
  }
}
