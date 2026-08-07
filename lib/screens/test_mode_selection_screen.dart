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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.topicTitle),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAlignment.stretch,
          children: [
            Text(
              'Selected Topic: ${widget.topicTitle}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Choose Test Type',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 24),
            if (!_showPostTestOptions) ...[
              Card(
                elevation: 3,
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: const CircleAvatar(
                    backgroundColor: Colors.purple,
                    child: Icon(Icons.timer, color: Colors.white),
                  ),
                  title: const Text(
                    'Pre-Test',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  subtitle: const Text('Load 15 multiple-choice questions'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _startPreTest,
                ),
              ),
              const SizedBox(height: 16),
              Card(
                elevation: 3,
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: const CircleAvatar(
                    backgroundColor: Colors.teal,
                    child: Icon(Icons.assessment, color: Colors.white),
                  ),
                  title: const Text(
                    'Post-Test',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  subtitle: const Text('Choose format: Multiple Choice, True/False, or Identification'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    setState(() {
                      _showPostTestOptions = true;
                    });
                  },
                ),
              ),
            ] else ...[
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () {
                      setState(() {
                        _showPostTestOptions = false;
                      });
                    },
                  ),
                  const Text(
                    'Select Post-Test Format',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(18),
                  alignment: Alignment.centerLeft,
                ),
                icon: const Icon(Icons.radio_button_checked),
                label: const Text('1. Multiple Choice', style: TextStyle(fontSize: 16)),
                onPressed: () => _startPostTest('multiple_choice'),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(18),
                  alignment: Alignment.centerLeft,
                ),
                icon: const Icon(Icons.check_circle_outline),
                label: const Text('2. True or False', style: TextStyle(fontSize: 16)),
                onPressed: () => _startPostTest('true_false'),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(18),
                  alignment: Alignment.centerLeft,
                ),
                icon: const Icon(Icons.edit_note),
                label: const Text('3. Identification', style: TextStyle(fontSize: 16)),
                onPressed: () => _startPostTest('identification'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
