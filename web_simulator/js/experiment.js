/* ==========================================================================
   NEXUS EXPERIMENT SIMULATOR CONTROLLER
   Handles Term Selection, Topic Rendering, and Interactive Experiments
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
  changeTypeMode: 'chemical', // 'chemical' or 'physical'
  chemicalReactionsMode: 'iron', // 'iron' or 'apple'
  acidsBasesMode: 'blue_litmus', // 'blue_litmus', 'red_litmus', or 'neutralization'
  chemicalEquationsMode: 'h2o', // 'h2o' or 'nacl'
  balancingStage: 'guided', // 'guided' or 'practice'
  bCoeff1: '1',
  bCoeff2: '1',
  bCoeff3: '1',
  hintIndex: 0,
  bSubmitted: false,
  bIsCorrect: false,
  ratesMode: 'catalyst', // 'catalyst', 'inhibitor', or 'summary'
  ratesCondition: 'without', // 'without' or 'with'
  ratesStarted: false,
  ratesExp1Completed: false,
  ratesExp2Completed: false,
  homeostasisMode: 'temperature', // 'temperature', 'glucose', or 'summary'
  homeostasisCondition: 'hot', // 'hot' or 'cold' for temp; 'eat' or 'nofood' for glucose
  homeostasisStarted: false,
  homeostasisExp1Completed: false,
  homeostasisExp2Completed: false,

  selectedItems: new Set(),
  isCombined: false,
  challengeSubmitted: false,
  challengeIsCorrect: false,

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

    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      if (topicName === "Physical vs. Chemical Change") {
        this.changeTypeMode = 'chemical';
        this.selectedItems = new Set();
        this.isCombined = false;
        this.renderPhysicalVsChemicalActivity(canvasBox);
      } else if (topicName === "Chemical Reactions") {
        this.chemicalReactionsMode = 'iron';
        this.selectedItems = new Set();
        this.isCombined = false;
        this.renderChemicalReactionsActivity(canvasBox);
      } else if (topicName === "Acids, Bases, and Salts") {
        this.acidsBasesMode = 'blue_litmus';
        this.selectedItems = new Set();
        this.isCombined = false;
        this.renderAcidsBasesActivity(canvasBox);
      } else if (topicName === "Chemical Equations") {
        this.chemicalEquationsMode = 'h2o';
        this.selectedItems = new Set();
        this.isCombined = false;
        this.challengeSubmitted = false;
        this.renderChemicalEquationsActivity(canvasBox);
      } else if (topicName === "Balancing Chemical Equations") {
        this.balancingStage = 'guided';
        this.bCoeff1 = '1';
        this.bCoeff2 = '1';
        this.bCoeff3 = '1';
        this.hintIndex = 0;
        this.bSubmitted = false;
        this.renderBalancingChemicalEquationsActivity(canvasBox);
      } else if (topicName === "Rates of Reactions") {
        this.ratesMode = 'catalyst';
        this.ratesCondition = 'without';
        this.ratesStarted = false;
        this.renderRatesActivity(canvasBox);
      } else if (topicName === "Homeostasis") {
        this.homeostasisMode = 'temperature';
        this.homeostasisCondition = 'hot';
        this.homeostasisStarted = false;
        this.renderHomeostasisActivity(canvasBox);
      } else {
        canvasBox.innerHTML = ''; // Keep blank for other topics for now
      }
    }

    App.showScreen('experimentDetailScreen');
  },

  switchChangeTypeMode(mode) {
    this.changeTypeMode = mode;
    this.selectedItems = new Set();
    this.isCombined = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderPhysicalVsChemicalActivity(canvasBox);
    }
  },

  switchChemicalReactionsMode(mode) {
    this.chemicalReactionsMode = mode;
    this.selectedItems = new Set();
    this.isCombined = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderChemicalReactionsActivity(canvasBox);
    }
  },

  switchAcidsBasesMode(mode) {
    this.acidsBasesMode = mode;
    this.selectedItems = new Set();
    this.isCombined = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderAcidsBasesActivity(canvasBox);
    }
  },

  switchChemicalEquationsMode(mode) {
    this.chemicalEquationsMode = mode;
    this.selectedItems = new Set();
    this.isCombined = false;
    this.challengeSubmitted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderChemicalEquationsActivity(canvasBox);
    }
  },

  switchBalancingStage(stage) {
    this.balancingStage = stage;
    this.bCoeff1 = '1';
    this.bCoeff2 = '1';
    this.bCoeff3 = '1';
    this.hintIndex = 0;
    this.bSubmitted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderBalancingChemicalEquationsActivity(canvasBox);
    }
  },

  updateCoeff(idx, delta) {
    let key = `bCoeff${idx}`;
    let val = parseInt(this[key]) || 1;
    val = Math.max(1, Math.min(9, val + delta));
    this[key] = String(val);
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderBalancingChemicalEquationsActivity(canvasBox);
    }
  },

  setCoeffDirect(idx, valStr) {
    let key = `bCoeff${idx}`;
    let val = parseInt(valStr) || 1;
    val = Math.max(1, Math.min(9, val));
    this[key] = String(val);
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderBalancingChemicalEquationsActivity(canvasBox);
    }
  },

  showNextHint() {
    if (this.hintIndex < 3) {
      this.hintIndex++;
    }
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderBalancingChemicalEquationsActivity(canvasBox);
    }
  },

  checkBalancingAnswer() {
    this.bSubmitted = true;
    const c1 = parseInt(this.bCoeff1) || 1;
    const c2 = parseInt(this.bCoeff2) || 1;
    const c3 = parseInt(this.bCoeff3) || 1;

    if (this.balancingStage === 'guided') {
      // H2 + O2 -> H2O => 2H2 + O2 -> 2H2O
      this.bIsCorrect = (c1 === 2 && c2 === 1 && c3 === 2);
    } else {
      // Na + Cl2 -> NaCl => 2Na + Cl2 -> 2NaCl
      this.bIsCorrect = (c1 === 2 && c2 === 1 && c3 === 2);
    }

    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderBalancingChemicalEquationsActivity(canvasBox);
    }
  },

  toggleItemSelection(itemId) {
    if (this.isCombined) return;
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
    } else {
      this.selectedItems.add(itemId);
    }
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      if (this.currentTopic === "Physical vs. Chemical Change") {
        this.renderPhysicalVsChemicalActivity(canvasBox);
      } else if (this.currentTopic === "Chemical Reactions") {
        this.renderChemicalReactionsActivity(canvasBox);
      } else if (this.currentTopic === "Acids, Bases, and Salts") {
        this.renderAcidsBasesActivity(canvasBox);
      } else if (this.currentTopic === "Chemical Equations") {
        this.renderChemicalEquationsActivity(canvasBox);
      } else if (this.currentTopic === "Balancing Chemical Equations") {
        this.renderBalancingChemicalEquationsActivity(canvasBox);
      } else if (this.currentTopic === "Rates of Reactions") {
        this.renderRatesActivity(canvasBox);
      } else if (this.currentTopic === "Homeostasis") {
        this.renderHomeostasisActivity(canvasBox);
      }
    }
  },

  combineItems() {
    if (this.selectedItems.size < 2) return;
    this.isCombined = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      if (this.currentTopic === "Physical vs. Chemical Change") {
        this.renderPhysicalVsChemicalActivity(canvasBox);
      } else if (this.currentTopic === "Chemical Reactions") {
        this.renderChemicalReactionsActivity(canvasBox);
      } else if (this.currentTopic === "Acids, Bases, and Salts") {
        this.renderAcidsBasesActivity(canvasBox);
      } else if (this.currentTopic === "Chemical Equations") {
        this.renderChemicalEquationsActivity(canvasBox);
      } else if (this.currentTopic === "Balancing Chemical Equations") {
        this.renderBalancingChemicalEquationsActivity(canvasBox);
      } else if (this.currentTopic === "Rates of Reactions") {
        this.renderRatesActivity(canvasBox);
      } else if (this.currentTopic === "Homeostasis") {
        this.renderHomeostasisActivity(canvasBox);
      }
    }
  },

  resetActivity() {
    this.selectedItems = new Set();
    this.isCombined = false;
    this.challengeSubmitted = false;
    this.bCoeff1 = '1';
    this.bCoeff2 = '1';
    this.bCoeff3 = '1';
    this.hintIndex = 0;
    this.bSubmitted = false;
    this.ratesStarted = false;
    this.homeostasisStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      if (this.currentTopic === "Physical vs. Chemical Change") {
        this.renderPhysicalVsChemicalActivity(canvasBox);
      } else if (this.currentTopic === "Chemical Reactions") {
        this.renderChemicalReactionsActivity(canvasBox);
      } else if (this.currentTopic === "Acids, Bases, and Salts") {
        this.renderAcidsBasesActivity(canvasBox);
      } else if (this.currentTopic === "Chemical Equations") {
        this.renderChemicalEquationsActivity(canvasBox);
      } else if (this.currentTopic === "Balancing Chemical Equations") {
        this.renderBalancingChemicalEquationsActivity(canvasBox);
      } else if (this.currentTopic === "Rates of Reactions") {
        this.renderRatesActivity(canvasBox);
      } else if (this.currentTopic === "Homeostasis") {
        this.renderHomeostasisActivity(canvasBox);
      }
    }
  },

  checkBalancingChallenge() {
    const c1 = document.getElementById('coeff1') ? document.getElementById('coeff1').value.trim() : '';
    const c2 = document.getElementById('coeff2') ? document.getElementById('coeff2').value.trim() : '';
    const c3 = document.getElementById('coeff3') ? document.getElementById('coeff3').value.trim() : '';

    this.challengeSubmitted = true;

    // Both 2H2 + 1O2 -> 2H2O and 2H2 + O2 -> 2H2O (empty c2) are accepted
    if (c1 === '2' && (c2 === '1' || c2 === '') && c3 === '2') {
      this.challengeIsCorrect = true;
    } else {
      this.challengeIsCorrect = false;
    }

    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderChemicalEquationsActivity(canvasBox);
    }
  },

  renderPhysicalVsChemicalActivity(container) {
    const isChemical = this.changeTypeMode === 'chemical';

    const items = isChemical ? [
      { id: 'baking_soda', name: 'Baking Soda', icon: '🥄', sub: 'Solid Powder' },
      { id: 'vinegar', name: 'Vinegar', icon: '🧴', sub: 'Liquid Acid' }
    ] : [
      { id: 'ice', name: 'Ice', icon: '🧊', sub: 'Solid State' },
      { id: 'heat', name: 'Heat', icon: '🔥', sub: 'Thermal Energy' }
    ];

    const canCombine = this.selectedItems.size === 2;

    let html = `
      <div class="exp-activity-wrapper">
        <!-- 2 Mode Selection Buttons -->
        <div class="exp-mode-toggle-group">
          <button class="exp-mode-btn ${isChemical ? 'active' : ''}" onclick="Experiment.switchChangeTypeMode('chemical')">
            ⚗️ Chemical Change
          </button>
          <button class="exp-mode-btn ${!isChemical ? 'active' : ''}" onclick="Experiment.switchChangeTypeMode('physical')">
            🧊 Physical Change
          </button>
        </div>

        <div class="exp-activity-card">
          <div class="exp-sub-title">
            ${isChemical ? 'Chemical Change — Baking Soda + Vinegar' : 'Physical Change — Ice + Heat'}
          </div>
    `;

    if (!this.isCombined) {
      html += `
          <p class="exp-instruction">Tap both items to select them, then tap <b>Combine</b>:</p>

          <!-- Selectable Items Grid -->
          <div class="exp-items-grid">
      `;

      items.forEach(item => {
        const isSelected = this.selectedItems.has(item.id);
        html += `
          <div class="exp-item-card ${isSelected ? 'selected' : ''}" onclick="Experiment.toggleItemSelection('${item.id}')">
            <div class="exp-item-icon">${item.icon}</div>
            <div class="exp-item-name">${item.name}</div>
            <div class="exp-item-sub">${item.sub}</div>
            <div class="exp-select-badge">${isSelected ? '✓ Selected' : '+ Select'}</div>
          </div>
        `;
      });

      html += `
          </div>

          <button class="primary-btn combine-action-btn ${canCombine ? 'ready' : 'disabled'}"
                  ${canCombine ? 'onclick="Experiment.combineItems()"' : 'disabled'}>
            Combine ${canCombine ? '✨' : '🔒'}
          </button>
        </div>
      `;
    } else {
      // Combined Result Screen
      if (isChemical) {
        html += `
          <!-- Chemical Change Reaction Visual Result -->
          <div class="exp-result-container chemical-result">
            <div class="reaction-animation-box">
              <div class="flask-visual">🧪</div>
              <div class="fizz-bubbles-container">
                <span class="bubble b1">🫧</span>
                <span class="bubble b2">🫧</span>
                <span class="bubble b3">🫧</span>
                <span class="bubble b4">🫧</span>
              </div>
            </div>
            <div class="result-badge chemical">Chemical Change</div>
          </div>

          <!-- Explanation Section -->
          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>When baking soda and vinegar were combined, they reacted and produced new substances, including carbon dioxide gas. The bubbles are evidence that a gas was produced.</p>
            </div>

            <div class="exp-explain-block">
              <h5>Why is it a chemical change?</h5>
              <ul>
                <li>A new substance is formed.</li>
                <li>Gas is produced.</li>
                <li>The original substances change into different substances.</li>
              </ul>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Chemical change = a new substance is formed.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset / Try Again
          </button>
        </div>
        `;
      } else {
        html += `
          <!-- Physical Change Reaction Visual Result -->
          <div class="exp-result-container physical-result">
            <div class="reaction-animation-box">
              <div class="melting-visual">
                <span class="ice-melting-icon">🧊 ➡️ 💧</span>
              </div>
              <div class="water-drops-container">
                <span class="drop d1">💧</span>
                <span class="drop d2">💧</span>
                <span class="drop d3">💧</span>
              </div>
            </div>
            <div class="result-badge physical">Physical Change</div>
          </div>

          <!-- Explanation Section -->
          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>The ice melted and became liquid water.</p>
            </div>

            <div class="exp-explain-block">
              <h5>Why is it a physical change?</h5>
              <ul>
                <li>No new substance was formed.</li>
                <li>The water is still H₂O.</li>
                <li>Only its physical state changed from solid to liquid.</li>
              </ul>
            </div>

            <div class="exp-key-idea-box physical-key">
              💡 <b>Key Idea:</b> Physical change = no new substance is formed.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset / Try Again
          </button>
        </div>
        `;
      }
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  renderChemicalReactionsActivity(container) {
    const isIron = this.chemicalReactionsMode === 'iron';

    const items = isIron ? [
      { id: 'iron', name: 'Iron', icon: '🔩', sub: 'Solid Metal' },
      { id: 'oxygen', name: 'Oxygen', icon: '💨', sub: 'Gas in Air' }
    ] : [
      { id: 'fresh_apple', name: 'Fresh Apple', icon: '🍎', sub: 'Cut Fruit Tissue' },
      { id: 'oxygen_air', name: 'Oxygen (Air)', icon: '💨', sub: 'Gas in Air' }
    ];

    const canCombine = this.selectedItems.size === 2;

    let html = `
      <div class="exp-activity-wrapper">
        <!-- 2 Experiment Selection Buttons -->
        <div class="exp-mode-toggle-group">
          <button class="exp-mode-btn ${isIron ? 'active' : ''}" onclick="Experiment.switchChemicalReactionsMode('iron')">
            🔩 Iron + Oxygen
          </button>
          <button class="exp-mode-btn ${!isIron ? 'active' : ''}" onclick="Experiment.switchChemicalReactionsMode('apple')">
            🍎 Apple + Oxygen
          </button>
        </div>

        <div class="exp-activity-card">
          <div class="exp-sub-title">
            ${isIron ? '🧪 Experiment: Iron + Oxygen' : '🍎 Experiment: Apple + Oxygen'}
          </div>
    `;

    if (!this.isCombined) {
      html += `
          <p class="exp-instruction">Select both reactants to combine them:</p>

          <!-- Selectable Items Grid -->
          <div class="exp-items-grid">
      `;

      items.forEach(item => {
        const isSelected = this.selectedItems.has(item.id);
        html += `
          <div class="exp-item-card ${isSelected ? 'selected' : ''}" onclick="Experiment.toggleItemSelection('${item.id}')">
            <div class="exp-item-icon">${item.icon}</div>
            <div class="exp-item-name">${item.name}</div>
            <div class="exp-item-sub">${item.sub}</div>
            <div class="exp-select-badge">${isSelected ? '✓ Selected' : '+ Select'}</div>
          </div>
        `;
      });

      html += `
          </div>

          <button class="primary-btn combine-action-btn ${canCombine ? 'ready' : 'disabled'}"
                  ${canCombine ? 'onclick="Experiment.combineItems()"' : 'disabled'}>
            Combine ${canCombine ? '✨' : '🔒'}
          </button>
        </div>
      `;
    } else {
      // Combined Result Screen
      if (isIron) {
        html += `
          <!-- Iron + Oxygen Rusting Visual Result -->
          <div class="exp-result-container chemical-result">
            <div class="reaction-animation-box">
              <div class="rusting-visual">
                <span>🔩</span>
                <span style="font-size:1.5rem;">➡️</span>
                <span class="rust-anim-item">🟤</span>
              </div>
            </div>
            <div class="result-badge chemical">Chemical Reaction • Rust (Iron Oxide)</div>
          </div>

          <!-- Explanation Section -->
          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Iron reacts with oxygen in the presence of moisture to form rust, a new substance called iron oxide.</p>
            </div>

            <div class="exp-explain-block">
              <h5>Why is it a chemical reaction?</h5>
              <ul>
                <li>A new substance is formed.</li>
                <li>The iron changes into iron oxide.</li>
                <li>The change cannot easily be reversed.</li>
                <li>The formation of rust shows that the iron has reacted chemically with oxygen.</li>
              </ul>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Chemical reaction = substances react and form one or more new substances.
            </div>

            <div class="exp-explain-block" style="background:#FAF5FF; border-color:#DDD6FE;">
              <h5 style="color:#6D28D9;">🧪 Suggested Reaction:</h5>
              <p><b>Iron + Oxygen + Water → Rust (Iron Oxide)</b></p>
              <p style="font-size:0.8rem; color:#5B21B6; margin-top:4px;">Water/moisture helps the rusting process happen, but oxygen is the substance reacting with the iron.</p>
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      } else {
        html += `
          <!-- Apple + Oxygen Browning Visual Result -->
          <div class="exp-result-container chemical-result">
            <div class="reaction-animation-box">
              <div class="apple-browning-visual">
                <span>🍎</span>
                <span style="font-size:1.5rem;">➡️</span>
                <span class="apple-anim-item">🟤</span>
              </div>
            </div>
            <div class="result-badge chemical">Chemical Reaction • Brown Compounds</div>
          </div>

          <!-- Explanation Section -->
          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>When a cut apple is exposed to oxygen in the air, enzymes in the apple help substances in the apple react with oxygen. This process produces new compounds that cause the exposed surface to turn brown.</p>
            </div>

            <div class="exp-explain-block">
              <h5>How does the reaction happen?</h5>
              <ol>
                <li>The apple is cut, exposing its inside to air.</li>
                <li>Oxygen from the air comes into contact with substances inside the apple.</li>
                <li>Enzymes in the apple help the reaction occur.</li>
                <li>New brown-colored compounds are produced.</li>
                <li>The apple's exposed surface gradually becomes brown.</li>
              </ol>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> In a chemical reaction, reactants interact and form new products.
            </div>

            <!-- Information Panel -->
            <div class="exp-info-panel">
              <h5>🔬 Reaction: Enzymatic Browning</h5>
              <div class="exp-info-item"><b>Reactants:</b> 🍎 Compounds in the apple + 💨 Oxygen</div>
              <div class="exp-info-item"><b>Product:</b> 🟤 Brown-colored compounds</div>
              <div class="exp-info-item"><b>What causes it?</b> Enzymes in the apple help oxygen react with certain compounds in the exposed apple tissue.</div>
              <div class="exp-info-item"><b>Where can you see it?</b> This reaction commonly occurs when apples, bananas, potatoes, and other fruits or vegetables are cut and exposed to air.</div>
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  renderAcidsBasesActivity(container) {
    const mode = this.acidsBasesMode; // 'blue_litmus', 'red_litmus', or 'neutralization'

    let items = [];
    let actionBtnLabel = 'Test 🧪';
    let subTitle = '';

    if (mode === 'blue_litmus') {
      subTitle = '🧪 Experiment 1: Blue Litmus + Acid';
      items = [
        { id: 'blue_litmus', name: 'Blue Litmus Paper', icon: '🔵', sub: 'pH Indicator' },
        { id: 'acid_sol', name: 'Acidic Solution', icon: '🧪', sub: 'pH Below 7' }
      ];
    } else if (mode === 'red_litmus') {
      subTitle = '🧪 Experiment 2: Red Litmus + Base';
      items = [
        { id: 'red_litmus', name: 'Red Litmus Paper', icon: '🔴', sub: 'pH Indicator' },
        { id: 'base_sol', name: 'Basic Solution', icon: '🧪', sub: 'pH Above 7' }
      ];
    } else {
      subTitle = '🧪 Experiment 3: Acid + Base — Neutralization';
      actionBtnLabel = 'Combine ✨';
      items = [
        { id: 'acid', name: 'Acid', icon: '🧪', sub: 'H⁺ Ion Provider' },
        { id: 'base', name: 'Base', icon: '🧪', sub: 'OH⁻ Ion Provider' }
      ];
    }

    const canAction = this.selectedItems.size === 2;

    let html = `
      <div class="exp-activity-wrapper">
        <!-- 3 Experiment Selection Buttons -->
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'blue_litmus' ? 'active' : ''}" onclick="Experiment.switchAcidsBasesMode('blue_litmus')">
            🔵 Blue Litmus
          </button>
          <button class="exp-mode-btn ${mode === 'red_litmus' ? 'active' : ''}" onclick="Experiment.switchAcidsBasesMode('red_litmus')">
            🔴 Red Litmus
          </button>
          <button class="exp-mode-btn ${mode === 'neutralization' ? 'active' : ''}" onclick="Experiment.switchAcidsBasesMode('neutralization')">
            🧪 Neutralization
          </button>
        </div>

        <div class="exp-activity-card">
          <div class="exp-sub-title">${subTitle}</div>
    `;

    if (!this.isCombined) {
      html += `
          <p class="exp-instruction">Select both items to test/combine them:</p>

          <!-- Selectable Items Grid -->
          <div class="exp-items-grid">
      `;

      items.forEach(item => {
        const isSelected = this.selectedItems.has(item.id);
        html += `
          <div class="exp-item-card ${isSelected ? 'selected' : ''}" onclick="Experiment.toggleItemSelection('${item.id}')">
            <div class="exp-item-icon">${item.icon}</div>
            <div class="exp-item-name">${item.name}</div>
            <div class="exp-item-sub">${item.sub}</div>
            <div class="exp-select-badge">${isSelected ? '✓ Selected' : '+ Select'}</div>
          </div>
        `;
      });

      html += `
          </div>

          <button class="primary-btn combine-action-btn ${canAction ? 'ready' : 'disabled'}"
                  ${canAction ? 'onclick="Experiment.combineItems()"' : 'disabled'}>
            ${actionBtnLabel}
          </button>
        </div>
      `;
    } else {
      // Result Screens for Acids, Bases, and Salts
      if (mode === 'blue_litmus') {
        html += `
          <!-- Blue Litmus + Acid Visual Result -->
          <div class="exp-result-container chemical-result">
            <div class="reaction-animation-box">
              <div class="litmus-anim-visual">
                <span class="litmus-sphere blue-sphere" title="Blue Litmus"></span>
                <span style="font-size:1.5rem; color:#8B5CF6;">➡️</span>
                <span class="litmus-sphere turn-blue-to-red" title="Red Litmus"></span>
              </div>
            </div>
            <div class="result-badge chemical">Result: Acid Detected</div>
            <div class="toast-banner">“Acid detected! The solution is acidic.”</div>
          </div>

          <!-- Explanation Section -->
          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>The acidic solution caused the <b>blue litmus paper to turn red</b>.</p>
            </div>

            <div class="exp-explain-block">
              <h5>Traits of Acids:</h5>
              <ul>
                <li>Acids have a <b>pH below 7</b>.</li>
                <li>They turn <b>blue litmus paper red</b>.</li>
                <li>Many acids have a sour taste, but <b>never taste an unknown chemical</b>.</li>
                <li>Acids can react with certain metals.</li>
                <li>Strong acids can be corrosive.</li>
              </ul>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Blue litmus turns red in an acid.
            </div>

            <div class="exp-safety-note">
              ⚠️ <b>Safety Note:</b> Never taste, smell closely, or touch unknown acids or bases. The experiments are simulations for learning.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      } else if (mode === 'red_litmus') {
        html += `
          <!-- Red Litmus + Base Visual Result -->
          <div class="exp-result-container physical-result">
            <div class="reaction-animation-box">
              <div class="litmus-anim-visual">
                <span class="litmus-sphere red-sphere" title="Red Litmus"></span>
                <span style="font-size:1.5rem; color:#8B5CF6;">➡️</span>
                <span class="litmus-sphere turn-red-to-blue" title="Blue Litmus"></span>
              </div>
            </div>
            <div class="result-badge physical">Result: Base Detected</div>
            <div class="toast-banner">“Base detected! The solution is basic.”</div>
          </div>

          <!-- Explanation Section -->
          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>The basic solution caused the <b>red litmus paper to turn blue</b>.</p>
            </div>

            <div class="exp-explain-block">
              <h5>Traits of Bases:</h5>
              <ul>
                <li>Bases have a <b>pH above 7</b>.</li>
                <li>They turn <b>red litmus paper blue</b>.</li>
                <li>Many bases feel slippery, but <b>never touch or taste unknown chemicals</b>.</li>
                <li>Bases can react with acids in a process called <b>neutralization</b>.</li>
                <li>Strong bases can be corrosive.</li>
              </ul>
            </div>

            <div class="exp-key-idea-box physical-key">
              💡 <b>Key Idea:</b> Red litmus turns blue in a base.
            </div>

            <!-- Comparison Panel -->
            <div class="exp-explain-block">
              <h5>📊 Comparison Panel</h5>
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>🧪 Acid</th>
                    <th>🧪 Base</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>pH</b></td>
                    <td>Below 7</td>
                    <td>Above 7</td>
                  </tr>
                  <tr>
                    <td><b>Blue Litmus</b></td>
                    <td>🔵 ➡️ 🔴 Red</td>
                    <td>Stays blue</td>
                  </tr>
                  <tr>
                    <td><b>Red Litmus</b></td>
                    <td>Stays red</td>
                    <td>🔴 ➡️ 🔵 Blue</td>
                  </tr>
                  <tr>
                    <td><b>Common trait</b></td>
                    <td>Can react with bases</td>
                    <td>Can react with acids</td>
                  </tr>
                  <tr>
                    <td><b>Reaction</b></td>
                    <td>Can neutralize bases</td>
                    <td>Can neutralize acids</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="exp-safety-note">
              ⚠️ <b>Safety Note:</b> Never taste, smell closely, or touch unknown acids or bases. The experiments are simulations for learning.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      } else {
        html += `
          <!-- Acid + Base Neutralization Visual Result -->
          <div class="exp-result-container chemical-result">
            <div class="reaction-animation-box">
              <div class="neutralization-anim-box">
                <span class="neut-particle-1">🧪</span>
                <span style="font-size:1.5rem;">+</span>
                <span class="neut-particle-2">🧪</span>
                <span style="font-size:1.5rem;">➡️</span>
                <span>💧 🧂</span>
              </div>
            </div>
            <div class="result-badge chemical">Result: Neutralization Reaction</div>
          </div>

          <!-- Explanation Section -->
          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>When an acid reacts with a base, they can <b>neutralize each other</b>. The reaction produces <b>water and a salt</b>.</p>
            </div>

            <div class="exp-explain-block">
              <h5>General Reaction:</h5>
              <p><b>Acid + Base → Salt + Water</b></p>
              <p style="font-size:0.84rem; color:#5B21B6; margin-top:4px;"><b>Example:</b> Hydrochloric Acid + Sodium Hydroxide → Sodium Chloride + Water<br><code>HCl + NaOH → NaCl + H₂O</code></p>
            </div>

            <div class="exp-explain-block">
              <h5>What Is Neutralization?</h5>
              <p>Neutralization is a chemical reaction in which an acid reacts with a base, reducing their acidic and basic properties.</p>
              <ul style="margin-top:6px;">
                <li>The acid provides <b>H⁺ ions</b>.</li>
                <li>The base provides <b>OH⁻ ions</b>.</li>
                <li><b>H⁺ + OH⁻ → H₂O</b></li>
                <li>The remaining ions combine to form a <b>salt</b>.</li>
              </ul>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Neutralization occurs when an acid and a base react to form salt and water.
            </div>

            <!-- Information Panel -->
            <div class="exp-info-panel">
              <h5>🔬 Reaction: Neutralization</h5>
              <div class="exp-info-item"><b>Reactants:</b> 🧪 Acid + 🧪 Base</div>
              <div class="exp-info-item"><b>Products:</b> 🧂 Salt + 💧 Water</div>
              <div class="exp-info-item" style="margin-top:4px;"><b>Real-Life Examples ("Where do we see this?"):</b></div>
              <div class="exp-info-item">• 💊 <b>Antacids</b> — bases can neutralize excess stomach acid.</div>
              <div class="exp-info-item">• 🌱 <b>Soil treatment</b> — substances can be added to adjust overly acidic soil.</div>
              <div class="exp-info-item">• 🏭 <b>Wastewater treatment</b> — acids and bases can be neutralized to help control pH.</div>
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  renderChemicalEquationsActivity(container) {
    const isH2O = this.chemicalEquationsMode === 'h2o';

    const items = isH2O ? [
      { id: 'hydrogen', name: 'Hydrogen (H₂)', icon: '💨', sub: 'Gas Molecule' },
      { id: 'oxygen', name: 'Oxygen (O₂)', icon: '💨', sub: 'Gas Molecule' }
    ] : [
      { id: 'sodium', name: 'Sodium (Na)', icon: '🪙', sub: 'Alkali Metal' },
      { id: 'chlorine', name: 'Chlorine (Cl₂)', icon: '🟢', sub: 'Halogen Gas' }
    ];

    const canAction = this.selectedItems.size === 2;
    const otherMode = isH2O ? 'nacl' : 'h2o';
    const otherLabel = isH2O ? '🧂 Experiment 2: Na + Cl₂ → NaCl' : '🧪 Experiment 1: H₂ + O₂ → H₂O';

    let html = `
      <div class="exp-activity-wrapper">
        <!-- 2 Experiment Selection Buttons -->
        <div class="exp-mode-toggle-group">
          <button class="exp-mode-btn ${isH2O ? 'active' : ''}" onclick="Experiment.switchChemicalEquationsMode('h2o')">
            🧪 H₂ + O₂ → H₂O
          </button>
          <button class="exp-mode-btn ${!isH2O ? 'active' : ''}" onclick="Experiment.switchChemicalEquationsMode('nacl')">
            🧂 Na + Cl₂ → NaCl
          </button>
        </div>

        <div class="exp-activity-card">
          <div class="exp-sub-title">
            ${isH2O ? '🧪 EXPERIMENT 1 — Hydrogen + Oxygen → Water' : '🧪 EXPERIMENT 2 — Sodium + Chlorine → Sodium Chloride'}
          </div>
    `;

    if (!this.isCombined) {
      html += `
          <p class="exp-instruction">Select both reactants before pressing <b>REACT</b>:</p>

          <!-- Selectable Items Grid -->
          <div class="exp-items-grid">
      `;

      items.forEach(item => {
        const isSelected = this.selectedItems.has(item.id);
        html += `
          <div class="exp-item-card ${isSelected ? 'selected' : ''}" onclick="Experiment.toggleItemSelection('${item.id}')">
            <div class="exp-item-icon">${item.icon}</div>
            <div class="exp-item-name">${item.name}</div>
            <div class="exp-item-sub">${item.sub}</div>
            <div class="exp-select-badge">${isSelected ? '✓ Selected' : '+ Select'}</div>
          </div>
        `;
      });

      html += `
          </div>

          <button class="primary-btn combine-action-btn ${canAction ? 'ready' : 'disabled'}"
                  ${canAction ? 'onclick="Experiment.combineItems()"' : 'disabled'}>
            REACT ⚡
          </button>
        </div>
      `;
    } else {
      // Combined Result Screen with Prominent Chemical Equation
      const eqFormula = isH2O ? '2H₂ + O₂ → 2H₂O' : '2Na + Cl₂ → 2NaCl';

      html += `
        <!-- Reaction Visual Animation -->
        <div class="exp-result-container chemical-result">
          <div class="reaction-animation-box">
            <div class="neutralization-anim-box">
              <span class="neut-particle-1">${isH2O ? '💨' : '🪙'}</span>
              <span style="font-size:1.5rem;">+</span>
              <span class="neut-particle-2">${isH2O ? '💨' : '🟢'}</span>
              <span style="font-size:1.5rem;">➡️</span>
              <span>${isH2O ? '💧 H₂O' : '🧂 NaCl'}</span>
            </div>
          </div>
          <div class="result-badge chemical">Product: ${isH2O ? 'Water (H₂O)' : 'Sodium Chloride (NaCl)'}</div>
        </div>

        <!-- MAIN PROMINENT RESULT: CHEMICAL EQUATION -->
        <div class="eq-main-banner">
          <div class="eq-banner-title">⚗️ CHEMICAL EQUATION</div>
          <div class="eq-equation-display">${eqFormula}</div>
        </div>

        <!-- Explanation & Equation Breakdown -->
        <div class="exp-explanation-section">
          <div class="exp-explain-block">
            <h5>Equation Breakdown:</h5>
            <div class="eq-symbol-grid">
              <div class="eq-symbol-item">${isH2O ? '<b>H₂</b> = Hydrogen' : '<b>Na</b> = Sodium'}</div>
              <div class="eq-symbol-item">${isH2O ? '<b>O₂</b> = Oxygen' : '<b>Cl₂</b> = Chlorine'}</div>
              <div class="eq-symbol-item">${isH2O ? '<b>H₂O</b> = Water' : '<b>NaCl</b> = Sodium Chloride'}</div>
              <div class="eq-symbol-item"><b>+</b> = Reacts with</div>
              <div class="eq-symbol-item"><b>→</b> = Produces</div>
              <div class="eq-symbol-item"><b>2</b> = Coefficient</div>
            </div>
            <div style="font-size:0.86rem; margin-top:8px; color:#334155;">
              • <b>Reactants:</b> ${isH2O ? 'Hydrogen and Oxygen' : 'Sodium and Chlorine'}<br>
              • <b>Product:</b> ${isH2O ? 'Water' : 'Sodium Chloride'}
            </div>
          </div>

          <!-- Balance Check Section -->
          <div class="exp-explain-block">
            <h5>⚖️ Balance Check</h5>
            <div class="atom-counter-grid">
              <div class="atom-count-card">
                <h6>Reactants</h6>
                <p>${isH2O ? 'Hydrogen: 4 atoms' : 'Sodium: 2 atoms'}</p>
                <p>${isH2O ? 'Oxygen: 2 atoms' : 'Chlorine: 2 atoms'}</p>
              </div>
              <div class="atom-count-card">
                <h6>Products</h6>
                <p>${isH2O ? 'Hydrogen: 4 atoms' : 'Sodium: 2 atoms'}</p>
                <p>${isH2O ? 'Oxygen: 2 atoms' : 'Chlorine: 2 atoms'}</p>
              </div>
            </div>
            <div class="toast-banner" style="background:#DCFCE7; border-color:#86EFAC; color:#15803D; margin-top:10px;">
              ✅ BALANCED EQUATION
            </div>
            <p style="font-size:0.84rem; color:#334155; margin-top:6px;">
              The equation is balanced because the number of ${isH2O ? 'hydrogen and oxygen' : 'sodium and chlorine'} atoms is the same on both sides.
            </p>
          </div>

          <div class="exp-key-idea-box chemical-key">
            💡 <b>Key Learning:</b> A chemical equation represents a chemical reaction using chemical formulas and coefficients.
          </div>

          <!-- OPTIONAL BALANCING CHALLENGE -->
          <div class="challenge-card">
            <div class="challenge-title">🎯 Balancing Challenge</div>
            <p style="font-size:0.85rem; color:#4C1D95; margin:0;">Fill in the coefficients to balance the equation:</p>
            <div class="challenge-row">
              <input type="number" id="coeff1" class="coeff-input" placeholder="?" min="1" max="9">
              <span>${isH2O ? 'H₂ +' : 'Na +'}</span>
              <input type="number" id="coeff2" class="coeff-input" placeholder="1" min="1" max="9">
              <span>${isH2O ? 'O₂ →' : 'Cl₂ →'}</span>
              <input type="number" id="coeff3" class="coeff-input" placeholder="?" min="1" max="9">
              <span>${isH2O ? 'H₂O' : 'NaCl'}</span>
            </div>

            <button class="primary-btn" style="padding:10px 18px; font-size:0.9rem;" onclick="Experiment.checkBalancingChallenge()">
              Check Balance 🎯
            </button>

            ${this.challengeSubmitted ? `
              <div class="feedback-pill ${this.challengeIsCorrect ? 'correct' : 'incorrect'}">
                ${this.challengeIsCorrect ? '✅ Correct! The equation is balanced.' : '❌ Try again! Count each type of atom on both sides.'}
              </div>
            ` : ''}
          </div>

          <!-- Key Concepts Panel -->
          <div class="exp-info-panel">
            <h5>📚 Key Concepts</h5>
            <div class="exp-info-item"><b>Reactants:</b> The substances that start the chemical reaction.</div>
            <div class="exp-info-item"><b>Products:</b> The new substances formed by the reaction.</div>
            <div class="exp-info-item"><b>Coefficients:</b> Numbers placed in front of chemical formulas to show how many particles or molecules are involved.</div>
            <div class="exp-info-item"><b>Balanced Chemical Equation:</b> An equation where the number of atoms of each element is equal on both sides.</div>
            <div class="exp-info-item" style="margin-top:4px; font-weight:700; color:#92400E;">💡 Important Rule: Never change the small numbers inside a chemical formula when balancing an equation. Change only the coefficients in front.</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Experiment
          </button>
          <button class="primary-btn" style="padding:12px; border-radius:14px; font-size:0.9rem;" onclick="Experiment.switchChemicalEquationsMode('${otherMode}')">
            🔀 ${otherLabel}
          </button>
        </div>
      </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  renderBalancingChemicalEquationsActivity(container) {
    const isGuided = this.balancingStage === 'guided';

    const c1Val = parseInt(this.bCoeff1) || 1;
    const c2Val = parseInt(this.bCoeff2) || 1;
    const c3Val = parseInt(this.bCoeff3) || 1;

    let isHOrNaBalanced = false;
    let isOOrClBalanced = false;
    let isBalanced = false;

    if (isGuided) {
      // H2 + O2 -> H2O
      // Reactants: H = 2*c1Val, O = 2*c2Val
      // Products: H = 2*c3Val, O = 1*c3Val
      isHOrNaBalanced = (2 * c1Val === 2 * c3Val);
      isOOrClBalanced = (2 * c2Val === 1 * c3Val);
      isBalanced = isHOrNaBalanced && isOOrClBalanced;
    } else {
      // Na + Cl2 -> NaCl
      // Reactants: Na = 1*c1Val, Cl = 2*c2Val
      // Products: Na = 1*c3Val, Cl = 1*c3Val
      isHOrNaBalanced = (1 * c1Val === 1 * c3Val);
      isOOrClBalanced = (2 * c2Val === 1 * c3Val);
      isBalanced = isHOrNaBalanced && isOOrClBalanced;
    }

    let html = `
      <div class="exp-activity-wrapper">
        <!-- 2 Stage Selection Buttons -->
        <div class="exp-mode-toggle-group">
          <button class="exp-mode-btn ${isGuided ? 'active' : ''}" onclick="Experiment.switchBalancingStage('guided')">
            ⚖️ Guided Example
          </button>
          <button class="exp-mode-btn ${!isGuided ? 'active' : ''}" onclick="Experiment.switchBalancingStage('practice')">
            🎯 Practice Challenge
          </button>
        </div>

        <div class="exp-activity-card">
          <div class="exp-sub-title">
            ${isGuided ? '⚖️ Activity: Balance the Chemical Equation (H₂ + O₂ → H₂O)' : '🎯 Practice Challenge: Na + Cl₂ → NaCl'}
          </div>
          <p class="exp-instruction">Balance the equation by changing the numbers in front of the chemical formulas:</p>

          <!-- PROMINENT UNBALANCED EQUATION WITH EDITABLE COEFFICIENT BOXES & STEPPERS -->
          <div class="eq-main-banner" style="background: linear-gradient(135deg, #4C1D95 0%, #2E1065 100%);">
            <div class="eq-banner-title">CHEMICAL FORMULA</div>
            <div class="challenge-row" style="margin-top:6px;">
              
              <!-- Coeff 1 Stepper -->
              <div class="stepper-box">
                <button class="stepper-btn" onclick="Experiment.updateCoeff(1, -1)">-</button>
                <input type="number" class="coeff-input" value="${this.bCoeff1}" min="1" max="9" onchange="Experiment.setCoeffDirect(1, this.value)">
                <button class="stepper-btn" onclick="Experiment.updateCoeff(1, 1)">+</button>
              </div>
              <span style="font-size:1.5rem; color:#FDE047;">${isGuided ? 'H₂ +' : 'Na +'}</span>

              <!-- Coeff 2 Stepper -->
              <div class="stepper-box">
                <button class="stepper-btn" onclick="Experiment.updateCoeff(2, -1)">-</button>
                <input type="number" class="coeff-input" value="${this.bCoeff2}" min="1" max="9" onchange="Experiment.setCoeffDirect(2, this.value)">
                <button class="stepper-btn" onclick="Experiment.updateCoeff(2, 1)">+</button>
              </div>
              <span style="font-size:1.5rem; color:#FDE047;">${isGuided ? 'O₂ →' : 'Cl₂ →'}</span>

              <!-- Coeff 3 Stepper -->
              <div class="stepper-box">
                <button class="stepper-btn" onclick="Experiment.updateCoeff(3, -1)">-</button>
                <input type="number" class="coeff-input" value="${this.bCoeff3}" min="1" max="9" onchange="Experiment.setCoeffDirect(3, this.value)">
                <button class="stepper-btn" onclick="Experiment.updateCoeff(3, 1)">+</button>
              </div>
              <span style="font-size:1.5rem; color:#FDE047;">${isGuided ? 'H₂O' : 'NaCl'}</span>

            </div>
          </div>

          <!-- REAL-TIME LIVE ATOM COUNTER & BALANCE STATUS -->
          <div class="atom-counter-grid">
            <div class="atom-count-card">
              <h6>Reactants</h6>
              <p>• ${isGuided ? 'H' : 'Na'}: <b>${isGuided ? 2 * c1Val : 1 * c1Val}</b> ${isHOrNaBalanced ? '✓' : '⚠️'}</p>
              <p>• ${isGuided ? 'O' : 'Cl'}: <b>${2 * c2Val}</b> ${isOOrClBalanced ? '✓' : '⚠️ <span class="unbalanced-tag">Unbalanced</span>'}</p>
            </div>
            <div class="atom-count-card">
              <h6>Products</h6>
              <p>• ${isGuided ? 'H' : 'Na'}: <b>${isGuided ? 2 * c3Val : 1 * c3Val}</b> ${isHOrNaBalanced ? '✓' : '⚠️'}</p>
              <p>• ${isGuided ? 'O' : 'Cl'}: <b>${1 * c3Val}</b> ${isOOrClBalanced ? '✓' : '⚠️ <span class="unbalanced-tag">Unbalanced</span>'}</p>
            </div>
          </div>

          <!-- Status Toast Banner -->
          ${isBalanced ? `
            <div class="toast-banner" style="background:#DCFCE7; border-color:#86EFAC; color:#15803D; margin-top:10px; font-size:1.1rem; padding:12px;">
              🎉 ✅ BALANCED!
            </div>
          ` : `
            <div class="toast-banner" style="background:#FFFBEB; border-color:#F59E0B; color:#92400E; margin-top:10px;">
              ⚠️ Not balanced yet. Keep adjusting coefficients!
            </div>
          `}
        </div>

        <!-- HINT SYSTEM FOR GUIDED EXAMPLE -->
        ${isGuided ? `
          <div style="margin-top:10px;">
            <button class="secondary-btn" style="padding:8px 14px; font-size:0.85rem;" onclick="Experiment.showNextHint()">
              💡 Show Hint (${this.hintIndex}/3)
            </button>

            ${this.hintIndex >= 1 ? `
              <div class="hint-card">
                <div class="hint-title">Hint 1:</div>
                Look at the oxygen atoms. There are 2 oxygen atoms on the left but only 1 on the right.
              </div>
            ` : ''}

            ${this.hintIndex >= 2 ? `
              <div class="hint-card">
                <div class="hint-title">Hint 2:</div>
                Try placing a 2 in front of H₂O.
              </div>
            ` : ''}

            ${this.hintIndex >= 3 ? `
              <div class="hint-card">
                <div class="hint-title">Hint 3:</div>
                Now check hydrogen. You may need to adjust the coefficient in front of H₂.<br>
                <i>(Remember: Do not change the small numbers inside H₂, O₂, or H₂O!)</i>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- CHECK ANSWER BUTTON & FEEDBACK FOR PRACTICE CHALLENGE -->
        ${!isGuided ? `
          <div style="margin-top:10px; text-align:center;">
            <button class="primary-btn" style="padding:10px 18px; font-size:0.9rem;" onclick="Experiment.checkBalancingAnswer()">
              Check Answer 🎯
            </button>
            ${this.bSubmitted ? `
              <div class="feedback-pill ${this.bIsCorrect ? 'correct' : 'incorrect'}" style="margin-top:8px; display:inline-block;">
                ${this.bIsCorrect ? '✅ Correct! You balanced the equation! There are 2 sodium atoms and 2 chlorine atoms on both sides.' : '❌ Not balanced yet. Count the atoms of each element on both sides and try again.'}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- EXPLANATION & BALANCE CHECK TABLE -->
        ${isBalanced ? `
          <div class="exp-explanation-section" style="margin-top:12px;">
            <div class="exp-explain-block">
              <h5>🧠 Explanation: Step-by-Step</h5>
              <div style="font-weight:700; color:#5B21B6; font-size:0.95rem; margin-bottom:6px;">
                Balanced Chemical Equation: ${isGuided ? '2H₂ + O₂ → 2H₂O' : '2Na + Cl₂ → 2NaCl'}
              </div>
              
              ${isGuided ? `
                <p><b>Step 1 — Count the atoms</b><br>Before balancing: H: 2 on left, 2 on right | O: 2 on left, 1 on right. Oxygen is not balanced.</p>
                <p><b>Step 2 — Add a coefficient</b><br>Place 2 before H₂O: <code>H₂ + O₂ → 2H₂O</code>. Now oxygen is balanced, but hydrogen is not.</p>
                <p><b>Step 3 — Balance hydrogen</b><br>Place 2 before H₂: <code>2H₂ + O₂ → 2H₂O</code>. Now both elements have equal numbers of atoms.</p>
              ` : `
                <p><b>Step 1 — Count the atoms</b><br>Before balancing: Na: 1 on left, 1 on right | Cl: 2 on left, 1 on right. Chlorine is not balanced.</p>
                <p><b>Step 2 — Add a coefficient</b><br>Place 2 before NaCl: <code>Na + Cl₂ → 2NaCl</code>. Now chlorine is balanced, but sodium is not.</p>
                <p><b>Step 3 — Balance sodium</b><br>Place 2 before Na: <code>2Na + Cl₂ → 2NaCl</code>. Now both elements have equal numbers of atoms.</p>
              `}
            </div>

            <!-- Visual Comparison Table -->
            <div class="exp-explain-block">
              <h5>📊 Balance Check</h5>
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th>Element</th>
                    <th>Reactants</th>
                    <th>Products</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${isGuided ? `
                    <tr>
                      <td><b>H</b></td>
                      <td>4</td>
                      <td>4</td>
                      <td>✅</td>
                    </tr>
                    <tr>
                      <td><b>O</b></td>
                      <td>2</td>
                      <td>2</td>
                      <td>✅</td>
                    </tr>
                  ` : `
                    <tr>
                      <td><b>Na</b></td>
                      <td>2</td>
                      <td>2</td>
                      <td>✅</td>
                    </tr>
                    <tr>
                      <td><b>Cl</b></td>
                      <td>2</td>
                      <td>2</td>
                      <td>✅</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- IMPORTANT RULE CARD -->
        <div class="rule-card">
          <div class="rule-title">⚠️ Important Rule</div>
          <p style="margin:0; font-size:0.84rem; color:#78350F; line-height:1.4;">
            When balancing chemical equations, <b>change only the coefficients</b>. Never change the subscripts in a chemical formula.
          </p>
          <div class="rule-example">
            <div>❌ <code>H₂O₂</code> — changing the subscript changes the substance (Water becomes Hydrogen Peroxide).</div>
            <div>✅ <code>2H₂O</code> — changing the coefficient changes the number of molecules without changing the substance.</div>
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:12px;">
          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Activity
          </button>
          ${isGuided ? `
            <button class="primary-btn" style="padding:12px; border-radius:14px; font-size:0.9rem;" onclick="Experiment.switchBalancingStage('practice')">
              🎯 Next Challenge (Na + Cl₂ → NaCl) ➔
            </button>
          ` : `
            <button class="primary-btn" style="padding:12px; border-radius:14px; font-size:0.9rem;" onclick="Experiment.switchBalancingStage('guided')">
              ⬅️ Back to Guided Example (H₂ + O₂ → H₂O)
            </button>
          `}
        </div>
      </div>
    `;

    container.innerHTML = html;
  },
  switchRatesMode(mode) {
    this.ratesMode = mode;
    this.ratesCondition = 'without';
    this.ratesStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderRatesActivity(canvasBox);
    }
  },

  setRatesCondition(cond) {
    this.ratesCondition = cond;
    this.ratesStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderRatesActivity(canvasBox);
    }
  },

  startRatesReaction() {
    this.ratesStarted = true;
    if (this.ratesMode === 'catalyst') {
      this.ratesExp1Completed = true;
    } else if (this.ratesMode === 'inhibitor') {
      this.ratesExp2Completed = true;
    }
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderRatesActivity(canvasBox);
    }
  },

  resetRatesActivity() {
    this.ratesStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderRatesActivity(canvasBox);
    }
  },

  renderRatesActivity(container) {
    const mode = this.ratesMode; // 'catalyst', 'inhibitor', 'summary'
    const cond = this.ratesCondition; // 'without', 'with'
    const isStarted = this.ratesStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <!-- 3 Top Mode Toggle Buttons -->
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'catalyst' ? 'active' : ''}" onclick="Experiment.switchRatesMode('catalyst')">
            🧪 Exp 1: Catalyst
          </button>
          <button class="exp-mode-btn ${mode === 'inhibitor' ? 'active' : ''}" onclick="Experiment.switchRatesMode('inhibitor')">
            🧪 Exp 2: Inhibitor
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchRatesMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'catalyst') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🧪 EXPERIMENT 1 — Catalyst: Hydrogen Peroxide + Catalyst</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate that a catalyst increases the rate of a reaction without being consumed by the reaction.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <p class="exp-instruction" style="margin-top:10px;">Interactive Flow — Displaying Substances:</p>
          
          <div class="exp-items-display-grid">
            <div class="exp-item-card readonly">
              <div class="exp-item-icon">🧪</div>
              <div class="exp-item-name">Hydrogen Peroxide</div>
              <div class="exp-item-sub">Reactant</div>
            </div>
            <div class="exp-item-card readonly">
              <div class="exp-item-icon">🧪</div>
              <div class="exp-item-name">Catalyst</div>
              <div class="exp-item-sub">Rate Accelerator</div>
            </div>
            <div class="exp-item-card readonly">
              <div class="exp-item-icon">💧</div>
              <div class="exp-item-name">Water</div>
              <div class="exp-item-sub">Control / Comparison</div>
            </div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Condition:</label>
            <div class="exp-condition-buttons">
              <button class="exp-cond-btn ${cond === 'without' ? 'active' : ''}" onclick="Experiment.setRatesCondition('without')">
                Without Catalyst
              </button>
              <button class="exp-cond-btn ${cond === 'with' ? 'active' : ''}" onclick="Experiment.setRatesCondition('with')">
                With Catalyst
              </button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startRatesReaction()">
            🧪 [ START REACTION ]
          </button>
        </div>
        `;
      } else {
        const isWithout = (cond === 'without');

        html += `
          <div class="exp-result-container ${isWithout ? 'physical-result' : 'chemical-result'}">
            <div class="rates-animation-box ${isWithout ? 'rates-anim-slow' : 'rates-anim-fast'}">
              <div class="beaker-base">🧪</div>
              <div class="particles-layer">
                ${isWithout ? `
                  <span class="rate-particle p1">🫧</span>
                  <span class="rate-particle p2">🫧</span>
                ` : `
                  <span class="rate-particle p1">🫧</span>
                  <span class="rate-particle p2">⚡</span>
                  <span class="rate-particle p3">🫧</span>
                  <span class="rate-particle p4">⚡</span>
                  <span class="rate-particle p5">🫧</span>
                  <span class="rate-particle spark">✨</span>
                `}
              </div>
            </div>

            <div class="result-badge ${isWithout ? 'slow' : 'faster'}">
              ${isWithout ? '🐢 SLOW REACTION' : '⚡ FASTER REACTION'}
            </div>
            <div class="rate-speed-tag">Reaction Rate: ${isWithout ? 'Slow' : 'Faster'}</div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>Explain:</h5>
              <p>${isWithout ? 
                'Without a catalyst, the reaction happens slowly because fewer particles have enough energy to overcome the activation energy.' : 
                'A catalyst provides an alternative reaction pathway with a lower activation energy. This allows more particles to react successfully in the same amount of time.'
              }</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Catalyst → lowers activation energy → increases reaction rate
            </div>

            <div class="exp-info-panel" style="background:#EFF6FF; border-color:#BFDBFE;">
              <div class="exp-info-item" style="color:#1E40AF;">
                ⚠️ <b>Important:</b> A catalyst is not used up in the overall reaction.
              </div>
            </div>

            <div class="exp-explain-block">
              <h5>Visual Comparison</h5>
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th>Condition</th>
                    <th>Reaction Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="${isWithout ? 'highlight-row' : ''}">
                    <td>Without catalyst</td>
                    <td>🐢 Slow</td>
                  </tr>
                  <tr class="${!isWithout ? 'highlight-row' : ''}">
                    <td>With catalyst</td>
                    <td>⚡ Faster</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetRatesActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'inhibitor') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🧪 EXPERIMENT 2 — Inhibitor: Hydrogen Peroxide + Inhibitor</div>
          <div class="exp-explain-block" style="background:#FEF2F2; border-color:#FCA5A5;">
            <p style="font-size:0.88rem; color:#991B1B; font-weight:700;">
              <b>Goal:</b> Demonstrate that an inhibitor slows down a chemical reaction.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <p class="exp-instruction" style="margin-top:10px;">Interactive Flow — Displaying Substances:</p>
          
          <div class="exp-items-display-grid">
            <div class="exp-item-card readonly">
              <div class="exp-item-icon">🧪</div>
              <div class="exp-item-name">Hydrogen Peroxide</div>
              <div class="exp-item-sub">Reactant</div>
            </div>
            <div class="exp-item-card readonly">
              <div class="exp-item-icon">🧪</div>
              <div class="exp-item-name">Inhibitor</div>
              <div class="exp-item-sub">Rate Decelerator</div>
            </div>
            <div class="exp-item-card readonly">
              <div class="exp-item-icon">💧</div>
              <div class="exp-item-name">Water</div>
              <div class="exp-item-sub">Control / Comparison</div>
            </div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Condition:</label>
            <div class="exp-condition-buttons">
              <button class="exp-cond-btn ${cond === 'without' ? 'active' : ''}" onclick="Experiment.setRatesCondition('without')">
                Without Inhibitor
              </button>
              <button class="exp-cond-btn ${cond === 'with' ? 'active' : ''}" onclick="Experiment.setRatesCondition('with')">
                With Inhibitor
              </button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startRatesReaction()">
            🧪 [ START REACTION ]
          </button>
        </div>
        `;
      } else {
        const isWithout = (cond === 'without');

        html += `
          <div class="exp-result-container ${isWithout ? 'physical-result' : 'chemical-result'}">
            <div class="rates-animation-box ${isWithout ? 'rates-anim-normal' : 'rates-anim-slower'}">
              <div class="beaker-base">🧪</div>
              <div class="particles-layer">
                ${isWithout ? `
                  <span class="rate-particle p1">🫧</span>
                  <span class="rate-particle p2">🫧</span>
                  <span class="rate-particle p3">🫧</span>
                ` : `
                  <span class="rate-particle p1">💧</span>
                  <span class="rate-particle p2">💧</span>
                  <span class="rate-particle blocker">🛑</span>
                `}
              </div>
            </div>

            <div class="result-badge ${isWithout ? 'normal' : 'slower'}">
              ${isWithout ? '⚡ NORMAL REACTION' : '🐢 SLOWER REACTION'}
            </div>
            <div class="rate-speed-tag">Reaction Rate: ${isWithout ? 'Normal' : 'Slower'}</div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>Explain:</h5>
              <p>${isWithout ? 
                'The reaction proceeds normally because there is no substance interfering with the reaction.' : 
                'An inhibitor reduces the rate of a chemical reaction by interfering with the reaction process. It can make effective collisions less likely or interfere with the reaction pathway.'
              }</p>
            </div>

            <div class="exp-key-idea-box chemical-key" style="background:#FFF7ED; border-color:#FFD8A8; color:#9A3412;">
              💡 <b>Key Idea:</b> Inhibitor → slows down a reaction
            </div>

            <div class="exp-explain-block">
              <h5>Visual Comparison</h5>
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th>Condition</th>
                    <th>Reaction Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="${isWithout ? 'highlight-row' : ''}">
                    <td>Without inhibitor</td>
                    <td>⚡ Normal</td>
                  </tr>
                  <tr class="${!isWithout ? 'highlight-row' : ''}">
                    <td>With inhibitor</td>
                    <td>🐢 Slower</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetRatesActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      // 📚 Final Learning Panel
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Learning Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9; font-size:1.1rem;">⚡ Catalysts vs. Inhibitors</h5>
            <table class="comparison-table" style="margin-top:10px;">
              <thead>
                <tr>
                  <th>Aspect</th>
                  <th style="color:#15803D;">🟢 Catalyst</th>
                  <th style="color:#B91C1C;">🔴 Inhibitor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Effect</b></td>
                  <td>Speeds up reaction</td>
                  <td>Slows down reaction</td>
                </tr>
                <tr>
                  <td><b>Activation energy</b></td>
                  <td>Generally lowers it</td>
                  <td>Can interfere with reaction pathways</td>
                </tr>
                <tr>
                  <td><b>Purpose</b></td>
                  <td>Make reactions faster</td>
                  <td>Control or slow reactions</td>
                </tr>
                <tr>
                  <td><b>Overall effect</b></td>
                  <td>⬆️ Reaction rate</td>
                  <td>⬇️ Reaction rate</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>Key Concepts</h5>
              <div style="margin-bottom:8px;">
                <b>Catalyst:</b><br>
                <span style="font-size:0.86rem; color:#475569;">A substance that increases the rate of a chemical reaction by providing an alternative pathway with lower activation energy, without being consumed overall.</span>
              </div>
              <div>
                <b>Inhibitor:</b><br>
                <span style="font-size:0.86rem; color:#475569;">A substance that decreases the rate of a chemical reaction by interfering with the reaction process.</span>
              </div>
            </div>

            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p>Students should understand:</p>
              <div class="exp-obj-pills">
                <div class="obj-pill catalyst">Catalyst → Faster Reaction ⚡</div>
                <div class="obj-pill inhibitor">Inhibitor → Slower Reaction 🐢</div>
              </div>
              <p class="exp-obj-sub">Both are important because they allow scientists and industries to control the rate of chemical reactions.</p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchRatesMode('catalyst')">
              🧪 Exp 1: Catalyst
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchRatesMode('inhibitor')">
              🧪 Exp 2: Inhibitor
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchHomeostasisMode(mode) {
    this.homeostasisMode = mode;
    this.homeostasisCondition = mode === 'temperature' ? 'hot' : (mode === 'glucose' ? 'eat' : 'hot');
    this.homeostasisStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderHomeostasisActivity(canvasBox);
    }
  },

  setHomeostasisCondition(cond) {
    this.homeostasisCondition = cond;
    this.homeostasisStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderHomeostasisActivity(canvasBox);
    }
  },

  startHomeostasisReaction() {
    this.homeostasisStarted = true;
    if (this.homeostasisMode === 'temperature') {
      this.homeostasisExp1Completed = true;
    } else if (this.homeostasisMode === 'glucose') {
      this.homeostasisExp2Completed = true;
    }
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderHomeostasisActivity(canvasBox);
    }
  },

  resetHomeostasisActivity() {
    this.homeostasisStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderHomeostasisActivity(canvasBox);
    }
  },

  tryOtherHomeostasisCondition() {
    if (this.homeostasisMode === 'temperature') {
      this.homeostasisCondition = (this.homeostasisCondition === 'hot') ? 'cold' : 'hot';
    } else if (this.homeostasisMode === 'glucose') {
      this.homeostasisCondition = (this.homeostasisCondition === 'eat') ? 'nofood' : 'eat';
    }
    this.homeostasisStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderHomeostasisActivity(canvasBox);
    }
  },

  renderHomeostasisActivity(container) {
    const mode = this.homeostasisMode; // 'temperature', 'glucose', 'summary'
    const cond = this.homeostasisCondition; // 'hot' / 'cold' or 'eat' / 'nofood'
    const isStarted = this.homeostasisStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <!-- 3 Top Mode Toggle Buttons -->
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'temperature' ? 'active' : ''}" onclick="Experiment.switchHomeostasisMode('temperature')">
            🌡️ Exp 1: Temp
          </button>
          <button class="exp-mode-btn ${mode === 'glucose' ? 'active' : ''}" onclick="Experiment.switchHomeostasisMode('glucose')">
            🍬 Exp 2: Glucose
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchHomeostasisMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'temperature') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌡️ EXPERIMENT 1 — Body Temperature Regulation</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate how the human body maintains a stable internal temperature when the environment becomes too hot or too cold.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div class="homeo-body-icon">🧍</div>
            <div class="homeo-temp-display">🌡️ Body Temperature: 37°C</div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Provide Environmental Condition:</label>
            <div class="exp-condition-buttons">
              <button class="exp-cond-btn ${cond === 'hot' ? 'active' : ''}" onclick="Experiment.setHomeostasisCondition('hot')">
                ☀️ Hot Environment
              </button>
              <button class="exp-cond-btn ${cond === 'cold' ? 'active' : ''}" onclick="Experiment.setHomeostasisCondition('cold')">
                ❄️ Cold Environment
              </button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startHomeostasisReaction()">
            🌡️ [ CHANGE ENVIRONMENT ]
          </button>
        </div>
        `;
      } else {
        const isHot = (cond === 'hot');

        html += `
          <div class="exp-result-container ${isHot ? 'chemical-result' : 'physical-result'}">
            <div class="homeo-body-card" style="margin:0; width:100%; border:none; background:transparent; box-shadow:none;">
              <div class="homeo-body-icon">${isHot ? '🥵' : '🥶'}</div>
              <div class="homeo-temp-display ${isHot ? 'hot' : 'cold'}">
                ${isHot ? '37°C → 38°C' : '37°C → 35–36°C'}
              </div>
            </div>

            <div class="result-badge maintained">
              ✅ HOMEOSTASIS MAINTAINED
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>Body Response:</h5>
              <div class="homeo-stepper-box">
                ${isHot ? `
                  <div class="homeo-step-card">
                    <span class="step-icon">💦</span>
                    <span class="step-text">Sweating increases</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">🩸</span>
                    <span class="step-text">Blood vessels near the skin widen</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">🌡️</span>
                    <span class="step-text">Body temperature returns toward normal (38°C → 37°C)</span>
                  </div>
                ` : `
                  <div class="homeo-step-card">
                    <span class="step-icon">🥶</span>
                    <span class="step-text">Shivering increases</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">🩸</span>
                    <span class="step-text">Blood vessels near the skin narrow</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">🔥</span>
                    <span class="step-text">Heat loss decreases</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">🌡️</span>
                    <span class="step-text">Body temperature returns toward normal (35–36°C → 37°C)</span>
                  </div>
                `}
              </div>
            </div>

            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>${isHot ? 
                'When the body becomes too warm, the body responds by increasing sweating and sending more blood toward the skin. These responses help release heat and bring body temperature back toward its normal range.' : 
                'When the body becomes too cold, it responds by producing and conserving heat. Shivering produces heat, while narrowing blood vessels near the skin reduces heat loss.'
              }</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> ${isHot ? 
                'Too hot → sweating + increased heat loss → temperature moves back toward normal' : 
                'Too cold → shivering + reduced heat loss → temperature moves back toward normal'
              }
            </div>

            <div class="homeo-flow-diagram">
              <h5>📊 Visual Flow</h5>
              <div class="homeo-flow-steps">
                <div class="homeo-flow-pill">Normal Temperature (🌡️ 37°C)</div>
                <div class="homeo-flow-arrow">↓</div>
                <div class="homeo-flow-pill">Environmental Change (${isHot ? '☀️ Too Hot' : '❄️ Too Cold'})</div>
                <div class="homeo-flow-arrow">↓</div>
                <div class="homeo-flow-pill">Body Detects Change</div>
                <div class="homeo-flow-arrow">↓</div>
                <div class="homeo-flow-pill">Body Responds (${isHot ? 'Sweating / Vessel Widening' : 'Shivering / Vessel Narrowing'})</div>
                <div class="homeo-flow-arrow">↓</div>
                <div class="homeo-flow-pill" style="border-color:#10B981; color:#065F46; background:#ECFDF5;">🌡️ Temperature Returns Toward Normal (37°C)</div>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.resetHomeostasisActivity()">
              🔄 Reset Experiment
            </button>
            <button class="secondary-btn" style="flex:1; background:#F3E8FF; border-color:#C084FC; color:#6D28D9;" onclick="Experiment.tryOtherHomeostasisCondition()">
              🔀 Try Other Condition (${isHot ? 'Cold ❄️' : 'Hot ☀️'})
            </button>
          </div>
        </div>
        `;
      }
    } else if (mode === 'glucose') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🍬 EXPERIMENT 2 — Blood Glucose Regulation</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate how the body keeps blood glucose within a suitable range after eating.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div class="homeo-body-icon">🩺</div>
            <div class="homeo-glucose-display">🩸 Blood Glucose: Normal</div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Action/Condition:</label>
            <div class="exp-condition-buttons">
              <button class="exp-cond-btn ${cond === 'eat' ? 'active' : ''}" onclick="Experiment.setHomeostasisCondition('eat')">
                🍚 Eat a Meal
              </button>
              <button class="exp-cond-btn ${cond === 'nofood' ? 'active' : ''}" onclick="Experiment.setHomeostasisCondition('nofood')">
                ⏳ No Food for Several Hours
              </button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startHomeostasisReaction()">
            🍬 [ APPLY CHANGE ]
          </button>
        </div>
        `;
      } else {
        const isEat = (cond === 'eat');

        html += `
          <div class="exp-result-container ${isEat ? 'chemical-result' : 'physical-result'}">
            <div class="homeo-body-card" style="margin:0; width:100%; border:none; background:transparent; box-shadow:none;">
              <div class="homeo-body-icon">${isEat ? '🍚' : '⏳'}</div>
              <div class="homeo-glucose-display ${isEat ? 'high' : 'low'}">
                ${isEat ? '📈 Blood Glucose ↑ (Increases)' : '📉 Blood Glucose ↓ (Decreases)'}
              </div>
            </div>

            <div class="result-badge maintained">
              ✅ HOMEOSTASIS MAINTAINED
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>Hormonal Response Steps:</h5>
              <div class="homeo-stepper-box">
                ${isEat ? `
                  <div class="homeo-step-card">
                    <span class="step-icon">🧬</span>
                    <span class="step-text">Pancreas detects the increase</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">💉</span>
                    <span class="step-text">Insulin is released</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">🧍</span>
                    <span class="step-text">Body cells take in more glucose</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">📉</span>
                    <span class="step-text">Blood glucose decreases toward normal</span>
                  </div>
                ` : `
                  <div class="homeo-step-card">
                    <span class="step-icon">🧬</span>
                    <span class="step-text">Pancreas detects the decrease</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">🧪</span>
                    <span class="step-text">Glucagon is released</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">🧍</span>
                    <span class="step-text">The liver releases stored glucose</span>
                  </div>
                  <div class="homeo-arrow-divider">⬇️</div>
                  <div class="homeo-step-card">
                    <span class="step-icon">📈</span>
                    <span class="step-text">Blood glucose increases toward normal</span>
                  </div>
                `}
              </div>
            </div>

            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>${isEat ? 
                'After eating, glucose enters the bloodstream and blood glucose rises. The pancreas releases insulin, which helps body cells take in glucose and helps lower blood glucose toward its normal range.' : 
                'When blood glucose becomes low, the pancreas releases glucagon. Glucagon signals the liver to release stored glucose, helping bring blood glucose back toward its normal range.'
              }</p>
            </div>

            <div class="exp-key-idea-box chemical-key" style="background:#FFF7ED; border-color:#FFD8A8; color:#9A3412;">
              💡 <b>Key Idea:</b> ${isEat ? 
                'Blood glucose rises → insulin is released → cells take in glucose → blood glucose returns toward normal' : 
                'Blood glucose falls → glucagon is released → stored glucose is released → blood glucose returns toward normal'
              }
            </div>

            <div class="homeo-flow-diagram">
              <h5>📊 Visual Flow</h5>
              <div class="homeo-flow-steps">
                <div class="homeo-flow-pill">Normal Blood Glucose</div>
                <div class="homeo-flow-arrow">↓</div>
                <div class="homeo-flow-pill">${isEat ? '🍚 Eat a Meal (Glucose ↑)' : '⏳ No Food for Several Hours (Glucose ↓)'}</div>
                <div class="homeo-flow-arrow">↓</div>
                <div class="homeo-flow-pill">Pancreas Detects Change</div>
                <div class="homeo-flow-arrow">↓</div>
                <div class="homeo-flow-pill">${isEat ? 'Insulin Released → Cells Take Glucose' : 'Glucagon Released → Liver Releases Stored Glucose'}</div>
                <div class="homeo-flow-arrow">↓</div>
                <div class="homeo-flow-pill" style="border-color:#10B981; color:#065F46; background:#ECFDF5;">🩸 Blood Glucose Returns Toward Normal</div>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.resetHomeostasisActivity()">
              🔄 Reset Experiment
            </button>
            <button class="secondary-btn" style="flex:1; background:#F3E8FF; border-color:#C084FC; color:#6D28D9;" onclick="Experiment.tryOtherHomeostasisCondition()">
              🔀 Try Other Condition (${isEat ? 'No Food ⏳' : 'Eat Meal 🍚'})
            </button>
          </div>
        </div>
        `;
      }
    } else {
      // 📚 FINAL HOMEOSTASIS PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Homeostasis Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9; font-size:1.1rem;">🔄 How Does Homeostasis Work?</h5>
            
            <div class="homeo-five-steps">
              <div class="five-step-card">
                <h6>1. Stimulus</h6>
                <p>An internal or external condition changes.</p>
              </div>
              <div class="five-step-card">
                <h6>2. Receptor / Detector</h6>
                <p>The body detects the change.</p>
              </div>
              <div class="five-step-card">
                <h6>3. Control Center</h6>
                <p>The body coordinates an appropriate response.</p>
              </div>
              <div class="five-step-card">
                <h6>4. Effector</h6>
                <p>Organs or tissues carry out the response.</p>
              </div>
              <div class="five-step-card">
                <h6>5. Return Toward Normal</h6>
                <p>The response reduces the change and helps restore balance.</p>
              </div>
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-key-idea-box chemical-key" style="background:#EFF6FF; border-color:#BFDBFE; color:#1E40AF;">
              💡 <b>Key Concept:</b> Homeostasis keeps the body's internal environment relatively stable through continuous adjustments.
            </div>

            <div class="exp-explain-block" style="background:#FFF7ED; border-color:#FFD8A8;">
              <h5 style="color:#9A3412;">🔄 Negative Feedback</h5>
              <p style="color:#7C2D12;">Both experiments demonstrate <b>negative feedback</b>:</p>
              <div style="font-family:var(--font-heading); font-size:0.92rem; font-weight:800; color:#C2410C; margin-top:6px; text-align:center;">
                Change → Response → Change is reduced → Condition returns toward normal
              </div>
            </div>

            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p>Students should understand that <b>homeostasis is an ongoing process of detecting changes and making adjustments to keep internal conditions stable.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchHomeostasisMode('temperature')">
              🌡️ Exp 1: Temp
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchHomeostasisMode('glucose')">
              🍬 Exp 2: Glucose
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  }
};
