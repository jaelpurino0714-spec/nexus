import 'package:flutter/material.dart';
import 'mascot_3d_viewer.dart';

class MascotExpressionPicker extends StatelessWidget {
  final MascotStage stage;
  final String activeExpression;
  final Function(String expression) onExpressionSelected;

  const MascotExpressionPicker({
    super.key,
    required this.stage,
    required this.activeExpression,
    required this.onExpressionSelected,
  });

  List<Map<String, String>> _getExpressions() {
    switch (stage) {
      case MascotStage.baby:
        return [
          {'id': 'happy', 'label': 'Happy', 'asset': 'assets/images/mascot/baby_exp_happy.png'},
          {'id': 'neutral', 'label': 'Curious', 'asset': 'assets/images/mascot/baby_exp_neutral.png'},
          {'id': 'heart', 'label': 'Love', 'asset': 'assets/images/mascot/baby_exp_heart.png'},
          {'id': 'alert', 'label': 'Alert!', 'asset': 'assets/images/mascot/baby_exp_alert.png'},
        ];
      case MascotStage.student:
        return [
          {'id': 'happy', 'label': 'Happy', 'asset': 'assets/images/mascot/student_exp_happy.png'},
          {'id': 'wink', 'label': 'Wink', 'asset': 'assets/images/mascot/student_exp_wink.png'},
          {'id': 'neutral', 'label': 'Focused', 'asset': 'assets/images/mascot/student_exp_neutral.png'},
          {'id': 'glasses', 'label': 'Smart', 'asset': 'assets/images/mascot/student_exp_glasses.png'},
        ];
      case MascotStage.scientist:
        return [
          {'id': 'smile', 'label': 'Smile', 'asset': 'assets/images/mascot/scientist_exp_smile.png'},
          {'id': 'wink', 'label': 'Clever', 'asset': 'assets/images/mascot/scientist_exp_wink.png'},
          {'id': 'determined', 'label': 'Analytical', 'asset': 'assets/images/mascot/scientist_exp_determined.png'},
          {'id': 'excited', 'label': 'Eureka!', 'asset': 'assets/images/mascot/scientist_exp_excited.png'},
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final expressions = _getExpressions();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF160B3A).withOpacity(0.9),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFEC4899).withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              const Icon(Icons.face_retouching_natural, color: Color(0xFFEC4899), size: 16),
              const SizedBox(width: 8),
              const Text(
                'ANIMATED EXPRESSIONS',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: expressions.map((exp) {
              final isSelected = activeExpression == exp['id'];
              return GestureDetector(
                onTap: () => onExpressionSelected(exp['id']!),
                child: Column(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(6),
                      height: 52,
                      width: 64,
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFFEC4899).withOpacity(0.25)
                            : Colors.white.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? const Color(0xFFEC4899) : Colors.transparent,
                          width: 2,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: const Color(0xFFEC4899).withOpacity(0.5),
                                  blurRadius: 10,
                                  spreadRadius: 1,
                                )
                              ]
                            : null,
                      ),
                      child: Image.asset(
                        exp['asset']!,
                        fit: BoxFit.contain,
                        errorBuilder: (ctx, err, stack) => Icon(
                          Icons.face,
                          color: isSelected ? const Color(0xFFEC4899) : Colors.white60,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      exp['label']!,
                      style: TextStyle(
                        color: isSelected ? const Color(0xFFEC4899) : Colors.white60,
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
