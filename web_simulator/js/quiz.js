/* ==========================================================================
   NEXUS SPEED-TAPPING QUIZ ENGINE
   Handles 20s question timers, streak multipliers, speed bonuses & results
   ========================================================================== */

const Quiz = {
  currentTerm: 1,
  currentMode: 'pre-test', // 'pre-test' or 'post-test'
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

  selectTerm(termNum) {
    this.currentTerm = termNum;
    const termNames = {
      1: 'Term 1: Earth Science',
      2: 'Term 2: Biology & EM Spectrum',
      3: 'Term 3: Chemistry & Physics'
    };
    document.getElementById('selectedTermLabel').textContent = termNames[termNum];
    document.getElementById('modeSelectorModal').classList.remove('hidden');
  },

  hideModeSelector() {
    document.getElementById('modeSelectorModal').classList.add('hidden');
  },

  async startQuiz(mode) {
    this.hideModeSelector();
    this.currentMode = mode;
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

    // Retrieve questions from Supabase live database
    let pool = await DB.fetchQuestionsForTerm(this.currentTerm);

    // Shuffle questions for rephrased/randomized playthrough
    pool = this.shuffleArray(pool);

    // Limit to 15 questions per PRD spec for Pre-Test mode
    this.questionsList = pool.slice(0, 15);

    if (this.questionsList.length === 0) {
      alert('No active questions found in Supabase database for this term!');
      return;
    }

    App.showScreen('gameplayScreen');
    this.renderQuestion();
  },

  renderQuestion() {
    if (this.currentIndex >= this.questionsList.length) {
      this.finishQuiz();
      return;
    }

    clearInterval(this.timerInterval);
    const q = this.questionsList[this.currentIndex];

    // Tags & Counters
    document.getElementById('quizTermTag').textContent = `Term ${this.currentTerm}`;
    document.getElementById('quizModeTag').textContent = this.currentMode.toUpperCase();
    document.getElementById('questionCategory').textContent = q.topic || 'Science';
    document.getElementById('questionCounter').textContent = `Question ${this.currentIndex + 1} of ${this.questionsList.length}`;
    document.getElementById('streakCounter').textContent = `🔥 Streak: ${this.streak}`;
    document.getElementById('questionText').textContent = q.question;

    // Update Progress Bar
    const pct = ((this.currentIndex) / this.questionsList.length) * 100;
    document.getElementById('quizProgressBar').style.width = `${pct}%`;

    // Hide Feedback Banner
    const feedback = document.getElementById('feedbackBanner');
    feedback.className = 'feedback-banner hidden';

    // Render Answer Buttons
    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    const prefixes = ['A', 'B', 'C', 'D'];
    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'answer-option-btn';
      btn.innerHTML = `<span class="option-prefix">${prefixes[index] || index+1}</span> <span>${optText}</span>`;
      btn.onclick = () => this.handleAnswer(index);
      container.appendChild(btn);
    });

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
    // dasharray = 283
    const offset = 283 - (this.timeRemainingSec / 20) * 283;
    circle.style.strokeDashoffset = offset;

    if (this.timeRemainingSec <= 5) {
      circle.style.stroke = 'var(--error-red)';
    } else {
      circle.style.stroke = 'var(--primary-purple)';
    }
  },

  handleAnswer(selectedIndex) {
    clearInterval(this.timerInterval);
    const q = this.questionsList[this.currentIndex];
    const timeSpentSec = (Date.now() - this.questionStartTime) / 1000;
    this.sessionTotalTimeSec += timeSpentSec;

    // Track fastest answers
    if (this.fastestAnswerSec === null || timeSpentSec < this.fastestAnswerSec) {
      this.fastestAnswerSec = timeSpentSec;
    }
    if (timeSpentSec < 3) {
      this.fastAnswersCount++;
    }

    const isCorrect = (selectedIndex === q.answer);
    const buttons = document.querySelectorAll('.answer-option-btn');

    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answer) {
        btn.classList.add('correct-choice');
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('wrong-choice');
      }
    });

    // Update Topic Accuracy stats
    if (!this.sessionTopicStats[q.topic]) {
      this.sessionTopicStats[q.topic] = { total: 0, correct: 0 };
    }
    this.sessionTopicStats[q.topic].total++;

    const feedback = document.getElementById('feedbackBanner');

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      this.sessionTopicStats[q.topic].correct++;

      // Points calculation: Base 100 + remaining time bonus + streak multiplier
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
      feedback.innerHTML = `<span>❌ Incorrect!</span>`;
    }

    setTimeout(() => {
      this.currentIndex++;
      this.renderQuestion();
    }, 1200);
  },

  handleTimeOut() {
    const buttons = document.querySelectorAll('.answer-option-btn');
    const q = this.questionsList[this.currentIndex];

    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answer) btn.classList.add('correct-choice');
    });

    this.incorrectCount++;
    this.streak = 0;
    this.sessionTotalTimeSec += 20;

    const feedback = document.getElementById('feedbackBanner');
    feedback.className = 'feedback-banner wrong';
    feedback.innerHTML = `<span>⏰ Time's Up!</span>`;

    setTimeout(() => {
      this.currentIndex++;
      this.renderQuestion();
    }, 1200);
  },

  finishQuiz() {
    clearInterval(this.timerInterval);

    const totalQ = this.questionsList.length;
    const percentage = Math.round((this.correctCount / totalQ) * 100);

    // Save session result
    const resultObj = {
      term: this.currentTerm,
      mode: this.currentMode,
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

    // Update cumulative student profile stats
    const profile = DB.getStudentProfile();
    if (profile) {
      profile.totalPoints = (profile.totalPoints || 0) + this.totalScorePoints;
      if (this.maxStreak > (profile.streak || 0)) {
        profile.streak = this.maxStreak;
      }
      DB.saveStudentProfile(profile);
      App.updateUserHeader();
    }

    // Evaluate Achievements
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

    // Render Results Screen
    document.getElementById('resultPercentage').textContent = `${percentage}%`;
    document.getElementById('resultTotalPoints').textContent = `+${this.totalScorePoints.toLocaleString()}`;
    document.getElementById('resultCorrectCount').textContent = this.correctCount;
    document.getElementById('resultIncorrectCount').textContent = this.incorrectCount;

    // PRD Remediation Recommendation if percentage < 50%
    const recCard = document.getElementById('recommendationBanner');
    if (percentage < 50) {
      recCard.classList.remove('hidden');
      const termTopics = {
        1: 'Term 1: Plate Tectonics & Earth\'s Interior',
        2: 'Term 2: Endocrine System & Electromagnetic Spectrum',
        3: 'Term 3: Gas Laws & Chemical Reactions'
      };
      document.getElementById('recommendationText').innerHTML = 
        `Your score was below 50%. We recommend reviewing <b>${termTopics[this.currentTerm]}</b> before taking your next quiz!`;
    } else {
      recCard.classList.add('hidden');
    }

    App.showScreen('resultsScreen');
  },

  quitQuiz() {
    if (confirm('Are you sure you want to quit this round? Progress will not be saved.')) {
      clearInterval(this.timerInterval);
      App.showScreen('playScreen');
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
