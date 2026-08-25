import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/config/env_config.dart';
import 'core/router/app_router.dart';
import 'services/supabase_service.dart';
import 'services/sync_service.dart';
import 'services/audio_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables (.env)
  await EnvConfig.init();

  // Preload Audio Player for instant BGM playback on Home Screen
  AudioService.instance.init();

  // Initialize Hive for offline caching & sync queue
  await Hive.initFlutter();
  await SyncService().init();

  // Initialize Supabase Client
  await SupabaseService.initialize();

  runApp(
    const ProviderScope(
      child: NexusApp(),
    ),
  );
}

class NexusApp extends ConsumerWidget {
  const NexusApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'NEXUS - Grade 10 Science Trivia',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF673AB7),
        fontFamily: 'Plus Jakarta Sans',
      ),
      routerConfig: router,
    );
  }
}
