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
  final _signUpTeacherCodeController = TextEditingController();
  final _signUpPasswordController = TextEditingController();
  final _signUpConfirmPasswordController = TextEditingController();
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
      final state = ref.read(authProvider);
      if (state.profile?.role == 'teacher') {
        context.go('/teacher/dashboard');
      } else {
        context.go('/student/home');
      }
    }
  }

  Future<void> _handleSignUp() async {
    final fullName = _signUpFullNameController.text.trim();
    final username = _signUpUsernameController.text.trim();
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
      backgroundColor: const Color(0xFFF5F3FF),
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
                    color: const Color(0xFF8B5CF6).withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Text('🧬', style: TextStyle(fontSize: 48)),
                ),
                const SizedBox(height: 12),
                const Text(
                  'NEXUS SCIENCE',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.black,
                    color: Color(0xFF5B21B6),
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Grade 10 Science Trivia & Learning System',
                  style: TextStyle(fontSize: 13, color: Colors.black54, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 24),

                // Main Card Container
                Container(
                  constraints: const BoxConstraints(maxWidth: 440),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF673AB7).withOpacity(0.12),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Tab Bar (Sign In / Sign Up)
                      Container(
                        margin: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3E8FF),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: TabBar(
                          controller: _tabController,
                          indicator: BoxDecoration(
                            color: const Color(0xFF7C3AED),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          labelColor: Colors.white,
                          unselectedLabelColor: const Color(0xFF6D28D9),
                          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          tabs: const [
                            Tab(text: 'Sign In'),
                            Tab(text: 'Sign Up'),
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
        crossAxisAlignment: CrossAlignment.stretch,
        children: [
          const SizedBox(height: 8),
          const Text(
            'Welcome Back! 👋',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E1B4B)),
          ),
          const Text(
            'Sign in with your username & password',
            style: TextStyle(fontSize: 13, color: Colors.black54),
          ),
          const SizedBox(height: 24),

          // Username / Nickname Field
          TextField(
            controller: _signInUsernameController,
            decoration: InputDecoration(
              labelText: 'Login Identifier / Nickname',
              prefixIcon: const Icon(Icons.person_outline, color: Color(0xFF7C3AED)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              filled: true,
              fillColor: const Color(0xFFFAF5FF),
            ),
          ),
          const SizedBox(height: 16),

          // Password Field
          TextField(
            controller: _signInPasswordController,
            obscureText: _signInObscurePassword,
            decoration: InputDecoration(
              labelText: 'Password',
              prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF7C3AED)),
              suffixIcon: IconButton(
                icon: Icon(
                  _signInObscurePassword ? Icons.visibility_off : Icons.visibility,
                  color: Colors.black45,
                ),
                onPressed: () => setState(() => _signInObscurePassword = !_signInObscurePassword),
              ),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              filled: true,
              fillColor: const Color(0xFFFAF5FF),
            ),
          ),
          const Spacer(),

          // Submit Button
          ElevatedButton(
            onPressed: isLoading ? null : _handleSignIn,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: const Color(0xFF7C3AED),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 3,
            ),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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
        crossAxisAlignment: CrossAlignment.stretch,
        children: [
          const Text(
            'Create Account ✨',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E1B4B)),
          ),
          const Text(
            'Join as a Student or Teacher to start learning',
            style: TextStyle(fontSize: 13, color: Colors.black54),
          ),
          const SizedBox(height: 16),

          // Account Type Selector (Student vs Teacher)
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _selectedRole = 'student'),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _selectedRole == 'student' ? const Color(0xFFEDE9FE) : Colors.grey[100],
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _selectedRole == 'student' ? const Color(0xFF7C3AED) : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('👨‍🎓 ', style: TextStyle(fontSize: 16)),
                        Text('Student', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
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
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _selectedRole == 'teacher' ? const Color(0xFFFFEDD5) : Colors.grey[100],
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _selectedRole == 'teacher' ? Colors.deepOrange : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('👩‍🏫 ', style: TextStyle(fontSize: 16)),
                        Text('Teacher', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
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
            decoration: InputDecoration(
              labelText: _selectedRole == 'teacher' ? 'Real Teacher Name' : 'Real Student Name',
              prefixIcon: const Icon(Icons.badge_outlined, color: Color(0xFF7C3AED)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              filled: true,
              fillColor: const Color(0xFFFAF5FF),
            ),
          ),
          const SizedBox(height: 12),

          // Nickname Field
          TextField(
            controller: _signUpUsernameController,
            decoration: InputDecoration(
              labelText: 'Nickname',
              prefixIcon: const Icon(Icons.alternate_email, color: Color(0xFF7C3AED)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              filled: true,
              fillColor: const Color(0xFFFAF5FF),
            ),
          ),
          const SizedBox(height: 12),

          // Teacher Code Field (Shown only when Teacher is selected)
          if (_selectedRole == 'teacher') ...[
            TextField(
              controller: _signUpTeacherCodeController,
              decoration: InputDecoration(
                labelText: 'Teacher Access Code',
                prefixIcon: const Icon(Icons.vpn_key_outlined, color: Colors.deepOrange),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                filled: true,
                fillColor: const Color(0xFFFFEDD5),
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Password Field
          TextField(
            controller: _signUpPasswordController,
            obscureText: _signUpObscurePassword,
            decoration: InputDecoration(
              labelText: 'Password',
              prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF7C3AED)),
              suffixIcon: IconButton(
                icon: Icon(
                  _signUpObscurePassword ? Icons.visibility_off : Icons.visibility,
                  color: Colors.black45,
                ),
                onPressed: () => setState(() => _signUpObscurePassword = !_signUpObscurePassword),
              ),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              filled: true,
              fillColor: const Color(0xFFFAF5FF),
            ),
          ),
          const SizedBox(height: 12),

          // Confirm Password Field (Rewrite Password)
          TextField(
            controller: _signUpConfirmPasswordController,
            obscureText: _signUpObscureConfirmPassword,
            decoration: InputDecoration(
              labelText: 'Rewrite Password',
              prefixIcon: const Icon(Icons.lock_reset, color: Color(0xFF7C3AED)),
              suffixIcon: IconButton(
                icon: Icon(
                  _signUpObscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
                  color: Colors.black45,
                ),
                onPressed: () => setState(() => _signUpObscureConfirmPassword = !_signUpObscureConfirmPassword),
              ),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              filled: true,
              fillColor: const Color(0xFFFAF5FF),
            ),
          ),
          const SizedBox(height: 20),

          // Submit Button
          ElevatedButton(
            onPressed: isLoading ? null : _handleSignUp,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: _selectedRole == 'teacher' ? Colors.deepOrange : const Color(0xFF7C3AED),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 3,
            ),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : Text(
                    'Create ${_selectedRole == "teacher" ? "Teacher" : "Student"} Account',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
          ),
        ],
      ),
    );
  }
}
