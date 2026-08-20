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

  Widget _buildCardHeader(String text) {
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

  Widget _buildModeCard({
    required Widget leadingIcon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
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
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.05),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFA855F7).withOpacity(0.2),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: Center(child: leadingIcon),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAlignment.start,
                    children: [
                      _buildCardHeader(title),
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
                            const TextSpan(text: 'Selected: '),
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
                          leadingIcon: const Text('⏱️', style: TextStyle(fontSize: 22)),
                          title: 'Pre-Test',
                          subtitle: 'Load 15 multiple-choice questions from selected topic',
                          onTap: _startPreTest,
                        ),
                        _buildModeCard(
                          leadingIcon: const Text('🎯', style: TextStyle(fontSize: 22)),
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
                          leadingIcon: const Text('🔘', style: TextStyle(fontSize: 22)),
                          title: 'Multiple Choice',
                          subtitle: 'Multiple-choice questions with 4 choices',
                          onTap: () => _startPostTest('multiple_choice'),
                        ),
                        _buildModeCard(
                          leadingIcon: const Text('⚖️', style: TextStyle(fontSize: 22)),
                          title: 'True or False',
                          subtitle: 'Questions with 2 options (True / False)',
                          onTap: () => _startPostTest('true_false'),
                        ),
                        _buildModeCard(
                          leadingIcon: const Text('✍️', style: TextStyle(fontSize: 22)),
                          title: 'Identification',
                          subtitle: 'Questions with small text input box for typing answers',
                          onTap: () => _startPostTest('identification'),
                        ),
                      ],

                      const SizedBox(height: 8),

                      // Cancel / Back Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
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
                            backgroundColor: Colors.white.withOpacity(0.05),
                            side: BorderSide(color: Colors.white.withOpacity(0.1), width: 1.5),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: Text(
                            _showPostTestOptions ? 'Back' : 'Cancel',
                            style: const TextStyle(
                              color: Color(0xFFF1F5F9),
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
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
