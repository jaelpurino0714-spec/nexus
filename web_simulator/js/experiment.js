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
  selectedItems: new Set(),
  isCombined: false,

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
      }
    }
  },

  resetActivity() {
    this.selectedItems = new Set();
    this.isCombined = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      if (this.currentTopic === "Physical vs. Chemical Change") {
        this.renderPhysicalVsChemicalActivity(canvasBox);
      } else if (this.currentTopic === "Chemical Reactions") {
        this.renderChemicalReactionsActivity(canvasBox);
      }
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
  }
};
