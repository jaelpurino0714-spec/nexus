import 'dart:io';
import '../models/profile_model.dart';
import '../services/profile_service.dart';
import '../services/storage_service.dart';

abstract class ProfileRepository {
  Future<ProfileModel> createStudentProfile({
    required String name,
    required String gradeLevel,
    required String section,
    File? photoFile,
    String? deviceId,
    String? gender,
  });
  Future<ProfileModel?> getProfile(String userId);
}

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileService _profileService;
  final StorageService _storageService;

  ProfileRepositoryImpl(this._profileService, this._storageService);

  @override
  Future<ProfileModel> createStudentProfile({
    required String name,
    required String gradeLevel,
    required String section,
    File? photoFile,
    String? deviceId,
    String? gender,
  }) async {
    String? photoUrl;
    if (photoFile != null) {
      photoUrl = await _storageService.uploadProfileImage(photoFile, 'temp_${DateTime.now().millisecondsSinceEpoch}');
    }

    return await _profileService.createStudentProfile(
      name: name,
      gradeLevel: gradeLevel,
      section: section,
      photoUrl: photoUrl,
      deviceId: deviceId,
      gender: gender,
    );
  }

  @override
  Future<ProfileModel?> getProfile(String userId) => _profileService.fetchProfile(userId);
}
