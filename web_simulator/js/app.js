/* ==========================================================================
   NEXUS APP & NAVIGATION CONTROLLER
   Manages screen switching, settings submenus, header stats & standalone frame toggle
   ========================================================================== */

const App = {
  init() {
    this.bindEvents();
    this.checkInitialAuth();
  },

  bindEvents() {
    document.getElementById('toggleFrameBtn').onclick = () => {
      document.body.classList.toggle('fullscreen-mode');
    };
  },

  checkInitialAuth() {
    const student = DB.getStudentProfile();
    const teacher = localStorage.getItem(DB.STORAGE_TEACHER);

    if (teacher) {
      Analytics.renderDashboard();
      this.showScreen('teacherDashboardScreen');
    } else if (student) {
      this.updateUserHeader();
      this.showScreen('homeScreen');
    } else {
      this.showScreen('loginSelectionScreen');
    }
  },

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }

    if (typeof Quiz !== 'undefined' && Quiz.hideAllModals) {
      Quiz.hideAllModals();
    }

    if (screenId === 'homeScreen') {
      this.updateUserHeader();
      if (typeof CharacterSystem !== 'undefined') {
        CharacterSystem.renderHomeCharacterCard();
      }
    }
  },

  updateUserHeader() {
    const profile = DB.getStudentProfile();
    const teacher = localStorage.getItem(DB.STORAGE_TEACHER);
    const badge = document.getElementById('userBadge');

    if (teacher) {
      badge.style.display = 'inline-block';
      badge.textContent = 'Teacher';
      return;
    }

    if (!profile) {
      badge.style.display = 'none';
      return;
    }

    badge.style.display = 'inline-block';
    badge.textContent = profile.gradeLevel || 'Student';

    document.getElementById('homeUserName').textContent = `Welcome, ${profile.name}!`;
    document.getElementById('homeUserSub').textContent = `${profile.gradeLevel} • Section ${profile.section}`;
    
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

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
