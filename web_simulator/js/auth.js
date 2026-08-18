/* ==========================================================================
   NEXUS AUTHENTICATION & PROFILE CONTROLLER
   Implements Supabase Username + Password Auth, Profile Creation & Role-Based Navigation
   ========================================================================== */

const Auth = {
  currentMode: 'signin',
  selectedSignUpRole: 'student',
  uploadedPhotoData: null,
  editPhotoData: null,

  switchMode(mode) {
    this.currentMode = mode;
    this.clearError();

    const signInBtn = document.getElementById('signInTabBtn');
    const signUpBtn = document.getElementById('signUpTabBtn');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');

    if (mode === 'signin') {
      signInBtn.style.background = '#7C3AED';
      signInBtn.style.color = 'white';
      signUpBtn.style.background = 'transparent';
      signUpBtn.style.color = '#6D28D9';
      signInForm.style.display = 'block';
      signUpForm.style.display = 'none';
    } else {
      signUpBtn.style.background = '#7C3AED';
      signUpBtn.style.color = 'white';
      signInBtn.style.background = 'transparent';
      signInBtn.style.color = '#6D28D9';
      signUpForm.style.display = 'block';
      signInForm.style.display = 'none';
    }
  },

  setRole(role) {
    this.selectedSignUpRole = role;
    const btnStudent = document.getElementById('roleBtnStudent');
    const btnTeacher = document.getElementById('roleBtnTeacher');

    if (role === 'student') {
      btnStudent.style.background = '#EDE9FE';
      btnStudent.style.border = '2px solid #7C3AED';
      btnStudent.style.color = '#5B21B6';
      btnTeacher.style.background = '#F3F4F6';
      btnTeacher.style.border = '2px solid transparent';
      btnTeacher.style.color = '#4B5563';
    } else {
      btnTeacher.style.background = '#FFEDD5';
      btnTeacher.style.border = '2px solid #EA580C';
      btnTeacher.style.color = '#C2410C';
      btnStudent.style.background = '#F3F4F6';
      btnStudent.style.border = '2px solid transparent';
      btnStudent.style.color = '#4B5563';
    }
  },

  togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  },

  showError(msg) {
    const banner = document.getElementById('authErrorBanner');
    if (banner) {
      banner.style.display = 'block';
      banner.textContent = msg;
    }
  },

  clearError() {
    const banner = document.getElementById('authErrorBanner');
    if (banner) {
      banner.style.display = 'none';
      banner.textContent = '';
    }
  },

  formatInternalEmail(username) {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    return `${clean}@nexus-trivia.app`;
  },

  getClient() {
    if (typeof getSupabaseClient === 'function') {
      const c = getSupabaseClient();
      if (c) return c;
    }
    if (typeof window !== 'undefined' && window.supabaseClient) {
      return window.supabaseClient;
    }
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      return supabaseClient;
    }
    return null;
  },

  async handleSignIn() {
    this.clearError();
    const username = document.getElementById('signInUsername').value.trim().toLowerCase();
    const password = document.getElementById('signInPassword').value;
    const submitBtn = document.getElementById('signInSubmitBtn');

    if (!username || !password) {
      this.showError('Please fill out both Username and Password.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in... ⏳';

    try {
      const client = this.getClient();
      if (client && client.auth) {
        const internalEmail = this.formatInternalEmail(username);
        const { data, error } = await client.auth.signInWithPassword({
          email: internalEmail,
          password: password
        });

        if (error) {
          // Check if username exists in profiles for exact error messaging
          const { data: profCheck } = await client.from('profiles').select('username').eq('username', username).maybeSingle();
          if (!profCheck) {
            throw new Error(`Account with username "${username}" does not exist.`);
          } else {
            throw new Error('Incorrect password. Please try again.');
          }
        }

        const user = data.user;
        let profile = await DB.fetchProfileFromSupabase(user.id);

        if (!profile) {
          const userRole = (user.user_metadata && user.user_metadata.role) ? user.user_metadata.role : 'student';
          const fullName = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : username;
          profile = {
            id: user.id,
            role: userRole,
            name: fullName,
            full_name: fullName,
            username: username,
            createdAt: new Date().toISOString()
          };
          await DB.saveStudentProfile(profile);
        } else {
          DB.safeSetItem(DB.STORAGE_PROFILE, JSON.stringify(profile));
        }

        DB.saveUserUUID(user.id);
        App.updateUserHeader();

        if (profile.role === 'teacher') {
          localStorage.setItem(DB.STORAGE_TEACHER, JSON.stringify(profile));
          App.showScreen('teacherHomeScreen');
        } else {
          localStorage.removeItem(DB.STORAGE_TEACHER);
          App.showScreen('homeScreen');
        }
      } else {
        // Fallback local sign in
        const profile = {
          id: DB.getUserUUID(),
          role: 'student',
          name: username,
          username: username,
          createdAt: new Date().toISOString()
        };
        DB.saveStudentProfile(profile);
        App.updateUserHeader();
        App.showScreen('homeScreen');
      }
    } catch (err) {
      this.showError(err.message || 'Authentication failed.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In 🚀';
    }
  },

  async handleSignUp() {
    this.clearError();
    const fullName = document.getElementById('signUpFullName').value.trim();
    const username = document.getElementById('signUpUsername').value.trim().toLowerCase();
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;
    const role = this.selectedSignUpRole;
    const submitBtn = document.getElementById('signUpSubmitBtn');

    if (!fullName || !username || !password || !confirmPassword) {
      this.showError('Please fill out all required fields.');
      return;
    }

    if (username.length < 3) {
      this.showError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Passwords do not match.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account... ⏳';

    try {
      const client = this.getClient();
      if (client && client.auth) {
        // 1. Check if username is taken
        const { data: existingUser } = await client.from('profiles').select('id, username').eq('username', username).maybeSingle();
        if (existingUser) {
          throw new Error(`Username "${username}" is already taken. Please choose another.`);
        }

        // 2. Sign up via Supabase Auth
        const internalEmail = this.formatInternalEmail(username);
        const { data, error } = await client.auth.signUp({
          email: internalEmail,
          password: password,
          options: {
            data: {
              full_name: fullName,
              username: username,
              role: role
            }
          }
        });

        if (error) throw error;

        const user = data.user;
        if (!user) throw new Error('Failed to create account.');

        // 3. Insert Profile
        const profile = {
          id: user.id,
          role: role,
          name: fullName,
          full_name: fullName,
          username: username,
          created_at: new Date().toISOString()
        };

        try {
          await client.from('profiles').upsert({
            id: user.id,
            role: role,
            name: fullName,
            full_name: fullName,
            username: username,
            created_at: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Profile table insert warning:', e);
        }

        DB.saveStudentProfile(profile);
        DB.saveUserUUID(user.id);
        App.updateUserHeader();

        if (role === 'teacher') {
          localStorage.setItem(DB.STORAGE_TEACHER, JSON.stringify(profile));
          App.showScreen('teacherHomeScreen');
        } else {
          localStorage.removeItem(DB.STORAGE_TEACHER);
          App.showScreen('homeScreen');
        }
      } else {
        const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'usr-' + Date.now();
        const profile = {
          id: uuid,
          role: role,
          name: fullName,
          username: username,
          createdAt: new Date().toISOString()
        };
        DB.saveStudentProfile(profile);
        DB.saveUserUUID(uuid);
        App.updateUserHeader();

        if (role === 'teacher') {
          localStorage.setItem(DB.STORAGE_TEACHER, JSON.stringify(profile));
          App.showScreen('teacherHomeScreen');
        } else {
          localStorage.removeItem(DB.STORAGE_TEACHER);
          App.showScreen('homeScreen');
        }
      }
    } catch (err) {
      this.showError(err.message || 'Account creation failed.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account ✨';
    }
  },

  // Helper: Client-side Image Resizing & Compression (max 200px JPEG)
  compressImage(file, maxDimension, quality, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        callback(compressedDataUrl);
      };
      img.onerror = () => callback(e.target.result);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      this.compressImage(file, 200, 0.7, (compressedData) => {
        this.uploadedPhotoData = compressedData;
        document.getElementById('avatarPreview').src = this.uploadedPhotoData;
        this.validateStudentForm();
      });
    }
  },

  handleEditPhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      this.compressImage(file, 200, 0.7, (compressedData) => {
        this.editPhotoData = compressedData;
        document.getElementById('editAvatarPreview').src = this.editPhotoData;
      });
    }
  },

  validateStudentForm() {
    const name = document.getElementById('studentNameInput').value.trim();
    const grade = document.getElementById('studentGradeInput').value;
    const section = document.getElementById('studentSectionInput').value.trim();
    const photo = this.uploadedPhotoData;

    const saveBtn = document.getElementById('saveProfileBtn');
    const errorMsg = document.getElementById('setupErrorMsg');

    const isComplete = name.length > 0 && grade.length > 0 && section.length > 0 && photo != null;

    if (isComplete) {
      if (saveBtn) saveBtn.disabled = false;
      if (errorMsg) errorMsg.style.display = 'none';
    } else {
      if (saveBtn) saveBtn.disabled = true;
      if (errorMsg) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Identification Requirements Unsatisfied';
      }
    }
  },

  saveStudentProfile() {
    const name = document.getElementById('studentNameInput').value.trim();
    const grade = document.getElementById('studentGradeInput').value;
    const section = document.getElementById('studentSectionInput').value.trim();
    const uuid = DB.getUserUUID();

    const profile = {
      id: uuid,
      role: 'student',
      name: name,
      gradeLevel: grade,
      section: section,
      photo: this.uploadedPhotoData,
      totalPoints: 0,
      streak: 0,
      createdAt: new Date().toISOString()
    };

    DB.saveStudentProfile(profile);
    DB.saveUserUUID(uuid);
    App.updateUserHeader();
    App.showScreen('homeScreen');
  },

  async logout() {
    const client = this.getClient();
    if (client && client.auth) {
      try {
        await client.auth.signOut();
      } catch (e) {}
    }
    DB.clearSession();
    localStorage.removeItem(DB.STORAGE_TEACHER);
    App.updateUserHeader();
    App.showScreen('loginSelectionScreen');
  },

  logoutTeacher() {
    this.logout();
  },

  updateProfile() {
    const profile = DB.getStudentProfile() || {};
    profile.name = document.getElementById('editNameInput').value.trim();
    profile.gradeLevel = document.getElementById('editGradeInput').value;
    profile.section = document.getElementById('editSectionInput').value.trim();
    if (this.editPhotoData) {
      profile.photo = this.editPhotoData;
    }

    DB.saveStudentProfile(profile);
    App.updateUserHeader();
    alert('Profile updated successfully!');
    App.showScreen('settingsScreen');
  }
};
