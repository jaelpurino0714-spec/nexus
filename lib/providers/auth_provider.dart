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
  final bool isLoading;

  AuthState({
    required this.status,
    this.profile,
    this.errorMessage,
    this.isLoading = false,
  });

  AuthState copyWith({
    AuthStatus? status,
    ProfileModel? profile,
    String? errorMessage,
    bool? isLoading,
  }) {
    return AuthState(
      status: status ?? this.status,
      profile: profile ?? this.profile,
      errorMessage: errorMessage,
      isLoading: isLoading ?? this.isLoading,
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
    try {
      final activeProfile = await _authRepo.getCurrentSessionProfile();
      if (activeProfile != null) {
        state = state.copyWith(
          status: activeProfile.role == 'teacher' ? AuthStatus.authenticatedTeacher : AuthStatus.authenticatedStudent,
          profile: activeProfile,
          errorMessage: null,
          isLoading: false,
        );
        return;
      }
    } catch (_) {}

    final userId = await _authRepo.getSavedUserId();
    final userRole = await _authRepo.getSavedUserRole();

    if (userId != null && userRole != null) {
      final profile = await _profileRepo.getProfile(userId);
      if (profile != null) {
        state = state.copyWith(
          status: userRole == 'teacher' ? AuthStatus.authenticatedTeacher : AuthStatus.authenticatedStudent,
          profile: profile,
          errorMessage: null,
          isLoading: false,
        );
        return;
      }
    }

    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      profile: null,
      isLoading: false,
    );
  }

  Future<bool> signUp({
    required String fullName,
    required String username,
    required String password,
    required String role,
    String? confirmPassword,
    String? teacherCode,
    String gradeLevel = 'Grade 10',
    String section = '',
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final profile = await _authRepo.signUp(
        fullName: fullName,
        username: username,
        password: password,
        role: role,
        confirmPassword: confirmPassword,
        teacherCode: teacherCode,
        gradeLevel: gradeLevel,
        section: section,
      );
      state = state.copyWith(
        status: profile.role == 'teacher' ? AuthStatus.authenticatedTeacher : AuthStatus.authenticatedStudent,
        profile: profile,
        isLoading: false,
        errorMessage: null,
      );
      return true;
    } catch (e) {
      String cleanMsg = e.toString().replaceAll(RegExp(r'^(Exception|AuthException):\s*'), '');
      if (cleanMsg.toLowerCase().contains('rate limit') || cleanMsg.contains('429')) {
        cleanMsg = 'Too many attempts. Please try again in a moment.';
      }
      state = state.copyWith(
        isLoading: false,
        errorMessage: cleanMsg,
      );
      return false;
    }
  }

  Future<bool> signIn({
    required String username,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final profile = await _authRepo.signIn(
        username: username,
        password: password,
      );
      state = state.copyWith(
        status: profile.role == 'teacher' ? AuthStatus.authenticatedTeacher : AuthStatus.authenticatedStudent,
        profile: profile,
        isLoading: false,
        errorMessage: null,
      );
      return true;
    } catch (e) {
      String cleanMsg = e.toString().replaceAll(RegExp(r'^(Exception|AuthException):\s*'), '');
      if (cleanMsg.toLowerCase().contains('rate limit') || cleanMsg.contains('429')) {
        cleanMsg = 'Too many attempts. Please try again in a moment.';
      }
      state = state.copyWith(
        isLoading: false,
        errorMessage: cleanMsg,
      );
      return false;
    }
  }

  Future<bool> loginTeacher(String passcode, String teacherName) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final profile = await _authRepo.loginTeacher(passcode, teacherName);
    if (profile != null) {
      state = state.copyWith(
        status: AuthStatus.authenticatedTeacher,
        profile: profile,
        isLoading: false,
      );
      return true;
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Invalid teacher passcode.',
      );
      return false;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    await _authRepo.logout();
    state = AuthState(status: AuthStatus.unauthenticated);
  }

  void setProfile(ProfileModel profile) {
    state = state.copyWith(
      status: profile.role == 'teacher' ? AuthStatus.authenticatedTeacher : AuthStatus.authenticatedStudent,
      profile: profile,
    );
  }

  Future<bool> loginAsGuest() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final guestProfile = ProfileModel(
      id: 'guest-user-uuid-0000-0000-000000000000',
      role: 'student',
      name: 'Guest Student',
      fullName: 'Guest Student',
      username: 'guest',
      gradeLevel: 'Grade 10',
      section: 'Science',
      createdAt: DateTime.now(),
      characterXp: 0,
      characterStage: 'baby',
      characterMood: 'idle',
      currentStreak: 0,
      longestStreak: 0,
      coins: 50,
      unlockedOutfits: ['default'],
    );
    state = state.copyWith(
      status: AuthStatus.authenticatedStudent,
      profile: guestProfile,
      isLoading: false,
      errorMessage: null,
    );
    return true;
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authRepositoryProvider),
    ref.watch(profileRepositoryProvider),
  );
});
