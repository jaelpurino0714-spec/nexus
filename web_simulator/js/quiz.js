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
      this.startQuiz('pre-test', 'multiple_choice');
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
    this.startQuiz('post-test', format);
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

    let qTypeId = 1;
    if (questionFormat === 'true_false') qTypeId = 2;
    else if (questionFormat === 'identification') qTypeId = 3;

    // Query questions filtering by topic_id, question_type_id, and quiz_type
    let pool = await DB.getQuestions(this.currentTopicId, qTypeId, mode);

    if (pool.length === 0) {
      // Fallback query without quiz_type filter if specific pre_test/post_test tag is unassigned
      pool = await DB.getQuestions(this.currentTopicId, qTypeId);
    }

    pool = this.shuffleArray(pool);
    this.questionsList = pool.slice(0, 15);

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

    // Start 20-Second Digital Timer
    this.timeRemainingSec = 20;
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
