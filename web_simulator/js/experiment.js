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
      }
    }
  },

  resetActivity() {
    this.selectedItems = new Set();
    this.isCombined = false;
    this.challengeSubmitted = false;
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
  }
};
