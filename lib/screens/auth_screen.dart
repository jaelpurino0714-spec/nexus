import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Sign In Controllers
  final _signInUsernameController = TextEditingController();
  final _signInPasswordController = TextEditingController();
  bool _signInObscurePassword = true;

  // Sign Up Controllers
  final _signUpFullNameController = TextEditingController();
  final _signUpUsernameController = TextEditingController();
  final _signUpSectionController = TextEditingController();
  final _signUpTeacherCodeController = TextEditingController();
  final _signUpPasswordController = TextEditingController();
  final _signUpConfirmPasswordController = TextEditingController();
  String _selectedGradeLevel = 'Grade 10';
  bool _signUpObscurePassword = true;
  bool _signUpObscureConfirmPassword = true;
  String _selectedRole = 'student'; // 'student' or 'teacher'

  String? _localError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        setState(() {
          _localError = null;
        });
        ref.read(authProvider.notifier).clearError();
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _signInUsernameController.dispose();
    _signInPasswordController.dispose();
    _signUpFullNameController.dispose();
    _signUpUsernameController.dispose();
    _signUpSectionController.dispose();
    _signUpTeacherCodeController.dispose();
    _signUpPasswordController.dispose();
    _signUpConfirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    final username = _signInUsernameController.text.trim();
    final password = _signInPasswordController.text;

    if (username.isEmpty || password.isEmpty) {
      setState(() => _localError = 'Please fill out both Login Identifier and Password.');
      return;
    }

    setState(() => _localError = null);
    final success = await ref.read(authProvider.notifier).signIn(
          username: username,
          password: password,
        );

    if (success && mounted) {
      final role = ref.read(authProvider).profile?.role ?? _selectedRole;
      if (role == 'teacher') {
        context.go('/teacher/dashboard');
      } else {
        context.go('/student/home');
      }
    }
  }

  Future<void> _handleSignUp() async {
    final fullName = _signUpFullNameController.text.trim();
    final username = _signUpUsernameController.text.trim();
    final section = _signUpSectionController.text.trim();
    final teacherCode = _signUpTeacherCodeController.text.trim();
    final password = _signUpPasswordController.text;
    final confirmPassword = _signUpConfirmPasswordController.text;

    if (fullName.isEmpty) {
      setState(() => _localError = 'Please enter your ${_selectedRole == "teacher" ? "Real Teacher Name" : "Real Student Name"}.');
      return;
    }

    if (username.isEmpty) {
      setState(() => _localError = 'Please enter a Nickname.');
      return;
    }

    if (username.length < 3) {
      setState(() => _localError = 'Nickname must be at least 3 characters.');
      return;
    }

    if (_selectedRole == 'student' && section.isEmpty) {
      setState(() => _localError = 'Please enter your Section.');
      return;
    }

    if (_selectedRole == 'teacher') {
      if (teacherCode.isEmpty) {
        setState(() => _localError = 'Please enter a valid Teacher Code.');
        return;
      }
      final validCodes = ['NEXUS-TEACHER-2026', 'NEXUS2026', 'NEXUS10', '123456', 'TEACHER2026'];
      if (!validCodes.contains(teacherCode.toUpperCase())) {
        setState(() => _localError = 'Invalid Teacher Code. Please verify your code with school administration.');
        return;
      }
    }

    if (password.isEmpty) {
      setState(() => _localError = 'Please enter a Password.');
      return;
    }

    if (password.length < 6) {
      setState(() => _localError = 'Password must be at least 6 characters.');
      return;
    }

    if (confirmPassword.isEmpty) {
      setState(() => _localError = 'Please rewrite your password in the Rewrite Password field.');
      return;
    }

    if (password != confirmPassword) {
      setState(() => _localError = 'Password and Rewrite Password must match.');
      return;
    }

    setState(() => _localError = null);
    final success = await ref.read(authProvider.notifier).signUp(
          fullName: fullName,
          username: username,
          password: password,
          role: _selectedRole,
          confirmPassword: confirmPassword,
          teacherCode: teacherCode,
          gradeLevel: _selectedGradeLevel,
          section: section,
        );

    if (success && mounted) {
      if (_selectedRole == 'teacher') {
        context.go('/teacher/dashboard');
      } else {
        context.go('/student/home');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final displayedError = _localError ?? authState.errorMessage;

    return Scaffold(
      backgroundColor: const Color(0xFF090A1A),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Header Logo
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8B5CF6).withOpacity(0.15),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFEC4899).withOpacity(0.4),
                        blurRadius: 24,
                      ),
                    ],
                  ),
                  child: const Text('🧬', style: TextStyle(fontSize: 48)),
                ),
                const SizedBox(height: 12),
                RichText(
                  text: const TextSpan(
                    children: [
                      TextSpan(
                        text: 'Nexus ',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                      TextSpan(
                        text: 'Portal',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFA855F7),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Sign in or create your account to begin',
                  style: TextStyle(fontSize: 14, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 24),

                // Main Card Container
                Container(
                  constraints: const BoxConstraints(maxWidth: 440),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B0C1E),
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: const Color(0xFF2D1B69), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0B0C1E).withOpacity(0.9),
                        blurRadius: 40,
                        offset: const Offset(0, 10),
                      ),
                      BoxShadow(
                        color: const Color(0xFF7C3AED).withOpacity(0.15),
                        blurRadius: 30,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Tab Bar (Sign In / Sign Up)
                      Container(
                        margin: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0E0F26),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF231648)),
                        ),
                        child: TabBar(
                          controller: _tabController,
                          indicator: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF7C3AED), Color(0xFF6366F1)],
                            ),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF7C3AED).withOpacity(0.4),
                                blurRadius: 16,
                              ),
                            ],
                          ),
                          labelColor: Colors.white,
                          unselectedLabelColor: const Color(0xFFA5A3C4),
                          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          tabs: const [
                            Tab(text: 'Sign In 🔑'),
                            Tab(text: 'Create Account ✨'),
                          ],
                        ),
                      ),

                      // Error Display Banner
                      if (displayedError != null && displayedError.isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEE2E2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFCA5A5)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 20),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    displayedError,
                                    style: const TextStyle(
                                      color: Color(0xFF991B1B),
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],

                      // Tab Views
                      SizedBox(
                        height: 420,
                        child: TabBarView(
                          controller: _tabController,
                          children: [
                            // 1. SIGN IN TAB
                            _buildSignInTab(authState.isLoading),
                            // 2. SIGN UP TAB
                            _buildSignUpTab(authState.isLoading),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSignInTab(bool isLoading) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Username / Nickname Field
          TextField(
            controller: _signInUsernameController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Login Identifier / Nickname',
              labelStyle: const TextStyle(color: Color(0xFFA5A3C4)),
              prefixIcon: const Icon(Icons.person_outline, color: Color(0xFFA855F7)),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF231648)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
              ),
              filled: true,
              fillColor: const Color(0xFF0E0F26),
            ),
          ),
          const SizedBox(height: 16),

          // Password Field
          TextField(
            controller: _signInPasswordController,
            obscureText: _signInObscurePassword,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Password',
              labelStyle: const TextStyle(color: Color(0xFFA5A3C4)),
              prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFFA855F7)),
              suffixIcon: IconButton(
                icon: Icon(
                  _signInObscurePassword ? Icons.visibility_off : Icons.visibility,
                  color: const Color(0xFFA855F7),
                ),
                onPressed: () => setState(() => _signInObscurePassword = !_signInObscurePassword),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF231648)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
              ),
              filled: true,
              fillColor: const Color(0xFF0E0F26),
            ),
          ),
          const Spacer(),

          // Submit Button
          Container(
            height: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF7C3AED), Color(0xFF6366F1)],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF7C3AED).withOpacity(0.45),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: isLoading ? null : _handleSignIn,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Sign In 🚀', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildSignUpTab(bool isLoading) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Account Type Selector (Student vs Teacher)
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _selectedRole = 'student'),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 11),
                    decoration: BoxDecoration(
                      color: _selectedRole == 'student' ? const Color(0xFF7C3AED).withOpacity(0.2) : const Color(0xFF0E0F26),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _selectedRole == 'student' ? const Color(0xFF8B5CF6) : const Color(0xFF231648),
                        width: _selectedRole == 'student' ? 1.5 : 1.0,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('🎓 ', style: TextStyle(fontSize: 16)),
                        Text(
                          'Student',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: _selectedRole == 'student' ? Colors.white : const Color(0xFFA5A3C4),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _selectedRole = 'teacher'),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 11),
                    decoration: BoxDecoration(
                      color: _selectedRole == 'teacher' ? Colors.orange.withOpacity(0.2) : const Color(0xFF0E0F26),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _selectedRole == 'teacher' ? Colors.orangeAccent : const Color(0xFF231648),
                        width: _selectedRole == 'teacher' ? 1.5 : 1.0,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('👩‍🏫 ', style: TextStyle(fontSize: 16)),
                        Text(
                          'Teacher',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: _selectedRole == 'teacher' ? Colors.white : const Color(0xFFA5A3C4),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Real Name Field
          TextField(
            controller: _signUpFullNameController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: _selectedRole == 'teacher' ? 'Real Teacher Name' : 'Real Student Name',
              labelStyle: const TextStyle(color: Color(0xFFA5A3C4)),
              prefixIcon: const Icon(Icons.badge_outlined, color: Color(0xFFA855F7)),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF231648)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
              ),
              filled: true,
              fillColor: const Color(0xFF0E0F26),
            ),
          ),
          const SizedBox(height: 12),

          // Nickname Field
          TextField(
            controller: _signUpUsernameController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Nickname',
              labelStyle: const TextStyle(color: Color(0xFFA5A3C4)),
              prefixIcon: const Icon(Icons.alternate_email, color: Color(0xFFA855F7)),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF231648)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
              ),
              filled: true,
              fillColor: const Color(0xFF0E0F26),
            ),
          ),
          const SizedBox(height: 12),

          // Student Grade Level & Section Fields (Shown only when Student is selected)
          if (_selectedRole == 'student') ...[
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedGradeLevel,
                    dropdownColor: const Color(0xFF0E0F26),
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: 'Grade Level',
                      labelStyle: const TextStyle(color: Color(0xFFA5A3C4)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: Color(0xFF231648)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
                      ),
                      filled: true,
                      fillColor: const Color(0xFF0E0F26),
                    ),
                    items: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
                        .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedGradeLevel = val);
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _signUpSectionController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: 'Section',
                      labelStyle: const TextStyle(color: Color(0xFFA5A3C4)),
                      hintText: 'e.g. Einstein',
                      hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: Color(0xFF231648)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
                      ),
                      filled: true,
                      fillColor: const Color(0xFF0E0F26),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],

          // Teacher Code Field (Shown only when Teacher is selected)
          if (_selectedRole == 'teacher') ...[
            TextField(
              controller: _signUpTeacherCodeController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Teacher Access Code',
                labelStyle: const TextStyle(color: Colors.orangeAccent),
                prefixIcon: const Icon(Icons.vpn_key_outlined, color: Colors.orangeAccent),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF7C2D12)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Colors.orangeAccent, width: 1.5),
                ),
                filled: true,
                fillColor: const Color(0xFF2A1005),
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Password Field
          TextField(
            controller: _signUpPasswordController,
            obscureText: _signUpObscurePassword,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Password',
              labelStyle: const TextStyle(color: Color(0xFFA5A3C4)),
              prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFFA855F7)),
              suffixIcon: IconButton(
                icon: Icon(
                  _signUpObscurePassword ? Icons.visibility_off : Icons.visibility,
                  color: const Color(0xFFA855F7),
                ),
                onPressed: () => setState(() => _signUpObscurePassword = !_signUpObscurePassword),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF231648)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
              ),
              filled: true,
              fillColor: const Color(0xFF0E0F26),
            ),
          ),
          const SizedBox(height: 12),

          // Confirm Password Field (Rewrite Password)
          TextField(
            controller: _signUpConfirmPasswordController,
            obscureText: _signUpObscureConfirmPassword,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Rewrite Password',
              labelStyle: const TextStyle(color: Color(0xFFA5A3C4)),
              prefixIcon: const Icon(Icons.lock_reset, color: Color(0xFFA855F7)),
              suffixIcon: IconButton(
                icon: Icon(
                  _signUpObscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
                  color: const Color(0xFFA855F7),
                ),
                onPressed: () => setState(() => _signUpObscureConfirmPassword = !_signUpObscureConfirmPassword),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF231648)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
              ),
              filled: true,
              fillColor: const Color(0xFF0E0F26),
            ),
          ),
          const SizedBox(height: 20),

          // Submit Button
          Container(
            height: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF7C3AED), Color(0xFF6366F1)],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF7C3AED).withOpacity(0.45),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: isLoading ? null : _handleSignUp,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Create Account ✨', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
