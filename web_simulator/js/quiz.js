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
  selectTerm(termNum) {
    this.currentTerm = termNum;
    this.renderTopics();
    App.showScreen('topicScreen');
  },

  // 2. Render Topics for Selected Term
  renderTopics() {
    const termNames = { 1: 'First Term Topics', 2: 'Second Term Topics', 3: 'Third Term Topics' };
    document.getElementById('topicScreenTitle').textContent = termNames[this.currentTerm] || 'Select Topic';
    document.getElementById('topicScreenSub').textContent = `Term ${this.currentTerm} DepEd Science Topics`;

    const container = document.getElementById('topicsListGroup');
    container.innerHTML = '';

    const topics = CURRICULUM[this.currentTerm] || [];
    topics.forEach((topicName, idx) => {
      const btn = document.createElement('button');
      btn.className = `term-btn topic-item-btn`;
      btn.onclick = () => this.selectTopic(topicName);
      btn.innerHTML = `
        <div class="term-badge">TOPIC ${idx + 1}</div>
        <div class="term-title">${topicName}</div>
        <span class="term-action">Select Topic ➔</span>
      `;
      container.appendChild(btn);
    });
  },

  // 3. Topic Selected -> Open Test Type Modal
  selectTopic(topicName) {
    this.currentTopic = topicName;
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

    // Fetch questions from DB or generate topic fallbacks
    let pool = await DB.fetchQuestionsForTerm(this.currentTerm);

    // Filter by topic, testType, and questionType if available
    pool = pool.filter(q => {
      if (questionFormat === 'true_false') return q.type === 'tf' || q.type === 'true_false';
      if (questionFormat === 'identification') return q.type === 'id' || q.type === 'identification';
      return q.type === 'mc' || q.type === 'multiple_choice' || !q.type;
    });

    // Generate fallback questions to ensure exactly 15 items per gameflow spec
    if (pool.length < 15) {
      const extraNeeded = 15 - pool.length;
      const generated = this._generateFallbackQuestions(this.currentTopic, questionFormat, extraNeeded);
      pool = pool.concat(generated);
    }

    pool = this.shuffleArray(pool);
    this.questionsList = pool.slice(0, 15);

    App.showScreen('gameplayScreen');
    this.renderQuestion();
  },

  // 7. Render Current Question
  renderQuestion() {
    if (this.currentIndex >= this.questionsList.length) {
      this.finishQuiz();
      return;
    }

    clearInterval(this.timerInterval);
    const q = this.questionsList[this.currentIndex];

    // Headers & Counter
    document.getElementById('quizTermTag').textContent = `Term ${this.currentTerm}`;
    document.getElementById('quizModeTag').textContent = `${this.currentMode.toUpperCase()} (${this.currentQuestionFormat.replace('_', ' ').toUpperCase()})`;
    document.getElementById('questionCategory').textContent = this.currentTopic || 'Science';
    document.getElementById('questionCounter').textContent = `Question ${this.currentIndex + 1} of ${this.questionsList.length}`;
    document.getElementById('streakCounter').textContent = `🔥 Streak: ${this.streak}`;
    document.getElementById('questionText').textContent = q.question;

    // Progress Bar
    const pct = ((this.currentIndex) / this.questionsList.length) * 100;
    document.getElementById('quizProgressBar').style.width = `${pct}%`;

    // Feedback reset
    const feedback = document.getElementById('feedbackBanner');
    feedback.className = 'feedback-banner hidden';

    // Render Answer Options according to question format
    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    if (this.currentQuestionFormat === 'true_false') {
      // Display only 2 answer buttons: True and False
      ['True', 'False'].forEach((val) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option-btn tf-option-btn';
        btn.style.fontSize = '1.2rem';
        btn.style.fontWeight = 'bold';
        btn.innerHTML = `<span>${val}</span>`;
        btn.onclick = () => this.handleAnswer(val);
        container.appendChild(btn);
      });
    } else if (this.currentQuestionFormat === 'identification') {
      // Display small text input box + Submit button
      const wrap = document.createElement('div');
      wrap.className = 'identification-wrapper';
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '12px';
      wrap.style.width = '100%';

      wrap.innerHTML = `
        <input type="text" id="identificationInput" placeholder="Type your answer here..." class="identification-input" style="padding:14px; font-size:1.1rem; border-radius:12px; border:2px solid #ccc; width:100%; outline:none;" autocomplete="off">
        <button id="identificationSubmitBtn" class="primary-btn" style="padding:12px; font-size:1rem; border-radius:12px;">Submit Answer ➔</button>
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
      // Multiple Choice (4 answer choices)
      const prefixes = ['A', 'B', 'C', 'D'];
      const opts = q.options || ['Option A', 'Option B', 'Option C', 'Option D'];
      opts.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option-btn';
        btn.innerHTML = `<span class="option-prefix">${prefixes[index] || index+1}</span> <span>${optText}</span>`;
        btn.onclick = () => this.handleAnswer(index);
        container.appendChild(btn);
      });
    }

    // Start 20-Second Circular Countdown Timer
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
    document.getElementById('timerText').textContent = this.timeRemainingSec;
    const circle = document.getElementById('timerProgressCircle');
    const offset = 283 - (this.timeRemainingSec / 20) * 283;
    if (circle) circle.style.strokeDashoffset = offset;

    if (circle) {
      if (this.timeRemainingSec <= 5) {
        circle.style.stroke = 'var(--error-red)';
      } else {
        circle.style.stroke = 'var(--primary-purple)';
      }
    }
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
        if (btn.textContent.trim().toLowerCase() === correctStr) btn.classList.add('correct-choice');
        else if (btn.textContent.trim().toLowerCase() === selStr && !isCorrect) btn.classList.add('wrong-choice');
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

      feedback.className = 'feedback-banner correct';
      feedback.innerHTML = `<span>✅ Correct! +${earned} pts</span>`;
    } else {
      this.incorrectCount++;
      this.streak = 0;
      feedback.className = 'feedback-banner wrong';
      const ansHint = q.rawAnswer || (q.options ? q.options[q.answer] : '');
      feedback.innerHTML = `<span>❌ Incorrect! Answer: <b>${ansHint}</b></span>`;
    }

    setTimeout(() => {
      this.currentIndex++;
      this.renderQuestion();
    }, 1400);
  },

  handleTimeOut() {
    this.incorrectCount++;
    this.streak = 0;
    this.sessionTotalTimeSec += 20;

    const feedback = document.getElementById('feedbackBanner');
    feedback.className = 'feedback-banner wrong';
    const q = this.questionsList[this.currentIndex];
    const ansHint = q.rawAnswer || (q.options ? q.options[q.answer] : '');
    feedback.innerHTML = `<span>⏰ Time's Up! Correct Answer: <b>${ansHint}</b></span>`;

    setTimeout(() => {
      this.currentIndex++;
      this.renderQuestion();
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
  },

  _generateFallbackQuestions(topic, format, count) {
    const list = [];
    for (let i = 1; i <= count; i++) {
      if (format === 'true_false') {
        const isTrue = i % 2 !== 0;
        list.push({
          id: `gen_tf_${i}`,
          term: this.currentTerm,
          topic: topic,
          question: `[${topic}] Statement ${i}: Is this scientific concept accurate for Grade 10 Science?`,
          options: ['True', 'False'],
          answer: isTrue ? 0 : 1,
          rawAnswer: isTrue ? 'True' : 'False',
          type: 'tf'
        });
      } else if (format === 'identification') {
        list.push({
          id: `gen_id_${i}`,
          term: this.currentTerm,
          topic: topic,
          question: `Identify the core Grade 10 Science term associated with key process #${i} in ${topic}.`,
          options: [],
          answer: 0,
          rawAnswer: topic.split(' ')[0],
          type: 'id'
        });
      } else {
        list.push({
          id: `gen_mc_${i}`,
          term: this.currentTerm,
          topic: topic,
          question: `Which fundamental principle governs ${topic} regarding item #${i}?`,
          options: [
            `Primary Principle of ${topic}`,
            `Secondary Response Factor`,
            `External Ambient Variable`,
            `Inverse Reactivity Threshold`
          ],
          answer: 0,
          rawAnswer: `Primary Principle of ${topic}`,
          type: 'mc'
        });
      }
    }
    return list;
  }
};
