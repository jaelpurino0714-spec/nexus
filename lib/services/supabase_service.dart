import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/config/env_config.dart';

class SupabaseService {
  static SupabaseService? _instance;
  late final SupabaseClient client;

  SupabaseService._internal() {
    client = Supabase.instance.client;
  }

  static Future<SupabaseService> initialize() async {
    if (_instance == null) {
      await Supabase.initialize(
        url: EnvConfig.supabaseUrl,
        anonKey: EnvConfig.supabaseAnonKey,
      );
      _instance = SupabaseService._internal();
    }
    return _instance!;
  }

  static SupabaseService get instance {
    if (_instance == null) {
      throw StateError('SupabaseService has not been initialized. Call initialize() first.');
    }
    return _instance!;
  }
}
