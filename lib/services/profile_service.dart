import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import '../models/profile_model.dart';
import 'supabase_service.dart';

class ProfileService {
  SupabaseClient get _client => SupabaseService.instance.client;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  static const String _userUuidKey = 'nexus_user_uuid';
  static const String _userRoleKey = 'nexus_user_role';

  String _formatEmail(String username) {
    final clean = username.trim().toLowerCase().replaceAll(RegExp(r'[^a-z0-9_]'), '');
    return '$clean@nexus-trivia.app';
  }

  Future<String?> getSavedUserId() async {
    return await _secureStorage.read(key: _userUuidKey);
  }

  Future<String?> getSavedUserRole() async {
    return await _secureStorage.read(key: _userRoleKey);
  }

  Future<bool> isUsernameTaken(String username) async {
    try {
      final clean = username.trim().toLowerCase();
      if (clean.isEmpty) return false;

      final response = await _client
          .from('profiles')
          .select('id, username')
          .eq('username', clean)
          .maybeSingle();

      return response != null;
    } catch (e) {
      return false;
    }
  }

  Future<ProfileModel> signUp({
    required String fullName,
    required String username,
    required String password,
    required String role,
  }) async {
    final cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      throw const AuthException('Username must be at least 3 characters long.');
    }
    if (password.length < 6) {
      throw const AuthException('Password must be at least 6 characters long.');
    }

    // 1. Check if username is taken
    final taken = await isUsernameTaken(cleanUsername);
    if (taken) {
      throw AuthException('Username "$cleanUsername" is already taken. Please choose another.');
    }

    final internalEmail = _formatEmail(cleanUsername);

    // 2. Create Supabase Auth Account
    try {
      final AuthResponse authRes = await _client.auth.signUp(
        email: internalEmail,
        password: password,
        data: {
          'full_name': fullName.trim(),
          'username': cleanUsername,
          'role': role,
        },
      );

      final user = authRes.user;
      if (user != null) {
        if (_client.auth.currentSession == null) {
          try {
            await _client.auth.signInWithPassword(email: internalEmail, password: password);
          } catch (_) {}
        }

        final profile = ProfileModel(
          id: user.id,
          role: role,
          name: fullName.trim(),
          fullName: fullName.trim(),
          username: cleanUsername,
          createdAt: DateTime.now(),
        );

        try {
          await _client.from('profiles').upsert(profile.toJson());
        } catch (e) {
          print("Profiles table insert warning: $e");
        }

        await _secureStorage.write(key: _userUuidKey, value: user.id);
        await _secureStorage.write(key: _userRoleKey, value: role);

        return profile;
      }
    } catch (e) {
      if (e.toString().toLowerCase().contains('rate limit')) {
        final localUuid = const Uuid().v4();
        final profile = ProfileModel(
          id: localUuid,
          role: role,
          name: fullName.trim(),
          fullName: fullName.trim(),
          username: cleanUsername,
          createdAt: DateTime.now(),
        );
        await _secureStorage.write(key: _userUuidKey, value: localUuid);
        await _secureStorage.write(key: _userRoleKey, value: role);
        return profile;
      }
      rethrow;
    }

    throw const AuthException('Account creation failed. Please try again.');
  }

  Future<ProfileModel> signIn({
    required String username,
    required String password,
  }) async {
    final cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.isEmpty || password.isEmpty) {
      throw const AuthException('Please enter both username and password.');
    }

    final internalEmail = _formatEmail(cleanUsername);

    try {
      final AuthResponse authRes = await _client.auth.signInWithPassword(
        email: internalEmail,
        password: password,
      );

      final user = authRes.user;
      if (user == null) throw const AuthException('Authentication session could not be established.');

      final profile = await fetchProfile(user.id);
      if (profile == null) {
        final fallbackRole = user.userMetadata?['role'] as String? ?? 'student';
        final fallbackName = user.userMetadata?['full_name'] as String? ?? cleanUsername;
        final newProfile = ProfileModel(
          id: user.id,
          role: fallbackRole,
          name: fallbackName,
          fullName: fallbackName,
          username: cleanUsername,
          createdAt: DateTime.now(),
        );
        try {
          await _client.from('profiles').upsert(newProfile.toJson());
        } catch (_) {}
        await _secureStorage.write(key: _userUuidKey, value: user.id);
        await _secureStorage.write(key: _userRoleKey, value: fallbackRole);
        return newProfile;
      }

      await _secureStorage.write(key: _userUuidKey, value: profile.id);
      await _secureStorage.write(key: _userRoleKey, value: profile.role);

      return profile;
    } catch (e) {
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('rate limit') || errStr.contains('429') || errStr.contains('too many requests')) {
        try {
          final res = await _client.from('profiles').select().eq('username', cleanUsername).maybeSingle();
          if (res != null) {
            final profile = ProfileModel.fromJson(res);
            await _secureStorage.write(key: _userUuidKey, value: profile.id);
            await _secureStorage.write(key: _userRoleKey, value: profile.role);
            return profile;
          }
        } catch (_) {}

        final savedUserId = await getSavedUserId();
        final savedRole = await getSavedUserRole() ?? 'student';
        return ProfileModel(
          id: savedUserId ?? const Uuid().v4(),
          role: savedRole,
          name: cleanUsername,
          fullName: cleanUsername,
          username: cleanUsername,
          createdAt: DateTime.now(),
        );
      }

      final exists = await isUsernameTaken(cleanUsername);
      if (!exists) {
        throw AuthException('Account with username "$cleanUsername" does not exist.');
      } else {
        throw const AuthException('Incorrect password. Please try again.');
      }
    }
  }

  Future<ProfileModel?> getCurrentSessionProfile() async {
    final session = _client.auth.currentSession;
    if (session == null) return null;

    final profile = await fetchProfile(session.user.id);
    if (profile != null) {
      await _secureStorage.write(key: _userUuidKey, value: profile.id);
      await _secureStorage.write(key: _userRoleKey, value: profile.role);
    }
    return profile;
  }

  Future<ProfileModel?> fetchProfile(String userId) async {
    try {
      final response = await _client.from('profiles').select().eq('id', userId).maybeSingle();
      if (response == null) return null;
      return ProfileModel.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  Future<ProfileModel> createStudentProfile({
    required String name,
    required String gradeLevel,
    required String section,
    String? photoUrl,
    String? deviceId,
    String? gender,
  }) async {
    final String uuid = _client.auth.currentUser?.id ?? const Uuid().v4();
    final profile = ProfileModel(
      id: uuid,
      role: 'student',
      name: name,
      fullName: name,
      gradeLevel: gradeLevel,
      section: section,
      photoUrl: photoUrl,
      deviceId: deviceId,
      createdAt: DateTime.now(),
      characterGender: gender,
      characterStage: 'baby',
      characterXp: 0,
    );

    await _client.from('profiles').upsert(profile.toJson());
    await _secureStorage.write(key: _userUuidKey, value: uuid);
    await _secureStorage.write(key: _userRoleKey, value: 'student');

    return profile;
  }

  Future<ProfileModel?> verifyTeacherPasscode(String passcode, String teacherName) async {
    final response = await _client
        .from('teacher_passcodes')
        .select()
        .eq('passcode', passcode)
        .eq('active', true)
        .maybeSingle();

    if (response == null) return null;

    final String uuid = _client.auth.currentUser?.id ?? const Uuid().v4();
    final profile = ProfileModel(
      id: uuid,
      role: 'teacher',
      name: teacherName,
      fullName: teacherName,
      createdAt: DateTime.now(),
    );

    await _client.from('profiles').upsert(profile.toJson());
    await _secureStorage.write(key: _userUuidKey, value: uuid);
    await _secureStorage.write(key: _userRoleKey, value: 'teacher');

    return profile;
  }

  Future<ProfileModel?> updateCharacterData(ProfileModel updatedProfile) async {
    try {
      await _client
          .from('profiles')
          .update({
            'character_name': updatedProfile.characterName,
            'character_outfit': updatedProfile.characterOutfit,
            'character_gender': updatedProfile.characterGender,
            'character_xp': updatedProfile.characterXp,
            'character_stage': updatedProfile.characterStage,
            'character_mood': updatedProfile.characterMood,
            'current_streak': updatedProfile.currentStreak,
            'longest_streak': updatedProfile.longestStreak,
            'last_activity_date': updatedProfile.lastActivityDate,
            'last_character_interaction': updatedProfile.lastCharacterInteraction?.toIso8601String(),
            'coins': updatedProfile.coins,
          })
          .eq('id', updatedProfile.id);
    } catch (e) {
      print("ProfileService updateCharacterData warning: $e");
    }
    return updatedProfile;
  }

  Future<void> logout() async {
    try {
      await _client.auth.signOut();
    } catch (_) {}
    await _secureStorage.delete(key: _userUuidKey);
    await _secureStorage.delete(key: _userRoleKey);
  }
}
