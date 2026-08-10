import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class StudentHomeScreen extends ConsumerWidget {
  const StudentHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome, ${authState.profile?.name ?? "Student"}!'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAlignment.stretch,
          children: [
            const Icon(
              Icons.science,
              size: 80,
              color: Color(0xFF673AB7),
            ),
            const SizedBox(height: 12),
            const Text(
              'NEXUS',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w900,
                color: Color(0xFF673AB7),
              ),
            ),
            const Text(
              'DepEd Grade 10 Science Trivia',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 48),

            // 1. Play Button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 20),
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
            const SizedBox(height: 16),

            // 2. Custom Button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 20),
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
            const SizedBox(height: 16),

            // 3. Settings Button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 20),
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
                context.push('/student/analytics');
              },
            ),
          ],
        ),
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
            crossAxisAlignment: CrossAlignment.stretch,
            children: [
              const Text(
                'Custom Mode',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
              ),
              const SizedBox(height: 4),
              const Text(
                'Choose your custom quiz flow',
                style: TextStyle(fontSize: 13, color: Colors.grey),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFEDE9FE), child: Text('🔑')),
                title: const Text('Join Quiz', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Enter 7-digit access code to join host lobby'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push('/student/terms');
                },
              ),
              const Divider(),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFFEF3C7), child: Text('👑')),
                title: const Text('Host Quiz', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Create live quiz lobby using Built-in or Custom questions'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push('/student/terms');
                },
              ),
              const Divider(),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFD1FAE5), child: Text('⚡')),
                title: const Text('Custom Play', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Single-player with custom time limit & question count'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push('/student/terms');
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
