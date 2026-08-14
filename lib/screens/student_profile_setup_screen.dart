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
  String? _selectedGender;
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

    if (_selectedGender == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please choose MALE or FEMALE for your Character Companion.')),
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
        gender: _selectedGender,
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
          crossAlignment: CrossAlignment.start,
          children: [
            Center(
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
                ],
              ),
            ),
            const SizedBox(height: 24),

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
            const SizedBox(height: 24),

            // Character Gender Selection Section
            const Text(
              'Choose Character Companion Gender *',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF673AB7)),
            ),
            const SizedBox(height: 4),
            const Text(
              'Select Male or Female style for your interactive character companion.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedGender = 'male'),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _selectedGender == 'male' ? const Color(0xFFEFF6FF) : Colors.grey[50],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _selectedGender == 'male' ? const Color(0xFF3B82F6) : Colors.grey[300]!,
                          width: _selectedGender == 'male' ? 3 : 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Image.asset(
                            'assets/images/character/baby.png',
                            height: 70,
                            fit: BoxFit.contain,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'MALE',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedGender = 'female'),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _selectedGender == 'female' ? const Color(0xFFFDF2F8) : Colors.grey[50],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _selectedGender == 'female' ? const Color(0xFFEC4899) : Colors.grey[300]!,
                          width: _selectedGender == 'female' ? 3 : 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Image.asset(
                            'assets/images/character/baby.png',
                            height: 70,
                            fit: BoxFit.contain,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'FEMALE',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            ElevatedButton(
              onPressed: _isLoading ? null : _saveProfile,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF673AB7),
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Save & Create Baby Character', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
