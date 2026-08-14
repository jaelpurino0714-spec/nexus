import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/profile_model.dart';
import '../services/character_service.dart';
import '../services/profile_service.dart';
import 'auth_provider.dart';

class GrowthTaskProgress {
  final GrowthTaskConfig config;
  final int currentCount;
  final bool isCompleted;

  GrowthTaskProgress({
    required this.config,
    this.currentCount = 0,
    this.isCompleted = false,
  });

  GrowthTaskProgress copyWith({
    int? currentCount,
    bool? isCompleted,
  }) {
    return GrowthTaskProgress(
      config: config,
      currentCount: currentCount ?? this.currentCount,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}

class CharacterState {
  final ProfileModel? profile;
  final EvolutionStageConfig stageConfig;
  final String mood;
  final String speechMessage;
  final bool showSpeechBubble;
  final bool isTapCooldown;
  final bool pendingGenderSelection;
  final EvolutionStageConfig? pendingEvolution;
  final int lastXpGained;

  // New Floating Companion & Customization state
  final String characterName;
  final String characterOutfit;
  final String floatingSpeechMessage;
  final bool showFloatingSpeech;
  final bool isFloatingVisible;
  final double? floatingDx;
  final double? floatingDy;
  final List<GrowthTaskProgress> tasks;

  CharacterState({
    required this.profile,
    required this.stageConfig,
    this.mood = 'idle',
    this.speechMessage = "Let's learn together!",
    this.showSpeechBubble = false,
    this.isTapCooldown = false,
    this.pendingGenderSelection = false,
    this.pendingEvolution,
    this.lastXpGained = 0,
    this.characterName = 'Nexus Buddy',
    this.characterOutfit = 'default',
    this.floatingSpeechMessage = 'Ready?',
    this.showFloatingSpeech = false,
    this.isFloatingVisible = true,
    this.floatingDx,
    this.floatingDy,
    this.tasks = const [],
  });

  CharacterState copyWith({
    ProfileModel? profile,
    EvolutionStageConfig? stageConfig,
    String? mood,
    String? speechMessage,
    bool? showSpeechBubble,
    bool? isTapCooldown,
    bool? pendingGenderSelection,
    EvolutionStageConfig? pendingEvolution,
    bool clearPendingEvolution = false,
    int? lastXpGained,
    String? characterName,
    String? characterOutfit,
    String? floatingSpeechMessage,
    bool? showFloatingSpeech,
    bool? isFloatingVisible,
    double? floatingDx,
    double? floatingDy,
    List<GrowthTaskProgress>? tasks,
  }) {
    return CharacterState(
      profile: profile ?? this.profile,
      stageConfig: stageConfig ?? this.stageConfig,
      mood: mood ?? this.mood,
      speechMessage: speechMessage ?? this.speechMessage,
      showSpeechBubble: showSpeechBubble ?? this.showSpeechBubble,
      isTapCooldown: isTapCooldown ?? this.isTapCooldown,
      pendingGenderSelection: pendingGenderSelection ?? this.pendingGenderSelection,
      pendingEvolution: clearPendingEvolution ? null : (pendingEvolution ?? this.pendingEvolution),
      lastXpGained: lastXpGained ?? this.lastXpGained,
      characterName: characterName ?? this.characterName,
      characterOutfit: characterOutfit ?? this.characterOutfit,
      floatingSpeechMessage: floatingSpeechMessage ?? this.floatingSpeechMessage,
      showFloatingSpeech: showFloatingSpeech ?? this.showFloatingSpeech,
      isFloatingVisible: isFloatingVisible ?? this.isFloatingVisible,
      floatingDx: floatingDx ?? this.floatingDx,
      floatingDy: floatingDy ?? this.floatingDy,
      tasks: tasks ?? this.tasks,
    );
  }
}


class CharacterNotifier extends StateNotifier<CharacterState> {
  final ProfileService _profileService;
  final Ref _ref;
  Timer? _speechTimer;
  Timer? _floatingSpeechTimer;
  Timer? _cooldownTimer;

  CharacterNotifier(this._profileService, this._ref)
      : super(CharacterState(
          profile: null,
          stageConfig: CharacterService.instance.getStageForXP(0),
          tasks: CharacterService.defaultGrowthTasks
              .map((t) => GrowthTaskProgress(config: t))
              .toList(),
        )) {
    _init();
  }

  void _init() {
    final authState = _ref.read(authProvider);
    if (authState.profile != null) {
      setProfile(authState.profile!);
    }
  }

  void setProfile(ProfileModel profile) {
    final stageConfig = CharacterService.instance.getStageForXP(profile.characterXp);
    final evaluatedMood = CharacterService.instance.evaluateMood(
      lastActivityDateStr: profile.lastActivityDate,
      currentStreak: profile.currentStreak,
    );

    bool needGenderChoice = (profile.characterGender == null || profile.characterGender!.isEmpty);

    final name = (profile.characterName != null && profile.characterName!.isNotEmpty)
        ? profile.characterName!
        : '${profile.name}\'s Buddy';

    state = state.copyWith(
      profile: profile,
      stageConfig: stageConfig,
      mood: evaluatedMood,
      speechMessage: evaluatedMood == 'sleepy'
          ? "Yawn... Let me wake up for our next quiz! ☀️"
          : (evaluatedMood == 'encouraging'
              ? "Let's start a new streak together! 💪"
              : stageConfig.defaultQuote),
      pendingGenderSelection: needGenderChoice,
      characterName: name,
      characterOutfit: profile.characterOutfit ?? 'default',
    );
  }

  /// Updates saved floating companion position on screen (dx, dy)
  void updateFloatingPosition(double dx, double dy) {
    state = state.copyWith(
      floatingDx: dx,
      floatingDy: dy,
    );
  }

  /// Triggers a brief contextual speech bubble on the compact floating companion
  void triggerFloatingReaction(String trigger) {

    final msg = CharacterService.instance.getFloatingReaction(trigger);
    state = state.copyWith(
      floatingSpeechMessage: msg,
      showFloatingSpeech: true,
    );

    _floatingSpeechTimer?.cancel();
    _floatingSpeechTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) {
        state = state.copyWith(showFloatingSpeech: false);
      }
    });
  }

  /// Interacts with character (tapped by student)
  void interactWithCharacter() {
    if (state.isTapCooldown) return;

    final tapMessage = CharacterService.instance.getRandomTapMessage();

    state = state.copyWith(
      speechMessage: tapMessage,
      showSpeechBubble: true,
      isTapCooldown: true,
      mood: state.mood == 'sleepy' ? 'happy' : state.mood,
    );

    _speechTimer?.cancel();
    _speechTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) {
        state = state.copyWith(showSpeechBubble: false);
      }
    });

    _cooldownTimer?.cancel();
    _cooldownTimer = Timer(const Duration(milliseconds: 600), () {
      if (mounted) {
        state = state.copyWith(isTapCooldown: false);
      }
    });
  }

  /// Updates character name
  Future<void> updateCharacterName(String newName) async {
    if (state.profile == null || newName.trim().isEmpty) return;
    final updatedProfile = state.profile!.copyWith(characterName: newName.trim());
    state = state.copyWith(profile: updatedProfile, characterName: newName.trim());
    _ref.read(authProvider.notifier).setProfile(updatedProfile);
    await _profileService.updateCharacterData(updatedProfile);
  }

  /// Updates character outfit style
  Future<void> selectOutfit(String outfitId) async {
    if (state.profile == null) return;
    final updatedProfile = state.profile!.copyWith(characterOutfit: outfitId);
    state = state.copyWith(profile: updatedProfile, characterOutfit: outfitId);
    _ref.read(authProvider.notifier).setProfile(updatedProfile);
    await _profileService.updateCharacterData(updatedProfile);
  }

  /// Saves selected gender choice (male / female)
  Future<void> setGender(String gender) async {
    if (state.profile == null) return;

    final updatedProfile = state.profile!.copyWith(
      characterGender: gender,
    );

    state = state.copyWith(
      profile: updatedProfile,
      pendingGenderSelection: false,
    );

    _ref.read(authProvider.notifier).setProfile(updatedProfile);
    await _profileService.updateCharacterData(updatedProfile);
  }

  /// Records meaningful learning activity (completing a quiz)
  Future<void> recordLearningActivity({
    required double percentageScore,
    required int correctAnswers,
    required int totalQuestions,
  }) async {
    if (state.profile == null) return;

    final oldProfile = state.profile!;
    final oldStage = CharacterService.instance.getStageForXP(oldProfile.characterXp);

    // 1. Calculate XP Gained: +10 XP per correct answer + bonus for score
    int xpGained = (correctAnswers * 10);
    if (percentageScore >= 100) {
      xpGained += 30;
    } else if (percentageScore >= 75) {
      xpGained += 15;
    }

    final newXP = oldProfile.characterXp + xpGained;
    final newStage = CharacterService.instance.getStageForXP(newXP);

    // 2. Calculate Calendar Date Streak
    final streakResult = CharacterService.instance.calculateStreakOnActivity(
      currentStreak: oldProfile.currentStreak,
      longestStreak: oldProfile.longestStreak,
      lastActivityDateStr: oldProfile.lastActivityDate,
    );

    final int newStreak = streakResult['currentStreak'];
    final int newLongest = streakResult['longestStreak'];
    final String newLastDate = streakResult['lastActivityDate'];
    final bool streakIncreased = streakResult['streakIncreased'];

    // 3. Update Tasks
    final updatedTasks = state.tasks.map((t) {
      if (t.config.id == 'task_complete_quiz') {
        return t.copyWith(currentCount: 1, isCompleted: true);
      } else if (t.config.id == 'task_answer_correct') {
        final newCount = t.currentCount + correctAnswers;
        return t.copyWith(
          currentCount: newCount,
          isCompleted: newCount >= t.config.targetCount,
        );
      } else if (t.config.id == 'task_maintain_streak' && newStreak > 1) {
        return t.copyWith(currentCount: 1, isCompleted: true);
      }
      return t;
    }).toList();

    // 4. Determine New Mood & Speech Reaction
    String newMood = 'happy';
    String speechMsg = CharacterService.instance.getEventSpeechMessage('quiz_complete');

    if (newStage.stage > oldStage.stage) {
      newMood = 'excited';
      speechMsg = CharacterService.instance.getEventSpeechMessage('evolution');
    } else if (streakIncreased) {
      newMood = 'excited';
      speechMsg = CharacterService.instance.getEventSpeechMessage('streak_increased', streak: newStreak);
    }

    bool triggerGenderModal = (oldProfile.characterGender == null || oldProfile.characterGender!.isEmpty);
    EvolutionStageConfig? evolutionToPrompt = (newStage.stage > oldStage.stage) ? newStage : null;

    final updatedProfile = oldProfile.copyWith(
      characterXp: newXP,
      characterStage: newStage.id,
      characterMood: newMood,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: newLastDate,
    );

    state = state.copyWith(
      profile: updatedProfile,
      stageConfig: newStage,
      mood: newMood,
      speechMessage: speechMsg,
      showSpeechBubble: true,
      pendingGenderSelection: triggerGenderModal,
      pendingEvolution: evolutionToPrompt,
      lastXpGained: xpGained,
      tasks: updatedTasks,
    );

    triggerFloatingReaction(streakIncreased ? 'streak_boost' : 'finish_quiz');

    _ref.read(authProvider.notifier).setProfile(updatedProfile);
    await _profileService.updateCharacterData(updatedProfile);

    _speechTimer?.cancel();
    _speechTimer = Timer(const Duration(seconds: 4), () {
      if (mounted) {
        state = state.copyWith(showSpeechBubble: false);
      }
    });
  }

  void dismissEvolutionModal() {
    state = state.copyWith(clearPendingEvolution: true);
  }

  @override
  void dispose() {
    _speechTimer?.cancel();
    _floatingSpeechTimer?.cancel();
    _cooldownTimer?.cancel();
    super.dispose();
  }
}

final characterProvider = StateNotifierProvider<CharacterNotifier, CharacterState>((ref) {
  final profileService = ref.watch(profileServiceProvider);
  return CharacterNotifier(profileService, ref);
});
