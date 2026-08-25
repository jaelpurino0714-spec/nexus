import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AudioService {
  AudioService._privateConstructor();
  static final AudioService instance = AudioService._privateConstructor();

  final AudioPlayer _bgmPlayer = AudioPlayer();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String _bgmVolumeKey = 'nexus_bgm_volume';
  static const String _bgmMutedKey = 'nexus_bgm_muted';

  double _volume = 0.5; // Default 50% volume
  bool _isMuted = false;
  bool _isInitialized = false;
  bool _isPlaying = false;

  double get volume => _isMuted ? 0.0 : _volume;
  double get rawVolume => _volume;
  bool get isMuted => _isMuted;
  bool get isPlaying => _isPlaying;

  Future<void> init() async {
    if (_isInitialized) return;
    try {
      final storedVolStr = await _storage.read(key: _bgmVolumeKey);
      if (storedVolStr != null) {
        _volume = double.tryParse(storedVolStr) ?? 0.5;
      }

      final storedMuteStr = await _storage.read(key: _bgmMutedKey);
      if (storedMuteStr != null) {
        _isMuted = storedMuteStr == 'true';
      }

      await _bgmPlayer.setReleaseMode(ReleaseMode.loop);
      await _bgmPlayer.setVolume(volume);
      _isInitialized = true;
    } catch (e) {
      _isInitialized = true;
    }
  }

  Future<void> playBgm() async {
    await init();
    try {
      if (!_isPlaying) {
        await _bgmPlayer.play(AssetSource('audio/bg_music.mp3'));
        await _bgmPlayer.setVolume(volume);
        _isPlaying = true;
      }
    } catch (e) {
      // Audio playback handling
    }
  }

  Future<void> pauseBgm() async {
    try {
      await _bgmPlayer.pause();
      _isPlaying = false;
    } catch (e) {
      // Handle pause error
    }
  }

  Future<void> stopBgm() async {
    try {
      await _bgmPlayer.stop();
      _isPlaying = false;
    } catch (e) {
      // Handle stop error
    }
  }

  Future<void> setVolume(double newVolume) async {
    _volume = newVolume.clamp(0.0, 1.0);
    if (_volume > 0.0 && _isMuted) {
      _isMuted = false;
      await _storage.write(key: _bgmMutedKey, value: 'false');
    }
    await _storage.write(key: _bgmVolumeKey, value: _volume.toString());
    await _bgmPlayer.setVolume(volume);
  }

  Future<void> toggleMute() async {
    _isMuted = !_isMuted;
    await _storage.write(key: _bgmMutedKey, value: _isMuted.toString());
    await _bgmPlayer.setVolume(volume);
  }

  void dispose() {
    _bgmPlayer.dispose();
  }
}
