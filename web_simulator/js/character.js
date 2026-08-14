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
    id: 'worker', 
    stage: 4, 
    title: 'WORKER', 
    icon: '💼', 
    image: 'assets/adult-character.png',
    minXP: 600, 
    nextXP: Infinity, 
    color: '#F59E0B', 
    defaultQuote: "Working hard & applying science knowledge!",
    desc: 'Science Professional & Industry Worker!' 
  }
];

const GENDER_CHARACTER_IMAGES = {
  male: {
    baby: 'assets/male/baby.png',
    student: 'assets/male/student.png',
    graduate: 'assets/male/graduate.png',
    worker: 'assets/male/worker.png',
    adult: 'assets/male/worker.png'
  },
  female: {
    baby: 'assets/female/baby.png',
    student: 'assets/female/student.png',
    graduate: 'assets/female/graduate.png',
    worker: 'assets/female/worker.png',
    adult: 'assets/female/worker.png'
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
    this.initFloatingCompanion();
    this.updateFloatingCompanion();
  },

  initFloatingCompanion() {
    const companion = document.getElementById('webFloatingCompanion');
    if (!companion || this._floatingInited) return;
    this._floatingInited = true;

    const savedPos = localStorage.getItem('nexus_floating_pos');
    if (savedPos) {
      try {
        const { left, top } = JSON.parse(savedPos);
        companion.style.left = left + 'px';
        companion.style.top = top + 'px';
        companion.style.right = 'auto';
        companion.style.bottom = 'auto';
      } catch (e) {}
    }

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;
    let dragDistance = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      dragDistance = 0;
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      startX = clientX;
      startY = clientY;

      initialLeft = companion.offsetLeft;
      initialTop = companion.offsetTop;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      const dx = clientX - startX;
      const dy = clientY - startY;
      dragDistance += Math.hypot(dx, dy);

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const parent = companion.parentElement || document.body;
      const maxW = parent.clientWidth || window.innerWidth;
      const maxH = parent.clientHeight || window.innerHeight;

      newLeft = Math.max(8, Math.min(maxW - 68, newLeft));
      newTop = Math.max(8, Math.min(maxH - 68, newTop));

      companion.style.left = newLeft + 'px';
      companion.style.top = newTop + 'px';
      companion.style.right = 'auto';
      companion.style.bottom = 'auto';
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;

      if (dragDistance >= 10) {
        const rect = companion.getBoundingClientRect();
        localStorage.setItem('nexus_floating_pos', JSON.stringify({ left: rect.left, top: rect.top }));
      } else {
        this.onTapCharacter();
      }
    };

    companion.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    companion.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  },

  updateFloatingCompanion(currentScreenId = 'homeScreen') {
    const companion = document.getElementById('webFloatingCompanion');
    if (companion) {
      companion.classList.add('hidden');
    }
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

  openCharacterModal() {
    const modal = document.getElementById('evolutionModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
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
      if (xp >= 70) dynamicQuote = "Almost ready to evolve! 👶";
      else dynamicQuote = "Let's grow together!";
    } else if (isStudent) {
      if (xp >= 270) dynamicQuote = "Graduation is close! 🎓";
      else dynamicQuote = "Studying core Grade 10 concepts!";
    } else if (isGraduate) {
      if (xp >= 550) dynamicQuote = "Almost at the worker stage! 💼";
      else dynamicQuote = "Mastering trivia & simulations!";
    } else if (isAdult) {
      dynamicQuote = "Working hard & applying science knowledge! 💼";
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
            <h3 style="margin: 0; font-size: 1.2rem; color: #4c1d95;">👕 Pet Outfits Shop</h3>
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
