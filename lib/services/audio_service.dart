import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AudioService {
  AudioService._privateConstructor();
  static final AudioService instance = AudioService._privateConstructor();

  final AudioPlayer _bgmPlayer = AudioPlayer();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String _bgmVolumeKey = 'nexus_bgm_volume';
  static const String _bgmMutedKey = 'nexus_bgm_muted';

  double _volume = 0.5;
  bool _isMuted = false;
  bool _isInitialized = false;
  bool _isPlaying = false;
  bool _isSourceSet = false;

  double get volume => _isMuted ? 0.0 : _volume;
  double get rawVolume => _volume;
  bool get isMuted => _isMuted;
  bool get isPlaying => _isPlaying;

  /// Fast non-blocking eager initialization
  Future<void> init() async {
    if (_isInitialized) return;
    _isInitialized = true;
    try {
      await _bgmPlayer.setReleaseMode(ReleaseMode.loop);
      await _bgmPlayer.setSource(AssetSource('audio/bg_music.mp3'));
      _isSourceSet = true;
    } catch (_) {}

    _loadStorageSettings();
  }

  void _loadStorageSettings() {
    _storage.read(key: _bgmVolumeKey).then((storedVolStr) {
      if (storedVolStr != null) {
        _volume = double.tryParse(storedVolStr) ?? 0.5;
        _bgmPlayer.setVolume(volume);
      }
    }).catchError((_) {});

    _storage.read(key: _bgmMutedKey).then((storedMuteStr) {
      if (storedMuteStr != null) {
        _isMuted = storedMuteStr == 'true';
        _bgmPlayer.setVolume(volume);
      }
    }).catchError((_) {});
  }

  /// Instantly starts looping background music zero-delay
  Future<void> playBgm() async {
    _isPlaying = true;

    try {
      await _bgmPlayer.setReleaseMode(ReleaseMode.loop);
      await _bgmPlayer.setVolume(volume);
      if (!_isSourceSet) {
        await _bgmPlayer.play(AssetSource('audio/bg_music.mp3'), volume: volume);
        _isSourceSet = true;
      } else {
        await _bgmPlayer.resume();
      }
    } catch (_) {
      try {
        await _bgmPlayer.play(AssetSource('audio/bg_music.mp3'), volume: volume);
        _isSourceSet = true;
      } catch (_) {}
    }

    if (!_isInitialized) {
      init();
    }
  }

  Future<void> pauseBgm() async {
    try {
      await _bgmPlayer.pause();
      _isPlaying = false;
    } catch (_) {}
  }

  Future<void> stopBgm() async {
    try {
      await _bgmPlayer.stop();
      _isPlaying = false;
    } catch (_) {}
  }

  Future<void> setVolume(double newVolume) async {
    _volume = newVolume.clamp(0.0, 1.0);
    if (_volume > 0.0 && _isMuted) {
      _isMuted = false;
      _storage.write(key: _bgmMutedKey, value: 'false');
    }
    _storage.write(key: _bgmVolumeKey, value: _volume.toString());
    await _bgmPlayer.setVolume(volume);
  }

  Future<void> toggleMute() async {
    _isMuted = !_isMuted;
    _storage.write(key: _bgmMutedKey, value: _isMuted.toString());
    await _bgmPlayer.setVolume(volume);
  }

  void dispose() {
    _bgmPlayer.dispose();
  }
}
