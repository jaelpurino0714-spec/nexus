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
    this.initBgm();
    this.checkInitialAuth();
  },

  initBgm() {
    this.playBgm();
    
    // Resume BGM when tab gains focus if active screen is teacherHomeScreen or homeScreen
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && (this.currentScreen === 'teacherHomeScreen' || this.currentScreen === 'homeScreen')) {
        this.playBgm();
      }
    });
  },

  playBgm() {
    const audio = document.getElementById('nexusBgmAudio');
    if (!audio) return;
    audio.loop = true;

    const savedVol = localStorage.getItem('nexus_bgm_vol');
    const volVal = savedVol !== null ? parseFloat(savedVol) : 0.5;
    audio.volume = volVal;

    const slider = document.getElementById('bgmVolSlider');
    const label = document.getElementById('bgmVolPercent');
    if (slider) slider.value = Math.round(volVal * 100);
    if (label) label.textContent = `${Math.round(volVal * 100)}%`;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this._removeAudioUnlockListeners();
      }).catch(() => {
        this._setupAudioUnlockListeners();
      });
    }
  },

  _setupAudioUnlockListeners() {
    if (this._hasAudioUnlockListeners) return;
    this._hasAudioUnlockListeners = true;

    const unlockHandler = () => {
      const audio = document.getElementById('nexusBgmAudio');
      if (audio) {
        audio.loop = true;
        audio.play().then(() => {
          this._removeAudioUnlockListeners();
        }).catch(() => {});
      }
    };

    this._unlockHandler = unlockHandler;
    const events = ['click', 'pointerdown', 'touchstart', 'keydown', 'mousedown'];
    events.forEach(evt => {
      window.addEventListener(evt, unlockHandler, { capture: true, passive: true });
    });
  },

  _removeAudioUnlockListeners() {
    if (!this._hasAudioUnlockListeners || !this._unlockHandler) return;
    const events = ['click', 'pointerdown', 'touchstart', 'keydown', 'mousedown'];
    events.forEach(evt => {
      window.removeEventListener(evt, this._unlockHandler, { capture: true, passive: true });
    });
    this._hasAudioUnlockListeners = false;
    this._unlockHandler = null;
  },

  timerVolume: parseFloat(localStorage.getItem('nexus_timer_vol') || '0.6'),
  isTimerMuted: localStorage.getItem('nexus_timer_muted') === 'true',
  sfxVolume: parseFloat(localStorage.getItem('nexus_sfx_vol') || '0.5'),
  isSfxMuted: localStorage.getItem('nexus_sfx_muted') === 'true',

  pauseBgm() {
    const audio = document.getElementById('nexusBgmAudio');
    if (audio) {
      try {
        audio.pause();
      } catch (_) {}
    }
  },

  toggleBgmModal() {
    const modal = document.getElementById('bgmModal');
    if (modal) {
      const isShowing = modal.style.display === 'flex';
      modal.style.display = isShowing ? 'none' : 'flex';
      if (!isShowing) {
        // Sync BGM controls
        const bgmAudio = document.getElementById('nexusBgmAudio');
        const bgmSlider = document.getElementById('bgmVolSlider');
        const bgmLabel = document.getElementById('bgmVolPercent');
        const bgmBtn = document.getElementById('bgmMuteBtn');
        const currentBgmVol = bgmAudio ? bgmAudio.volume : parseFloat(localStorage.getItem('nexus_bgm_vol') || '0.5');
        if (bgmSlider) bgmSlider.value = Math.round(currentBgmVol * 100);
        if (bgmLabel) bgmLabel.textContent = `${Math.round(currentBgmVol * 100)}%`;
        if (bgmBtn && bgmAudio) bgmBtn.textContent = bgmAudio.muted ? '🔊 Unmute' : '🔇 Mute';

        // Sync Timer controls
        const timerSlider = document.getElementById('timerVolSlider');
        const timerLabel = document.getElementById('timerVolPercent');
        const timerBtn = document.getElementById('timerMuteBtn');
        if (timerSlider) timerSlider.value = Math.round(this.timerVolume * 100);
        if (timerLabel) timerLabel.textContent = `${Math.round(this.timerVolume * 100)}%`;
        if (timerBtn) timerBtn.textContent = this.isTimerMuted ? '🔊 Unmute Timer' : '🔇 Mute Timer';

        // Sync SFX controls
        const sfxSlider = document.getElementById('sfxVolSlider');
        const sfxLabel = document.getElementById('sfxVolPercent');
        const sfxBtn = document.getElementById('sfxMuteBtn');
        if (sfxSlider) sfxSlider.value = Math.round(this.sfxVolume * 100);
        if (sfxLabel) sfxLabel.textContent = `${Math.round(this.sfxVolume * 100)}%`;
        if (sfxBtn) sfxBtn.textContent = this.isSfxMuted ? '🔊 Unmute SFX' : '🔇 Mute SFX';
      }
    }
  },

  setBgmVolume(val) {
    const audio = document.getElementById('nexusBgmAudio');
    const label = document.getElementById('bgmVolPercent');
    const vol = parseFloat(val) / 100.0;
    if (audio) audio.volume = vol;
    if (label) label.textContent = `${val}%`;
    localStorage.setItem('nexus_bgm_vol', vol.toString());
  },

  toggleBgmMute() {
    const audio = document.getElementById('nexusBgmAudio');
    const btn = document.getElementById('bgmMuteBtn');
    if (!audio) return;
    audio.muted = !audio.muted;
    if (btn) btn.textContent = audio.muted ? '🔊 Unmute' : '🔇 Mute';
  },

  setTimerVolume(val) {
    const vol = parseFloat(val) / 100.0;
    this.timerVolume = vol;
    if (vol > 0) this.isTimerMuted = false;
    const label = document.getElementById('timerVolPercent');
    if (label) label.textContent = `${val}%`;
    localStorage.setItem('nexus_timer_vol', vol.toString());
    const timerAudio = document.getElementById('nexusTimerAudio');
    if (timerAudio) {
      timerAudio.volume = this.timerVolume;
      timerAudio.muted = this.isTimerMuted;
    }
  },

  toggleTimerMute() {
    this.isTimerMuted = !this.isTimerMuted;
    const btn = document.getElementById('timerMuteBtn');
    if (btn) btn.textContent = this.isTimerMuted ? '🔊 Unmute Timer' : '🔇 Mute Timer';
    localStorage.setItem('nexus_timer_muted', this.isTimerMuted ? 'true' : 'false');
    const timerAudio = document.getElementById('nexusTimerAudio');
    if (timerAudio) timerAudio.muted = this.isTimerMuted;
  },

  setSfxVolume(val) {
    const vol = parseFloat(val) / 100.0;
    this.sfxVolume = vol;
    if (vol > 0) this.isSfxMuted = false;
    const label = document.getElementById('sfxVolPercent');
    if (label) label.textContent = `${val}%`;
    localStorage.setItem('nexus_sfx_vol', vol.toString());
  },

  toggleSfxMute() {
    this.isSfxMuted = !this.isSfxMuted;
    const btn = document.getElementById('sfxMuteBtn');
    if (btn) btn.textContent = this.isSfxMuted ? '🔊 Unmute SFX' : '🔇 Mute SFX';
    localStorage.setItem('nexus_sfx_muted', this.isSfxMuted ? 'true' : 'false');
  },

  playTimerAudio(durationSec = 20) {
    // 1. Pause background music while answering questions
    this.pauseBgm();

    if (this.isTimerMuted || this.timerVolume <= 0) return;
    const timerAudio = document.getElementById('nexusTimerAudio');

    if (timerAudio) {
      try {
        timerAudio.pause();
        const N = Math.max(3, parseFloat(durationSec) || 20);
        const tickingEnd = 26.8;

        if (N <= tickingEnd) {
          // Tests <= 30s: start at (26.8 - N) so the last N ticks play at normal 1.0x speed
          timerAudio.currentTime = Math.max(0, tickingEnd - N);
        } else {
          // Tests > 30s: start at 0.0s and loop the ticking section
          timerAudio.currentTime = 0;
        }

        timerAudio.playbackRate = 1.0; // Maintain natural speed (no speed shift)
        timerAudio.volume = this.timerVolume;
        timerAudio.muted = this.isTimerMuted;

        if (!this._timerTimeUpdateHandler) {
          this._timerTimeUpdateHandler = () => {
            const audio = document.getElementById('nexusTimerAudio');
            if (audio && !audio.paused && !this._isAlarmPlaying) {
              // If ticking section reaches 26.8s for tests > 30s, loop back to 0.0s
              if (audio.currentTime >= 26.8) {
                audio.currentTime = 0;
              }
            }
          };
          timerAudio.addEventListener('timeupdate', this._timerTimeUpdateHandler);
        }
        this._isAlarmPlaying = false;

        const playPromise = timerAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } catch (_) {}
    }
  },

  triggerRedScreenAlert() {
    const targets = [
      document.querySelector('.app-container'),
      document.getElementById('mainContent'),
      document.querySelector('.screen.active'),
      document.querySelector('.quiz-question-card'),
      document.getElementById('feedbackBanner'),
      document.body
    ];
    targets.forEach(el => {
      if (el) el.classList.add('screen-red-alert');
    });
  },

  clearRedScreenAlert() {
    document.querySelectorAll('.screen-red-alert').forEach(el => {
      el.classList.remove('screen-red-alert');
    });
  },

  playTimeoutAlarm() {
    this.triggerRedScreenAlert();

    if (this.isTimerMuted || this.timerVolume <= 0) return;
    const timerAudio = document.getElementById('nexusTimerAudio');
    if (timerAudio) {
      try {
        this._isAlarmPlaying = true;
        timerAudio.pause();
        const totalDuration = timerAudio.duration || 30.0;
        timerAudio.currentTime = Math.max(0, totalDuration - 3.2);
        timerAudio.playbackRate = 1.0;
        timerAudio.volume = this.timerVolume;
        timerAudio.muted = this.isTimerMuted;
        const playPromise = timerAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } catch (_) {}
    }
  },

  stopTimerAudio() {
    this._isAlarmPlaying = false;
    const timerAudio = document.getElementById('nexusTimerAudio');

    if (timerAudio) {
      try {
        timerAudio.pause();
        timerAudio.currentTime = 0;
      } catch (_) {}
    }
  },

  playClickSound() {
    if (this.isSfxMuted || this.sfxVolume <= 0) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._clickAudioCtx) {
        this._clickAudioCtx = new AudioCtx();
      }
      if (this._clickAudioCtx.state === 'suspended') {
        this._clickAudioCtx.resume().catch(() => {});
      }

      const osc = this._clickAudioCtx.createOscillator();
      const gain = this._clickAudioCtx.createGain();

      osc.type = 'sine';
      const now = this._clickAudioCtx.currentTime;
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

      const maxGain = 0.35 * this.sfxVolume;
      gain.gain.setValueAtTime(maxGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this._clickAudioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (_) {}
  },

  _tickState: 0,
  playTickSound() {
    const timerAudio = document.getElementById('nexusTimerAudio');
    if (timerAudio && !timerAudio.paused && !timerAudio.muted && this.timerVolume > 0) {
      // Timer clock MP3 is actively playing the tick audio; skip duplicate synth beep
      return;
    }

    if (this.isSfxMuted || this.sfxVolume <= 0) return;
    try {
      if (!this._tickAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this._tickAudioCtx = new AudioCtx();
      }
      if (this._tickAudioCtx && this._tickAudioCtx.state === 'suspended') {
        this._tickAudioCtx.resume().catch(() => {});
      }
      if (!this._tickAudioCtx) return;

      this._tickState = (this._tickState + 1) % 2;
      const isTock = (this._tickState === 1);

      const osc = this._tickAudioCtx.createOscillator();
      const gain = this._tickAudioCtx.createGain();

      osc.type = 'triangle';
      const now = this._tickAudioCtx.currentTime;
      const startFreq = isTock ? 900 : 1400;
      const endFreq = isTock ? 250 : 400;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.025);

      const maxGain = (isTock ? 0.28 : 0.35) * this.sfxVolume;
      gain.gain.setValueAtTime(maxGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(this._tickAudioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch (_) {}
  },

  playCorrectSound() {
    if (this.isSfxMuted || this.sfxVolume <= 0) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._sfxAudioCtx) {
        this._sfxAudioCtx = new AudioCtx();
      }
      if (this._sfxAudioCtx.state === 'suspended') {
        this._sfxAudioCtx.resume().catch(() => {});
      }
      const ctx = this._sfxAudioCtx;
      const now = ctx.currentTime;

      // Bright, cheerful 4-step ascending major chord chime (C5, E5, G5, C6)
      const notes = [
        { freq: 523.25, time: 0.00, duration: 0.12 },
        { freq: 659.25, time: 0.08, duration: 0.12 },
        { freq: 783.99, time: 0.16, duration: 0.20 },
        { freq: 1046.50, time: 0.24, duration: 0.30 }
      ];

      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        const vol = 0.35 * this.sfxVolume;
        gain.gain.setValueAtTime(vol, now + n.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.duration);
      });
    } catch (_) {}
  },

  playWrongSound() {
    if (this.isSfxMuted || this.sfxVolume <= 0) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._sfxAudioCtx) {
        this._sfxAudioCtx = new AudioCtx();
      }
      if (this._sfxAudioCtx.state === 'suspended') {
        this._sfxAudioCtx.resume().catch(() => {});
      }
      const ctx = this._sfxAudioCtx;
      const now = ctx.currentTime;

      // Distinct 2-step low pitch drop for Wrong Answer
      const tones = [
        { startFreq: 280, endFreq: 180, time: 0.00, duration: 0.15 },
        { startFreq: 190, endFreq: 120, time: 0.14, duration: 0.25 }
      ];

      tones.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(t.startFreq, now + t.time);
        osc.frequency.exponentialRampToValueAtTime(t.endFreq, now + t.time + t.duration);

        const vol = 0.22 * this.sfxVolume;
        gain.gain.setValueAtTime(vol, now + t.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t.time + t.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t.time);
        osc.stop(now + t.time + t.duration);
      });
    } catch (_) {}
  },

  playIncorrectSound() {
    this.playWrongSound();
  },

  bindEvents() {
    const toggleBtn = document.getElementById('toggleFrameBtn');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        document.body.classList.toggle('fullscreen-mode');
      };
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, [role="button"], input[type="button"], input[type="submit"], .primary-btn, .secondary-btn, .home-nav-btn, .term-btn, .topic-card, .teacher-action-btn, .icon-btn, .stat-pill, .role-card, .back-link, .logout-btn, .quiz-choice-btn, .quiz-nav-btn, .option-card, .avatar-wrapper, a.btn, .game-item-card button, .close-modal-btn');
      if (btn && !btn.disabled) {
        this.playClickSound();

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

    const teacherRaw = localStorage.getItem(DB.STORAGE_TEACHER);
    const studentRaw = localStorage.getItem(DB.STORAGE_PROFILE);

    if (teacherRaw) {
      this.updateUserHeader();
      this.showScreen('teacherHomeScreen');
    } else if (studentRaw) {
      this.updateUserHeader();
      this.showScreen('homeScreen');
    } else {
      this.showScreen('loginSelectionScreen');
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

    if (screenId === 'homeScreen' || screenId === 'teacherHomeScreen' || screenId === 'playScreen') {
      if (typeof Quiz !== 'undefined' && Quiz.customFlowType !== 'custom_play' && Quiz.customFlowType !== 'host_builtin' && Quiz.customFlowType !== 'host_custom') {
        Quiz.customFlowType = 'standard';
      }
    }

    const isAnsweringScreen = (
      screenId === 'gameplayScreen' ||
      screenId === 'quizQuestionScreen' ||
      screenId === 'mpPlayerGameScreen' ||
      screenId === 'mpHostGameScreen' ||
      screenId === 'mpPlayerQuestionScreen' ||
      screenId === 'mpHostQuestionScreen'
    );

    if (isAnsweringScreen) {
      this.pauseBgm();
    } else {
      this.clearRedScreenAlert();
      this.stopTimerAudio();
      this.playBgm();
    }

    this.currentScreen = screenId;

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }

    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      if (screenId === 'homeScreen' || screenId === 'teacherHomeScreen' || screenId === 'playScreen' || screenId === 'topicScreen') {
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

    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23DDD6FE'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236D28D9'>👤</text></svg>";

    if (teacher) {
      if (badge) {
        badge.style.display = 'inline-flex';
        badge.innerHTML = `<span>👩‍🏫</span> Teacher`;
      }
      const teacherTitle = document.getElementById('teacherHomeTitle');
      if (teacherTitle) teacherTitle.textContent = `Welcome, ${teacher.name}!`;

      const teacherPhoto = teacher.photo || teacher.photo_url || (profile ? (profile.photo || profile.photo_url) : null);
      const teacherAvatarEl = document.getElementById('teacherUserAvatar');
      if (teacherAvatarEl) {
        teacherAvatarEl.src = teacherPhoto || defaultAvatar;
      }
      return;
    }

    if (!profile) {
      if (badge) badge.style.display = 'none';
      return;
    }

    if (badge) {
      badge.style.display = 'inline-flex';
      const rawGrade = (profile.gradeLevel && profile.gradeLevel !== 'undefined') ? profile.gradeLevel : 'Grade 10';
      badge.innerHTML = `<span>🎓</span> ${rawGrade}`;
    }

    const nameVal = (profile.name && profile.name !== 'undefined' && profile.name.trim() !== '') ? profile.name : 'Student';
    const grade = (profile.gradeLevel && profile.gradeLevel !== 'undefined' && profile.gradeLevel.trim() !== '') ? profile.gradeLevel : 'Grade 10';
    const sectionVal = (profile.section && profile.section !== 'undefined' && profile.section.trim() !== '') ? profile.section : '';
    const subText = sectionVal ? `${grade} • Section ${sectionVal}` : `${grade} • Science`;
    
    const homeNameEl = document.getElementById('homeUserName');
    if (homeNameEl) homeNameEl.textContent = `Welcome, ${nameVal}!`;
    const homeSubEl = document.getElementById('homeUserSub');
    if (homeSubEl) homeSubEl.textContent = subText;
    
    const userPhoto = profile.photo || profile.photo_url;
    const homeAvatarEl = document.getElementById('homeUserAvatar');
    const editAvatarEl = document.getElementById('editAvatarPreview');
    const setupAvatarEl = document.getElementById('setupAvatarPreview');

    if (homeAvatarEl) homeAvatarEl.src = userPhoto || defaultAvatar;
    if (editAvatarEl) editAvatarEl.src = userPhoto || defaultAvatar;
    if (setupAvatarEl) setupAvatarEl.src = userPhoto || defaultAvatar;

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
  },

  showConfirmModal(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirm Action',
        message = 'Are you sure you want to proceed?',
        icon = '⚠️',
        confirmText = 'Yes, Proceed',
        cancelText = 'Cancel',
        danger = true
      } = options;

      let modal = document.getElementById('nexusGlobalConfirmModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'nexusGlobalConfirmModal';
        modal.className = 'modal-backdrop';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        modal.style.backdropFilter = 'blur(10px)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '999999';
        document.body.appendChild(modal);
      }

      const confirmBtnBg = danger 
        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' 
        : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)';
      const confirmBtnShadow = danger 
        ? '0 0 24px rgba(239, 68, 68, 0.5)' 
        : '0 0 24px rgba(139, 92, 246, 0.5)';

      const hasCancel = cancelText && cancelText.trim() !== '';

      modal.innerHTML = `
        <div class="modal-card" style="background: linear-gradient(135deg, rgba(22, 14, 45, 0.98) 0%, rgba(16, 10, 34, 0.98) 100%); border: 1.5px solid ${danger ? 'rgba(239, 68, 68, 0.5)' : 'rgba(139, 92, 246, 0.4)'}; border-radius: 24px; padding: 28px 24px; box-shadow: 0 10px 50px rgba(0,0,0,0.9), 0 0 30px ${danger ? 'rgba(239, 68, 68, 0.25)' : 'rgba(139, 92, 246, 0.2)'}; max-width: 420px; width: 88%; text-align: center; color: white; margin: auto; animation: popIn 0.2s ease-out;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: ${danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.15)'}; border: 2px solid ${danger ? 'rgba(239, 68, 68, 0.4)' : 'rgba(168, 85, 247, 0.4)'}; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px auto; box-shadow: ${confirmBtnShadow};">
            ${icon}
          </div>

          <h3 style="margin: 0 0 8px 0; color: #FFFFFF; font-weight: 800; font-size: 1.35rem; font-family: var(--font-heading);">${title}</h3>
          <p style="margin: 0 0 24px 0; color: #A5A3C4; font-size: 0.92rem; line-height: 1.5;">${message}</p>

          <div style="display: flex; gap: 12px; justify-content: center;">
            ${hasCancel ? `
              <button id="nexusConfirmCancelBtn" style="flex: 1; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #E9D5FF; font-weight: 700; font-size: 0.92rem; padding: 12px 18px; border-radius: 16px; cursor: pointer; transition: all 0.2s;">
                ${cancelText}
              </button>
            ` : ''}
            <button id="nexusConfirmOkBtn" style="flex: 1; background: ${confirmBtnBg}; border: none; color: #FFFFFF; font-weight: 800; font-size: 0.92rem; padding: 12px 18px; border-radius: 16px; cursor: pointer; box-shadow: ${confirmBtnShadow}; transition: all 0.2s;">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      modal.style.display = 'flex';
      modal.classList.remove('hidden');

      const closeModal = (result) => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        resolve(result);
      };

      const cancelBtn = document.getElementById('nexusConfirmCancelBtn');
      if (cancelBtn) cancelBtn.onclick = () => closeModal(false);
      
      const okBtn = document.getElementById('nexusConfirmOkBtn');
      if (okBtn) okBtn.onclick = () => closeModal(true);

      modal.onclick = (e) => {
        if (e.target === modal) closeModal(false);
      };
    });
  },

  confirm(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    return this.showConfirmModal(options);
  },

  showAlert(message, title = 'Notice', icon = 'ℹ️') {
    return this.showConfirmModal({
      title: title,
      message: message,
      icon: icon,
      confirmText: 'OK',
      cancelText: '',
      danger: false
    });
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
