import 'package:flutter/services.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AudioService {
  AudioService._privateConstructor();
  static final AudioService instance = AudioService._privateConstructor();

  final AudioPlayer _bgmPlayer = AudioPlayer();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String _bgmVolumeKey = 'nexus_bgm_volume';
  static const String _bgmMutedKey = 'nexus_bgm_muted';
  static const String _timerVolumeKey = 'nexus_timer_volume';
  static const String _timerMutedKey = 'nexus_timer_muted';

  double _volume = 0.5;
  bool _isMuted = false;
  double _sfxVolume = 0.5;
  bool _isSfxMuted = false;
  double _timerVolume = 0.6;
  bool _isTimerMuted = false;

  bool _isInitialized = false;
  bool _isPlaying = false;
  bool _isSourceSet = false;

  double get volume => _isMuted ? 0.0 : _volume;
  double get rawVolume => _volume;
  bool get isMuted => _isMuted;
  bool get isPlaying => _isPlaying;

  double get sfxVolume => _isSfxMuted ? 0.0 : _sfxVolume;
  double get rawSfxVolume => _sfxVolume;
  bool get isSfxMuted => _isSfxMuted;

  double get timerVolume => _isTimerMuted ? 0.0 : _timerVolume;
  double get rawTimerVolume => _timerVolume;
  bool get isTimerMuted => _isTimerMuted;

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

    _storage.read(key: _sfxVolumeKey).then((storedSfxVolStr) {
      if (storedSfxVolStr != null) {
        _sfxVolume = double.tryParse(storedSfxVolStr) ?? 0.5;
      }
    }).catchError((_) {});

    _storage.read(key: _sfxMutedKey).then((storedSfxMuteStr) {
      if (storedSfxMuteStr != null) {
        _isSfxMuted = storedSfxMuteStr == 'true';
      }
    }).catchError((_) {});

    _storage.read(key: _timerVolumeKey).then((storedTimerVolStr) {
      if (storedTimerVolStr != null) {
        _timerVolume = double.tryParse(storedTimerVolStr) ?? 0.6;
      }
    }).catchError((_) {});

    _storage.read(key: _timerMutedKey).then((storedTimerMuteStr) {
      if (storedTimerMuteStr != null) {
        _isTimerMuted = storedTimerMuteStr == 'true';
      }
    }).catchError((_) {});
  }

  Future<void> setTimerVolume(double newVol) async {
    _timerVolume = newVol;
    await _storage.write(key: _timerVolumeKey, value: newVol.toString());
    await _timerPlayer.setVolume(timerVolume);
  }

  Future<void> toggleTimerMute() async {
    _isTimerMuted = !_isTimerMuted;
    await _storage.write(key: _timerMutedKey, value: _isTimerMuted ? 'true' : 'false');
    await _timerPlayer.setVolume(timerVolume);
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

  final AudioPlayer _timerPlayer = AudioPlayer();

  /// Plays button tap / click feedback sound
  Future<void> playClickSound() async {
    if (_isSfxMuted || _sfxVolume <= 0.0) return;
    try {
      await SystemSound.play(SystemSoundType.click);
    } catch (_) {}
  }

  /// Plays timer tick sound effect
  Future<void> playTickSound() async {
    if (_isTimerMuted || _timerVolume <= 0.0) return;
    try {
      await SystemSound.play(SystemSoundType.click);
    } catch (_) {}
  }

  final AudioPlayer _sfxPlayer = AudioPlayer();

  /// Plays sound effect when question is answered correctly
  Future<void> playCorrectSound() async {
    if (_isSfxMuted || _sfxVolume <= 0.0) return;
    try {
      await _sfxPlayer.stop();
      await _sfxPlayer.setVolume(sfxVolume);
      await _sfxPlayer.play(AssetSource('audio/correct.mp3'), volume: sfxVolume);
    } catch (_) {
      try {
        await SystemSound.play(SystemSoundType.click);
      } catch (_) {}
    }
  }

  /// Plays sound effect when question is answered incorrectly or time expires
  Future<void> playWrongSound() async {
    if (_isSfxMuted || _sfxVolume <= 0.0) return;
    try {
      await _sfxPlayer.stop();
      await _sfxPlayer.setVolume(sfxVolume);
      await _sfxPlayer.play(AssetSource('audio/wrong.mp3'), volume: sfxVolume);
    } catch (_) {
      try {
        await SystemSound.play(SystemSoundType.click);
      } catch (_) {}
    }
  }

  /// Alias for playWrongSound
  Future<void> playIncorrectSound() async {
    await playWrongSound();
  }

  /// Plays 30sec clock background audio during active timer countdown (and pauses background music while answering)
  Future<void> playTimerAudio() async {
    await pauseBgm();
    if (_isTimerMuted || _timerVolume <= 0.0) return;
    try {
      await _timerPlayer.stop();
      await _timerPlayer.setVolume(timerVolume);
      await _timerPlayer.play(AssetSource('audio/timer_clock.mp3'), volume: timerVolume);
    } catch (_) {}
  }

  /// Stops 30sec clock background audio when timer ends or user answers
  Future<void> stopTimerAudio() async {
    try {
      await _timerPlayer.stop();
    } catch (_) {}
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

  Future<void> setSfxVolume(double newVolume) async {
    _sfxVolume = newVolume.clamp(0.0, 1.0);
    if (_sfxVolume > 0.0 && _isSfxMuted) {
      _isSfxMuted = false;
      _storage.write(key: _sfxMutedKey, value: 'false');
    }
    _storage.write(key: _sfxVolumeKey, value: _sfxVolume.toString());
  }

  Future<void> toggleSfxMute() async {
    _isSfxMuted = !_isSfxMuted;
    _storage.write(key: _sfxMutedKey, value: _isSfxMuted.toString());
  }

  void dispose() {
    _bgmPlayer.dispose();
  }
}
