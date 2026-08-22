/* ==========================================================================
   NEXUS SPEED-TAPPING QUIZ ENGINE & GAMEFLOW CONTROLLER
   Handles 3-Term Curriculum, Topic Selection, Pre-Test, Post-Test Formats,
   Dynamic Question Loading (MC, True/False, Identification) & Timers.
   ========================================================================== */

const CURRICULUM = {
  1: [
    "Physical vs. Chemical Change",
    "Chemical Reactions",
    "Acids, Bases, and Salts",
    "Chemical Equations",
    "Balancing Chemical Equations",
    "Rates of Reactions",
    "Homeostasis",
    "Mechanisms of Evolution"
  ],
  2: [
    "Ecosystem's Carrying Capacity and Population Growth",
    "Biotechnology",
    "Plate Tectonics",
    "Global Climate",
    "Global Interactions (ENSO)",
    "Global and Local Sustainability"
  ],
  3: [
    "Projectile Motion",
    "Momentum and Collisions",
    "Large-Scale Generation and Distribution of Electricity",
    "Renewable and Non-Renewable Energy Sources"
  ]
};

const Quiz = {
  currentTerm: 1,
  currentTopic: '',
  currentMode: 'pre-test', // 'pre-test' or 'post-test'
  currentQuestionFormat: 'multiple_choice', // 'multiple_choice' | 'true_false' | 'identification'
  questionsList: [],
  currentIndex: 0,
  isAnswering: false,
  timerInterval: null,
  timeRemainingSec: 20,
  questionStartTime: 0,

  // Session Statistics
  correctCount: 0,
  incorrectCount: 0,
  streak: 0,
  maxStreak: 0,
  totalScorePoints: 0,
  fastestAnswerSec: null,
  fastAnswersCount: 0,
  sessionTotalTimeSec: 0,
  sessionTopicStats: {},

  // 1. Term Selection
  async selectTerm(termNum) {
    this.currentTerm = termNum;
    await this.renderTopics();
    App.showScreen('topicScreen');
  },

  getTopicIcon(topicName) {
    if (!topicName) return '🧪';
    const t = topicName.toLowerCase();
    if (t.includes('balancing') || t.includes('balance') || t.includes('scale')) return '⚖️';
    if (t.includes('equation') || t.includes('math') || t.includes('formula')) return '📝';
    if (t.includes('acid') || t.includes('base') || t.includes('salt')) return '🧪';
    if (t.includes('reaction') || t.includes('change')) return '🧪';
    if (t.includes('chemical') || t.includes('element') || t.includes('atom')) return '🧪';
    if (t.includes('ecosystem') || t.includes('biodiversity') || t.includes('flow')) return '🌿';
    if (t.includes('plate') || t.includes('tectonic') || t.includes('volcano') || t.includes('earthquake')) return '🌋';
    if (t.includes('climate') || t.includes('weather') || t.includes('atmosphere')) return '🌍';
    if (t.includes('electricity') || t.includes('magnetism') || t.includes('current')) return '⚡';
    if (t.includes('physics') || t.includes('motion') || t.includes('force') || t.includes('energy')) return '🔬';
    return '🧪';
  },

  // 2. Render Topics for Selected Term (Dynamically from Supabase)
  async renderTopics() {
    const termNames = { 1: 'First Term Topics', 2: 'Second Term Topics', 3: 'Third Term Topics' };
    document.getElementById('topicScreenTitle').textContent = termNames[this.currentTerm] || 'Select Topic';
    document.getElementById('topicScreenSub').textContent = `Choose a DepEd Grade 10 Science topic to begin`;

    const container = document.getElementById('topicsListGroup');
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#C4B5FD;">Loading topics from Supabase...</div>';

    let topics = [];
    const terms = await DB.getTerms();
    const matchedTerm = terms.find(t => t.order_no === this.currentTerm || t.order_index === this.currentTerm);

    if (matchedTerm) {
      topics = await DB.getTopics(matchedTerm.id);
    }

    if (topics.length === 0 && CURRICULUM[this.currentTerm]) {
      topics = CURRICULUM[this.currentTerm].map((title, idx) => ({ id: `top_${this.currentTerm}_${idx}`, title: title }));
    }

    container.innerHTML = '';
    topics.forEach((topicObj, idx) => {
      const topicName = topicObj.title;
      const topicId = topicObj.id;
      const icon = this.getTopicIcon(topicName);
      const btn = document.createElement('button');
      btn.className = `term-btn topic-item-btn`;
      btn.onclick = () => this.selectTopic(topicName, topicId);
      btn.innerHTML = `
        <div class="topic-info">
          <div class="term-title" style="color: #FFFFFF; font-size: 1.12rem; font-weight: 800; margin-bottom: 6px; line-height: 1.3;">${topicName}</div>
          <span class="term-action" style="color: #C084FC; font-weight: 800; font-size: 0.88rem;">Select Topic ➔</span>
        </div>
        <div class="topic-graphic">${icon}</div>
      `;
      container.appendChild(btn);
    });
  },

  // 3. Topic Selected -> Open Test Type Modal
  customFlowType: 'standard', // 'standard' | 'custom_play' | 'host_builtin' | 'host_custom' | 'join'
  customTimeLimitSec: 20,
  customQuestionCount: 15,
  customMaxParticipants: 50,
  lobbyAccessCode: '',
  lobbyParticipants: [],
  customCreatedQuestions: [],
  creatorCurrentIndex: 0,
  isHost: false,
  broadcastChannel: null,
  storageListener: null,
  lobbySyncInterval: null,
  currentLobbyData: null,

  hideAllModals() {
    ['customHubModal', 'hostTypeModal', 'preGameCustomizeModal', 'customCreatorModal', 'joinCodeModal', 'modeSelectorModal', 'postTestFormatModal', 'participantProfileModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  },

  showCustomHubModal() {
    this.hideAllModals();
    const el = document.getElementById('customHubModal');
    if (el) el.classList.remove('hidden');
  },

  hideCustomHubModal() {
    const el = document.getElementById('customHubModal');
    if (el) el.classList.add('hidden');
  },

  hideHostTypeModal() {
    const el = document.getElementById('hostTypeModal');
    if (el) el.classList.add('hidden');
  },

  hidePreGameCustomizeModal() {
    const el = document.getElementById('preGameCustomizeModal');
    if (el) el.classList.add('hidden');
  },

  hideCustomCreatorModal() {
    const el = document.getElementById('customCreatorModal');
    if (el) el.classList.add('hidden');
  },

  hideJoinCodeModal() {
    const el = document.getElementById('joinCodeModal');
    if (el) el.classList.add('hidden');
  },

  // 1. Handle selection in Custom Hub
  selectCustomFlow(flow) {
    this.hideCustomHubModal();
    this.customFlowType = flow;

    if (flow === 'host') {
      Multiplayer.initCreateGameFlow();
    } else if (flow === 'join') {
      Multiplayer.initJoinGameFlow();
    } else if (flow === 'custom_play') {
      // Load saved custom settings from localStorage if available
      const saved = localStorage.getItem('nexus_custom_play_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.timeLimit) this.customTimeLimitSec = parsed.timeLimit;
          if (parsed.questionCount) this.customQuestionCount = parsed.questionCount;
        } catch (e) {}
      }
      App.showScreen('playScreen');
    }
  },

  // 2. Select Host Type (Custom Questions vs Built-in Questions)
  selectHostType(type) {
    this.hideHostTypeModal();
    if (type === 'custom') {
      this.customFlowType = 'host_custom';
      this.initCustomCreator();
    } else {
      this.customFlowType = 'host_builtin';
      App.showScreen('playScreen');
    }
  },

  // 3. Topic Selection
  selectTopic(topicName, topicId) {
    this.currentTopic = topicName;
    this.currentTopicId = topicId;
    const labelEl = document.getElementById('selectedTopicLabel');
    if (labelEl) {
      labelEl.innerHTML = `Selected: <span class="topic-highlight">${topicName}</span>`;
    }
    document.getElementById('modeSelectorModal').classList.remove('hidden');
  },

  hideModeSelector() {
    document.getElementById('modeSelectorModal').classList.add('hidden');
  },

  hidePostTestFormatModal() {
    document.getElementById('postTestFormatModal').classList.add('hidden');
  },

  // 4. Choose Test Type (Pre-Test vs Post-Test)
  selectTestType(mode) {
    this.hideModeSelector();
    this.currentMode = mode;

    if (mode === 'pre-test') {
      this.currentQuestionFormat = 'multiple_choice';
      this.onFormatSelected();
    } else {
      // Post-Test: open question format selector modal
      const postLabelEl = document.getElementById('postTestTopicLabel');
      if (postLabelEl) {
        postLabelEl.innerHTML = `Post-Test: <span class="topic-highlight">${this.currentTopic}</span>`;
      }
      document.getElementById('postTestFormatModal').classList.remove('hidden');
    }
  },

  // 5. Choose Post-Test Question Format
  selectQuestionFormat(format) {
    this.hidePostTestFormatModal();
    this.currentQuestionFormat = format;
    this.onFormatSelected();
  },

  // Called when format & mode are finalized
  onFormatSelected() {
    if (this.customFlowType === 'custom_play' || this.customFlowType === 'host_builtin') {
      // Show Pre-Game Customize UI BEFORE starting quiz
      const modal = document.getElementById('preGameCustomizeModal');
      document.getElementById('customTimeLimit').value = this.customTimeLimitSec || 20;
      document.getElementById('customQuestionCount').value = this.customQuestionCount || 15;
      const maxGroup = document.getElementById('maxParticipantsGroup');
      if (this.customFlowType === 'host_builtin') {
        document.getElementById('customizeModalTitle').textContent = 'Host Built-in Setup';
        document.getElementById('customizeModalSub').textContent = 'Configure live host settings for participants';
        maxGroup.classList.remove('hidden');
        maxGroup.style.display = 'flex';
        document.getElementById('startCustomizeBtn').textContent = 'Create Lobby 🚀';
      } else {
        document.getElementById('customizeModalTitle').textContent = 'Custom Play Setup';
        document.getElementById('customizeModalSub').textContent = 'Configure your custom time limit and question count';
        maxGroup.classList.add('hidden');
        maxGroup.style.display = 'none';
        document.getElementById('startCustomizeBtn').textContent = 'Start Custom Play 🚀';
      }

      document.getElementById('customizeErrorMsg').classList.add('hidden');
      modal.classList.remove('hidden');
    } else {
      this.startQuiz(this.currentMode, this.currentQuestionFormat);
    }
  },

  selectPresetTime(seconds, btnEl) {
    const input = document.getElementById('customTimeLimit');
    if (input) {
      input.value = seconds;
    }
    const container = document.getElementById('timePresetGroup');
    if (container) {
      container.querySelectorAll('.preset-time-pill').forEach(btn => btn.classList.remove('active'));
    }
    if (btnEl) {
      btnEl.classList.add('active');
    }
  },

  onTimeLimitInput(val) {
    const num = parseInt(val, 10);
    const container = document.getElementById('timePresetGroup');
    if (container) {
      container.querySelectorAll('.preset-time-pill').forEach(btn => {
        const btnVal = parseInt(btn.innerText, 10);
        if (btnVal === num) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  },

  // Validate & Confirm Pre-Game Customize Settings
  async confirmCustomSettingsAndStart() {
    const timeVal = parseInt(document.getElementById('customTimeLimit').value, 10);
    const countVal = parseInt(document.getElementById('customQuestionCount').value, 10);
    const maxPartVal = parseInt(document.getElementById('customMaxParticipants').value, 10) || 50;
    const errorEl = document.getElementById('customizeErrorMsg');

    if (isNaN(timeVal) || timeVal < 10) {
      errorEl.textContent = '⚠️ Time limit must be at least 10 seconds (minimum 10s required)!';
      errorEl.classList.remove('hidden');
      return;
    }
    if (timeVal > 60) {
      errorEl.textContent = '⚠️ Time limit cannot exceed 60 seconds (maximum 60s allowed)!';
      errorEl.classList.remove('hidden');
      return;
    }

    if (isNaN(countVal) || countVal < 1 || countVal > 30) {
      errorEl.textContent = '⚠️ Number of questions must be between 1 and 30 questions!';
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    this.customTimeLimitSec = timeVal;
    this.customQuestionCount = countVal;
    this.customMaxParticipants = maxPartVal;

    // Save custom settings for future Custom Play use
    if (this.customFlowType === 'custom_play') {
      localStorage.setItem('nexus_custom_play_settings', JSON.stringify({
        timeLimit: timeVal,
        questionCount: countVal
      }));
    }

    this.hidePreGameCustomizeModal();

    if (this.customFlowType === 'host_builtin') {
      await this.prepareBuiltinQuestions();
      this.startHostLobby();
    } else {
      this.startQuiz(this.currentMode, this.currentQuestionFormat);
    }
  },

  // Init Custom Quiz Creator
  initCustomCreator() {
    this.customCreatedQuestions = [];
    this.creatorCurrentIndex = 0;
    document.getElementById('creatorTotalQuestions').value = 5;
    document.getElementById('creatorTimeLimit').value = 20;
    document.getElementById('creatorMaxParticipants').value = 50;
    document.getElementById('creatorAnswerMode').value = 'multiple_choice';
    document.getElementById('creatorErrorMsg').classList.add('hidden');
    this.renderCreatorQuestionStep();
    document.getElementById('customCreatorModal').classList.remove('hidden');
  },

  onCreatorModeChange() {
    this.renderCreatorAnswersBox();
  },

  onCreatorTotalQChange() {
    const total = parseInt(document.getElementById('creatorTotalQuestions').value, 10) || 5;
    if (this.creatorCurrentIndex >= total) {
      this.creatorCurrentIndex = Math.max(0, total - 1);
    }
    this.renderCreatorQuestionStep();
  },

  onCreatorPrevQuestion() {
    if (this.creatorCurrentIndex > 0) {
      this.saveCurrentCreatorQuestion();
      this.creatorCurrentIndex--;
      this.renderCreatorQuestionStep();
    }
  },

  toggleLockCustomQuestions() {
    if (this.isCustomQuestionsLocked) {
      // Unset / Unlock Questions
      this.isCustomQuestionsLocked = false;
      this.renderCreatorQuestionStep();
      alert('Custom question set unlocked 🔓! You can now edit and modify your questions.');
    } else {
      // Set / Lock Questions
      const success = this.saveCurrentCreatorQuestion();
      if (!success) return;

      const total = parseInt(document.getElementById('creatorTotalQuestions').value, 10) || 5;
      if (this.customCreatedQuestions.length < total || this.customCreatedQuestions.some(q => !q)) {
        const errorEl = document.getElementById('creatorErrorMsg');
        errorEl.textContent = `⚠️ Please complete all ${total} questions before locking!`;
        errorEl.classList.remove('hidden');
        return;
      }

      this.isCustomQuestionsLocked = true;
      this.renderCreatorQuestionStep();
      alert('Custom question set locked & set 🔒! Click "Start Host Lobby" to open your lobby.');
    }
  },

  saveCurrentCreatorQuestion() {
    const qText = document.getElementById('creatorQuestionText').value.trim();
    const errorEl = document.getElementById('creatorErrorMsg');

    if (!qText) {
      errorEl.textContent = '⚠️ Please enter question text!';
      errorEl.classList.remove('hidden');
      return false;
    }

    const mode = document.getElementById('creatorAnswerMode').value;
    let savedQ = { question: qText, questionType: mode };

    if (mode === 'true_false') {
      const selected = document.querySelector('input[name="creatorTF"]:checked');
      savedQ.answer = selected ? selected.value : 'True';
      savedQ.options = ['True', 'False'];
    } else if (mode === 'identification') {
      const idAns = document.getElementById('creatorIdAns').value.trim();
      if (!idAns) {
        errorEl.textContent = '⚠️ Please enter correct answer text!';
        errorEl.classList.remove('hidden');
        return false;
      }
      savedQ.answer = idAns;
      savedQ.rawAnswer = idAns;
    } else {
      // Multiple Choice
      const opts = [
        document.getElementById('creatorOpt0').value.trim(),
        document.getElementById('creatorOpt1').value.trim(),
        document.getElementById('creatorOpt2').value.trim(),
        document.getElementById('creatorOpt3').value.trim()
      ];
      if (opts.some(o => !o)) {
        errorEl.textContent = '⚠️ Please fill out all 4 option choices!';
        errorEl.classList.remove('hidden');
        return false;
      }
      const radio = document.querySelector('input[name="creatorMCCorrect"]:checked');
      const correctIdx = radio ? parseInt(radio.value, 10) : 0;
      savedQ.options = opts;
      savedQ.answer = correctIdx;
      savedQ.correctIndex = correctIdx;
    }

    errorEl.classList.add('hidden');
    this.customCreatedQuestions[this.creatorCurrentIndex] = savedQ;
    return true;
  },

  onCreatorModeChange() {
    this.renderCreatorAnswersBox();
  },

  onCreatorTotalQChange() {
    const total = parseInt(document.getElementById('creatorTotalQuestions').value, 10) || 5;
    if (this.creatorCurrentIndex >= total) {
      this.creatorCurrentIndex = total - 1;
    }
    this.renderCreatorQuestionStep();
  },

  renderCreatorQuestionStep() {
    const total = parseInt(document.getElementById('creatorTotalQuestions').value, 10) || 5;
    document.getElementById('creatorQuestionCounter').textContent = `Question ${this.creatorCurrentIndex + 1} of ${total}`;
    
    // Load existing question if present
    const existing = this.customCreatedQuestions[this.creatorCurrentIndex] || {};
    const qTextEl = document.getElementById('creatorQuestionText');
    qTextEl.value = existing.question || '';
    qTextEl.disabled = this.isCustomQuestionsLocked;

    document.getElementById('creatorAnswerMode').disabled = this.isCustomQuestionsLocked;

    this.renderCreatorAnswersBox(existing);

    const prevBtn = document.getElementById('creatorPrevBtn');
    if (prevBtn) prevBtn.disabled = (this.creatorCurrentIndex === 0);

    const nextBtn = document.getElementById('creatorNextBtn');
    if (nextBtn) {
      if (this.creatorCurrentIndex >= total - 1) {
        nextBtn.textContent = 'Last Question 🏁';
        nextBtn.disabled = true;
      } else {
        nextBtn.textContent = 'Next Question ➔';
        nextBtn.disabled = this.isCustomQuestionsLocked;
      }
    }

    const lockBtn = document.getElementById('creatorLockBtn');
    const topLockBtn = document.getElementById('topUnsetBtn');
    if (lockBtn) {
      if (this.isCustomQuestionsLocked) {
        lockBtn.textContent = 'Unset Questions 🔓';
        lockBtn.style.background = '#EA580C';
        if (topLockBtn) {
          topLockBtn.textContent = 'Unset Questions 🔓';
          topLockBtn.style.background = '#EA580C';
        }
      } else {
        lockBtn.textContent = 'Set Questions 🔒';
        lockBtn.style.background = '#8B5CF6';
        if (topLockBtn) {
          topLockBtn.textContent = 'Set Questions 🔒';
          topLockBtn.style.background = '#8B5CF6';
        }
      }
    }
  },

  renderCreatorAnswersBox(existing = {}) {
    const mode = document.getElementById('creatorAnswerMode').value;
    const box = document.getElementById('creatorAnswersBox');
    box.innerHTML = '';
    const disabledAttr = this.isCustomQuestionsLocked ? 'disabled' : '';

    if (mode === 'true_false') {
      box.innerHTML = `
        <label>Set Correct Answer:</label>
        <div style="display:flex; gap:16px; margin-top:6px;">
          <label style="font-weight:600;"><input type="radio" name="creatorTF" value="True" ${disabledAttr} ${existing.answer === 'True' || !existing.answer ? 'checked' : ''}> True</label>
          <label style="font-weight:600;"><input type="radio" name="creatorTF" value="False" ${disabledAttr} ${existing.answer === 'False' ? 'checked' : ''}> False</label>
        </div>
      `;
    } else if (mode === 'identification') {
      box.innerHTML = `
        <label for="creatorIdAns">Set Correct Answer Text:</label>
        <input type="text" id="creatorIdAns" class="customize-input" ${disabledAttr} value="${existing.answer || ''}" placeholder="Type correct answer..." />
      `;
    } else {
      // Multiple Choice
      const opts = existing.options || ['', '', '', ''];
      const correctIdx = existing.correctIndex !== undefined ? existing.correctIndex : 0;
      box.innerHTML = `
        <label>Set Answer Options (mark correct choice):</label>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
          ${[0, 1, 2, 3].map(i => `
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="radio" name="creatorMCCorrect" value="${i}" ${disabledAttr} ${correctIdx === i ? 'checked' : ''}>
              <input type="text" id="creatorOpt${i}" class="customize-input" ${disabledAttr} style="padding:8px;" value="${opts[i] || ''}" placeholder="Option ${String.fromCharCode(65 + i)}" />
            </div>
          `).join('')}
        </div>
      `;
    }
  },

  onCreatorNextQuestion() {
    const success = this.saveCurrentCreatorQuestion();
    if (!success) return;

    const total = parseInt(document.getElementById('creatorTotalQuestions').value, 10) || 5;
    if (this.creatorCurrentIndex < total - 1) {
      this.creatorCurrentIndex++;
      this.renderCreatorQuestionStep();
    }
  },

  confirmCustomCreatorAndStart() {
    const timeVal = parseInt(document.getElementById('creatorTimeLimit').value, 10);
    const totalQ = parseInt(document.getElementById('creatorTotalQuestions').value, 10);
    const maxPart = parseInt(document.getElementById('creatorMaxParticipants').value, 10) || 50;
    const errorEl = document.getElementById('creatorErrorMsg');

    if (isNaN(timeVal) || timeVal < 5 || timeVal > 60) {
      errorEl.textContent = '⚠️ Time limit must be between 5 and 60 seconds!';
      errorEl.classList.remove('hidden');
      return;
    }

    if (!this.isCustomQuestionsLocked && (this.customCreatedQuestions.length < totalQ || this.customCreatedQuestions.some(q => !q))) {
      errorEl.textContent = `⚠️ Please complete and click "Set Questions 🔒" before creating lobby!`;
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    this.customTimeLimitSec = timeVal;
    this.customQuestionCount = totalQ;
    this.customMaxParticipants = maxPart;
    this.questionsList = [...this.customCreatedQuestions];
    this.hideCustomCreatorModal();
    this.startHostLobby();
  },

  generateLobbyCode() {
    const codeNum = Math.floor(1000000 + Math.random() * 9000000);
    this.lobbyAccessCode = String(codeNum);
  },

  // Real-time Lobby Storage & Broadcast Sync Engine
  getLobbyData(code) {
    if (!code) return null;
    const raw = localStorage.getItem('nexus_lobby_' + code);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  saveLobbyData(lobbyObj) {
    if (!lobbyObj || !lobbyObj.code) return;
    lobbyObj.lastUpdated = Date.now();
    localStorage.setItem('nexus_lobby_' + lobbyObj.code, JSON.stringify(lobbyObj));
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'LOBBY_UPDATE', data: lobbyObj });
      } catch (e) {}
    }
  },

  initLobbySync(code) {
    this.stopLobbySync();
    this.lobbyAccessCode = code;

    try {
      this.broadcastChannel = new BroadcastChannel('nexus_lobby_ch_' + code);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.data) {
          this.handleLobbySyncUpdate(event.data.data);
        }
      };
    } catch (e) {
      this.broadcastChannel = null;
    }

    this.storageListener = (e) => {
      if (e.key === ('nexus_lobby_' + code) && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          this.handleLobbySyncUpdate(updated);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', this.storageListener);

    this.lobbySyncInterval = setInterval(() => {
      const data = this.getLobbyData(code);
      if (data) {
        this.handleLobbySyncUpdate(data);
      }
    }, 500);
  },

  stopLobbySync() {
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) {}
      this.broadcastChannel = null;
    }
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
    if (this.lobbySyncInterval) {
      clearInterval(this.lobbySyncInterval);
      this.lobbySyncInterval = null;
    }
  },

  handleLobbySyncUpdate(lobbyData) {
    if (!lobbyData) return;
    this.currentLobbyData = lobbyData;

    const myId = DB.getUserUUID();
    if (!this.isHost && lobbyData.kickedIds && lobbyData.kickedIds.includes(myId)) {
      this.stopLobbySync();
      alert('⚠️ You have been kicked from the lobby by the host.');
      App.showScreen('homeScreen');
      return;
    }

    if (!this.isHost && lobbyData.status === 'cancelled') {
      this.stopLobbySync();
      alert('⚠️ The host has ended the lobby.');
      App.showScreen('homeScreen');
      return;
    }

    if (!this.isHost && lobbyData.status === 'in_game' && App.currentScreen === 'lobbyScreen') {
      this.questionsList = [...(lobbyData.settings.questionsList || [])];
      this.customTimeLimitSec = lobbyData.settings.timeLimitSec || 20;
      this.customQuestionCount = lobbyData.settings.questionCount || 15;
      this.currentMode = lobbyData.settings.mode || 'pre-test';
      this.currentQuestionFormat = lobbyData.settings.format || 'multiple_choice';
      this.currentTopic = lobbyData.settings.topic || 'Custom Science';
      this.startQuiz(this.currentMode, this.currentQuestionFormat);
      return;
    }

    if (App.currentScreen === 'lobbyScreen') {
      this.lobbyParticipants = lobbyData.participants || [];
      this.renderLobbyScreen();
    }

    if (this.isHost && App.currentScreen === 'hostLiveDashboardScreen') {
      this.lobbyParticipants = lobbyData.participants || [];
      this.renderHostLiveDashboard();
    }
  },

  updateParticipantLobbyProgress() {
    if (!this.lobbyAccessCode || this.isHost) return;
    const lobbyData = this.getLobbyData(this.lobbyAccessCode);
    if (!lobbyData || !lobbyData.participants) return;

    const myId = DB.getUserUUID();
    const profile = DB.getStudentProfile() || { name: 'Student Player' };
    const p = lobbyData.participants.find(item => item.id === myId || item.name === profile.name);
    if (p) {
      p.currentQ = this.currentIndex + 1;
      p.correct = this.correctCount;
      p.incorrect = this.incorrectCount;
      p.points = this.totalScorePoints;
      p.finished = (this.currentIndex >= (this.questionsList.length - 1));
      this.saveLobbyData(lobbyData);
    }
  },

  startHostLobby() {
    this.generateLobbyCode();
    this.isHost = true;

    const profile = DB.getStudentProfile();
    const myId = DB.getUserUUID();

    const hostName = (profile && profile.name) ? profile.name : 'Host Instructor';
    const hostGrade = profile ? (profile.section || profile.gradeLevel || 'Student') : 'Host';
    const hostPhoto = profile ? profile.photo : '';

    const initialLobby = {
      code: this.lobbyAccessCode,
      hostId: myId,
      host: {
        id: myId,
        name: hostName,
        grade: hostGrade,
        photo: hostPhoto
      },
      status: 'waiting',
      settings: {
        timeLimitSec: this.customTimeLimitSec || 20,
        questionCount: (this.questionsList && this.questionsList.length > 0) ? this.questionsList.length : (this.customQuestionCount || 15),
        maxParticipants: this.customMaxParticipants || 50,
        mode: this.currentMode || 'pre-test',
        format: this.currentQuestionFormat || 'multiple_choice',
        topic: this.currentTopic || 'Science Quiz',
        questionsList: this.questionsList || []
      },
      participants: [],
      kickedIds: [],
      lastUpdated: Date.now()
    };

    this.lobbyParticipants = [];
    this.saveLobbyData(initialLobby);
    this.initLobbySync(this.lobbyAccessCode);
    this.renderLobbyScreen();
    App.showScreen('lobbyScreen');
  },

  renderLobbyScreen() {
    const formattedCode = `${this.lobbyAccessCode.slice(0,3)} ${this.lobbyAccessCode.slice(3,6)} ${this.lobbyAccessCode.slice(6)}`;
    document.getElementById('lobbyCodeDisplay').textContent = formattedCode;
    
    const roleBadge = document.getElementById('lobbyRoleBadge');
    const hostBox = document.getElementById('lobbyHostBox');
    const hostActions = document.getElementById('lobbyHostActions');

    const lobbyData = this.currentLobbyData || this.getLobbyData(this.lobbyAccessCode);
    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23311042'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23C084FC'>👑</text></svg>";

    const profile = DB.getStudentProfile();
    const fallbackHostName = (profile && profile.name) ? profile.name : 'Host Instructor';

    const hostName = (lobbyData && lobbyData.host && lobbyData.host.name) ? lobbyData.host.name : fallbackHostName;
    const hostPhoto = (lobbyData && lobbyData.host && lobbyData.host.photo) ? lobbyData.host.photo : (profile ? profile.photo : '');

    if (this.isHost) {
      roleBadge.textContent = 'HOST LOBBY';
      hostBox.innerHTML = `
        <img src="${hostPhoto || defaultAvatar}" class="part-avatar" alt="Host">
        <div>
          <h4 style="margin:0; font-size:0.95rem; color:#FFFFFF; font-weight:700;">${hostName} (Host)</h4>
          <span style="font-size:0.75rem; color:#A5A3C4;">Waiting for players to enter code ${this.lobbyAccessCode}...</span>
        </div>
      `;
      hostActions.style.display = 'block';
    } else {
      roleBadge.textContent = 'PARTICIPANT LOBBY';
      hostBox.innerHTML = `
        <img src="${hostPhoto || defaultAvatar}" class="part-avatar" alt="Host">
        <div>
          <h4 style="margin:0; font-size:0.95rem; color:#FFFFFF; font-weight:700;">Host: ${hostName}</h4>
          <span style="font-size:0.75rem; color:#A5A3C4;">Waiting for host to press Start Quiz...</span>
        </div>
      `;
      hostActions.style.display = 'none';
    }

    if (lobbyData && lobbyData.participants) {
      this.lobbyParticipants = lobbyData.participants;
    }

    const participants = this.lobbyParticipants || [];
    document.getElementById('lobbyPartCount').textContent = `Participants Joined (${participants.length})`;
    const listEl = document.getElementById('lobbyPartList');
    listEl.innerHTML = '';

    if (participants.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:20px; color:#A5A3C4; font-size:0.85rem; font-weight:600;">
          No participants joined yet. Share code <b style="color:#C084FC;">${this.lobbyAccessCode}</b> to join!
        </div>
      `;
    } else {
      participants.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'lobby-part-card';
        card.style.background = 'rgba(25, 17, 50, 0.95)';
        card.style.border = '1.5px solid rgba(139, 92, 246, 0.35)';
        card.style.borderRadius = '16px';
        card.style.padding = '12px 16px';
        card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.35)';
        const displayName = p.name || p.display_name || 'Student Player';
        const photoUrl = p.photo || p.photo_url || null;
        const partAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%232E1065'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23C084FC'>👤</text></svg>";
        card.innerHTML = `
          <div class="part-info-left">
            <img src="${photoUrl || partAvatar}" class="part-avatar" style="width:36px; height:36px; border-radius:50%; border:1.5px solid #7C3AED;" alt="${displayName}">
            <div>
              <h5 style="margin:0; font-size:0.95rem; color:#FFFFFF; font-weight:700;">${displayName}</h5>
              <span style="font-size:0.72rem; color:#A5A3C4;">${p.grade || 'Student'}</span>
            </div>
          </div>
          ${this.isHost ? `
            <div style="display:flex; gap:6px;">
              <button class="view-profile-btn" onclick="Quiz.viewParticipantProfile(${idx})">View Profile</button>
              <button class="kick-btn" onclick="Quiz.kickParticipant(${idx})">Kick 🚫</button>
            </div>
          ` : ''}
        `;
        listEl.appendChild(card);
      });
    }
  },

  kickParticipant(idx) {
    const p = this.lobbyParticipants[idx];
    if (p && confirm(`Are you sure you want to kick ${p.name} from the lobby?`)) {
      const lobbyData = this.getLobbyData(this.lobbyAccessCode);
      if (lobbyData) {
        lobbyData.kickedIds = lobbyData.kickedIds || [];
        if (p.id) lobbyData.kickedIds.push(p.id);
        lobbyData.participants = lobbyData.participants.filter((item, i) => i !== idx);
        this.saveLobbyData(lobbyData);
      }
      this.lobbyParticipants.splice(idx, 1);
      this.renderLobbyScreen();
    }
  },

  viewParticipantProfile(idx) {
    const p = this.lobbyParticipants[idx];
    if (!p) return;
    const body = document.getElementById('partProfileBody');
    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23311042'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23C084FC'>👤</text></svg>";
    body.innerHTML = `
      <div style="text-align:center; padding:12px 0;">
        <img src="${p.photo || defaultAvatar}" style="width:180px; height:180px; border-radius:50%; margin-bottom:12px; object-fit:cover; border: 3px solid #A855F7; box-shadow: 0 0 26px rgba(168, 85, 247, 0.6);" alt="${p.name}">
        <h4 style="margin:0; font-size:1.25rem; color:#FFFFFF; font-weight:800; font-family: var(--font-heading);">${p.name}</h4>
        <p style="font-size:0.85rem; color:#A5A3C4; margin:4px 0 14px 0;">${p.grade || 'Student'}</p>
        <div style="display:flex; justify-content:space-around; background:rgba(255,255,255,0.06); border:1px solid rgba(139,92,246,0.25); padding:12px; border-radius:16px;">
          <div><strong style="font-size:1.1rem; color:#C084FC;">${p.points || 0}</strong><br><span style="font-size:0.75rem; color:#A5A3C4;">Total Pts</span></div>
          <div><strong style="font-size:1.1rem; color:#F87171;">🔥 ${p.streak || 0}</strong><br><span style="font-size:0.75rem; color:#A5A3C4;">Streak</span></div>
        </div>
      </div>
    `;
    document.getElementById('participantProfileModal').classList.remove('hidden');
  },

  async submitJoinCode() {
    const val = (document.getElementById('joinAccessCodeInput')?.value || '').trim().toUpperCase();
    const errorEl = document.getElementById('joinErrorMsg');

    if (!val || val.length < 5 || val.length > 8) {
      if (errorEl) {
        errorEl.textContent = '⚠️ Please enter a valid room access code!';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    const pinInput = document.getElementById('mpPinInput');
    if (pinInput) pinInput.value = val;
    this.hideJoinCodeModal();

    if (typeof Multiplayer !== 'undefined' && Multiplayer.submitJoinLobby) {
      return Multiplayer.submitJoinLobby();
    }
  },

  exitLobby() {
    if (confirm('Are you sure you want to exit the lobby?')) {
      if (this.isHost) {
        const lobbyData = this.getLobbyData(this.lobbyAccessCode);
        if (lobbyData) {
          lobbyData.status = 'cancelled';
          this.saveLobbyData(lobbyData);
        }
      }
      this.stopLobbySync();
      App.showScreen('homeScreen');
    }
  },

  startHostQuizGame() {
    if (this.isHost) {
      if (this.lobbyParticipants.length < 1) {
        alert('⚠️ At least 1 participant must join the lobby before you can start the quiz!');
        return;
      }
      const lobbyData = this.getLobbyData(this.lobbyAccessCode);
      if (lobbyData) {
        lobbyData.status = 'in_game';
        this.saveLobbyData(lobbyData);
      }
      this.startHostTrackingDashboard();
    } else {
      this.startQuiz(this.currentMode, this.currentQuestionFormat);
    }
  },

  startHostTrackingDashboard() {
    const formattedCode = `${this.lobbyAccessCode.slice(0,3)} ${this.lobbyAccessCode.slice(3,6)} ${this.lobbyAccessCode.slice(6)}`;
    document.getElementById('hostLiveCode').textContent = formattedCode;
    
    App.showScreen('hostLiveDashboardScreen');
    this.renderHostLiveDashboard();
  },

  renderHostLiveDashboard() {
    const tbody = document.getElementById('hostLiveTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const lobbyData = this.getLobbyData(this.lobbyAccessCode);
    const participants = (lobbyData && lobbyData.participants) ? lobbyData.participants : this.lobbyParticipants;

    const sorted = [...participants].sort((a, b) => (b.points || 0) - (a.points || 0));
    const totalQ = (lobbyData && lobbyData.settings && lobbyData.settings.questionCount)
      ? lobbyData.settings.questionCount
      : ((this.questionsList && this.questionsList.length > 0) ? this.questionsList.length : (this.customQuestionCount || 15));

    sorted.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:800; color:#6D28D9;">#${idx + 1}</td>
        <td style="font-weight:700;">${p.name} <br><span style="font-size:0.7rem; color:#64748B;">${p.grade || 'Student'}</span></td>
        <td style="font-weight:700;">${p.finished ? '<span style="color:#10B981;">Finished</span>' : `Q${p.currentQ || 1}/${totalQ}`}</td>
        <td style="color:#10B981; font-weight:800;">${p.correct || 0}</td>
        <td style="color:#EF4444; font-weight:800;">${p.incorrect || 0}</td>
        <td style="color:#F59E0B; font-weight:900;">${(p.points || 0).toLocaleString()} pts</td>
      `;
      tbody.appendChild(tr);
    });

    const allFinished = sorted.length > 0 && sorted.every(p => p.finished);
    if (allFinished) {
      document.getElementById('hostLiveStatusLabel').textContent = '✅ All Participants Finished!';
    }
  },

  endHostQuizEarly() {
    if (confirm('Are you sure you want to end the quiz early for all participants?')) {
      if (this.hostTrackInterval) clearInterval(this.hostTrackInterval);
      this.finishQuizHostView();
    }
  },

  finishQuizHostView() {
    const lobbyData = this.getLobbyData(this.lobbyAccessCode);
    const participants = (lobbyData && lobbyData.participants) ? lobbyData.participants : this.lobbyParticipants;
    const totalQ = (lobbyData && lobbyData.settings && lobbyData.settings.questionCount)
      ? lobbyData.settings.questionCount
      : ((this.questionsList && this.questionsList.length > 0) ? this.questionsList.length : (this.customQuestionCount || 15));

    const sorted = [...participants].sort((a, b) => (b.points || 0) - (a.points || 0));

    const analyticsData = {
      gameId: 'quiz_lobby_' + (this.lobbyAccessCode || Date.now()),
      roomCode: this.lobbyAccessCode || '000000',
      title: (lobbyData && lobbyData.settings && lobbyData.settings.topic) ? lobbyData.settings.topic : 'Science Host Quiz',
      totalQuestions: totalQ,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      participants: sorted.map(p => {
        const correct = p.correct || 0;
        const pct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
        return {
          name: p.name || 'Participant',
          points: p.points || 0,
          correct: correct,
          totalQuestions: totalQ,
          correctRatio: `${correct}/${totalQ}`,
          accuracyPct: pct
        };
      })
    };

    DB.saveHostedGameAnalytics(analyticsData);
    App.showScreen('homeScreen');
    alert('Host Live Quiz finished! Final participant scores saved.');
  },

  async prepareBuiltinQuestions() {
    let qTypeId = 1;
    if (this.currentQuestionFormat === 'true_false') qTypeId = 2;
    else if (this.currentQuestionFormat === 'identification') qTypeId = 3;

    let pool = await DB.getQuestions(this.currentTopicId, qTypeId, this.currentMode);
    if (pool.length === 0) pool = await DB.getQuestions(this.currentTopicId, qTypeId);
    pool = this.shuffleArray(pool);
    this.questionsList = pool.slice(0, this.customQuestionCount || 15);
  },

  // 6. Start Quiz Engine
  async startQuiz(mode, questionFormat) {
    this.currentIndex = 0;
    this.isAnswering = false;
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.totalScorePoints = 0;
    this.fastestAnswerSec = null;
    this.fastAnswersCount = 0;
    this.sessionTotalTimeSec = 0;
    this.sessionTopicStats = {};

    if (this.customFlowType !== 'host_custom') {
      await this.prepareBuiltinQuestions();
    }

    App.showScreen('gameplayScreen');
    this.renderQuestion();
  },

  // Helper: Contextual Icon Generator for MC Options
  getOptionIcon(text, index) {
    if (!text) return ['🧪', '⚛️', '🔬', '⚡'][index % 4];
    const lower = text.toLowerCase();
    
    if (lower.includes('heat') || lower.includes('fire') || lower.includes('temperature') || lower.includes('warm') || lower.includes('thermal') || lower.includes('burn') || lower.includes('combust')) {
      return '🔥';
    }
    if (lower.includes('gas') || lower.includes('vapor') || lower.includes('evaporat') || lower.includes('bubble') || lower.includes('air') || lower.includes('oxygen') || lower.includes('carbon')) {
      return '💨';
    }
    if (lower.includes('liquid') || lower.includes('water') || lower.includes('fluid') || lower.includes('solution') || lower.includes('acid') || lower.includes('base') || lower.includes('aqueous')) {
      return '💧';
    }
    if (lower.includes('solid') || lower.includes('precipitat') || lower.includes('down') || lower.includes('crystal') || lower.includes('sediment') || lower.includes('metal') || lower.includes('rock')) {
      return '🔻';
    }
    if (lower.includes('electricity') || lower.includes('power') || lower.includes('voltage') || lower.includes('current') || lower.includes('charge') || lower.includes('electron') || lower.includes('energy')) {
      return '⚡';
    }
    if (lower.includes('light') || lower.includes('sun') || lower.includes('solar') || lower.includes('photon') || lower.includes('ray')) {
      return '☀️';
    }
    if (lower.includes('force') || lower.includes('motion') || lower.includes('speed') || lower.includes('velocity') || lower.includes('accel') || lower.includes('projectile') || lower.includes('momentum') || lower.includes('collision')) {
      return '🚀';
    }
    if (lower.includes('cell') || lower.includes('dna') || lower.includes('gene') || lower.includes('bio') || lower.includes('organism') || lower.includes('homeostasis') || lower.includes('life')) {
      return '🧬';
    }
    if (lower.includes('earth') || lower.includes('plate') || lower.includes('tectonic') || lower.includes('volcano') || lower.includes('climate') || lower.includes('ecosystem') || lower.includes('global')) {
      return '🌍';
    }
    if (lower.includes('chemical') || lower.includes('reaction') || lower.includes('atom') || lower.includes('element') || lower.includes('compound') || lower.includes('molecule')) {
      return '⚛️';
    }
    
    const fallbacks = ['🧪', '⚛️', '🔬', '⚡'];
    return fallbacks[index % fallbacks.length];
  },

  // 7. Render Active Question
  renderQuestion() {
    clearInterval(this.timerInterval);
    this.isAnswering = false;

    if (!this.questionsList || this.currentIndex >= this.questionsList.length) {
      this.finishQuiz();
      return;
    }

    const q = this.questionsList[this.currentIndex];
    if (!q) {
      this.finishQuiz();
      return;
    }

    // Header info
    document.getElementById('questionCounter').textContent = `Question ${this.currentIndex + 1} of ${this.questionsList.length}`;
    document.getElementById('scorePointsText').textContent = `Points: ${this.totalScorePoints.toLocaleString()}`;
    const streakEl = document.getElementById('streakCounter');
    if (streakEl) streakEl.textContent = `🔥 ${this.streak}`;

    document.getElementById('quizModeTag').textContent = `${this.currentMode.toUpperCase()} (${this.currentQuestionFormat.toUpperCase()}) • ${this.currentTopic || 'Science'}`;
    document.getElementById('questionText').textContent = q.question;

    // Feedback reset
    const feedback = document.getElementById('feedbackBanner');
    if (feedback) feedback.className = 'feedback-banner hidden';

    // Render Answer Options according to question format
    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    if (this.currentQuestionFormat === 'true_false') {
      const tfData = [
        { label: 'True', letter: 'T' },
        { label: 'False', letter: 'F' }
      ];
      tfData.forEach((tf) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option-btn tf-option-btn';
        btn.innerHTML = `
          <span class="option-badge-pill">
            <span class="badge-letter">${tf.letter}</span>
          </span>
          <span class="option-text">${tf.label}</span>
        `;
        btn.onclick = () => this.handleAnswer(tf.label);
        container.appendChild(btn);
      });
    } else if (this.currentQuestionFormat === 'identification') {
      const wrap = document.createElement('div');
      wrap.className = 'identification-wrapper';
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '12px';
      wrap.style.width = '100%';

      wrap.innerHTML = `
        <input type="text" id="identificationInput" placeholder="Type your answer here..." class="identification-input-field" autocomplete="off">
        <button id="identificationSubmitBtn" class="next-question-btn">
          Submit Answer <span class="arrow-pill">➡</span>
        </button>
      `;
      container.appendChild(wrap);

      const inputEl = document.getElementById('identificationInput');
      const submitBtn = document.getElementById('identificationSubmitBtn');

      submitBtn.onclick = () => {
        const textVal = inputEl.value.trim();
        this.handleAnswer(textVal);
      };

      inputEl.onkeyup = (e) => {
        if (e.key === 'Enter') {
          submitBtn.click();
        }
      };
      setTimeout(() => inputEl.focus(), 100);
    } else {
      // Multiple Choice (4 choices)
      const prefixes = ['A', 'B', 'C', 'D'];
      let opts = (q.options && q.options.length > 0) ? q.options : [q.choice_a || q.option_a, q.choice_b || q.option_b, q.choice_c || q.option_c, q.choice_d || q.option_d].filter(c => c && String(c).trim() !== '');
      if (opts.length === 0) {
        opts = ['Option A', 'Option B', 'Option C', 'Option D'];
      }
      opts.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option-btn';
        btn.innerHTML = `
          <span class="option-badge-pill">
            <span class="badge-letter">${prefixes[index] || 'A'}</span>
          </span>
          <span class="option-text">${optText}</span>
        `;
        btn.onclick = () => this.handleAnswer(index);
        container.appendChild(btn);
      });
    }

    // Start Digital Timer with custom set time limit
    this.timeRemainingSec = this.customTimeLimitSec || 20;
    this.questionStartTime = Date.now();
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeRemainingSec--;
      this.updateTimerDisplay();

      if (this.timeRemainingSec <= 0) {
        clearInterval(this.timerInterval);
        // Do not auto-popup feedback card on timeout; wait for user to pick an answer
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const valEl = document.getElementById('speedTimerValue');
    if (valEl) {
      const secs = Math.max(0, this.timeRemainingSec);
      valEl.textContent = `${secs < 10 ? '0' : ''}${secs}.00s`;
    }
  },

  nextQuestion() {
    this.currentIndex++;
    this.renderQuestion();
  },

  // 8. Process Answer Selection / Submission
  handleAnswer(userSelection) {
    if (this.isAnswering) return;
    this.isAnswering = true;
    clearInterval(this.timerInterval);

    if (!this.questionsList || this.currentIndex >= this.questionsList.length) {
      this.finishQuiz();
      return;
    }

    const q = this.questionsList[this.currentIndex];
    if (!q) {
      this.finishQuiz();
      return;
    }

    const timeSpentSec = (Date.now() - this.questionStartTime) / 1000;
    this.sessionTotalTimeSec += timeSpentSec;

    if (this.fastestAnswerSec === null || timeSpentSec < this.fastestAnswerSec) {
      this.fastestAnswerSec = timeSpentSec;
    }
    if (timeSpentSec < 3) this.fastAnswersCount++;

    let isCorrect = false;
    if (typeof DB !== 'undefined' && DB.evaluateAnswerCorrectness) {
      isCorrect = DB.evaluateAnswerCorrectness(q, userSelection);
    }

    if (this.currentQuestionFormat === 'true_false') {
      const correctStr = String(q.rawAnswer || q.equivalent_answer || q.correct_answer || (q.options ? q.options[q.answer] : '') || 'True').trim().toLowerCase();
      const selStr = String(userSelection).trim().toLowerCase();
      if (typeof DB === 'undefined' || !DB.evaluateAnswerCorrectness) {
        isCorrect = (correctStr === selStr || (correctStr.startsWith('t') && selStr.startsWith('t')) || (correctStr.startsWith('f') && selStr.startsWith('f')));
      }

      const buttons = document.querySelectorAll('.tf-option-btn');
      buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.trim().toLowerCase().includes(correctStr)) btn.classList.add('correct-choice');
        else if (btn.textContent.trim().toLowerCase().includes(selStr) && !isCorrect) btn.classList.add('wrong-choice');
      });
    } else if (this.currentQuestionFormat === 'identification') {
      const correctStr = String(q.rawAnswer || q.counterpart || q.equivalent_answer || q.correct_answer || (q.options ? q.options[q.answer] : '') || '').trim().toLowerCase();
      const selStr = String(userSelection).trim().toLowerCase();
      if (typeof DB === 'undefined' || !DB.evaluateAnswerCorrectness) {
        isCorrect = (selStr !== '' && (correctStr === selStr || correctStr.includes(selStr) || selStr.includes(correctStr)));
      }

      const inputEl = document.getElementById('identificationInput');
      const submitBtn = document.getElementById('identificationSubmitBtn');
      if (inputEl) inputEl.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
    } else {
      // Multiple Choice
      if (typeof DB === 'undefined' || !DB.evaluateAnswerCorrectness) {
        const letterMap = { 0: 'A', 1: 'B', 2: 'C', 3: 'D' };
        const userLetter = letterMap[userSelection] || String(userSelection).toUpperCase();
        const corrStr = String(q.correct_answer || q.correctAnswer || q.answer || '').toUpperCase();
        const eqStr = String(q.equivalent_answer || q.equivalentAnswer || '').toUpperCase();
        isCorrect = (userSelection === q.answer) || (userLetter === corrStr) || (eqStr && String(userSelection).toUpperCase() === eqStr);
      }

      let correctIndex = typeof q.answer === 'number' ? q.answer : -1;
      if (correctIndex < 0) {
        const corrLetter = String(q.correct_answer || q.correctAnswer || 'A').toUpperCase();
        const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, '0': 0, '1': 1, '2': 2, '3': 3 };
        if (letterToIndex[corrLetter] !== undefined) correctIndex = letterToIndex[corrLetter];
      }

      const buttons = document.querySelectorAll('.answer-option-btn');
      buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIndex) {
          btn.classList.add('correct-choice');
        } else if (idx === userSelection && !isCorrect) {
          btn.classList.add('wrong-choice');
        }
      });
    }

    if (!this.sessionTopicStats[this.currentTopic]) {
      this.sessionTopicStats[this.currentTopic] = { total: 0, correct: 0 };
    }
    this.sessionTopicStats[this.currentTopic].total++;

    const feedback = document.getElementById('feedbackBanner');
    const statusTextEl = document.getElementById('feedbackText');
    const subTextEl = document.getElementById('feedbackAnswerSub');

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      this.sessionTopicStats[this.currentTopic].correct++;

      const timeBonus = Math.max(0, this.timeRemainingSec) * 10;
      let multiplier = 1.0;
      if (this.streak >= 5) multiplier = 2.0;
      else if (this.streak >= 3) multiplier = 1.5;
      else if (this.streak >= 2) multiplier = 1.2;

      const earned = Math.round((100 + timeBonus) * multiplier);
      this.totalScorePoints += earned;

      if (feedback) feedback.className = 'feedback-banner correct';
      if (statusTextEl) statusTextEl.textContent = `✅ Correct! +${earned} pts`;
      if (subTextEl) subTextEl.textContent = '';
    } else {
      this.incorrectCount++;
      this.streak = 0;
      if (feedback) feedback.className = 'feedback-banner wrong';
      const prefixes = ['A', 'B', 'C', 'D'];
      let correctDisplay = '';
      if (q.options && typeof q.answer === 'number' && q.options[q.answer]) {
        correctDisplay = `${prefixes[q.answer] || ''}: ${q.options[q.answer]}`;
      } else if (q.rawAnswer || q.correct_answer) {
        correctDisplay = q.rawAnswer || q.correct_answer;
      } else if (q.choice_a || q.option_a) {
        correctDisplay = q.choice_a || q.option_a;
      }
      if (statusTextEl) statusTextEl.textContent = `❌ Incorrect!`;
      if (subTextEl) subTextEl.innerHTML = `Correct Answer: <b>${correctDisplay}</b>`;
    }

    document.getElementById('scorePointsText').textContent = `Points: ${this.totalScorePoints.toLocaleString()}`;
    const streakEl = document.getElementById('streakCounter');
    if (streakEl) {
      streakEl.textContent = `🔥 ${this.streak}`;
      streakEl.classList.remove('streak-pop');
      void streakEl.offsetWidth; // trigger reflow
      if (this.streak > 0) streakEl.classList.add('streak-pop');
    }
    this.updateParticipantLobbyProgress();
  },

  handleTimeOut() {
    if (this.isAnswering) return;
    this.isAnswering = true;
    clearInterval(this.timerInterval);

    if (!this.questionsList || this.currentIndex >= this.questionsList.length) {
      this.finishQuiz();
      return;
    }

    const q = this.questionsList[this.currentIndex];
    if (!q) {
      this.finishQuiz();
      return;
    }

    this.incorrectCount++;
    this.streak = 0;
    this.sessionTotalTimeSec += 20;

    if (!this.sessionTopicStats[this.currentTopic]) {
      this.sessionTopicStats[this.currentTopic] = { total: 0, correct: 0 };
    }
    this.sessionTopicStats[this.currentTopic].total++;

    const streakEl = document.getElementById('streakCounter');
    if (streakEl) streakEl.textContent = `🔥 ${this.streak}`;

    const feedback = document.getElementById('feedbackBanner');
    const statusTextEl = document.getElementById('feedbackText');
    const subTextEl = document.getElementById('feedbackAnswerSub');

    const prefixes = ['A', 'B', 'C', 'D'];
    let correctDisplay = '';
    if (q.options && typeof q.answer === 'number' && q.options[q.answer]) {
      correctDisplay = `${prefixes[q.answer] || ''}: ${q.options[q.answer]}`;
    } else if (q.rawAnswer || q.correct_answer) {
      correctDisplay = q.rawAnswer || q.correct_answer;
    } else if (q.choice_a || q.option_a) {
      correctDisplay = q.choice_a || q.option_a;
    }

    // Disable input options according to question format
    if (this.currentQuestionFormat === 'true_false') {
      const correctStr = String(q.rawAnswer || (q.options ? q.options[q.answer] : '') || 'True').trim().toLowerCase();
      const buttons = document.querySelectorAll('.tf-option-btn');
      buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.trim().toLowerCase().includes(correctStr)) btn.classList.add('correct-choice');
      });
    } else if (this.currentQuestionFormat === 'identification') {
      const inputEl = document.getElementById('identificationInput');
      const submitBtn = document.getElementById('identificationSubmitBtn');
      if (inputEl) inputEl.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
    } else {
      const buttons = document.querySelectorAll('.answer-option-btn');
      buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.answer) btn.classList.add('correct-choice');
      });
    }

    if (feedback) feedback.className = 'feedback-banner wrong';
    if (statusTextEl) statusTextEl.textContent = `❌ Incorrect!`;
    if (subTextEl) subTextEl.innerHTML = `Correct Answer: <b>${correctDisplay}</b>`;
    this.updateParticipantLobbyProgress();
  },

  finishQuiz() {
    clearInterval(this.timerInterval);
    this.isAnswering = true;
    const totalQ = this.questionsList.length;
    const percentage = Math.round((this.correctCount / totalQ) * 100);

    const resultObj = {
      term: this.currentTerm,
      topic: this.currentTopic,
      mode: this.currentMode,
      format: this.currentQuestionFormat,
      scorePct: percentage,
      scorePoints: this.totalScorePoints,
      correctCount: this.correctCount,
      incorrectCount: this.incorrectCount,
      maxStreak: this.maxStreak,
      totalTimeSec: Math.round(this.sessionTotalTimeSec),
      topicStats: this.sessionTopicStats,
      timestamp: new Date().toISOString()
    };

    DB.saveQuizResult(resultObj);

    const profile = DB.getStudentProfile();
    if (profile) {
      profile.totalPoints = (profile.totalPoints || 0) + this.totalScorePoints;
      if (this.maxStreak > (profile.streak || 0)) profile.streak = this.maxStreak;
      DB.saveStudentProfile(profile);
      App.updateUserHeader();
    }

    // Interactive Character Progression: Pass rewards through TaskSystem
    if (typeof TaskSystem !== 'undefined') {
      // 1. Complete a quiz (+10 XP)
      TaskSystem.completeTask(`quiz_complete_${Date.now()}`, `Completed Quiz`, 10);

      // 2. High Score Bonus (+10 XP if score >= 80%)
      if (percentage >= 80) {
        TaskSystem.completeTask(`high_score_${Date.now()}`, `High Score (≥80%)`, 10);
      }

      // 3. Finish a topic (+15 XP)
      if (this.currentTopic) {
        TaskSystem.completeTask(`topic_finish_${this.currentTerm}_${this.currentTopic}_${Date.now()}`, `Finished Topic: ${this.currentTopic}`, 15);
      }

      // 4. Award Science XP (+5 XP per correct answer + 20 bonus for 100%)
      const xpEarned = (this.correctCount * 5) + (percentage >= 100 ? 20 : 0);
      if (typeof ProgressionSystem !== 'undefined' && ProgressionSystem.addXP && xpEarned > 0) {
        ProgressionSystem.addXP(xpEarned, `Quiz Performance (${this.correctCount} correct)`);
      }

      // 5. Maintain a streak (+5 XP if maxStreak >= 3)
      if (this.maxStreak >= 3) {
        TaskSystem.completeTask(`streak_${Date.now()}`, `Streak Bonus (🔥 ${this.maxStreak})`, 5);
      }

      // 6. Award Science Coins ONLY for 100% Perfect Test Score (100% Correct, 0 Wrong Answers)
      if (this.incorrectCount === 0 && this.correctCount === totalQ && totalQ > 0) {
        const bonusCoins = 25; // 25 Science Coins awarded only for 100% correct
        if (typeof ProgressionSystem !== 'undefined' && ProgressionSystem.addCoins) {
          ProgressionSystem.addCoins(bonusCoins);
        }
      }
    }

    Achievements.evaluateSession({
      term: this.currentTerm,
      totalQuestions: totalQ,
      correctCount: this.correctCount,
      incorrectCount: this.incorrectCount,
      scorePoints: this.totalScorePoints,
      streak: this.maxStreak,
      totalTimeSec: this.sessionTotalTimeSec,
      fastestAnswerSec: this.fastestAnswerSec,
      fastAnswersCount: this.fastAnswersCount
    });

    document.getElementById('resultPercentage').textContent = `${percentage}%`;
    document.getElementById('resultTotalPoints').textContent = `+${this.totalScorePoints.toLocaleString()}`;
    document.getElementById('resultCorrectCount').textContent = this.correctCount;
    document.getElementById('resultIncorrectCount').textContent = this.incorrectCount;

    const coinBanner = document.getElementById('perfectScoreCoinBanner');
    if (this.incorrectCount === 0 && this.correctCount === totalQ && totalQ > 0) {
      if (coinBanner) {
        coinBanner.innerHTML = `🪙 <b>PERFECT SCORE BONUS!</b> +25 Science Coins (100% Correct) 🎉`;
        coinBanner.classList.remove('hidden');
      }
    } else {
      if (coinBanner) {
        coinBanner.classList.add('hidden');
      }
    }

    const recCard = document.getElementById('recommendationBanner');
    if (percentage < 50) {
      recCard.classList.remove('hidden');
      document.getElementById('recommendationText').innerHTML = 
        `Your score was below 50%. We recommend reviewing <b>${this.currentTopic}</b> before taking your post-test again!`;
    } else {
      recCard.classList.add('hidden');
    }

    App.showScreen('resultsScreen');
  },

  quitQuiz() {
    if (confirm('Are you sure you want to quit this round? Progress will not be saved.')) {
      clearInterval(this.timerInterval);
      App.showScreen('topicScreen');
    }
  },

  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};
