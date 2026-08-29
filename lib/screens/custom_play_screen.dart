import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/topic_provider.dart';
import '../models/term_model.dart';
import '../models/topic_model.dart';

class CustomPlayScreen extends ConsumerStatefulWidget {
  const CustomPlayScreen({super.key});

  @override
  ConsumerState<CustomPlayScreen> createState() => _CustomPlayScreenState();
}

class _CustomPlayScreenState extends ConsumerState<CustomPlayScreen> {
  int _currentStep = 0; // 0: Term, 1: Topic, 2: Test Mode, 3: Pre-Game Customize

  TermModel? _selectedTerm;
  TopicModel? _selectedTopic;
  String _selectedQuizType = 'pre_test'; // 'pre_test' or 'post_test'
  String _selectedQuestionType = 'multiple_choice'; // 'multiple_choice', 'true_false', 'identification'

  final TextEditingController _timeLimitController = TextEditingController(text: '20');
  int _questionCount = 15;

  @override
  void initState() {
    super.initState();
    _loadSavedSettings();
  }

  Future<void> _loadSavedSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final savedTime = prefs.getInt('custom_time_limit') ?? 20;
    final savedCount = prefs.getInt('custom_question_count') ?? 15;
    setState(() {
      _timeLimitController.text = savedTime.toString();
      _questionCount = savedCount;
    });
  }

  Future<void> _saveCustomSettings(int timeLimit, int questionCount) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('custom_time_limit', timeLimit);
    await prefs.setInt('custom_question_count', questionCount);
  }

  void _onStartGame() async {
    final timeText = _timeLimitController.text.trim();
    final timeVal = int.tryParse(timeText);

    if (timeVal == null || timeVal < 5 || timeVal > 60) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(timeVal != null && timeVal < 5
              ? 'Undertime Error: Minimum time limit is 5 seconds!'
              : 'Overtime Error: Maximum time limit is 60 seconds!'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (_questionCount < 1 || _questionCount > 30) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Question count must be between 1 and 30 questions!'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    await _saveCustomSettings(timeVal, _questionCount);

    if (!mounted) return;

    context.push('/student/quiz', extra: {
      'topicId': _selectedTopic?.id ?? '',
      'topicTitle': _selectedTopic?.title ?? 'Custom Play',
      'quizType': _selectedQuizType,
      'questionType': _selectedQuestionType,
      'customTimeLimit': timeVal,
      'customQuestionCount': _questionCount,
    });
  }

  @override
  void dispose() {
    _timeLimitController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final termsAsync = ref.watch(termsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Custom Play Mode'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_currentStep > 0) {
              setState(() {
                _currentStep--;
              });
            } else {
              context.pop();
            }
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: termsAsync.when(
          data: (terms) => _buildStepContent(terms),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) => Center(child: Text('Error loading options: $err')),
        ),
      ),
    );
  }

  Widget _buildStepContent(List<TermModel> terms) {
    switch (_currentStep) {
      case 0:
        return _buildTermSelectionStep(terms);
      case 1:
        return _buildTopicSelectionStep();
      case 2:
        return _buildTestModeSelectionStep();
      case 3:
        return _buildPreGameCustomizeStep();
      default:
        return Container();
    }
  }

  Widget _buildTermSelectionStep(List<TermModel> terms) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Step 1: Select Term',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
        ),
        const SizedBox(height: 8),
        const Text(
          'Choose the academic term for your custom quiz',
          style: TextStyle(fontSize: 14, color: Colors.grey),
        ),
        const SizedBox(height: 24),
        Expanded(
          child: ListView.builder(
            itemCount: terms.length,
            itemBuilder: (context, index) {
              final term = terms[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                color: const Color(0xFF673AB7),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  title: Text(
                    term.title.isNotEmpty ? term.title : 'Term ${index + 1}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  subtitle: Text(
                    '${term.topics.length} Available Topics',
                    style: const TextStyle(color: Colors.white70),
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, color: Colors.white),
                  onTap: () {
                    setState(() {
                      _selectedTerm = term;
                      _currentStep = 1;
                    });
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTopicSelectionStep() {
    final topics = _selectedTerm?.topics ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Step 2: Select Topic (${_selectedTerm?.title ?? 'Term'})',
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
        ),
        const SizedBox(height: 8),
        const Text(
          'Choose a topic from the selected term',
          style: TextStyle(fontSize: 14, color: Colors.grey),
        ),
        const SizedBox(height: 20),
        Expanded(
          child: topics.isEmpty
              ? const Center(child: Text('No topics available in this term.'))
              : ListView.builder(
                  itemCount: topics.length,
                  itemBuilder: (context, index) {
                    final topic = topics[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        leading: CircleAvatar(
                          backgroundColor: Colors.purple.shade100,
                          child: Text('${index + 1}', style: TextStyle(color: Colors.purple.shade900, fontWeight: FontWeight.bold)),
                        ),
                        title: Text(
                          topic.title,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          setState(() {
                            _selectedTopic = topic;
                            _currentStep = 2;
                          });
                        },
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildTestModeSelectionStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Topic: ${_selectedTopic?.title ?? ""}',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
        ),
        const SizedBox(height: 4),
        const Text('Choose Test Type & Answer Mode', style: TextStyle(fontSize: 14, color: Colors.grey)),
        const SizedBox(height: 24),

        // Pre-Test Option
        Card(
          elevation: 3,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: const CircleAvatar(
              backgroundColor: Colors.purple,
              child: Icon(Icons.timer, color: Colors.white),
            ),
            title: const Text('Pre-Test', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            subtitle: const Text('Load multiple-choice pre-test questions'),
            onTap: () {
              setState(() {
                _selectedQuizType = 'pre_test';
                _selectedQuestionType = 'multiple_choice';
                _currentStep = 3;
              });
            },
          ),
        ),
        const SizedBox(height: 20),

        // Post-Test Header
        const Text(
          'Post-Test Formats',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),

        // Sub-mode 1: Multiple Choice
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(16),
            alignment: Alignment.centerLeft,
            backgroundColor: Colors.indigo.shade600,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          icon: const Icon(Icons.radio_button_checked),
          label: const Text('1. Multiple Choice', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          onPressed: () {
            setState(() {
              _selectedQuizType = 'post_test';
              _selectedQuestionType = 'multiple_choice';
              _currentStep = 3;
            });
          },
        ),
        const SizedBox(height: 12),

        // Sub-mode 2: True or False
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(16),
            alignment: Alignment.centerLeft,
            backgroundColor: Colors.teal.shade600,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          icon: const Icon(Icons.check_circle_outline),
          label: const Text('2. True or False', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          onPressed: () {
            setState(() {
              _selectedQuizType = 'post_test';
              _selectedQuestionType = 'true_false';
              _currentStep = 3;
            });
          },
        ),
        const SizedBox(height: 12),

        // Sub-mode 3: Identification
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(16),
            alignment: Alignment.centerLeft,
            backgroundColor: Colors.deepOrange.shade600,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          icon: const Icon(Icons.edit_note),
          label: const Text('3. Identification', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          onPressed: () {
            setState(() {
              _selectedQuizType = 'post_test';
              _selectedQuestionType = 'identification';
              _currentStep = 3;
            });
          },
        ),
      ],
    );
  }

  Widget _buildPreGameCustomizeStep() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Custom Play – Pre-Game Customize',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
          ),
          const SizedBox(height: 4),
          Text(
            'Topic: ${_selectedTopic?.title} (${_selectedQuizType == 'pre_test' ? 'Pre-Test' : 'Post-Test'})',
            style: const TextStyle(fontSize: 14, color: Colors.grey),
          ),
          const SizedBox(height: 24),

          // 1. Time Limit Input
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.timer, color: Color(0xFF673AB7)),
                      SizedBox(width: 8),
                      Text(
                        '⏱️ Set Time Limit (Seconds)',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Default: 20 seconds; Allowed range: 5–60 seconds',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _timeLimitController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      hintText: 'Enter seconds (5 - 60)',
                      suffixText: 'sec',
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // 2. Question Count Input
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.format_list_numbered, color: Color(0xFF673AB7)),
                      SizedBox(width: 8),
                      Text(
                        '❓ Set Number of Questions',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Allowed range: 1–30 questions',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton.filledTonal(
                        onPressed: _questionCount > 1
                            ? () => setState(() => _questionCount--)
                            : null,
                        icon: const Icon(Icons.remove),
                      ),
                      const SizedBox(width: 20),
                      Text(
                        '$_questionCount',
                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF673AB7)),
                      ),
                      const SizedBox(width: 20),
                      IconButton.filledTonal(
                        onPressed: _questionCount < 30
                            ? () => setState(() => _questionCount++)
                            : null,
                        icon: const Icon(Icons.add),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 36),

          // Bottom Start Button
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 18),
              backgroundColor: const Color(0xFF673AB7),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 4,
            ),
            icon: const Icon(Icons.play_arrow, size: 28),
            label: const Text(
              'Start Custom Play',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            onPressed: _onStartGame,
          ),
        ],
      ),
    );
  }
}
