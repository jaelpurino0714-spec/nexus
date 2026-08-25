import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/audio_service.dart';

class AudioState {
  final double volume;
  final bool isMuted;
  final bool isPlaying;
  final double sfxVolume;
  final bool isSfxMuted;

  const AudioState({
    required this.volume,
    required this.isMuted,
    required this.isPlaying,
    required this.sfxVolume,
    required this.isSfxMuted,
  });

  AudioState copyWith({
    double? volume,
    bool? isMuted,
    bool? isPlaying,
    double? sfxVolume,
    bool? isSfxMuted,
  }) {
    return AudioState(
      volume: volume ?? this.volume,
      isMuted: isMuted ?? this.isMuted,
      isPlaying: isPlaying ?? this.isPlaying,
      sfxVolume: sfxVolume ?? this.sfxVolume,
      isSfxMuted: isSfxMuted ?? this.isSfxMuted,
    );
  }
}

class AudioNotifier extends StateNotifier<AudioState> {
  AudioNotifier()
      : super(AudioState(
          volume: AudioService.instance.rawVolume,
          isMuted: AudioService.instance.isMuted,
          isPlaying: AudioService.instance.isPlaying,
          sfxVolume: AudioService.instance.rawSfxVolume,
          isSfxMuted: AudioService.instance.isSfxMuted,
        )) {
    _init();
  }

  Future<void> _init() async {
    await AudioService.instance.init();
    state = state.copyWith(
      volume: AudioService.instance.rawVolume,
      isMuted: AudioService.instance.isMuted,
      isPlaying: AudioService.instance.isPlaying,
      sfxVolume: AudioService.instance.rawSfxVolume,
      isSfxMuted: AudioService.instance.isSfxMuted,
    );
  }

  Future<void> playBgm() async {
    await AudioService.instance.playBgm();
    state = state.copyWith(isPlaying: true);
  }

  Future<void> playClickSound() async {
    await AudioService.instance.playClickSound();
  }

  Future<void> pauseBgm() async {
    await AudioService.instance.pauseBgm();
    state = state.copyWith(isPlaying: false);
  }

  Future<void> setVolume(double volume) async {
    await AudioService.instance.setVolume(volume);
    state = state.copyWith(
      volume: AudioService.instance.rawVolume,
      isMuted: AudioService.instance.isMuted,
    );
  }

  Future<void> toggleMute() async {
    await AudioService.instance.toggleMute();
    state = state.copyWith(
      isMuted: AudioService.instance.isMuted,
    );
  }

  Future<void> setSfxVolume(double volume) async {
    await AudioService.instance.setSfxVolume(volume);
    state = state.copyWith(
      sfxVolume: AudioService.instance.rawSfxVolume,
      isSfxMuted: AudioService.instance.isSfxMuted,
    );
  }

  Future<void> toggleSfxMute() async {
    await AudioService.instance.toggleSfxMute();
    state = state.copyWith(
      isSfxMuted: AudioService.instance.isSfxMuted,
    );
  }
}

final audioProvider = StateNotifierProvider<AudioNotifier, AudioState>((ref) {
  return AudioNotifier();
});
