import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/auth_provider.dart';

class StudentProfileSetupScreen extends ConsumerStatefulWidget {
  const StudentProfileSetupScreen({super.key});

  @override
  ConsumerState<StudentProfileSetupScreen> createState() => _StudentProfileSetupScreenState();
}

class _StudentProfileSetupScreenState extends ConsumerState<StudentProfileSetupScreen> {
  final _nameController = TextEditingController();
  final _sectionController = TextEditingController();
  String _selectedGrade = 'Grade 10';
  File? _selectedImage;
  bool _isLoading = false;

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() {
        _selectedImage = File(picked.path);
      });
    }
  }

  Future<void> _saveProfile() async {
    if (_nameController.text.trim().isEmpty || _sectionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all required fields.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final profileRepo = ref.read(profileRepositoryProvider);
      final profile = await profileRepo.createStudentProfile(
        name: _nameController.text.trim(),
        gradeLevel: _selectedGrade,
        section: _sectionController.text.trim(),
        photoFile: _selectedImage,
      );

      ref.read(authProvider.notifier).setProfile(profile);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save profile: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Profile Setup')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            GestureDetector(
              onTap: _pickImage,
              child: CircleAvatar(
                radius: 50,
                backgroundColor: Colors.purple[100],
                backgroundImage: _selectedImage != null ? FileImage(_selectedImage!) : null,
                child: _selectedImage == null
                    ? const Icon(Icons.camera_alt, size: 40, color: Color(0xFF673AB7))
                    : null,
              ),
            ),
            const SizedBox(height: 8),
            const Text('Tap to add profile photo', style: TextStyle(color: Colors.black54)),
            const SizedBox(height: 32),

            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            DropdownButtonFormField<String>(
              value: _selectedGrade,
              decoration: const InputDecoration(
                labelText: 'Grade Level *',
                border: OutlineInputBorder(),
              ),
              items: ['Grade 10'].map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
              onChanged: (val) => setState(() => _selectedGrade = val!),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: _sectionController,
              decoration: const InputDecoration(
                labelText: 'Section *',
                hintText: 'e.g. Einstein, Newton',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 32),

            ElevatedButton(
              onPressed: _isLoading ? null : _saveProfile,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF673AB7),
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(50),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Save & Continue', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
