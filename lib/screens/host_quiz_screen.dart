import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/topic_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/quiz_provider.dart';
import '../models/term_model.dart';
import '../models/topic_model.dart';
import '../models/question_model.dart';
import '../services/lobby_service.dart';

class HostQuizScreen extends ConsumerStatefulWidget {
  const HostQuizScreen({super.key});

  @override
  ConsumerState<HostQuizScreen> createState() => _HostQuizScreenState();
}

class _HostQuizScreenState extends ConsumerState<HostQuizScreen> {
  // Step 0: Built-in vs Custom selection
  // Step 1: Built-in flow (Term, Topic, Mode, Customize) OR Custom Question Creator
  // Step 2: Lobby (Access Code & Participants)
  // Step 3: Host Live Tracking Dashboard
  int _currentStep = 0;
  bool _isCustomQuestionsMode = false;

  // Built-in flow states
  TermModel? _selectedTerm;
  TopicModel? _selectedTopic;
  String _selectedQuizType = 'pre_test';
  String _selectedQuestionType = 'multiple_choice';

  // Custom question builder states
  String _customAnswerMode = 'multiple_choice';
  final List<QuestionModel> _customQuestions = [];
  int _currentCustomQuestionIndex = 0;

  final TextEditingController _questionTextController = TextEditingController();
  final TextEditingController _choiceAController = TextEditingController();
  final TextEditingController _choiceBController = TextEditingController();
  final TextEditingController _choiceCController = TextEditingController();
  final TextEditingController _choiceDController = TextEditingController();
  final TextEditingController _correctAnswerController = TextEditingController(text: 'A');

  // Pre-game customize settings
  final TextEditingController _timeLimitController = TextEditingController(text: '20');
  final TextEditingController _maxParticipantsController = TextEditingController(text: '50');
  int _questionCount = 10;

  // Created Lobby reference & subscription
  QuizLobby? _activeLobby;
  StreamSubscription<QuizLobby>? _lobbySubscription;

  @override
  void dispose() {
    _lobbySubscription?.cancel();
    _questionTextController.dispose();
    _choiceAController.dispose();
    _choiceBController.dispose();
    _choiceCController.dispose();
    _choiceDController.dispose();
    _correctAnswerController.dispose();
    _timeLimitController.dispose();
    _maxParticipantsController.dispose();
    super.dispose();
  }

  void _saveCurrentCustomQuestion() {
    final qText = _questionTextController.text.trim();
    if (qText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please type the question text!'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    String corr = _correctAnswerController.text.trim();
    String optA = '';
    String optB = '';
    String? optC;
    String? optD;

    if (_customAnswerMode == 'multiple_choice') {
      optA = _choiceAController.text.trim();
      optB = _choiceBController.text.trim();
      optC = _choiceCController.text.trim();
      optD = _choiceDController.text.trim();

      if (optA.isEmpty || optB.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Choice A and Choice B are required for Multiple Choice!'), backgroundColor: Colors.redAccent),
        );
        return;
      }
      if (corr.isEmpty) corr = 'A';
    } else if (_customAnswerMode == 'true_false') {
      optA = 'True';
      optB = 'False';
      if (corr.isEmpty) corr = 'True';
    } else if (_customAnswerMode == 'identification') {
      optA = '';
      optB = '';
      optC = null;
      optD = null;
      if (corr.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please type the counterpart answer phrase for identification!'), backgroundColor: Colors.redAccent),
        );
        return;
      }
    }

    final newQ = QuestionModel(
      id: 'custom_${DateTime.now().millisecondsSinceEpoch}_$_currentCustomQuestionIndex',
      topicId: 'b0000000-0000-0000-0000-000000000001',
      questionTypeId: _customAnswerMode == 'true_false' ? 2 : (_customAnswerMode == 'identification' ? 3 : 1),
      quizType: 'custom',
      question: qText,
      questionType: _customAnswerMode,
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctAnswer: corr,
      difficulty: 'Medium',
      timeLimit: int.tryParse(_timeLimitController.text) ?? 20,
      isActive: true,
    );

    if (_currentCustomQuestionIndex < _customQuestions.length) {
      _customQuestions[_currentCustomQuestionIndex] = newQ;
    } else {
      _customQuestions.add(newQ);
    }
  }

  void _onNextOrSetCustomQuestion() {
    _saveCurrentCustomQuestion();

    if (_currentCustomQuestionIndex + 1 < _questionCount) {
      setState(() {
        _currentCustomQuestionIndex++;
        _clearQuestionFields();
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Successfully created $_questionCount custom questions!')),
      );
    }
  }

  void _clearQuestionFields() {
    _questionTextController.clear();
    _choiceAController.clear();
    _choiceBController.clear();
    _choiceCController.clear();
    _choiceDController.clear();
    _correctAnswerController.text = _customAnswerMode == 'multiple_choice' ? 'A' : (_customAnswerMode == 'true_false' ? 'True' : '');
  }

  void _onStartLobbyCreation() async {
    final timeVal = int.tryParse(_timeLimitController.text.trim());
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

    final maxPartVal = int.tryParse(_maxParticipantsController.text.trim()) ?? 100;

    List<QuestionModel> questionsToHost = [];

    if (_isCustomQuestionsMode) {
      if (_customQuestions.isEmpty) {
        _saveCurrentCustomQuestion();
      }
      questionsToHost = List.from(_customQuestions);

      // Persist created teacher questions asynchronously to question repo
      final qRepo = ref.read(questionRepositoryProvider);
      for (final q in questionsToHost) {
        try {
          await qRepo.addQuestion(q);
        } catch (_) {}
      }
    } else {
      // Fetch built-in questions
      final qRepo = ref.read(questionRepositoryProvider);
      final rawPrepared = await qRepo.getPreparedQuestionsForQuiz(
        _selectedTopic?.id ?? '',
        questionType: _selectedQuestionType,
        quizType: _selectedQuizType,
        topicTitle: _selectedTopic?.title ?? '',
      );

      questionsToHost = rawPrepared.map((pq) => pq.question).toList();

      if (questionsToHost.length > _questionCount) {
        questionsToHost = questionsToHost.sublist(0, _questionCount);
      }
    }

    if (questionsToHost.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No questions available to start host lobby!'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    final authState = ref.read(authProvider);
    final hostName = authState.profile?.name ?? 'Host Teacher';
    final hostPhoto = authState.profile?.photoUrl;

    final lobby = await LobbyService.instance.createLobby(
      hostName: hostName,
      hostPhotoUrl: hostPhoto,
      quizTitle: _isCustomQuestionsMode ? 'Custom Host Quiz' : (_selectedTopic?.title ?? 'Built-in Quiz'),
      questions: questionsToHost,
      timeLimitPerQuestion: timeVal,
      maxParticipants: maxPartVal,
    );

    setState(() {
      _activeLobby = lobby;
      _currentStep = 2; // Lobby screen
    });

    _lobbySubscription = LobbyService.instance.lobbyStream.listen((updatedLobby) {
      if (updatedLobby.accessCode == lobby.accessCode && mounted) {
        setState(() {
          _activeLobby = updatedLobby;
        });
      }
    });
  }

  void _onStartQuizFromHost() {
    if (_activeLobby == null) return;
    LobbyService.instance.startQuiz(_activeLobby!.accessCode);
    setState(() {
      _currentStep = 3; // Live Host Dashboard
    });
  }

  void _showParticipantProfileModal(LobbyParticipant participant) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            CircleAvatar(
              backgroundImage: participant.photoUrl != null ? NetworkImage(participant.photoUrl!) : null,
              child: participant.photoUrl == null ? Text(participant.name.characters.first) : null,
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(participant.name, style: const TextStyle(fontWeight: FontWeight.bold))),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAlignment.start,
          children: [
            Text('Grade & Section: ${participant.gradeLevel} - ${participant.section}'),
            const SizedBox(height: 8),
            Text('Current Score: ${participant.score} pts'),
            Text('Questions Completed: ${participant.currentQuestionIndex} / ${participant.totalQuestions}'),
            Text('Status: ${participant.isFinished ? "Completed" : "In Progress"}'),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Host Quiz Mode'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: _buildStepView(),
      ),
    );
  }

  Widget _buildStepView() {
    switch (_currentStep) {
      case 0:
        return _buildHostTypeSelectionStep();
      case 1:
        return _isCustomQuestionsMode ? _buildCustomQuestionsCreatorStep() : _buildBuiltInFlowStep();
      case 2:
        return _buildLobbyWaitingStep();
      case 3:
        return _buildHostLiveTrackingDashboard();
      default:
        return Container();
    }
  }

  // Step 0: Choose Built-in vs Custom Questions
  Widget _buildHostTypeSelectionStep() {
    return Column(
      crossAlignment: CrossAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.hub, size: 70, color: Color(0xFF673AB7)),
        const SizedBox(height: 12),
        const Text(
          'Host Quiz Setup',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
        ),
        const SizedBox(height: 8),
        const Text(
          'Choose how you want to create your host quiz',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey),
        ),
        const SizedBox(height: 40),

        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(20),
            backgroundColor: const Color(0xFF673AB7),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          icon: const Icon(Icons.edit_note, size: 28),
          label: const Text('Custom Questions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          onPressed: () {
            setState(() {
              _isCustomQuestionsMode = true;
              _currentStep = 1;
            });
          },
        ),
        const SizedBox(height: 16),

        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(20),
            backgroundColor: Colors.teal.shade700,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          icon: const Icon(Icons.quiz, size: 28),
          label: const Text('Built-in Questions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          onPressed: () {
            setState(() {
              _isCustomQuestionsMode = false;
              _currentStep = 1;
            });
          },
        ),
      ],
    );
  }

  // Step 1A: Built-in questions flow wizard
  Widget _buildBuiltInFlowStep() {
    final termsAsync = ref.watch(termsProvider);

    return termsAsync.when(
      data: (terms) {
        if (_selectedTerm == null && terms.isNotEmpty) {
          _selectedTerm = terms.first;
        }
        if (_selectedTopic == null && _selectedTerm != null && _selectedTerm!.topics.isNotEmpty) {
          _selectedTopic = _selectedTerm!.topics.first;
        }

        return SingleChildScrollView(
          child: Column(
            crossAlignment: CrossAlignment.stretch,
            children: [
              const Text('Built-in Host Quiz Setup', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95))),
              const SizedBox(height: 16),

              // Term Dropdown
              DropdownButtonFormField<TermModel>(
                value: _selectedTerm,
                decoration: const InputDecoration(labelText: 'Select Term', border: OutlineInputBorder()),
                items: terms.take(3).map((t) => DropdownMenuItem(value: t, child: Text(t.name.isNotEmpty ? t.name : 'Term ${t.orderNo}'))).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedTerm = val;
                    if (val != null && val.topics.isNotEmpty) {
                      _selectedTopic = val.topics.first;
                    }
                  });
                },
              ),
              const SizedBox(height: 16),

              // Topic Dropdown
              DropdownButtonFormField<TopicModel>(
                value: _selectedTopic,
                decoration: const InputDecoration(labelText: 'Select Topic', border: OutlineInputBorder()),
                items: (_selectedTerm?.topics ?? []).map((tp) => DropdownMenuItem(value: tp, child: Text(tp.title))).toList(),
                onChanged: (val) => setState(() => _selectedTopic = val),
              ),
              const SizedBox(height: 16),

              // Test Type & Sub-mode
              const Text('Test Type & Format', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'pre_test', label: Text('Pre-Test')),
                  ButtonSegment(value: 'post_test', label: Text('Post-Test')),
                ],
                selected: {_selectedQuizType},
                onSelectionChanged: (set) => setState(() => _selectedQuizType = set.first),
              ),
              const SizedBox(height: 12),

              if (_selectedQuizType == 'post_test') ...[
                DropdownButtonFormField<String>(
                  value: _selectedQuestionType,
                  decoration: const InputDecoration(labelText: 'Post-Test Question Type', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'multiple_choice', child: Text('Multiple Choice')),
                    DropdownMenuItem(value: 'true_false', child: Text('True or False')),
                    DropdownMenuItem(value: 'identification', child: Text('Identification')),
                  ],
                  onChanged: (val) => setState(() => _selectedQuestionType = val!),
                ),
                const SizedBox(height: 16),
              ],

              // Settings Card
              _buildHostSettingsCard(),
              const SizedBox(height: 24),

              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  backgroundColor: const Color(0xFF673AB7),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.rocket_launch),
                label: const Text('Create Host Lobby', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                onPressed: _onStartLobbyCreation,
              ),
            ],
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(child: Text('Error loading options: $err')),
    );
  }

  // Step 1B: Custom Questions Creator
  Widget _buildCustomQuestionsCreatorStep() {
    final bool isLastQuestion = _currentCustomQuestionIndex + 1 == _questionCount;

    return SingleChildScrollView(
      child: Column(
        crossAlignment: CrossAlignment.stretch,
        children: [
          Text(
            'Question ${_currentCustomQuestionIndex + 1} of $_questionCount',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
          ),
          const SizedBox(height: 12),

          DropdownButtonFormField<String>(
            value: _customAnswerMode,
            decoration: const InputDecoration(labelText: 'Answer Mode', border: OutlineInputBorder()),
            items: const [
              DropdownMenuItem(value: 'multiple_choice', child: Text('Multiple Choice')),
              DropdownMenuItem(value: 'true_false', child: Text('True or False')),
              DropdownMenuItem(value: 'identification', child: Text('Identification')),
            ],
            onChanged: (val) {
              setState(() {
                _customAnswerMode = val!;
                _correctAnswerController.text = val == 'multiple_choice' ? 'A' : (val == 'true_false' ? 'True' : '');
              });
            },
          ),
          const SizedBox(height: 16),

          TextField(
            controller: _questionTextController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Question Text',
              border: OutlineInputBorder(),
              hintText: 'Type your custom question here...',
            ),
          ),
          const SizedBox(height: 16),

          if (_customAnswerMode == 'multiple_choice') ...[
            TextField(controller: _choiceAController, decoration: const InputDecoration(labelText: 'Choice A', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: _choiceBController, decoration: const InputDecoration(labelText: 'Choice B', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: _choiceCController, decoration: const InputDecoration(labelText: 'Choice C', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: _choiceDController, decoration: const InputDecoration(labelText: 'Choice D', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _correctAnswerController.text.isNotEmpty ? _correctAnswerController.text : 'A',
              decoration: const InputDecoration(labelText: 'Correct Answer Choice', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'A', child: Text('Choice A')),
                DropdownMenuItem(value: 'B', child: Text('Choice B')),
                DropdownMenuItem(value: 'C', child: Text('Choice C')),
                DropdownMenuItem(value: 'D', child: Text('Choice D')),
              ],
              onChanged: (val) => setState(() => _correctAnswerController.text = val!),
            ),
          ] else if (_customAnswerMode == 'true_false') ...[
            DropdownButtonFormField<String>(
              value: _correctAnswerController.text.isNotEmpty ? _correctAnswerController.text : 'True',
              decoration: const InputDecoration(labelText: 'Correct Answer', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'True', child: Text('True')),
                DropdownMenuItem(value: 'False', child: Text('False')),
              ],
              onChanged: (val) => setState(() => _correctAnswerController.text = val!),
            ),
          ] else ...[
            TextField(
              controller: _correctAnswerController,
              decoration: const InputDecoration(
                labelText: 'Correct Answer Word / Phrase',
                border: OutlineInputBorder(),
              ),
            ),
          ],

          const SizedBox(height: 20),
          _buildHostSettingsCard(),
          const SizedBox(height: 24),

          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                  backgroundColor: const Color(0xFF673AB7),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: Icon(isLastQuestion ? Icons.check_circle : Icons.arrow_forward),
                label: Text(isLastQuestion ? 'Set & Lock Set' : 'Next Question', style: const TextStyle(fontWeight: FontWeight.bold)),
                onPressed: () {
                  _onNextOrSetCustomQuestion();
                  if (isLastQuestion) {
                    _onStartLobbyCreation();
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHostSettingsCard() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAlignment.start,
          children: [
            const Text('⏱️ Time Limit (5–60s)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _timeLimitController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'Default 20s'),
            ),
            const SizedBox(height: 12),

            const Text('❓ Number of Questions (1–30)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Row(
              children: [
                IconButton.filledTonal(
                  onPressed: _questionCount > 1 ? () => setState(() => _questionCount--) : null,
                  icon: const Icon(Icons.remove),
                ),
                const SizedBox(width: 16),
                Text('$_questionCount', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(width: 16),
                IconButton.filledTonal(
                  onPressed: _questionCount < 30 ? () => setState(() => _questionCount++) : null,
                  icon: const Icon(Icons.add),
                ),
              ],
            ),
            const SizedBox(height: 12),

            const Text('👥 Max Participants (No Cap)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _maxParticipantsController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'Enter max participants'),
            ),
          ],
        ),
      ),
    );
  }

  // Step 2: Lobby waiting screen with 7-digit code & participant list
  Widget _buildLobbyWaitingStep() {
    final lobby = _activeLobby;
    if (lobby == null) return Container();

    return Column(
      crossAlignment: CrossAlignment.stretch,
      children: [
        Card(
          color: const Color(0xFF673AB7),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                const Text('HOST QUIZ LOBBY', style: TextStyle(color: Colors.white70, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(
                  lobby.accessCode,
                  style: const TextStyle(fontSize: 42, fontWeight: FontWeight.black, color: Colors.amberAccent, letterSpacing: 4),
                ),
                const SizedBox(height: 8),
                const Text('Share this 7-digit code with students to join!', style: TextStyle(color: Colors.white90, fontSize: 13)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Joined Participants (${lobby.participants.length})', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const Text('No bots enabled', style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        const SizedBox(height: 12),

        Expanded(
          child: lobby.participants.isEmpty
              ? const Center(child: Text('Waiting for real participants to enter code and join...'))
              : ListView.builder(
                  itemCount: lobby.participants.length,
                  itemBuilder: (context, index) {
                    final p = lobby.participants[index];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundImage: p.photoUrl != null ? NetworkImage(p.photoUrl!) : null,
                          child: p.photoUrl == null ? Text(p.name.characters.first) : null,
                        ),
                        title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('${p.gradeLevel} • ${p.section}'),
                        trailing: TextButton(
                          onPressed: () => _showParticipantProfileModal(p),
                          child: const Text('View Profile'),
                        ),
                      ),
                    );
                  },
                ),
        ),

        const SizedBox(height: 16),
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 18),
            backgroundColor: Colors.green.shade600,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          icon: const Icon(Icons.play_arrow, size: 28),
          label: const Text('Start Quiz Now', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          onPressed: lobby.participants.isNotEmpty ? _onStartQuizFromHost : null,
        ),
      ],
    );
  }

  // Step 3: Host Live Tracking Dashboard (Host tracks only)
  Widget _buildHostLiveTrackingDashboard() {
    final lobby = _activeLobby;
    if (lobby == null) return Container();

    final sortedParticipants = List<LobbyParticipant>.from(lobby.participants)
      ..sort((a, b) => b.score.compareTo(a.score));

    return Column(
      crossAlignment: CrossAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Live Host Dashboard', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95))),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: Colors.red.shade100, borderRadius: BorderRadius.circular(20)),
              child: Row(
                children: [
                  Icon(Icons.circle, color: Colors.red.shade700, size: 10),
                  const SizedBox(width: 6),
                  Text('LIVE TRACKING ONLY', style: TextStyle(color: Colors.red.shade900, fontWeight: FontWeight.bold, fontSize: 11)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        Expanded(
          child: ListView.builder(
            itemCount: sortedParticipants.length,
            itemBuilder: (context, idx) {
              final p = sortedParticipants[idx];
              final rank = idx + 1;

              return Card(
                elevation: 3,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: rank == 1 ? Colors.amber : (rank == 2 ? Colors.grey.shade400 : (rank == 3 ? Colors.brown.shade300 : Colors.purple.shade100)),
                        child: Text('#$rank', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                      ),
                      const SizedBox(width: 14),

                      Expanded(
                        child: Column(
                          crossAlignment: CrossAlignment.start,
                          children: [
                            Text(p.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text('Question ${p.currentQuestionIndex + 1} / ${p.totalQuestions}'),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text('✔️ ${p.correctCount}  ', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                                Text('❌ ${p.wrongCount}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ],
                        ),
                      ),

                      Column(
                        crossAlignment: CrossAlignment.end,
                        children: [
                          Text('${p.score} pts', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.black, color: Color(0xFF673AB7))),
                          const SizedBox(height: 4),
                          Text(p.isFinished ? 'Finished ✅' : 'In Progress ⏳', style: TextStyle(fontSize: 12, color: p.isFinished ? Colors.green : Colors.orange)),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        if (lobby.isFinished) ...[
          const SizedBox(height: 12),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.all(18),
              backgroundColor: Colors.amber.shade700,
              foregroundColor: Colors.white,
            ),
            icon: const Icon(Icons.emoji_events, size: 28),
            label: const Text('Final Leaderboard Complete!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            onPressed: () => context.pop(),
          ),
        ],
      ],
    );
  }
}
