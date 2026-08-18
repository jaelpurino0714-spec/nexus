import '../models/profile_model.dart';
import '../services/profile_service.dart';

abstract class AuthRepository {
  Future<String?> getSavedUserId();
  Future<String?> getSavedUserRole();
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
  Future<void> logout() => _profileService.logout();
}
