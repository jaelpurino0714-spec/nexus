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
          <input type="text" id="builderTitle" placeholder="e.g. Term 1 Plate Tectonics Challenge" class="customize-input">
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label style="font-weight: bold; font-size: 0.85rem;">Science Term</label>
          <select id="builderTerm" class="customize-input">
            <option value="1">Term 1: Earth Science & Ecosystems</option>
            <option value="2">Term 2: Biology & EM Spectrum</option>
            <option value="3">Term 3: Chemistry & Physics</option>
          </select>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 12px; margin-bottom: 14px;">
          <h4 style="margin: 0 0 10px 0; color: #334155; font-size: 0.95rem;">Add Question</h4>
          <input type="text" id="builderQPrompt" placeholder="Question prompt..." class="customize-input" style="margin-bottom: 8px;">
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

  addQuestionToDraft() {
    const prompt = document.getElementById('builderQPrompt').value.trim();
    const optA = document.getElementById('builderOptA').value.trim();
    const optB = document.getElementById('builderOptB').value.trim();
    const optC = document.getElementById('builderOptC').value.trim();
    const optD = document.getElementById('builderOptD').value.trim();
    const correct = parseInt(document.getElementById('builderCorrect').value);

    if (!prompt || !optA || !optB || !optC || !optD) {
      alert('Please complete the question prompt and all 4 options.');
      return;
    }

    this._builderDrafts.push({
      id: 'q_' + Date.now(),
      question: prompt,
      options: [optA, optB, optC, optD],
      answer: correct
    });

    document.getElementById('builderQPrompt').value = '';
    document.getElementById('builderOptA').value = '';
    document.getElementById('builderOptB').value = '';
    document.getElementById('builderOptC').value = '';
    document.getElementById('builderOptD').value = '';

    document.getElementById('builderQCount').textContent = this._builderDrafts.length;
    const ul = document.getElementById('builderQuestionsList');
    ul.innerHTML = this._builderDrafts.map((q, idx) => `<li><b>Q${idx+1}:</b> ${q.question}</li>`).join('');
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
    Multiplayer.questionsList = quiz.questions;
    Multiplayer.initCreateGameFlow();
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
    const student = DB.getStudentProfile();
    const results = DB.getQuizResults() || [];

    let avgScore = 0;
    if (results.length > 0) {
      avgScore = Math.round(results.reduce((acc, r) => acc + (r.scorePct || 0), 0) / results.length);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 620px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #4C1D95;">📊 Class Performance Analytics</h3>
          <button class="close-modal-btn" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #666;" onclick="TeacherPortal.closeModal('teacherAnalyticsModal')">✕</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; text-align: center;">
          <div style="background: #EFF6FF; padding: 12px; border-radius: 12px; border: 1px solid #BFDBFE;">
            <span style="font-size: 0.8rem; color: #1E40AF; font-weight: 600;">Active Students</span>
            <h3 style="margin: 4px 0 0 0; color: #1E3A8A;">${student ? 1 : 0}</h3>
          </div>
          <div style="background: #F3E8FF; padding: 12px; border-radius: 12px; border: 1px solid #DDD6FE;">
            <span style="font-size: 0.8rem; color: #6B21A8; font-weight: 600;">Quizzes Taken</span>
            <h3 style="margin: 4px 0 0 0; color: #581C87;">${results.length}</h3>
          </div>
          <div style="background: #ECFDF5; padding: 12px; border-radius: 12px; border: 1px solid #A7F3D0;">
            <span style="font-size: 0.8rem; color: #065F46; font-weight: 600;">Class Avg Score</span>
            <h3 style="margin: 4px 0 0 0; color: #064E3B;">${avgScore}%</h3>
          </div>
        </div>

        <button class="primary-btn" style="width: 100%; margin-bottom: 14px; background: #0284C7;" onclick="Analytics.exportCSV()">
          📥 Export Classroom Results (CSV)
        </button>

        <div>
          <h4 style="margin: 0 0 8px 0; color: #334155;">Student Score History</h4>
          <div style="max-height: 220px; overflow-y: auto; border: 1px solid #E2E8F0; border-radius: 10px;">
            <table class="data-table" style="width: 100%; font-size: 0.82rem;">
              <thead>
                <tr style="background: #F1F5F9;">
                  <th style="padding: 8px;">Student</th>
                  <th style="padding: 8px;">Term</th>
                  <th style="padding: 8px;">Score</th>
                  <th style="padding: 8px;">Streak</th>
                </tr>
              </thead>
              <tbody>
                ${results.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:16px;">No quiz records available yet.</td></tr>' : results.map(r => `
                  <tr>
                    <td style="padding: 8px;"><b>${student ? student.name : 'Student'}</b></td>
                    <td style="padding: 8px;">Term ${r.term}</td>
                    <td style="padding: 8px;"><span class="tag" style="background:${r.scorePct >= 50 ? '#4CAF50' : '#F44336'}">${r.scorePct}%</span></td>
                    <td style="padding: 8px;">🔥 ${r.maxStreak || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
  }
};
