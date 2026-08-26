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
    if (t.includes('physical vs') || t.includes('physical and chemical') || (t.includes('physical') && t.includes('change'))) return '⚗️';
    if (t.includes('reaction') && !t.includes('rate')) return '💥';
    if (t.includes('acid') || t.includes('base') || t.includes('salt')) return '🧪';
    if (t.includes('balancing') || t.includes('balance')) return '⚖️';
    if (t.includes('equation')) return '📝';
    if (t.includes('rate')) return '⏱️';
    if (t.includes('homeostasis')) return '🩺';
    if (t.includes('evolution')) return '🦴';
    if (t.includes('carrying') || t.includes('population') || t.includes('ecosystem')) return '🐾';
    if (t.includes('biotech')) return '🧬';
    if (t.includes('plate') || t.includes('tectonic') || t.includes('volcano')) return '🌋';
    if (t.includes('climate')) return '🌡️';
    if (t.includes('enso') || t.includes('interaction')) return '🌊';
    if (t.includes('sustainability') || t.includes('sustain')) return '🌱';
    if (t.includes('projectile')) return '🏹';
    if (t.includes('momentum') || t.includes('collision')) return '💥';
    if (t.includes('electricity') || t.includes('generation')) return '⚡';
    if (t.includes('renewable') || t.includes('energy')) return '🔋';
    return '🔬';
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
          <div class="term-title" style="color: #FFFFFF; font-size: 1.15rem; font-weight: 800; margin-bottom: 8px; line-height: 1.3;">${topicName}</div>
          <span class="topic-select-pill">Launch Simulator <span style="font-size: 0.85rem; margin-left: 2px;">➔</span></span>
        </div>
        <div class="topic-graphic-orb">${icon}</div>
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

    if (this.bIsCorrect) {
      if (typeof App !== 'undefined' && App.playCorrectSound) App.playCorrectSound();
    } else {
      if (typeof App !== 'undefined' && App.playWrongSound) App.playWrongSound();
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

    if (this.challengeIsCorrect) {
      if (typeof App !== 'undefined' && App.playCorrectSound) App.playCorrectSound();
    } else {
      if (typeof App !== 'undefined' && App.playWrongSound) App.playWrongSound();
    }

    const canvasBox = document.getElementById('expCanvasBox');
    if (canvasBox) {
      this.renderChemicalEquationsActivity(canvasBox);
    }
  },

  // ==========================================================================
  // 10X COOLER CANVAS ANIMATION FRAMEWORK & PARTICLE SIMULATOR ENGINE
  // ==========================================================================
  animFrameId: null,

  stopCanvasAnimation() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  },

  setupCanvas(canvasId, height = 220) {
    this.stopCanvasAnimation();
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const parent = canvas.parentElement;
    const w = parent ? (parent.clientWidth || 360) : 360;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = height * dpr;
    canvas.style.width = '100%';
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w, h: height, canvas };
  },

  // 1. Physical vs Chemical Change Canvas
  startPhysicalVsChemicalCanvas(canvasId, isChemical) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;
    const particles = [];
    const count = isChemical ? 40 : 30;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.5,
        vy: isChemical ? -0.8 - Math.random() * 1.5 : (Math.random() - 0.5) * 0.8,
        r: isChemical ? 3 + Math.random() * 6 : 2 + Math.random() * 5,
        alpha: 0.3 + Math.random() * 0.6,
        color: isChemical ? '#38BDF8' : '#C084FC'
      });
    }

    const loop = () => {
      time += 0.03;
      ctx.clearRect(0, 0, w, h);

      // Sci-Fi Grid Background
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const centerX = w / 2;
      const centerY = h / 2;

      if (isChemical) {
        // Chemical Reaction Beaker with Rising Gas Particles
        const flaskY = h * 0.7;

        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(centerX - 40, flaskY - 60);
        ctx.lineTo(centerX - 50, flaskY + 30);
        ctx.quadraticCurveTo(centerX, flaskY + 45, centerX + 50, flaskY + 30);
        ctx.lineTo(centerX + 40, flaskY - 60);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.moveTo(centerX - 48, flaskY + 30);
        for (let x = -48; x <= 48; x += 6) {
          const dy = Math.sin(time * 3 + x * 0.1) * 4;
          ctx.lineTo(centerX + x, flaskY - 10 + dy);
        }
        ctx.quadraticCurveTo(centerX, flaskY + 45, centerX - 48, flaskY + 30);
        ctx.fill();

        particles.forEach(p => {
          p.y += p.vy;
          p.x += Math.sin(time * 2 + p.r) * 0.8;
          if (p.y < 20) {
            p.y = flaskY + 20;
            p.x = centerX + (Math.random() - 0.5) * 60;
          }
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      } else {
        // Physical Change: Ice Melting Fluid Pool
        const meltProgress = (Math.sin(time * 0.8) + 1) / 2;

        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 2;
        for (let i = -3; i <= 3; i++) {
          const rayX = centerX + i * 25;
          const rayY = centerY + 30 - (time * 40 + i * 15) % 60;
          ctx.beginPath(); ctx.moveTo(rayX, rayY); ctx.lineTo(rayX, rayY - 15); ctx.stroke();
        }

        ctx.fillStyle = `rgba(168, 85, 247, ${0.4 + meltProgress * 0.3})`;
        ctx.shadowColor = '#A855F7';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        const rx = 65 + meltProgress * 30;
        const ry = 25 - meltProgress * 12;
        ctx.ellipse(centerX, centerY + 20, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 20 || p.x > w - 20) p.vx *= -1;
          if (p.y < 20 || p.y > h - 20) p.vy *= -1;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 15. Projectile Motion Physics Cannon Canvas
  startProjectileCanvas(canvasId, angleDeg, velocityStr) {
    const setup = this.setupCanvas(canvasId, 230);
    if (!setup) return;
    const { ctx, w, h } = setup;

    const velMap = { low: 25, medium: 35, high: 48 };
    const v0 = velMap[velocityStr] || 35;
    const rad = angleDeg * Math.PI / 180;
    const g = 9.81;

    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);
    const flightTime = (2 * vy) / g;
    const maxHeight = (vy * vy) / (2 * g);
    const range = (v0 * v0 * Math.sin(2 * rad)) / g;

    let animT = 0;

    const loop = () => {
      animT += 0.04;
      if (animT > flightTime) animT = 0;

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const groundY = h - 25;
      const cannonX = 35;
      const scaleX = (w - 70) / Math.max(120, range * 1.1);
      const scaleY = (h - 60) / Math.max(40, maxHeight * 1.2);

      // Ground Line
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();

      // Trajectory Arc Path
      ctx.strokeStyle = angleDeg === 45 ? '#10B981' : 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cannonX, groundY);
      for (let t = 0; t <= flightTime; t += 0.05) {
        const px = cannonX + (vx * t) * scaleX;
        const py = groundY - (vy * t - 0.5 * g * t * t) * scaleY;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Cannon Barrel
      ctx.save();
      ctx.translate(cannonX, groundY);
      ctx.rotate(-rad);
      ctx.fillStyle = '#A855F7';
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 12;
      ctx.fillRect(0, -8, 30, 16);
      ctx.restore();

      // Animated Cannonball
      const ballX = cannonX + (vx * animT) * scaleX;
      const ballY = groundY - (vy * animT - 0.5 * g * animT * animT) * scaleY;

      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Target Marker at landing point
      const landX = cannonX + range * scaleX;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
      ctx.beginPath();
      ctx.arc(landX, groundY, 10, 0, Math.PI * 2);
      ctx.fill();

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 16. Momentum & Collisions Physics Canvas
  startMomentumCanvas(canvasId, massA, velA, massB, velB) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    const groundY = h - 35;
    let carAX = 60;
    let carBX = w - 80;
    let curVelA = velA * 1.5;
    let curVelB = velB * 1.5;
    let isImpact = false;

    const loop = () => {
      ctx.clearRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      // Track Line
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();

      carAX += curVelA;
      carBX += curVelB;

      // Collision Check
      if (carBX - carAX <= 45 && !isImpact) {
        isImpact = true;
        const vA_new = ((massA - massB) * curVelA + 2 * massB * curVelB) / (massA + massB);
        const vB_new = ((massB - massA) * curVelB + 2 * massA * curVelA) / (massA + massB);
        curVelA = vA_new;
        curVelB = vB_new;
      }

      if (carAX < 30 || carAX > w - 80) curVelA *= -1;
      if (carBX < 80 || carBX > w - 30) curVelB *= -1;

      // Bumper Car A (Pink)
      ctx.fillStyle = '#EC4899';
      ctx.shadowColor = '#EC4899';
      ctx.shadowBlur = 12;
      ctx.fillRect(carAX - 20, groundY - 24, 40, 24);

      // Bumper Car B (Cyan)
      ctx.fillStyle = '#06B6D4';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 12;
      ctx.fillRect(carBX - 20, groundY - 24, 40, 24);

      if (isImpact) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc((carAX + carBX) / 2, groundY - 12, 25, 0, Math.PI * 2);
        ctx.stroke();
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 17. Electricity Grid Generator Canvas
  startElectricityCanvas(canvasId, voltageType) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;
    const isHigh = voltageType === 'high';

    const loop = () => {
      time += 0.05;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerY = h / 2;

      // Power Plant Turbine Rotor
      ctx.fillStyle = '#8B5CF6';
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(50, centerY, 30, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
        const bx = 50 + Math.cos(time * 3 + a) * 25;
        const by = centerY + Math.sin(time * 3 + a) * 25;
        ctx.beginPath(); ctx.moveTo(50, centerY); ctx.lineTo(bx, by); ctx.stroke();
      }

      // Transmission Line Wave Glow
      ctx.strokeStyle = isHigh ? '#F59E0B' : '#10B981';
      ctx.lineWidth = isHigh ? 4 : 2;
      ctx.shadowColor = isHigh ? '#F59E0B' : '#10B981';
      ctx.shadowBlur = isHigh ? 18 : 8;

      ctx.beginPath();
      ctx.moveTo(80, centerY);
      for (let x = 80; x <= w - 60; x += 10) {
        const wave = Math.sin(time * 6 + x * 0.08) * (isHigh ? 8 : 4);
        ctx.lineTo(x, centerY + wave);
      }
      ctx.stroke();

      // Current Spark Particles
      for (let i = 0; i < 4; i++) {
        const px = 80 + ((time * 80 + i * 80) % (w - 140));
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(px, centerY, 4, 0, Math.PI * 2); ctx.fill();
      }

      // Home Target Destination
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(w - 40, centerY, 22, 0, Math.PI * 2); ctx.fill();

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 18. Energy Mix Grid Canvas
  startEnergyMixCanvas(canvasId, mixState) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerY = h / 2;

      if (mixState.solar) {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const sx = 40 + i * 20;
          ctx.beginPath(); ctx.moveTo(sx, 20); ctx.lineTo(sx - 10, centerY - 20); ctx.stroke();
        }
      }

      if (mixState.wind) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(w / 2, h - 20); ctx.lineTo(w / 2, centerY - 20); ctx.stroke();
        for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 3) {
          const bx = w / 2 + Math.cos(time * 4 + a) * 30;
          const by = (centerY - 20) + Math.sin(time * 4 + a) * 30;
          ctx.beginPath(); ctx.moveTo(w / 2, centerY - 20); ctx.lineTo(bx, by); ctx.stroke();
        }
      }

      if (mixState.hydro) {
        ctx.fillStyle = '#06B6D4';
        ctx.shadowColor = '#06B6D4';
        ctx.shadowBlur = 10;
        for (let i = 0; i < 6; i++) {
          const wx = w - 100 + i * 15;
          const wy = h - 30 + Math.sin(time * 3 + i) * 6;
          ctx.beginPath(); ctx.arc(wx, wy, 4, 0, Math.PI * 2); ctx.fill();
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 2. Chemical Reactions Canvas (Iron Rusting & Apple Browning)
  startChemicalReactionsCanvas(canvasId, isIron) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;
    const particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r: 3 + Math.random() * 4,
        color: isIron ? '#F97316' : '#84CC16'
      });
    }

    const loop = () => {
      time += 0.03;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerX = w / 2;
      const centerY = h / 2;

      if (isIron) {
        ctx.fillStyle = '#94A3B8';
        ctx.shadowColor = '#F97316';
        ctx.shadowBlur = 15;
        ctx.fillRect(centerX - 80, centerY - 25, 160, 50);

        ctx.fillStyle = 'rgba(249, 115, 22, 0.65)';
        ctx.fillRect(centerX - 80, centerY - 25, 160, 15);

        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 20 || p.x > w - 20) p.vx *= -1;
          if (p.y < 20 || p.y > h - 20) p.vy *= -1;
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
      } else {
        ctx.fillStyle = '#FEF08A';
        ctx.shadowColor = '#84CC16';
        ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(centerX, centerY, 55, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = 'rgba(180, 83, 9, 0.55)';
        ctx.beginPath(); ctx.arc(centerX, centerY, 55, 0, Math.PI); ctx.fill();

        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 20 || p.x > w - 20) p.vx *= -1;
          if (p.y < 20 || p.y > h - 20) p.vy *= -1;
          ctx.fillStyle = '#B45309';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 3. Acids, Bases & Litmus Neutralization Canvas
  startAcidsBasesCanvas(canvasId, mode) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;
    const isAcid = mode === 'blue_litmus';
    const isBase = mode === 'red_litmus';
    const isNeut = mode === 'neutralization';

    const count = 40;
    const ions = [];
    for (let i = 0; i < count; i++) {
      ions.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: isAcid ? 'H+' : (isBase ? 'OH-' : (i % 2 === 0 ? 'H+' : 'OH-'))
      });
    }

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerX = w / 2;
      const centerY = h / 2;

      let fluidColor = isAcid ? 'rgba(239, 68, 68, 0.35)' : (isBase ? 'rgba(59, 130, 246, 0.35)' : 'rgba(16, 185, 129, 0.35)');
      ctx.fillStyle = fluidColor;
      ctx.shadowColor = isAcid ? '#EF4444' : (isBase ? '#3B82F6' : '#10B981');
      ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(centerX, centerY + 10, 65, 0, Math.PI * 2); ctx.fill();

      if (!isNeut) {
        ctx.fillStyle = isAcid ? '#EF4444' : '#3B82F6';
        ctx.fillRect(centerX - 12, 10, 24, h - 50);
      }

      ions.forEach(ion => {
        ion.x += ion.vx; ion.y += ion.vy;
        if (ion.x < 30 || ion.x > w - 30) ion.vx *= -1;
        if (ion.y < 30 || ion.y > h - 30) ion.vy *= -1;

        ctx.fillStyle = ion.type === 'H+' ? '#F43F5E' : '#38BDF8';
        ctx.beginPath(); ctx.arc(ion.x, ion.y, 4, 0, Math.PI * 2); ctx.fill();
      });

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 4. Chemical Equations Atomic Fusion Canvas
  startChemicalEquationsCanvas(canvasId, isH2O) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerX = w / 2;
      const centerY = h / 2;

      ctx.fillStyle = isH2O ? '#38BDF8' : '#F59E0B';
      ctx.shadowColor = isH2O ? '#38BDF8' : '#F59E0B';
      ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(centerX, centerY, 32, 0, Math.PI * 2); ctx.fill();

      const radius = 55;
      for (let i = 0; i < 2; i++) {
        const ang = time * 2 + i * Math.PI;
        const ax = centerX + Math.cos(ang) * radius;
        const ay = centerY + Math.sin(ang) * radius;

        ctx.fillStyle = isH2O ? '#F472B6' : '#34D399';
        ctx.shadowColor = isH2O ? '#F472B6' : '#34D399';
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(ax, ay, 16, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke();
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 5. Balancing Scale Balance Canvas
  startBalancingCanvas(canvasId, c1, c2, c3) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    const isBalanced = (c1 === 2 && c2 === 1 && c3 === 2);
    let time = 0;

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerX = w / 2;
      const fulcrumY = h - 40;

      ctx.fillStyle = '#A855F7';
      ctx.beginPath();
      ctx.moveTo(centerX, fulcrumY - 45);
      ctx.lineTo(centerX - 25, fulcrumY);
      ctx.lineTo(centerX + 25, fulcrumY);
      ctx.fill();

      const tilt = isBalanced ? 0 : Math.sin(time * 2) * 0.12;

      ctx.save();
      ctx.translate(centerX, fulcrumY - 45);
      ctx.rotate(tilt);

      ctx.strokeStyle = isBalanced ? '#10B981' : '#F43F5E';
      ctx.lineWidth = 5;
      ctx.shadowColor = isBalanced ? '#10B981' : '#F43F5E';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(110, 0); ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(-140, 0, 60, 15);

      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.fillRect(80, 0, 60, 15);

      ctx.restore();

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 6. Rates of Reactions Kinetic Collision Canvas
  startRatesCanvas(canvasId, temp, hasCatalyst) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;
    const speed = (temp === 'high' ? 3.5 : 1.5) * (hasCatalyst ? 1.4 : 1.0);
    const count = 45;
    const molecules = [];

    for (let i = 0; i < count; i++) {
      molecules.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: 4 + Math.random() * 4,
        color: i % 2 === 0 ? '#38BDF8' : '#F43F5E'
      });
    }

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      if (hasCatalyst) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 14;
        ctx.fillRect(40, h - 20, w - 80, 12);
      }

      molecules.forEach(m => {
        m.x += m.vx; m.y += m.vy;
        if (m.x < 15 || m.x > w - 15) m.vx *= -1;
        if (m.y < 15 || m.y > h - (hasCatalyst ? 30 : 15)) m.vy *= -1;

        ctx.fillStyle = m.color;
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
      });

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 7. Homeostasis Heart Monitor ECG Canvas
  startHomeostasisCanvas(canvasId, mode, condition) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;
    const isHot = condition === 'hot';

    const loop = () => {
      time += 0.06;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerY = h / 2;

      ctx.strokeStyle = isHot ? '#F43F5E' : '#38BDF8';
      ctx.lineWidth = 3;
      ctx.shadowColor = isHot ? '#F43F5E' : '#38BDF8';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x < w; x += 5) {
        const pulse = Math.sin((x * 0.05) - (time * (isHot ? 4 : 2)));
        const ecgPeak = (x % 80 > 35 && x % 80 < 45) ? Math.sin(x) * (isHot ? 35 : 18) : pulse * 4;
        ctx.lineTo(x, centerY - ecgPeak);
      }
      ctx.stroke();

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 8. Mechanisms of Evolution Moth Simulator Canvas
  startEvolutionCanvas(canvasId, env, generation) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;
    const isBirch = env === 'green' || env === 'birch';

    const loop = () => {
      time += 0.03;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = isBirch ? '#F8FAFC' : '#1E293B';
      ctx.fillRect(0, 0, w, h);

      const lightCount = isBirch ? Math.max(5, 30 - generation * 6) : Math.max(2, 20 - generation * 5);
      const darkCount = isBirch ? Math.max(2, 10 - generation * 2) : Math.min(30, 8 + generation * 8);

      for (let i = 0; i < lightCount; i++) {
        const mx = (i * 35 + time * 20) % w;
        const my = (i * 25 + Math.sin(time + i) * 15) % h;
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2); ctx.fill();
      }

      for (let i = 0; i < darkCount; i++) {
        const mx = (i * 35 + time * 15 + 40) % w;
        const my = (i * 30 + Math.cos(time + i) * 15) % h;
        ctx.fillStyle = '#0F172A';
        ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2); ctx.fill();
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 9. Ecosystem Carrying Capacity S-Curve Canvas
  startCarryingCapacityCanvas(canvasId) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;

    const loop = () => {
      time += 0.03;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const groundY = h - 25;

      const capY = groundY - 140;
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(0, capY); ctx.lineTo(w, capY); ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(10, groundY);
      for (let x = 10; x <= w; x += 5) {
        const progress = x / w;
        const sVal = 1 / (1 + Math.exp(-8 * (progress - 0.4)));
        const y = groundY - sVal * 140;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 10. Biotechnology Gene Splicing Canvas
  startBiotechCanvas(canvasId) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerY = h / 2;

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 12;

      for (let x = 20; x < w - 20; x += 8) {
        const y1 = centerY + Math.sin(time * 2 + x * 0.05) * 35;
        const y2 = centerY - Math.sin(time * 2 + x * 0.05) * 35;

        ctx.fillStyle = '#A855F7';
        ctx.beginPath(); ctx.arc(x, y1, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#EC4899';
        ctx.beginPath(); ctx.arc(x, y2, 4, 0, Math.PI * 2); ctx.fill();

        if (x % 16 === 0) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 11. Plate Tectonics Fault Line Canvas (10X COOLER)
  startTectonicsCanvas(canvasId, mode) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;
    const isDivergent = mode === 'divergent';
    const isConvergent = mode === 'convergent';

    const particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * w,
        y: h - 20 + Math.random() * 20,
        vy: -0.8 - Math.random() * 1.2,
        vx: (Math.random() - 0.5) * 0.8,
        r: 2 + Math.random() * 3,
        color: i % 2 === 0 ? '#EF4444' : '#F59E0B'
      });
    }

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerX = w / 2;
      const groundY = h / 2 + 15;

      // Draw Glowing Mantle Magma Layer
      const mantleGrad = ctx.createLinearGradient(0, groundY, 0, h);
      mantleGrad.addColorStop(0, '#7F1D1D');
      mantleGrad.addColorStop(0.5, '#B91C1C');
      mantleGrad.addColorStop(1, '#450A0A');
      ctx.fillStyle = mantleGrad;
      ctx.fillRect(0, groundY + 15, w, h - groundY);

      // Draw Magma Convection Loops
      ctx.strokeStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const offset = (i - 1) * 90;
        ctx.beginPath();
        ctx.arc(centerX + offset, groundY + 45, 18, time + i, time + i + Math.PI * 1.5);
        ctx.stroke();
      }

      // Draw Magma Plume if Divergent
      if (isDivergent) {
        const plumeGrad = ctx.createLinearGradient(centerX - 25, groundY + 20, centerX + 25, groundY - 35);
        plumeGrad.addColorStop(0, '#EF4444');
        plumeGrad.addColorStop(1, '#F59E0B');
        ctx.fillStyle = plumeGrad;
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(centerX - 20, groundY + 30);
        ctx.lineTo(centerX + 20, groundY + 30);
        ctx.lineTo(centerX + 12, groundY - 35);
        ctx.lineTo(centerX - 12, groundY - 35);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, groundY + 30);
        ctx.lineTo(centerX, groundY - 35);
        ctx.stroke();
      }

      const shiftL = isDivergent ? -Math.sin(time * 1.5) * 16 : (isConvergent ? Math.sin(time * 1.5) * 16 : 0);
      const shiftR = isDivergent ? Math.sin(time * 1.5) * 16 : (isConvergent ? -Math.sin(time * 1.5) * 16 : 0);

      // Draw Plate A Block
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;

      const plateAW = centerX - 45;
      const plateAX = 20 + shiftL;
      ctx.fillRect(plateAX, groundY - 30, plateAW, 45);
      ctx.strokeRect(plateAX, groundY - 30, plateAW, 45);

      ctx.fillStyle = '#1E293B';
      ctx.fillRect(plateAX, groundY - 30, plateAW, 10);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('PLATE A (Oceanic)', plateAX + 15, groundY - 6);

      // Draw Plate B Block
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(30, 22, 60, 0.95)';
      ctx.strokeStyle = '#A855F7';

      const plateBW = centerX - 45;
      const plateBX = centerX + 25 + shiftR;
      ctx.fillRect(plateBX, groundY - 30, plateBW, 45);
      ctx.strokeRect(plateBX, groundY - 30, plateBX, 45);

      ctx.fillStyle = '#3B0764';
      ctx.fillRect(plateBX, groundY - 30, plateBW, 10);
      ctx.fillStyle = '#C084FC';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('PLATE B (Continental)', plateBX + 15, groundY - 6);

      // Mountain Uplift if Convergent
      if (isConvergent) {
        ctx.fillStyle = '#94A3B8';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(centerX - 30, groundY - 30);
        ctx.lineTo(centerX, groundY - 70 - Math.abs(shiftL) * 1.5);
        ctx.lineTo(centerX + 30, groundY - 30);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#F1F5F9';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Directional Velocity Vectors
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 10;

      if (isDivergent) {
        ctx.fillText('← RIFT', plateAX + plateAW / 2 - 25, groundY + 30);
        ctx.fillText('RIFT →', plateBX + 20, groundY + 30);
      } else if (isConvergent) {
        ctx.fillText('DRIFT →', plateAX + plateAW / 2 - 25, groundY + 30);
        ctx.fillText('← DRIFT', plateBX + 20, groundY + 30);
      }

      // Rising Magma Sparks
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < groundY - 30) {
          p.y = h - 10;
          p.x = centerX + (Math.random() - 0.5) * 60;
        }

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 12. Global Climate Greenhouse Heat Trap Canvas
  startClimateCanvas(canvasId) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const groundY = h - 30;

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(w, 40); ctx.stroke();

      for (let i = 0; i < 25; i++) {
        const px = (i * 25 + time * 30) % w;
        const py = 45 + Math.sin(time * 3 + i) * 35;
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      }

      ctx.fillStyle = '#10B981';
      ctx.fillRect(0, groundY, w, 30);

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 13. Global ENSO Trade Winds Canvas
  startEnsoCanvas(canvasId, mode) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;
    const isElNino = mode === 'elnino';

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const centerY = h / 2;

      const poolX = isElNino ? w * 0.6 : w * 0.2;
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.ellipse(poolX, centerY + 20, 75, 25, 0, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 12;

      const dir = isElNino ? 1 : -1;
      for (let i = 0; i < 4; i++) {
        const wx = (i * 80 + time * 60 * dir) % w;
        ctx.beginPath(); ctx.moveTo(wx, centerY - 25); ctx.lineTo(wx + 25 * dir, centerY - 25); ctx.stroke();
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  },

  // 14. Sustainability Smart Eco-City & Waste Canvas
  startSustainabilityCanvas(canvasId) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup) return;
    const { ctx, w, h } = setup;

    let time = 0;

    const loop = () => {
      time += 0.04;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const groundY = h - 25;

      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 15;
      ctx.fillRect(30, groundY - 50, 40, 50);
      ctx.fillRect(85, groundY - 70, 50, 70);

      for (let i = 0; i < 20; i++) {
        const px = (i * 20 + time * 25) % w;
        const py = groundY - 20 - (Math.sin(time + i) * 35);
        ctx.fillStyle = '#34D399';
        ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
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
          <p class="exp-instruction">Tap both items to select them, then tap <b>Combine Reactants</b>:</p>

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

          <button class="sci-fi-btn combine-action-btn ${canCombine ? 'ready' : 'disabled'}"
                  ${canCombine ? 'onclick="Experiment.combineItems()"' : 'disabled'} style="width:100%;">
            Combine Reactants ${canCombine ? '✨' : '🔒'}
          </button>
        </div>
      `;
    } else {
      // 10x Cooler Interactive Canvas & Sci-Fi Telemetry Dashboard Result
      html += `
        <div class="exp-result-container ${isChemical ? 'chemical-result' : 'physical-result'}">
          <div class="exp-canvas-box-wrapper">
            <div class="exp-hud-bar">
              <span class="exp-hud-title">⚡ REAL-TIME ${isChemical ? 'CHEMICAL' : 'PHYSICAL'} SIMULATOR</span>
              <span class="exp-hud-status active">● SIMULATING</span>
            </div>
            <canvas id="canvasPhysChem" class="exp-sim-canvas"></canvas>
          </div>

          <div class="telemetry-grid">
            <div class="telemetry-card">
              <div class="telemetry-icon">${isChemical ? '🫧' : '💧'}</div>
              <div class="telemetry-label">${isChemical ? 'Gas Produced' : 'Phase State'}</div>
              <div class="telemetry-value">${isChemical ? '350' : 'Liquid'}</div>
              <div class="telemetry-unit">${isChemical ? 'mL CO₂' : 'H₂O Fluid'}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 85%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">🌡️</div>
              <div class="telemetry-label">Temperature</div>
              <div class="telemetry-value">${isChemical ? '34.2' : '45.0'}</div>
              <div class="telemetry-unit">°C</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isChemical ? 45 : 70}%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">🧬</div>
              <div class="telemetry-label">Substance ID</div>
              <div class="telemetry-value">${isChemical ? 'NEW' : 'SAME'}</div>
              <div class="telemetry-unit">${isChemical ? 'NaC₂H₃O₂ + CO₂' : 'H₂O Molecules'}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
            </div>
          </div>

          <div class="result-badge ${isChemical ? 'chemical' : 'physical'}">
            ${isChemical ? '⚗️ Chemical Change: New Substances Formed' : '🧊 Physical Change: State Shift Only'}
          </div>

          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>${isChemical ? 'Baking soda (NaHCO₃) and vinegar (CH₃COOH) reacted to form carbon dioxide gas (CO₂), water, and sodium acetate.' : 'Thermal heat transfer melted solid ice crystals into liquid water molecules.'}</p>
            </div>
            <div class="exp-key-idea-box ${isChemical ? 'chemical-key' : 'physical-key'}">
              💡 <b>Key Idea:</b> ${isChemical ? 'Chemical Change = Atomic bonds break and reform new substances.' : 'Physical Change = Reversible phase or shape change without altering chemical formula.'}
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Simulator
          </button>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    if (this.isCombined) {
      setTimeout(() => this.startPhysicalVsChemicalCanvas('canvasPhysChem', isChemical), 40);
    }
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
      // 10x Cooler Canvas & Sci-Fi Telemetry Dashboard Result
      html += `
        <div class="exp-result-container chemical-result">
          <div class="exp-canvas-box-wrapper">
            <div class="exp-hud-bar">
              <span class="exp-hud-title">🧪 OXIDATION & REACTION SIMULATOR</span>
              <span class="exp-hud-status active">● REACTION ACTIVE</span>
            </div>
            <canvas id="canvasChemReact" class="exp-sim-canvas"></canvas>
          </div>

          <div class="telemetry-grid">
            <div class="telemetry-card">
              <div class="telemetry-icon">${isIron ? '🔩' : '🍎'}</div>
              <div class="telemetry-label">${isIron ? 'Oxide Layer' : 'Browning'}</div>
              <div class="telemetry-value">${isIron ? '2.8' : '75%'}</div>
              <div class="telemetry-unit">${isIron ? 'mm Fe₂O₃' : 'Melanin Index'}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 75%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">💨</div>
              <div class="telemetry-label">O₂ Absorbed</div>
              <div class="telemetry-value">${isIron ? '180' : '35'}</div>
              <div class="telemetry-unit">${isIron ? 'mL O₂ Gas' : 'µL O₂ Gas'}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 85%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">🧪</div>
              <div class="telemetry-label">Reaction State</div>
              <div class="telemetry-value">NEW</div>
              <div class="telemetry-unit">${isIron ? 'Iron Oxide' : 'Polyphenol Oxide'}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
            </div>
          </div>

          <div class="result-badge chemical">
            ${isIron ? '🔩 Chemical Reaction • Rust (Fe₂O₃ Iron Oxide Formed)' : '🍎 Chemical Reaction • Enzymatic Browning Compounds Formed'}
          </div>

          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>${isIron ? 'Iron atoms reacted chemically with atmospheric oxygen in the presence of water to form iron oxide rust.' : 'Enzymes (polyphenol oxidase) in the cut apple tissue catalyzed oxidation reactions with oxygen, producing brown pigment compounds.'}</p>
            </div>
            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Chemical reaction = reactant bonds rearrange into new chemical substances with distinct properties.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Simulator
          </button>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    if (this.isCombined) {
      setTimeout(() => this.startChemicalReactionsCanvas('canvasChemReact', isIron), 40);
    }
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
      // 10x Cooler Canvas & Sci-Fi Telemetry Dashboard Result
      const isAcid = mode === 'blue_litmus';
      const isBase = mode === 'red_litmus';
      const isNeut = mode === 'neutralization';

      html += `
        <div class="exp-result-container chemical-result">
          <div class="exp-canvas-box-wrapper">
            <div class="exp-hud-bar">
              <span class="exp-hud-title">🧪 pH & LITMUS INDICATOR SIMULATOR</span>
              <span class="exp-hud-status active">● REACTION ACTIVE</span>
            </div>
            <canvas id="canvasAcidsBases" class="exp-sim-canvas"></canvas>
          </div>

          <div class="telemetry-grid">
            <div class="telemetry-card">
              <div class="telemetry-icon">🧪</div>
              <div class="telemetry-label">pH Scale</div>
              <div class="telemetry-value">${isAcid ? '2.5' : (isBase ? '11.8' : '7.0')}</div>
              <div class="telemetry-unit">${isAcid ? 'Strong Acid' : (isBase ? 'Strong Base' : 'Neutral pH')}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${(isAcid ? 25 : (isBase ? 85 : 50))}%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">🔬</div>
              <div class="telemetry-label">Primary Ion</div>
              <div class="telemetry-value">${isAcid ? 'H⁺' : (isBase ? 'OH⁻' : 'H₂O')}</div>
              <div class="telemetry-unit">${isAcid ? 'Hydronium' : (isBase ? 'Hydroxide' : 'Pure Water')}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 90%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">🎨</div>
              <div class="telemetry-label">Litmus State</div>
              <div class="telemetry-value">${isAcid ? '🔴 RED' : (isBase ? '🔵 BLUE' : '🟢 SALT')}</div>
              <div class="telemetry-unit">${isAcid ? 'Acid Shift' : (isBase ? 'Base Shift' : 'NaCl + H₂O')}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
            </div>
          </div>

          <div class="result-badge chemical">
            ${isAcid ? '🔴 Blue Litmus Turned Red (Acidic pH < 7)' : (isBase ? '🔵 Red Litmus Turned Blue (Basic pH > 7)' : '✨ Neutralization Complete (H⁺ + OH⁻ ➔ H₂O + Salt)')}
          </div>

          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>${isAcid ? 'The acidic solution ($H^+$ ion concentration) transformed the blue litmus pigment into crimson red.' : (isBase ? 'The basic solution ($OH^-$ ion concentration) transformed the red litmus pigment into deep royal blue.' : 'Combining an acid ($H^+$) and a base ($OH^-$) produced neutral water ($H_2O$) and dissolved salt ($NaCl$).')}</p>
            </div>
            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Indicators change color according to $H^+$ and $OH^-$ concentration levels.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
            🔄 Reset Simulator
          </button>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    if (this.isCombined) {
      setTimeout(() => this.startAcidsBasesCanvas('canvasAcidsBases', mode), 40);
    }
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
      // 10x Cooler Canvas & Sci-Fi Telemetry Dashboard Result
      const eqFormula = isH2O ? '2H₂ + O₂ → 2H₂O' : '2Na + Cl₂ → 2NaCl';

      html += `
        <div class="exp-result-container chemical-result">
          <div class="exp-canvas-box-wrapper">
            <div class="exp-hud-bar">
              <span class="exp-hud-title">⚡ ATOMIC FUSION SIMULATOR</span>
              <span class="exp-hud-status active">● FUSION ACTIVE</span>
            </div>
            <canvas id="canvasChemEq" class="exp-sim-canvas"></canvas>
          </div>

          <div class="telemetry-grid">
            <div class="telemetry-card">
              <div class="telemetry-icon">⚛️</div>
              <div class="telemetry-label">Reactants</div>
              <div class="telemetry-value">6</div>
              <div class="telemetry-unit">${isH2O ? '4 H + 2 O' : '2 Na + 2 Cl'}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">💧</div>
              <div class="telemetry-label">Products</div>
              <div class="telemetry-value">6</div>
              <div class="telemetry-unit">${isH2O ? '2 H₂O Molecules' : '2 NaCl Crystals'}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">⚖️</div>
              <div class="telemetry-label">Mass Conservation</div>
              <div class="telemetry-value">100%</div>
              <div class="telemetry-unit">Perfect Balance</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
            </div>
          </div>

          <div class="eq-main-banner">
            <div class="eq-banner-title">⚗️ BALANCED CHEMICAL EQUATION</div>
            <div class="eq-equation-display">${eqFormula}</div>
          </div>

          <div class="exp-explanation-section">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>${isH2O ? 'Covalent bonding fused hydrogen and oxygen atoms into water molecules ($2H_2 + O_2 \\rightarrow 2H_2O$).' : 'Ionic bonding transferred electrons between sodium and chlorine to form sodium chloride salt ($2Na + Cl_2 \\rightarrow 2NaCl$).'}</p>
            </div>
            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Matter is neither created nor destroyed in a chemical reaction—atoms are simply rearranged.
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
            <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetActivity()">
              🔄 Reset Simulator
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

    if (this.isCombined) {
      setTimeout(() => this.startChemicalEquationsCanvas('canvasChemEq', isH2O), 40);
    }
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
          <div class="exp-canvas-box-wrapper">
            <div class="exp-hud-bar">
              <span class="exp-hud-title">⚖️ STOICHIOMETRY SCALE BALANCE SIMULATOR</span>
              <span class="exp-hud-status active">● LIVE BALANCE</span>
            </div>
            <canvas id="canvasBalancing" class="exp-sim-canvas"></canvas>
          </div>

          <div class="telemetry-grid">
            <div class="telemetry-card">
              <div class="telemetry-icon">⚛️</div>
              <div class="telemetry-label">Left Pan (Reactants)</div>
              <div class="telemetry-value">${isGuided ? 2 * c1Val + 2 * c2Val : 1 * c1Val + 2 * c2Val}</div>
              <div class="telemetry-unit">Atoms</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 75%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">🧪</div>
              <div class="telemetry-label">Right Pan (Products)</div>
              <div class="telemetry-value">${isGuided ? 3 * c3Val : 2 * c3Val}</div>
              <div class="telemetry-unit">Atoms</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 75%;"></div></div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-icon">⚖️</div>
              <div class="telemetry-label">Fulcrum State</div>
              <div class="telemetry-value">${isBalanced ? 'LEVEL' : 'TILTED'}</div>
              <div class="telemetry-unit">${isBalanced ? '100% Balanced' : 'Unbalanced'}</div>
              <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isBalanced ? 100 : 40}%;"></div></div>
            </div>
          </div>

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
            <div class="toast-banner" style="background:rgba(16, 185, 129, 0.25); border-color:rgba(16, 185, 129, 0.4); color:#67E8F9; margin-top:10px; font-size:1.1rem; padding:12px;">
              🎉 <b>CORRECT!</b> Chemical equation balanced perfectly!
            </div>
          ` : `
            <div class="toast-banner" style="background:rgba(245, 158, 11, 0.2); border-color:rgba(245, 158, 11, 0.4); color:#FDE047; margin-top:10px;">
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
              <div style="font-weight:700; color:#38BDF8; font-size:0.95rem; margin-bottom:6px;">
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
          <p style="margin:0; font-size:0.84rem; color:#E9D5FF; line-height:1.4;">
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
    setTimeout(() => this.startBalancingCanvas('canvasBalancing', c1Val, c2Val, c3Val), 40);
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🧪 KINETIC MOLECULAR COLLISION SIMULATOR</span>
                <span class="exp-hud-status active">● REACTION ACTIVE</span>
              </div>
              <canvas id="canvasRates" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">⚡</div>
                <div class="telemetry-label">Collision Rate</div>
                <div class="telemetry-value">${isWithout ? '120' : '480'}</div>
                <div class="telemetry-unit">collisions / sec</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isWithout ? 30 : 95}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">⛰️</div>
                <div class="telemetry-label">Activation Energy (Ea)</div>
                <div class="telemetry-value">${isWithout ? '75.0' : '28.4'}</div>
                <div class="telemetry-unit">kJ / mol ${isWithout ? 'HIGH' : '⚡ LOW'}</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isWithout ? 85 : 30}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">⏱️</div>
                <div class="telemetry-label">Reaction Speed</div>
                <div class="telemetry-value">${isWithout ? 'SLOW' : 'FAST'}</div>
                <div class="telemetry-unit">${isWithout ? 'Standard Pathway' : 'Catalyzed Pathway'}</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isWithout ? 25 : 100}%;"></div></div>
              </div>
            </div>

            <div class="result-badge ${isWithout ? 'slow' : 'faster'}">
              ${isWithout ? '🐢 Slow Reaction Rate (Higher Activation Barrier)' : '⚡ Accelerated Reaction Rate (Catalytic Lowered Ea Pathway)'}
            </div>
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

            <div class="exp-info-panel">
              <div class="exp-info-item">
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
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startRatesCanvas('canvasRates', 'high', !isWithout), 40);
      }
    } else if (mode === 'inhibitor') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🧪 EXPERIMENT 2 — Inhibitor: Hydrogen Peroxide + Inhibitor</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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

            <div class="exp-key-idea-box chemical-key">
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

          <div class="exp-explain-block">
            <h5 style="color:#6D28D9; font-size:1.1rem;">⚡ Catalysts vs. Inhibitors</h5>
            <table class="comparison-table" style="margin-top:10px;">
              <thead>
                <tr>
                  <th>Aspect</th>
                  <th style="color:#34D399;">🟢 Catalyst</th>
                  <th style="color:#FCA5A5;">🔴 Inhibitor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight:700; color:#38BDF8;">Effect on Rate</td>
                  <td>Increases reaction rate</td>
                  <td>Decreases reaction rate</td>
                </tr>
                <tr>
                  <td style="font-weight:700; color:#38BDF8;">How it works</td>
                  <td>Lowers activation energy</td>
                  <td>Blocks active sites / slows reaction step</td>
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
            <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="background:rgba(30, 22, 60, 0.9); border:1px solid rgba(139, 92, 246, 0.35); border-radius:12px; padding:10px 14px;">
                <div style="font-weight:800; color:#34D399; font-size:0.9rem;">🟢 Catalyst Definition</div>
                <span style="font-size:0.86rem; color:#E9D5FF;">A substance that increases the rate of a chemical reaction by providing an alternative pathway with lower activation energy, without being consumed overall.</span>
              </div>
              <div style="background:rgba(30, 22, 60, 0.9); border:1px solid rgba(139, 92, 246, 0.35); border-radius:12px; padding:10px 14px;">
                <div style="font-weight:800; color:#FCA5A5; font-size:0.9rem;">🔴 Inhibitor Definition</div>
                <span style="font-size:0.86rem; color:#E9D5FF;">A substance that decreases the rate of a chemical reaction by interfering with the reaction process.</span>
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🫀 HOMEOSTASIS ECG PULSE MONITOR</span>
                <span class="exp-hud-status active">● REAL-TIME ECG</span>
              </div>
              <canvas id="canvasHomeostasis" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">💓</div>
                <div class="telemetry-label">Heart Rate</div>
                <div class="telemetry-value">${isHot ? '110' : '65'}</div>
                <div class="telemetry-unit">BPM</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isHot ? 80 : 45}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🌡️</div>
                <div class="telemetry-label">Core Temp</div>
                <div class="telemetry-value">${isHot ? '38.1' : '35.8'}</div>
                <div class="telemetry-unit">°C</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isHot ? 75 : 35}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🩸</div>
                <div class="telemetry-label">Vasodilation</div>
                <div class="telemetry-value">${isHot ? 'WIDENED' : 'NARROWED'}</div>
                <div class="telemetry-unit">${isHot ? 'Sweat Active' : 'Shivering Active'}</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained">
              ✅ HOMEOSTASIS MAINTAINED (Negative Feedback Loop Active)
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
        setTimeout(() => this.startHomeostasisCanvas('canvasHomeostasis', mode, cond), 40);
      }
    } else if (mode === 'glucose') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🍬 EXPERIMENT 2 — Blood Glucose Regulation</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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

            <div class="exp-key-idea-box chemical-key">
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

          <div class="exp-explain-block">
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

            <div class="exp-explain-block">
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🦋 NATURAL SELECTION MOTH SIMULATOR</span>
                <span class="exp-hud-status active">● GENERATION ${gen} ACTIVE</span>
              </div>
              <canvas id="canvasEvolution" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🧬</div>
                <div class="telemetry-label">Generation</div>
                <div class="telemetry-value">Gen ${gen}</div>
                <div class="telemetry-unit">Step ${gen} of 3</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${(gen/3)*100}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🟢</div>
                <div class="telemetry-label">Light Phenotype</div>
                <div class="telemetry-value">${greenCount * 10}%</div>
                <div class="telemetry-unit">${greenCount} Insects</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${greenCount * 10}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🟤</div>
                <div class="telemetry-label">Dark Phenotype</div>
                <div class="telemetry-value">${brownCount * 10}%</div>
                <div class="telemetry-unit">${brownCount} Insects</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${brownCount * 10}%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);">
              🧬 NATURAL SELECTION SHIFT: ${isGreenEnv ? 'Light Allele Frequency Dominance' : 'Dark Allele Frequency Dominance'}
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
        setTimeout(() => this.startEvolutionCanvas('canvasEvolution', env, gen), 40);
      }
    } else if (mode === 'resistance') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🦠 EXPERIMENT 2 — Antibiotic Resistance</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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

            <div class="exp-info-panel">
              <div class="exp-info-item">
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">📈 ECOLOGICAL LOGISTIC S-CURVE SIMULATOR</span>
                <span class="exp-hud-status active">● POPULATION MONITORING</span>
              </div>
              <canvas id="canvasCarrying" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🐇</div>
                <div class="telemetry-label">Population (N)</div>
                <div class="telemetry-value">98</div>
                <div class="telemetry-unit">Organisms</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 98%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">📏</div>
                <div class="telemetry-label">Capacity (K)</div>
                <div class="telemetry-value">100</div>
                <div class="telemetry-unit">Max Capacity</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🌱</div>
                <div class="telemetry-label">Growth Stage</div>
                <div class="telemetry-value">STABLE</div>
                <div class="telemetry-unit">N ≈ K Equilibrium</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 98%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained">
              📈 POPULATION EQUILIBRIUM ACHIEVED (N ≈ K = 100 Organisms)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Initial exponential growth ($dN/dt = rN$) slowed down as population density approached carrying capacity limit ($K = 100$), stabilizing at logistic equilibrium.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Environmental resistance (food, water, space) restricts indefinite exponential population growth.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetCarryingCapacityActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startCarryingCapacityCanvas('canvasCarrying'), 40);
      }
    } else if (mode === 'capacity') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌱 EXPERIMENT 2 — Changing Carrying Capacity</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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

          <div class="exp-explain-block">
            <h5 style="color:#FFFFFF;">Population Growth</h5>
            <p>A population increases when births and immigration exceed deaths and emigration.</p>

            <h5 style="color:#6D28D9; margin-top:10px;">Carrying Capacity</h5>
            <p>The maximum population size an environment can sustainably support.</p>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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

            <div class="exp-info-panel">
              <div class="exp-info-item">
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🧬 RECOMBINANT DNA GENE SCANNER</span>
                <span class="exp-hud-status active">● SPLICING COMPLETE</span>
              </div>
              <canvas id="canvasBiotech" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🧬</div>
                <div class="telemetry-label">Insulin Gene</div>
                <div class="telemetry-value">SPLICED</div>
                <div class="telemetry-unit">Target Sequence</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🦠</div>
                <div class="telemetry-label">Plasmid Host</div>
                <div class="telemetry-value">E. coli</div>
                <div class="telemetry-unit">Bacterial Vector</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 90%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">💉</div>
                <div class="telemetry-label">Protein Yield</div>
                <div class="telemetry-value">98.5%</div>
                <div class="telemetry-unit">Human Insulin</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 98%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              🧬 RECOMBINANT DNA CREATED (Bacterial Plasmid Expression Active)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Restriction enzymes cut plasmid DNA, allowing insertion of the human insulin gene. Transformed bacterial host cells now express bio-synthetic insulin.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Recombinant DNA technology enables bio-reactors to synthesize essential therapeutic proteins.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetBiotechActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startBiotechCanvas('canvasBiotech'), 40);
      }
    } else {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Biotechnology Panel</div>

          <div class="exp-explain-block">
            <h5 style="color:#FFFFFF;">Biotechnology</h5>
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
              <b>Goal:</b> Demonstrate what happens when two tectonic plates move away from each other.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="exp-result-container chemical-result">
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🌋 DIVERGENT RIFT STANDBY MONITOR</span>
                <span class="exp-hud-status active">● RIFT STANDBY</span>
              </div>
              <canvas id="canvasTectonics" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🌍</div>
                <div class="telemetry-label">Plate Drift</div>
                <div class="telemetry-value">← RIFT →</div>
                <div class="telemetry-unit">Separating</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 50%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🌋</div>
                <div class="telemetry-label">Mantle Temp</div>
                <div class="telemetry-value">1200</div>
                <div class="telemetry-unit">°C Molten Basalt</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 85%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">⚡</div>
                <div class="telemetry-label">Seismic Activity</div>
                <div class="telemetry-value">READY</div>
                <div class="telemetry-unit">Fault Standby</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 40%;"></div></div>
              </div>
            </div>

            <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startTectonicsSimulation()">
              🌋 [ INITIATE DIVERGENT RIFT ]
            </button>
          </div>
        </div>
        `;
        setTimeout(() => this.startTectonicsCanvas('canvasTectonics', mode), 40);
      } else {
        html += `
          <div class="exp-result-container chemical-result">
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🌋 DIVERGENT FAULT SEPARATION ACTIVE</span>
                <span class="exp-hud-status active">● MAGMA UPRIFT ACTIVE</span>
              </div>
              <canvas id="canvasTectonics" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🌍</div>
                <div class="telemetry-label">Plate Velocity</div>
                <div class="telemetry-value">4.2</div>
                <div class="telemetry-unit">cm / year</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 75%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🌋</div>
                <div class="telemetry-label">Magma Temp</div>
                <div class="telemetry-value">1280</div>
                <div class="telemetry-unit">°C Molten Basalt</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 98%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">⛰️</div>
                <div class="telemetry-label">Crust Age</div>
                <div class="telemetry-value">NEW</div>
                <div class="telemetry-unit">Mid-Ocean Ridge</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);">
              🌋 DIVERGENT FAULT SEPARATION: New Oceanic Crust Forming via Magma Upwelling
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Tectonic plates pull apart at divergent boundaries. Decompression melting pushes mantle magma upward, cooling into new basaltic ocean floor crust.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Divergent rift valleys and mid-ocean ridges continuously produce new lithosphere crust.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetTectonicsActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startTectonicsCanvas('canvasTectonics', mode), 40);
      }
    } else if (mode === 'convergent') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🏔️ EXPERIMENT 2 — Convergent Plate Boundary</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
              <b>Goal:</b> Demonstrate what happens when two tectonic plates collide.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="exp-result-container physical-result">
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🏔️ CONVERGENT COLLISION MONITOR</span>
                <span class="exp-hud-status active">● COLLISION STANDBY</span>
              </div>
              <canvas id="canvasTectonics" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🌍</div>
                <div class="telemetry-label">Plate Vector</div>
                <div class="telemetry-value">→ DRIFT ←</div>
                <div class="telemetry-unit">Colliding</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 50%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🏔️</div>
                <div class="telemetry-label">Uplift Potential</div>
                <div class="telemetry-value">HIGH</div>
                <div class="telemetry-unit">Orogeny Pre-Collision</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 80%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">⚡</div>
                <div class="telemetry-label">Seismic Index</div>
                <div class="telemetry-value">NORMAL</div>
                <div class="telemetry-unit">Subduction Standby</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 40%;"></div></div>
              </div>
            </div>

            <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startTectonicsSimulation()">
              🏔️ [ INITIATE PLATE COLLISION ]
            </button>
          </div>
        </div>
        `;
        setTimeout(() => this.startTectonicsCanvas('canvasTectonics', mode), 40);
      } else {
        html += `
          <div class="exp-result-container physical-result">
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🏔️ CONVERGENT MOUNTAIN UPLIFT & SUBDUCTION</span>
                <span class="exp-hud-status active">● COLLISION ACTIVE</span>
              </div>
              <canvas id="canvasTectonics" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🌍</div>
                <div class="telemetry-label">Collision Force</div>
                <div class="telemetry-value">9.8</div>
                <div class="telemetry-unit">GigaPascals</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 95%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🏔️</div>
                <div class="telemetry-label">Mountain Height</div>
                <div class="telemetry-value">6,800</div>
                <div class="telemetry-unit">Meters Uplift</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 88%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">⚡</div>
                <div class="telemetry-label">Subduction Depth</div>
                <div class="telemetry-value">140</div>
                <div class="telemetry-unit">km Trench</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 90%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #0284C7 0%, #0369A1 100%);">
              🏔️ CONVERGENT BOUNDARY: Crust Buckling & Subduction Trench Active
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>At a convergent boundary, tectonic plates collide. Crustal buckling forces land upward into mountain ranges, while subduction plunges denser lithosphere into deep mantle trenches.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Plate collisions generate mountain ranges, volcanic island arcs, and deep subduction zones.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetTectonicsActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startTectonicsCanvas('canvasTectonics', mode), 40);
      }
    } else {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Plate Tectonics Panel</div>

          <div class="exp-explain-block">
            <h5 style="color:#FFFFFF;">Plate Tectonics</h5>
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🌍 ATMOSPHERIC GREENHOUSE HEAT TRAP SIMULATOR</span>
                <span class="exp-hud-status active">● INFRARED RETENTION</span>
              </div>
              <canvas id="canvasClimate" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🌡️</div>
                <div class="telemetry-label">Global Anomaly</div>
                <div class="telemetry-value">+1.4</div>
                <div class="telemetry-unit">°C Warming</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 75%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">💨</div>
                <div class="telemetry-label">CO₂ Concentration</div>
                <div class="telemetry-value">422</div>
                <div class="telemetry-unit">PPM Atmosphere</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 85%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🔥</div>
                <div class="telemetry-label">Radiative Forcing</div>
                <div class="telemetry-value">2.8</div>
                <div class="telemetry-unit">W / m² Trapped Heat</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 80%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);">
              🌡️ GREENHOUSE THERMAL TRAP: Infrared Radiative Re-emission Active
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Shortwave solar radiation enters Earth's atmosphere. The ground absorbs and re-radiates it as longwave thermal infrared heat, which is trapped by atmospheric $CO_2$ and $CH_4$ gas molecules.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Higher greenhouse gas concentrations decrease Earth's thermal energy escape rate, elevating global temperatures.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetClimateActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startClimateCanvas('canvasClimate'), 40);
      }
    } else if (mode === 'ocean') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌊 EXPERIMENT 2 — Ocean and Climate</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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

          <div class="exp-explain-block">
            <h5 style="color:#FFFFFF;">Factors Affecting Climate</h5>
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🔥 EL NIÑO OCEAN-ATMOSPHERE SIMULATOR</span>
                <span class="exp-hud-status active">● WARMEST POOL SHIFT</span>
              </div>
              <canvas id="canvasEnso" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">💨</div>
                <div class="telemetry-label">Trade Winds</div>
                <div class="telemetry-value">WEAK</div>
                <div class="telemetry-unit">Slackened Vector</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 25%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🌊</div>
                <div class="telemetry-label">Pacific SST</div>
                <div class="telemetry-value">+2.8</div>
                <div class="telemetry-unit">°C Anomaly East</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 90%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🌧️</div>
                <div class="telemetry-label">Precipitation</div>
                <div class="telemetry-value">EAST SHIFT</div>
                <div class="telemetry-unit">Walker Cell Displaced</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);">
              🔥 EL NIÑO OSCILLATION: Warm Surface Waters Shifted Eastward
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Slackening trade winds allow warm western Pacific surface waters to slosh eastward, suppressing deep nutrient upwelling and altering global jet stream storm tracks.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> ENSO demonstrates tight coupling between ocean surface thermal patterns and global atmospheric pressure systems.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetEnsoActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startEnsoCanvas('canvasEnso', mode), 40);
      }
    } else if (mode === 'lanina') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌊 EXPERIMENT 2 — La Niña</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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

          <div class="exp-explain-block">
            <h5 style="color:#FFFFFF;">El Niño–Southern Oscillation (ENSO)</h5>
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div style="background: rgba(30, 27, 75, 0.4); border: 1.5px solid #231648; border-radius: 18px; padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);">
              <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 8px; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">${item.name}</div>
              <div class="waste-bin-group">
                <button class="waste-bin-btn bio ${sel === 'bio' ? 'active' : ''}" onclick="Experiment.selectWasteBin('${item.id}', 'bio')">🟢 Bio</button>
                <button class="waste-bin-btn rec ${sel === 'rec' ? 'active' : ''}" onclick="Experiment.selectWasteBin('${item.id}', 'rec')">🔵 Recyclable</button>
                <button class="waste-bin-btn res ${sel === 'res' ? 'active' : ''}" onclick="Experiment.selectWasteBin('${item.id}', 'res')">⚫ Residual</button>
              </div>
            </div>
          `;
        }).join('');

        html += `
          <div style="margin: 10px 0;">
            <div style="font-size: 0.88rem; font-weight: 800; color: #E0E7FF; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">🍃 Select a bin for each household waste item:</div>
            ${itemsHtml}
          </div>

          <button class="primary-btn start-reaction-btn ready" style="background: linear-gradient(135deg, #7C3AED 0%, #6366F1 100%); color: #FFFFFF; border: none; padding: 14px; border-radius: 18px; font-size: 1.05rem; font-weight: 800; cursor: pointer; width: 100%; box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45); margin-top: 10px; transition: all 0.2s;" onclick="Experiment.startSustainabilitySimulation()">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">♻️ SMART ECO-CITY WASTE RECYCLING SIMULATOR</span>
                <span class="exp-hud-status active">● DIVERSION MONITOR</span>
              </div>
              <canvas id="canvasSust" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">♻️</div>
                <div class="telemetry-label">Landfill Diverted</div>
                <div class="telemetry-value">${divertPercentage}%</div>
                <div class="telemetry-unit">Segregated Material</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${divertPercentage}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🌱</div>
                <div class="telemetry-label">Compost & Recycled</div>
                <div class="telemetry-value">${correctCount} / ${items.length}</div>
                <div class="telemetry-unit">Bins Correct</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${(correctCount/items.length)*100}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🏙️</div>
                <div class="telemetry-label">Carbon Offset</div>
                <div class="telemetry-value">-4.5</div>
                <div class="telemetry-unit">kg CO₂ Saved</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 85%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); font-weight: 800; font-size: 0.9rem; padding: 10px 18px; border-radius: 16px;">
              ♻️ SUSTAINABLE ECO-CITY WASTE RECOVERY COMPLETE
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top: 14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>Municipal source-segregation prevents recyclables and organic compost from entering methane-emitting landfill sites.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Circular economy = Reduce ➔ Reuse ➔ Recycle ➔ Compost.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetSustainabilityActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startSustainabilityCanvas('canvasSust'), 40);
      }
    } else if (mode === 'energy') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title" style="font-family: var(--font-heading); color: #FFFFFF; font-size: 1.25rem; font-weight: 800; margin-bottom: 14px; text-align: center;">⚡ EXPERIMENT 2 — Household Energy Conservation</div>
          <div class="exp-explain-block" style="background: rgba(30, 27, 75, 0.5); border: 1.5px solid #312E81; border-left: 5px solid #8B5CF6; border-radius: 18px; padding: 16px; margin-bottom: 14px;">
            <p style="font-size: 0.88rem; color: #F3E8FF; font-weight: 600; line-height: 1.5;">
              <b style="color: #C084FC;">Goal:</b> Demonstrate how small changes in household energy use can reduce electricity consumption and environmental impact.
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
          <div style="margin: 10px 0;">
            <div class="homeo-temp-display" style="margin-bottom: 14px; font-size: 1.05rem; background: rgba(30, 27, 75, 0.5); border: 1.5px solid #1E40AF; border-radius: 16px; color: #38BDF8; font-weight: 800; padding: 12px 16px; display: flex; align-items: center; gap: 8px;">
              ⚡ Current Daily Energy Use: <span style="color: #38BDF8; font-weight: 900;">${kwh} kWh</span>
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
              <button class="toggle-switch-btn ${!sw.unplug ? 'plugged' : 'off'}" onclick="Experiment.toggleEnergySwitch('unplug')">
                ${!sw.unplug ? 'PLUGGED' : 'UNPLUGGED'}
              </button>
            </div>
          </div>

          <button class="primary-btn start-reaction-btn ready" style="background: linear-gradient(135deg, #7C3AED 0%, #6366F1 100%); color: #FFFFFF; border: none; padding: 14px; border-radius: 18px; font-size: 1.05rem; font-weight: 800; cursor: pointer; width: 100%; box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45); margin-top: 14px; transition: all 0.2s;" onclick="Experiment.startSustainabilitySimulation()">
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
              <div class="exp-info-panel" style="border-left-color:#EF4444; margin-bottom:10px;">
                <div class="exp-info-item" style="color:#FCA5A5;">
                  ⚠️ <b>Still Wasting Energy:</b> Total energy is <b>${kwh} kWh</b>, which is above 4 kWh. The household is still wasting energy and didn't save enough energy! Turn off AC, lights, or unplug unused devices to reduce energy use to 4 kWh or below.
                </div>
              </div>
            ` : `
              <div class="exp-info-panel" style="border-left-color:#10B981; margin-bottom:10px;">
                <div class="exp-info-item" style="color:#A7F3D0;">
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

          <div class="exp-explain-block">
            <h5 style="color:#FFFFFF;">🌍 What Is Sustainability?</h5>
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
        let currentRange = rangeMap[angle] || 100;
        let rad = angle * Math.PI / 180;
        let maxH = Math.round(((35 * Math.sin(rad)) ** 2) / (2 * 9.81));
        let tFlight = (2 * 35 * Math.sin(rad) / 9.81).toFixed(1);

        html += `
          <div class="exp-result-container physical-result">
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">🏹 PHYSICS PROJECTILE SIMULATOR</span>
                <span class="exp-hud-status active">● TRAJECTORY ACTIVE</span>
              </div>
              <canvas id="canvasProjectile" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">📏</div>
                <div class="telemetry-label">Range (R)</div>
                <div class="telemetry-value">${currentRange}</div>
                <div class="telemetry-unit">Meters ${angle === 45 ? '🎯 MAX' : ''}</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${(currentRange/100)*100}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">📐</div>
                <div class="telemetry-label">Max Height (H)</div>
                <div class="telemetry-value">${maxH}</div>
                <div class="telemetry-unit">Meters</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${Math.min(100, (maxH/35)*100)}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">⏱️</div>
                <div class="telemetry-label">Flight Time</div>
                <div class="telemetry-value">${tFlight}</div>
                <div class="telemetry-unit">Seconds</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${Math.min(100, (tFlight/7)*100)}%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:${angle === 45 ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'};">
              🎯 PROJECTILE RANGE (${angle}° ➔ ${angle === 45 ? 'Maximum Range Achieved (100m)' : currentRange + 'm'})
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>When launch & landing heights are equal, a launch angle of <b>45°</b> maximizes horizontal range by balancing vertical flight time with horizontal velocity.</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Launch angle dictates kinetic energy distribution between vertical elevation and horizontal displacement.
            </div>

            <div class="exp-info-panel" style="margin-top:10px;">
              <div style="font-weight:800; color:#FFFFFF; font-size:0.88rem; margin-bottom:6px;">❓ Challenge: Which angle gives the greatest range when launch and landing heights are equal?</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${[15, 30, 45, 60, 75].map(a => `
                  <button class="exp-cond-btn ${this.projectileAnswer === String(a) ? 'active' : ''}" onclick="Experiment.answerProjectileChallenge('${a}')">${a}°</button>
                `).join('')}
              </div>
              ${this.projectileAnswer === '45' ? `
                <div style="color:#67E8F9; font-weight:800; font-size:0.85rem; margin-top:8px;">✅ Correct! 45° produces maximum horizontal range.</div>
              ` : (this.projectileAnswer ? `
                <div style="color:#FCA5A5; font-weight:800; font-size:0.85rem; margin-top:8px;">❌ Try again! Hint: Look for the angle with 100m range.</div>
              ` : '')}
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetProjectileActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startProjectileCanvas('canvasProjectile', angle, vel), 40);
      }
    } else if (mode === 'velocity') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🏹 EXPERIMENT 2 — Initial Velocity and Projectile Motion</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
              
              <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:0.82rem; color:#E9D5FF;">
                <tr style="background:rgba(139, 92, 246, 0.25);">
                  <th style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3); color:#38BDF8;">Velocity</th>
                  <th style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3); color:#38BDF8;">Height</th>
                  <th style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3); color:#38BDF8;">Range</th>
                </tr>
                <tr style="${vel === 'low' ? 'background:rgba(16, 185, 129, 0.25); font-weight:bold; color:#67E8F9;' : ''}">
                  <td style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3);">Low 🟢</td>
                  <td style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3);">Lower (15m)</td>
                  <td style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3);">Shorter (40m)</td>
                </tr>
                <tr style="${vel === 'medium' ? 'background:rgba(245, 158, 11, 0.25); font-weight:bold; color:#FDE047;' : ''}">
                  <td style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3);">Medium 🟡</td>
                  <td style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3);">Higher (35m)</td>
                  <td style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3);">Longer (80m)</td>
                </tr>
                <tr style="${vel === 'high' ? 'background:rgba(239, 68, 68, 0.25); font-weight:bold; color:#FCA5A5;' : ''}">
                  <td style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3);">High 🔴</td>
                  <td style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3);">Highest (70m)</td>
                  <td style="padding:6px; border:1px solid rgba(139, 92, 246, 0.3);">Longest (150m)</td>
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

          <div class="exp-explain-block">
            <h5 style="color:#FFFFFF;">Projectile Motion = Horizontal Motion + Vertical Motion</h5>
            
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
              <b>Goal:</b> Demonstrate that total momentum is conserved in an isolated collision.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div style="font-size:1.8rem; margin-bottom:4px;">🛒 Cart A → 💥 ← Cart B 🛒</div>
            <div style="font-size:0.88rem; font-weight:800; color:#E9D5FF;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">💥 COLLISION & MOMENTUM SIMULATOR</span>
                <span class="exp-hud-status active">● COLLISION ACTIVE</span>
              </div>
              <canvas id="canvasMomentum" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🛒</div>
                <div class="telemetry-label">Initial Momentum</div>
                <div class="telemetry-value">4.0</div>
                <div class="telemetry-unit">kg·m/s</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 80%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">💥</div>
                <div class="telemetry-label">Final Momentum</div>
                <div class="telemetry-value">4.0</div>
                <div class="telemetry-unit">kg·m/s</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 80%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">⚖️</div>
                <div class="telemetry-label">Conservation</div>
                <div class="telemetry-value">100%</div>
                <div class="telemetry-unit">Conserved</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              ✅ CONSERVATION OF MOMENTUM (p_initial = p_final = 4.0 kg·m/s)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>In an isolated collision system, total momentum before collision ($p_{initial} = m_1 v_1 + m_2 v_2$) equals total momentum after collision ($p_{final}$).</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Total momentum is conserved during all collisions in isolated systems ($p_{initial} = p_{final}$).
            </div>

            <div class="exp-info-panel" style="margin-top:10px;">
              <div style="font-weight:800; color:#FFFFFF; font-size:0.88rem; margin-bottom:6px;">❓ Challenge: What happens to total momentum after the collision?</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="exp-cond-btn ${this.momentumAnswer === 'inc' ? 'active' : ''}" onclick="Experiment.answerMomentumChallenge('inc')">Increases</button>
                <button class="exp-cond-btn ${this.momentumAnswer === 'dec' ? 'active' : ''}" onclick="Experiment.answerMomentumChallenge('dec')">Decreases</button>
                <button class="exp-cond-btn ${this.momentumAnswer === 'same' ? 'active' : ''}" onclick="Experiment.answerMomentumChallenge('same')">Remains the same</button>
              </div>
              ${this.momentumAnswer === 'same' ? `
                <div style="color:#67E8F9; font-weight:800; font-size:0.85rem; margin-top:8px;">✅ Correct! Total momentum remains the same assuming no external forces.</div>
              ` : (this.momentumAnswer ? `
                <div style="color:#FCA5A5; font-weight:800; font-size:0.85rem; margin-top:8px;">❌ Try again! Hint: Total momentum is conserved.</div>
              ` : '')}
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetMomentumActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startMomentumCanvas('canvasMomentum', 2, 3, 2, -1), 40);
      }
    } else {
      // 📚 FINAL MOMENTUM PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Momentum & Collisions Panel</div>

          <div class="exp-explain-block">
            <h5 style="color:#FFFFFF;">Momentum and Collisions</h5>
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
              <b>Goal:</b> Demonstrate the complete journey of electricity from a power plant to a household.
            </p>
          </div>
      `;

      if (!isStarted) {
        html += `
          <div class="homeo-body-card">
            <div style="font-size:1.8rem; margin-bottom:4px;">🏭 ➔ ⚡ ➔ 🗼 ➔ 🔌 ➔ 🏘️ ➔ 🏠</div>
            <div style="font-size:0.88rem; font-weight:800; color:#E9D5FF;">Power Grid Stage: Ready to Transmit</div>
          </div>

          <button class="primary-btn start-reaction-btn ready" onclick="Experiment.startElectricitySimulation()">
            ⚡ [ START POWER FLOW ]
          </button>
        </div>
        `;
      } else {
        html += `
          <div class="exp-result-container physical-result">
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">⚡ POWER GRID TRANSMISSION SIMULATOR</span>
                <span class="exp-hud-status active">● CURRENT FLOWING</span>
              </div>
              <canvas id="canvasElectricity" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">🏭</div>
                <div class="telemetry-label">Turbine Gen</div>
                <div class="telemetry-value">13.8</div>
                <div class="telemetry-unit">kV Output</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 60%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🗼</div>
                <div class="telemetry-label">Grid Line</div>
                <div class="telemetry-value">${type === 'high' ? '500' : '13.8'}</div>
                <div class="telemetry-unit">kV Transmission</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${type === 'high' ? 95 : 30}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🏠</div>
                <div class="telemetry-label">Home Supply</div>
                <div class="telemetry-value">220</div>
                <div class="telemetry-unit">Volts AC</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
              ⚡ ELECTRICITY TRANSMITTED SAFELY (220V Household Standard)
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Electricity is generated, transmitted at high voltage, stepped down, and distributed to consumers.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetElectricityActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startElectricityCanvas('canvasElectricity', type), 40);
      }
    } else if (mode === 'voltage') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">⚡ EXPERIMENT 2 — Why High Voltage Is Used</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="homeo-body-card" style="margin:0; width:100%; border-color:${isHigh ? '#34D399' : '#F87171'}; background:${isHigh ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};">
              <div class="homeo-body-icon">${isHigh ? '⚡' : '🔥'}</div>
              <div class="homeo-temp-display" style="color:${isHigh ? '#67E8F9' : '#FCA5A5'}; background:rgba(30, 22, 60, 0.95); border-color:${isHigh ? '#34D399' : '#F87171'};">
                Power Loss Formula: P_loss = I² × R
              </div>
              <div style="font-size:0.88rem; font-weight:800; color:${isHigh ? '#A7F3D0' : '#FECDD3'}; margin-top:6px;">
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

            <div class="exp-info-panel" style="margin-top:10px;">
              <div style="font-weight:800; color:#FFFFFF; font-size:0.88rem; margin-bottom:6px;">❓ Challenge: Why is electricity transmitted at high voltage?</div>
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

          <div class="exp-explain-block">
            <h5 style="color:#FFFFFF;">Electricity Generation & Distribution</h5>
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
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">⚡ HYBRID ENERGY GRID DYNAMICS SIMULATOR</span>
                <span class="exp-hud-status active">● POWER GENERATING</span>
              </div>
              <canvas id="canvasEnergyMix" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">${isSolar ? '☀️' : '🪨'}</div>
                <div class="telemetry-label">Grid Output</div>
                <div class="telemetry-value">${isSolar ? '450' : '820'}</div>
                <div class="telemetry-unit">MW Base Power</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isSolar ? 70 : 95}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">💨</div>
                <div class="telemetry-label">Emissions</div>
                <div class="telemetry-value">${isSolar ? '0' : '920'}</div>
                <div class="telemetry-unit">g CO₂ / kWh</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isSolar ? 0 : 90}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">♻️</div>
                <div class="telemetry-label">Sustainability</div>
                <div class="telemetry-value">${isSolar ? 'RENEWABLE' : 'FINITE'}</div>
                <div class="telemetry-unit">${isSolar ? 'Infinite Sun' : 'Fossil Fuel Depletion'}</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${isSolar ? 100 : 20}%;"></div></div>
              </div>
            </div>

            <div class="result-badge maintained" style="background:${isSolar ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'};">
              ${isSolar ? '♻️ RENEWABLE CLEAN ENERGY GENERATION (Zero Carbon Emissions)' : '⛏️ NON-RENEWABLE FOSSIL FUEL POWER (Combustion & CO₂ Output)'}
            </div>
          </div>

          <div class="exp-explanation-section" style="margin-top:14px;">
            <div class="exp-explain-block">
              <h5>What happened?</h5>
              <p>${isSolar ? 'Solar photovoltaic cells absorb photons to generate clean electricity without fuel depletion.' : 'Coal combustion releases chemical thermal energy to turn steam turbines, producing carbon dioxide emissions and depleting finite reserves.'}</p>
            </div>

            <div class="exp-key-idea-box chemical-key">
              💡 <b>Key Idea:</b> Renewable resources replenish continuously, while fossil fuels are finite and deplete reserves.
            </div>
          </div>

          <button class="secondary-btn reset-exp-btn" onclick="Experiment.resetEnergyMixActivity()">
            🔄 Reset Simulator
          </button>
        </div>
        `;
        setTimeout(() => this.startEnergyMixCanvas('canvasEnergyMix', { solar: isSolar, wind: true, hydro: false }), 40);
      }
    } else if (mode === 'mix') {
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">🌬️ EXPERIMENT 2 — Renewable Energy Mix</div>
          <div class="exp-explain-block">
            <p style="font-size:0.88rem; color:#E9D5FF; font-weight:700;">
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
            <div class="exp-canvas-box-wrapper">
              <div class="exp-hud-bar">
                <span class="exp-hud-title">⚡ RENEWABLE HYBRID ENERGY MIX SIMULATOR</span>
                <span class="exp-hud-status active">● ECO-GRID ACTIVE</span>
              </div>
              <canvas id="canvasEnergyMix" class="exp-sim-canvas"></canvas>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-card">
                <div class="telemetry-icon">⚡</div>
                <div class="telemetry-label">Total Clean Power</div>
                <div class="telemetry-value">${totalMW}</div>
                <div class="telemetry-unit">MW Combined</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: ${(totalMW/100)*100}%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">🌿</div>
                <div class="telemetry-label">Grid Offset</div>
                <div class="telemetry-value">100%</div>
                <div class="telemetry-unit">Clean Energy</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 100%;"></div></div>
              </div>
              <div class="telemetry-card">
                <div class="telemetry-icon">♻️</div>
                <div class="telemetry-label">Emissions</div>
                <div class="telemetry-value">0</div>
                <div class="telemetry-unit">g CO₂ Output</div>
                <div class="telemetry-progress-bar"><div class="telemetry-progress-fill" style="width: 0%;"></div></div>
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

            <div class="exp-info-panel" style="margin-top:10px;">
              <div style="font-weight:800; color:#FFFFFF; font-size:0.88rem; margin-bottom:6px;">❓ Challenge: Which of these energy sources is non-renewable?</div>
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
        setTimeout(() => this.startEnergyMixCanvas('canvasEnergyMix', ren), 40);
      }
    } else {
      // 📚 FINAL ENERGY PANEL
      html += `
        <div class="exp-activity-card">
          <div class="exp-sub-title">📚 Final Energy Sources Panel</div>

          <div class="exp-explain-block">
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
