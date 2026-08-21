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
  evolutionMode: 'camouflage', // 'camouflage', 'resistance', or 'summary'
  evolutionEnv: 'green', // 'green' or 'brown'
  evolutionGeneration: 1, // 1, 2, or 3
  evolutionStarted: false,
  evolutionExp1Completed: false,
  evolutionExp2Completed: false,
  carryingCapacityMode: 'growth', // 'growth', 'capacity', or 'summary'
  carryingCapacityChoice: 'resources', // 'resources', 'drought', or 'habitat'
  carryingCapacityStarted: false,
  biotechMode: 'fermentation', // 'fermentation', 'recombinant', or 'summary'
  biotechStarted: false,
  tectonicsMode: 'divergent', // 'divergent', 'convergent', or 'summary'
  tectonicsStarted: false,
  climateMode: 'greenhouse', // 'greenhouse', 'ocean', or 'summary'
  climateOceanCond: 'with', // 'with' or 'without'
  climateStarted: false,
  ensoMode: 'elnino', // 'elnino', 'lanina', or 'summary'
  ensoStarted: false,
  sustainabilityMode: 'waste', // 'waste', 'energy', or 'summary'
  wasteItems: [
    { id: 'item1', name: '🍌 Food waste', type: 'bio' },
    { id: 'item2', name: '🥤 Plastic bottle', type: 'rec' },
    { id: 'item3', name: '📄 Paper', type: 'rec' },
    { id: 'item4', name: '🥫 Metal can', type: 'rec' },
    { id: 'item5', name: '🍾 Glass bottle', type: 'rec' }
  ],
  wasteSelections: {}, // itemId -> 'bio' | 'rec' | 'res'
  energySwitches: { lights: true, ac: true, tv: true, fan: false, fridge: true, unplug: false },
  sustainabilityStarted: false,
  projectileMode: 'angle', // 'angle', 'velocity', 'summary'
  projectileAngle: 45, // 15, 30, 45, 60, 75
  projectileVelocity: 'medium', // 'low', 'medium', 'high'
  projectileStarted: false,
  projectileAnswer: null,
  momentumMode: 'momentum', // 'momentum', 'collision', 'summary'
  momentumMass: 5, // 1, 2, 5
  momentumVel: 2, // 1, 2, 5
  collisionMassA: 2,
  collisionVelA: 3,
  collisionMassB: 2,
  collisionVelB: -1,
  momentumStarted: false,
  momentumAnswer: null,
  electricityMode: 'grid', // 'grid', 'voltage', 'summary'
  voltageType: 'high', // 'low', 'high'
  electricityStarted: false,
  electricityAnswer: null,
  energyMixMode: 'compare', // 'compare', 'mix', 'summary'
  energySourceType: 'solar', // 'solar', 'coal'
  activeRenewables: { solar: true, wind: false, hydro: false, geo: false },
  energyMixStarted: false,
  energyMixAnswer: null,

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

  getTopicIcon(topicName) {
    if (!topicName) return '🧪';
    const t = topicName.toLowerCase();
    if (t.includes('balancing') || t.includes('balance')) return '⚖️';
    if (t.includes('equation')) return '📝';
    if (t.includes('acid') || t.includes('base') || t.includes('salt')) return '🧪';
    if (t.includes('reaction') || t.includes('change')) return '🧪';
    if (t.includes('homeostasis')) return '🩺';
    if (t.includes('evolution')) return '🦴';
    if (t.includes('carrying') || t.includes('ecosystem')) return '🌿';
    if (t.includes('biotech')) return '🧬';
    if (t.includes('plate') || t.includes('tectonic')) return '🌋';
    if (t.includes('climate')) return '☀️';
    if (t.includes('enso') || t.includes('interaction')) return '🌊';
    if (t.includes('sustainability')) return '♻️';
    if (t.includes('projectile')) return '🎯';
    if (t.includes('momentum') || t.includes('collision')) return '💥';
    if (t.includes('electricity')) return '⚡';
    if (t.includes('energy')) return '🔋';
    return '🧪';
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
      const icon = this.getTopicIcon(topicName);
      const btn = document.createElement('button');
      btn.className = 'term-btn topic-item-btn';
      btn.onclick = () => this.openExperiment(topicName);
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
      } else if (topicName === "Mechanisms of Evolution") {
        this.evolutionMode = 'camouflage';
        this.evolutionEnv = 'green';
        this.evolutionGeneration = 1;
        this.evolutionStarted = false;
        this.renderEvolutionActivity(canvasBox);
      } else if (topicName === "Ecosystem's Carrying Capacity and Population Growth") {
        this.carryingCapacityMode = 'growth';
        this.carryingCapacityChoice = 'resources';
        this.carryingCapacityStarted = false;
        this.renderCarryingCapacityActivity(canvasBox);
      } else if (topicName === "Biotechnology") {
        this.biotechMode = 'fermentation';
        this.biotechStarted = false;
        this.renderBiotechActivity(canvasBox);
      } else if (topicName === "Plate Tectonics") {
        this.tectonicsMode = 'divergent';
        this.tectonicsStarted = false;
        this.renderTectonicsActivity(canvasBox);
      } else if (topicName === "Global Climate") {
        this.climateMode = 'greenhouse';
        this.climateOceanCond = 'with';
        this.climateStarted = false;
        this.renderClimateActivity(canvasBox);
      } else if (topicName === "Global Interactions (ENSO)") {
        this.ensoMode = 'elnino';
        this.ensoStarted = false;
        this.renderEnsoActivity(canvasBox);
      } else if (topicName === "Global and Local Sustainability") {
        this.sustainabilityMode = 'waste';
        this.wasteSelections = {};
        this.energySwitches = { lights: true, ac: true, tv: true, fan: false, fridge: true, unplug: false };
        this.sustainabilityStarted = false;
        this.renderSustainabilityActivity(canvasBox);
      } else if (topicName === "Projectile Motion") {
        this.projectileMode = 'angle';
        this.projectileAngle = 45;
        this.projectileVelocity = 'medium';
        this.projectileStarted = false;
        this.projectileAnswer = null;
        this.renderProjectileActivity(canvasBox);
      } else if (topicName === "Momentum and Collisions") {
        this.momentumMode = 'momentum';
        this.momentumMass = 5;
        this.momentumVel = 2;
        this.momentumStarted = false;
        this.momentumAnswer = null;
        this.renderMomentumActivity(canvasBox);
      } else if (topicName === "Large-Scale Generation and Distribution of Electricity") {
        this.electricityMode = 'grid';
        this.voltageType = 'high';
        this.electricityStarted = false;
        this.electricityAnswer = null;
        this.renderElectricityActivity(canvasBox);
      } else if (topicName === "Renewable and Non-Renewable Energy Sources") {
        this.energyMixMode = 'compare';
        this.energySourceType = 'solar';
        this.activeRenewables = { solar: true, wind: false, hydro: false, geo: false };
        this.energyMixStarted = false;
        this.energyMixAnswer = null;
        this.renderEnergyMixActivity(canvasBox);
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
      } else if (this.currentTopic === "Mechanisms of Evolution") {
        this.renderEvolutionActivity(canvasBox);
      } else if (this.currentTopic === "Ecosystem's Carrying Capacity and Population Growth") {
        this.renderCarryingCapacityActivity(canvasBox);
      } else if (this.currentTopic === "Biotechnology") {
        this.renderBiotechActivity(canvasBox);
      } else if (this.currentTopic === "Plate Tectonics") {
        this.renderTectonicsActivity(canvasBox);
      } else if (this.currentTopic === "Global Climate") {
        this.renderClimateActivity(canvasBox);
      } else if (this.currentTopic === "Global Interactions (ENSO)") {
        this.renderEnsoActivity(canvasBox);
      } else if (this.currentTopic === "Global and Local Sustainability") {
        this.renderSustainabilityActivity(canvasBox);
      } else if (this.currentTopic === "Projectile Motion") {
        this.renderProjectileActivity(canvasBox);
      } else if (this.currentTopic === "Momentum and Collisions") {
        this.renderMomentumActivity(canvasBox);
      } else if (this.currentTopic === "Large-Scale Generation and Distribution of Electricity") {
        this.renderElectricityActivity(canvasBox);
      } else if (this.currentTopic === "Renewable and Non-Renewable Energy Sources") {
        this.renderEnergyMixActivity(canvasBox);
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
      } else if (this.currentTopic === "Mechanisms of Evolution") {
        this.renderEvolutionActivity(canvasBox);
      } else if (this.currentTopic === "Ecosystem's Carrying Capacity and Population Growth") {
        this.renderCarryingCapacityActivity(canvasBox);
      } else if (this.currentTopic === "Biotechnology") {
        this.renderBiotechActivity(canvasBox);
      } else if (this.currentTopic === "Plate Tectonics") {
        this.renderTectonicsActivity(canvasBox);
      } else if (this.currentTopic === "Global Climate") {
        this.renderClimateActivity(canvasBox);
      } else if (this.currentTopic === "Global Interactions (ENSO)") {
        this.renderEnsoActivity(canvasBox);
      } else if (this.currentTopic === "Global and Local Sustainability") {
        this.renderSustainabilityActivity(canvasBox);
      } else if (this.currentTopic === "Projectile Motion") {
        this.renderProjectileActivity(canvasBox);
      } else if (this.currentTopic === "Momentum and Collisions") {
        this.renderMomentumActivity(canvasBox);
      } else if (this.currentTopic === "Large-Scale Generation and Distribution of Electricity") {
        this.renderElectricityActivity(canvasBox);
      } else if (this.currentTopic === "Renewable and Non-Renewable Energy Sources") {
        this.renderEnergyMixActivity(canvasBox);
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
    this.evolutionStarted = false;
    this.evolutionGeneration = 1;
    this.carryingCapacityStarted = false;
    this.biotechStarted = false;
    this.tectonicsStarted = false;
    this.climateStarted = false;
    this.ensoStarted = false;
    this.sustainabilityStarted = false;
    this.projectileStarted = false;
    this.projectileAnswer = null;
    this.momentumStarted = false;
    this.momentumAnswer = null;
    this.electricityStarted = false;
    this.electricityAnswer = null;
    this.energyMixStarted = false;
    this.energyMixAnswer = null;
    this.wasteSelections = {};
    this.energySwitches = { lights: true, ac: true, tv: true, fan: false, fridge: true, unplug: false };
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
      } else if (this.currentTopic === "Mechanisms of Evolution") {
        this.renderEvolutionActivity(canvasBox);
      } else if (this.currentTopic === "Ecosystem's Carrying Capacity and Population Growth") {
        this.renderCarryingCapacityActivity(canvasBox);
      } else if (this.currentTopic === "Biotechnology") {
        this.renderBiotechActivity(canvasBox);
      } else if (this.currentTopic === "Plate Tectonics") {
        this.renderTectonicsActivity(canvasBox);
      } else if (this.currentTopic === "Global Climate") {
        this.renderClimateActivity(canvasBox);
      } else if (this.currentTopic === "Global Interactions (ENSO)") {
        this.renderEnsoActivity(canvasBox);
      } else if (this.currentTopic === "Global and Local Sustainability") {
        this.renderSustainabilityActivity(canvasBox);
      } else if (this.currentTopic === "Projectile Motion") {
        this.renderProjectileActivity(canvasBox);
      } else if (this.currentTopic === "Momentum and Collisions") {
        this.renderMomentumActivity(canvasBox);
      } else if (this.currentTopic === "Large-Scale Generation and Distribution of Electricity") {
        this.renderElectricityActivity(canvasBox);
      } else if (this.currentTopic === "Renewable and Non-Renewable Energy Sources") {
        this.renderEnergyMixActivity(canvasBox);
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
  },

  switchEvolutionMode(mode) {
    this.evolutionMode = mode;
    this.evolutionEnv = 'green';
    this.evolutionGeneration = 1;
    this.evolutionStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderEvolutionActivity(canvasBox);
    }
  },

  setEvolutionEnv(env) {
    this.evolutionEnv = env;
    this.evolutionGeneration = 1;
    this.evolutionStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderEvolutionActivity(canvasBox);
    }
  },

  startEvolutionSimulation() {
    this.evolutionStarted = true;
    this.evolutionGeneration = 1;
    if (this.evolutionMode === 'camouflage') {
      this.evolutionExp1Completed = true;
    } else if (this.evolutionMode === 'resistance') {
      this.evolutionExp2Completed = true;
    }
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderEvolutionActivity(canvasBox);
    }
  },

  nextEvolutionGeneration() {
    if (this.evolutionGeneration < 3) {
      this.evolutionGeneration++;
    }
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderEvolutionActivity(canvasBox);
    }
  },

  resetEvolutionActivity() {
    this.evolutionStarted = false;
    this.evolutionGeneration = 1;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderEvolutionActivity(canvasBox);
    }
  },

  renderEvolutionActivity(container) {
    const mode = this.evolutionMode; // 'camouflage', 'resistance', 'summary'
    const env = this.evolutionEnv; // 'green', 'brown'
    const gen = this.evolutionGeneration; // 1, 2, 3
    const isStarted = this.evolutionStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <!-- 3 Top Mode Toggle Buttons -->
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'camouflage' ? 'active' : ''}" onclick="Experiment.switchEvolutionMode('camouflage')">
            🦋 Exp 1: Camouflage
          </button>
          <button class="exp-mode-btn ${mode === 'resistance' ? 'active' : ''}" onclick="Experiment.switchEvolutionMode('resistance')">
            🦠 Exp 2: Resistance
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchEvolutionMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'camouflage') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🦋 EXPERIMENT 1 — Natural Selection: Camouflage</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate how natural selection can cause a population to change when individuals with certain inherited traits survive and reproduce more successfully.
            </p>
          </div>
      `;

      if (!isStarted) {
        const isGreenEnv = (env === 'green');

        html += `
          <div class="evo-env-box ${isGreenEnv ? 'green-bg' : 'brown-bg'}">
            <div class="pop-counter-badge">Starting Population: 10 insects</div>
            <div class="evo-creature-grid">
              <span>🟢</span><span>🟢</span><span>🟢</span><span>🟢</span><span>🟢</span>
              <span>🟤</span><span>🟤</span><span>🟤</span><span>🟤</span><span>🟤</span>
            </div>
            <div style="font-size:0.82rem; font-weight:700; color:#334155;">
              Inherited Variations: 5 🟢 Green Insects + 5 🟤 Brown Insects
            </div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Environment:</label>
            <div class="exp-condition-buttons">
              <button class="exp-cond-btn ${isGreenEnv ? 'active' : ''}" onclick="Experiment.setEvolutionEnv('green')">
                🌿 Green Environment
              </button>
              <button class="exp-cond-btn ${!isGreenEnv ? 'active' : ''}" onclick="Experiment.setEvolutionEnv('brown')">
                🟤 Brown Environment
              </button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startEvolutionSimulation()">
            🦋 [ START SELECTION ]
          </button>
        </div>
        `;
      } else {
        const isGreenEnv = (env === 'green');

        let greenCount = 5;
        let brownCount = 5;

        if (isGreenEnv) {
          if (gen === 2) { greenCount = 7; brownCount = 3; }
          else if (gen === 3) { greenCount = 9; brownCount = 1; }
        } else {
          if (gen === 2) { greenCount = 3; brownCount = 7; }
          else if (gen === 3) { greenCount = 1; brownCount = 9; }
        }

        let greenIcons = Array(greenCount).fill('🟢').map(e => `<span>${e}</span>`).join('');
        let brownIcons = Array(brownCount).fill('🟤').map(e => `<span>${e}</span>`).join('');

        html += `
          <div class="exp-result-container ${isGreenEnv ? 'physical-result' : 'chemical-result'}">
            <div class="evo-env-box ${isGreenEnv ? 'green-bg' : 'brown-bg'}" style="margin:0; width:100%;">
              <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <span class="gen-tracker-pill">Generation ${gen} of 3</span>
                <span class="pop-counter-badge">Population: 10</span>
              </div>

              <div class="evo-creature-grid">
                ${greenIcons}${brownIcons}
              </div>

              <div style="display:flex; gap:12px; font-size:0.85rem; font-weight:800;">
                <span style="color:#15803D;">🟢 Green: ${greenCount}</span>
                <span style="color:#B45309;">🟤 Brown: ${brownCount}</span>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);">
              🧬 POPULATION CHANGED
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="predator-hunt-box">
              <span class="hunt-icon">🐦</span>
              <div class="hunt-text">
                <b>Predator Selection Process:</b><br>
                1. 🐦 A predator searches for insects.<br>
                2. Insects easier to see are eaten first.<br>
                3. Better-camouflaged insects survive & reproduce.
              </div>
            </div>

            <div class="exp-explain-block">
              <h5>What happened? (Generation ${gen})</h5>
              <p>${isGreenEnv ? 
                'Green insects were better camouflaged in the green environment. They were more likely to survive and reproduce, so the green trait became more common in the population over generations.' : 
                'Brown insects were better camouflaged in the brown environment. They were more likely to survive and reproduce, so the brown trait became more common in the population over generations.'
              }</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Natural selection favors inherited traits that improve survival and reproduction in a particular environment.
            </div>

            <div class="exp-info-panel">
              <div class="exp-info-item" style="color:#C4B5FD;">
                ⚠️ <b>Important Note:</b> The individual insect did not evolve during its lifetime. The population changed across generations because individuals with different inherited traits had different reproductive success.
              </div>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            ${gen < 3 ? `
              <button class="primary-btn ready" style="flex:1.2; padding:12px; font-size:0.9rem;" onclick="Experiment.nextEvolutionGeneration()">
                ⏭️ Next Generation (Gen ${gen} ➔ ${gen + 1})
              </button>
            ` : ''}
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.resetEvolutionActivity()">
              🔄 Reset Experiment
            </button>
            <button class="secondary-btn" style="flex:1; background:rgba(45, 25, 85, 0.9); border-color:#A855F7; color:#FFFFFF;" onclick="Experiment.setEvolutionEnv('${isGreenEnv ? 'brown' : 'green'}')">
              🔀 Switch Env (${isGreenEnv ? 'Brown 🟤' : 'Green 🌿'})
            </button>
          </div>
        </div>
        `;
      }
    } else if (mode === 'resistance') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🦠 EXPERIMENT 2 — Antibiotic Resistance</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate how natural selection can lead to antibiotic resistance in a bacterial population.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="evo-env-box petri-bg">
            <div class="pop-counter-badge">Starting Population: 10 Bacteria</div>
            <div class="evo-creature-grid">
              <span>🦠</span><span>🦠</span><span>🦠</span><span>🦠</span><span>🦠</span>
              <span>🦠</span><span>🦠</span><span>🦠</span><span>🦠</span><span>🔵</span>
            </div>
            <div style="font-size:0.82rem; font-weight:700; color:#0F766E;">
              Initial Setup: 9 Susceptible Bacteria (🦠) + 1 Resistant Bacterium (🔵)
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startEvolutionSimulation()">
            💊 [ APPLY ANTIBIOTIC ]
          </button>
        </div>
        `;
      } else {
        let susCount = 9;
        let resCount = 1;

        if (gen === 2) { susCount = 2; resCount = 4; }
        else if (gen === 3) { susCount = 0; resCount = 10; }

        let susIcons = Array(susCount).fill('🦠').map(e => `<span>${e}</span>`).join('');
        let resIcons = Array(resCount).fill('🔵').map(e => `<span>${e}</span>`).join('');

        html += `
          <div class="exp-result-container chemical-result">
            <div class="evo-env-box petri-bg" style="margin:0; width:100%;">
              <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <span class="gen-tracker-pill">Generation ${gen} of 3</span>
                <span class="pop-counter-badge">Population: ${susCount + resCount}</span>
              </div>

              <div class="evo-creature-grid">
                ${susIcons}${resIcons}
              </div>

              <div style="display:flex; gap:12px; font-size:0.85rem; font-weight:800;">
                <span style="color:#0F766E;">🦠 Susceptible: ${susCount}</span>
                <span style="color:#2563EB;">🔵 Resistant: ${resCount}</span>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);">
              🧬 RESISTANCE BECOMES MORE COMMON
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="predator-hunt-box" style="background:#EFF6FF; border-color:#BFDBFE;">
              <span class="hunt-icon">💊</span>
              <div class="hunt-text" style="color:#1E40AF;">
                <b>Antibiotic Selection Process:</b><br>
                1. 💊 Antibiotic eliminates susceptible bacteria.<br>
                2. Resistant bacteria survive & reproduce.<br>
                3. Over generations, resistant trait becomes common.
              </div>
            </div>

            <div class="exp-explain-block">
              <h5>What happened? (Generation ${gen})</h5>
              <p>The antibiotic killed many susceptible bacteria, while bacteria with inherited resistance were more likely to survive and reproduce. Over generations, the resistant trait became more common in the population.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Natural selection can increase the frequency of inherited traits that help organisms survive in a particular environment.
            </div>

            <div class="exp-info-panel" style="background:#FFFBEB; border-color:#FCD34D;">
              <div class="exp-info-item" style="color:#92400E;">
                ⚠️ <b>Important Note:</b> Resistance can already exist because of inherited genetic variation. The antibiotic creates a selection pressure that favors resistant bacteria (it does not simply teach bacteria to become resistant).
              </div>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            ${gen < 3 ? `
              <button class="primary-btn ready" style="flex:1.2; padding:12px; font-size:0.9rem;" onclick="Experiment.nextEvolutionGeneration()">
                ⏭️ Next Generation (Gen ${gen} ➔ ${gen + 1})
              </button>
            ` : ''}
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.resetEvolutionActivity()">
              🔄 Reset Experiment
            </button>
          </div>
        </div>
        `;
      }
    } else {
      // 📚 FINAL MECHANISMS OF EVOLUTION PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Mechanisms of Evolution Panel</div>

          <div class="exp-explain-block">
            <h5 style="color:#38BDF8; font-size:1.1rem;">🧬 Natural Selection</h5>
            <div style="font-family:var(--font-heading); font-size:0.88rem; font-weight:800; color:#C4B5FD; margin-top:6px; text-align:center;">
              Variation → Selection Pressure → Differential Survival/Reproduction → Inherited Traits Become More Common
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5 style="color:#FFFFFF;">Key Terms</h5>
              <div class="evo-terms-grid">
                <div class="evo-term-card">
                  <h6>Variation</h6>
                  <p>Individuals in a population have differences in their traits.</p>
                </div>
                <div class="evo-term-card">
                  <h6>Selection Pressure</h6>
                  <p>An environmental factor affects which individuals are more likely to survive and reproduce.</p>
                </div>
                <div class="evo-term-card">
                  <h6>Natural Selection</h6>
                  <p>Individuals with advantageous inherited traits tend to leave more offspring.</p>
                </div>
                <div class="evo-term-card">
                  <h6>Evolution</h6>
                  <p>The inherited characteristics of a population change over generations.</p>
                </div>
              </div>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Main Concept:</b> Evolution occurs at the population level over generations, not because individual organisms intentionally change their traits.
            </div>

            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p>Students should understand that <b>natural selection is a major mechanism of evolution because differences in survival and reproduction can cause inherited traits to become more or less common in a population over generations.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchEvolutionMode('camouflage')">
              🦋 Exp 1: Camouflage
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchEvolutionMode('resistance')">
              🦠 Exp 2: Resistance
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchCarryingCapacityMode(mode) {
    this.carryingCapacityMode = mode;
    this.carryingCapacityChoice = 'resources';
    this.carryingCapacityStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderCarryingCapacityActivity(canvasBox);
    }
  },

  setCarryingCapacityChoice(choice) {
    this.carryingCapacityChoice = choice;
    this.carryingCapacityStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderCarryingCapacityActivity(canvasBox);
    }
  },

  startCarryingCapacitySimulation() {
    this.carryingCapacityStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderCarryingCapacityActivity(canvasBox);
    }
  },

  resetCarryingCapacityActivity() {
    this.carryingCapacityStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderCarryingCapacityActivity(canvasBox);
    }
  },

  renderCarryingCapacityActivity(container) {
    const mode = this.carryingCapacityMode; // 'growth', 'capacity', 'summary'
    const choice = this.carryingCapacityChoice; // 'resources', 'drought', 'habitat'
    const isStarted = this.carryingCapacityStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'growth' ? 'active' : ''}" onclick="Experiment.switchCarryingCapacityMode('growth')">
            🐇 Exp 1: Growth
          </button>
          <button class="exp-mode-btn ${mode === 'capacity' ? 'active' : ''}" onclick="Experiment.switchCarryingCapacityMode('capacity')">
            🌱 Exp 2: Carrying Capacity
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchCarryingCapacityMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'growth') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🐇 EXPERIMENT 1 — Rabbit Population Growth</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate how a population can grow rapidly when resources are abundant and eventually approach the environment's carrying capacity.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card" style="background:linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-color:#4ADE80;">
            <div class="homeo-body-icon">🐇</div>
            <div class="homeo-temp-display" style="background:#DCFCE7; border-color:#86EFAC; color:#15803D;">
              🐇 Rabbit Population: 10
            </div>
            <div class="pop-resources-pills">
              <span class="resource-pill">🌱 Food: High</span>
              <span class="resource-pill">💧 Water: High</span>
              <span class="resource-pill">🏡 Space: Available</span>
            </div>
            <div style="font-size:0.82rem; font-weight:800; color:#166534; margin-top:4px;">
              Carrying Capacity (K) = 100 rabbits
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startCarryingCapacitySimulation()">
            📈 [ START POPULATION GROWTH ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container physical-result">
            <div class="pop-graph-box">
              <div class="pop-graph-header">
                <span>Rabbit Population Growth</span>
                <span class="k-line-indicator">Carrying Capacity (K = 100)</span>
              </div>
              <svg viewBox="0 0 300 120" style="width:100%; height:110px; overflow:visible;">
                <line x1="30" y1="20" x2="290" y2="20" stroke="#FCA5A5" stroke-dasharray="4,4" stroke-width="1.5"/>
                <line x1="30" y1="100" x2="290" y2="100" stroke="#CBD5E1" stroke-width="1"/>
                <line x1="30" y1="10" x2="30" y2="100" stroke="#CBD5E1" stroke-width="1"/>
                <path d="M 30,95 Q 100,90 140,50 T 290,22" fill="none" stroke="#10B981" stroke-width="3.5" stroke-linecap="round"/>
                <circle cx="290" cy="22" r="5" fill="#059669">
                  <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <text x="15" y="24" font-size="9" fill="#DC2626" font-weight="bold">100</text>
                <text x="15" y="100" font-size="9" fill="#64748B">0</text>
                <text x="150" y="115" font-size="9" fill="#64748B" text-anchor="middle">Time (Generations) ➔</text>
              </svg>
            </div>

            <div class="result-badge maintained">
              📈 POPULATION GROWTH (Stable @ ~100)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>When resources were abundant, the rabbit population grew quickly. As the population increased, food, water, and space became more limited. Growth slowed as the population approached the environment's carrying capacity.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Carrying capacity is the largest population an environment can sustainably support with its available resources.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetCarryingCapacityActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'capacity') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌱 EXPERIMENT 2 — Changing Carrying Capacity</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate how environmental changes can increase or decrease an ecosystem's carrying capacity.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div class="homeo-body-icon">🐇</div>
            <div class="homeo-temp-display">🐇 Population: 80 | K = 100 rabbits</div>
            <div class="pop-resources-pills">
              <span class="resource-pill">🌱 Food: Normal</span>
              <span class="resource-pill">💧 Water: Normal</span>
              <span class="resource-pill">🏡 Space: Normal</span>
            </div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Environmental Change:</label>
            <div class="exp-condition-buttons" style="grid-template-columns: 1fr 1fr 1fr; font-size:0.75rem;">
              <button class="exp-cond-btn ${choice === 'resources' ? 'active' : ''}" onclick="Experiment.setCarryingCapacityChoice('resources')">
                🌧️ More Resources
              </button>
              <button class="exp-cond-btn ${choice === 'drought' ? 'active' : ''}" onclick="Experiment.setCarryingCapacityChoice('drought')">
                ☀️ Drought
              </button>
              <button class="exp-cond-btn ${choice === 'habitat' ? 'active' : ''}" onclick="Experiment.setCarryingCapacityChoice('habitat')">
                🌳 Habitat Expansion
              </button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startCarryingCapacitySimulation()">
            🌱 [ APPLY CHANGE ]
          </button>
        </div>
        `;
      } else {
        const isDrought = (choice === 'drought');
        const isHabitat = (choice === 'habitat');

        let titleBadge = '📈 CARRYING CAPACITY INCREASED';
        let kText = 'Carrying Capacity: 100 → 150';
        let detailText = 'More available resources allow the ecosystem to support a larger population.';
        let res1 = '🌱 Food increases';
        let res2 = '💧 Water increases';

        if (isDrought) {
          titleBadge = '📉 CARRYING CAPACITY DECREASED';
          kText = 'Carrying Capacity: 100 → 50';
          detailText = 'Limited water and food reduce the number of rabbits the environment can sustainably support.';
          res1 = '💧 Water decreases';
          res2 = '🌱 Food decreases';
        } else if (isHabitat) {
          titleBadge = '📈 CARRYING CAPACITY INCREASED';
          kText = 'Carrying Capacity: 100 → 140';
          detailText = 'More habitat provides additional space and resources for the population.';
          res1 = '🏡 Available space increases';
          res2 = '🌱 Food & cover increases';
        }

        html += `
          <div class="exp-result-container ${isDrought ? 'chemical-result' : 'physical-result'}">
            <div class="homeo-body-card" style="margin:0; width:100%;">
              <div class="homeo-body-icon">${isDrought ? '☀️' : (isHabitat ? '🌳' : '🌧️')}</div>
              <div class="homeo-temp-display ${isDrought ? 'hot' : 'cold'}">
                ${kText}
              </div>
              <div class="pop-resources-pills">
                <span class="resource-pill">${res1}</span>
                <span class="resource-pill">${res2}</span>
              </div>
            </div>

            <div class="result-badge maintained" style="background:${isDrought ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'};">
              ${titleBadge}
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>${detailText}</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Carrying capacity can change when environmental conditions and available resources change.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetCarryingCapacityActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Concept Panel — Population Growth & Carrying Capacity</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9;">Population Growth</h5>
            <p>A population increases when births and immigration exceed deaths and emigration.</p>

            <h5 style="color:#6D28D9; margin-top:10px;">Carrying Capacity</h5>
            <p>The maximum population size an environment can sustainably support.</p>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block" style="background:#FFF7ED; border-color:#FFD8A8;">
              <h5 style="color:#9A3412;">Important Relationship</h5>
              <ul style="margin-top:4px;">
                <li>More resources → Higher carrying capacity</li>
                <li>Fewer resources → Lower carrying capacity</li>
              </ul>
            </div>

            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p>Students should understand that <b>population growth is affected by resource availability, while carrying capacity represents the population size an environment can sustainably support.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchCarryingCapacityMode('growth')">
              🐇 Exp 1: Growth
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchCarryingCapacityMode('capacity')">
              🌱 Exp 2: Capacity
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchBiotechMode(mode) {
    this.biotechMode = mode;
    this.biotechStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderBiotechActivity(canvasBox);
    }
  },

  startBiotechSimulation() {
    this.biotechStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderBiotechActivity(canvasBox);
    }
  },

  resetBiotechActivity() {
    this.biotechStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderBiotechActivity(canvasBox);
    }
  },

  renderBiotechActivity(container) {
    const mode = this.biotechMode; // 'fermentation', 'recombinant', 'summary'
    const isStarted = this.biotechStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'fermentation' ? 'active' : ''}" onclick="Experiment.switchBiotechMode('fermentation')">
            🧫 Exp 1: Fermentation
          </button>
          <button class="exp-mode-btn ${mode === 'recombinant' ? 'active' : ''}" onclick="Experiment.switchBiotechMode('recombinant')">
            🧬 Exp 2: Recombinant DNA
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchBiotechMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'fermentation') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🧫 EXPERIMENT 1 — Yeast Fermentation</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate how microorganisms can be used in biotechnology to produce useful products through fermentation.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="biotech-anim-box">
            <div style="font-size:3rem;">🧫</div>
            <div style="font-size:0.9rem; font-weight:800; color:#92400E;">Inputs: 🦠 Yeast + 🍬 Sugar + 💧 Water</div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startBiotechSimulation()">
            🫧 [ START FERMENTATION ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container chemical-result">
            <div class="biotech-anim-box">
              <div class="bubbles-container">
                <span>🫧</span><span>🫧</span><span>🍞</span><span>🫧</span><span>🫧</span>
              </div>
              <div style="font-family:var(--font-heading); font-size:1.05rem; font-weight:800; color:#6D28D9;">
                Sugar → Carbon Dioxide (CO₂) + Ethanol
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);">
              🫧 FERMENTATION OCCURRING (CO₂ Bubbles Produced)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Yeast breaks down sugar during fermentation and produces carbon dioxide and ethanol. Humans use this process in biotechnology, including bread-making and some food-production processes.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Biotechnology uses living organisms or biological processes to produce useful products.
            </div>

            <div class="exp-info-panel" style="background:#FFFBEB; border-color:#FCD34D;">
              <div class="exp-info-item" style="color:#92400E;">
                🍞 <b>Real-Life Application (Bread-making):</b> Carbon dioxide produced by yeast gets trapped in dough and helps it rise.
              </div>
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetBiotechActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'recombinant') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🧬 EXPERIMENT 2 — Recombinant DNA / Insulin Production</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate how biotechnology can use genetic engineering to produce useful biological products.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="biotech-anim-box" style="background:radial-gradient(circle at 50% 100%, #F3E8FF 0%, #FAF5FF 100%); border-color:#C084FC;">
            <div style="font-size:3rem;">🧬</div>
            <div style="font-size:0.88rem; font-weight:800; color:#5B21B6;">
              Components: 🧬 Human Insulin Gene + 🧬 Plasmid + 🦠 Bacterial Cell
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startBiotechSimulation()">
            💉 [ INSERT GENE ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container chemical-result">
            <div class="recombinant-flow">
              <div class="recombinant-step-card">
                <span style="font-size:1.5rem;">🧬</span>
                <span><b>Human Insulin Gene</b> isolated</span>
              </div>
              <div style="color:#8B5CF6; font-size:1.1rem;">⬇️</div>
              <div class="recombinant-step-card">
                <span style="font-size:1.5rem;">🧬</span>
                <span>Inserted into <b>Bacterial Plasmid</b></span>
              </div>
              <div style="color:#8B5CF6; font-size:1.1rem;">⬇️</div>
              <div class="recombinant-step-card">
                <span style="font-size:1.5rem;">🦠</span>
                <span>Recombinant plasmid put into <b>Bacterial Cell</b></span>
              </div>
              <div style="color:#8B5CF6; font-size:1.1rem;">⬇️</div>
              <div class="recombinant-step-card" style="border-color:#10B981; background:#ECFDF5;">
                <span style="font-size:1.5rem;">💉</span>
                <span style="color:#065F46;"><b>Bacteria produce Human Insulin Protein!</b></span>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              🧬 RECOMBINANT DNA CREATED
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>A useful gene can be inserted into a bacterial plasmid. The bacterium can then use the inserted genetic information to produce a desired protein.</p>
              <div style="font-family:var(--font-heading); font-size:0.86rem; font-weight:800; color:#5B21B6; margin-top:6px;">
                Human insulin gene → Bacterial cell → Insulin protein
              </div>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Genetic engineering allows scientists to introduce specific genetic information into organisms to produce useful products.
            </div>

            <div class="exp-info-panel" style="background:#EFF6FF; border-color:#BFDBFE;">
              <div class="exp-info-item" style="color:#1E40AF;">
                💉 <b>Real-Life Application (Insulin Production):</b> Genetically engineered microorganisms are used to produce human insulin for diabetic medical treatment.
              </div>
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetBiotechActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Biotechnology Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9;">Biotechnology</h5>
            <p>The use of living organisms, cells, or biological processes to develop useful products and technologies.</p>
            
            <ul style="margin-top:8px;">
              <li><b>Fermentation:</b> Food production (bread, cheese, yogurt).</li>
              <li><b>Genetic Engineering:</b> Medical products (insulin, vaccines).</li>
            </ul>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p>Students should understand that <b>biotechnology can use microorganisms and genetic information to create useful products.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchBiotechMode('fermentation')">
              🧫 Exp 1: Fermentation
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchBiotechMode('recombinant')">
              🧬 Exp 2: Recombinant DNA
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchTectonicsMode(mode) {
    this.tectonicsMode = mode;
    this.tectonicsStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderTectonicsActivity(canvasBox);
    }
  },

  startTectonicsSimulation() {
    this.tectonicsStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderTectonicsActivity(canvasBox);
    }
  },

  resetTectonicsActivity() {
    this.tectonicsStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderTectonicsActivity(canvasBox);
    }
  },

  renderTectonicsActivity(container) {
    const mode = this.tectonicsMode; // 'divergent', 'convergent', 'summary'
    const isStarted = this.tectonicsStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'divergent' ? 'active' : ''}" onclick="Experiment.switchTectonicsMode('divergent')">
            🌋 Exp 1: Divergent
          </button>
          <button class="exp-mode-btn ${mode === 'convergent' ? 'active' : ''}" onclick="Experiment.switchTectonicsMode('convergent')">
            🏔️ Exp 2: Convergent
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchTectonicsMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'divergent') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌍 EXPERIMENT 1 — Divergent Plate Boundary</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate what happens when two tectonic plates move away from each other.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="tectonics-anim-box">
            <div class="plates-row">
              <div class="tectonic-plate">🟫 Plate A</div>
              <div style="font-size:1.5rem; color:#0284C7; font-weight:800;">← →</div>
              <div class="tectonic-plate">🟫 Plate B</div>
            </div>
            <div style="font-size:0.82rem; font-weight:800; color:#78350F; margin-top:10px;">
              🌋 Magma Layer Below
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startTectonicsSimulation()">
            🌋 [ MOVE PLATES ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container chemical-result">
            <div class="tectonics-anim-box">
              <div class="plates-row">
                <div class="tectonic-plate move-left">🟫 Plate A</div>
                <div class="magma-rising-anim">🌋</div>
                <div class="tectonic-plate move-right">🟫 Plate B</div>
              </div>
              <div class="crust-new-badge" style="margin-top:8px;">
                ✨ New Oceanic Crust Forming
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);">
              🌋 DIVERGENT BOUNDARY (Plate A ← → Plate B)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>At a divergent boundary, tectonic plates move away from each other. The gap between them opens, magma rises from below, and new crust forms as it cools.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Divergent boundaries pull apart, forming new crust as magma rises to fill the rift.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetTectonicsActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'convergent') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🏔️ EXPERIMENT 2 — Convergent Plate Boundary</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate what happens when two tectonic plates collide.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="tectonics-anim-box">
            <div class="plates-row">
              <div class="tectonic-plate">🟫 Plate A</div>
              <div style="font-size:1.5rem; color:#92400E; font-weight:800;">→ ←</div>
              <div class="tectonic-plate">🟫 Plate B</div>
            </div>
            <div style="font-size:0.82rem; font-weight:800; color:#78350F; margin-top:10px;">
              Collision Zone Below
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startTectonicsSimulation()">
            🏔️ [ MOVE PLATES ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container physical-result">
            <div class="tectonics-anim-box">
              <div class="plates-row">
                <div class="tectonic-plate move-collide-left">🟫 Plate A</div>
                <div class="mountain-rising-anim">🏔️</div>
                <div class="tectonic-plate move-collide-right">🟫 Plate B</div>
              </div>
              <div class="crust-new-badge" style="background:#0284C7; margin-top:8px;">
                ⛰️ Mountain Ranges / Trench Formed
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #0284C7 0%, #0369A1 100%);">
              🏔️ CONVERGENT BOUNDARY (Plate Collision)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>At a convergent boundary, tectonic plates collide. Land buckles upward into mountain ranges or one plate slides beneath another into a deep ocean trench (subduction).</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Convergent boundaries collide, forming mountains and subduction zones.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetTectonicsActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Plate Tectonics Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9;">Plate Tectonics</h5>
            <p>Earth's crust is divided into moving tectonic plates driven by heat from Earth's core.</p>

            <ul style="margin-top:8px;">
              <li><b>Divergent (← →):</b> Plates pull apart → New crust forms.</li>
              <li><b>Convergent (→ ←):</b> Plates collide → Mountains & trenches form.</li>
            </ul>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p>Students should understand that <b>Earth's crust is divided into moving tectonic plates and that different plate movements produce different geological features.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchTectonicsMode('divergent')">
              🌋 Exp 1: Divergent
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchTectonicsMode('convergent')">
              🏔️ Exp 2: Convergent
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchClimateMode(mode) {
    this.climateMode = mode;
    this.climateOceanCond = 'with';
    this.climateStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderClimateActivity(canvasBox);
  },

  setClimateOceanCond(cond) {
    this.climateOceanCond = cond;
    this.climateStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderClimateActivity(canvasBox);
  },

  startClimateSimulation() {
    this.climateStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderClimateActivity(canvasBox);
  },

  resetClimateActivity() {
    this.climateStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderClimateActivity(canvasBox);
  },

  renderClimateActivity(container) {
    const mode = this.climateMode; // 'greenhouse', 'ocean', 'summary'
    const cond = this.climateOceanCond; // 'with', 'without'
    const isStarted = this.climateStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'greenhouse' ? 'active' : ''}" onclick="Experiment.switchClimateMode('greenhouse')">
            🌍 Exp 1: Greenhouse
          </button>
          <button class="exp-mode-btn ${mode === 'ocean' ? 'active' : ''}" onclick="Experiment.switchClimateMode('ocean')">
            🌊 Exp 2: Ocean & Climate
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchClimateMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'greenhouse') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌍 EXPERIMENT 1 — Greenhouse Effect</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate how greenhouse gases help retain heat in Earth's atmosphere.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="climate-dual-box">
            <div class="earth-model-card">
              <div style="font-size:0.82rem; font-weight:800; color:#334155;">🌍 Earth A</div>
              <div class="earth-model-icon">🌍</div>
              <div class="temp-indicator-pill normal">Normal Atmosphere</div>
            </div>

            <div class="earth-model-card enhanced-ghg">
              <div style="font-size:0.82rem; font-weight:800; color:#991B1B;">🌍 Earth B</div>
              <div class="earth-model-icon">🌏</div>
              <div class="temp-indicator-pill retained">+ Greenhouse Gases</div>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startClimateSimulation()">
            ☀️ [ START SIMULATION ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container chemical-result">
            <div class="climate-dual-box" style="margin:0;">
              <div class="earth-model-card">
                <div style="font-size:0.82rem; font-weight:800; color:#334155;">🌍 Earth A</div>
                <div class="earth-model-icon">🌍</div>
                <div class="temp-indicator-pill normal">🌡️ Normal Warming (15°C)</div>
                <div style="font-size:0.75rem; color:#64748B;">Heat escapes to space</div>
              </div>

              <div class="earth-model-card enhanced-ghg">
                <div style="font-size:0.82rem; font-weight:800; color:#991B1B;">🌍 Earth B</div>
                <div class="earth-model-icon">🌏</div>
                <div class="temp-indicator-pill retained">🌡️ More Heat Retained (22°C)</div>
                <div style="font-size:0.75rem; color:#991B1B; font-weight:700;">Gases re-emit heat</div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);">
              🌡️ GREENHOUSE EFFECT (Heat Trapped)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Greenhouse gases absorb and re-emit some outgoing infrared radiation, helping keep heat in Earth's atmosphere. This natural greenhouse effect makes Earth warm enough to support life. Increasing greenhouse gas concentrations strengthens this heat-trapping effect and contributes to global warming.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Greenhouse gases trap part of Earth's outgoing heat, affecting Earth's temperature.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetClimateActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'ocean') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌊 EXPERIMENT 2 — Ocean and Climate</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate how oceans influence Earth's climate by absorbing and storing heat.
            </p>
          </div>
      `;

      if (!isStarted) {
        const isWithOcean = (cond === 'with');

        html += `
          <div class="homeo-body-card" style="background:${isWithOcean ? 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)' : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'};">
            <div class="homeo-body-icon">${isWithOcean ? '🌊' : '🏜️'}</div>
            <div class="homeo-temp-display">
              ${isWithOcean ? '☀️ Sun + 🌊 Ocean + 🏝️ Land' : '☀️ Sun + 🏜️ Desert Land (No Ocean)'}
            </div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Ecosystem Setup:</label>
            <div class="exp-condition-buttons">
              <button class="exp-cond-btn ${isWithOcean ? 'active' : ''}" onclick="Experiment.setClimateOceanCond('with')">
                🌊 With Ocean
              </button>
              <button class="exp-cond-btn ${!isWithOcean ? 'active' : ''}" onclick="Experiment.setClimateOceanCond('without')">
                🏜️ Without Ocean
              </button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startClimateSimulation()">
            ☀️ [ HEAT EARTH ]
          </button>
        </div>
        `;
      } else {
        const isWithOcean = (cond === 'with');

        html += `
          <div class="exp-result-container ${isWithOcean ? 'physical-result' : 'chemical-result'}">
            <div class="homeo-body-card" style="margin:0; width:100%;">
              <div class="homeo-body-icon">${isWithOcean ? '🌊' : '🏜️'}</div>
              <div class="homeo-temp-display">
                ${isWithOcean ? '🌊 Ocean Absorbs & Stores Large Heat' : '🏜️ Land Temp Fluctuates Rapidly'}
              </div>
            </div>

            <div class="result-badge maintained" style="background:${isWithOcean ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'};">
              🌊 ${isWithOcean ? 'OCEANS MODERATE CLIMATE' : 'EXTREME TEMPERATURE SWINGS'}
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Oceans absorb and store large amounts of heat. Because water changes temperature more slowly than land, oceans help moderate temperatures and influence climate.</p>
              
              <table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:0.84rem;">
                <tr style="background:#F1F5F9;">
                  <th style="padding:6px; text-align:left; border:1px solid #CBD5E1;">Surface</th>
                  <th style="padding:6px; text-align:left; border:1px solid #CBD5E1;">Temperature Change</th>
                </tr>
                <tr>
                  <td style="padding:6px; border:1px solid #CBD5E1;">🏝️ Land</td>
                  <td style="padding:6px; border:1px solid #CBD5E1; color:#B45309; font-weight:700;">Changes more quickly</td>
                </tr>
                <tr>
                  <td style="padding:6px; border:1px solid #CBD5E1;">🌊 Ocean</td>
                  <td style="padding:6px; border:1px solid #CBD5E1; color:#0284C7; font-weight:700;">Changes more slowly</td>
                </tr>
              </table>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> The oceans are an important part of Earth's climate system because they store and redistribute heat.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetClimateActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      // 📚 FINAL GLOBAL CLIMATE PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Global Climate Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9;">Factors Affecting Climate</h5>
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
              <span class="resource-pill">☀️ Solar energy</span>
              <span class="resource-pill">🌊 Oceans</span>
              <span class="resource-pill">🌫️ Atmosphere</span>
              <span class="resource-pill">🌱 Greenhouse gases</span>
              <span class="resource-pill">🌍 Earth's surface</span>
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p>Students should understand that <b>global climate is influenced by interactions among the atmosphere, oceans, land, and incoming solar energy.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchClimateMode('greenhouse')">
              🌍 Exp 1: Greenhouse
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchClimateMode('ocean')">
              🌊 Exp 2: Ocean
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchEnsoMode(mode) {
    this.ensoMode = mode;
    this.ensoStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderEnsoActivity(canvasBox);
  },

  startEnsoSimulation() {
    this.ensoStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderEnsoActivity(canvasBox);
  },

  resetEnsoActivity() {
    this.ensoStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderEnsoActivity(canvasBox);
  },

  renderEnsoActivity(container) {
    const mode = this.ensoMode; // 'elnino', 'lanina', 'summary'
    const isStarted = this.ensoStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'elnino' ? 'active' : ''}" onclick="Experiment.switchEnsoMode('elnino')">
            🔥 Exp 1: El Niño
          </button>
          <button class="exp-mode-btn ${mode === 'lanina' ? 'active' : ''}" onclick="Experiment.switchEnsoMode('lanina')">
            ❄️ Exp 2: La Niña
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchEnsoMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'elnino') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌊 EXPERIMENT 1 — El Niño</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate how unusually warm surface waters in the central and eastern tropical Pacific can affect atmospheric circulation and weather patterns.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="enso-pacific-box">
            <div class="enso-map-header">
              <span>🌏 Asia / West</span>
              <span>🌊 Tropical Pacific</span>
              <span>🌎 Americas / East</span>
            </div>
            <div class="enso-water-strip">
              <span>💨 Normal Trade Winds</span>
              <span class="enso-status-pill">Normal Sea Temp</span>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startEnsoSimulation()">
            🔥 [ START EL NIÑO ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container chemical-result">
            <div class="enso-pacific-box" style="background:linear-gradient(180deg, #FDE8E8 0%, #EF4444 100%); border-color:#DC2626;">
              <div class="enso-map-header">
                <span>🌏 Asia</span>
                <span>🔥 Warm Pacific Water Shifts East ➡️</span>
                <span>🌎 Americas 🌧️</span>
              </div>
              <div class="enso-water-strip" style="background:rgba(255,255,255,0.45);">
                <span style="color:#991B1B; font-weight:800;">💨 Trade Winds WEAKENED</span>
                <span class="enso-status-pill" style="color:#DC2626; border:1px solid #FCA5A5;">Warmer Central/East Pacific</span>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);">
              🔥 EL NIÑO (Ocean: Warmer East | Winds: Weakened | Rain: Shifts East)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>During El Niño, unusually warm surface waters develop in the central and eastern tropical Pacific. This changes atmospheric circulation and can influence weather patterns far beyond the Pacific Ocean.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Changes in ocean temperature can affect atmospheric circulation and weather around the world.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetEnsoActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'lanina') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌊 EXPERIMENT 2 — La Niña</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate how unusually cool surface waters in the central and eastern tropical Pacific affect global atmospheric circulation and weather patterns.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="enso-pacific-box">
            <div class="enso-map-header">
              <span>🌏 Asia / West</span>
              <span>🌊 Tropical Pacific</span>
              <span>🌎 Americas / East</span>
            </div>
            <div class="enso-water-strip">
              <span>💨 Normal Trade Winds</span>
              <span class="enso-status-pill">Normal Sea Temp</span>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startEnsoSimulation()">
            ❄️ [ START LA NIÑA ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container physical-result">
            <div class="enso-pacific-box" style="background:linear-gradient(180deg, #E0F2FE 0%, #0284C7 100%); border-color:#0369A1;">
              <div class="enso-map-header">
                <span>🌏 Asia 🌧️</span>
                <span>⬅️ 🌊 Warm Water Pushed Far West</span>
                <span>🌎 Americas 🧊</span>
              </div>
              <div class="enso-water-strip" style="background:rgba(255,255,255,0.45);">
                <span style="color:#0369A1; font-weight:800;">💨 Trade Winds STRONGER</span>
                <span class="enso-status-pill" style="color:#0284C7; border:1px solid #93C5FD;">Cooler Central/East Pacific</span>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #0284C7 0%, #0369A1 100%);">
              ❄️ LA NIÑA (Ocean: Cooler East | Winds: Stronger | Rain: Concentrated West)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>During La Niña, stronger trade winds push warm surface water westward and allow cooler deep water to rise in the eastern Pacific. This changes atmospheric circulation and rainfall patterns.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> La Niña is characterized by cooler-than-normal tropical Pacific surface waters and changes in atmospheric circulation.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetEnsoActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      // 📚 FINAL ENSO PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final ENSO Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9;">El Niño–Southern Oscillation (ENSO)</h5>
            <p>A recurring climate pattern involving interactions between the tropical Pacific Ocean and atmosphere.</p>
            
            <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:0.82rem;">
              <tr style="background:#F3E8FF;">
                <th style="padding:6px; border:1px solid #DDD6FE;">Feature</th>
                <th style="padding:6px; border:1px solid #DDD6FE; color:#DC2626;">🔥 El Niño</th>
                <th style="padding:6px; border:1px solid #DDD6FE; color:#0284C7;">❄️ La Niña</th>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #DDD6FE; font-weight:700;">Pacific Ocean</td>
                <td style="padding:6px; border:1px solid #DDD6FE;">Warmer</td>
                <td style="padding:6px; border:1px solid #DDD6FE;">Cooler</td>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #DDD6FE; font-weight:700;">Trade Winds</td>
                <td style="padding:6px; border:1px solid #DDD6FE;">Weaker</td>
                <td style="padding:6px; border:1px solid #DDD6FE;">Stronger</td>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #DDD6FE; font-weight:700;">Warm Water</td>
                <td style="padding:6px; border:1px solid #DDD6FE;">Moves eastward</td>
                <td style="padding:6px; border:1px solid #DDD6FE;">Concentrates farther west</td>
              </tr>
            </table>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p>Students should understand that <b>ENSO demonstrates how ocean and atmospheric processes interact to influence weather and climate patterns locally and globally.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchEnsoMode('elnino')">
              🔥 Exp 1: El Niño
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchEnsoMode('lanina')">
              ❄️ Exp 2: La Niña
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchSustainabilityMode(mode) {
    this.sustainabilityMode = mode;
    this.sustainabilityStarted = false;
    this.wasteSelections = {};
    this.energySwitches = { lights: true, ac: true, tv: true, fan: false, fridge: true, unplug: false };
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderSustainabilityActivity(canvasBox);
  },

  selectWasteBin(itemId, binType) {
    this.wasteSelections[itemId] = binType;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderSustainabilityActivity(canvasBox);
  },

  toggleEnergySwitch(applianceKey) {
    this.energySwitches[applianceKey] = !this.energySwitches[applianceKey];
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderSustainabilityActivity(canvasBox);
  },

  startSustainabilitySimulation() {
    this.sustainabilityStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderSustainabilityActivity(canvasBox);
  },

  resetSustainabilityActivity() {
    this.sustainabilityStarted = false;
    this.wasteSelections = {};
    this.energySwitches = { lights: true, ac: true, tv: true, fan: false, fridge: true, unplug: false };
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderSustainabilityActivity(canvasBox);
  },

  renderSustainabilityActivity(container) {
    const mode = this.sustainabilityMode; // 'waste', 'energy', 'summary'
    const isStarted = this.sustainabilityStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'waste' ? 'active' : ''}" onclick="Experiment.switchSustainabilityMode('waste')">
            ♻️ Exp 1: Waste
          </button>
          <button class="exp-mode-btn ${mode === 'energy' ? 'active' : ''}" onclick="Experiment.switchSustainabilityMode('energy')">
            ⚡ Exp 2: Energy
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchSustainabilityMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'waste') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">♻️ EXPERIMENT 1 — Waste Management</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate how proper waste segregation and recycling can reduce the amount of waste sent to landfills.
            </p>
          </div>
      `;

      if (!isStarted) {
        const items = this.wasteItems;
        const selections = this.wasteSelections;

        let itemsHtml = items.map(item => {
          const sel = selections[item.id] || '';
          return `
            <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:10px; margin-bottom:8px;">
              <div style="font-weight:800; font-size:0.88rem; margin-bottom:4px;">${item.name}</div>
              <div class="waste-bin-group">
                <button class="waste-bin-btn bio ${sel === 'bio' ? 'active' : ''}" onclick="Experiment.selectWasteBin('${item.id}', 'bio')">🟢 Bio</button>
                <button class="waste-bin-btn rec ${sel === 'rec' ? 'active' : ''}" onclick="Experiment.selectWasteBin('${item.id}', 'rec')">🔵 Recyclable</button>
                <button class="waste-bin-btn res ${sel === 'res' ? 'active' : ''}" onclick="Experiment.selectWasteBin('${item.id}', 'res')">⚫ Residual</button>
              </div>
            </div>
          `;
        }).join('');

        html += `
          <div style="margin:10px 0;">
            <div style="font-size:0.82rem; font-weight:800; color:#334155; margin-bottom:6px;">Select Bin for Each Household Waste Item:</div>
            ${itemsHtml}
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startSustainabilitySimulation()">
            ♻️ [ PROCESS WASTE ]
          </button>
        </div>
        `;
      } else {
        const items = this.wasteItems;
        const selections = this.wasteSelections;

        let correctCount = 0;
        items.forEach(item => {
          if (selections[item.id] === item.type) correctCount++;
        });

        let divertPercentage = Math.round((correctCount / items.length) * 100);

        html += `
          <div class="exp-result-container physical-result">
            <div class="homeo-body-card" style="margin:0; width:100%;">
              <div class="homeo-body-icon">♻️</div>
              <div class="homeo-temp-display" style="background:#DCFCE7; border-color:#86EFAC; color:#15803D;">
                Waste Diverted from Landfill: ${divertPercentage}%
              </div>
              <div style="font-size:0.82rem; font-weight:700; color:#166534; margin-top:6px;">
                ♻️ Recyclables → Recycling | 🌱 Biodegradable → Composting | 🗑️ Residual → Proper Disposal
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              ♻️ SUSTAINABLE WASTE MANAGEMENT
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Proper waste segregation makes it easier to recycle materials and compost biodegradable waste. This reduces the amount of waste sent to landfills and helps conserve resources.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Reduce ➔ Reuse ➔ Recycle
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetSustainabilityActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'energy') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">⚡ EXPERIMENT 2 — Household Energy Conservation</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate how small changes in household energy use can reduce electricity consumption and environmental impact.
            </p>
          </div>
      `;

      if (!isStarted) {
        const sw = this.energySwitches;

        // Base kWh calculations
        let kwh = 0;
        if (sw.lights) kwh += 2;
        if (sw.ac) kwh += 5;
        if (sw.tv) kwh += 1;
        if (sw.fan) kwh += 1;
        if (sw.fridge) kwh += 2;
        if (!sw.unplug) kwh += 1; // phantom load

        html += `
          <div style="margin:10px 0;">
            <div class="homeo-temp-display" style="margin-bottom:10px; font-size:1.05rem;">
              ⚡ Current Daily Energy Use: ${kwh} kWh
            </div>

            <div class="appliance-switch-card ${!sw.lights ? 'saved' : ''}">
              <span>💡 Turn off unused lights (-2 kWh)</span>
              <button class="toggle-switch-btn ${sw.lights ? 'on' : 'off'}" onclick="Experiment.toggleEnergySwitch('lights')">
                ${sw.lights ? 'ON (Using)' : 'OFF (Saved)'}
              </button>
            </div>

            <div class="appliance-switch-card ${!sw.ac ? 'saved' : ''}">
              <span>❄️ Reduce unnecessary AC (-5 kWh)</span>
              <button class="toggle-switch-btn ${sw.ac ? 'on' : 'off'}" onclick="Experiment.toggleEnergySwitch('ac')">
                ${sw.ac ? 'ON (Using)' : 'OFF (Saved)'}
              </button>
            </div>

            <div class="appliance-switch-card ${sw.unplug ? 'saved' : ''}">
              <span>🔌 Unplug unused devices (-1 kWh)</span>
              <button class="toggle-switch-btn ${!sw.unplug ? 'on' : 'off'}" onclick="Experiment.toggleEnergySwitch('unplug')">
                ${!sw.unplug ? 'PLUGGED' : 'UNPLUGGED'}
              </button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startSustainabilitySimulation()">
            ⚡ [ CALCULATE SAVINGS ]
          </button>
        </div>
        `;
      } else {
        const sw = this.energySwitches;
        let kwh = 0;
        if (sw.lights) kwh += 2;
        if (sw.ac) kwh += 5;
        if (sw.tv) kwh += 1;
        if (sw.fan) kwh += 1;
        if (sw.fridge) kwh += 2;
        if (!sw.unplug) kwh += 1;

        let reduction = 12 - kwh;
        let percentReduced = Math.round((reduction / 12) * 100);
        let isEnergyOptimal = (kwh <= 4);

        html += `
          <div class="exp-result-container ${isEnergyOptimal ? 'physical-result' : 'chemical-result'}">
            <div class="homeo-body-card" style="margin:0; width:100%; border-color:${isEnergyOptimal ? '#86EFAC' : '#FCA5A5'}; background:${isEnergyOptimal ? '#F0FDF4' : '#FEF2F2'};">
              <div class="homeo-body-icon">${isEnergyOptimal ? '🌱' : '⚠️'}</div>
              <div class="homeo-temp-display" style="background:${isEnergyOptimal ? '#DCFCE7' : '#FEE2E2'}; border-color:${isEnergyOptimal ? '#86EFAC' : '#FCA5A5'}; color:${isEnergyOptimal ? '#15803D' : '#B91C1C'};">
                Daily Energy Use: 12 kWh ➔ ${kwh} kWh
              </div>
              <div style="font-size:0.88rem; font-weight:800; color:${isEnergyOptimal ? '#166534' : '#991B1B'}; margin-top:6px;">
                ${isEnergyOptimal ? `Energy Reduction: ${reduction} kWh/day (${percentReduced}% Saved)` : `Still Wasting Energy! (${kwh} kWh in use)`}
              </div>
            </div>

            <div class="result-badge maintained" style="background:${isEnergyOptimal ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'};">
              ${isEnergyOptimal ? '🌱 ENERGY SAVED (Target ≤4 kWh Reached!)' : '⚠️ STILL WASTING ENERGY (Didn\'t Save Energy!)'}
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            ${!isEnergyOptimal ? `
              <div class="exp-info-panel" style="background:#FEF2F2; border-color:#FCA5A5; margin-bottom:10px;">
                <div class="exp-info-item" style="color:#991B1B;">
                  ⚠️ <b>Still Wasting Energy:</b> Total energy is <b>${kwh} kWh</b>, which is above 4 kWh. The household is still wasting energy and didn't save enough energy! Turn off AC, lights, or unplug unused devices to reduce energy use to 4 kWh or below.
                </div>
              </div>
            ` : `
              <div class="exp-info-panel" style="background:#F0FDF4; border-color:#86EFAC; margin-bottom:10px;">
                <div class="exp-info-item" style="color:#166534;">
                  🎉 <b>Excellent Energy Saving!</b> Total energy successfully reduced to <b>${kwh} kWh</b> (Saved ${reduction} kWh/day).
                </div>
              </div>
            `}

            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Using less electricity reduces energy demand. Depending on how electricity is generated, reducing electricity use can also reduce greenhouse gas emissions.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Using energy efficiently conserves resources, lowers electricity use, and can reduce environmental impacts.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetSustainabilityActivity()">
            🔄 Reset & Save Energy
          </button>
        </div>
        `;
      }
    } else {
      // 📚 FINAL SUSTAINABILITY PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Sustainability Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9;">🌍 What Is Sustainability?</h5>
            <p>Sustainability means meeting present needs while protecting the ability of future generations to meet their needs.</p>

            <h5 style="color:#6D28D9; margin-top:10px;">Local Actions</h5>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
              <span class="resource-pill">♻️ Waste Segregation</span>
              <span class="resource-pill">💧 Conserving Water</span>
              <span class="resource-pill">⚡ Saving Electricity</span>
              <span class="resource-pill">🌱 Protecting Ecosystems</span>
              <span class="resource-pill">🚲 Eco Transport</span>
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p>Students should understand that <b>sustainability connects everyday decisions with the long-term health of communities, ecosystems, and the planet.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchSustainabilityMode('waste')">
              ♻️ Exp 1: Waste
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchSustainabilityMode('energy')">
              ⚡ Exp 2: Energy
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchProjectileMode(mode) {
    this.projectileMode = mode;
    this.projectileStarted = false;
    this.projectileAnswer = null;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderProjectileActivity(canvasBox);
  },

  setProjectileAngle(angle) {
    this.projectileAngle = angle;
    this.projectileStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderProjectileActivity(canvasBox);
  },

  setProjectileVel(vel) {
    this.projectileVelocity = vel;
    this.projectileStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderProjectileActivity(canvasBox);
  },

  startProjectileSimulation() {
    this.projectileStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderProjectileActivity(canvasBox);
  },

  answerProjectileChallenge(ans) {
    this.projectileAnswer = ans;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderProjectileActivity(canvasBox);
  },

  resetProjectileActivity() {
    this.projectileStarted = false;
    this.projectileAnswer = null;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderProjectileActivity(canvasBox);
  },

  renderProjectileActivity(container) {
    const mode = this.projectileMode; // 'angle', 'velocity', 'summary'
    const angle = this.projectileAngle; // 15, 30, 45, 60, 75
    const vel = this.projectileVelocity; // 'low', 'medium', 'high'
    const isStarted = this.projectileStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'angle' ? 'active' : ''}" onclick="Experiment.switchProjectileMode('angle')">
            🏀 Exp 1: Launch Angle
          </button>
          <button class="exp-mode-btn ${mode === 'velocity' ? 'active' : ''}" onclick="Experiment.switchProjectileMode('velocity')">
            🏹 Exp 2: Velocity
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchProjectileMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'angle') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🏀 EXPERIMENT 1 — Launch Angle and Range</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate how changing the launch angle affects the horizontal range of a projectile.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div class="homeo-body-icon">🚀</div>
            <div class="homeo-temp-display">Selected Angle: ${angle}°</div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Launch Angle:</label>
            <div class="exp-condition-buttons" style="grid-template-columns: repeat(5, 1fr); font-size:0.75rem;">
              <button class="exp-cond-btn ${angle === 15 ? 'active' : ''}" onclick="Experiment.setProjectileAngle(15)">15°</button>
              <button class="exp-cond-btn ${angle === 30 ? 'active' : ''}" onclick="Experiment.setProjectileAngle(30)">30°</button>
              <button class="exp-cond-btn ${angle === 45 ? 'active' : ''}" onclick="Experiment.setProjectileAngle(45)">45°</button>
              <button class="exp-cond-btn ${angle === 60 ? 'active' : ''}" onclick="Experiment.setProjectileAngle(60)">60°</button>
              <button class="exp-cond-btn ${angle === 75 ? 'active' : ''}" onclick="Experiment.setProjectileAngle(75)">75°</button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startProjectileSimulation()">
            🏀 [ LAUNCH ]
          </button>
        </div>
        `;
      } else {
        let rangeMap = { 15: 50, 30: 86.6, 45: 100, 60: 86.6, 75: 50 };
        let currentRange = rangeMap[angle];

        // Trajectory SVG path curves based on angle
        let pathMap = {
          15: "M 20,90 Q 70,75 140,90",
          30: "M 20,90 Q 110,40 210,90",
          45: "M 20,90 Q 150,15 280,90",
          60: "M 20,90 Q 120,5 210,90",
          75: "M 20,90 Q 80,0 140,90"
        };

        html += `
          <div class="exp-result-container physical-result">
            <div class="pop-graph-box">
              <div class="pop-graph-header">
                <span>Projectile Trajectory (${angle}°)</span>
                <span class="resource-pill">Range: ${currentRange}m ${angle === 45 ? '🎯 MAXIMUM' : ''}</span>
              </div>
              <svg viewBox="0 0 300 110" style="width:100%; height:110px; overflow:visible;">
                <line x1="10" y1="90" x2="290" y2="90" stroke="#94A3B8" stroke-width="1.5"/>
                <path d="${pathMap[angle]}" fill="none" stroke="${angle === 45 ? '#10B981' : '#3B82F6'}" stroke-width="3" stroke-dasharray="4,2"/>
                <circle cx="20" cy="90" r="4" fill="#3B82F6"/>
                <text x="20" y="105" font-size="9" fill="#64748B">Cannon</text>
                <text x="${angle === 45 ? 275 : (angle === 30 || angle === 60 ? 205 : 135)}" y="105" font-size="9" fill="#0F172A" font-weight="bold">${currentRange}m</text>
              </svg>
            </div>

            <div class="result-badge maintained" style="background:${angle === 45 ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'};">
              🎯 PROJECTILE RANGE (${angle}° ➔ ${angle === 45 ? 'Maximum Range!' : currentRange + 'm'})
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>When air resistance is ignored and launch & landing heights are the same, a launch angle of about <b>45°</b> produces the greatest horizontal range for a given initial speed.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Changing the launch angle changes the projectile's trajectory, flight time, and horizontal range.
            </div>

            <div class="exp-info-panel" style="background:#FFFBEB; border-color:#FCD34D; margin-top:10px;">
              <div style="font-weight:800; color:#92400E; font-size:0.88rem; margin-bottom:6px;">❓ Challenge: Which angle gives the greatest range when launch and landing heights are equal?</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${[15, 30, 45, 60, 75].map(a => `
                  <button class="exp-cond-btn ${this.projectileAnswer === String(a) ? 'active' : ''}" onclick="Experiment.answerProjectileChallenge('${a}')">${a}°</button>
                `).join('')}
              </div>
              ${this.projectileAnswer === '45' ? `
                <div style="color:#15803D; font-weight:800; font-size:0.85rem; margin-top:8px;">✅ Correct! 45° produces maximum horizontal range.</div>
              ` : (this.projectileAnswer ? `
                <div style="color:#B91C1C; font-weight:800; font-size:0.85rem; margin-top:8px;">❌ Try again! Hint: Look for the angle with 100m range.</div>
              ` : '')}
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetProjectileActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'velocity') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🏹 EXPERIMENT 2 — Initial Velocity and Projectile Motion</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate how increasing the initial velocity changes the distance and height of a projectile.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div class="homeo-body-icon">🏹</div>
            <div class="homeo-temp-display">Initial Velocity: ${vel.toUpperCase()}</div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Initial Velocity:</label>
            <div class="exp-condition-buttons" style="grid-template-columns: 1fr 1fr 1fr; font-size:0.75rem;">
              <button class="exp-cond-btn ${vel === 'low' ? 'active' : ''}" onclick="Experiment.setProjectileVel('low')">🟢 Low Velocity</button>
              <button class="exp-cond-btn ${vel === 'medium' ? 'active' : ''}" onclick="Experiment.setProjectileVel('medium')">🟡 Medium Velocity</button>
              <button class="exp-cond-btn ${vel === 'high' ? 'active' : ''}" onclick="Experiment.setProjectileVel('high')">🔴 High Velocity</button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startProjectileSimulation()">
            🏹 [ LAUNCH PROJECTILE ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container physical-result">
            <div class="homeo-body-card" style="margin:0; width:100%;">
              <div class="homeo-body-icon">🏹</div>
              <div class="homeo-temp-display">Velocity Level: ${vel.toUpperCase()}</div>
              
              <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:0.82rem;">
                <tr style="background:#F1F5F9;">
                  <th style="padding:6px; border:1px solid #CBD5E1;">Velocity</th>
                  <th style="padding:6px; border:1px solid #CBD5E1;">Height</th>
                  <th style="padding:6px; border:1px solid #CBD5E1;">Range</th>
                </tr>
                <tr style="${vel === 'low' ? 'background:#DCFCE7; font-weight:bold;' : ''}">
                  <td style="padding:6px; border:1px solid #CBD5E1;">Low 🟢</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Lower (15m)</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Shorter (40m)</td>
                </tr>
                <tr style="${vel === 'medium' ? 'background:#FEF3C7; font-weight:bold;' : ''}">
                  <td style="padding:6px; border:1px solid #CBD5E1;">Medium 🟡</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Higher (35m)</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Longer (80m)</td>
                </tr>
                <tr style="${vel === 'high' ? 'background:#FEE2E2; font-weight:bold;' : ''}">
                  <td style="padding:6px; border:1px solid #CBD5E1;">High 🔴</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Highest (70m)</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Longest (150m)</td>
                </tr>
              </table>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              🏹 VELOCITY EFFECT MEASURED
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Increasing initial velocity generally increases the projectile's range and maximum height when other conditions are kept constant.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetProjectileActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      // 📚 FINAL PROJECTILE PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Projectile Motion Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9;">Projectile Motion = Horizontal Motion + Vertical Motion</h5>
            
            <ul style="margin-top:8px;">
              <li><b>Horizontal Motion (➡️):</b> Approximately constant velocity (no horizontal acceleration).</li>
              <li><b>Vertical Motion (⬇️):</b> Accelerated downward by gravity ($g = 9.8\text{ m/s}^2$).</li>
            </ul>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p><b>Projectile motion is the motion of an object launched into the air while gravity affects its vertical motion.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchProjectileMode('angle')">
              🏀 Exp 1: Angle
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchProjectileMode('velocity')">
              🏹 Exp 2: Velocity
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchMomentumMode(mode) {
    this.momentumMode = mode;
    this.momentumStarted = false;
    this.momentumAnswer = null;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderMomentumActivity(canvasBox);
  },

  setMomentumMass(m) {
    this.momentumMass = m;
    this.momentumStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderMomentumActivity(canvasBox);
  },

  setMomentumVel(v) {
    this.momentumVel = v;
    this.momentumStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderMomentumActivity(canvasBox);
  },

  startMomentumSimulation() {
    this.momentumStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderMomentumActivity(canvasBox);
  },

  answerMomentumChallenge(ans) {
    this.momentumAnswer = ans;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderMomentumActivity(canvasBox);
  },

  resetMomentumActivity() {
    this.momentumStarted = false;
    this.momentumAnswer = null;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderMomentumActivity(canvasBox);
  },

  renderMomentumActivity(container) {
    const mode = this.momentumMode; // 'momentum', 'collision', 'summary'
    const m = this.momentumMass; // 1, 2, 5
    const v = this.momentumVel; // 1, 2, 5
    const isStarted = this.momentumStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'momentum' ? 'active' : ''}" onclick="Experiment.switchMomentumMode('momentum')">
            🚗 Exp 1: Momentum (mv)
          </button>
          <button class="exp-mode-btn ${mode === 'collision' ? 'active' : ''}" onclick="Experiment.switchMomentumMode('collision')">
            💥 Exp 2: Collisions
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchMomentumMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'momentum') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🚗 EXPERIMENT 1 — Momentum: Mass and Velocity</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate how mass and velocity affect momentum.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div class="homeo-body-icon">🛒</div>
            <div class="homeo-temp-display">Cart Setup: Mass = ${m} kg | Velocity = ${v} m/s</div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Mass (m):</label>
            <div class="exp-condition-buttons" style="grid-template-columns: 1fr 1fr 1fr; font-size:0.75rem;">
              <button class="exp-cond-btn ${m === 1 ? 'active' : ''}" onclick="Experiment.setMomentumMass(1)">1 kg</button>
              <button class="exp-cond-btn ${m === 2 ? 'active' : ''}" onclick="Experiment.setMomentumMass(2)">2 kg</button>
              <button class="exp-cond-btn ${m === 5 ? 'active' : ''}" onclick="Experiment.setMomentumMass(5)">5 kg</button>
            </div>
          </div>

          <div class="exp-condition-select-group" style="margin-top:8px;">
            <label class="exp-condition-label">Choose Velocity (v):</label>
            <div class="exp-condition-buttons" style="grid-template-columns: 1fr 1fr 1fr; font-size:0.75rem;">
              <button class="exp-cond-btn ${v === 1 ? 'active' : ''}" onclick="Experiment.setMomentumVel(1)">1 m/s</button>
              <button class="exp-cond-btn ${v === 2 ? 'active' : ''}" onclick="Experiment.setMomentumVel(2)">2 m/s</button>
              <button class="exp-cond-btn ${v === 5 ? 'active' : ''}" onclick="Experiment.setMomentumVel(5)">5 m/s</button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startMomentumSimulation()">
            ⚡ [ CALCULATE MOMENTUM ]
          </button>
        </div>
        `;
      } else {
        let p = m * v;

        html += `
          <div class="exp-result-container physical-result">
            <div class="homeo-body-card" style="margin:0; width:100%;">
              <div class="homeo-body-icon">⚡</div>
              <div class="homeo-temp-display" style="background:#DCFCE7; border-color:#86EFAC; color:#15803D;">
                p = m × v = ${m} kg × ${v} m/s = ${p} kg·m/s
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              ⚡ MOMENTUM = ${p} kg·m/s
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Increasing mass increases momentum. Increasing velocity also increases momentum.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Momentum depends on both mass and velocity (<i>p = mv</i>).
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetMomentumActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'collision') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">💥 EXPERIMENT 2 — Collision and Conservation of Momentum</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate that total momentum is conserved in an isolated collision.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div style="font-size:1.8rem; margin-bottom:4px;">🛒 Cart A → 💥 ← Cart B 🛒</div>
            <div style="font-size:0.82rem; font-weight:800; color:#334155;">
              Cart A: 2 kg @ +3 m/s (p = +6) | Cart B: 2 kg @ -1 m/s (p = -2)
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startMomentumSimulation()">
            💥 [ COLLIDE ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container physical-result">
            <div class="homeo-body-card" style="margin:0; width:100%;">
              <div style="font-size:0.88rem; font-weight:800; color:#1E293B;">
                Before Collision: p_total = (2 × 3) + (2 × -1) = 6 - 2 = <b>4 kg·m/s</b>
              </div>
              <div style="font-size:0.88rem; font-weight:800; color:#15803D; margin-top:6px;">
                After Collision: p_total = <b>4 kg·m/s</b>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              ✅ MOMENTUM CONSERVED (Before = After = 4 kg·m/s)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>In an isolated system, the total momentum before a collision equals the total momentum after the collision.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Total momentum before collision = Total momentum after collision.
            </div>

            <div class="exp-info-panel" style="background:#FFFBEB; border-color:#FCD34D; margin-top:10px;">
              <div style="font-weight:800; color:#92400E; font-size:0.88rem; margin-bottom:6px;">❓ Challenge: What happens to total momentum after the collision?</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="exp-cond-btn ${this.momentumAnswer === 'inc' ? 'active' : ''}" onclick="Experiment.answerMomentumChallenge('inc')">Increases</button>
                <button class="exp-cond-btn ${this.momentumAnswer === 'dec' ? 'active' : ''}" onclick="Experiment.answerMomentumChallenge('dec')">Decreases</button>
                <button class="exp-cond-btn ${this.momentumAnswer === 'same' ? 'active' : ''}" onclick="Experiment.answerMomentumChallenge('same')">Remains the same</button>
              </div>
              ${this.momentumAnswer === 'same' ? `
                <div style="color:#15803D; font-weight:800; font-size:0.85rem; margin-top:8px;">✅ Correct! Total momentum remains the same assuming no external forces.</div>
              ` : (this.momentumAnswer ? `
                <div style="color:#B91C1C; font-weight:800; font-size:0.85rem; margin-top:8px;">❌ Try again! Hint: Total momentum is conserved.</div>
              ` : '')}
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetMomentumActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      // 📚 FINAL MOMENTUM PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Momentum & Collisions Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9;">Momentum and Collisions</h5>
            <p>Momentum (<i>p = mv</i>) measures an object's mass in motion. In collisions, momentum transfers between objects while total momentum remains conserved.</p>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p><b>Momentum depends on mass and velocity, and total momentum is conserved during collisions in an isolated system.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchMomentumMode('momentum')">
              🚗 Exp 1: Momentum
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchMomentumMode('collision')">
              💥 Exp 2: Collisions
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchElectricityMode(mode) {
    this.electricityMode = mode;
    this.electricityStarted = false;
    this.electricityAnswer = null;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderElectricityActivity(canvasBox);
  },

  setVoltageType(type) {
    this.voltageType = type;
    this.electricityStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderElectricityActivity(canvasBox);
  },

  startElectricitySimulation() {
    this.electricityStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderElectricityActivity(canvasBox);
  },

  answerElectricityChallenge(ans) {
    this.electricityAnswer = ans;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderElectricityActivity(canvasBox);
  },

  resetElectricityActivity() {
    this.electricityStarted = false;
    this.electricityAnswer = null;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderElectricityActivity(canvasBox);
  },

  renderElectricityActivity(container) {
    const mode = this.electricityMode; // 'grid', 'voltage', 'summary'
    const type = this.voltageType; // 'low', 'high'
    const isStarted = this.electricityStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'grid' ? 'active' : ''}" onclick="Experiment.switchElectricityMode('grid')">
            ⚡ Exp 1: Power Plant to Home
          </button>
          <button class="exp-mode-btn ${mode === 'voltage' ? 'active' : ''}" onclick="Experiment.switchElectricityMode('voltage')">
            🔥 Exp 2: High Voltage
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchElectricityMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'grid') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">⚡ EXPERIMENT 1 — Power Plant to Home</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Demonstrate the complete journey of electricity from a power plant to a household.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div style="font-size:1.8rem; margin-bottom:4px;">🏭 ➔ ⚡ ➔ 🗼 ➔ 🔌 ➔ 🏘️ ➔ 🏠</div>
            <div style="font-size:0.82rem; font-weight:800; color:#334155;">Power Grid Stage: Ready to Transmit</div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startElectricitySimulation()">
            ⚡ [ START POWER FLOW ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container physical-result">
            <div class="recombinant-flow">
              <div class="recombinant-step-card">
                <span style="font-size:1.5rem;">🏭</span>
                <span><b>Power Plant:</b> Generates electrical energy</span>
              </div>
              <div style="color:#8B5CF6;">⬇️</div>
              <div class="recombinant-step-card">
                <span style="font-size:1.5rem;">⚡</span>
                <span><b>Step-Up Transformer:</b> Raises voltage for long distances</span>
              </div>
              <div style="color:#8B5CF6;">⬇️</div>
              <div class="recombinant-step-card">
                <span style="font-size:1.5rem;">🗼</span>
                <span><b>Transmission Lines:</b> Carries high-voltage power</span>
              </div>
              <div style="color:#8B5CF6;">⬇️</div>
              <div class="recombinant-step-card">
                <span style="font-size:1.5rem;">🔌</span>
                <span><b>Step-Down Transformer:</b> Reduces voltage for safe local use</span>
              </div>
              <div style="color:#8B5CF6;">⬇️</div>
              <div class="recombinant-step-card" style="border-color:#10B981; background:#ECFDF5;">
                <span style="font-size:1.5rem;">🏠</span>
                <span style="color:#065F46;"><b>Home & Electric Meter:</b> Measures and uses electricity</span>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              ⚡ ELECTRICITY DELIVERED SAFELY
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Electricity is generated, transmitted at high voltage, stepped down, and distributed to consumers.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetElectricityActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'voltage') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">⚡ EXPERIMENT 2 — Why High Voltage Is Used</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate why electricity is transmitted at high voltage.
            </p>
          </div>
      `;

      if (!isStarted) {
        const isHigh = (type === 'high');

        html += `
          <div class="homeo-body-card">
            <div class="homeo-body-icon">${isHigh ? '⚡' : '🔥'}</div>
            <div class="homeo-temp-display">Transmission Voltage: ${isHigh ? 'High Voltage (Low I)' : 'Low Voltage (High I)'}</div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Voltage System:</label>
            <div class="exp-condition-buttons">
              <button class="exp-cond-btn ${!isHigh ? 'active' : ''}" onclick="Experiment.setVoltageType('low')">🟢 Low Voltage</button>
              <button class="exp-cond-btn ${isHigh ? 'active' : ''}" onclick="Experiment.setVoltageType('high')">🔵 High Voltage</button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startElectricitySimulation()">
            ⚡ [ COMPARE TRANSMISSION ]
          </button>
        </div>
        `;
      } else {
        const isHigh = (type === 'high');

        html += `
          <div class="exp-result-container ${isHigh ? 'physical-result' : 'chemical-result'}">
            <div class="homeo-body-card" style="margin:0; width:100%; border-color:${isHigh ? '#86EFAC' : '#FCA5A5'}; background:${isHigh ? '#F0FDF4' : '#FEF2F2'};">
              <div class="homeo-body-icon">${isHigh ? '⚡' : '🔥'}</div>
              <div class="homeo-temp-display" style="color:${isHigh ? '#15803D' : '#B91C1C'};">
                Power Loss Formula: P_loss = I² × R
              </div>
              <div style="font-size:0.88rem; font-weight:800; color:${isHigh ? '#166534' : '#991B1B'}; margin-top:6px;">
                ${isHigh ? '⚡ High Voltage → Lower Current → Less Energy Loss!' : '🔥 Low Voltage → Higher Current → Greater Energy Loss!'}
              </div>
            </div>

            <div class="result-badge maintained" style="background:${isHigh ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'};">
              ${isHigh ? '⚡ HIGH VOLTAGE (Efficient Transmission)' : '🔥 LOW VOLTAGE (Excessive Heat Loss)'}
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>For the same transmitted power, increasing voltage reduces the current. Because resistive power loss depends on the square of current (<i>P_loss = I²R</i>), using high voltage greatly reduces energy loss during long-distance transmission.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> High voltage allows electricity to be transmitted more efficiently over long distances.
            </div>

            <div class="exp-info-panel" style="background:#FFFBEB; border-color:#FCD34D; margin-top:10px;">
              <div style="font-weight:800; color:#92400E; font-size:0.88rem; margin-bottom:6px;">❓ Challenge: Why is electricity transmitted at high voltage?</div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                <button class="exp-cond-btn ${this.electricityAnswer === 'curr' ? 'active' : ''}" onclick="Experiment.answerElectricityChallenge('curr')">To increase current</button>
                <button class="exp-cond-btn ${this.electricityAnswer === 'loss' ? 'active' : ''}" onclick="Experiment.answerElectricityChallenge('loss')">To reduce current and minimize energy loss in transmission lines</button>
                <button class="exp-cond-btn ${this.electricityAnswer === 'short' ? 'active' : ''}" onclick="Experiment.answerElectricityChallenge('short')">To make wires shorter</button>
              </div>
              ${this.electricityAnswer === 'loss' ? `
                <div style="color:#15803D; font-weight:800; font-size:0.85rem; margin-top:8px;">✅ Correct! Reducing current minimizes I²R power loss.</div>
              ` : (this.electricityAnswer ? `
                <div style="color:#B91C1C; font-weight:800; font-size:0.85rem; margin-top:8px;">❌ Try again! Hint: Remember P_loss = I²R.</div>
              ` : '')}
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetElectricityActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      // 📚 FINAL ELECTRICITY PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Electricity Distribution Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#6D28D9;">Electricity Generation & Distribution</h5>
            <p>Power plants generate electricity, step-up transformers raise voltage for long-distance grid transmission, and step-down transformers lower voltage to safe levels for homes.</p>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p><b>Electricity is generated, transmitted at high voltage to minimize energy loss, stepped down, and distributed safely to consumers.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchElectricityMode('grid')">
              ⚡ Exp 1: Power Grid
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchElectricityMode('voltage')">
              🔥 Exp 2: High Voltage
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  switchEnergyMixMode(mode) {
    this.energyMixMode = mode;
    this.energyMixStarted = false;
    this.energyMixAnswer = null;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderEnergyMixActivity(canvasBox);
  },

  setEnergySourceType(type) {
    this.energySourceType = type;
    this.energyMixStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderEnergyMixActivity(canvasBox);
  },

  toggleRenewableSource(sourceKey) {
    this.activeRenewables[sourceKey] = !this.activeRenewables[sourceKey];
    this.energyMixStarted = false;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderEnergyMixActivity(canvasBox);
  },

  startEnergyMixSimulation() {
    this.energyMixStarted = true;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderEnergyMixActivity(canvasBox);
  },

  answerEnergyMixChallenge(ans) {
    this.energyMixAnswer = ans;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderEnergyMixActivity(canvasBox);
  },

  resetEnergyMixActivity() {
    this.energyMixStarted = false;
    this.energyMixAnswer = null;
    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) this.renderEnergyMixActivity(canvasBox);
  },

  renderEnergyMixActivity(container) {
    const mode = this.energyMixMode; // 'compare', 'mix', 'summary'
    const type = this.energySourceType; // 'solar', 'coal'
    const isStarted = this.energyMixStarted;

    let html = `
      <div class="exp-activity-wrapper">
        <div class="exp-mode-toggle-group" style="grid-template-columns: 1fr 1fr 1fr; font-size: 0.78rem;">
          <button class="exp-mode-btn ${mode === 'compare' ? 'active' : ''}" onclick="Experiment.switchEnergyMixMode('compare')">
            ☀️ Exp 1: Solar vs. Coal
          </button>
          <button class="exp-mode-btn ${mode === 'mix' ? 'active' : ''}" onclick="Experiment.switchEnergyMixMode('mix')">
            🌬️ Exp 2: Renewable Mix
          </button>
          <button class="exp-mode-btn ${mode === 'summary' ? 'active' : ''}" onclick="Experiment.switchEnergyMixMode('summary')">
            📚 Learning Panel
          </button>
        </div>
    `;

    if (mode === 'compare') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">☀️ EXPERIMENT 1 — Solar vs. Fossil Fuel Energy</div>
          <div class="exp-explain-block" style="background:#F0FDF4; border-color:#86EFAC;">
            <p style="font-size:0.88rem; color:#166534; font-weight:700;">
              <b>Goal:</b> Compare a renewable energy source with a non-renewable energy source.
            </p>
          </div>
      `;

      if (!isStarted) {
        const isSolar = (type === 'solar');

        html += `
          <div class="homeo-body-card">
            <div class="homeo-body-icon">${isSolar ? '☀️' : '🪨'}</div>
            <div class="homeo-temp-display">Selected Energy Source: ${isSolar ? '☀️ Solar Energy (Renewable)' : '🪨 Coal (Non-Renewable)'}</div>
          </div>

          <div class="exp-condition-select-group">
            <label class="exp-condition-label">Choose Energy Source:</label>
            <div class="exp-condition-buttons">
              <button class="exp-cond-btn ${isSolar ? 'active' : ''}" onclick="Experiment.setEnergySourceType('solar')">☀️ Solar Energy</button>
              <button class="exp-cond-btn ${!isSolar ? 'active' : ''}" onclick="Experiment.setEnergySourceType('coal')">🪨 Coal</button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startEnergyMixSimulation()">
            ⚡ [ GENERATE ELECTRICITY ]
          </button>
        </div>
        `;
      } else {
        const isSolar = (type === 'solar');

        html += `
          <div class="exp-result-container ${isSolar ? 'physical-result' : 'chemical-result'}">
            <div class="recombinant-flow">
              ${isSolar ? `
                <div class="recombinant-step-card">
                  <span style="font-size:1.5rem;">☀️</span>
                  <span><b>Sunlight</b> shines continuously</span>
                </div>
                <div style="color:#10B981;">⬇️</div>
                <div class="recombinant-step-card">
                  <span style="font-size:1.5rem;">🔲</span>
                  <span><b>Solar Panels</b> convert photons to electricity</span>
                </div>
                <div style="color:#10B981;">⬇️</div>
                <div class="recombinant-step-card" style="border-color:#10B981; background:#ECFDF5;">
                  <span style="font-size:1.5rem;">⚡</span>
                  <span style="color:#065F46;"><b>Clean Electricity Generated!</b></span>
                </div>
              ` : `
                <div class="recombinant-step-card">
                  <span style="font-size:1.5rem;">🪨</span>
                  <span><b>Coal</b> mined from ground</span>
                </div>
                <div style="color:#EF4444;">⬇️</div>
                <div class="recombinant-step-card">
                  <span style="font-size:1.5rem;">🔥</span>
                  <span><b>Combustion</b> generates steam turbine rotation</span>
                </div>
                <div style="color:#EF4444;">⬇️</div>
                <div class="recombinant-step-card" style="border-color:#EF4444; background:#FEF2F2;">
                  <span style="font-size:1.5rem;">⚡</span>
                  <span style="color:#991B1B;"><b>Electricity Generated (Fuel Consumed)</b></span>
                </div>
              `}
            </div>

            <div class="result-badge maintained" style="background:${isSolar ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'};">
              ${isSolar ? '♻️ RENEWABLE ENERGY (Naturally Replenished)' : '⛏️ NON-RENEWABLE ENERGY (Finite Fossil Fuel)'}
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>Comparison Summary</h5>
              <table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:0.82rem;">
                <tr style="background:#F1F5F9;">
                  <th style="padding:6px; border:1px solid #CBD5E1;">Feature</th>
                  <th style="padding:6px; border:1px solid #CBD5E1; color:#059669;">☀️ Solar</th>
                  <th style="padding:6px; border:1px solid #CBD5E1; color:#B45309;">🪨 Coal</th>
                </tr>
                <tr>
                  <td style="padding:6px; border:1px solid #CBD5E1; font-weight:700;">Type</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Renewable</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Non-renewable</td>
                </tr>
                <tr>
                  <td style="padding:6px; border:1px solid #CBD5E1; font-weight:700;">Replenished</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Yes</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">No, takes millions of yrs</td>
                </tr>
                <tr>
                  <td style="padding:6px; border:1px solid #CBD5E1; font-weight:700;">Generation</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Solar panels</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Thermal power plant</td>
                </tr>
                <tr>
                  <td style="padding:6px; border:1px solid #CBD5E1; font-weight:700;">Fuel Consumed</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">No</td>
                  <td style="padding:6px; border:1px solid #CBD5E1;">Yes</td>
                </tr>
              </table>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Renewable resources are naturally replenished, while non-renewable resources are finite and take very long periods to form.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetEnergyMixActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else if (mode === 'mix') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌬️ EXPERIMENT 2 — Renewable Energy Mix</div>
          <div class="exp-explain-block" style="background:#FFFBEB; border-color:#FCD34D;">
            <p style="font-size:0.88rem; color:#92400E; font-weight:700;">
              <b>Goal:</b> Demonstrate how different renewable energy sources can contribute to electricity generation.
            </p>
          </div>
      `;

      const ren = this.activeRenewables;
      let totalMW = 0;
      if (ren.solar) totalMW += 25;
      if (ren.wind) totalMW += 25;
      if (ren.hydro) totalMW += 25;
      if (ren.geo) totalMW += 25;

      if (!isStarted) {
        html += `
          <div style="margin:10px 0;">
            <div class="homeo-temp-display" style="margin-bottom:10px;">
              ⚡ Renewable Grid Output: ${totalMW} MW
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
              <button class="exp-cond-btn ${ren.solar ? 'active' : ''}" onclick="Experiment.toggleRenewableSource('solar')">☀️ Solar (25 MW)</button>
              <button class="exp-cond-btn ${ren.wind ? 'active' : ''}" onclick="Experiment.toggleRenewableSource('wind')">🌬️ Wind (25 MW)</button>
              <button class="exp-cond-btn ${ren.hydro ? 'active' : ''}" onclick="Experiment.toggleRenewableSource('hydro')">💧 Hydro (25 MW)</button>
              <button class="exp-cond-btn ${ren.geo ? 'active' : ''}" onclick="Experiment.toggleRenewableSource('geo')">🌋 Geothermal (25 MW)</button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startEnergyMixSimulation()">
            ⚡ [ GENERATE POWER ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container physical-result">
            <div class="homeo-body-card" style="margin:0; width:100%;">
              <div class="homeo-body-icon">⚡</div>
              <div class="homeo-temp-display" style="background:#DCFCE7; border-color:#86EFAC; color:#15803D;">
                Total Clean Electricity Generated: ${totalMW} MW
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              ⚡ RENEWABLE ENERGY MIX (${totalMW} MW Active)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Renewable energy sources use naturally replenished resources such as sunlight, wind, moving water, and Earth's internal heat. Combining different renewable sources creates a balanced energy grid.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Renewable energy comes from resources that are naturally replenished, while non-renewable energy relies on finite resources.
            </div>

            <div class="exp-info-panel" style="background:#FFFBEB; border-color:#FCD34D; margin-top:10px;">
              <div style="font-weight:800; color:#92400E; font-size:0.88rem; margin-bottom:6px;">❓ Challenge: Which of these energy sources is non-renewable?</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="exp-cond-btn ${this.energyMixAnswer === 'solar' ? 'active' : ''}" onclick="Experiment.answerEnergyMixChallenge('solar')">☀️ Solar</button>
                <button class="exp-cond-btn ${this.energyMixAnswer === 'wind' ? 'active' : ''}" onclick="Experiment.answerEnergyMixChallenge('wind')">🌬️ Wind</button>
                <button class="exp-cond-btn ${this.energyMixAnswer === 'hydro' ? 'active' : ''}" onclick="Experiment.answerEnergyMixChallenge('hydro')">💧 Hydropower</button>
                <button class="exp-cond-btn ${this.energyMixAnswer === 'coal' ? 'active' : ''}" onclick="Experiment.answerEnergyMixChallenge('coal')">🪨 Coal</button>
              </div>
              ${this.energyMixAnswer === 'coal' ? `
                <div style="color:#15803D; font-weight:800; font-size:0.85rem; margin-top:8px;">✅ Correct! Coal is a non-renewable fossil fuel.</div>
              ` : (this.energyMixAnswer ? `
                <div style="color:#B91C1C; font-weight:800; font-size:0.85rem; margin-top:8px;">❌ Try again! Hint: Look for the fossil fuel.</div>
              ` : '')}
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetEnergyMixActivity()">
            🔄 Reset Experiment
          </button>
        </div>
        `;
      }
    } else {
      // 📚 FINAL ENERGY PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Energy Sources Panel</div>

          <div class="exp-explain-block" style="background:#FAF5FF; border-color:#E9D5FF;">
            <h5 style="color:#15803D;">♻️ Renewable Energy</h5>
            <p>☀️ Solar | 🌬️ Wind | 💧 Hydropower | 🌋 Geothermal</p>
            <div style="font-size:0.82rem; font-weight:700; color:#166534; margin-top:4px;">Naturally replenished by nature.</div>

            <h5 style="color:#B91C1C; margin-top:10px;">⛏️ Non-Renewable Energy</h5>
            <p>🪨 Coal | 🛢️ Oil | 🔥 Natural Gas</p>
            <div style="font-size:0.82rem; font-weight:700; color:#991B1B; margin-top:4px;">Finite resources that take millions of years to form.</div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-objective-box">
              <h5>🎯 Main Learning Objective</h5>
              <p><b>Energy sources can be classified as renewable or non-renewable based on how quickly nature replenishes them.</b></p>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchEnergyMixMode('compare')">
              ☀️ Exp 1: Solar vs Coal
            </button>
            <button class="secondary-btn" style="flex:1;" onclick="Experiment.switchEnergyMixMode('mix')">
              🌬️ Exp 2: Renewable Mix
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  }
};
