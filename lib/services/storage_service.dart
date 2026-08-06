import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

class StorageService {
  final SupabaseClient _client = SupabaseService.instance.client;
  static const String _bucketName = 'profile-images';

  Future<String?> uploadProfileImage(File file, String userId) async {
    try {
      final fileExt = file.path.split('.').last;
      final fileName = '$userId-${DateTime.now().millisecondsSinceEpoch}.$fileExt';
      final path = 'profiles/$fileName';

      await _client.storage.from(_bucketName).upload(
        path,
        file,
        fileOptions: const FileOptions(cacheControl: '3600', upsert: true),
      );

      final String publicUrl = _client.storage.from(_bucketName).getPublicUrl(path);
      return publicUrl;
    } catch (e) {
      return null;
    }
  }
}
