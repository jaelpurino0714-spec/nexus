import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

class TeacherLoginScreen extends ConsumerStatefulWidget {
  const TeacherLoginScreen({super.key});

  @override
  ConsumerState<TeacherLoginScreen> createState() => _TeacherLoginScreenState();
}

class _TeacherLoginScreenState extends ConsumerState<TeacherLoginScreen> {
  final _nameController = TextEditingController();
  final _passcodeController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    if (_nameController.text.trim().isEmpty || _passcodeController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter both name and teacher passcode.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final success = await ref.read(authProvider.notifier).loginTeacher(
          _passcodeController.text.trim(),
          _nameController.text.trim(),
        );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid passcode. Access denied.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Teacher Passcode Login')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Text(
              '👩‍🏫 Teacher Portal',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Enter your passcode to manage topics & view analytics',
              style: TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 32),

            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Teacher Name *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: _passcodeController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Teacher Passcode *',
                hintText: 'e.g. 123456',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 32),

            ElevatedButton(
              onPressed: _isLoading ? null : _login,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.deepOrange,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(50),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Access Dashboard', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
