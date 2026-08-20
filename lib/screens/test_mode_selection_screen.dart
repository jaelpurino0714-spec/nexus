import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class TestModeSelectionScreen extends StatefulWidget {
  final int termNum;
  final String topicTitle;
  final String topicId;

  const TestModeSelectionScreen({
    super.key,
    required this.termNum,
    required this.topicTitle,
    required this.topicId,
  });

  @override
  State<TestModeSelectionScreen> createState() => _TestModeSelectionScreenState();
}

class _TestModeSelectionScreenState extends State<TestModeSelectionScreen> {
  bool _showPostTestOptions = false;

  void _startPreTest() {
    context.push('/student/quiz', extra: {
      'topicId': widget.topicId,
      'topicTitle': widget.topicTitle,
      'quizType': 'pre_test',
      'questionType': 'multiple_choice',
    });
  }

  void _startPostTest(String questionType) {
    context.push('/student/quiz', extra: {
      'topicId': widget.topicId,
      'topicTitle': widget.topicTitle,
      'quizType': 'post_test',
      'questionType': questionType,
    });
  }

  Widget _buildGradientText(String text, {double fontSize = 24, FontWeight fontWeight = FontWeight.w800}) {
    return ShaderMask(
      shaderCallback: (bounds) => const LinearGradient(
        colors: [Color(0xFFB052FF), Color(0xFF00F2FE)],
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
      ).createShader(bounds),
      child: Text(
        text,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: Colors.white,
          letterSpacing: -0.3,
        ),
      ),
    );
  }

  Widget _buildCardHeader(String text, {bool isWhiteTitle = false}) {
    if (isWhiteTitle) {
      return Text(
        text,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      );
    }
    return ShaderMask(
      shaderCallback: (bounds) => const LinearGradient(
        colors: [Color(0xFFD8B4FE), Color(0xFFC084FC)],
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
      ).createShader(bounds),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _circleText(String label, Color color) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: color, width: 1.2),
      ),
      child: Center(
        child: Text(
          label,
          style: TextStyle(color: color, fontSize: 6.5, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildMultipleChoiceIcon() {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFF140C2D),
        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.6), width: 2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFA855F7).withOpacity(0.3),
            blurRadius: 10,
          ),
        ],
      ),
      child: Center(
        child: SizedBox(
          width: 28,
          height: 28,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _circleText('A', const Color(0xFF00F2FE)),
                  const SizedBox(width: 3),
                  _circleText('B', const Color(0xFFEC4899)),
                ],
              ),
              const SizedBox(height: 3),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _circleText('C', const Color(0xFFA855F7)),
                  const SizedBox(width: 3),
                  _circleText('D', const Color(0xFFEAB308)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTrueFalseIcon() {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFF140C2D),
        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.6), width: 2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFA855F7).withOpacity(0.3),
            blurRadius: 10,
          ),
        ],
      ),
      child: const Center(
        child: Icon(Icons.scale_rounded, color: Color(0xFFFACC15), size: 24),
      ),
    );
  }

  Widget _buildIdentificationIcon() {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFF140C2D),
        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.6), width: 2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFA855F7).withOpacity(0.3),
            blurRadius: 10,
          ),
        ],
      ),
      child: const Center(
        child: Icon(Icons.edit_rounded, color: Color(0xFFEC4899), size: 24),
      ),
    );
  }

  Widget _buildModeCard({
    required Widget leadingIcon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isWhiteTitle = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xEA191132), Color(0xEA120C26)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFF9333EA).withOpacity(0.35),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF8B5CF6).withOpacity(0.12),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          splashColor: const Color(0xFFA855F7).withOpacity(0.15),
          highlightColor: const Color(0xFFA855F7).withOpacity(0.08),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                leadingIcon,
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAlignment.start,
                    children: [
                      _buildCardHeader(title, isWhiteTitle: isWhiteTitle),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFFA5A3C4),
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: Color(0xFFA855F7),
                  size: 26,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070414),
      body: SafeArea(
        child: Stack(
          children: [
            // Dark dimmed backdrop feel
            Positioned.fill(
              child: Container(
                color: Colors.black.withOpacity(0.4),
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                width: double.infinity,
                constraints: const BoxConstraints(maxWidth: 520),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF130A2A), Color(0xFF090518)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(28),
                    topRight: Radius.circular(28),
                  ),
                  border: Border(
                    top: BorderSide(color: const Color(0xFFA855F7).withOpacity(0.35), width: 1),
                    left: BorderSide(color: const Color(0xFFA855F7).withOpacity(0.2), width: 1),
                    right: BorderSide(color: const Color(0xFFA855F7).withOpacity(0.2), width: 1),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.8),
                      blurRadius: 40,
                      offset: const Offset(0, -12),
                    ),
                    BoxShadow(
                      color: const Color(0xFFA855F7).withOpacity(0.15),
                      blurRadius: 30,
                    ),
                  ],
                ),
                padding: const EdgeInsets.fromLTRB(22, 16, 22, 28),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAlignment.start,
                    children: [
                      // Drag Handle Capsule
                      Center(
                        child: Container(
                          width: 38,
                          height: 4,
                          decoration: BoxDecoration(
                            color: const Color(0xFF3E3262),
                            borderRadius: BorderRadius.circular(9999),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Header Title
                      _buildGradientText(
                        _showPostTestOptions ? 'Select Question Format' : 'Select Test Type',
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                      ),
                      const SizedBox(height: 4),

                      // Selected Topic Subtitle
                      RichText(
                        text: TextSpan(
                          style: const TextStyle(fontSize: 14, color: Color(0xFF9CA3AF)),
                          children: [
                            TextSpan(text: _showPostTestOptions ? 'Post-Test: ' : 'Selected: '),
                            TextSpan(
                              text: widget.topicTitle,
                              style: const TextStyle(
                                color: Color(0xFF00F2FE),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      if (!_showPostTestOptions) ...[
                        _buildModeCard(
                          leadingIcon: Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withOpacity(0.05),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: const Center(child: Text('⏱️', style: TextStyle(fontSize: 22))),
                          ),
                          title: 'Pre-Test',
                          subtitle: 'Load 15 multiple-choice questions from selected topic',
                          onTap: _startPreTest,
                        ),
                        _buildModeCard(
                          leadingIcon: Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withOpacity(0.05),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: const Center(child: Text('🎯', style: TextStyle(fontSize: 22))),
                          ),
                          title: 'Post-Test',
                          subtitle: 'Choose question format: Multiple Choice, True/False, or Identification',
                          onTap: () {
                            setState(() {
                              _showPostTestOptions = true;
                            });
                          },
                        ),
                      ] else ...[
                        _buildModeCard(
                          leadingIcon: _buildMultipleChoiceIcon(),
                          title: 'Multiple Choice',
                          subtitle: 'Multiple-choice questions with 4 choices',
                          isWhiteTitle: true,
                          onTap: () => _startPostTest('multiple_choice'),
                        ),
                        _buildModeCard(
                          leadingIcon: _buildTrueFalseIcon(),
                          title: 'True or False',
                          subtitle: 'Questions with 2 options (True / False)',
                          isWhiteTitle: true,
                          onTap: () => _startPostTest('true_false'),
                        ),
                        _buildModeCard(
                          leadingIcon: _buildIdentificationIcon(),
                          title: 'Identification',
                          subtitle: 'Questions with small text input box for typing answers',
                          isWhiteTitle: true,
                          onTap: () => _startPostTest('identification'),
                        ),
                      ],

                      const SizedBox(height: 12),

                      // Cancel / Back Pill Button
                      Center(
                        child: SizedBox(
                          width: _showPostTestOptions ? 140 : double.infinity,
                          height: 48,
                          child: OutlinedButton(
                            onPressed: () {
                              if (_showPostTestOptions) {
                                setState(() {
                                  _showPostTestOptions = false;
                                });
                              } else {
                                context.pop();
                              }
                            },
                            style: OutlinedButton.styleFrom(
                              backgroundColor: const Color(0xCC120B28),
                              side: BorderSide(color: const Color(0xFFA855F7).withOpacity(0.4), width: 1.5),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(9999),
                              ),
                            ),
                            child: Text(
                              _showPostTestOptions ? 'Back' : 'Cancel',
                              style: const TextStyle(
                                color: Color(0xFFC084FC),
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
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
