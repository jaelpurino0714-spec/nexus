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
    image: 'assets/baby-character.png',
    minXP: 0, 
    nextXP: 100, 
    color: '#38BDF8', 
    defaultQuote: "Let's grow together!",
    desc: 'Focusing on earning 100 XP to evolve into Student!' 
  },
  { 
    id: 'student', 
    stage: 2, 
    title: 'STUDENT', 
    icon: '🎒', 
    image: 'assets/student-character.png',
    minXP: 100, 
    nextXP: 300, 
    color: '#10B981', 
    defaultQuote: "Studying core Grade 10 concepts!",
    desc: 'Learning core Grade 10 Science topics!' 
  },
  { 
    id: 'graduate', 
    stage: 3, 
    title: 'GRADUATE', 
    icon: '🎓', 
    image: 'assets/graduate-character.png',
    minXP: 300, 
    nextXP: 600, 
    color: '#8B5CF6', 
    defaultQuote: "Mastering trivia & simulations!",
    desc: 'Mastered science trivia & simulations!' 
  },
  { 
    id: 'adult', 
    stage: 4, 
    title: 'ADULT', 
    icon: '🧑', 
    image: 'assets/adult-character.png',
    minXP: 600, 
    nextXP: Infinity, 
    color: '#F59E0B', 
    defaultQuote: "Science Grandmaster & Expert!",
    desc: 'Science Grandmaster & Expert!' 
  }
];

const GENDER_CHARACTER_IMAGES = {
  male: {
    student: 'assets/student-character.png',
    graduate: 'assets/graduate-character.png',
    adult: 'assets/adult-character.png'
  },
  female: {
    student: 'assets/female-student-character.png',
    graduate: 'assets/female-graduate-character.png',
    adult: 'assets/female-adult-character.png'
  }
};

const BABY_INTERACTION_REACTIONS = [
  "Yay! 👶",
  "Happy reaction! 👶",
  "Giggle giggle! 🧪",
  "Ready to learn with you! ⭐",
  "Every quiz makes me grow! 🚀",
  "Let's reach 100 XP! 🎯"
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

  getStageForXP(xp) {
    if (xp >= 600) return EVOLUTION_STAGES[3];
    if (xp >= 300) return EVOLUTION_STAGES[2];
    if (xp >= 100) return EVOLUTION_STAGES[1];
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
        // If gender not selected yet and evolving to Student or beyond, prompt gender choice first!
        if (!profile.gender && newStage.stage >= 2) {
          CharacterSystem.triggerGenderSelectionModal(oldStage, newStage, newXP);
        } else {
          CharacterSystem.triggerEvolutionModal(oldStage, newStage, newXP);
        }
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
    if (stage.id === 'baby') return stage.image;
    const g = (gender === 'female') ? 'female' : 'male';
    return GENDER_CHARACTER_IMAGES[g][stage.id] || stage.image;
  },

  triggerGenderSelectionModal(oldStage, newStage, newXP, isExistingUser = false) {
    this._pendingEvolutionData = { oldStage, newStage, newXP, isExistingUser };
    this._selectedGender = null;
    
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

  renderHomeCharacterCard() {
    const container = document.getElementById('homeCharacterCard');
    if (!container) return;

    const xp = ProgressionSystem.getCurrentXP();
    const stage = ProgressionSystem.getStageForXP(xp);
    const profile = DB.getStudentProfile() || {};

    // For existing users with no gender set who are past Baby stage
    if (!profile.gender && stage.id !== 'baby' && !this._genderPromptShown) {
      this._genderPromptShown = true;
      const oldStage = EVOLUTION_STAGES[0];
      this.triggerGenderSelectionModal(oldStage, stage, xp, true);
    }

    const gender = profile.gender || 'male';
    const stageImage = this.getStageImage(stage, gender);

    const isBaby = (stage.id === 'baby');
    const isStudent = (stage.id === 'student');
    const isGraduate = (stage.id === 'graduate');
    const isAdult = (stage.id === 'adult');
    
    let dynamicQuote = stage.defaultQuote;
    if (isBaby) {
      if (xp >= 70) dynamicQuote = "Almost ready to evolve! 👶";
      else dynamicQuote = "Let's grow together!";
    } else if (isStudent) {
      if (xp >= 270) dynamicQuote = "Graduation is close! 🎓";
      else dynamicQuote = "Studying core Grade 10 concepts!";
    } else if (isGraduate) {
      if (xp >= 550) dynamicQuote = "Almost at the final stage! 🧑";
      else dynamicQuote = "Mastering trivia & simulations!";
    } else if (isAdult) {
      dynamicQuote = "Science Grandmaster & Expert! 🌟";
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

    container.innerHTML = `
      <div class="character-evolution-box ${isBaby ? 'baby-stage-card' : ''} ${isStudent ? 'student-stage-card' : ''} ${isGraduate ? 'graduate-stage-card' : ''} ${isAdult ? 'adult-stage-card' : ''}" style="border-color: ${stage.color};">
        <div class="char-card-header">
          <span class="char-header-title">MY CHARACTER</span>
          <span class="char-stage-badge" style="background: ${stage.color};">${stage.icon} ${stage.title}${genderBadge}</span>
        </div>

        <div class="char-card-body">
          ${avatarHtml}
          
          <div class="char-quote-label">"${dynamicQuote}"</div>

          <div class="char-xp-hero-badge">⭐ ${xp} XP</div>

          <div class="char-progress-bar-container">
            <div class="char-progress-fill" style="width: ${pct}%; background: ${stage.color};"></div>
          </div>
          <div class="char-progress-sub-row">
            <span>${isAdult ? '⭐ ' + xp + ' XP' : nextReqText}</span>
            <span style="font-weight: 800; color: ${stage.color};">${isAdult ? '🏆 FINAL STAGE COMPLETE' : untilNextText}</span>
          </div>

          <button class="earn-more-xp-btn" onclick="App.showScreen('playScreen')">
            🚀 EARN MORE XP
          </button>
        </div>
      </div>
    `;
  },

  onTapCharacter() {
    const bubble = document.getElementById('charSpeechBubble');
    if (!bubble) return;

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

    bubble.textContent = msg;
    bubble.classList.remove('hidden');

    const img = document.querySelector('.baby-char-img, .char-avatar-icon');
    if (img) {
      img.classList.remove('tap-react');
      void img.offsetWidth;
      img.classList.add('tap-react');
      setTimeout(() => img.classList.remove('tap-react'), 450);
    }

    if (this._bubbleTimer) clearTimeout(this._bubbleTimer);
    this._bubbleTimer = setTimeout(() => {
      bubble.classList.add('hidden');
    }, 2500);
  },

  triggerXPReaction(amount) {
    const bubble = document.getElementById('charSpeechBubble');
    const img = document.querySelector('.baby-char-img, .char-avatar-icon');

    if (img) {
      img.classList.remove('tap-react');
      void img.offsetWidth;
      img.classList.add('tap-react');
      setTimeout(() => img.classList.remove('tap-react'), 450);
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
      ? `<img src="${oldImg}" class="evo-img-thumb" alt="${oldStage.title}" />` 
      : oldStage.icon;

    const newDisplay = newImg 
      ? `<img src="${newImg}" class="evo-img-thumb" alt="${newStage.title}" />` 
      : newStage.icon;
    
    document.getElementById('evoOldIcon').innerHTML = oldDisplay;
    document.getElementById('evoOldTitle').textContent = oldStage.title;

    document.getElementById('evoNewIcon').innerHTML = newDisplay;
    document.getElementById('evoNewTitle').textContent = newStage.title;
    document.getElementById('evoNewDesc').textContent = newStage.desc;
    
    if (newStage.id === 'adult') {
      document.getElementById('evoXPText').textContent = `🎉 ${newStage.minXP} XP Reached! ${oldStage.title} evolved into ${newStage.title} (FINAL STAGE)!`;
    } else {
      document.getElementById('evoXPText').textContent = `🎉 ${newStage.minXP} XP Reached! ${oldStage.title} evolved into ${newStage.title}!`;
    }

    modal.classList.remove('hidden');
  },

  closeEvolutionModal() {
    const modal = document.getElementById('evolutionModal');
    if (modal) modal.classList.add('hidden');
    this.renderHomeCharacterCard();
  }
};
