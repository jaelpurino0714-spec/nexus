/* ==========================================================================
   NEXUS EXPERIMENT SIMULATOR CONTROLLER
   Handles Term Selection, Term-Based Topic Rendering, and Lab Simulations
   ========================================================================== */

const EXPERIMENT_CURRICULUM = {
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

const Experiment = {
  currentTerm: 1,
  currentTopic: '',

  showTermSelection() {
    App.showScreen('experimentTermScreen');
  },

  selectTerm(termNum) {
    this.currentTerm = termNum;
    this.renderTopics();
    App.showScreen('experimentTopicScreen');
  },

  renderTopics() {
    const termTitles = { 1: 'First Term', 2: 'Second Term', 3: 'Third Term' };
    const titleEl = document.getElementById('experimentTopicTitle');
    const subEl = document.getElementById('experimentTopicSub');
    if (titleEl) titleEl.textContent = `${termTitles[this.currentTerm]} Experiments`;
    if (subEl) subEl.textContent = `Choose an experiment topic for ${termTitles[this.currentTerm]}`;

    const container = document.getElementById('experimentTopicsList');
    if (!container) return;

    container.innerHTML = '';
    const topics = EXPERIMENT_CURRICULUM[this.currentTerm] || [];

    topics.forEach((topicName, idx) => {
      const btn = document.createElement('button');
      btn.className = 'term-btn topic-item-btn experiment-topic-item';
      btn.innerHTML = `
        <div class="term-badge" style="background:#8B5CF6; color:white;">TOPIC ${idx + 1}</div>
        <div class="term-title" style="margin: 4px 0 0 0; font-size: 1.05rem; line-height: 1.3; color:#2E1065;">${topicName}</div>
        <span class="term-action" style="margin-top: 6px; color:#7C3AED;">Open Experiment 🧪 ➔</span>
      `;
      btn.onclick = () => this.openExperiment(topicName);
      container.appendChild(btn);
    });
  },

  openExperiment(topicName) {
    this.currentTopic = topicName;
    const titleEl = document.getElementById('expDetailTitle');
    const topicTagEl = document.getElementById('expDetailTopicTag');
    if (titleEl) titleEl.textContent = topicName;
    if (topicTagEl) topicTagEl.textContent = `Term ${this.currentTerm} • Experiment Simulation`;

    this.renderSimulationCanvas(topicName);

    App.showScreen('experimentDetailScreen');
  },

  renderSimulationCanvas(topicName) {
    const canvasBox = document.getElementById('expCanvasBox');
    if (!canvasBox) return;

    canvasBox.innerHTML = `
      <div class="exp-sim-card">
        <div class="exp-sim-header">
          <span class="exp-badge">LAB SIMULATION 🧪</span>
          <h4>${topicName}</h4>
        </div>
        <div class="exp-sim-canvas" id="interactiveCanvas">
          <div class="exp-icon-large">🔬⚡🧪</div>
          <p class="exp-sim-status">Interactive Simulation Ready</p>
          <div class="exp-controls">
            <button class="primary-btn" style="padding:10px 18px; font-size:0.9rem;" onclick="Experiment.runSimulationStep()">🧪 Run Trial Simulation</button>
            <button class="secondary-btn" style="padding:10px 18px; font-size:0.9rem;" onclick="Experiment.resetSimulation()">🔄 Reset Apparatus</button>
          </div>
          <div id="simOutputLog" class="sim-output-log">
            Click "Run Trial Simulation" to observe experimental data readings and chemical/physical processes for ${topicName}.
          </div>
        </div>
      </div>
    `;
  },

  runSimulationStep() {
    const log = document.getElementById('simOutputLog');
    if (log) {
      log.innerHTML = `
        <div style="color:#059669; font-weight:700;">✅ Trial executed successfully!</div>
        <div style="font-size:0.85rem; margin-top:4px;">Observed data: System reactions stable, data readings recorded for ${this.currentTopic}.</div>
      `;
    }
  },

  resetSimulation() {
    const log = document.getElementById('simOutputLog');
    if (log) {
      log.textContent = 'Apparatus reset. Click "Run Trial Simulation" to begin new experiment trial.';
    }
  },

  startExperimentQuiz() {
    if (typeof Quiz !== 'undefined') {
      Quiz.currentTerm = this.currentTerm;
      Quiz.currentTopic = this.currentTopic;
      Quiz.currentMode = 'post-test';
      Quiz.selectQuestionFormat('multiple_choice');
    }
  }
};
