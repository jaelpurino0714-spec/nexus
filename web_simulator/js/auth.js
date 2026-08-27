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
      signInBtn.style.background = 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)';
      signInBtn.style.color = '#FFFFFF';
      signInBtn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      signInBtn.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.4)';
      signInBtn.style.fontWeight = '700';

      signUpBtn.style.background = 'transparent';
      signUpBtn.style.color = '#A5A3C4';
      signUpBtn.style.border = '1px solid transparent';
      signUpBtn.style.boxShadow = 'none';
      signUpBtn.style.fontWeight = '600';

      signInForm.style.display = 'block';
      signUpForm.style.display = 'none';
    } else {
      signUpBtn.style.background = 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)';
      signUpBtn.style.color = '#FFFFFF';
      signUpBtn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      signUpBtn.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.4)';
      signUpBtn.style.fontWeight = '700';

      signInBtn.style.background = 'transparent';
      signInBtn.style.color = '#A5A3C4';
      signInBtn.style.border = '1px solid transparent';
      signInBtn.style.boxShadow = 'none';
      signInBtn.style.fontWeight = '600';

      signUpForm.style.display = 'block';
      signInForm.style.display = 'none';
    }
  },

  setRole(role) {
    this.selectedSignUpRole = role;
    const btnStudent = document.getElementById('roleBtnStudent');
    const btnTeacher = document.getElementById('roleBtnTeacher');
    const studentContainer = document.getElementById('signUpStudentInfoContainer');
    const codeContainer = document.getElementById('signUpTeacherCodeContainer');
    const lblRealName = document.getElementById('lblSignUpRealName');

    if (role === 'student') {
      if (btnStudent) {
        btnStudent.style.background = 'rgba(124, 58, 237, 0.18)';
        btnStudent.style.border = '1.5px solid #8B5CF6';
        btnStudent.style.color = '#FFFFFF';
        btnStudent.style.boxShadow = '0 0 14px rgba(139, 92, 246, 0.25)';
      }
      if (btnTeacher) {
        btnTeacher.style.background = 'rgba(14, 15, 38, 0.6)';
        btnTeacher.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        btnTeacher.style.color = '#A5A3C4';
        btnTeacher.style.boxShadow = 'none';
      }
      if (studentContainer) studentContainer.style.display = 'block';
      if (codeContainer) codeContainer.style.display = 'none';
      if (lblRealName) lblRealName.textContent = 'Real Student Name';
      const sectionInput = document.getElementById('signUpSection');
      if (sectionInput) sectionInput.required = true;
      const teacherCodeInput = document.getElementById('signUpTeacherCode');
      if (teacherCodeInput) teacherCodeInput.required = false;
    } else {
      if (btnTeacher) {
        btnTeacher.style.background = 'rgba(234, 88, 12, 0.2)';
        btnTeacher.style.border = '1.5px solid #F97316';
        btnTeacher.style.color = '#FFFFFF';
        btnTeacher.style.boxShadow = '0 0 14px rgba(249, 115, 22, 0.3)';
      }
      if (btnStudent) {
        btnStudent.style.background = 'rgba(14, 15, 38, 0.6)';
        btnStudent.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        btnStudent.style.color = '#A5A3C4';
        btnStudent.style.boxShadow = 'none';
      }
      if (studentContainer) studentContainer.style.display = 'none';
      if (codeContainer) codeContainer.style.display = 'block';
      if (lblRealName) lblRealName.textContent = 'Real Teacher Name';
      const sectionInput = document.getElementById('signUpSection');
      if (sectionInput) sectionInput.required = false;
      const teacherCodeInput = document.getElementById('signUpTeacherCode');
      if (teacherCodeInput) teacherCodeInput.required = true;
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
    if (!msg) return;
    let cleanMsg = String(msg);
    if (cleanMsg.toLowerCase().includes('rate limit') || cleanMsg.includes('429')) {
      cleanMsg = 'Too many sign-in attempts. Please try again in a moment or double check your username and password.';
    }
    const banner = document.getElementById('authErrorBanner');
    if (banner) {
      banner.style.display = 'block';
      banner.textContent = cleanMsg;
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

  getDB() {
    if (typeof window !== 'undefined' && window.DB) return window.DB;
    if (typeof window !== 'undefined' && window.db) return window.db;
    if (typeof DB !== 'undefined') return DB;
    if (typeof db !== 'undefined') return db;
    if (typeof App !== 'undefined' && App.db) return App.db;
    if (typeof App !== 'undefined' && App.DB) return App.DB;
    if (typeof window !== 'undefined' && window.App && window.App.db) return window.App.db;
    return {
      fetchProfileFromSupabase: async () => null,
      saveStudentProfile: (p) => localStorage.setItem('nexus_student_profile', JSON.stringify(p)),
      safeSetItem: (k, v) => localStorage.setItem(k, v),
      saveUserUUID: (id) => localStorage.setItem('nexus_user_uuid', id),
      getUserUUID: () => 'usr-' + Date.now(),
      clearSession: () => localStorage.clear(),
      STORAGE_PROFILE: 'nexus_student_profile',
      STORAGE_TEACHER: 'nexus_teacher_session'
    };
  },

  async handleSignIn() {
    this.clearError();
    const username = document.getElementById('signInUsername').value.trim().toLowerCase();
    const password = document.getElementById('signInPassword').value;
    const submitBtn = document.getElementById('signInSubmitBtn');

    if (!username || !password) {
      this.showError('Please fill out both Login Identifier and Password.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in... ⏳';

    try {
      const client = this.getClient();
      const db = this.getDB();
      let profile = null;

      if (client) {
        // 1. First, check if the account exists in Supabase profiles table
        const { data: dbProf } = await client
          .from('profiles')
          .select('*')
          .or(`username.ilike.${username},nickname.ilike.${username},username.eq.${username},nickname.eq.${username}`)
          .maybeSingle();

        if (!dbProf) {
          throw new Error(`Account with Nickname "${username}" does not exist in Supabase. Please check spelling or Sign Up.`);
        }

        // 2. Account exists in Supabase! Determine actual username/nickname for auth email
        const targetUsername = dbProf.nickname || dbProf.username || username;
        const internalEmail = this.formatInternalEmail(targetUsername);

        // 3. Attempt Supabase Auth login
        if (client.auth) {
          try {
            const { data: authData, error: authErr } = await client.auth.signInWithPassword({
              email: internalEmail,
              password: password
            });

            if (!authErr && authData && authData.user) {
              profile = db.fetchProfileFromSupabase ? await db.fetchProfileFromSupabase(authData.user.id) : null;
            }
          } catch (e) {
            console.warn('Supabase Auth signIn exception:', e);
          }
        }

        // 4. If Supabase Auth didn't return session or failed password check, verify stored password in profile record
        if (!profile) {
          if (dbProf.password && dbProf.password !== password) {
            throw new Error('Incorrect password for this account. Please try again.');
          }
          profile = db.fetchProfileFromSupabase ? await db.fetchProfileFromSupabase(dbProf.id) : {
            id: dbProf.id,
            role: dbProf.role || 'student',
            name: dbProf.real_name || dbProf.full_name || dbProf.name || targetUsername,
            real_name: dbProf.real_name || dbProf.full_name || dbProf.name || targetUsername,
            full_name: dbProf.full_name || dbProf.real_name || dbProf.name || targetUsername,
            nickname: dbProf.nickname || dbProf.username || targetUsername,
            username: dbProf.username || dbProf.nickname || targetUsername,
            password: password,
            createdAt: dbProf.created_at || new Date().toISOString()
          };
        }
      }

      // 5. Offline / Local fallback if client was unavailable
      if (!profile) {
        const localProf = db.getStudentProfile ? db.getStudentProfile() : null;
        if (localProf && (localProf.username || localProf.nickname) &&
            (localProf.username.toLowerCase() === username || (localProf.nickname && localProf.nickname.toLowerCase() === username))) {
          if (localProf.password && localProf.password !== password) {
            throw new Error('Incorrect password for this account. Please try again.');
          }
          profile = localProf;
        } else {
          throw new Error(`Account with Nickname "${username}" does not exist. Please Sign Up.`);
        }
      }

      if (profile && db && db.saveStudentProfile) {
        await db.saveStudentProfile(profile);
      }
      if (profile && db && db.saveUserUUID) {
        db.saveUserUUID(profile.id);
      }

      if (typeof App !== 'undefined' && App.updateUserHeader) App.updateUserHeader();

      if (profile && profile.role === 'teacher') {
        localStorage.setItem((db ? db.STORAGE_TEACHER : null) || 'nexus_teacher_session', JSON.stringify(profile));
        if (typeof App !== 'undefined' && App.showScreen) App.showScreen('teacherHomeScreen');
      } else {
        localStorage.removeItem((db ? db.STORAGE_TEACHER : null) || 'nexus_teacher_session');
        if (typeof App !== 'undefined' && App.showScreen) App.showScreen('homeScreen');
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
    const fullName = (document.getElementById('signUpFullName')?.value || '').trim();
    const username = (document.getElementById('signUpUsername')?.value || '').trim().toLowerCase();
    const gradeLevel = (document.getElementById('signUpGradeLevel')?.value || 'Grade 10').trim();
    const section = (document.getElementById('signUpSection')?.value || '').trim();
    const teacherCode = (document.getElementById('signUpTeacherCode')?.value || '').trim();
    const password = document.getElementById('signUpPassword')?.value || '';
    const confirmPassword = document.getElementById('signUpConfirmPassword')?.value || '';
    const role = this.selectedSignUpRole || 'student';
    const submitBtn = document.getElementById('signUpSubmitBtn');

    if (!fullName) {
      this.showError(`Please enter your ${role === 'teacher' ? 'Real Teacher Name' : 'Real Student Name'}.`);
      return;
    }

    if (!username) {
      this.showError('Please enter a Nickname.');
      return;
    }

    if (username.length < 3) {
      this.showError('Nickname must be at least 3 characters.');
      return;
    }

    if (role === 'student' && !section) {
      this.showError('Please enter your Section (e.g. Einstein).');
      return;
    }

    if (role === 'teacher') {
      if (!teacherCode) {
        this.showError('Please enter a valid Teacher Code.');
        return;
      }
      const validCodes = ['NEXUS-TEACHER-2026', 'NEXUS2026', 'NEXUS10', '123456', 'TEACHER2026'];
      if (!validCodes.includes(teacherCode.toUpperCase())) {
        this.showError('Invalid Teacher Code. Please verify your code with school administration.');
        return;
      }
    }

    if (!password) {
      this.showError('Please enter a Password.');
      return;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters.');
      return;
    }

    if (!confirmPassword) {
      this.showError('Please rewrite your password in the Rewrite Password field.');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Password and Rewrite Password must match.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account... ⏳';
    }

    try {
      const client = this.getClient();
      const db = this.getDB();
      let profile = null;

      if (client) {
        const internalEmail = this.formatInternalEmail(username);

        // 1. Check if nickname/username already exists in profiles table
        const { data: existingUser } = await client
          .from('profiles')
          .select('*')
          .or(`username.ilike.${username},nickname.ilike.${username},username.eq.${username},nickname.eq.${username}`)
          .maybeSingle();

        if (existingUser) {
          if (existingUser.password && existingUser.password === password) {
            // Passwords match! Log in to existing account seamlessly
            profile = db.fetchProfileFromSupabase ? await db.fetchProfileFromSupabase(existingUser.id) : existingUser;
          } else {
            throw new Error(`An account with Nickname "${username}" already exists. Please Sign In or choose a different Nickname.`);
          }
        } else {
          // 2. New account creation
          let createdUserId = null;

          if (client.auth) {
            try {
              const { data } = await client.auth.signUp({
                email: internalEmail,
                password: password,
                options: {
                  data: {
                    real_name: fullName,
                    full_name: fullName,
                    nickname: username,
                    username: username,
                    role: role,
                    grade_level: gradeLevel,
                    section: section
                  }
                }
              });

              if (data && data.user) {
                createdUserId = data.user.id;
              }
            } catch (e) {
              console.warn('Supabase Auth signUp exception:', e);
            }
          }

          if (!createdUserId) {
            createdUserId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'usr-' + Date.now();
          }

          profile = {
            id: createdUserId,
            role: role,
            name: fullName,
            real_name: fullName,
            full_name: fullName,
            nickname: username,
            username: username,
            password: password,
            gradeLevel: gradeLevel,
            section: section,
            photo: this.uploadedPhotoData || null,
            streak: 0,
            current_streak: 0,
            longestStreak: 0,
            longest_streak: 0,
            totalPoints: 0,
            characterXP: 0,
            character_xp: 0,
            createdAt: new Date().toISOString()
          };

          try {
            await client.from('profiles').upsert({
              id: createdUserId,
              role: role,
              real_name: fullName,
              full_name: fullName,
              name: fullName,
              nickname: username,
              username: username,
              password: password,
              grade_level: gradeLevel,
              section: section,
              photo_url: (this.uploadedPhotoData && this.uploadedPhotoData.length < 50000) ? this.uploadedPhotoData : null,
              current_streak: 0,
              longest_streak: 0,
              character_xp: 0,
              total_points: 0,
              created_at: new Date().toISOString()
            });
          } catch (e) {
            console.warn('Profile table insert warning:', e);
          }
        }
      }

      if (!profile) {
        const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'usr-' + Date.now();
        profile = {
          id: uuid,
          role: role,
          name: fullName,
          real_name: fullName,
          full_name: fullName,
          nickname: username,
          username: username,
          gradeLevel: gradeLevel,
          section: section,
          photo: this.uploadedPhotoData || null,
          streak: 0,
          current_streak: 0,
          longestStreak: 0,
          longest_streak: 0,
          totalPoints: 0,
          characterXP: 0,
          character_xp: 0,
          createdAt: new Date().toISOString()
        };
      }

      if (profile && db) {
        if (db.resetUserData) {
          db.resetUserData(profile.id);
        } else if (db.clearSession) {
          db.clearSession();
        }
      }
      if (profile && db && db.saveUserUUID) {
        db.saveUserUUID(profile.id);
      }
      if (profile && db && db.saveStudentProfile) {
        await db.saveStudentProfile(profile);
      }

      if (typeof App !== 'undefined' && App.updateUserHeader) App.updateUserHeader();

      if (role === 'teacher') {
        localStorage.setItem((db ? db.STORAGE_TEACHER : null) || 'nexus_teacher_session', JSON.stringify(profile));
        if (typeof App !== 'undefined' && App.showScreen) App.showScreen('teacherHomeScreen');
      } else {
        localStorage.removeItem((db ? db.STORAGE_TEACHER : null) || 'nexus_teacher_session');
        if (typeof App !== 'undefined' && App.showScreen) App.showScreen('homeScreen');
      }
    } catch (err) {
      this.showError(err.message || 'Account creation failed.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account ✨';
      }
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
      this.compressImage(file, 150, 0.65, (compressedData) => {
        this.uploadedPhotoData = compressedData;
        document.querySelectorAll('#avatarPreview, #setupAvatarPreview, #editAvatarPreview, #homeUserAvatar, #teacherUserAvatar').forEach(img => {
          if (img) img.src = this.uploadedPhotoData;
        });
        this.validateStudentForm();
      });
    }
  },

  handleEditPhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      this.compressImage(file, 150, 0.65, (compressedData) => {
        this.editPhotoData = compressedData;
        document.querySelectorAll('#avatarPreview, #setupAvatarPreview, #editAvatarPreview, #homeUserAvatar, #teacherUserAvatar').forEach(img => {
          if (img) img.src = this.editPhotoData;
        });
      });
    }
  },

  validateStudentForm() {
    const nameInput = document.getElementById('studentNameInput');
    const gradeInput = document.getElementById('studentGradeInput');
    const sectionInput = document.getElementById('studentSectionInput');

    const name = nameInput ? nameInput.value.trim() : '';
    const grade = gradeInput ? gradeInput.value : 'Grade 10';
    const section = sectionInput ? sectionInput.value.trim() : '';
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
    const nameInput = document.getElementById('studentNameInput');
    const gradeInput = document.getElementById('studentGradeInput');
    const sectionInput = document.getElementById('studentSectionInput');

    const name = nameInput ? nameInput.value.trim() : 'Student';
    const grade = gradeInput ? gradeInput.value : 'Grade 10';
    const section = sectionInput ? sectionInput.value.trim() : '';
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

    if (DB.resetUserData) DB.resetUserData(uuid);
    DB.saveUserUUID(uuid);
    DB.saveStudentProfile(profile);
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
    const db = this.getDB();
    const profile = (db && db.getStudentProfile) ? db.getStudentProfile() || {} : {};
    const teacherStorageKey = (db && db.STORAGE_TEACHER) ? db.STORAGE_TEACHER : 'nexus_teacher_session';
    const teacherRaw = localStorage.getItem(teacherStorageKey);
    let teacher = null;
    if (teacherRaw) {
      try { teacher = JSON.parse(teacherRaw); } catch(e) {}
    }

    const isTeacher = profile.isTeacher || profile.role === 'teacher' || !!teacher;

    const editNameEl = document.getElementById('editNameInput');
    if (editNameEl && editNameEl.value.trim()) profile.name = editNameEl.value.trim();

    if (isTeacher) {
      delete profile.gradeLevel;
      delete profile.section;

      const editSubjectEl = document.getElementById('editSubjectInput');
      const editSchoolEl = document.getElementById('editSchoolInput');
      if (editSubjectEl) profile.subject = editSubjectEl.value;
      if (editSchoolEl) profile.school = editSchoolEl.value.trim();

      if (!teacher) teacher = { name: profile.name };
      teacher.name = profile.name;
      if (profile.subject) teacher.subject = profile.subject;
      if (profile.school) teacher.school = profile.school;
      if (this.editPhotoData) teacher.photo = this.editPhotoData;
      localStorage.setItem(teacherStorageKey, JSON.stringify(teacher));
    } else {
      const editGradeEl = document.getElementById('editGradeInput');
      const editSectionEl = document.getElementById('editSectionInput');
      if (editGradeEl && editGradeEl.value) profile.gradeLevel = editGradeEl.value;
      if (editSectionEl && editSectionEl.value.trim()) profile.section = editSectionEl.value.trim();
    }

    if (this.editPhotoData) {
      profile.photo = this.editPhotoData;
      if (teacher) {
        teacher.photo = this.editPhotoData;
        localStorage.setItem(teacherStorageKey, JSON.stringify(teacher));
      }
    }

    if (db && db.saveStudentProfile) {
      db.saveStudentProfile(profile);
    }

    const client = this.getClient();
    if (client && profile.id) {
      client.from('profiles').update({
        full_name: profile.name || profile.full_name,
        photo_url: profile.photo || null
      }).eq('id', profile.id).then(() => {}).catch(e => console.warn('Supabase profile update warning:', e));
    }

    if (typeof App !== 'undefined' && App.updateUserHeader) App.updateUserHeader();
    alert('Profile updated successfully!');
    if (typeof App !== 'undefined' && App.showScreen) {
      App.showScreen(App.getHomeScreen ? App.getHomeScreen() : 'homeScreen');
    }
  }
};

if (typeof window !== 'undefined') {
  window.Auth = Auth;
  window.auth = Auth;
}
