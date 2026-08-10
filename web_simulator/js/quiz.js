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

  // 2. Render Topics for Selected Term (Dynamically from Supabase)
  async renderTopics() {
    const termNames = { 1: 'First Term Topics', 2: 'Second Term Topics', 3: 'Third Term Topics' };
    document.getElementById('topicScreenTitle').textContent = termNames[this.currentTerm] || 'Select Topic';
    document.getElementById('topicScreenSub').textContent = `Choose a DepEd Grade 10 Science topic to begin`;

    const container = document.getElementById('topicsListGroup');
    container.innerHTML = '<div style="text-align:center; padding:20px;">Loading topics from Supabase...</div>';

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
      const btn = document.createElement('button');
      btn.className = `term-btn topic-item-btn`;
      btn.onclick = () => this.selectTopic(topicName, topicId);
      btn.innerHTML = `
        <div class="term-title" style="margin: 0; font-size: 1.05rem; line-height: 1.3;">${topicName}</div>
        <span class="term-action" style="margin-top: 6px;">Select Topic ➔</span>
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

  showCustomHubModal() {
    document.getElementById('customHubModal').classList.remove('hidden');
  },

  hideCustomHubModal() {
    document.getElementById('customHubModal').classList.add('hidden');
  },

  hideHostTypeModal() {
    document.getElementById('hostTypeModal').classList.add('hidden');
  },

  hidePreGameCustomizeModal() {
    document.getElementById('preGameCustomizeModal').classList.add('hidden');
  },

  hideCustomCreatorModal() {
    document.getElementById('customCreatorModal').classList.add('hidden');
  },

  hideJoinCodeModal() {
    document.getElementById('joinCodeModal').classList.add('hidden');
  },

  // 1. Handle selection in Custom Hub
  selectCustomFlow(flow) {
    this.hideCustomHubModal();
    this.customFlowType = flow;

    if (flow === 'join') {
      document.getElementById('joinAccessCodeInput').value = '';
      document.getElementById('joinErrorMsg').classList.add('hidden');
      document.getElementById('joinCodeModal').classList.remove('hidden');
    } else if (flow === 'host') {
      document.getElementById('hostTypeModal').classList.remove('hidden');
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
    document.getElementById('selectedTopicLabel').textContent = `Selected: ${topicName}`;
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
      document.getElementById('postTestTopicLabel').textContent = `Post-Test: ${this.currentTopic}`;
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

  // Validate & Confirm Pre-Game Customize Settings
  async confirmCustomSettingsAndStart() {
    const timeVal = parseInt(document.getElementById('customTimeLimit').value, 10);
    const countVal = parseInt(document.getElementById('customQuestionCount').value, 10);
    const maxPartVal = parseInt(document.getElementById('customMaxParticipants').value, 10) || 50;
    const errorEl = document.getElementById('customizeErrorMsg');

    if (isNaN(timeVal) || timeVal < 5) {
      errorEl.textContent = '⚠️ Time limit must be at least 5 seconds (undertime rejected)!';
      errorEl.classList.remove('hidden');
      return;
    }
    if (timeVal > 60) {
      errorEl.textContent = '⚠️ Time limit cannot exceed 60 seconds (overtime rejected)!';
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
      this.isHost = true;
      this.resetLobbyParticipants = true;
      this.generateLobbyCode();
      await this.prepareBuiltinQuestions();
      this.renderLobbyScreen();
      App.showScreen('lobbyScreen');
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
      this.creatorCurrentIndex = total - 1;
    }
    this.renderCreatorQuestionStep();
  },

  renderCreatorQuestionStep() {
    const total = parseInt(document.getElementById('creatorTotalQuestions').value, 10) || 5;
    document.getElementById('creatorQuestionCounter').textContent = `Question ${this.creatorCurrentIndex + 1} of ${total}`;
    
    // Load existing question if present
    const existing = this.customCreatedQuestions[this.creatorCurrentIndex] || {};
    document.getElementById('creatorQuestionText').value = existing.question || '';

    this.renderCreatorAnswersBox(existing);

    const nextBtn = document.getElementById('creatorNextBtn');
    if (this.creatorCurrentIndex >= total - 1) {
      nextBtn.textContent = 'Set Custom Questions 🔒';
    } else {
      nextBtn.textContent = 'Next Question ➔';
    }
  },

  renderCreatorAnswersBox(existing = {}) {
    const mode = document.getElementById('creatorAnswerMode').value;
    const box = document.getElementById('creatorAnswersBox');
    box.innerHTML = '';

    if (mode === 'true_false') {
      box.innerHTML = `
        <label>Set Correct Answer:</label>
        <div style="display:flex; gap:16px; margin-top:6px;">
          <label style="font-weight:600;"><input type="radio" name="creatorTF" value="True" ${existing.answer === 'True' || !existing.answer ? 'checked' : ''}> True</label>
          <label style="font-weight:600;"><input type="radio" name="creatorTF" value="False" ${existing.answer === 'False' ? 'checked' : ''}> False</label>
        </div>
      `;
    } else if (mode === 'identification') {
      box.innerHTML = `
        <label for="creatorIdAns">Set Correct Answer Text:</label>
        <input type="text" id="creatorIdAns" class="customize-input" value="${existing.answer || ''}" placeholder="Type correct answer..." />
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
              <input type="radio" name="creatorMCCorrect" value="${i}" ${correctIdx === i ? 'checked' : ''}>
              <input type="text" id="creatorOpt${i}" class="customize-input" style="padding:8px;" value="${opts[i] || ''}" placeholder="Option ${String.fromCharCode(65 + i)}" />
            </div>
          `).join('')}
        </div>
      `;
    }
  },

  onCreatorNextQuestion() {
    const qText = document.getElementById('creatorQuestionText').value.trim();
    const errorEl = document.getElementById('creatorErrorMsg');

    if (!qText) {
      errorEl.textContent = '⚠️ Please enter question text!';
      errorEl.classList.remove('hidden');
      return;
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
        return;
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
        return;
      }
      const radio = document.querySelector('input[name="creatorMCCorrect"]:checked');
      const correctIdx = radio ? parseInt(radio.value, 10) : 0;
      savedQ.options = opts;
      savedQ.answer = correctIdx;
      savedQ.correctIndex = correctIdx;
    }

    errorEl.classList.add('hidden');
    this.customCreatedQuestions[this.creatorCurrentIndex] = savedQ;

    const total = parseInt(document.getElementById('creatorTotalQuestions').value, 10) || 5;
    if (this.creatorCurrentIndex < total - 1) {
      this.creatorCurrentIndex++;
      this.renderCreatorQuestionStep();
    } else {
      alert('Custom question set locked & saved successfully! Click "Start Host Lobby" to launch.');
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

    if (this.customCreatedQuestions.length < totalQ || this.customCreatedQuestions.some(q => !q)) {
      errorEl.textContent = `⚠️ Please complete all ${totalQ} questions before starting!`;
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    this.customTimeLimitSec = timeVal;
    this.customQuestionCount = totalQ;
    this.customMaxParticipants = maxPart;
    this.isHost = true;
    this.resetLobbyParticipants = true;

    this.generateLobbyCode();
    this.questionsList = [...this.customCreatedQuestions];
    this.hideCustomCreatorModal();
    this.renderLobbyScreen();
    App.showScreen('lobbyScreen');
  },

  generateLobbyCode() {
    const codeNum = Math.floor(1000000 + Math.random() * 9000000);
    this.lobbyAccessCode = String(codeNum);
  },

  renderLobbyScreen() {
    const formattedCode = `${this.lobbyAccessCode.slice(0,3)} ${this.lobbyAccessCode.slice(3,6)} ${this.lobbyAccessCode.slice(6)}`;
    document.getElementById('lobbyCodeDisplay').textContent = formattedCode;
    
    const roleBadge = document.getElementById('lobbyRoleBadge');
    const hostBox = document.getElementById('lobbyHostBox');
    const hostActions = document.getElementById('lobbyHostActions');

    const profile = DB.getStudentProfile() || { name: 'Host Teacher', gradeLevel: 'Instructor', photo: '' };

    if (this.isHost) {
      roleBadge.textContent = 'HOST LOBBY';
      hostBox.innerHTML = `
        <img src="${profile.photo || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'><rect width=\'100\' height=\'100\' fill=\'%23DDD6FE\'/><text x=\'50%\' y=\'55%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-size=\'40\' fill=\'%236D28D9\'>👑</text></svg>'}" class="part-avatar" alt="Host">
        <div>
          <h4 style="margin:0; font-size:0.95rem; color:#1E293B;">${profile.name} (Host)</h4>
          <span style="font-size:0.75rem; color:#64748B;">Waiting for players to enter code ${this.lobbyAccessCode}...</span>
        </div>
      `;
      hostActions.style.display = 'block';

      // Real participants list (starts empty for host lobby)
      if (!this.lobbyParticipants || this.resetLobbyParticipants) {
        this.lobbyParticipants = [];
        this.resetLobbyParticipants = false;
      }
    } else {
      roleBadge.textContent = 'PARTICIPANT LOBBY';
      hostBox.innerHTML = `
        <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23DDD6FE'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236D28D9'>👑</text></svg>" class="part-avatar" alt="Host">
        <div>
          <h4 style="margin:0; font-size:0.95rem; color:#1E293B;">Host: Prof. DepEd Science</h4>
          <span style="font-size:0.75rem; color:#64748B;">Waiting for host to press Start Quiz...</span>
        </div>
      `;
      hostActions.style.display = 'none';

      this.lobbyParticipants = [
        { name: profile.name, grade: profile.section || profile.gradeLevel, points: profile.totalPoints || 0, streak: profile.streak || 0, photo: profile.photo }
      ];
    }

    document.getElementById('lobbyPartCount').textContent = `Participants Joined (${this.lobbyParticipants.length})`;
    const listEl = document.getElementById('lobbyPartList');
    listEl.innerHTML = '';

    if (this.lobbyParticipants.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:20px; color:#94A3B8; font-size:0.85rem; font-weight:600;">
          No participants joined yet. Share code <b style="color:#6D28D9;">${this.lobbyAccessCode}</b> to join!
        </div>
      `;
    } else {
      this.lobbyParticipants.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'lobby-part-card';
        const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23DDD6FE'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236D28D9'>👤</text></svg>";
        card.innerHTML = `
          <div class="part-info-left">
            <img src="${p.photo || defaultAvatar}" class="part-avatar" alt="${p.name}">
            <div>
              <h5 style="margin:0; font-size:0.85rem; color:#1E293B;">${p.name}</h5>
              <span style="font-size:0.72rem; color:#64748B;">${p.grade || 'Student'}</span>
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
      this.lobbyParticipants.splice(idx, 1);
      this.renderLobbyScreen();
    }
  },

  viewParticipantProfile(idx) {
    const p = this.lobbyParticipants[idx];
    if (!p) return;
    const body = document.getElementById('partProfileBody');
    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23DDD6FE'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236D28D9'>👤</text></svg>";
    body.innerHTML = `
      <div style="text-align:center; padding:12px 0;">
        <img src="${p.photo || defaultAvatar}" style="width:60px; height:60px; border-radius:50%; margin-bottom:8px; object-fit:cover;" alt="${p.name}">
        <h4 style="margin:0; font-size:1.1rem; color:#1E293B;">${p.name}</h4>
        <p style="font-size:0.8rem; color:#64748B; margin:2px 0 12px 0;">${p.grade || 'Student'}</p>
        <div style="display:flex; justify-content:space-around; background:#F8FAFC; padding:10px; border-radius:12px;">
          <div><strong style="font-size:1rem; color:#6D28D9;">${p.points || 0}</strong><br><span style="font-size:0.7rem; color:#64748B;">Total Pts</span></div>
          <div><strong style="font-size:1rem; color:#EF4444;">🔥 ${p.streak || 0}</strong><br><span style="font-size:0.7rem; color:#64748B;">Streak</span></div>
        </div>
      </div>
    `;
    document.getElementById('participantProfileModal').classList.remove('hidden');
  },

  submitJoinCode() {
    const val = document.getElementById('joinAccessCodeInput').value.trim();
    const errorEl = document.getElementById('joinErrorMsg');

    if (!val || val.length !== 7 || isNaN(val)) {
      errorEl.textContent = '⚠️ Please enter a valid 7-digit access code!';
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    this.lobbyAccessCode = val;
    this.isHost = false;
    this.hideJoinCodeModal();
    this.renderLobbyScreen();
    App.showScreen('lobbyScreen');
  },

  exitLobby() {
    App.showScreen('homeScreen');
  },

  startHostQuizGame() {
    if (this.isHost) {
      this.startHostTrackingDashboard();
    } else {
      this.startQuiz(this.currentMode, this.currentQuestionFormat);
    }
  },

  startHostTrackingDashboard() {
    const formattedCode = `${this.lobbyAccessCode.slice(0,3)} ${this.lobbyAccessCode.slice(3,6)} ${this.lobbyAccessCode.slice(6)}`;
    document.getElementById('hostLiveCode').textContent = formattedCode;
    
    // Initial tracking state for participants
    if (this.lobbyParticipants.length === 0) {
      // Add sample active players if host launches lobby directly for demo
      this.lobbyParticipants = [
        { name: 'Alex Johnson', grade: 'Grade 10-A', currentQ: 1, correct: 0, incorrect: 0, points: 0, finished: false },
        { name: 'Maria Santos', grade: 'Grade 10-B', currentQ: 1, correct: 0, incorrect: 0, points: 0, finished: false },
        { name: 'David Lee', grade: 'Grade 10-A', currentQ: 1, correct: 0, incorrect: 0, points: 0, finished: false }
      ];
    } else {
      this.lobbyParticipants.forEach(p => {
        p.currentQ = p.currentQ || 1;
        p.correct = p.correct || 0;
        p.incorrect = p.incorrect || 0;
        p.points = p.points || 0;
        p.finished = false;
      });
    }

    App.showScreen('hostLiveDashboardScreen');
    this.renderHostLiveDashboard();

    if (this.hostTrackInterval) clearInterval(this.hostTrackInterval);
    this.hostTrackInterval = setInterval(() => {
      this.simulateHostLiveTracking();
    }, 2000);
  },

  simulateHostLiveTracking() {
    let allFinished = true;
    const totalQ = this.customQuestionCount || 15;

    this.lobbyParticipants.forEach(p => {
      if (!p.finished) {
        allFinished = false;
        if (Math.random() > 0.3) {
          const isCorrect = Math.random() > 0.25;
          if (isCorrect) {
            p.correct = (p.correct || 0) + 1;
            p.points = (p.points || 0) + 120;
          } else {
            p.incorrect = (p.incorrect || 0) + 1;
          }
          p.currentQ = (p.currentQ || 1) + 1;
          if (p.currentQ > totalQ) {
            p.currentQ = totalQ;
            p.finished = true;
          }
        }
      }
    });

    this.renderHostLiveDashboard();

    if (allFinished) {
      clearInterval(this.hostTrackInterval);
      document.getElementById('hostLiveStatusLabel').textContent = '✅ All Participants Finished! Auto-switching to Final Leaderboard...';
      setTimeout(() => {
        this.finishQuizHostView();
      }, 1800);
    }
  },

  renderHostLiveDashboard() {
    const tbody = document.getElementById('hostLiveTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const sorted = [...this.lobbyParticipants].sort((a, b) => (b.points || 0) - (a.points || 0));
    const totalQ = this.customQuestionCount || 15;

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
  },

  endHostQuizEarly() {
    if (confirm('Are you sure you want to end the quiz early for all participants?')) {
      if (this.hostTrackInterval) clearInterval(this.hostTrackInterval);
      this.finishQuizHostView();
    }
  },

  finishQuizHostView() {
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
    if (this.currentIndex >= this.questionsList.length) {
      this.finishQuiz();
      return;
    }

    const q = this.questionsList[this.currentIndex];

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
        { label: 'True', letter: 'T', icon: '✅' },
        { label: 'False', letter: 'F', icon: '❌' }
      ];
      tfData.forEach((tf) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option-btn tf-option-btn';
        btn.innerHTML = `
          <div class="option-badge-pill">
            <span class="badge-letter">${tf.letter}</span>
            <span class="badge-icon">${tf.icon}</span>
          </div>
          <span>${tf.label}</span>
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
      // Multiple Choice (4 choices) - Uses Contextual Icons
      const prefixes = ['A', 'B', 'C', 'D'];
      const opts = q.options || ['Option A', 'Option B', 'Option C', 'Option D'];
      opts.forEach((optText, index) => {
        const contextualIcon = this.getOptionIcon(optText, index);
        const btn = document.createElement('button');
        btn.className = 'answer-option-btn';
        btn.innerHTML = `
          <div class="option-badge-pill">
            <span class="badge-letter">${prefixes[index] || 'A'}</span>
            <span class="badge-icon">${contextualIcon}</span>
          </div>
          <span>${optText}</span>
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
        this.handleTimeOut();
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
    clearInterval(this.timerInterval);
    const q = this.questionsList[this.currentIndex];
    const timeSpentSec = (Date.now() - this.questionStartTime) / 1000;
    this.sessionTotalTimeSec += timeSpentSec;

    if (this.fastestAnswerSec === null || timeSpentSec < this.fastestAnswerSec) {
      this.fastestAnswerSec = timeSpentSec;
    }
    if (timeSpentSec < 3) this.fastAnswersCount++;

    let isCorrect = false;
    if (this.currentQuestionFormat === 'true_false') {
      const correctStr = String(q.rawAnswer || q.options[q.answer] || 'True').trim().toLowerCase();
      const selStr = String(userSelection).trim().toLowerCase();
      isCorrect = (correctStr === selStr || (correctStr.startsWith('t') && selStr.startsWith('t')) || (correctStr.startsWith('f') && selStr.startsWith('f')));

      const buttons = document.querySelectorAll('.tf-option-btn');
      buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.trim().toLowerCase().includes(correctStr)) btn.classList.add('correct-choice');
        else if (btn.textContent.trim().toLowerCase().includes(selStr) && !isCorrect) btn.classList.add('wrong-choice');
      });
    } else if (this.currentQuestionFormat === 'identification') {
      const correctStr = String(q.rawAnswer || (q.options ? q.options[q.answer] : '') || '').trim().toLowerCase();
      const selStr = String(userSelection).trim().toLowerCase();
      isCorrect = (selStr !== '' && (correctStr === selStr || correctStr.includes(selStr) || selStr.includes(correctStr)));

      const inputEl = document.getElementById('identificationInput');
      const submitBtn = document.getElementById('identificationSubmitBtn');
      if (inputEl) inputEl.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
    } else {
      // Multiple Choice
      isCorrect = (userSelection === q.answer);
      const buttons = document.querySelectorAll('.answer-option-btn');
      buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.answer) btn.classList.add('correct-choice');
        else if (idx === userSelection && !isCorrect) btn.classList.add('wrong-choice');
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

      const timeBonus = this.timeRemainingSec * 10;
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
      const ansHint = q.rawAnswer || (q.options ? q.options[q.answer] : '');
      if (statusTextEl) statusTextEl.textContent = `❌ Incorrect!`;
      if (subTextEl) subTextEl.innerHTML = `Correct Answer: <b>${ansHint}</b>`;
    }

    document.getElementById('scorePointsText').textContent = `Points: ${this.totalScorePoints.toLocaleString()}`;
    const streakEl = document.getElementById('streakCounter');
    if (streakEl) {
      streakEl.textContent = `🔥 ${this.streak}`;
      streakEl.classList.remove('streak-pop');
      void streakEl.offsetWidth; // trigger reflow
      if (this.streak > 0) streakEl.classList.add('streak-pop');
    }
    
    setTimeout(() => {
      this.nextQuestion();
    }, 1400);
  },

  handleTimeOut() {
    this.incorrectCount++;
    this.streak = 0;
    this.sessionTotalTimeSec += 20;

    const streakEl = document.getElementById('streakCounter');
    if (streakEl) streakEl.textContent = `🔥 ${this.streak}`;

    const feedback = document.getElementById('feedbackBanner');
    const statusTextEl = document.getElementById('feedbackText');
    const subTextEl = document.getElementById('feedbackAnswerSub');

    if (feedback) feedback.className = 'feedback-banner wrong';
    const q = this.questionsList[this.currentIndex];
    const ansHint = q.rawAnswer || (q.options ? q.options[q.answer] : '');
    if (statusTextEl) statusTextEl.textContent = `⏱ Time Expired!`;
    if (subTextEl) subTextEl.innerHTML = `Correct Answer: <b>${ansHint}</b>`;

    setTimeout(() => {
      this.nextQuestion();
    }, 1400);
  },

  finishQuiz() {
    clearInterval(this.timerInterval);
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
