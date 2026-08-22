import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';

enum MascotStage { baby, student, scientist }

class Mascot3DViewer extends StatefulWidget {
  final MascotStage stage;
  final String activeExpression; // e.g. 'happy', 'wink', 'neutral', 'glasses', 'heart', 'alert', 'determined', 'excited'
  final double height;
  final bool showTurnaroundControls;
  final Function(double angle)? onAngleChanged;

  const Mascot3DViewer({
    super.key,
    required this.stage,
    this.activeExpression = 'happy',
    this.height = 260.0,
    this.showTurnaroundControls = true,
    this.onAngleChanged,
  });

  @override
  State<Mascot3DViewer> createState() => _Mascot3DViewerState();
}

class _Mascot3DViewerState extends State<Mascot3DViewer> with TickerProviderStateMixin {
  late AnimationController _idleController;
  late AnimationController _tapReactionController;
  late Animation<double> _jumpAnimation;

  double _yRotationAngle = 0.0; // Angle in radians (0 = Front, pi/4 = 45 deg, pi/2 = 90 deg, pi = 180 deg)
  bool _isBlinking = false;
  Timer? _blinkTimer;
  String _currentSpeechQuote = '';
  bool _showSpeechBubble = false;
  Timer? _speechTimer;

  static const List<String> _tapQuotes = [
    "Ready to learn! 🚀",
    "Let's grow together! 🧬",
    "Science power up! ⚡",
    "Keep that streak alive! 🔥",
    "Eureka! I feel so smart! 💡",
    "Quantum jump activated! 🌀",
    "Let's solve the next quiz! 🧪",
  ];

  @override
  void initState() {
    super.initState();
    // Smooth natural floating & breathing loop
    _idleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    )..repeat(reverse: true);

    // Interactive Tap Spring Jump Reaction
    _tapReactionController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 750),
    );

    _jumpAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _tapReactionController,
        curve: Curves.elasticOut,
      ),
    );

    // Periodic natural blink timer
    _startBlinkTimer();
  }

  void _startBlinkTimer() {
    _blinkTimer?.cancel();
    _blinkTimer = Timer.periodic(const Duration(milliseconds: 3800), (timer) {
      if (mounted) {
        setState(() {
          _isBlinking = true;
        });
        Future.delayed(const Duration(milliseconds: 160), () {
          if (mounted) {
            setState(() {
              _isBlinking = false;
            });
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _blinkTimer?.cancel();
    _speechTimer?.cancel();
    _idleController.dispose();
    _tapReactionController.dispose();
    super.dispose();
  }

  void _triggerTapReaction() {
    _tapReactionController.forward(from: 0.0);
    final randomQuote = _tapQuotes[math.Random().nextInt(_tapQuotes.length)];
    setState(() {
      _currentSpeechQuote = randomQuote;
      _showSpeechBubble = true;
    });

    _speechTimer?.cancel();
    _speechTimer = Timer(const Duration(milliseconds: 2600), () {
      if (mounted) {
        setState(() {
          _showSpeechBubble = false;
        });
      }
    });
  }

  // Map Y-axis angle to closest turnaround image sprite
  String _getTurnaroundAssetPath() {
    final normAngle = (_yRotationAngle % (2 * math.pi) + 2 * math.pi) % (2 * math.pi);
    final stageName = widget.stage.name; // 'baby', 'student', 'scientist'

    if (normAngle >= 7 * math.pi / 4 || normAngle < math.pi / 4) {
      return 'assets/images/mascot/${stageName}_turn_0.png';
    } else if (normAngle >= math.pi / 4 && normAngle < 3 * math.pi / 4) {
      return 'assets/images/mascot/${stageName}_turn_45.png';
    } else if (normAngle >= 3 * math.pi / 4 && normAngle < 5 * math.pi / 4) {
      return 'assets/images/mascot/${stageName}_turn_90.png';
    } else {
      return 'assets/images/mascot/${stageName}_turn_180.png';
    }
  }

  String _getMainMascotAssetPath() {
    final stageName = widget.stage.name;
    return 'assets/images/mascot/${stageName}_main.png';
  }

  String _getExpressionAssetPath() {
    final stageName = widget.stage.name;
    String expKey = widget.activeExpression;

    if (stageName == 'baby') {
      if (!['happy', 'neutral', 'heart', 'alert'].contains(expKey)) expKey = 'happy';
      return 'assets/images/mascot/baby_exp_$expKey.png';
    } else if (stageName == 'student') {
      if (!['happy', 'wink', 'neutral', 'glasses'].contains(expKey)) expKey = 'happy';
      return 'assets/images/mascot/student_exp_$expKey.png';
    } else {
      if (!['smile', 'wink', 'determined', 'excited'].contains(expKey)) expKey = 'smile';
      return 'assets/images/mascot/scientist_exp_$expKey.png';
    }
  }

  void _setTurnaroundAngle(double degrees) {
    setState(() {
      _yRotationAngle = degrees * (math.pi / 180.0);
    });
    if (widget.onAngleChanged != null) {
      widget.onAngleChanged!(_yRotationAngle);
    }
  }

  @override
  Widget build(BuildContext context) {
    final normAngle = (_yRotationAngle % (2 * math.pi) + 2 * math.pi) % (2 * math.pi);
    final isFrontView = normAngle < 0.25 || normAngle > (2 * math.pi - 0.25);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Interactive Animated 3D Mascot Viewport
        GestureDetector(
          onTap: _triggerTapReaction,
          onHorizontalDragUpdate: (details) {
            setState(() {
              _yRotationAngle += details.primaryDelta! * 0.015;
            });
            if (widget.onAngleChanged != null) {
              widget.onAngleChanged!(_yRotationAngle);
            }
          },
          child: AnimatedBuilder(
            animation: Listenable.merge([_idleController, _tapReactionController]),
            builder: (context, child) {
              final progress = _idleController.value;
              final tapJump = _jumpAnimation.value;

              // Physics-based natural floating bobbing (Y offset)
              final baseFloatY = math.sin(progress * math.pi) * 10.0;
              final jumpOffsetY = tapJump * 36.0;
              final totalOffsetY = baseFloatY + jumpOffsetY;

              // Natural body sway / tilt (Z rotation in radians ~ +/- 4 degrees)
              final bodySwayZ = math.sin(progress * math.pi * 0.8) * 0.06;

              // Squash & stretch scale deformation
              final squashX = 1.0 + math.sin(progress * math.pi) * 0.035 - (tapJump * 0.08);
              final stretchY = 1.0 - math.sin(progress * math.pi) * 0.035 + (tapJump * 0.12);

              // Base ring pulse
              final platformPulse = 1.0 + math.sin(progress * math.pi) * 0.04;

              return SizedBox(
                height: widget.height,
                width: double.infinity,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // 1. Floating Speech Bubble Reaction
                    Positioned(
                      top: 0,
                      child: AnimatedOpacity(
                        duration: const Duration(milliseconds: 250),
                        opacity: _showSpeechBubble ? 1.0 : 0.0,
                        child: AnimatedScale(
                          duration: const Duration(milliseconds: 250),
                          scale: _showSpeechBubble ? 1.0 : 0.6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEC4899),
                              borderRadius: BorderRadius.circular(18),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFEC4899).withOpacity(0.5),
                                  blurRadius: 12,
                                  spreadRadius: 1,
                                ),
                              ],
                            ),
                            child: Text(
                              _currentSpeechQuote,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    // 2. Glowing 3D Base Platform Ring
                    Positioned(
                      bottom: 12,
                      child: Transform(
                        alignment: Alignment.center,
                        transform: Matrix4.identity()
                          ..setEntry(3, 2, 0.002)
                          ..rotateX(1.1),
                        child: Container(
                          width: 170 * platformPulse,
                          height: 170 * platformPulse,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: RadialGradient(
                              colors: [
                                widget.stage == MascotStage.baby
                                    ? const Color(0xFFA855F7).withOpacity(0.85)
                                    : widget.stage == MascotStage.student
                                        ? const Color(0xFF06B6D4).withOpacity(0.85)
                                        : const Color(0xFF3B82F6).withOpacity(0.9),
                                widget.stage == MascotStage.baby
                                    ? const Color(0xFFEC4899).withOpacity(0.4)
                                    : const Color(0xFFA855F7).withOpacity(0.4),
                                Colors.transparent,
                              ],
                              stops: const [0.2, 0.65, 1.0],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: widget.stage == MascotStage.baby
                                    ? const Color(0xFFA855F7).withOpacity(0.6)
                                    : const Color(0xFF06B6D4).withOpacity(0.6),
                                blurRadius: 30,
                                spreadRadius: 6,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    // 3. Animated 3D Mascot Character with Natural Multi-Axis Physics & Scale
                    Transform(
                      alignment: Alignment.center,
                      transform: Matrix4.identity()
                        ..setEntry(3, 2, 0.0015) // Perspective depth
                        ..rotateY(_yRotationAngle) // 3D Y-axis rotation
                        ..rotateZ(bodySwayZ) // Natural body sway
                        ..translate(0.0, -totalOffsetY, 0.0)
                        ..scale(squashX, stretchY, 1.0),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Base Mascot Sprite (Transparent background)
                          Image.asset(
                            isFrontView ? _getMainMascotAssetPath() : _getTurnaroundAssetPath(),
                            height: widget.height * 0.76,
                            fit: BoxFit.contain,
                            errorBuilder: (ctx, err, stack) => Icon(
                              widget.stage == MascotStage.baby
                                  ? Icons.child_care
                                  : widget.stage == MascotStage.student
                                      ? Icons.school
                                      : Icons.science,
                              size: 100,
                              color: const Color(0xFFA855F7),
                            ),
                          ),

                          // Visor Expression & Natural Blink Overlay (shown on front view)
                          if (isFrontView)
                            Positioned(
                              top: widget.height * (widget.stage == MascotStage.scientist ? 0.16 : 0.18),
                              child: AnimatedOpacity(
                                duration: const Duration(milliseconds: 120),
                                opacity: _isBlinking ? 0.1 : 1.0,
                                child: AnimatedSwitcher(
                                  duration: const Duration(milliseconds: 250),
                                  transitionBuilder: (child, anim) => ScaleTransition(
                                    scale: anim,
                                    child: FadeTransition(opacity: anim, child: child),
                                  ),
                                  child: Image.asset(
                                    _getExpressionAssetPath(),
                                    key: ValueKey('${widget.stage}_${widget.activeExpression}'),
                                    height: 48,
                                    fit: BoxFit.contain,
                                    errorBuilder: (ctx, err, stack) => const SizedBox.shrink(),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),

                    // 4. Floating 3D Hint Badge
                    Positioned(
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.45),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.touch_app, color: Color(0xFFEC4899), size: 13),
                            const SizedBox(width: 4),
                            const Text('Tap to jump • ', style: TextStyle(color: Colors.white70, fontSize: 11)),
                            const Icon(Icons.threed_rotation, color: Color(0xFF06B6D4), size: 13),
                            const SizedBox(width: 4),
                            Text(
                              'Drag ${(normAngle * 180 / math.pi).round()}°',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),

        // Turnaround View Angles Bar (0°, 45°, 90°, 180°)
        if (widget.showTurnaroundControls) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF160B3A).withOpacity(0.85),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.3)),
            ),
            child: Wrap(
              spacing: 4,
              runSpacing: 4,
              alignment: WrapAlignment.center,
              crossAlignment: WrapCrossAlignment.center,
              children: [
                const Text('TURNAROUND VIEWS: ',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    )),
                _buildTurnaroundPill('Front (0°)', 0),
                _buildTurnaroundPill('3/4 (45°)', 45),
                _buildTurnaroundPill('Side (90°)', 90),
                _buildTurnaroundPill('Back (180°)', 180),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildTurnaroundPill(String label, double targetDegrees) {
    final normAngle = (_yRotationAngle % (2 * math.pi) + 2 * math.pi) % (2 * math.pi);
    final targetRad = targetDegrees * (math.pi / 180.0);
    final isSelected = (normAngle - targetRad).abs() < 0.25 || (normAngle - targetRad - 2 * math.pi).abs() < 0.25;

    return GestureDetector(
      onTap: () => _setTurnaroundAngle(targetDegrees),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFA855F7) : Colors.white.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFFA855F7).withOpacity(0.6),
                    blurRadius: 8,
                    spreadRadius: 1,
                  )
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white70,
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
