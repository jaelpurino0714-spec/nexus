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
        <div style="text-align: center; color: #64748B; padding: 24px 0;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📁</div>
          <p>No saved games yet! Click <b>+ Create New Game</b> to build your first quiz.</p>
        </div>
      `;
    } else {
      listHtml = customQuizzes.map(q => `
        <div class="game-item-card" style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="margin: 0 0 4px 0; color: #1E293B;">${q.title}</h4>
            <span style="font-size: 0.78rem; background: #E0E7FF; color: #3730A3; padding: 2px 8px; border-radius: 10px; font-weight: 600;">Term ${q.term || 1} • ${(q.questions || []).length} Questions</span>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="primary-btn" style="padding: 6px 12px; font-size: 0.8rem;" onclick="TeacherPortal.hostCustomGame('${q.id}')">Host 🚀</button>
            <button class="secondary-btn" style="padding: 6px 12px; font-size: 0.8rem;" onclick="TeacherPortal.duplicateGame('${q.id}')">Duplicate 📋</button>
            <button class="cancel-btn" style="padding: 6px 12px; font-size: 0.8rem; background: #FEE2E2; color: #DC2626; border: none;" onclick="TeacherPortal.deleteGame('${q.id}')">Delete 🗑️</button>
          </div>
        </div>
      `).join('');
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 580px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #4C1D95;">📁 My Games Workspace</h3>
          <button class="close-modal-btn" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #666;" onclick="TeacherPortal.closeModal('myGamesModal')">✕</button>
        </div>

        <button class="primary-btn" style="width: 100%; margin-bottom: 16px; background: linear-gradient(135deg, #10B981, #059669);" onclick="TeacherPortal.openGameBuilder()">
          + Create New Science Game ✏️
        </button>

        <div class="games-list-section">
          <h4 style="margin: 0 0 10px 0; color: #334155;">Saved Games & Drafts (${customQuizzes.length})</h4>
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
      <div class="modal-card" style="max-width: 600px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="margin: 0; color: #4C1D95;">✏️ Create Custom Science Game</h3>
          <button class="close-modal-btn" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #666;" onclick="TeacherPortal.closeModal('gameBuilderModal')">✕</button>
        </div>

        <div class="form-group" style="margin-bottom: 10px;">
          <label style="font-weight: bold; font-size: 0.85rem;">Game / Quiz Title *</label>
          <input type="text" id="builderTitle" placeholder="e.g. Term 1 Science Challenge" class="customize-input">
        </div>

        <div class="form-group" style="margin-bottom: 10px;">
          <label style="font-weight: bold; font-size: 0.85rem;">Science Term</label>
          <select id="builderTerm" class="customize-input">
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 12px; margin-bottom: 14px;">
          <h4 style="margin: 0 0 10px 0; color: #334155; font-size: 0.95rem;">Add Question</h4>
          
          <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-weight: 600; font-size: 0.8rem; color: #475569;">Answer Format</label>
            <select id="builderQFormat" class="customize-input" onchange="TeacherPortal.onBuilderFormatChanged()">
              <option value="multiple_choice" selected>Multiple Choice (4 Options)</option>
              <option value="true_false">True or False</option>
              <option value="identification">Identification (Short Answer)</option>
            </select>
          </div>

          <input type="text" id="builderQPrompt" placeholder="Question prompt..." class="customize-input" style="margin-bottom: 8px;">
          
          <div id="builderInputsContainer">
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
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <h4 style="margin: 0 0 6px 0; color: #334155;">Questions Added (<span id="builderQCount">0</span>)</h4>
          <ul id="builderQuestionsList" style="max-height: 120px; overflow-y: auto; font-size: 0.85rem; padding-left: 20px; color: #475569;">
            <!-- Questions rendered here -->
          </ul>
        </div>

        <button class="primary-btn" style="width: 100%;" onclick="TeacherPortal.saveCreatedGame()">Save Game to My Games 💾</button>
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
      <div class="modal-card" style="max-width: 480px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="margin: 0; color: #4C1D95;">👑 Host Game: ${quiz.title}</h3>
          <button class="close-modal-btn" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #666;" onclick="TeacherPortal.closeModal('customGameHostSetupModal')">✕</button>
        </div>

        <p style="font-size: 0.88rem; color: #64748B; margin-bottom: 16px;">Set participant limit and time per question to generate your Game PIN.</p>

        <div class="form-group" style="margin-bottom: 14px; text-align: left;">
          <label style="font-weight: bold; font-size: 0.85rem; color: #1E293B;">👥 Number of Participants:</label>
          <select id="customHostMaxParticipants" class="customize-input" style="margin-top: 4px;">
            <option value="5">5 Participants</option>
            <option value="10">10 Participants</option>
            <option value="20">20 Participants</option>
            <option value="30">30 Participants</option>
            <option value="50" selected>50 Participants (Default)</option>
            <option value="100">100 Participants</option>
            <option value="200">200 Participants</option>
            <option value="500">500 Participants</option>
            <option value="9999">Unlimited (Maximum Supported)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 20px; text-align: left;">
          <label style="font-weight: bold; font-size: 0.85rem; color: #1E293B;">⏱️ Time per Question:</label>
          <select id="customHostTimeLimit" class="customize-input" style="margin-top: 4px;">
            <option value="10">10 Seconds</option>
            <option value="15">15 Seconds</option>
            <option value="20" selected>20 Seconds (Default)</option>
            <option value="30">30 Seconds</option>
            <option value="45">45 Seconds</option>
            <option value="60">60 Seconds</option>
          </select>
        </div>

        <button class="primary-btn" style="width: 100%; padding: 12px; font-weight: 700;" onclick="TeacherPortal.startCustomGameHost('${quiz.id}')">
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

  deleteGame(quizId) {
    if (!confirm('Are you sure you want to delete this game?')) return;
    let customQuizzes = DB.getCustomQuizzes() || [];
    customQuizzes = customQuizzes.filter(q => q.id !== quizId);
    localStorage.setItem('nexus_custom_quizzes', JSON.stringify(customQuizzes));
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
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <span class="tag" style="background: #E0E7FF; color: #3730A3; font-weight: 700; margin-bottom: 4px; display: inline-block;">MOST PREVIOUSLY HOSTED GAME</span>
              <h4 style="margin: 2px 0 0 0; color: #0F172A; font-size: 1.05rem;">${latestHostedGame.title || 'Science Host Game'} (PIN: ${latestHostedGame.roomCode})</h4>
            </div>
            <span style="font-size: 0.78rem; color: #64748B; font-weight: 600;">${latestHostedGame.date || ''}</span>
          </div>

          <div style="max-height: 220px; overflow-y: auto; border: 1px solid #E2E8F0; border-radius: 10px; background: white;">
            <table class="data-table" style="width: 100%; font-size: 0.82rem;">
              <thead>
                <tr style="background: #F1F5F9; text-align: left;">
                  <th style="padding: 10px;">Participant</th>
                  <th style="padding: 10px;">Total Points</th>
                  <th style="padding: 10px;">Accuracy</th>
                  <th style="padding: 10px;">Correct / Total</th>
                </tr>
              </thead>
              <tbody>
                ${parts.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:16px; color:#94A3B8;">No participant responses recorded.</td></tr>' : parts.map(p => `
                  <tr>
                    <td style="padding: 10px; font-weight: 700; color: #1E293B;">👤 ${p.name}</td>
                    <td style="padding: 10px; font-weight: 800; color: #6D28D9;">${(p.points || 0).toLocaleString()} pts</td>
                    <td style="padding: 10px;">
                      <span class="tag" style="background:${p.accuracyPct >= 50 ? '#DCFCE7' : '#FEE2E2'}; color:${p.accuracyPct >= 50 ? '#166534' : '#991B1B'}; font-weight:700;">
                        ${p.accuracyPct}%
                      </span>
                    </td>
                    <td style="padding: 10px; font-weight: 700; color: #0284C7;">${p.correctRatio || `${p.correct}/${p.totalQuestions}`}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      hostedGameSection = `
        <div style="background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 14px; padding: 20px; margin-bottom: 16px; text-align: center; color: #64748B;">
          <div style="font-size: 2rem; margin-bottom: 6px;">📊</div>
          <h4 style="margin: 0 0 4px 0; color: #334155;">No Hosted Game Analytics Recorded Yet</h4>
          <p style="font-size: 0.85rem; margin: 0;">Host a live game to view participant names, total points, accuracy, and correct answers breakdown!</p>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 640px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #4C1D95;">📊 Class Performance & Game Analytics</h3>
          <button class="close-modal-btn" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #666;" onclick="TeacherPortal.closeModal('teacherAnalyticsModal')">✕</button>
        </div>

        ${hostedGameSection}
      </div>
    `;
    modal.classList.remove('hidden');
  }
};
