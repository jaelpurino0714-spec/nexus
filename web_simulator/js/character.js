/* ==========================================================================
   NEXUS INTERACTIVE CHARACTER EVOLUTION SYSTEM
   Three connected systems:
   1. TaskSystem: Activity detection, XP rewards, duplicate prevention
   2. ProgressionSystem: XP calculation, evolution stage thresholds, Supabase sync
   3. CharacterSystem: Baby Stage Screen/Card, interactions, reactions & evolution modal
   ========================================================================== */

const EVOLUTION_STAGES = [
  { 
    id: 'baby', 
    stage: 1, 
    title: 'BABY', 
    icon: '👶', 
    image: 'assets/mascot/baby_main.png',
    minXP: 0, 
    nextXP: 1000, 
    color: '#38BDF8', 
    defaultQuote: "Let's grow together!",
    desc: 'Focusing on earning 1000 XP to evolve into Student!' 
  },
  { 
    id: 'student', 
    stage: 2, 
    title: 'STUDENT', 
    icon: '🎒', 
    image: 'assets/mascot/student_main.png',
    minXP: 1000, 
    nextXP: 2000, 
    color: '#10B981', 
    defaultQuote: "Studying core Grade 10 concepts!",
    desc: 'Learning core Grade 10 Science topics!' 
  },
  { 
    id: 'graduate', 
    stage: 3, 
    title: 'SCIENTIST', 
    icon: '🧪', 
    image: 'assets/mascot/scientist_main.png',
    minXP: 2000, 
    nextXP: Infinity, 
    color: '#8B5CF6', 
    defaultQuote: "Exploring science & mastering trivia!",
    desc: 'Mastered science trivia & laboratory research!' 
  }
];

const GENDER_CHARACTER_IMAGES = {
  male: {
    baby: 'assets/mascot/baby_main.png',
    student: 'assets/mascot/student_main.png',
    graduate: 'assets/mascot/scientist_main.png'
  },
  female: {
    baby: 'assets/mascot/baby_main.png',
    student: 'assets/mascot/student_main.png',
    graduate: 'assets/mascot/scientist_main.png'
  }
};

const BABY_INTERACTION_REACTIONS = [
  "Yay! 👶",
  "Happy reaction! 👶",
  "Giggle giggle! 🧪",
  "Ready to learn with you! ⭐",
  "Every quiz makes me grow! 🚀",
  "Let's reach 1000 XP! 🎯"
];

const OUTFITS_CATALOG = [
  { id: 'default', name: 'Standard Uniform', icon: '🎒', desc: 'Classic Nexus student uniform', requiredStage: 1, priceCoins: 0 },
  { id: 'explorer', name: 'Explorer Gear', icon: '🤠', desc: 'Outdoor field research & exploration gear', requiredStage: 1, priceCoins: 40 },
  { id: 'lab_coat', name: 'Science Lab Coat', icon: '🥼', desc: 'Professional research & lab gear', requiredStage: 2, priceCoins: 50 },
  { id: 'astronaut', name: 'Astronaut Suit', icon: '👨‍🚀', desc: 'High-tech space exploration suit', requiredStage: 2, priceCoins: 120 },
  { id: 'academic', name: 'Academic Regalia', icon: '🎓', desc: 'Graduation gown and mortarboard', requiredStage: 3, priceCoins: 100 },
  { id: 'golden', name: 'Grandmaster Aura', icon: '👑', desc: 'Exclusive golden science master style', requiredStage: 4, priceCoins: 200 }
];

const STUDENT_INTERACTION_REACTIONS = [
  "Let's study! 🎒",
  "I can do this! ⚡",
  "Let's learn! 📚",
  "Almost there! 🎯",
  "Keep going! 🚀",
  "Studying Grade 10 concepts! 🧪"
];

const GRADUATE_INTERACTION_REACTIONS = [
  "One step closer! 🎓",
  "We did it! 🏆",
  "Keep going! 🚀",
  "Almost there! 🎯",
  "The next chapter awaits! ✨",
  "Mastering trivia & simulations! 🧪"
];

const ADULT_INTERACTION_REACTIONS = [
  "Let's keep going! 🔬",
  "We made it! 🏆",
  "Great work! ⭐",
  "Keep learning! 📚",
  "What's next? 🚀",
  "Science Grandmaster & Expert! 🌟"
];

// --------------------------------------------------------------------------
// 1. TASK SYSTEM
// --------------------------------------------------------------------------
const TaskSystem = {
  getCompletedTaskIds() {
    const raw = localStorage.getItem('nexus_completed_tasks');
    return raw ? JSON.parse(raw) : [];
  },

  isTaskCompleted(taskId) {
    const list = this.getCompletedTaskIds();
    return list.includes(taskId);
  },

  markTaskCompleted(taskId) {
    const list = this.getCompletedTaskIds();
    if (!list.includes(taskId)) {
      list.push(taskId);
      localStorage.setItem('nexus_completed_tasks', JSON.stringify(list));
    }
  },

  completeTask(taskId, taskName, xpAmount = 10) {
    if (this.isTaskCompleted(taskId)) {
      console.log(`Task [${taskId}] reward already given.`);
      return false;
    }

    this.markTaskCompleted(taskId);
    ProgressionSystem.addXP(xpAmount, taskName);
    return true;
  }
};

// --------------------------------------------------------------------------
// 2. PROGRESSION SYSTEM
// --------------------------------------------------------------------------
const ProgressionSystem = {
  getCurrentXP() {
    const profile = DB.getStudentProfile() || {};
    return profile.totalXP || 0;
  },

  getCoins() {
    const profile = DB.getStudentProfile() || {};
    return profile.coins !== undefined ? profile.coins : 50;
  },

  addCoins(amount) {
    const profile = DB.getStudentProfile() || { id: 'local_student', name: 'Student', totalXP: 0, coins: 50 };
    profile.coins = (profile.coins !== undefined ? profile.coins : 50) + amount;
    DB.saveStudentProfile(profile);
    if (typeof App !== 'undefined' && App.updateUserHeader) App.updateUserHeader();
    CharacterSystem.renderHomeCharacterCard();
  },

  getUnlockedOutfits() {
    const profile = DB.getStudentProfile() || {};
    return profile.unlockedOutfits || ['default'];
  },

  getActiveOutfit() {
    const profile = DB.getStudentProfile() || {};
    return profile.activeOutfit || 'default';
  },

  selectOutfit(outfitId) {
    const profile = DB.getStudentProfile() || {};
    profile.activeOutfit = outfitId;
    DB.saveStudentProfile(profile);
    CharacterSystem.renderHomeCharacterCard();
  },

  buyOutfit(outfitId) {
    const outfit = OUTFITS_CATALOG.find(o => o.id === outfitId);
    if (!outfit) return { success: false, message: 'Invalid outfit' };

    const profile = DB.getStudentProfile() || {};
    const unlocked = profile.unlockedOutfits || ['default'];

    if (unlocked.includes(outfitId)) {
      this.selectOutfit(outfitId);
      return { success: true, message: `Equipped ${outfit.name}!` };
    }

    const coins = profile.coins !== undefined ? profile.coins : 50;
    if (coins < outfit.priceCoins) {
      return { success: false, message: `Not enough Science Coins! (Need 🪙 ${outfit.priceCoins})` };
    }

    profile.coins = coins - outfit.priceCoins;
    profile.unlockedOutfits = [...unlocked, outfitId];
    profile.activeOutfit = outfitId;
    DB.saveStudentProfile(profile);

    if (typeof App !== 'undefined' && App.updateUserHeader) App.updateUserHeader();
    CharacterSystem.renderHomeCharacterCard();
    return { success: true, message: `Purchased & Equipped ${outfit.name}! 🎉` };
  },

  getStageForXP(xp) {
    if (xp >= 2000) return EVOLUTION_STAGES[2];
    if (xp >= 1000) return EVOLUTION_STAGES[1];
    return EVOLUTION_STAGES[0];
  },

  addXP(amount, reason = '') {
    const profile = DB.getStudentProfile() || { id: 'local_student', name: 'Student', totalXP: 0, evolutionStage: 'baby' };
    const oldXP = profile.totalXP || 0;
    const newXP = oldXP + amount;
    
    const oldStage = this.getStageForXP(oldXP);
    const newStage = this.getStageForXP(newXP);

    profile.totalXP = newXP;
    profile.evolutionStage = newStage.id;

    DB.saveStudentProfile(profile);

    // Show floating XP notification & character visual reaction
    CharacterSystem.showXPToast(amount, reason);
    CharacterSystem.triggerXPReaction(amount);

    // Update UI
    CharacterSystem.renderHomeCharacterCard();
    App.updateUserHeader();

    // Check Evolution Threshold
    if (newStage.stage > oldStage.stage) {
      setTimeout(() => {
        CharacterSystem.triggerEvolutionModal(oldStage, newStage, newXP);
      }, 600);
    }
  }
};



// --------------------------------------------------------------------------
// 3. CHARACTER SYSTEM
// --------------------------------------------------------------------------
const CharacterSystem = {
  _pendingEvolutionData: null,
  _selectedGender: null,
  _genderPromptShown: false,

  init() {
    this.renderHomeCharacterCard();
  },

  getStageImage(stage, gender) {
    const g = (gender === 'female') ? 'female' : 'male';
    return GENDER_CHARACTER_IMAGES[g][stage.id] || stage.image;
  },

  triggerGenderSelectionModal(oldStage, newStage, newXP, isExistingUser = false) {
    this._pendingEvolutionData = { oldStage, newStage, newXP, isExistingUser };
    this._selectedGender = null;
    
    const stage = newStage || oldStage || EVOLUTION_STAGES[0];
    const maleImg = this.getStageImage(stage, 'male');
    const femaleImg = this.getStageImage(stage, 'female');

    const maleImgEl = document.querySelector('#genderCardMale .gender-preview-img');
    const femaleImgEl = document.querySelector('#genderCardFemale .gender-preview-img');
    if (maleImgEl) maleImgEl.src = maleImg;
    if (femaleImgEl) femaleImgEl.src = femaleImg;

    const maleCard = document.getElementById('genderCardMale');
    const femaleCard = document.getElementById('genderCardFemale');
    const confirmBtn = document.getElementById('confirmGenderBtn');
    
    if (maleCard) maleCard.classList.remove('selected');
    if (femaleCard) femaleCard.classList.remove('selected');
    if (confirmBtn) confirmBtn.disabled = true;

    const modal = document.getElementById('genderSelectionModal');
    if (modal) modal.classList.remove('hidden');
  },

  selectGenderChoice(gender) {
    this._selectedGender = gender;
    const maleCard = document.getElementById('genderCardMale');
    const femaleCard = document.getElementById('genderCardFemale');
    const confirmBtn = document.getElementById('confirmGenderBtn');

    if (gender === 'male') {
      if (maleCard) maleCard.classList.add('selected');
      if (femaleCard) femaleCard.classList.remove('selected');
    } else {
      if (femaleCard) femaleCard.classList.add('selected');
      if (maleCard) maleCard.classList.remove('selected');
    }

    if (confirmBtn) confirmBtn.disabled = false;
  },

  confirmGenderSelection() {
    if (!this._selectedGender) return;

    const profile = DB.getStudentProfile() || {};
    profile.gender = this._selectedGender;
    DB.saveStudentProfile(profile);

    const modal = document.getElementById('genderSelectionModal');
    if (modal) modal.classList.add('hidden');

    const data = this._pendingEvolutionData;
    if (data) {
      if (data.isExistingUser) {
        this.renderHomeCharacterCard();
        App.updateUserHeader();
      } else {
        this.triggerEvolutionModal(data.oldStage, data.newStage, data.newXP);
      }
    } else {
      this.renderHomeCharacterCard();
    }
  },

  playCharacterMusic() {
    if (typeof App !== 'undefined' && App.pauseBgm) {
      App.pauseBgm();
    }

    let audio = document.getElementById('nexusCharacterAudio');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'nexusCharacterAudio';
      audio.src = 'assets/audio/AQP5EI3ZsvQ2ipg_SbQn0hCTc3K8C8drJdqbHLX-Y59JVt1l1ZtkJhBugu7mQuHoY8Pi9yoQxQR3xja0-Cho85q9gWQQ7eBreSCfF7jYpQ.mp3';
      audio.preload = 'auto';
      document.body.appendChild(audio);
    }

    audio.loop = true;

    const savedVol = localStorage.getItem('nexus_bgm_vol');
    const volVal = savedVol !== null ? parseFloat(savedVol) : 0.5;
    audio.volume = volVal;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Character music playback warning:', err);
      });
    }
  },

  stopCharacterMusic() {
    const audio = document.getElementById('nexusCharacterAudio');
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
    }

    if (typeof App !== 'undefined' && App.playBgm) {
      const currentScreen = App.currentScreen;
      const isAnsweringScreen = (
        currentScreen === 'gameplayScreen' ||
        currentScreen === 'quizQuestionScreen' ||
        currentScreen === 'mpPlayerGameScreen' ||
        currentScreen === 'mpHostGameScreen' ||
        currentScreen === 'mpPlayerQuestionScreen' ||
        currentScreen === 'mpHostQuestionScreen'
      );
      if (!isAnsweringScreen) {
        App.playBgm();
      }
    }
  },

  openCharacterModal() {
    let modal = document.getElementById('myCharacterPetModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'myCharacterPetModal';
      modal.className = 'pet-modal-overlay hidden';
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeCharacterModal();
        }
      });
      document.body.appendChild(modal);
    }
    this.renderCharacterModalContent();
    modal.classList.remove('hidden');
    this.playCharacterMusic();
  },

  closeCharacterModal() {
    const modal = document.getElementById('myCharacterPetModal');
    if (modal) modal.classList.add('hidden');
    this.stopCharacterMusic();
  },

  PET_BG_THEMES: {
    mint: { name: 'Mint Cyan', gradient: 'linear-gradient(185deg, #a7f3d0 0%, #ccfbf1 30%, #e0f2fe 65%, #f0fdf4 100%)', isDark: false },
    lavender: { name: 'Lavender Mist', gradient: 'linear-gradient(185deg, #e9d5ff 0%, #f3e8ff 30%, #fae8ff 65%, #faf5ff 100%)', isDark: false },
    sunset: { name: 'Sunset Peach', gradient: 'linear-gradient(185deg, #ffedd5 0%, #fed7aa 30%, #fee2e2 65%, #fff7ed 100%)', isDark: false },
    ocean: { name: 'Oceanic Blue', gradient: 'linear-gradient(185deg, #bae6fd 0%, #e0f2fe 30%, #dbeafe 65%, #f0f9ff 100%)', isDark: false },
    pink: { name: 'Pastel Pink', gradient: 'linear-gradient(185deg, #fbcfe8 0%, #fce7f3 30%, #ffe4e6 65%, #fff1f2 100%)', isDark: false },
    midnight: { name: 'Midnight Cyber', gradient: 'linear-gradient(185deg, #0f172a 0%, #1e1b4b 35%, #312e81 70%, #0f172a 100%)', isDark: true }
  },

  getPetBgStyle(themeSetting) {
    if (!themeSetting) return this.PET_BG_THEMES.mint.gradient;
    if (this.PET_BG_THEMES[themeSetting]) return this.PET_BG_THEMES[themeSetting].gradient;
    if (themeSetting.startsWith('#') || themeSetting.startsWith('linear-gradient')) return themeSetting;
    return this.PET_BG_THEMES.mint.gradient;
  },

  prevStage() {
    const xp = ProgressionSystem.getCurrentXP();
    const currentStage = ProgressionSystem.getStageForXP(xp);
    if (this._previewStageIndex === undefined) {
      this._previewStageIndex = currentStage.stage - 1;
    }
    this._previewStageIndex = Math.max(0, this._previewStageIndex - 1);
    this.renderCharacterModalContent();
  },

  nextStage() {
    const xp = ProgressionSystem.getCurrentXP();
    const currentStage = ProgressionSystem.getStageForXP(xp);
    if (this._previewStageIndex === undefined) {
      this._previewStageIndex = currentStage.stage - 1;
    }
    this._previewStageIndex = Math.min(EVOLUTION_STAGES.length - 1, this._previewStageIndex + 1);
    this.renderCharacterModalContent();
  },

  selectPreviewStage(index) {
    this._previewStageIndex = index;
    this.renderCharacterModalContent();
  },

  promptEditPetName() {
    const profile = DB.getStudentProfile() || {};
    const currentName = profile.petName || (profile.name ? `${profile.name}'s Learning Buddy` : 'baby aaica');
    const newName = prompt('Enter a name for your Learning Buddy:', currentName);
    if (newName && newName.trim() !== '') {
      profile.petName = newName.trim();
      DB.saveStudentProfile(profile);
      this.renderCharacterModalContent();
      this.renderHomeCharacterCard();
    }
  },

  renderCharacterModalContent() {
    const modal = document.getElementById('myCharacterPetModal');
    if (!modal) return;

    const xp = ProgressionSystem.getCurrentXP();
    const actualStage = ProgressionSystem.getStageForXP(xp);
    const profile = DB.getStudentProfile() || {};

    if (this._previewStageIndex === undefined) {
      this._previewStageIndex = actualStage.stage - 1;
    }

    const previewIndex = this._previewStageIndex;
    const stage = EVOLUTION_STAGES[previewIndex] || actualStage;
    const isLocked = (xp < stage.minXP);
    const isCurrent = (actualStage.id === stage.id);

    const gender = profile.gender || 'male';
    const stageImage = this.getStageImage(stage, gender);
    const petName = profile.petName || (stage.id === 'baby' ? 'baby aaica' : `${stage.title} Buddy`);

    const activeOutfitId = ProgressionSystem.getActiveOutfit();
    const activeOutfit = OUTFITS_CATALOG.find(o => o.id === activeOutfitId) || OUTFITS_CATALOG[0];

    const bgStyle = this.getPetBgStyle(profile.petBgTheme);

    let pct = 100;
    let nextReqText = `${xp} XP`;
    let untilNextText = 'More looks will be available soon ›';

    if (actualStage.nextXP !== Infinity) {
      const prevMin = actualStage.minXP;
      const currentLevelXP = xp - prevMin;
      const neededXP = actualStage.nextXP - prevMin;
      pct = Math.min(100, Math.max(5, Math.round((currentLevelXP / neededXP) * 100)));
      nextReqText = `${xp} / ${actualStage.nextXP}`;
      const diff = Math.max(0, actualStage.nextXP - xp);
      untilNextText = `${diff} XP until ${EVOLUTION_STAGES[actualStage.stage].title} Stage ›`;
    } else {
      nextReqText = `${xp} XP (MAX)`;
      pct = 100;
    }

    let dynamicQuote = stage.defaultQuote;
    if (isLocked) {
      dynamicQuote = `🔒 Locked • Unlocks at ${stage.minXP} XP`;
    } else if (isCurrent) {
      if (stage.id === 'baby') dynamicQuote = xp >= 700 ? "Almost ready to evolve! 👶" : "Let's grow together!";
      else if (stage.id === 'student') dynamicQuote = xp >= 1700 ? "Graduation is close! 🎓" : "Studying Grade 10 concepts!";
      else if (stage.id === 'graduate') dynamicQuote = "Mastering trivia & simulations! 🏆";
    } else {
      dynamicQuote = `Unlocked ${stage.title} Stage! 🎉`;
    }

    const isQuizDone = typeof TaskSystem !== 'undefined' && TaskSystem.isTaskCompleted(`quiz_complete_${new Date().toDateString()}`);
    const isHighScoreDone = typeof TaskSystem !== 'undefined' && TaskSystem.isTaskCompleted(`high_score_${new Date().toDateString()}`);

    modal.innerHTML = `
      <div class="pet-modal-card" style="background: ${bgStyle};">
        <!-- Top Bar -->
        <div class="pet-top-bar">
          <button class="pet-circle-icon-btn" onclick="CharacterSystem.closeCharacterModal()" title="Close">✕</button>
          <div class="pet-name-pill" onclick="CharacterSystem.promptEditPetName()">
            <span id="petNamePillLabel">${petName}</span>
            <button class="pet-name-edit-btn">✏️</button>
          </div>
          <button class="pet-circle-icon-btn" onclick="CharacterSystem.openPetSettingsModal()" title="Learning Buddy Settings & Theme">⚙️</button>
        </div>

        <!-- Big Counter & Header Avatars -->
        <div class="pet-hero-stats-row">
          <div class="pet-xp-big-counter">
            <span class="pet-xp-num">${xp}</span>
            <span class="pet-xp-label">XP</span>
          </div>
          <div class="pet-header-avatars">
            <div class="pet-header-avatar-badge">${stage.icon}</div>
          </div>
        </div>

        <!-- Character Stage & Cloud Pedestal -->
        <div class="pet-character-stage">
          <!-- Stage Selector Navigation Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 6px; padding: 0 6px;">
            <button class="pet-stage-nav-btn" onclick="CharacterSystem.prevStage()" ${previewIndex === 0 ? 'disabled' : ''} title="Previous Stage">‹</button>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 0.8rem; font-weight: 800; color: ${isLocked ? '#e11d48' : '#0284c7'}; background: rgba(255,255,255,0.85); padding: 4px 14px; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                ${isCurrent ? '✨ CURRENT' : (isLocked ? `🔒 LOCKED (${stage.minXP} XP)` : '✅ UNLOCKED')} • ${stage.title} (${previewIndex + 1}/${EVOLUTION_STAGES.length})
              </span>
            </div>
            <button class="pet-stage-nav-btn" onclick="CharacterSystem.nextStage()" ${previewIndex === EVOLUTION_STAGES.length - 1 ? 'disabled' : ''} title="Next Stage">›</button>
          </div>

          <!-- Character Avatar (With Gray Tint if Locked) -->
          <div class="pet-character-avatar" onclick="CharacterSystem.onTapCharacterModalPet()">
            <div class="pet-speech-bubble" id="modalPetSpeechBubble">${dynamicQuote}</div>
            ${stageImage 
              ? `<img src="${stageImage}" class="pet-char-img ${isLocked ? 'locked-gray-tint' : ''}" alt="${stage.title}" />` 
              : `<div class="${isLocked ? 'locked-gray-tint' : ''}" style="font-size: 8rem; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));">${stage.icon}</div>`
            }
          </div>

          <!-- 3D Cloud Platform (Positioned Below Character Feet) -->
          <div class="pet-cloud-platform">
            <div class="pet-cloud-puff pet-cloud-puff-1"></div>
            <div class="pet-cloud-puff pet-cloud-puff-2"></div>
            <div class="pet-cloud-puff pet-cloud-puff-3"></div>
            <span style="position: absolute; top: 10px; left: 28px; font-size: 0.9rem;">✨</span>
            <span style="position: absolute; bottom: 10px; right: 32px; font-size: 0.9rem;">⭐</span>
          </div>

          <!-- Stage Dots Indicator -->
          <div class="pet-stage-indicator-pills">
            ${EVOLUTION_STAGES.map((s, idx) => `
              <div class="pet-stage-dot ${idx === previewIndex ? 'active' : ''}" onclick="CharacterSystem.selectPreviewStage(${idx})" title="${s.title} Stage (${s.minXP} XP)"></div>
            `).join('')}
          </div>
        </div>

        <!-- Animated Candy-Stripe EXP Bar -->
        <div class="pet-exp-container">
          <div class="pet-exp-bar-outer">
            <div class="pet-exp-bar-fill" style="width: ${pct}%;"></div>
            <div class="pet-exp-bar-text">${nextReqText}</div>
          </div>
          <div class="pet-exp-subtitle">
            ${untilNextText}
          </div>
        </div>

        <!-- Bottom Action Cards -->
        <div class="pet-bottom-cards">

          <!-- Card 2: Grow Your Learning Buddy -->
          <div class="pet-info-card">
            <div class="pet-tasks-header">
              <span>Grow your Learning Buddy 🐾</span>
              <small style="color: #64748b; font-size: 0.78rem;">Daily Tasks</small>
            </div>

            <div class="pet-task-item">
              <div class="pet-task-left">
                <div class="pet-task-check ${isQuizDone ? 'completed' : ''}">${isQuizDone ? '✓' : '1'}</div>
                <div class="pet-task-info">
                  <span class="pet-task-title">Complete 1 Science Quiz</span>
                  <span class="pet-task-reward">+10 XP</span>
                </div>
              </div>
              <button class="pet-task-btn" onclick="CharacterSystem.closeCharacterModal(); App.showScreen('playScreen');">Go</button>
            </div>

            <div class="pet-task-item">
              <div class="pet-task-left">
                <div class="pet-task-check ${isHighScoreDone ? 'completed' : ''}">${isHighScoreDone ? '✓' : '2'}</div>
                <div class="pet-task-info">
                  <span class="pet-task-title">Score ≥80% on a Quiz</span>
                  <span class="pet-task-reward">+10 XP</span>
                </div>
              </div>
              <button class="pet-task-btn" onclick="CharacterSystem.closeCharacterModal(); App.showScreen('playScreen');">Go</button>
            </div>

            <div class="pet-task-item">
              <div class="pet-task-left">
                <div class="pet-task-check">3</div>
                <div class="pet-task-info">
                  <span class="pet-task-title">Perform Science Simulation</span>
                  <span class="pet-task-reward">+15 XP</span>
                </div>
              </div>
              <button class="pet-task-btn" onclick="CharacterSystem.closeCharacterModal(); Experiment.showTermSelection();">Go</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  onTapCharacterModalPet() {
    const bubble = document.getElementById('modalPetSpeechBubble');
    if (!bubble) return;
    const quotes = [
      "Yay! Let's learn Science! 🌟",
      "Feed me more XP! 😋",
      "I love doing experiments! 🧪",
      "Score 100% on the quiz! 💯",
      "Almost evolution time! 🚀"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    bubble.textContent = randomQuote;
    bubble.style.animation = 'none';
    setTimeout(() => { bubble.style.animation = 'popIn 0.3s ease-out'; }, 10);
  },

  openPetSettingsModal() {
    let modal = document.getElementById('petSettingsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'petSettingsModal';
      modal.className = 'pet-modal-overlay hidden';
      document.body.appendChild(modal);
    }
    this.renderPetSettingsModalContent();
    modal.classList.remove('hidden');
  },

  closePetSettingsModal() {
    const modal = document.getElementById('petSettingsModal');
    if (modal) modal.classList.add('hidden');
  },

  setPetBgTheme(themeKey, customValue = null) {
    const profile = DB.getStudentProfile() || {};
    const newTheme = customValue || themeKey;
    profile.petBgTheme = newTheme;
    
    // 1. Instant background update on DOM with zero re-rendering delay
    const bgStyle = this.getPetBgStyle(newTheme);
    const petCard = document.querySelector('#myCharacterPetModal .pet-modal-card');
    if (petCard) {
      petCard.style.background = bgStyle;
    }

    // 2. Instant active class update on theme swatches
    if (themeKey) {
      const swatches = document.querySelectorAll('.pet-theme-swatch');
      swatches.forEach(swatch => {
        const key = swatch.getAttribute('data-theme-key');
        if (key === themeKey) {
          swatch.classList.add('active');
        } else {
          swatch.classList.remove('active');
        }
      });
    }

    // 3. Save profile asynchronously
    DB.saveStudentProfile(profile);
    this.showSettingsSaveToast('Theme applied ✨');
  },

  setGenderChoiceFromSettings(gender) {
    const profile = DB.getStudentProfile() || {};
    profile.gender = gender;
    
    // 1. Save profile
    DB.saveStudentProfile(profile);

    // 2. Update character image & gender badges in DOM instantly
    const xp = ProgressionSystem.getCurrentXP();
    const actualStage = ProgressionSystem.getStageForXP(xp);
    if (this._previewStageIndex === undefined) this._previewStageIndex = actualStage.stage - 1;
    const stage = EVOLUTION_STAGES[this._previewStageIndex] || actualStage;
    
    const stageImg = this.getStageImage(stage, gender);
    const imgEl = document.querySelector('#myCharacterPetModal .pet-char-img');
    if (imgEl && stageImg) {
      imgEl.src = stageImg;
    }

    const genderBadgeEl = document.getElementById('petHeaderGenderBadge');
    if (genderBadgeEl) {
      genderBadgeEl.textContent = (gender === 'female' ? '👧' : '👦');
    }

    // 3. Update settings modal gender buttons style directly
    const maleBtn = document.getElementById('petSettingsMaleBtn');
    const femaleBtn = document.getElementById('petSettingsFemaleBtn');
    if (maleBtn && femaleBtn) {
      if (gender === 'male') {
        maleBtn.style.background = '#0284c7'; maleBtn.style.color = 'white';
        femaleBtn.style.background = '#e2e8f0'; femaleBtn.style.color = '#334155';
      } else {
        femaleBtn.style.background = '#ec4899'; femaleBtn.style.color = 'white';
        maleBtn.style.background = '#e2e8f0'; maleBtn.style.color = '#334155';
      }
    }

    this.renderHomeCharacterCard();
    this.showSettingsSaveToast('Gender updated! 👦👧');
  },

  savePetNameFromSettings(newName) {
    if (!newName || newName.trim() === '') return;
    const profile = DB.getStudentProfile() || {};
    const trimmed = newName.trim();
    if (profile.petName === trimmed) return;

    profile.petName = trimmed;
    DB.saveStudentProfile(profile);

    // Update name labels in DOM instantly without re-rendering modal
    const petNameLabel = document.getElementById('petNamePillLabel');
    if (petNameLabel) {
      petNameLabel.textContent = trimmed;
    }

    this.renderHomeCharacterCard();
    this.showSettingsSaveToast('Learning Buddy name saved! ✏️');
  },

  showSettingsSaveToast(msg = 'Saved!') {
    let toast = document.getElementById('petSettingsToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'petSettingsToast';
      toast.style.cssText = 'position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #0f172a; color: white; padding: 8px 18px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; box-shadow: 0 8px 20px rgba(0,0,0,0.25); z-index: 1200; transition: opacity 0.25s ease; opacity: 0; pointer-events: none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 1500);
  },

  renderPetSettingsModalContent() {
    const modal = document.getElementById('petSettingsModal');
    if (!modal) return;

    const profile = DB.getStudentProfile() || {};
    const currentTheme = profile.petBgTheme || 'mint';
    const currentGender = profile.gender || 'male';
    const currentPetName = profile.petName || 'baby aaica';

    let themesHtml = '';
    Object.keys(this.PET_BG_THEMES).forEach(key => {
      const theme = this.PET_BG_THEMES[key];
      const isActive = (currentTheme === key || currentTheme === theme.gradient);
      themesHtml += `
        <div class="pet-theme-swatch ${isActive ? 'active' : ''}" 
             data-theme-key="${key}"
             style="background: ${theme.gradient}; color: ${theme.isDark ? 'white' : '#0f172a'};"
             onclick="CharacterSystem.setPetBgTheme('${key}')">
          ${theme.name}
        </div>
      `;
    });

    const isCustomHex = currentTheme.startsWith('#');

    modal.innerHTML = `
      <div class="pet-settings-card">
        <div class="pet-settings-header">
          <span>⚙️ Learning Buddy Settings & Theme</span>
          <button class="close-modal-btn" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#666;" onclick="CharacterSystem.closePetSettingsModal()">✕</button>
        </div>

        <div>
          <div class="pet-settings-section-title">🎨 Background Highlight Theme</div>
          <div class="pet-themes-grid">
            ${themesHtml}
          </div>
          <div class="pet-custom-color-row" style="margin-top: 10px;">
            <span style="font-size: 0.88rem; font-weight: 700; color: #334155;">Custom Color Highlight</span>
            <input type="color" class="pet-custom-color-input" value="${isCustomHex ? currentTheme : '#a7f3d0'}"
                   oninput="CharacterSystem.setPetBgTheme(null, this.value)"
                   onchange="CharacterSystem.setPetBgTheme(null, this.value)" />
          </div>
        </div>

        <div>
          <div class="pet-settings-section-title">👦👧 Character Gender Model</div>
          <div style="display: flex; gap: 10px;">
            <button id="petSettingsMaleBtn" class="primary-btn btn-sm" 
                    style="flex: 1; background: ${currentGender === 'male' ? '#0284c7' : '#e2e8f0'}; color: ${currentGender === 'male' ? 'white' : '#334155'};"
                    onclick="CharacterSystem.setGenderChoiceFromSettings('male')">
              👦 Male
            </button>
            <button id="petSettingsFemaleBtn" class="primary-btn btn-sm" 
                    style="flex: 1; background: ${currentGender === 'female' ? '#ec4899' : '#e2e8f0'}; color: ${currentGender === 'female' ? 'white' : '#334155'};"
                    onclick="CharacterSystem.setGenderChoiceFromSettings('female')">
              👧 Female
            </button>
          </div>
        </div>

        <div>
          <div class="pet-settings-section-title">✏️ Learning Buddy Name</div>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="petNameSettingInput" value="${currentPetName.replace('✏️', '').trim()}"
                   oninput="CharacterSystem.savePetNameFromSettings(this.value)"
                   onkeyup="if(event.key==='Enter') this.blur()"
                   style="flex: 1; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 14px; font-weight: 700;" placeholder="Learning Buddy name..." />
          </div>
        </div>
      </div>
    `;
  },

  renderHomeCharacterCard() {
    const container = document.getElementById('homeCharacterCard');
    if (!container) return;

    const xp = ProgressionSystem.getCurrentXP();
    const stage = ProgressionSystem.getStageForXP(xp);
    const profile = DB.getStudentProfile() || {};

    // For existing users with no gender set yet
    if (!profile.gender && !this._genderPromptShown) {
      this._genderPromptShown = true;
      const oldStage = EVOLUTION_STAGES[0];
      this.triggerGenderSelectionModal(oldStage, stage, xp, true);
    }

    const gender = profile.gender || 'male';
    const stageImage = this.getStageImage(stage, gender);

    const isBaby = (stage.id === 'baby');
    const isStudent = (stage.id === 'student');
    const isGraduate = (stage.id === 'graduate');
    const isAdult = (stage.id === 'worker' || stage.id === 'adult');
    
    let dynamicQuote = stage.defaultQuote;
    if (isBaby) {
      if (xp >= 700) dynamicQuote = "Almost ready to evolve! 👶";
      else dynamicQuote = "Let's grow together!";
    } else if (isStudent) {
      if (xp >= 1700) dynamicQuote = "Graduation is close! 🎓";
      else dynamicQuote = "Studying core Grade 10 concepts!";
    } else if (isGraduate) {
      dynamicQuote = "Mastering trivia & simulations!";
    }

    let nextReqText = '';
    let untilNextText = '';
    let pct = 100;

    if (stage.nextXP !== Infinity) {
      const prevMin = stage.minXP;
      const currentLevelXP = xp - prevMin;
      const neededXP = stage.nextXP - prevMin;
      pct = Math.min(100, Math.round((currentLevelXP / neededXP) * 100));
      nextReqText = `${xp} / ${stage.nextXP} XP`;
      
      const diff = Math.max(0, stage.nextXP - xp);
      untilNextText = `${diff} XP until ${EVOLUTION_STAGES[stage.stage].title}`;
    } else {
      nextReqText = `${xp} XP`;
      untilNextText = `🏆 FINAL STAGE`;
      pct = 100;
    }

    let avatarHtml = '';
    if (stageImage) {
      avatarHtml = `
        <div class="baby-avatar-wrapper" onclick="CharacterSystem.onTapCharacter()" title="Tap character to interact!">
          <div class="char-speech-bubble hidden" id="charSpeechBubble">${dynamicQuote}</div>
          <img src="${stageImage}" class="baby-char-img bounce-anim" alt="${stage.title} Character" />
        </div>
      `;
    } else {
      avatarHtml = `
        <div class="char-avatar-section" onclick="CharacterSystem.onTapCharacter()" title="Tap character to interact!">
          <div class="char-speech-bubble hidden" id="charSpeechBubble">${dynamicQuote}</div>
          <div class="char-avatar-icon bounce-anim">${stage.icon}</div>
        </div>
      `;
    }

    const genderBadge = (!isBaby && profile.gender) 
      ? (profile.gender === 'female' ? ' 👧' : ' 👦') 
      : '';

    const coins = ProgressionSystem.getCoins();
    const activeOutfitId = ProgressionSystem.getActiveOutfit();
    const activeOutfit = OUTFITS_CATALOG.find(o => o.id === activeOutfitId) || OUTFITS_CATALOG[0];

    container.innerHTML = `
      <div class="character-evolution-box ${isBaby ? 'baby-stage-card' : ''} ${isStudent ? 'student-stage-card' : ''} ${isGraduate ? 'graduate-stage-card' : ''} ${isAdult ? 'adult-stage-card' : ''}" style="border-color: ${stage.color};">
        <div class="char-card-header">
          <span class="char-header-title">MY CHARACTER (${activeOutfit.icon} ${activeOutfit.name})</span>
          <span class="char-stage-badge" style="background: ${stage.color};">${stage.icon} ${stage.title}${genderBadge}</span>
        </div>

        <div class="char-card-body">
          ${avatarHtml}

          <div class="mascot-actions-bar">
            <button class="mascot-action-btn" style="background: #d97706;" onclick="CharacterSystem.triggerAction('wave')">👋 Wave</button>
            <button class="mascot-action-btn" style="background: #0891b2;" onclick="CharacterSystem.triggerAction('look_around')">👀 Look Around</button>
            <button class="mascot-action-btn" style="background: #7c3aed;" onclick="CharacterSystem.triggerAction('blink')">😉 Blink</button>
            <button class="mascot-action-btn" style="background: #db2777;" onclick="CharacterSystem.triggerAction('celebrate')">🎉 Cheer</button>
            <button class="mascot-action-btn" style="background: #2563eb;" onclick="CharacterSystem.triggerAction('spin')">🌀 Spin</button>
            <button class="mascot-action-btn" style="background: #059669;" onclick="CharacterSystem.triggerAction('expression')">😊 Expression</button>
          </div>

          <div class="char-quote-label">"${dynamicQuote}"</div>

          <div class="char-xp-hero-badge">⭐ ${xp} XP &nbsp;•&nbsp; 🪙 ${coins} Coins</div>

          <div class="char-progress-bar-container">
            <div class="char-progress-fill" style="width: ${pct}%; background: ${stage.color};"></div>
          </div>
          <div class="char-progress-sub-row">
            <span>${isAdult ? '⭐ ' + xp + ' XP' : nextReqText}</span>
            <span style="font-weight: 800; color: ${stage.color};">${isAdult ? '🏆 FINAL STAGE COMPLETE' : untilNextText}</span>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="earn-more-xp-btn" style="flex: 1;" onclick="App.showScreen('playScreen')">
              🚀 EARN XP
            </button>
            <button class="earn-more-xp-btn" style="flex: 1; background: #8b5cf6;" onclick="CharacterSystem.openOutfitShopModal()">
              👕 OUTFITS SHOP
            </button>
          </div>
        </div>
      </div>
    `;
    this.startIdleAnimations();
  },

  openOutfitShopModal(activeTab = 'wardrobe') {
    let modal = document.getElementById('outfitShopModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'outfitShopModal';
      modal.className = 'modal-overlay hidden';
      document.body.appendChild(modal);
    }
    
    this.renderOutfitShopModal(activeTab);
    modal.classList.remove('hidden');
  },

  closeOutfitShopModal() {
    const modal = document.getElementById('outfitShopModal');
    if (modal) modal.classList.add('hidden');
  },

  renderOutfitShopModal(activeTab = 'wardrobe') {
    const modal = document.getElementById('outfitShopModal');
    if (!modal) return;

    const coins = ProgressionSystem.getCoins();
    const unlocked = ProgressionSystem.getUnlockedOutfits();
    const activeOutfitId = ProgressionSystem.getActiveOutfit();
    const xp = ProgressionSystem.getCurrentXP();
    const stage = ProgressionSystem.getStageForXP(xp);
    const profile = DB.getStudentProfile() || {};
    const gender = profile.gender || 'male';
    const stageImage = this.getStageImage(stage, gender);

    const activeOutfit = OUTFITS_CATALOG.find(o => o.id === activeOutfitId) || OUTFITS_CATALOG[0];

    let itemsHtml = '';
    OUTFITS_CATALOG.forEach(outfit => {
      const isUnlockedByStage = stage.stage >= outfit.requiredStage;
      const isUnlockedByPurchase = unlocked.includes(outfit.id);
      const isOwned = isUnlockedByStage || isUnlockedByPurchase;
      const isEquipped = activeOutfitId === outfit.id;

      if (activeTab === 'wardrobe' && !isOwned) return;

      let actionBtn = '';
      if (isEquipped) {
        actionBtn = `<span class="badge-equipped">✓ Active</span>`;
      } else if (isOwned) {
        actionBtn = `<button class="secondary-btn btn-sm" onclick="CharacterSystem.equipOutfitAction('${outfit.id}')">Equip</button>`;
      } else {
        actionBtn = `<button class="primary-btn btn-sm" style="background: #d97706;" onclick="CharacterSystem.buyOutfitAction('${outfit.id}')">Buy 🪙${outfit.priceCoins}</button>`;
      }

      itemsHtml += `
        <div class="outfit-item-card ${isEquipped ? 'equipped' : ''} ${isOwned ? 'owned' : 'locked'}">
          <div class="outfit-icon">${outfit.icon}</div>
          <div class="outfit-info">
            <div class="outfit-title">
              <strong>${outfit.name}</strong>
              ${!isOwned && outfit.priceCoins > 0 ? `<span class="price-pill">🪙 ${outfit.priceCoins}</span>` : ''}
            </div>
            <div class="outfit-desc">${isOwned ? outfit.desc : `${outfit.desc} (Stage ${outfit.requiredStage} or 🪙 ${outfit.priceCoins})`}</div>
          </div>
          <div class="outfit-action">${actionBtn}</div>
        </div>
      `;
    });

    if (activeTab === 'wardrobe' && !itemsHtml.trim()) {
      itemsHtml = `<div class="empty-wardrobe-msg">No extra outfits owned yet! Click <b>🛍️ Outfit Shop</b> to buy outfits with Science Coins.</div>`;
    }

    modal.innerHTML = `
      <div class="modal-card outfit-shop-card">
        <div class="modal-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div class="modal-title-group" style="display: flex; align-items: center; gap: 6px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: #4c1d95;">👕 Learning Buddy Outfits Shop</h3>
          </div>
          <div class="header-right-group" style="display: flex; align-items: center; gap: 8px;">
            <div class="coin-balance-pill" style="background: #fef08a; border: 1px solid #facc15; padding: 4px 10px; border-radius: 12px; font-weight: 800; color: #854d0e; font-size: 0.88rem;">🪙 ${coins} Coins</div>
            <button class="close-modal-btn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #666;" onclick="CharacterSystem.closeOutfitShopModal()">✕</button>
          </div>
        </div>

        <div class="outfit-preview-banner" style="background: #f3e8ff; border: 1px solid #ddd6fe; border-radius: 16px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div class="mini-avatar-box" style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
            ${stageImage ? `<img src="${stageImage}" style="width: 40px; height: 40px; object-fit: contain;" />` : `<span>${stage.icon}</span>`}
          </div>
          <div class="preview-text" style="display: flex; flex-direction: column;">
            <strong style="color: #5b21b6; font-size: 0.9rem;">Equipped: ${activeOutfit.icon} ${activeOutfit.name}</strong>
            <small style="color: #666; font-size: 0.78rem;">Earn +5 XP for every correct quiz answer!</small>
          </div>
        </div>

        <div class="modal-tabs" style="display: flex; gap: 6px; background: #eee; padding: 4px; border-radius: 12px; margin-bottom: 12px;">
          <button class="tab-btn ${activeTab === 'wardrobe' ? 'active' : ''}" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; background: ${activeTab === 'wardrobe' ? '#673ab7' : 'transparent'}; color: ${activeTab === 'wardrobe' ? 'white' : '#555'};" onclick="CharacterSystem.renderOutfitShopModal('wardrobe')">🎒 My Wardrobe</button>
          <button class="tab-btn ${activeTab === 'shop' ? 'active' : ''}" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; background: ${activeTab === 'shop' ? '#673ab7' : 'transparent'}; color: ${activeTab === 'shop' ? 'white' : '#555'};" onclick="CharacterSystem.renderOutfitShopModal('shop')">🛍️ Outfit Shop</button>
        </div>

        <div class="outfits-list-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto;">
          ${itemsHtml}
        </div>
      </div>
    `;
  },

  equipOutfitAction(outfitId) {
    ProgressionSystem.selectOutfit(outfitId);
    this.renderOutfitShopModal('wardrobe');
  },

  buyOutfitAction(outfitId) {
    const res = ProgressionSystem.buyOutfit(outfitId);
    alert(res.message);
    this.renderOutfitShopModal('shop');
  },

  onTapCharacter() {
    const bubble = document.getElementById('webFloatingSpeech');
    const avatar = document.getElementById('webFloatingAvatar');

    const xp = ProgressionSystem.getCurrentXP();
    const stage = ProgressionSystem.getStageForXP(xp);

    let msg = "";
    if (stage.id === 'adult') {
      msg = ADULT_INTERACTION_REACTIONS[Math.floor(Math.random() * ADULT_INTERACTION_REACTIONS.length)];
    } else if (stage.id === 'graduate') {
      if (xp >= 550) {
        msg = "Almost at the final stage! 🧑";
      } else {
        msg = GRADUATE_INTERACTION_REACTIONS[Math.floor(Math.random() * GRADUATE_INTERACTION_REACTIONS.length)];
      }
    } else if (stage.id === 'student') {
      if (xp >= 270) {
        msg = "Graduation is close! 🎓";
      } else {
        msg = STUDENT_INTERACTION_REACTIONS[Math.floor(Math.random() * STUDENT_INTERACTION_REACTIONS.length)];
      }
    } else if (stage.id === 'baby') {
      if (xp >= 70) {
        msg = "I'm growing! 👶";
      } else {
        msg = BABY_INTERACTION_REACTIONS[Math.floor(Math.random() * BABY_INTERACTION_REACTIONS.length)];
      }
    } else {
      msg = stage.defaultQuote;
    }

    if (bubble) {
      bubble.textContent = msg;
      bubble.classList.remove('hidden');
    }

    if (avatar) {
      avatar.classList.remove('tap-react');
      void avatar.offsetWidth;
      avatar.classList.add('tap-react');
      setTimeout(() => avatar.classList.remove('tap-react'), 450);
    }

    if (this._bubbleTimer) clearTimeout(this._bubbleTimer);
    this._bubbleTimer = setTimeout(() => {
      if (bubble) bubble.classList.add('hidden');
    }, 2500);
  },

  triggerXPReaction(amount) {
    const bubble = document.getElementById('webFloatingSpeech');
    const avatar = document.getElementById('webFloatingAvatar');

    if (avatar) {
      avatar.classList.remove('tap-react');
      void avatar.offsetWidth;
      avatar.classList.add('tap-react');
      setTimeout(() => avatar.classList.remove('tap-react'), 450);
    }

    if (bubble) {
      bubble.textContent = `+${amount} XP! 🎉`;
      bubble.classList.remove('hidden');

      if (this._bubbleTimer) clearTimeout(this._bubbleTimer);
      this._bubbleTimer = setTimeout(() => {
        bubble.classList.add('hidden');
      }, 2500);
    }
  },

  showXPToast(amount, reason) {
    let toast = document.getElementById('xpToastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'xpToastNotification';
      toast.className = 'xp-toast-notification hidden';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `⭐ +${amount} XP ${reason ? '• ' + reason : ''}`;
    toast.classList.remove('hidden');
    toast.classList.remove('pop-in');
    void toast.offsetWidth;
    toast.classList.add('pop-in');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  },

  triggerEvolutionModal(oldStage, newStage, currentXP) {
    const modal = document.getElementById('evolutionModal');
    if (!modal) return;

    const profile = DB.getStudentProfile() || {};
    const gender = profile.gender || 'male';

    const oldImg = this.getStageImage(oldStage, gender);
    const newImg = this.getStageImage(newStage, gender);

    const oldDisplay = oldImg 
      ? `<img src="${oldImg}" alt="${oldStage.title}" />` 
      : `<span style="font-size: 3.5rem;">${oldStage.icon}</span>`;

    const newDisplay = newImg 
      ? `<img src="${newImg}" alt="${newStage.title}" />` 
      : `<span style="font-size: 3.5rem;">${newStage.icon}</span>`;
    
    document.getElementById('evoOldIcon').innerHTML = oldDisplay;
    document.getElementById('evoOldTitle').textContent = oldStage.title;

    document.getElementById('evoNewIcon').innerHTML = newDisplay;
    document.getElementById('evoNewTitle').textContent = newStage.title;
    
    const descEl = document.getElementById('evoNewDesc');
    if (descEl) {
      descEl.textContent = newStage.desc || 'Learning core Grade 10 Science topics!';
    }

    const xpTextEl = document.getElementById('evoXPText');
    if (xpTextEl) {
      xpTextEl.innerHTML = `🎉 <span class="highlight-cyan">${newStage.minXP} XP Reached!</span> <span class="highlight-pink">${oldStage.title}</span> evolved into <span class="highlight-cyan">${newStage.title}</span>!`;
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  closeEvolutionModal() {
    const modal = document.getElementById('evolutionModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    this.renderHomeCharacterCard();
  },

  triggerAction(type) {
    const charImg = document.querySelector('.baby-char-img') || document.querySelector('.char-avatar-icon');
    const speechBubble = document.getElementById('charSpeechBubble') || document.getElementById('webFloatingSpeech');

    let animClass = '';
    let msg = '';

    switch (type) {
      case 'wave':
        animClass = 'anim-wave';
        msg = 'Hello there! Waving at you! 👋';
        break;
      case 'look_around':
        animClass = 'anim-look-around';
        msg = 'Looking left, right, and up for science clues! 🧐';
        break;
      case 'blink':
        animClass = 'anim-blink';
        msg = 'Wink! Keeping an eye on science! 😉';
        break;
      case 'celebrate':
        animClass = 'anim-celebrate';
        msg = 'Woohoo! Science celebration dance! 🥳✨';
        break;
      case 'spin':
        animClass = 'anim-spin';
        msg = '360° Quantum Spin! 🌀';
        break;
      case 'expression':
        const expressions = ['😊 Happy', '😉 Wink', '👓 Smart', '💡 Eureka!', '😍 Love'];
        const exp = expressions[Math.floor(Math.random() * expressions.length)];
        msg = `Feeling: ${exp}!`;
        animClass = 'tap-react';
        break;
      default:
        return;
    }

    if (speechBubble) {
      speechBubble.textContent = msg;
      speechBubble.classList.remove('hidden');
      if (this._bubbleTimer) clearTimeout(this._bubbleTimer);
      this._bubbleTimer = setTimeout(() => {
        speechBubble.classList.add('hidden');
      }, 2600);
    }

    if (charImg) {
      charImg.classList.remove('anim-wave', 'anim-look-around', 'anim-blink', 'anim-celebrate', 'anim-spin', 'tap-react');
      void charImg.offsetWidth;
      charImg.classList.add(animClass);
      setTimeout(() => {
        charImg.classList.remove(animClass);
      }, 2000);
    }
  },

  startIdleAnimations() {
    if (this._idleInterval) return;
    this._idleInterval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const actions = ['look_around', 'blink', 'wave'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const charImg = document.querySelector('.baby-char-img') || document.querySelector('.char-avatar-icon');
      if (charImg) {
        this.triggerAction(action);
      }
    }, 8000);
  }
};
