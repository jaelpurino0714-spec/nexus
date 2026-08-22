import '../models/profile_model.dart';
import '../services/profile_service.dart';

abstract class AuthRepository {
  Future<String?> getSavedUserId();
  Future<String?> getSavedUserRole();
  Future<ProfileModel?> getCurrentSessionProfile();
  Future<ProfileModel> signUp({
    required String fullName,
    required String username,
    required String password,
    required String role,
    String? confirmPassword,
    String? teacherCode,
    String gradeLevel = 'Grade 10',
    String section = '',
  });
  Future<ProfileModel> signIn({
    required String username,
    required String password,
  });
  Future<ProfileModel?> loginTeacher(String passcode, String teacherName);
  Future<void> logout();
}

class AuthRepositoryImpl implements AuthRepository {
  final ProfileService _profileService;

  AuthRepositoryImpl(this._profileService);

  @override
  Future<String?> getSavedUserId() => _profileService.getSavedUserId();

  @override
  Future<String?> getSavedUserRole() => _profileService.getSavedUserRole();

  @override
  Future<ProfileModel?> getCurrentSessionProfile() => _profileService.getCurrentSessionProfile();

  @override
  Future<ProfileModel> signUp({
    required String fullName,
    required String username,
    required String password,
    required String role,
    String? confirmPassword,
    String? teacherCode,
    String gradeLevel = 'Grade 10',
    String section = '',
  }) =>
      _profileService.signUp(
        fullName: fullName,
        username: username,
        password: password,
        role: role,
        confirmPassword: confirmPassword,
        teacherCode: teacherCode,
        gradeLevel: gradeLevel,
        section: section,
      );

  @override
  Future<ProfileModel> signIn({
    required String username,
    required String password,
  }) =>
      _profileService.signIn(
        username: username,
        password: password,
      );

  @override
  Future<ProfileModel?> loginTeacher(String passcode, String teacherName) =>
      _profileService.verifyTeacherPasscode(passcode, teacherName);

  @override
  Future<void> logout() => _profileService.logout();
}
