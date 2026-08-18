import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/profile_model.dart';
import '../repositories/auth_repository.dart';
import '../services/profile_service.dart';
import '../services/storage_service.dart';
import '../repositories/profile_repository.dart';

final profileServiceProvider = Provider<ProfileService>((ref) => ProfileService());
final storageServiceProvider = Provider<StorageService>((ref) => StorageService());

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(profileServiceProvider));
});

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(
    ref.watch(profileServiceProvider),
    ref.watch(storageServiceProvider),
  );
});

enum AuthStatus { uninitialized, authenticatedStudent, authenticatedTeacher, unauthenticated }

class AuthState {
  final AuthStatus status;
  final ProfileModel? profile;
  final String? errorMessage;

  AuthState({
    required this.status,
    this.profile,
    this.errorMessage,
  });

  AuthState copyWith({
    AuthStatus? status,
    ProfileModel? profile,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      profile: profile ?? this.profile,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepo;
  final ProfileRepository _profileRepo;

  AuthNotifier(this._authRepo, this._profileRepo)
      : super(AuthState(status: AuthStatus.uninitialized)) {
    checkSession();
  }

  Future<void> checkSession() async {
    final userId = await _authRepo.getSavedUserId();
    final userRole = await _authRepo.getSavedUserRole();

    if (userId != null && userRole != null) {
      final profile = await _profileRepo.getProfile(userId);
      if (profile != null) {
        state = state.copyWith(
          status: userRole == 'teacher' ? AuthStatus.authenticatedTeacher : AuthStatus.authenticatedStudent,
          profile: profile,
        );
        return;
      }
    }

    state = state.copyWith(status: AuthStatus.unauthenticated);
  }

  Future<bool> loginTeacher(String passcode, String teacherName) async {
    final profile = await _authRepo.loginTeacher(passcode, teacherName);
    if (profile != null) {
      state = state.copyWith(
        status: AuthStatus.authenticatedTeacher,
        profile: profile,
      );
      return true;
    } else {
      state = state.copyWith(errorMessage: 'Invalid teacher passcode.');
      return false;
    }
  }

  Future<void> logout() async {
    await _authRepo.logout();
    state = AuthState(status: AuthStatus.unauthenticated);
  }

  void setProfile(ProfileModel profile) {
    state = state.copyWith(
      status: profile.role == 'teacher' ? AuthStatus.authenticatedTeacher : AuthStatus.authenticatedStudent,
      profile: profile,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authRepositoryProvider),
    ref.watch(profileRepositoryProvider),
  );
});
