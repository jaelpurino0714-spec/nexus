/* ==========================================================================
   NEXUS MULTIPLAYER TRIVIA ENGINE & SUPABASE REALTIME MANAGER
   Synchronizes room creation, room join (6-char code A7K9P2), lobby waiting,
   Supabase Realtime updates, host game start, synchronized questions,
   live countdown timer, independent answer submission, and final leaderboard.
   ========================================================================== */

const Multiplayer = {
  currentGame: null,
  currentPlayer: null,
  isHost: false,
  realtimeChannel: null,
  playersList: [],
  questionsList: [],
  currentIndex: 0,
  timerInterval: null,
  timeRemainingSec: 10,
  hasAnsweredCurrent: false,

  // 1. Initialize Multiplayer Flow
  async initCreateGameFlow() {
    this.resetState();
    App.showScreen('mpCreateGameScreen');

    // Populate Term dropdown from Supabase
    const termSelect = document.getElementById('mpTermSelect');
    if (termSelect) {
      termSelect.innerHTML = '<option value="">Loading Terms...</option>';
      const terms = await DB.getTerms();
      termSelect.innerHTML = '';
      if (terms.length === 0) {
        termSelect.innerHTML = `
          <option value="term-1">Term 1 (Physical & Chemical Science)</option>
          <option value="term-2">Term 2 (Earth & Climate Systems)</option>
          <option value="term-3">Term 3 (Physics & Electricity)</option>
        `;
      } else {
        terms.forEach((t, i) => {
          const opt = document.createElement('option');
          opt.value = t.id;
          opt.textContent = t.title || t.name || `Term ${i + 1}`;
          termSelect.appendChild(opt);
        });
      }
      this.onTermChanged();
    }
  },

  async onTermChanged() {
    const termSelect = document.getElementById('mpTermSelect');
    const topicSelect = document.getElementById('mpTopicSelect');
    if (!termSelect || !topicSelect) return;

    const termId = termSelect.value;
    topicSelect.innerHTML = '<option value="">Loading Topics...</option>';

    const topics = await DB.getTopics(termId);
    topicSelect.innerHTML = '';
    if (topics.length === 0) {
      topicSelect.innerHTML = `
        <option value="">All Curriculum Topics</option>
        <option value="chemical-reactions">Chemical Reactions & Equations</option>
        <option value="homeostasis">Homeostasis & Evolution</option>
      `;
    } else {
      const allOpt = document.createElement('option');
      allOpt.value = '';
      allOpt.textContent = 'All Curriculum Topics';
      topicSelect.appendChild(allOpt);

      topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.title || t.name;
        topicSelect.appendChild(opt);
      });
    }
  },

  initJoinGameFlow() {
    this.resetState();
    const input = document.getElementById('mpRoomCodeInput');
    const err = document.getElementById('mpJoinError');
    if (input) input.value = '';
    if (err) err.classList.add('hidden');

    App.showScreen('mpJoinGameScreen');
  },

  // 2. Create Lobby & Generate 6-Character Room Code
  async submitCreateLobby() {
    const termSelect = document.getElementById('mpTermSelect');
    const topicSelect = document.getElementById('mpTopicSelect');
    const mediumSelect = document.getElementById('mpMediumSelect');
    const countSelect = document.getElementById('mpCountSelect');
    const errEl = document.getElementById('mpCreateError');

    if (errEl) errEl.classList.add('hidden');

    const config = {
      termId: termSelect ? termSelect.value : null,
      topicId: topicSelect ? topicSelect.value : null,
      answerMedium: mediumSelect ? mediumSelect.value : 'multiple_choice',
      questionCount: countSelect ? parseInt(countSelect.value, 10) : 10
    };

    try {
      const btn = document.getElementById('mpCreateBtn');
      if (btn) btn.disabled = true;

      const game = await DB.createMultiplayerGame(config);
      this.currentGame = game;
      this.isHost = true;
      this.questionsList = game.formattedQuestions || [];

      await this.enterLobbyWaitingScreen(game.room_code);
    } catch (e) {
      console.error(e);
      if (errEl) {
        errEl.textContent = `⚠️ Error creating lobby: ${e.message || 'Server error'}`;
        errEl.classList.remove('hidden');
      }
    } finally {
      const btn = document.getElementById('mpCreateBtn');
      if (btn) btn.disabled = false;
    }
  },

  // 3. Join Lobby with 6-Character Code Validation
  async submitJoinLobby() {
    const input = document.getElementById('mpRoomCodeInput');
    const errEl = document.getElementById('mpJoinError');
    const btn = document.getElementById('mpJoinSubmitBtn');

    if (errEl) errEl.classList.add('hidden');
    const codeVal = (input ? input.value : '').toUpperCase().trim();

    if (codeVal.length !== 6) {
      if (errEl) {
        errEl.textContent = '⚠️ Please enter a valid 6-character room code (e.g. A7K9P2)!';
        errEl.classList.remove('hidden');
      }
      return;
    }

    try {
      if (btn) btn.disabled = true;
      const game = await DB.joinMultiplayerGame(codeVal);
      this.currentGame = game;
      this.isHost = false;

      await this.enterLobbyWaitingScreen(game.room_code || codeVal);
    } catch (e) {
      console.error(e);
      if (errEl) {
        errEl.textContent = `⚠️ ${e.message || 'Unable to join room'}`;
        errEl.classList.remove('hidden');
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  // 4. Enter Lobby Waiting Screen & Subscribe to Realtime Updates
  async enterLobbyWaitingScreen(roomCode) {
    App.showScreen('mpLobbyWaitingScreen');

    const codeDisplay = document.getElementById('mpRoomCodeDisplay');
    if (codeDisplay) codeDisplay.textContent = roomCode;

    // Load initial players list
    await this.refreshPlayersList();
    this.renderLobbyUI();

    // Subscribe to Supabase Realtime Channel
    this.subscribeToRealtime(roomCode);
  },

  async refreshPlayersList() {
    if (!this.currentGame) return;
    this.playersList = await DB.getMultiplayerPlayers(this.currentGame.id);

    // Identify current player
    const myUuid = DB.getUserUUID();
    this.currentPlayer = this.playersList.find(p => p.user_id === myUuid || p.is_host === this.isHost) || this.playersList[0];
  },

  renderLobbyUI() {
    const listEl = document.getElementById('mpLobbyPlayersList');
    const countEl = document.getElementById('mpLobbyPlayerCount');
    const hostControls = document.getElementById('mpHostControls');
    const playerMsg = document.getElementById('mpPlayerWaitingMsg');
    const startBtn = document.getElementById('mpStartGameBtn');

    if (countEl) countEl.textContent = `Joined Players (${this.playersList.length}/10)`;
    if (listEl) {
      listEl.innerHTML = '';
      if (this.playersList.length === 0) {
        listEl.innerHTML = '<div style="color:#94A3B8; padding:16px; text-align:center;">Waiting for players to join...</div>';
      } else {
        this.playersList.forEach(p => {
          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23DDD6FE'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236D28D9'>👤</text></svg>";
          card.innerHTML = `
            <div class="part-info-left">
              <img src="${p.photo_url || defaultAvatar}" class="part-avatar" alt="${p.display_name}">
              <div>
                <h5 style="margin:0; font-size:0.9rem; color:#1E293B;">${p.display_name} ${p.is_host ? '<span class="badge" style="background:#DDD6FE; color:#6D28D9; padding:2px 6px; border-radius:6px; font-size:0.7rem;">HOST</span>' : ''}</h5>
                <span style="font-size:0.72rem; color:#64748B;">Ready to play</span>
              </div>
            </div>
          `;
          listEl.appendChild(card);
        });
      }
    }

    if (this.isHost) {
      if (hostControls) hostControls.style.display = 'block';
      if (playerMsg) playerMsg.style.display = 'none';
      if (startBtn) startBtn.disabled = (this.playersList.length < 1); // Allow minimum 1 for test, 2 for multi
    } else {
      if (hostControls) hostControls.style.display = 'none';
      if (playerMsg) playerMsg.style.display = 'block';
    }
  },

  // 5. Supabase Realtime Subscription Management
  subscribeToRealtime(roomCode) {
    this.unsubscribeRealtime();

    if (!supabaseClient) return;

    try {
      const channelName = 'mp_game_' + roomCode;
      this.realtimeChannel = supabaseClient
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'multiplayer_players' }, async () => {
          await this.refreshPlayersList();
          if (App.currentScreen === 'mpLobbyWaitingScreen') {
            this.renderLobbyUI();
          } else if (App.currentScreen === 'mpQuizGameplayScreen') {
            this.renderLiveScoreboard();
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'multiplayer_games' }, async (payload) => {
          const updated = payload.new;
          if (updated && updated.room_code === roomCode) {
            this.handleGameStatusUpdate(updated);
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription fallback:', e);
    }
  },

  unsubscribeRealtime() {
    if (this.realtimeChannel && supabaseClient) {
      try {
        supabaseClient.removeChannel(this.realtimeChannel);
      } catch (e) {}
      this.realtimeChannel = null;
    }
  },

  async handleGameStatusUpdate(gameObj) {
    if (!gameObj) return;

    if (gameObj.status === 'cancelled') {
      this.unsubscribeRealtime();
      alert('⚠️ The host has cancelled the game.');
      App.showScreen('homeScreen');
      return;
    }

    if ((gameObj.status === 'starting' || gameObj.status === 'active') && App.currentScreen === 'mpLobbyWaitingScreen') {
      // Host launched game -> fetch synced questions and start gameplay!
      if (this.questionsList.length === 0) {
        this.questionsList = await DB.getMultiplayerQuestions(this.currentGame.id);
      }
      this.currentIndex = gameObj.current_question_index || 0;
      this.startMultiplayerQuizGameplay();
      return;
    }

    if (gameObj.status === 'active' && App.currentScreen === 'mpQuizGameplayScreen') {
      if (gameObj.current_question_index !== this.currentIndex) {
        this.currentIndex = gameObj.current_question_index;
        this.renderCurrentQuestion();
      }
    }

    if (gameObj.status === 'finished') {
      this.showFinalLeaderboard();
    }
  },

  // 6. Host Controls: Start & Cancel Game
  async hostStartGame() {
    if (!this.isHost || !this.currentGame) return;

    try {
      const btn = document.getElementById('mpStartGameBtn');
      if (btn) btn.disabled = true;

      // Update game status in Supabase to active
      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'active', 0);

      if (this.questionsList.length === 0) {
        this.questionsList = await DB.getMultiplayerQuestions(this.currentGame.id);
      }
      this.currentIndex = 0;
      this.startMultiplayerQuizGameplay();
    } catch (e) {
      console.error(e);
      alert('Error starting game: ' + e.message);
    }
  },

  async hostCancelGame() {
    if (!this.isHost || !this.currentGame) return;

    if (confirm('Are you sure you want to cancel this game for all players?')) {
      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'cancelled');
      this.unsubscribeRealtime();
      App.showScreen('homeScreen');
    }
  },

  // 7. Multiplayer Synchronized Trivia Gameplay
  startMultiplayerQuizGameplay() {
    App.showScreen('mpQuizGameplayScreen');
    this.renderCurrentQuestion();
  },

  renderCurrentQuestion() {
    clearInterval(this.timerInterval);
    this.hasAnsweredCurrent = false;

    if (!this.questionsList || this.currentIndex >= this.questionsList.length) {
      this.showFinalLeaderboard();
      return;
    }

    const q = this.questionsList[this.currentIndex];
    if (!q) {
      this.showFinalLeaderboard();
      return;
    }

    // UI Header Elements
    const qCounter = document.getElementById('mpQCounter');
    const qText = document.getElementById('mpQuestionText');
    const feedbackBanner = document.getElementById('mpFeedbackBanner');
    const nextBtn = document.getElementById('mpNextQuestionBtn');

    if (qCounter) qCounter.textContent = `Question ${this.currentIndex + 1} of ${this.questionsList.length}`;
    if (qText) qText.textContent = q.question;
    if (feedbackBanner) feedbackBanner.className = 'feedback-banner hidden';

    if (nextBtn) {
      nextBtn.style.display = this.isHost ? 'inline-block' : 'none';
      nextBtn.disabled = false;
    }

    // Render Answer Options
    const container = document.getElementById('mpAnswersContainer');
    if (container) {
      container.innerHTML = '';

      if (q.type === 'tf') {
        ['True', 'False'].forEach(label => {
          const btn = document.createElement('button');
          btn.className = 'answer-option-btn tf-option-btn';
          btn.innerHTML = `<span>${label}</span>`;
          btn.onclick = () => this.handleAnswerSubmit(label);
          container.appendChild(btn);
        });
      } else if (q.type === 'id') {
        const wrap = document.createElement('div');
        wrap.className = 'identification-wrapper';
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '10px';
        wrap.innerHTML = `
          <input type="text" id="mpIdInput" placeholder="Type answer here..." class="identification-input-field" autocomplete="off">
          <button id="mpIdSubmitBtn" class="next-question-btn">Submit Answer ➡</button>
        `;
        container.appendChild(wrap);

        const inputEl = document.getElementById('mpIdInput');
        const subBtn = document.getElementById('mpIdSubmitBtn');
        if (subBtn) subBtn.onclick = () => this.handleAnswerSubmit(inputEl.value);
        if (inputEl) {
          inputEl.onkeyup = (e) => { if (e.key === 'Enter') subBtn.click(); };
          setTimeout(() => inputEl.focus(), 100);
        }
      } else {
        // Multiple Choice
        const prefixes = ['A', 'B', 'C', 'D'];
        (q.options || []).forEach((optText, idx) => {
          const btn = document.createElement('button');
          btn.className = 'answer-option-btn';
          btn.innerHTML = `
            <div class="option-badge-pill"><span class="badge-letter">${prefixes[idx] || 'A'}</span></div>
            <span>${optText}</span>
          `;
          btn.onclick = () => this.handleAnswerSubmit(idx);
          container.appendChild(btn);
        });
      }
    }

    // Start 10s Countdown Timer
    this.timeRemainingSec = q.timeLimit || 10;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeRemainingSec--;
      this.updateTimerDisplay();

      if (this.timeRemainingSec <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeOut();
      }
    }, 1000);

    this.renderLiveScoreboard();
  },

  updateTimerDisplay() {
    const valEl = document.getElementById('mpTimerValue');
    if (valEl) {
      const secs = Math.max(0, this.timeRemainingSec);
      valEl.textContent = `${secs < 10 ? '0' : ''}${secs}.00s`;
    }
  },

  // 8. Answer Submission & Scoring
  async handleAnswerSubmit(userChoice) {
    if (this.hasAnsweredCurrent) return;
    this.hasAnsweredCurrent = true;
    clearInterval(this.timerInterval);

    const q = this.questionsList[this.currentIndex];
    if (!q) return;

    const timeSpent = (q.timeLimit || 10) - this.timeRemainingSec;
    let isCorrect = false;

    if (q.type === 'tf') {
      const correctStr = String(q.rawAnswer || q.options[q.answer] || 'True').trim().toLowerCase();
      const selStr = String(userChoice).trim().toLowerCase();
      isCorrect = (correctStr === selStr || (correctStr.startsWith('t') && selStr.startsWith('t')) || (correctStr.startsWith('f') && selStr.startsWith('f')));
    } else if (q.type === 'id') {
      const correctStr = String(q.rawAnswer || '').trim().toLowerCase();
      const selStr = String(userChoice).trim().toLowerCase();
      isCorrect = (selStr !== '' && (correctStr === selStr || correctStr.includes(selStr) || selStr.includes(correctStr)));
    } else {
      isCorrect = (userChoice === q.answer);
    }

    const earnedPoints = isCorrect ? Math.round(100 + (this.timeRemainingSec * 10)) : 0;

    // Show immediate feedback to current player
    const feedback = document.getElementById('mpFeedbackBanner');
    const statusText = document.getElementById('mpFeedbackText');
    const subText = document.getElementById('mpFeedbackAnswerSub');

    if (feedback) feedback.className = `feedback-banner ${isCorrect ? 'correct' : 'wrong'}`;
    if (statusText) statusText.textContent = isCorrect ? `✅ Correct! +${earnedPoints} pts` : '❌ Incorrect!';
    if (subText) subText.innerHTML = `Submitted Answer: <b>${isCorrect ? 'Correct!' : (q.rawAnswer || 'Wrong')}</b>`;

    // Disable input options
    const btns = document.querySelectorAll('#mpAnswersContainer button, #mpIdInput');
    btns.forEach(b => b.disabled = true);

    // Submit answer securely to Supabase
    if (this.currentGame && this.currentPlayer) {
      await DB.submitMultiplayerAnswer(
        this.currentGame.id,
        this.currentPlayer.id,
        q.id,
        userChoice,
        isCorrect,
        timeSpent,
        earnedPoints
      );
      await this.refreshPlayersList();
      this.renderLiveScoreboard();
    }
  },

  handleTimeOut() {
    if (this.hasAnsweredCurrent) return;
    this.hasAnsweredCurrent = true;

    const feedback = document.getElementById('mpFeedbackBanner');
    const statusText = document.getElementById('mpFeedbackText');

    if (feedback) feedback.className = 'feedback-banner wrong';
    if (statusText) statusText.textContent = '⏱ Time Expired!';

    const btns = document.querySelectorAll('#mpAnswersContainer button, #mpIdInput');
    btns.forEach(b => b.disabled = true);
  },

  // 9. Host Progression to Next Question
  async nextQuestion() {
    if (!this.isHost) return;

    this.currentIndex++;
    if (this.currentIndex >= this.questionsList.length) {
      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'finished');
      this.showFinalLeaderboard();
    } else {
      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'active', this.currentIndex);
      this.renderCurrentQuestion();
    }
  },

  renderLiveScoreboard() {
    const listEl = document.getElementById('mpLiveScoreList');
    if (!listEl) return;

    listEl.innerHTML = '';
    const sorted = [...this.playersList].sort((a, b) => (b.score || 0) - (a.score || 0));

    sorted.forEach((p, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; padding:6px 12px; font-size:0.8rem; border-bottom:1px solid #F1F5F9;';
      row.innerHTML = `
        <span><b>#${i + 1}</b> ${p.display_name}</span>
        <span style="color:#6D28D9; font-weight:800;">${(p.score || 0).toLocaleString()} pts</span>
      `;
      listEl.appendChild(row);
    });
  },

  // 10. Synchronized Final Leaderboard
  async showFinalLeaderboard() {
    clearInterval(this.timerInterval);
    App.showScreen('mpResultsScreen');

    await this.refreshPlayersList();
    const listEl = document.getElementById('mpFinalLeaderboardList');
    if (!listEl) return;

    listEl.innerHTML = '';
    const sorted = [...this.playersList].sort((a, b) => (b.score || 0) - (a.score || 0));
    const medals = ['🥇', '🥈', '🥉'];

    sorted.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'leaderboard-row-card';
      card.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border:1px solid #E2E8F0; padding:12px 16px; border-radius:12px; margin-bottom:8px;';

      const totalQ = this.questionsList.length || 10;
      const pct = Math.round(((p.correct_answers || 0) / totalQ) * 100);

      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:1.3rem;">${medals[idx] || `#${idx + 1}`}</span>
          <div>
            <h4 style="margin:0; font-size:0.95rem; color:#1E293B;">${p.display_name}</h4>
            <span style="font-size:0.75rem; color:#64748B;">Correct: ${p.correct_answers || 0}/${totalQ} (${pct}%)</span>
          </div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:1.1rem; font-weight:900; color:#6D28D9;">${(p.score || 0).toLocaleString()}</span>
          <span style="font-size:0.7rem; color:#64748B; display:block;">pts</span>
        </div>
      `;
      listEl.appendChild(card);
    });
  },

  copyRoomCode() {
    if (!this.currentGame || !this.currentGame.room_code) return;
    const code = this.currentGame.room_code;
    navigator.clipboard.writeText(code).then(() => {
      alert(`Room code ${code} copied to clipboard!`);
    }).catch(() => {
      prompt('Copy Room Code:', code);
    });
  },

  resetState() {
    this.unsubscribeRealtime();
    clearInterval(this.timerInterval);
    this.currentGame = null;
    this.currentPlayer = null;
    this.isHost = false;
    this.playersList = [];
    this.questionsList = [];
    this.currentIndex = 0;
    this.hasAnsweredCurrent = false;
  }
};
