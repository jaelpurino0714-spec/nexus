import 'dart:async';
import 'package:flutter/material.dart';

class LevelUpAnimationFlow extends StatefulWidget {
  const LevelUpAnimationFlow({super.key});

  @override
  State<LevelUpAnimationFlow> createState() => _LevelUpAnimationFlowState();
}

class _LevelUpAnimationFlowState extends State<LevelUpAnimationFlow> with SingleTickerProviderStateMixin {
  int _activeStep = 0; // 0 to 4 (Step 1 to Step 5)
  bool _isPlaying = false;
  Timer? _timer;
  late AnimationController _glowController;

  final List<Map<String, String>> _steps = [
    {
      'title': '1. BABY STAGE',
      'subtitle': 'Curious & Excited',
      'asset': 'assets/images/mascot/flow_step_1_baby.png',
      'desc': 'Starting the science journey with curiosity & 0 XP.',
    },
    {
      'title': '2. DNA VORTEX SURGE',
      'subtitle': 'Level Up Energy',
      'asset': 'assets/images/mascot/flow_step_2_dna1.png',
      'desc': 'Earning 100 XP triggers a glowing double helix energy vortex!',
    },
    {
      'title': '3. STUDENT STAGE',
      'subtitle': 'Learning & Growing',
      'asset': 'assets/images/mascot/flow_step_3_student.png',
      'desc': 'Evolving into Student with blue jacket, book & streak boosts!',
    },
    {
      'title': '4. DNA SWIRL & ORBITS',
      'subtitle': 'Quantum Transformation',
      'asset': 'assets/images/mascot/flow_step_4_dna2.png',
      'desc': 'Reaching 300+ XP unlocks atomic particle orbits & science lab coats!',
    },
    {
      'title': '5. SCIENTIST STAGE',
      'subtitle': 'Exploring & Creating',
      'asset': 'assets/images/mascot/flow_step_5_scientist.png',
      'desc': 'Ultimate Scientist form with glowing beaker, tablet & LEVEL UP badge!',
    },
  ];

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _glowController.dispose();
    super.dispose();
  }

  void _togglePlay() {
    if (_isPlaying) {
      _stopPlay();
    } else {
      setState(() {
        _isPlaying = true;
        _activeStep = 0;
      });
      _timer = Timer.periodic(const Duration(milliseconds: 1400), (timer) {
        if (_activeStep < 4) {
          setState(() {
            _activeStep++;
          });
        } else {
          _stopPlay();
        }
      });
    }
  }

  void _stopPlay() {
    _timer?.cancel();
    setState(() {
      _isPlaying = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final currentStepData = _steps[_activeStep];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF160B3A).withOpacity(0.95),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF06B6D4).withOpacity(0.15),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        crossAlignment: CrossAlignment.start,
        children: [
          // Header Bar with Play/Pause Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF06B6D4).withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.bolt, color: Color(0xFF06B6D4), size: 18),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'LEVEL UP ANIMATION FLOW',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.1,
                    ),
                  ),
                ],
              ),

              // Play / Replay Animation Flow Button
              ElevatedButton.icon(
                onPressed: _togglePlay,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isPlaying ? const Color(0xFFEC4899) : const Color(0xFF06B6D4),
                  foregroundColor: Colors.white,
                  elevation: 4,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow, size: 16),
                label: Text(
                  _isPlaying ? 'Pause' : 'Play Flow',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Horizontal Flow Thumbnails Sequence (Step 1 -> 2 -> 3 -> 4 -> 5)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: List.generate(_steps.length, (idx) {
                final isSelected = _activeStep == idx;
                return Row(
                  children: [
                    GestureDetector(
                      onTap: () {
                        _stopPlay();
                        setState(() {
                          _activeStep = idx;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        width: 78,
                        height: 94,
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (idx % 2 == 1
                                  ? const Color(0xFFEC4899).withOpacity(0.25)
                                  : const Color(0xFF06B6D4).withOpacity(0.25))
                              : Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? (idx % 2 == 1 ? const Color(0xFFEC4899) : const Color(0xFF06B6D4))
                                : Colors.white.withOpacity(0.15),
                            width: isSelected ? 2.5 : 1,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: (idx % 2 == 1 ? const Color(0xFFEC4899) : const Color(0xFF06B6D4))
                                        .withOpacity(0.5),
                                    blurRadius: 12,
                                    spreadRadius: 2,
                                  )
                                ]
                              : null,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Expanded(
                              child: Image.asset(
                                _steps[idx]['asset']!,
                                fit: BoxFit.contain,
                                errorBuilder: (ctx, err, stack) => const Icon(Icons.flash_on, color: Colors.cyan),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Step ${idx + 1}',
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.white60,
                                fontSize: 10,
                                fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (idx < _steps.length - 1)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Icon(
                          Icons.double_arrow_rounded,
                          size: 16,
                          color: (_activeStep > idx) ? const Color(0xFF06B6D4) : Colors.white24,
                        ),
                      ),
                  ],
                );
              }),
            ),
          ),
          const SizedBox(height: 16),

          // Active Stage Detailed View & Animated Spotlight
          AnimatedBuilder(
            animation: _glowController,
            builder: (context, child) {
              final pulseGlow = _glowController.value * 0.4 + 0.6;

              return Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF2E1065).withOpacity(0.7),
                      const Color(0xFF1E1B4B).withOpacity(0.9),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: (_activeStep % 2 == 1 ? const Color(0xFFEC4899) : const Color(0xFF06B6D4))
                        .withOpacity(pulseGlow),
                  ),
                ),
                child: Row(
                  children: [
                    // Active Step Image Preview
                    Container(
                      height: 110,
                      width: 110,
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Image.asset(
                        currentStepData['asset']!,
                        fit: BoxFit.contain,
                        errorBuilder: (ctx, err, stack) => const Icon(Icons.star, color: Colors.cyan, size: 40),
                      ),
                    ),
                    const SizedBox(width: 16),

                    // Active Step Description & Titles
                    Expanded(
                      child: Column(
                        crossAlignment: CrossAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: (_activeStep % 2 == 1 ? const Color(0xFFEC4899) : const Color(0xFF06B6D4)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              currentStepData['subtitle']!,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            currentStepData['title']!,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            currentStepData['desc']!,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 14),

          // LEVEL UP 3D Banner Banner Burst (matching poster banner badge)
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6), Color(0xFFEC4899)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF3B82F6).withOpacity(0.6),
                    blurRadius: 16,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset(
                    'assets/images/mascot/flow_banner_levelup.png',
                    height: 38,
                    fit: BoxFit.contain,
                    errorBuilder: (ctx, err, stack) => const Icon(Icons.workspace_premium, color: Colors.amber),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAlignment: CrossAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'LEVEL UP!',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                      Text(
                        'Evolve with every quiz answer!',
                        style: TextStyle(
                          color: Colors.white90,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
