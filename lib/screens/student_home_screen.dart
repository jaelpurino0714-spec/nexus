import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../providers/character_provider.dart';
import '../providers/audio_provider.dart';
import '../widgets/character_pet_modal.dart';
import '../widgets/gender_selection_dialog.dart';
import '../widgets/settings_modal.dart';

class StudentHomeScreen extends ConsumerStatefulWidget {
  const StudentHomeScreen({super.key});

  @override
  ConsumerState<StudentHomeScreen> createState() => _StudentHomeScreenState();
}

class _StudentHomeScreenState extends ConsumerState<StudentHomeScreen> {
  @override
  void initState() {
    super.initState();
    // Instantly trigger looping background music zero-delay
    ref.read(audioProvider.notifier).playBgm();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final charState = ref.read(characterProvider);
      if (charState.pendingGenderSelection) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => const GenderSelectionDialog(),
        );
      }
    });
  }

  void _showCharacterPetModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const CharacterPetModal(),
    );
  }

  void _showSettingsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const SettingsModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final audioState = ref.watch(audioProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome, ${authState.profile?.name ?? "Student"}!'),
        actions: [
          IconButton(
            icon: Icon(
              audioState.isMuted ? Icons.volume_off : Icons.volume_up,
              color: audioState.isMuted ? Colors.grey : const Color(0xFF8B5CF6),
            ),
            tooltip: 'Audio Settings',
            onPressed: () => _showSettingsModal(context),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAlignment: CrossAlignment.stretch,
              children: [
                const SizedBox(height: 10),

                // 1. Title & App Subtitle
                const Text(
                  'NEXUS',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF673AB7),
                    letterSpacing: 1.5,
                  ),
                ),
                const Text(
                  'DepEd Grade 10 Science Trivia',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 24),

                // 2. Play Button
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    backgroundColor: const Color(0xFF673AB7),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                  ),
                  icon: const Icon(Icons.play_arrow, size: 28),
                  label: const Text(
                    'Play',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () {
                    context.push('/student/terms');
                  },
                ),
                const SizedBox(height: 14),

                // 3. My Character Button
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    backgroundColor: const Color(0xFF0D9488),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                  ),
                  icon: const Icon(Icons.pets, size: 28),
                  label: const Text(
                    'My Character',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () {
                    _showCharacterPetModal(context);
                  },
                ),
                const SizedBox(height: 14),

                // 4. Custom Button
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    backgroundColor: Colors.purple.shade600,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                  ),
                  icon: const Icon(Icons.auto_awesome, size: 28),
                  label: const Text(
                    'Custom',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () {
                    _showCustomHubModal(context);
                  },
                ),
                const SizedBox(height: 14),

                // 5. Settings Button with Volume Slider Control
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    backgroundColor: Colors.blueGrey.shade700,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                  ),
                  icon: const Icon(Icons.settings, size: 28),
                  label: const Text(
                    'Settings',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () {
                    _showSettingsModal(context);
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }


  void _showCustomHubModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAlignment: CrossAlignment.stretch,
            children: [
              const Text(
                'Custom Mode Hub',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
              ),
              const SizedBox(height: 4),
              const Text(
                'Select your custom game option',
                style: TextStyle(fontSize: 13, color: Colors.grey),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFEDE9FE), child: Text('🔑')),
                title: const Text('Join Quiz', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Enter 6-digit access code to join host lobby'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push('/student/join-quiz');
                },
              ),
              const Divider(),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFD1FAE5), child: Text('⚡')),
                title: const Text('Custom Play', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Single-player with custom time limit & question count'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push('/student/custom-play');
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
