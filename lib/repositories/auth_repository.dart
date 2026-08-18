import '../models/profile_model.dart';
import '../services/profile_service.dart';

abstract class AuthRepository {
  Future<String?> getSavedUserId();
  Future<String?> getSavedUserRole();
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
  Future<ProfileModel?> loginTeacher(String passcode, String teacherName) =>
      _profileService.verifyTeacherPasscode(passcode, teacherName);

  @override
  Future<void> logout() => _profileService.logout();
}
