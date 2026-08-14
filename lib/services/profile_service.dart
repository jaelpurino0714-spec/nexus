import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import '../models/profile_model.dart';
import 'supabase_service.dart';

class ProfileService {
  final SupabaseClient _client = SupabaseService.instance.client;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  static const String _userUuidKey = 'nexus_user_uuid';
  static const String _userRoleKey = 'nexus_user_role';

  Future<String?> getSavedUserId() async {
    return await _secureStorage.read(key: _userUuidKey);
  }

  Future<String?> getSavedUserRole() async {
    return await _secureStorage.read(key: _userRoleKey);
  }

  Future<ProfileModel> createStudentProfile({
    required String name,
    required String gradeLevel,
    required String section,
    String? photoUrl,
    String? deviceId,
  }) async {
    final String uuid = const Uuid().v4();
    final profile = ProfileModel(
      id: uuid,
      role: 'student',
      name: name,
      gradeLevel: gradeLevel,
      section: section,
      photoUrl: photoUrl,
      deviceId: deviceId,
      createdAt: DateTime.now(),
    );

    await _client.from('profiles').insert(profile.toJson());
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

    final String uuid = const Uuid().v4();
    final profile = ProfileModel(
      id: uuid,
      role: 'teacher',
      name: teacherName,
      createdAt: DateTime.now(),
    );

    await _client.from('profiles').insert(profile.toJson());
    await _secureStorage.write(key: _userUuidKey, value: uuid);
    await _secureStorage.write(key: _userRoleKey, value: 'teacher');

    return profile;
  }

  Future<ProfileModel?> fetchProfile(String userId) async {
    final response = await _client.from('profiles').select().eq('id', userId).maybeSingle();
    if (response == null) return null;
    return ProfileModel.fromJson(response);
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
          })
          .eq('id', updatedProfile.id);
    } catch (e) {
      // Graceful fallback if database column missing or network offline
      print("ProfileService updateCharacterData warning: $e");
    }
    return updatedProfile;
  }


  Future<void> logout() async {
    await _secureStorage.delete(key: _userUuidKey);
    await _secureStorage.delete(key: _userRoleKey);
  }
}

