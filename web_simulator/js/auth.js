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
      this.showError('Please fill out both Username and Password.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in... ⏳';

    try {
      const client = this.getClient();
      const db = this.getDB();
      let profile = null;

      if (client) {
        const internalEmail = this.formatInternalEmail(username);
        let authUser = null;
        let isRateLimited = false;

        if (client.auth) {
          try {
            const { data, error } = await client.auth.signInWithPassword({
              email: internalEmail,
              password: password
            });

            if (error) {
              if (error.message && (error.message.toLowerCase().includes('rate limit') || error.status === 429)) {
                isRateLimited = true;
                console.warn('Supabase auth rate limit hit, verifying account against profiles table.');
              } else {
                // Check if username exists in profiles for exact error messaging
                const { data: profCheck } = await client
                  .from('profiles')
                  .select('id, username')
                  .eq('username', username)
                  .maybeSingle();

                if (!profCheck) {
                  throw new Error(`Account with username "${username}" does not exist. Please check spelling or Sign Up.`);
                } else {
                  throw new Error('Incorrect password. Please try again.');
                }
              }
            } else if (data && data.user) {
              authUser = data.user;
            }
          } catch (e) {
            if (e.message && (e.message.includes('does not exist') || e.message.includes('Incorrect password'))) {
              throw e;
            }
            console.warn('Supabase sign-in exception:', e);
          }
        }

        if (authUser) {
          profile = db.fetchProfileFromSupabase ? await db.fetchProfileFromSupabase(authUser.id) : null;
          if (!profile) {
            const userRole = (authUser.user_metadata && authUser.user_metadata.role) ? authUser.user_metadata.role : 'student';
            const fullName = (authUser.user_metadata && authUser.user_metadata.full_name) ? authUser.user_metadata.full_name : username;
            profile = {
              id: authUser.id,
              role: userRole,
              name: fullName,
              full_name: fullName,
              username: username,
              createdAt: new Date().toISOString()
            };
          }
        } else {
          // Check profiles table directly by username
          const { data: dbProf } = await client
            .from('profiles')
            .select('*')
            .eq('username', username)
            .maybeSingle();

          if (dbProf) {
            profile = db.fetchProfileFromSupabase ? await db.fetchProfileFromSupabase(dbProf.id) : {
              id: dbProf.id,
              role: dbProf.role || 'student',
              name: dbProf.full_name || dbProf.name || username,
              full_name: dbProf.full_name || dbProf.name || username,
              username: dbProf.username || username,
              createdAt: dbProf.created_at || new Date().toISOString()
            };
          } else if (!isRateLimited) {
            throw new Error(`Account with username "${username}" does not exist. Please Sign Up.`);
          }
        }
      }

      // Fallback to local profile check if offline
      if (!profile) {
        const localProf = db.getStudentProfile ? db.getStudentProfile() : null;
        if (localProf && localProf.username && localProf.username.toLowerCase() === username) {
          profile = localProf;
        } else {
          throw new Error(`Account with username "${username}" does not exist. Please Sign Up.`);
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
    const fullName = document.getElementById('signUpFullName').value.trim();
    const username = document.getElementById('signUpUsername').value.trim().toLowerCase();
    const password = document.getElementById('signUpPassword').value;
    const role = this.selectedSignUpRole || 'student';
    const submitBtn = document.getElementById('signUpSubmitBtn');

    if (!fullName || !username || !password) {
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

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account... ⏳';

    try {
      const client = this.getClient();
      const db = this.getDB();
      let profile = null;

      if (client) {
        const internalEmail = this.formatInternalEmail(username);

        // 1. Check if user already exists in profiles table
        const { data: existingUser } = await client
          .from('profiles')
          .select('*')
          .eq('username', username)
          .maybeSingle();

        if (existingUser) {
          // Attempt sign in to existing account
          if (client.auth) {
            try {
              const { data: authData } = await client.auth.signInWithPassword({
                email: internalEmail,
                password: password
              });
              if (authData && authData.user) {
                profile = db.fetchProfileFromSupabase ? await db.fetchProfileFromSupabase(authData.user.id) : null;
              }
            } catch (_) {}
          }

          if (!profile) {
            profile = db.fetchProfileFromSupabase ? await db.fetchProfileFromSupabase(existingUser.id) : {
              id: existingUser.id,
              role: existingUser.role || role,
              name: existingUser.full_name || existingUser.name || fullName,
              full_name: existingUser.full_name || existingUser.name || fullName,
              username: username,
              photo: this.uploadedPhotoData || existingUser.photo_url || null,
              createdAt: existingUser.created_at || new Date().toISOString()
            };
          }
        } else {
          // 2. New account creation
          let createdUserId = null;

          if (client.auth) {
            try {
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

              if (data && data.user) {
                createdUserId = data.user.id;
                if (!data.session) {
                  try {
                    await client.auth.signInWithPassword({
                      email: internalEmail,
                      password: password
                    });
                  } catch (_) {}
                }
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
            full_name: fullName,
            username: username,
            photo: this.uploadedPhotoData || null,
            createdAt: new Date().toISOString()
          };

          try {
            await client.from('profiles').upsert({
              id: createdUserId,
              role: role,
              name: fullName,
              full_name: fullName,
              username: username,
              photo_url: (this.uploadedPhotoData && this.uploadedPhotoData.length < 50000) ? this.uploadedPhotoData : null,
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
          full_name: fullName,
          username: username,
          photo: this.uploadedPhotoData || null,
          createdAt: new Date().toISOString()
        };
      }

      if (profile && db && db.saveStudentProfile) {
        await db.saveStudentProfile(profile);
      }
      if (profile && db && db.saveUserUUID) {
        db.saveUserUUID(profile.id);
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
    const db = this.getDB();
    const profile = (db && db.getStudentProfile) ? db.getStudentProfile() || {} : {};
    const teacherStorageKey = (db && db.STORAGE_TEACHER) ? db.STORAGE_TEACHER : 'nexus_teacher_session';
    const teacherRaw = localStorage.getItem(teacherStorageKey);
    let teacher = null;
    if (teacherRaw) {
      try { teacher = JSON.parse(teacherRaw); } catch(e) {}
    }

    const editNameEl = document.getElementById('editNameInput');
    const editGradeEl = document.getElementById('editGradeInput');
    const editSectionEl = document.getElementById('editSectionInput');

    if (editNameEl && editNameEl.value.trim()) profile.name = editNameEl.value.trim();
    if (editGradeEl && editGradeEl.value) profile.gradeLevel = editGradeEl.value;
    if (editSectionEl && editSectionEl.value.trim()) profile.section = editSectionEl.value.trim();

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
