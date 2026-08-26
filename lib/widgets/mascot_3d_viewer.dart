import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';

enum MascotStage { baby, student, scientist }

class Mascot3DViewer extends StatefulWidget {
  final MascotStage stage;
  final String activeExpression; // e.g. 'happy', 'wink', 'neutral', 'glasses', 'heart', 'alert', 'determined', 'excited'
  final double height;
  final bool showTurnaroundControls;
  final bool showActionToolbar;
  final Function(double angle)? onAngleChanged;
  final Function(String expression)? onExpressionChanged;

  const Mascot3DViewer({
    super.key,
    required this.stage,
    this.activeExpression = 'happy',
    this.height = 260.0,
    this.showTurnaroundControls = true,
    this.showActionToolbar = true,
    this.onAngleChanged,
    this.onExpressionChanged,
  });

  @override
  State<Mascot3DViewer> createState() => _Mascot3DViewerState();
}

class _Mascot3DViewerState extends State<Mascot3DViewer> with TickerProviderStateMixin {
  late AnimationController _idleController;
  late AnimationController _tapReactionController;
  late AnimationController _waveController;
  late AnimationController _lookController;
  late AnimationController _spinController;
  late AnimationController _celebrateController;
  late Animation<double> _jumpAnimation;

  double _yRotationAngle = 0.0; // Angle in radians (0 = Front, pi/4 = 45 deg, etc.)
  bool _isBlinking = false;
  Timer? _blinkTimer;
  Timer? _idleAITimer;
  String _currentSpeechQuote = '';
  bool _showSpeechBubble = false;
  Timer? _speechTimer;

  // Active expression state
  late String _currentExpression;

  // Gaze & Looking direction offsets
  double _gazeX = 0.0;
  double _gazeY = 0.0;
  double _headTiltZ = 0.0;
  String _currentDirectionLabel = 'Center';

  static const List<String> _tapQuotes = [
    "Ready to learn! 🚀",
    "Let's grow together! 🧬",
    "Science power up! ⚡",
    "Keep that streak alive! 🔥",
    "Eureka! I feel so smart! 💡",
    "Quantum jump activated! 🌀",
    "Let's solve the next quiz! 🧪",
  ];

  static const List<String> _waveQuotes = [
    "Hello there! Waving at you! 👋",
    "Hi partner! Ready for science? 👋",
    "Greetings, fellow scientist! 👋",
  ];

  static const List<String> _lookQuotes = [
    "Scanning environment for clues... 🧐",
    "Looking left, right, and up! 👀",
    "Curious about the world! 💡",
  ];

  static const List<String> _celebrateQuotes = [
    "Woohoo! Science dance party! 🥳✨",
    "Super celebration jump! 🎉",
    "100%charged with knowledge! ⚡",
  ];

  static const List<String> _spinQuotes = [
    "360° Quantum Spin! 🌀",
    "Whoosh! Full rotation! 💫",
  ];

  static const List<String> _blinkQuotes = [
    "Wink! Keeping an eye on science! 😉",
    "Blink blink! Stay sharp! 👁️",
  ];

  @override
  void initState() {
    super.initState();
    _currentExpression = widget.activeExpression;

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

    // Hand Wave Action Controller
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    // Look Around Action Controller
    _lookController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    // 360° Spin Action Controller
    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // Celebration Dance Action Controller
    _celebrateController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    // Periodic natural blink timer
    _startBlinkTimer();

    // Periodic spontaneous idle AI behavior
    _startIdleAITimer();
  }

  @override
  void didUpdateWidget(Mascot3DViewer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.activeExpression != widget.activeExpression) {
      setState(() {
        _currentExpression = widget.activeExpression;
      });
    }
  }

  void _startBlinkTimer() {
    _blinkTimer?.cancel();
    _blinkTimer = Timer.periodic(const Duration(milliseconds: 4200), (timer) {
      if (mounted) {
        _performBlink();
      }
    });
  }

  void _performBlink() {
    setState(() {
      _isBlinking = true;
    });
    Future.delayed(const Duration(milliseconds: 180), () {
      if (mounted) {
        setState(() {
          _isBlinking = false;
        });
      }
    });
  }

  void _startIdleAITimer() {
    _idleAITimer?.cancel();
    _idleAITimer = Timer.periodic(const Duration(seconds: 7), (timer) {
      if (mounted &&
          !_waveController.isAnimating &&
          !_lookController.isAnimating &&
          !_spinController.isAnimating &&
          !_celebrateController.isAnimating &&
          !_tapReactionController.isAnimating) {
        final rnd = math.Random().nextInt(4);
        if (rnd == 0) {
          _triggerLookAroundAction(showSpeech: false);
        } else if (rnd == 1) {
          _performBlink();
        } else if (rnd == 2) {
          _triggerWaveAction(showSpeech: false);
        }
      }
    });
  }

  @override
  void dispose() {
    _blinkTimer?.cancel();
    _idleAITimer?.cancel();
    _speechTimer?.cancel();
    _idleController.dispose();
    _tapReactionController.dispose();
    _waveController.dispose();
    _lookController.dispose();
    _spinController.dispose();
    _celebrateController.dispose();
    super.dispose();
  }

  void _showSpeech(String text) {
    setState(() {
      _currentSpeechQuote = text;
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

  void _triggerTapReaction() {
    _tapReactionController.forward(from: 0.0);
    final randomQuote = _tapQuotes[math.Random().nextInt(_tapQuotes.length)];
    _showSpeech(randomQuote);
  }

  // --- MASCOT ACTION METHODS ---

  // 1. Hand Waving Action
  void _triggerWaveAction({bool showSpeech = true}) {
    _waveController.forward(from: 0.0);
    if (showSpeech) {
      final q = _waveQuotes[math.Random().nextInt(_waveQuotes.length)];
      _showSpeech(q);
    }
  }

  // 2. Look Around / Direction Action
  void _triggerLookAroundAction({bool showSpeech = true}) {
    _lookController.forward(from: 0.0);
    
    // Animate glance sequence: Center -> Left -> Right -> Up -> Center
    Timer(const Duration(milliseconds: 0), () {
      if (mounted) _setGazeDirection('Left', -16.0, 0.0, -0.08);
    });
    Timer(const Duration(milliseconds: 550), () {
      if (mounted) _setGazeDirection('Right', 16.0, 0.0, 0.08);
    });
    Timer(const Duration(milliseconds: 1100), () {
      if (mounted) _setGazeDirection('Up', 0.0, -12.0, 0.0);
    });
    Timer(const Duration(milliseconds: 1600), () {
      if (mounted) _setGazeDirection('Center', 0.0, 0.0, 0.0);
    });

    if (showSpeech) {
      final q = _lookQuotes[math.Random().nextInt(_lookQuotes.length)];
      _showSpeech(q);
    }
  }

  // 3. Set Specific Direction
  void _setGazeDirection(String label, double gx, double gy, double tilt) {
    setState(() {
      _currentDirectionLabel = label;
      _gazeX = gx;
      _gazeY = gy;
      _headTiltZ = tilt;
    });
  }

  // 4. Blink / Wink Action
  void _triggerBlinkAction() {
    _performBlink();
    // Temporarily switch expression to wink for fun
    final oldExp = _currentExpression;
    _setExpression('wink');
    _showSpeech(_blinkQuotes[math.Random().nextInt(_blinkQuotes.length)]);
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) _setExpression(oldExp);
    });
  }

  // 5. Celebration Dance Action
  void _triggerCelebrateAction() {
    _celebrateController.forward(from: 0.0);
    _showSpeech(_celebrateQuotes[math.Random().nextInt(_celebrateQuotes.length)]);
  }

  // 6. 360° Spin Action
  void _triggerSpinAction() {
    _spinController.forward(from: 0.0);
    _showSpeech(_spinQuotes[math.Random().nextInt(_spinQuotes.length)]);
  }

  // 7. Facial Expression Switcher
  void _setExpression(String exp) {
    setState(() {
      _currentExpression = exp;
    });
    if (widget.onExpressionChanged != null) {
      widget.onExpressionChanged!(exp);
    }
  }

  List<Map<String, String>> _getAvailableExpressions() {
    switch (widget.stage) {
      case MascotStage.baby:
        return [
          {'id': 'happy', 'label': '😊 Happy'},
          {'id': 'neutral', 'label': '🧐 Curious'},
          {'id': 'heart', 'label': '😍 Love'},
          {'id': 'alert', 'label': '😮 Alert'},
        ];
      case MascotStage.student:
        return [
          {'id': 'happy', 'label': '😊 Happy'},
          {'id': 'wink', 'label': '😉 Wink'},
          {'id': 'neutral', 'label': '🧠 Focus'},
          {'id': 'glasses', 'label': '👓 Smart'},
        ];
      case MascotStage.scientist:
        return [
          {'id': 'smile', 'label': '😄 Smile'},
          {'id': 'wink', 'label': '😉 Clever'},
          {'id': 'determined', 'label': '🧐 Analytical'},
          {'id': 'excited', 'label': '💡 Eureka'},
        ];
    }
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
    if (stageName == 'baby') {
      return 'assets/images/mascot/baby_main.gif';
    }
    if (stageName == 'student') {
      return 'assets/images/mascot/student_main.gif';
    }
    if (stageName == 'scientist') {
      return 'assets/images/mascot/scientist_main.gif';
    }
    return 'assets/images/mascot/${stageName}_main.png';
  }

  String _getExpressionAssetPath() {
    final stageName = widget.stage.name;
    String expKey = _currentExpression;

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
    final expressions = _getAvailableExpressions();

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
            animation: Listenable.merge([
              _idleController,
              _tapReactionController,
              _waveController,
              _lookController,
              _spinController,
              _celebrateController,
            ]),
            builder: (context, child) {
              final progress = _idleController.value;
              final tapJump = _jumpAnimation.value;
              final waveVal = _waveController.value;
              final spinVal = _spinController.value;
              final celVal = _celebrateController.value;

              // Physics-based natural floating bobbing (Y offset)
              final isAnimatedGif = true;
              final baseFloatY = isAnimatedGif ? 0.0 : math.sin(progress * math.pi) * 10.0;
              final jumpOffsetY = tapJump * 36.0;
              final celJumpY = math.sin(celVal * math.pi * 2) * 40.0;
              final totalOffsetY = baseFloatY + jumpOffsetY + celJumpY;

              // Hand wave sway + body tilt
              final waveBodySway = math.sin(waveVal * math.pi * 6) * 0.14;
              final celTwist = math.sin(celVal * math.pi * 4) * 0.12;

              // Natural body sway / tilt (Z rotation in radians)
              final bodySwayZ = isAnimatedGif ? 0.0 : (math.sin(progress * math.pi * 0.8) * 0.06 + _headTiltZ + waveBodySway + celTwist);

              // Squash & stretch scale deformation
              final squashX = isAnimatedGif ? 1.0 : (1.0 + math.sin(progress * math.pi) * 0.035 - (tapJump * 0.08) + (math.sin(celVal * math.pi * 2) * 0.12));
              final stretchY = isAnimatedGif ? 1.0 : (1.0 - math.sin(progress * math.pi) * 0.035 + (tapJump * 0.12) + (math.sin(celVal * math.pi * 2) * 0.15));

              // 360 Spin Angle Offset
              final spinAngleY = spinVal * math.pi * 2;
              final currentYAngle = _yRotationAngle + spinAngleY;

              // Base ring pulse
              final platformPulse = 1.0 + math.sin(progress * math.pi) * 0.04 + (celVal * 0.15);

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

                    // 3. Animated 3D Mascot Character with Multi-Axis Physics, Scale, Wave & Direction
                    Transform(
                      alignment: Alignment.center,
                      transform: Matrix4.identity()
                        ..setEntry(3, 2, 0.0015) // Perspective depth
                        ..rotateY(currentYAngle) // 3D Y-axis rotation
                        ..rotateZ(bodySwayZ) // Body sway & head tilt
                        ..translate(_gazeX, -totalOffsetY + _gazeY, 0.0) // Gaze direction translation
                        ..scale(squashX, stretchY, 1.0),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Base Mascot Sprite (Transparent background)
                          Image.asset(
                            isFrontView ? _getMainMascotAssetPath() : _getTurnaroundAssetPath(),
                            key: ValueKey(isFrontView ? _getMainMascotAssetPath() : _getTurnaroundAssetPath()),
                            gaplessPlayback: true,
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

                          // Visor Expression & Natural Blink Overlay (shown on front view for baby & student)
                          if (isFrontView && widget.stage != MascotStage.scientist)
                            Positioned(
                              top: widget.height * (widget.stage == MascotStage.scientist ? 0.16 : 0.18) + (_gazeY * 0.6),
                              left: (widget.height * 0.28) + (_gazeX * 0.7),
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
                                    key: ValueKey('${widget.stage}_$_currentExpression'),
                                    height: 48,
                                    fit: BoxFit.contain,
                                    errorBuilder: (ctx, err, stack) => const SizedBox.shrink(),
                                  ),
                                ),
                              ),
                            ),

                          // Hand Waving Emoji Overlay on Mascot
                          if (waveVal > 0.01)
                            Positioned(
                              top: widget.height * 0.22,
                              right: 20.0 + (math.sin(waveVal * math.pi * 6) * 12.0),
                              child: Transform.rotate(
                                angle: math.sin(waveVal * math.pi * 8) * 0.35,
                                child: const Text(
                                  '👋',
                                  style: TextStyle(fontSize: 32),
                                ),
                              ),
                            ),

                          // Celebration Confetti Star Overlay on Mascot
                          if (celVal > 0.01)
                            Positioned(
                              top: widget.height * 0.05,
                              child: const Text(
                                '✨ 🌟 ✨',
                                style: TextStyle(fontSize: 28),
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

        // --- INTERACTIVE MASCOT ACTION TOOLBAR ---
        if (widget.showActionToolbar) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A).withOpacity(0.92),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.4)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF8B5CF6).withOpacity(0.2),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Section Title: Action Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.smart_toy_outlined, color: Color(0xFFEC4899), size: 14),
                    const SizedBox(width: 6),
                    const Text(
                      'MASCOT ANIMATED ACTIONS & GAZE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Row 1: Action Buttons (Wave, Look Around, Blink, Celebrate, 360 Spin)
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildActionButton('👋 Wave', Colors.amber.shade700, _triggerWaveAction),
                      const SizedBox(width: 6),
                      _buildActionButton('👀 Look Around', Colors.cyan.shade600, _triggerLookAroundAction),
                      const SizedBox(width: 6),
                      _buildActionButton('😉 Blink', Colors.purple.shade600, _triggerBlinkAction),
                      const SizedBox(width: 6),
                      _buildActionButton('🎉 Cheer', Colors.pink.shade600, _triggerCelebrateAction),
                      const SizedBox(width: 6),
                      _buildActionButton('🌀 360° Spin', Colors.blue.shade600, _triggerSpinAction),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // Row 2: Look Direction Buttons (Left, Center, Right, Up)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'GAZE: ',
                      style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    _buildGazePill('👈 Left', 'Left', -16.0, 0.0, -0.08),
                    const SizedBox(width: 4),
                    _buildGazePill('😶 Center', 'Center', 0.0, 0.0, 0.0),
                    const SizedBox(width: 4),
                    _buildGazePill('👉 Right', 'Right', 16.0, 0.0, 0.08),
                    const SizedBox(width: 4),
                    _buildGazePill('👆 Up', 'Up', 0.0, -12.0, 0.0),
                  ],
                ),
                const SizedBox(height: 8),

                // Row 3: Facial Expression Picker Pills
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'EXPRESSION: ',
                      style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    ...expressions.map((exp) {
                      final isSelected = _currentExpression == exp['id'];
                      return Padding(
                        padding: const EdgeInsets.only(left: 4.0),
                        child: GestureDetector(
                          onTap: () => _setExpression(exp['id']!),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? const Color(0xFFEC4899)
                                  : Colors.white.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected ? Colors.white : Colors.transparent,
                                width: 1,
                              ),
                            ),
                            child: Text(
                              exp['label']!,
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.white70,
                                fontSize: 10,
                                fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ],
            ),
          ),
        ],

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

  Widget _buildActionButton(String label, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.4),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }

  Widget _buildGazePill(String label, String key, double gx, double gy, double tilt) {
    final isSelected = _currentDirectionLabel == key;
    return GestureDetector(
      onTap: () => _setGazeDirection(key, gx, gy, tilt),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF06B6D4) : Colors.white.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? Colors.white : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white70,
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
          ),
        ),
      ),
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
