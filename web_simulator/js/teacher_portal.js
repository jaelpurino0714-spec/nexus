/* ==========================================================================
   NEXUS TEACHER PORTAL MODULE
   Implements My Games (builder/drafts/saved), My Classes (roster/codes/assignments),
   and Analytics (class averages, detailed breakdown & CSV Export).
   ========================================================================== */

const TeacherPortal = {
  // Modal containers management
  ensureModalContainer(id) {
    let modal = document.getElementById(id);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = id;
      modal.className = 'modal-overlay hidden';
      document.body.appendChild(modal);
    }
    return modal;
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  },

  // 1. MY GAMES WORKFLOW
  openMyGames() {
    const modal = this.ensureModalContainer('myGamesModal');
    const customQuizzes = DB.getCustomQuizzes() || [];
    
    let listHtml = '';
    if (customQuizzes.length === 0) {
      listHtml = `
        <div style="text-align: center; color: #A5A3C4; padding: 28px 0;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📁</div>
          <p>No saved games yet! Click <b>+ Create New Game</b> to build your first quiz.</p>
        </div>
      `;
    } else {
      listHtml = customQuizzes.map(q => `
        <div class="game-item-card" style="background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.3); padding: 14px 18px; border-radius: 18px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="margin: 0 0 4px 0; color: #FFFFFF; font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800;">${q.title}</h4>
            <span style="font-size: 0.8rem; color: #A5A3C4; font-weight: 500;">Term ${q.term || 1} • ${(q.questions || []).length} Questions</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; border-radius: 12px; padding: 8px 14px; font-weight: 700; font-size: 0.85rem; border: none; cursor: pointer;" onclick="TeacherPortal.hostCustomGame('${q.id}')">Host 🚀</button>
            <button style="background: rgba(30, 58, 138, 0.6); border: 1px solid rgba(59, 130, 246, 0.4); color: white; border-radius: 12px; padding: 8px 14px; font-weight: 700; font-size: 0.85rem; cursor: pointer;" onclick="TeacherPortal.duplicateGame('${q.id}')">Duplicate 📋</button>
            <button style="background: rgba(153, 27, 27, 0.6); border: 1px solid rgba(239, 68, 68, 0.4); color: white; border-radius: 12px; padding: 8px 14px; font-weight: 700; font-size: 0.85rem; cursor: pointer;" onclick="TeacherPortal.deleteGame('${q.id}')">Delete 🗑️</button>
          </div>
        </div>
      `).join('');
    }

    modal.innerHTML = `
      <div class="modal-card" style="background: linear-gradient(135deg, rgba(22, 14, 45, 0.98) 0%, rgba(16, 10, 34, 0.98) 100%); border: 1.5px solid rgba(139, 92, 246, 0.35); border-radius: 24px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); max-width: 580px; width: 90%; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="margin: 0; color: #FFFFFF; font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800;">📁 My Games Workspace</h3>
          <button class="close-modal-btn" style="background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #A5A3C4;" onclick="TeacherPortal.closeModal('myGamesModal')">✕</button>
        </div>

        <button class="primary-btn" style="width: 100%; margin-bottom: 20px; background: linear-gradient(90deg, #10b981 0%, #059669 100%); color: #FFFFFF; font-weight: 800; font-size: 1.05rem; border-radius: 18px; border: none; padding: 16px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35); cursor: pointer; font-family: var(--font-heading);" onclick="TeacherPortal.openGameBuilder()">
          + Create New Science Game ✏️
        </button>

        <div class="games-list-section">
          <h4 style="margin: 0 0 12px 0; color: #A5A3C4; font-size: 0.88rem; font-weight: 600;">Saved Games & Drafts (${customQuizzes.length})</h4>
          <div style="max-height: 320px; overflow-y: auto;">
            ${listHtml}
          </div>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
  },

  openGameBuilder() {
    this.closeModal('myGamesModal');
    const modal = this.ensureModalContainer('gameBuilderModal');
    modal.innerHTML = `
      <div class="modal-card" style="background: linear-gradient(135deg, rgba(22, 14, 45, 0.98) 0%, rgba(16, 10, 34, 0.98) 100%); border: 1.5px solid rgba(139, 92, 246, 0.35); border-radius: 24px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); max-width: 600px; width: 90%; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #FFFFFF; font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800;">✏️ Create Custom Science Game</h3>
          <button class="close-modal-btn" style="background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #A5A3C4;" onclick="TeacherPortal.closeModal('gameBuilderModal')">✕</button>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label style="font-size: 0.88rem; font-weight: 700; color: #C084FC; display: block; margin-bottom: 6px;">Game / Quiz Title *</label>
          <input type="text" id="builderTitle" placeholder="e.g. Term 1 Science Challenge" class="customize-input" style="width: 100%; background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 16px; color: #FFFFFF; font-weight: 600; font-size: 0.95rem; padding: 12px 16px; outline: none; box-sizing: border-box; font-family: var(--font-heading);">
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label style="font-size: 0.88rem; font-weight: 700; color: #C084FC; display: block; margin-bottom: 6px;">Science Term</label>
          <select id="builderTerm" class="customize-input" style="width: 100%; background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 16px; color: #FFFFFF; font-weight: 600; font-size: 0.95rem; padding: 12px 16px; outline: none; box-sizing: border-box; font-family: var(--font-heading); cursor: pointer;">
            <option value="1" style="background: #1E163B; color: #FFF;">Term 1</option>
            <option value="2" style="background: #1E163B; color: #FFF;">Term 2</option>
            <option value="3" style="background: #1E163B; color: #FFF;">Term 3</option>
          </select>
        </div>

        <div style="background: rgba(18, 12, 36, 0.8); border: 1.5px solid rgba(139, 92, 246, 0.3); padding: 16px; border-radius: 20px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #38BDF8; font-size: 0.95rem; font-weight: 800;">Add Question</h4>
          
          <div class="form-group" style="margin-bottom: 10px;">
            <label style="font-size: 0.84rem; font-weight: 700; color: #C084FC; display: block; margin-bottom: 4px;">Answer Format</label>
            <select id="builderQFormat" class="customize-input" style="width: 100%; background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 14px; color: #FFFFFF; font-weight: 600; font-size: 0.9rem; padding: 10px 14px; outline: none; box-sizing: border-box; font-family: var(--font-heading); cursor: pointer;" onchange="TeacherPortal.onBuilderFormatChanged()">
              <option value="multiple_choice" selected style="background: #1E163B; color: #FFF;">Multiple Choice (4 Options)</option>
              <option value="true_false" style="background: #1E163B; color: #FFF;">True or False</option>
              <option value="identification" style="background: #1E163B; color: #FFF;">Identification (Short Answer)</option>
            </select>
          </div>

          <input type="text" id="builderQPrompt" placeholder="Question prompt..." class="customize-input" style="width: 100%; background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 14px; color: #FFFFFF; font-weight: 600; font-size: 0.9rem; padding: 10px 14px; outline: none; box-sizing: border-box; font-family: var(--font-heading); margin-bottom: 10px;">
          
          <div id="builderInputsContainer">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
              <input type="text" id="builderOptA" placeholder="Option A" class="customize-input" style="background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 12px; color: #FFFFFF; padding: 10px; font-size: 0.88rem;">
              <input type="text" id="builderOptB" placeholder="Option B" class="customize-input" style="background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 12px; color: #FFFFFF; padding: 10px; font-size: 0.88rem;">
              <input type="text" id="builderOptC" placeholder="Option C" class="customize-input" style="background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 12px; color: #FFFFFF; padding: 10px; font-size: 0.88rem;">
              <input type="text" id="builderOptD" placeholder="Option D" class="customize-input" style="background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 12px; color: #FFFFFF; padding: 10px; font-size: 0.88rem;">
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <select id="builderCorrect" class="customize-input" style="width: auto; background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 12px; color: #FFFFFF; padding: 8px 12px; font-size: 0.85rem;">
                <option value="0" style="background: #1E163B; color: #FFF;">Correct: Option A</option>
                <option value="1" style="background: #1E163B; color: #FFF;">Correct: Option B</option>
                <option value="2" style="background: #1E163B; color: #FFF;">Correct: Option C</option>
                <option value="3" style="background: #1E163B; color: #FFF;">Correct: Option D</option>
              </select>
              <button style="background: linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%); color: white; border-radius: 14px; border: none; padding: 10px 18px; font-weight: 700; font-size: 0.85rem; cursor: pointer;" onclick="TeacherPortal.addQuestionToDraft()">+ Add Question</button>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="margin: 0 0 6px 0; color: #A5A3C4; font-size: 0.88rem;">Questions Added (<span id="builderQCount">0</span>)</h4>
          <ul id="builderQuestionsList" style="max-height: 120px; overflow-y: auto; font-size: 0.85rem; padding-left: 20px; color: #A5A3C4;">
            <!-- Questions rendered here -->
          </ul>
        </div>

        <button class="primary-btn" style="width: 100%; background: linear-gradient(90deg, #a855f7 0%, #6366f1 100%); color: #FFFFFF; font-weight: 800; font-size: 1.05rem; border-radius: 18px; border: none; padding: 16px; box-shadow: 0 4px 20px rgba(168, 85, 247, 0.35); cursor: pointer; font-family: var(--font-heading);" onclick="TeacherPortal.saveCreatedGame()">Save Game to My Games 💾</button>
      </div>
    `;
    modal.classList.remove('hidden');
    this._builderDrafts = [];
  },

  _builderDrafts: [],

  onBuilderFormatChanged() {
    const fmt = document.getElementById('builderQFormat').value;
    const container = document.getElementById('builderInputsContainer');
    if (!container) return;

    if (fmt === 'multiple_choice') {
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <input type="text" id="builderOptA" placeholder="Option A" class="customize-input">
          <input type="text" id="builderOptB" placeholder="Option B" class="customize-input">
          <input type="text" id="builderOptC" placeholder="Option C" class="customize-input">
          <input type="text" id="builderOptD" placeholder="Option D" class="customize-input">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <select id="builderCorrect" class="customize-input" style="width: auto;">
            <option value="0">Correct: Option A</option>
            <option value="1">Correct: Option B</option>
            <option value="2">Correct: Option C</option>
            <option value="3">Correct: Option D</option>
          </select>
          <button class="secondary-btn" style="font-size: 0.82rem;" onclick="TeacherPortal.addQuestionToDraft()">+ Add Question</button>
        </div>
      `;
    } else if (fmt === 'true_false') {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <label style="font-weight:600; font-size:0.85rem;">Correct Answer:</label>
          <select id="builderTFCorrect" class="customize-input" style="width: 40%;">
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
          <button class="secondary-btn" style="font-size: 0.82rem;" onclick="TeacherPortal.addQuestionToDraft()">+ Add Question</button>
        </div>
      `;
    } else if (fmt === 'identification') {
      container.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px;">
          <input type="text" id="builderIdCorrect" placeholder="Correct answer word/phrase..." class="customize-input" style="flex: 1;">
          <button class="secondary-btn" style="font-size: 0.82rem; white-space: nowrap;" onclick="TeacherPortal.addQuestionToDraft()">+ Add Question</button>
        </div>
      `;
    }
  },

  addQuestionToDraft() {
    const prompt = document.getElementById('builderQPrompt').value.trim();
    const fmt = document.getElementById('builderQFormat').value;

    if (!prompt) {
      alert('Please enter a question prompt.');
      return;
    }

    let qObj = {
      id: 'q_' + Date.now(),
      question: prompt,
      questionType: fmt
    };

    if (fmt === 'multiple_choice') {
      const optA = document.getElementById('builderOptA').value.trim();
      const optB = document.getElementById('builderOptB').value.trim();
      const optC = document.getElementById('builderOptC').value.trim();
      const optD = document.getElementById('builderOptD').value.trim();
      const correctIndex = parseInt(document.getElementById('builderCorrect').value, 10);

      if (!optA || !optB || !optC || !optD) {
        alert('Please fill out all 4 options for Multiple Choice.');
        return;
      }
      const opts = [optA, optB, optC, optD];
      qObj.options = opts;
      qObj.choice_a = optA;
      qObj.choice_b = optB;
      qObj.choice_c = optC;
      qObj.choice_d = optD;
      qObj.option_a = optA;
      qObj.option_b = optB;
      qObj.option_c = optC;
      qObj.option_d = optD;
      qObj.optionA = optA;
      qObj.optionB = optB;
      qObj.optionC = optC;
      qObj.optionD = optD;
      qObj.question_type_id = 1;
      qObj.question_type = 'multiple_choice';

      const letterMap = { 0: 'A', 1: 'B', 2: 'C', 3: 'D' };
      const ansLetter = letterMap[correctIndex] || 'A';
      const eqText = opts[correctIndex] || optA;

      qObj.correct_answer = ansLetter;
      qObj.correctAnswer = ansLetter;
      qObj.answer = ansLetter;
      qObj.equivalent_answer = eqText;
      qObj.equivalentAnswer = eqText;
      qObj.letter_map = { A: optA, B: optB, C: optC, D: optD };
    } else if (fmt === 'true_false') {
      const corrVal = document.getElementById('builderTFCorrect').value;
      qObj.options = ['True', 'False'];
      qObj.choice_a = 'True';
      qObj.choice_b = 'False';
      qObj.option_a = 'True';
      qObj.option_b = 'False';
      qObj.optionA = 'True';
      qObj.optionB = 'False';
      qObj.question_type_id = 2;
      qObj.question_type = 'true_false';
      qObj.correct_answer = corrVal;
      qObj.correctAnswer = corrVal;
      qObj.answer = corrVal;
      qObj.equivalent_answer = corrVal;
      qObj.equivalentAnswer = corrVal;
    } else if (fmt === 'identification') {
      const corrVal = document.getElementById('builderIdCorrect').value.trim();
      if (!corrVal) {
        alert('Please enter the correct answer word or phrase.');
        return;
      }
      qObj.options = [];
      qObj.question_type_id = 3;
      qObj.question_type = 'identification';
      qObj.correct_answer = corrVal;
      qObj.correctAnswer = corrVal;
      qObj.answer = corrVal;
      qObj.counterpart = corrVal;
      qObj.equivalent_answer = corrVal;
      qObj.equivalentAnswer = corrVal;
    }

    this._builderDrafts.push(qObj);
    document.getElementById('builderQPrompt').value = '';

    if (fmt === 'multiple_choice') {
      document.getElementById('builderOptA').value = '';
      document.getElementById('builderOptB').value = '';
      document.getElementById('builderOptC').value = '';
      document.getElementById('builderOptD').value = '';
    } else if (fmt === 'identification') {
      document.getElementById('builderIdCorrect').value = '';
    }

    document.getElementById('builderQCount').textContent = this._builderDrafts.length;
    const ul = document.getElementById('builderQuestionsList');
    ul.innerHTML = this._builderDrafts.map((q, idx) => {
      let ansLabel = q.answer;
      if (q.questionType === 'multiple_choice' && q.equivalent_answer) {
        ansLabel = `${q.answer} - ${q.equivalent_answer}`;
      } else if (q.questionType === 'identification') {
        ansLabel = q.counterpart || q.answer;
      }
      return `
      <li>
        <b>Q${idx+1} [${q.questionType.replace('_', ' ')}]:</b> ${q.question}
        <span style="color:#10B981; font-weight:bold;">(Ans: ${ansLabel})</span>
      </li>
    `;
    }).join('');
  },

  saveCreatedGame() {
    const title = document.getElementById('builderTitle').value.trim();
    const term = parseInt(document.getElementById('builderTerm').value);

    if (!title) {
      alert('Please enter a Game / Quiz Title.');
      return;
    }
    if (this._builderDrafts.length === 0) {
      alert('Please add at least 1 question to your game.');
      return;
    }

    const quizObj = {
      id: 'quiz_' + Date.now(),
      title: title,
      term: term,
      questions: this._builderDrafts,
      createdAt: new Date().toISOString()
    };

    DB.saveCustomQuiz(quizObj);
    alert(`Game "${title}" saved successfully!`);
    this.closeModal('gameBuilderModal');
    this.openMyGames();
  },

  hostCustomGame(quizId) {
    const customQuizzes = DB.getCustomQuizzes() || [];
    const quiz = customQuizzes.find(q => q.id === quizId);
    if (!quiz) return;

    this.closeModal('myGamesModal');
    const modal = this.ensureModalContainer('customGameHostSetupModal');

    modal.innerHTML = `
      <div class="modal-card" style="background: linear-gradient(135deg, rgba(22, 14, 45, 0.98) 0%, rgba(16, 10, 34, 0.98) 100%); border: 1.5px solid rgba(139, 92, 246, 0.35); border-radius: 24px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); max-width: 480px; width: 90%; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="margin: 0; color: #FFFFFF; font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800;">👑 Host Game: ${quiz.title}</h3>
          <button class="close-modal-btn" style="background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #A5A3C4;" onclick="TeacherPortal.closeModal('customGameHostSetupModal')">✕</button>
        </div>

        <p style="font-size: 0.88rem; color: #A5A3C4; margin-bottom: 18px;">Set participant limit and time per question to generate your Game PIN.</p>

        <div class="form-group" style="margin-bottom: 16px; text-align: left;">
          <label style="font-size: 0.88rem; font-weight: 700; color: #38BDF8; display: block; margin-bottom: 6px;">👥 Number of Participants:</label>
          <select id="customHostMaxParticipants" class="customize-input" style="width: 100%; background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 16px; color: #FFFFFF; font-weight: 600; font-size: 0.95rem; padding: 12px 16px; outline: none; box-sizing: border-box; font-family: var(--font-heading); cursor: pointer;">
            <option value="5" style="background: #1E163B; color: #FFF;">5 Participants</option>
            <option value="10" style="background: #1E163B; color: #FFF;">10 Participants</option>
            <option value="20" style="background: #1E163B; color: #FFF;">20 Participants</option>
            <option value="30" style="background: #1E163B; color: #FFF;">30 Participants</option>
            <option value="50" selected style="background: #1E163B; color: #FFF;">50 Participants (Default)</option>
            <option value="100" style="background: #1E163B; color: #FFF;">100 Participants</option>
            <option value="200" style="background: #1E163B; color: #FFF;">200 Participants</option>
            <option value="500" style="background: #1E163B; color: #FFF;">500 Participants</option>
            <option value="9999" style="background: #1E163B; color: #FFF;">Unlimited (Maximum Supported)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 22px; text-align: left;">
          <label style="font-size: 0.88rem; font-weight: 700; color: #38BDF8; display: block; margin-bottom: 6px;">⏱️ Time per Question:</label>
          <select id="customHostTimeLimit" class="customize-input" style="width: 100%; background: rgba(25, 17, 50, 0.95); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 16px; color: #FFFFFF; font-weight: 600; font-size: 0.95rem; padding: 12px 16px; outline: none; box-sizing: border-box; font-family: var(--font-heading); cursor: pointer;">
            <option value="10" style="background: #1E163B; color: #FFF;">10 Seconds</option>
            <option value="15" style="background: #1E163B; color: #FFF;">15 Seconds</option>
            <option value="20" selected style="background: #1E163B; color: #FFF;">20 Seconds (Default)</option>
            <option value="30" style="background: #1E163B; color: #FFF;">30 Seconds</option>
            <option value="45" style="background: #1E163B; color: #FFF;">45 Seconds</option>
            <option value="60" style="background: #1E163B; color: #FFF;">60 Seconds</option>
          </select>
        </div>

        <button class="primary-btn" style="width: 100%; background: linear-gradient(90deg, #a855f7 0%, #6366f1 100%); color: #FFFFFF; font-weight: 800; font-size: 1.05rem; border-radius: 18px; border: none; padding: 16px; box-shadow: 0 4px 20px rgba(168, 85, 247, 0.35); cursor: pointer; font-family: var(--font-heading);" onclick="TeacherPortal.startCustomGameHost('${quiz.id}')">
          Start Hosting & Generate Code 🚀
        </button>
      </div>
    `;
    modal.classList.remove('hidden');
  },

  async startCustomGameHost(quizId) {
    const customQuizzes = DB.getCustomQuizzes() || [];
    const quiz = customQuizzes.find(q => q.id === quizId);
    if (!quiz) return;

    const maxPart = parseInt(document.getElementById('customHostMaxParticipants').value, 10) || 50;
    const timeLim = parseInt(document.getElementById('customHostTimeLimit').value, 10) || 20;

    this.closeModal('customGameHostSetupModal');

    const config = {
      termId: quiz.term || 1,
      topicId: quiz.id,
      quizTitle: quiz.title,
      customQuestions: quiz.questions,
      questionCount: quiz.questions ? quiz.questions.length : 10,
      timeLimit: timeLim,
      maxParticipants: maxPart
    };

    Multiplayer.resetState();
    const game = await DB.createMultiplayerGame(config);
    Multiplayer.currentGame = game;
    Multiplayer.questionsList = game.formattedQuestions || quiz.questions;
    Multiplayer.isHost = true;
    await Multiplayer.enterHostLobbyScreen(game);
  },

  duplicateGame(quizId) {
    const customQuizzes = DB.getCustomQuizzes() || [];
    const quiz = customQuizzes.find(q => q.id === quizId);
    if (!quiz) return;

    const dup = {
      ...quiz,
      id: 'quiz_' + Date.now(),
      title: `${quiz.title} (Copy)`,
      createdAt: new Date().toISOString()
    };

    DB.saveCustomQuiz(dup);
    this.openMyGames();
  },

  async deleteGame(quizId) {
    let confirmed = false;
    if (typeof App !== 'undefined' && typeof App.confirm === 'function') {
      confirmed = await App.confirm({
        title: 'Delete Custom Game',
        message: 'Are you sure you want to permanently delete this custom game?',
        icon: '🗑️',
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
        danger: true
      });
    } else {
      confirmed = window.confirm('Are you sure you want to permanently delete this custom game?');
    }
    if (!confirmed) return;

    let customQuizzes = JSON.parse(localStorage.getItem('nexus_custom_quizzes') || '[]');
    customQuizzes = customQuizzes.filter(q => q.id !== quizId);
    localStorage.setItem('nexus_custom_quizzes', JSON.stringify(customQuizzes));

    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        await supabaseClient.from('custom_quizzes').delete().eq('id', quizId);
      } catch (e) {
        console.warn('Error deleting remote custom quiz:', e);
      }
    }

    this.openMyGames();
  },

  // 3. TEACHER ANALYTICS WORKFLOW
  openAnalytics() {
    const modal = this.ensureModalContainer('teacherAnalyticsModal');
    const latestHostedGame = DB.getLatestHostedGameAnalytics();

    let hostedGameSection = '';
    if (latestHostedGame) {
      const parts = latestHostedGame.participants || [];
      hostedGameSection = `
        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 16px; padding: 18px; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <span class="tag" style="background: rgba(139, 92, 246, 0.25); color: #C084FC; border: 1px solid rgba(168, 85, 247, 0.4); font-weight: 800; font-size: 0.72rem; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px; margin-bottom: 6px; display: inline-block;">MOST PREVIOUSLY HOSTED GAME</span>
              <h4 style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 1.1rem; font-weight: 800; font-family: var(--font-heading);">${latestHostedGame.title || 'Science Host Game'} <span style="color:#C084FC;">(PIN: ${latestHostedGame.roomCode})</span></h4>
            </div>
            <span style="font-size: 0.8rem; color: #A5A3C4; font-weight: 600;">${latestHostedGame.date || ''}</span>
          </div>

          <div style="max-height: 240px; overflow-y: auto; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; background: rgba(15, 10, 30, 0.95);">
            <table class="data-table" style="width: 100%; font-size: 0.85rem; border-collapse: collapse; background: rgba(15, 10, 30, 0.95) !important;">
              <thead>
                <tr style="background: rgba(139, 92, 246, 0.25) !important; text-align: left; border-bottom: 1px solid rgba(139, 92, 246, 0.3);">
                  <th style="padding: 12px 14px; color: #C084FC !important; font-weight: 800; font-family: var(--font-heading); font-size: 0.78rem; letter-spacing: 0.5px; text-transform: uppercase;">Participant</th>
                  <th style="padding: 12px 14px; color: #C084FC !important; font-weight: 800; font-family: var(--font-heading); font-size: 0.78rem; letter-spacing: 0.5px; text-transform: uppercase;">Total Points</th>
                  <th style="padding: 12px 14px; color: #C084FC !important; font-weight: 800; font-family: var(--font-heading); font-size: 0.78rem; letter-spacing: 0.5px; text-transform: uppercase;">Accuracy</th>
                  <th style="padding: 12px 14px; color: #C084FC !important; font-weight: 800; font-family: var(--font-heading); font-size: 0.78rem; letter-spacing: 0.5px; text-transform: uppercase;">Correct / Total</th>
                </tr>
              </thead>
              <tbody>
                ${parts.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:20px; color:#A5A3C4; font-weight:600;">No participant responses recorded.</td></tr>' : parts.map(p => `
                  <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06); background: rgba(15, 10, 30, 0.95);">
                    <td style="padding: 12px 14px; font-weight: 700; color: #FFFFFF !important;">👤 ${p.name}</td>
                    <td style="padding: 12px 14px; font-weight: 800; color: #C084FC !important;">${(p.points || 0).toLocaleString()} pts</td>
                    <td style="padding: 12px 14px;">
                      <span class="tag" style="background:${p.accuracyPct >= 50 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color:${p.accuracyPct >= 50 ? '#34D399' : '#FCA5A5'}; border: 1px solid ${p.accuracyPct >= 50 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}; font-weight:800; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem;">
                        ${p.accuracyPct}%
                      </span>
                    </td>
                    <td style="padding: 12px 14px; font-weight: 800; color: #38BDF8 !important;">${p.correctRatio || `${p.correct}/${p.totalQuestions}`}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      hostedGameSection = `
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px dashed rgba(139, 92, 246, 0.35); border-radius: 16px; padding: 24px; margin-bottom: 16px; text-align: center; color: #A5A3C4;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">📊</div>
          <h4 style="margin: 0 0 6px 0; color: #FFFFFF; font-weight: 800; font-family: var(--font-heading);">No Hosted Game Analytics Recorded Yet</h4>
          <p style="font-size: 0.85rem; margin: 0; color: #A5A3C4;">Host a live game to view participant names, total points, accuracy, and correct answers breakdown!</p>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal-card" style="background: linear-gradient(135deg, rgba(22, 14, 45, 0.98) 0%, rgba(16, 10, 34, 0.98) 100%); border: 1.5px solid rgba(139, 92, 246, 0.35); border-radius: 24px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); max-width: 640px; width: 90%; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="margin: 0; color: #FFFFFF; font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800;">📊 Class Performance & Game Analytics</h3>
          <button class="close-modal-btn" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.15); font-size: 1.1rem; cursor: pointer; color: #FFFFFF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;" onclick="TeacherPortal.closeModal('teacherAnalyticsModal')">✕</button>
        </div>

        ${hostedGameSection}
      </div>
    `;
    modal.classList.remove('hidden');
  }
};
