import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/audio_service.dart';

class AudioState {
  final double volume;
  final bool isMuted;
  final bool isPlaying;

  const AudioState({
    required this.volume,
    required this.isMuted,
    required this.isPlaying,
  });

  AudioState copyWith({
    double? volume,
    bool? isMuted,
    bool? isPlaying,
  }) {
    return AudioState(
      volume: volume ?? this.volume,
      isMuted: isMuted ?? this.isMuted,
      isPlaying: isPlaying ?? this.isPlaying,
    );
  }
}

class AudioNotifier extends StateNotifier<AudioState> {
  AudioNotifier()
      : super(AudioState(
          volume: AudioService.instance.rawVolume,
          isMuted: AudioService.instance.isMuted,
          isPlaying: AudioService.instance.isPlaying,
        )) {
    _init();
  }

  Future<void> _init() async {
    await AudioService.instance.init();
    state = state.copyWith(
      volume: AudioService.instance.rawVolume,
      isMuted: AudioService.instance.isMuted,
      isPlaying: AudioService.instance.isPlaying,
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
}

final audioProvider = StateNotifierProvider<AudioNotifier, AudioState>((ref) {
  return AudioNotifier();
});
