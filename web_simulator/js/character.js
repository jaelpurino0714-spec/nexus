/* ==========================================================================
   NEXUS INTERACTIVE CHARACTER EVOLUTION SYSTEM
   Three connected systems:
   1. TaskSystem: Activity detection, XP rewards, duplicate prevention
   2. ProgressionSystem: XP calculation, evolution stage thresholds, Supabase sync
   3. CharacterSystem: Character UI rendering, animations, reactions & evolution modal
   ========================================================================== */

const EVOLUTION_STAGES = [
  { id: 'baby', stage: 1, title: 'BABY', icon: '👶', minXP: 0, nextXP: 100, color: '#38BDF8', desc: 'Starting your science journey!' },
  { id: 'student', stage: 2, title: 'STUDENT', icon: '🎒', minXP: 100, nextXP: 300, color: '#10B981', desc: 'Learning core Grade 10 concepts!' },
  { id: 'graduate', stage: 3, title: 'GRADUATE', icon: '🎓', minXP: 300, nextXP: 600, color: '#8B5CF6', desc: 'Mastered science trivia & simulations!' },
  { id: 'adult', stage: 4, title: 'ADULT', icon: '🧑', minXP: 600, nextXP: Infinity, color: '#F59E0B', desc: 'Science Grandmaster & Expert!' }
];

const CHARACTER_REACTIONS = [
  "Ready to learn science! 🧪",
  "Great job studying today! ⭐",
  "Knowledge is power! ⚡",
  "Keep completing tasks to evolve! 🚀",
  "Let's get 100% accuracy! 🎯",
  "Science is amazing! 🧬"
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

  completeTask(taskId, taskName, xpAmount = 20) {
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

    // Show floating XP notification
    CharacterSystem.showXPToast(amount, reason);

    // Update UI
    CharacterSystem.renderHomeCharacterCard();
    App.updateUserHeader();

    // Check Evolution Threshold
    if (newStage.stage > oldStage.stage) {
      setTimeout(() => {
        CharacterSystem.triggerEvolutionModal(oldStage, newStage, newXP);
      }, 500);
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
    
    let nextReqText = '';
    let pct = 100;
    if (stage.nextXP !== Infinity) {
      const prevMin = stage.minXP;
      const currentLevelXP = xp - prevMin;
      const neededXP = stage.nextXP - prevMin;
      pct = Math.min(100, Math.round((currentLevelXP / neededXP) * 100));
      nextReqText = `${xp} / ${stage.nextXP} XP (${pct}%)`;
    } else {
      nextReqText = `${xp} XP (MAX EVOLUTION)`;
      pct = 100;
    }

    container.innerHTML = `
      <div class="character-evolution-box" style="border-color: ${stage.color};">
        <div class="char-avatar-section" onclick="CharacterSystem.onTapCharacter()">
          <div class="char-avatar-icon bounce-anim">${stage.icon}</div>
          <div class="char-speech-bubble hidden" id="charSpeechBubble">Hello!</div>
        </div>

        <div class="char-info-section">
          <div class="char-title-row">
            <span class="char-stage-badge" style="background: ${stage.color};">${stage.title}</span>
            <span class="char-xp-count">${xp} XP</span>
          </div>

          <p class="char-desc-text">${stage.desc}</p>

          <div class="char-progress-bar-container">
            <div class="char-progress-fill" style="width: ${pct}%; background: ${stage.color};"></div>
          </div>
          <div class="char-progress-label">${nextReqText}</div>
        </div>
      </div>
    `;
  },

  onTapCharacter() {
    const bubble = document.getElementById('charSpeechBubble');
    if (!bubble) return;

    const randomMsg = CHARACTER_REACTIONS[Math.floor(Math.random() * CHARACTER_REACTIONS.length)];
    bubble.textContent = randomMsg;
    bubble.classList.remove('hidden');

    const icon = document.querySelector('.char-avatar-icon');
    if (icon) {
      icon.classList.remove('bounce-anim');
      void icon.offsetWidth;
      icon.classList.add('bounce-anim');
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

    document.getElementById('evoOldIcon').textContent = oldStage.icon;
    document.getElementById('evoOldTitle').textContent = oldStage.title;

    document.getElementById('evoNewIcon').textContent = newStage.icon;
    document.getElementById('evoNewTitle').textContent = newStage.title;
    document.getElementById('evoNewDesc').textContent = newStage.desc;
    document.getElementById('evoXPText').textContent = `${currentXP} XP Reached!`;

    modal.classList.remove('hidden');
  },

  closeEvolutionModal() {
    const modal = document.getElementById('evolutionModal');
    if (modal) modal.classList.add('hidden');
    this.renderHomeCharacterCard();
  }
};
