import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/profile_model.dart';
import '../services/character_service.dart';
import '../services/profile_service.dart';
import 'auth_provider.dart';

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
    );
  }
}

class CharacterNotifier extends StateNotifier<CharacterState> {
  final ProfileService _profileService;
  final Ref _ref;
  Timer? _speechTimer;
  Timer? _cooldownTimer;

  CharacterNotifier(this._profileService, this._ref)
      : super(CharacterState(
          profile: null,
          stageConfig: CharacterService.instance.getStageForXP(0),
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

    bool needGenderChoice = (stageConfig.stage >= 2 && (profile.characterGender == null || profile.characterGender!.isEmpty));

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
    );
  }

  /// Called when student taps the companion on screen
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

  /// Triggers a specific speech bubble message (e.g. after quiz or milestone)
  void showSpeech(String message, {String? moodOverride, Duration duration = const Duration(seconds: 4)}) {
    state = state.copyWith(
      speechMessage: message,
      showSpeechBubble: true,
      mood: moodOverride ?? state.mood,
    );

    _speechTimer?.cancel();
    _speechTimer = Timer(duration, () {
      if (mounted) {
        state = state.copyWith(showSpeechBubble: false);
      }
    });
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
  /// Updates XP, evaluates evolution, updates streak by calendar date, updates mood.
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
      xpGained += 30; // Perfect score bonus
    } else if (percentageScore >= 75) {
      xpGained += 15; // Passing bonus
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

    // 3. Determine New Mood & Speech Reaction
    String newMood = 'happy';
    String speechMsg = CharacterService.instance.getEventSpeechMessage('quiz_complete');

    if (newStage.stage > oldStage.stage) {
      newMood = 'excited';
      speechMsg = CharacterService.instance.getEventSpeechMessage('evolution');
    } else if (streakIncreased) {
      newMood = 'excited';
      speechMsg = CharacterService.instance.getEventSpeechMessage('streak_increased', streak: newStreak);
    }

    bool triggerGenderModal = (newStage.stage >= 2 && (oldProfile.characterGender == null || oldProfile.characterGender!.isEmpty));
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
    );

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
    _cooldownTimer?.cancel();
    super.dispose();
  }
}

final characterProvider = StateNotifierProvider<CharacterNotifier, CharacterState>((ref) {
  final profileService = ref.watch(profileServiceProvider);
  return CharacterNotifier(profileService, ref);
});
