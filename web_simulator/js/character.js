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
    image: 'assets/baby_character.jpg',
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
    image: null,
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
    image: null,
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
    image: null,
    minXP: 600, 
    nextXP: Infinity, 
    color: '#F59E0B', 
    defaultQuote: "Final Stage — Science Grandmaster!",
    desc: 'Science Grandmaster & Expert!' 
  }
];

const BABY_INTERACTION_REACTIONS = [
  "Happy reaction! 👶",
  "Giggle giggle! 🧪",
  "Ready to learn with you! ⭐",
  "Every quiz makes me grow! 🚀",
  "Let's reach 100 XP! 🎯"
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

    // Show floating XP notification & reaction
    CharacterSystem.showXPToast(amount, reason);

    // Update UI
    CharacterSystem.renderHomeCharacterCard();
    App.updateUserHeader();

    // Check Evolution Threshold (e.g. 100 XP for Baby -> Student)
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
  init() {
    this.renderHomeCharacterCard();
  },

  renderHomeCharacterCard() {
    const container = document.getElementById('homeCharacterCard');
    if (!container) return;

    const xp = ProgressionSystem.getCurrentXP();
    const stage = ProgressionSystem.getStageForXP(xp);
    const isBaby = (stage.id === 'baby');
    
    let dynamicQuote = stage.defaultQuote;
    if (isBaby) {
      if (xp >= 100) dynamicQuote = "I grew up! 🎉";
      else if (xp >= 70) dynamicQuote = "I'm growing! 👶";
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
      untilNextText = `FINAL STAGE REACHED! 🎉`;
      pct = 100;
    }

    let avatarHtml = '';
    if (stage.image) {
      avatarHtml = `
        <div class="baby-avatar-wrapper" onclick="CharacterSystem.onTapCharacter()">
          <img src="${stage.image}" class="baby-char-img bounce-anim" alt="Baby Character" />
          <div class="char-speech-bubble hidden" id="charSpeechBubble">${dynamicQuote}</div>
        </div>
      `;
    } else {
      avatarHtml = `
        <div class="char-avatar-section" onclick="CharacterSystem.onTapCharacter()">
          <div class="char-avatar-icon bounce-anim">${stage.icon}</div>
          <div class="char-speech-bubble hidden" id="charSpeechBubble">${dynamicQuote}</div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="character-evolution-box ${isBaby ? 'baby-stage-card' : ''}" style="border-color: ${stage.color};">
        <div class="char-card-header">
          <span class="char-header-title">MY CHARACTER</span>
          <span class="char-stage-badge" style="background: ${stage.color};">${stage.icon} ${stage.title} STAGE</span>
        </div>

        <div class="char-card-body">
          ${avatarHtml}
          
          <div class="char-quote-label">"${dynamicQuote}"</div>

          <div class="char-xp-hero-badge">⭐ ${xp} XP</div>

          <div class="char-progress-bar-container">
            <div class="char-progress-fill" style="width: ${pct}%; background: ${stage.color};"></div>
          </div>
          <div class="char-progress-sub-row">
            <span>${nextReqText}</span>
            <span style="font-weight: 800; color: ${stage.color};">${untilNextText}</span>
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
    let msg = BABY_INTERACTION_REACTIONS[Math.floor(Math.random() * BABY_INTERACTION_REACTIONS.length)];
    if (xp >= 100) msg = "I grew up! 🎉";
    else if (xp >= 70) msg = "I'm growing! 👶";

    bubble.textContent = msg;
    bubble.classList.remove('hidden');

    const img = document.querySelector('.baby-char-img, .char-avatar-icon');
    if (img) {
      img.classList.remove('bounce-anim');
      void img.offsetWidth;
      img.classList.add('bounce-anim');
    }

    setTimeout(() => {
      bubble.classList.add('hidden');
    }, 2500);
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

    const oldDisplay = oldStage.image 
      ? `<img src="${oldStage.image}" class="evo-img-thumb" />` 
      : oldStage.icon;
    
    document.getElementById('evoOldIcon').innerHTML = oldDisplay;
    document.getElementById('evoOldTitle').textContent = oldStage.title;

    document.getElementById('evoNewIcon').textContent = newStage.icon;
    document.getElementById('evoNewTitle').textContent = newStage.title;
    document.getElementById('evoNewDesc').textContent = newStage.desc;
    document.getElementById('evoXPText').textContent = `🎉 100 XP Reached! ${oldStage.title} evolved into ${newStage.title}!`;

    modal.classList.remove('hidden');
  },

  closeEvolutionModal() {
    const modal = document.getElementById('evolutionModal');
    if (modal) modal.classList.add('hidden');
    this.renderHomeCharacterCard();
  }
};
