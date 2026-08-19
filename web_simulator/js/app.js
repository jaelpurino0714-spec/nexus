/* ==========================================================================
   NEXUS APP & NAVIGATION CONTROLLER
   Manages screen switching, settings submenus, header stats & standalone frame toggle
   ========================================================================== */

const App = {
  get db() {
    if (typeof window !== 'undefined' && window.DB) return window.DB;
    if (typeof window !== 'undefined' && window.db) return window.db;
    return typeof DB !== 'undefined' ? DB : null;
  },
  get DB() {
    return this.db;
  },

  init() {
    this.bindEvents();
    this.checkInitialAuth();
  },

  bindEvents() {
    const toggleBtn = document.getElementById('toggleFrameBtn');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        document.body.classList.toggle('fullscreen-mode');
      };
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, [role="button"], .primary-btn, .secondary-btn, .home-nav-btn, .term-btn, .topic-card, .teacher-action-btn, .icon-btn, .stat-pill, .role-card, .back-link, .logout-btn, .quiz-choice-btn, .quiz-nav-btn, .option-card, .avatar-wrapper');
      if (btn && !btn.disabled) {
        btn.classList.remove('btn-clicked');
        void btn.offsetWidth;
        btn.classList.add('btn-clicked');
        setTimeout(() => btn.classList.remove('btn-clicked'), 220);
      }
    });
  },

  async checkInitialAuth() {
    if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.auth) {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
          const profile = await DB.fetchProfileFromSupabase(session.user.id);
          if (profile) {
            DB.safeSetItem(DB.STORAGE_PROFILE, JSON.stringify(profile));
            this.updateUserHeader();
            if (profile.role === 'teacher') {
              localStorage.setItem(DB.STORAGE_TEACHER, JSON.stringify(profile));
              this.showScreen('teacherHomeScreen');
            } else {
              localStorage.removeItem(DB.STORAGE_TEACHER);
              this.showScreen('homeScreen');
            }
            return;
          }
        }
      } catch (e) {
        console.warn('Supabase session check warning:', e);
      }
    }

    let student = DB.getStudentProfile();
    const teacherRaw = localStorage.getItem(DB.STORAGE_TEACHER);

    if (teacherRaw) {
      this.updateUserHeader();
      this.showScreen('teacherHomeScreen');
    } else {
      if (!student) {
        student = {
          id: DB.getUserUUID(),
          role: 'student',
          name: 'Nexus Student',
          gradeLevel: 'Grade 10',
          section: 'Science',
          photo: null,
          totalPoints: 0,
          streak: 0,
          createdAt: new Date().toISOString()
        };
        DB.saveStudentProfile(student);
      }
      this.updateUserHeader();
      this.showScreen('homeScreen');
    }
  },

  getHomeScreen() {
    const teacherRaw = localStorage.getItem(DB.STORAGE_TEACHER);
    return teacherRaw ? 'teacherHomeScreen' : 'homeScreen';
  },

  goHome() {
    this.showScreen(this.getHomeScreen());
  },

  showScreen(screenId) {
    if (screenId === 'homeScreen' && localStorage.getItem(DB.STORAGE_TEACHER)) {
      screenId = 'teacherHomeScreen';
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }

    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      if (screenId === 'homeScreen' || screenId === 'teacherHomeScreen') {
        appContainer.classList.add('student-home-active');
      } else {
        appContainer.classList.remove('student-home-active');
      }
    }

    if (typeof Quiz !== 'undefined' && Quiz.hideAllModals) {
      Quiz.hideAllModals();
    }

    if (typeof CharacterSystem !== 'undefined' && CharacterSystem.updateFloatingCompanion) {
      CharacterSystem.updateFloatingCompanion(screenId);
    }

    if (screenId === 'homeScreen' || screenId === 'teacherHomeScreen') {
      this.updateUserHeader();
      if (typeof CharacterSystem !== 'undefined') {
        CharacterSystem.renderHomeCharacterCard();
      }
    }
  },

  updateUserHeader() {
    const profile = DB.getStudentProfile();
    const teacherRaw = localStorage.getItem(DB.STORAGE_TEACHER);
    const badge = document.getElementById('userBadge');

    let teacher = null;
    if (teacherRaw) {
      try { teacher = JSON.parse(teacherRaw); } catch(e) {}
    }

    if (teacher) {
      if (badge) {
        badge.style.display = 'inline-block';
        badge.textContent = 'Teacher';
      }
      const teacherTitle = document.getElementById('teacherHomeTitle');
      if (teacherTitle) teacherTitle.textContent = `Welcome, ${teacher.name}!`;
      return;
    }

    if (!profile) {
      if (badge) badge.style.display = 'none';
      return;
    }

    if (badge) {
      badge.style.display = 'inline-block';
      badge.textContent = profile.gradeLevel || 'Student';
    }

    const nameVal = (profile.name && profile.name !== 'undefined' && profile.name.trim() !== '') ? profile.name : 'Student';
    const grade = (profile.gradeLevel && profile.gradeLevel !== 'undefined' && profile.gradeLevel.trim() !== '') ? profile.gradeLevel : 'Grade 10';
    const sectionVal = (profile.section && profile.section !== 'undefined' && profile.section.trim() !== '') ? profile.section : '';
    const subText = sectionVal ? `${grade} • Section ${sectionVal}` : `${grade} • Science`;
    
    document.getElementById('homeUserName').textContent = `Welcome, ${nameVal}!`;
    document.getElementById('homeUserSub').textContent = subText;
    
    if (profile.photo) {
      document.getElementById('homeUserAvatar').src = profile.photo;
      document.getElementById('editAvatarPreview').src = profile.photo;
    } else {
      const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23DDD6FE'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236D28D9'>👤</text></svg>";
      document.getElementById('homeUserAvatar').src = defaultAvatar;
      document.getElementById('editAvatarPreview').src = defaultAvatar;
    }

    // Update Quick Stats Pills
    document.getElementById('homeTotalPoints').textContent = (profile.totalPoints || 0).toLocaleString();
    document.getElementById('homeStreak').textContent = profile.streak || 0;
    
    const unlockedCount = DB.getUnlockedAchievements().length;
    document.getElementById('homeBadges').textContent = unlockedCount;

    const coins = profile.coins !== undefined ? profile.coins : 50;
    const coinsEl = document.getElementById('homeCoins');
    if (coinsEl) coinsEl.textContent = coins;
  },

  handleCustomPlayClick() {
    Quiz.showCustomHubModal();
  }
};

// Settings Sub-Menu Navigation
const Settings = {
  openSubMenu(subMenu) {
    if (subMenu === 'data') {
      this.renderDataStats();
      App.showScreen('settingsDataSubScreen');
    } else if (subMenu === 'profile') {
      const profile = DB.getStudentProfile() || {};
      document.getElementById('editNameInput').value = profile.name || '';
      document.getElementById('editGradeInput').value = profile.gradeLevel || 'Grade 10';
      document.getElementById('editSectionInput').value = profile.section || '';
      App.showScreen('settingsProfileSubScreen');
    } else if (subMenu === 'achievements') {
      Achievements.renderGrid();
      App.showScreen('settingsAchievementsSubScreen');
    }
  },

  renderDataStats() {
    const results = DB.getQuizResults();
    const profile = DB.getStudentProfile() || {};

    let avgScore = 0;
    let maxStreak = profile.streak || 0;

    if (results.length > 0) {
      const totalPct = results.reduce((sum, r) => sum + r.scorePct, 0);
      avgScore = Math.round(totalPct / results.length);
      maxStreak = results.reduce((max, r) => Math.max(max, r.maxStreak || 0), maxStreak);
    }

    document.getElementById('statsAvgScore').textContent = `${avgScore}%`;
    document.getElementById('statsHighestStreak').textContent = maxStreak;

    // Calculate accuracy per term
    [1, 2, 3].forEach(termNum => {
      const termResults = results.filter(r => r.term === termNum);
      let termAvg = 0;
      if (termResults.length > 0) {
        termAvg = Math.round(termResults.reduce((sum, r) => sum + r.scorePct, 0) / termResults.length);
      }
      document.getElementById(`accTerm${termNum}`).textContent = `${termAvg}%`;
      document.getElementById(`barTerm${termNum}`).style.width = `${termAvg}%`;
    });

    // Topic Accuracy List
    const topicContainer = document.getElementById('topicAccuracyList');
    topicContainer.innerHTML = '';

    const topicStats = {};
    results.forEach(r => {
      if (r.topicStats) {
        Object.keys(r.topicStats).forEach(t => {
          if (!topicStats[t]) topicStats[t] = { total: 0, correct: 0 };
          topicStats[t].total += r.topicStats[t].total;
          topicStats[t].correct += r.topicStats[t].correct;
        });
      }
    });

    const topics = Object.keys(topicStats);
    if (topics.length === 0) {
      topicContainer.innerHTML = `<p style="font-size:0.8rem; color:#757575;">No topic performance data yet. Play a game round to see stats!</p>`;
    } else {
      topics.forEach(topName => {
        const data = topicStats[topName];
        const pct = Math.round((data.correct / data.total) * 100);
        const div = document.createElement('div');
        div.className = 'acc-row';
        div.innerHTML = `
          <div class="acc-info"><span>${topName}</span> <b>${pct}%</b></div>
          <div class="bar-bg"><div class="bar-fill blue-fill" style="width: ${pct}%;"></div></div>
        `;
        topicContainer.appendChild(div);
      });
    }
  }
};

if (typeof window !== 'undefined') {
  window.App = App;
  window.app = App;
  if (typeof DB !== 'undefined') {
    App.db = DB;
    App.DB = DB;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
