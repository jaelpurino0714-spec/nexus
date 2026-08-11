/* ==========================================================================
   NEXUS EXPERIMENT SIMULATOR CONTROLLER
   Handles Term Selection & Topic Rendering (matching Play topic selection style)
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
    const termTitles = { 1: 'First Term Topics', 2: 'Second Term Topics', 3: 'Third Term Topics' };
    const titleEl = document.getElementById('experimentTopicTitle');
    const subEl = document.getElementById('experimentTopicSub');
    if (titleEl) titleEl.textContent = termTitles[this.currentTerm] || 'Experiment Topics';
    if (subEl) subEl.textContent = 'Choose a DepEd Grade 10 Science topic to begin';

    const container = document.getElementById('experimentTopicsList');
    if (!container) return;

    container.innerHTML = '';
    const topics = EXPERIMENT_CURRICULUM[this.currentTerm] || [];

    topics.forEach((topicName) => {
      const btn = document.createElement('button');
      btn.className = 'term-btn topic-item-btn';
      btn.onclick = () => this.openExperiment(topicName);
      btn.innerHTML = `
        <div class="term-title" style="margin: 0; font-size: 1.05rem; line-height: 1.3;">${topicName}</div>
        <span class="term-action" style="margin-top: 6px;">Select Topic ➔</span>
      `;
      container.appendChild(btn);
    });
  },

  openExperiment(topicName) {
    this.currentTopic = topicName;
    const titleEl = document.getElementById('expDetailTitle');
    const topicTagEl = document.getElementById('expDetailTopicTag');
    if (titleEl) titleEl.textContent = topicName;
    if (topicTagEl) topicTagEl.textContent = `Term ${this.currentTerm} • Experiment Simulation`;

    // Keep output blank for now when a topic is clicked
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      canvasBox.innerHTML = '';
    }

    App.showScreen('experimentDetailScreen');
  }
};
