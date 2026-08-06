import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import 'supabase_service.dart';

class SyncService {
  static const String _queueBoxName = 'offline_quiz_attempts_queue';

  Future<void> init() async {
    await Hive.openBox(_queueBoxName);
  }

  Future<void> queueOfflineAttempt(Map<String, dynamic> attemptData) async {
    final box = Hive.box(_queueBoxName);
    await box.add(jsonEncode(attemptData));
  }

  Future<void> syncPendingAttempts() async {
    final box = Hive.box(_queueBoxName);
    if (box.isEmpty) return;

    final client = SupabaseService.instance.client;
    final List keysToRemove = [];

    for (int i = 0; i < box.length; i++) {
      try {
        final rawJson = box.getAt(i) as String;
        final Map<String, dynamic> data = jsonDecode(rawJson);

        final attempt = data['attempt'];
        final List answers = data['answers'];

        await client.from('quiz_attempts').insert(attempt);
        await client.from('answers').insert(answers);

        keysToRemove.add(box.keyAt(i));
      } catch (e) {
        // Log sync error, keep in queue for next retry
      }
    }

    for (var key in keysToRemove) {
      await box.delete(key);
    }
  }
}
