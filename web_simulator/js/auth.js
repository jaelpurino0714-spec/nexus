/* ==========================================================================
   NEXUS AUTHENTICATION & PROFILE CONTROLLER
   Implements exact Student Profile Validation and Teacher Passcode flows
   ========================================================================== */

const Auth = {
  selectedRole: null,
  uploadedPhotoData: null,
  editPhotoData: null,

  // Step 1: Role Selection Popup
  selectRole(role) {
    this.selectedRole = role;
    if (role === 'student') {
      const existing = DB.getStudentProfile();
      if (existing) {
        // If student profile already setup previously, skip directly to Home
        App.showScreen('homeScreen');
      } else {
        App.showScreen('studentProfileSetupScreen');
        this.validateStudentForm();
      }
    } else if (role === 'teacher') {
      App.showScreen('teacherLoginScreen');
    }
  },

  // Handle Photo Upload in Student Setup
  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedPhotoData = e.target.result;
        document.getElementById('avatarPreview').src = this.uploadedPhotoData;
        this.validateStudentForm();
      };
      reader.readAsDataURL(file);
    }
  },

  handleEditPhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editPhotoData = e.target.result;
        document.getElementById('editAvatarPreview').src = this.editPhotoData;
      };
      reader.readAsDataURL(file);
    }
  },

  // PRD Page 6 Save Button Behavior Validation Rules:
  // Requires: Profile Photo, Name, Grade Level, Section
  // If missing: Save button disabled, warning text displayed above button.
  validateStudentForm() {
    const name = document.getElementById('studentNameInput').value.trim();
    const grade = document.getElementById('studentGradeInput').value;
    const section = document.getElementById('studentSectionInput').value.trim();
    const photo = this.uploadedPhotoData;

    const saveBtn = document.getElementById('saveProfileBtn');
    const errorMsg = document.getElementById('setupErrorMsg');

    const isComplete = name.length > 0 && grade.length > 0 && section.length > 0 && photo != null;

    if (isComplete) {
      saveBtn.disabled = false;
      errorMsg.style.display = 'none';
    } else {
      saveBtn.disabled = true;
      errorMsg.style.display = 'block';
      errorMsg.textContent = 'Identification Requirements Unsatisfied';
    }
  },

  saveStudentProfile() {
    const name = document.getElementById('studentNameInput').value.trim();
    const grade = document.getElementById('studentGradeInput').value;
    const section = document.getElementById('studentSectionInput').value.trim();
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'std-' + Date.now();

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

  // Teacher Login Passcode Validation against teacher_passcodes table
  async loginTeacher() {
    const name = document.getElementById('teacherNameInput').value.trim();
    const passcode = document.getElementById('teacherPasscodeInput').value.trim();
    const errorMsg = document.getElementById('teacherErrorMsg');

    if (name.length === 0) {
      errorMsg.style.display = 'block';
      errorMsg.textContent = 'Please enter teacher name';
      return;
    }

    const isValid = await DB.isValidPasscode(passcode);
    if (isValid) {
      errorMsg.style.display = 'none';
      const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'tch-' + Date.now();
      const teacherSession = {
        id: uuid,
        role: 'teacher',
        name: name,
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem(DB.STORAGE_TEACHER, JSON.stringify(teacherSession));
      DB.saveUserUUID(uuid);
      App.updateUserHeader();
      Analytics.renderDashboard();
      App.showScreen('teacherDashboardScreen');
    } else {
      errorMsg.style.display = 'block';
      errorMsg.textContent = 'Invalid Passcode';
    }
  },

  logout() {
    DB.clearSession();
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
