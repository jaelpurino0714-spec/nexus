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

      const code = game.room_code || codeVal;
      if (game.status === 'active' || game.status === 'in_progress' || game.status === 'starting') {
        App.showScreen('mpQuizGameplayScreen');
        this.questionsList = await DB.getMultiplayerQuestions(game.id, code);
        this.currentIndex = game.current_question_index || 0;
        this.startMultiplayerQuizGameplay();
      } else {
        await this.enterLobbyWaitingScreen(code);
      }
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

    const cleanCode = (roomCode || '').toUpperCase().trim();
    const codeDisplay = document.getElementById('mpRoomCodeDisplay');
    if (codeDisplay) codeDisplay.textContent = cleanCode;

    // Generate Join URL & Render Dynamic QR Code
    const joinUrl = this.getJoinUrl(cleanCode);
    const qrImg = document.getElementById('mpQrCodeImg');
    if (qrImg) {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(joinUrl)}`;
      qrImg.src = qrApiUrl;
    }

    // Save QR Code URL payload to Supabase
    if (this.currentGame && this.currentGame.id) {
      DB.saveQrCodeUrlToSupabase(this.currentGame.id, joinUrl);
    }

    // Load initial players list
    await this.refreshPlayersList();
    this.renderLobbyUI();

    // Subscribe to Supabase Realtime & Start Lobby Polling Engine
    this.subscribeToRealtime(cleanCode);
    this.startLobbyPolling(cleanCode);
  },

  async refreshPlayersList() {
    if (!this.currentGame) return;
    this.playersList = await DB.getMultiplayerPlayers(this.currentGame.id, this.currentGame.room_code);

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

    // Filter joined players (excluding the host)
    const hostUuid = this.currentGame ? this.currentGame.host_id : null;
    let joinedOnly = this.playersList.filter(p => !p.is_host && p.user_id !== hostUuid);

    if (joinedOnly.length === 0 && this.playersList.length > 0) {
      joinedOnly = this.playersList.filter(p => p.user_id !== hostUuid);
    }
    if (joinedOnly.length === 0 && this.playersList.length > 1) {
      joinedOnly = this.playersList.slice(1);
    }

    if (countEl) countEl.textContent = `Joined Players (${joinedOnly.length}/10)`;
    if (listEl) {
      listEl.innerHTML = '';
      if (joinedOnly.length === 0) {
        listEl.innerHTML = '<div style="color:#94A3B8; padding:16px; text-align:center;">Waiting for players to join...</div>';
      } else {
        joinedOnly.forEach(p => {
          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23DDD6FE'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236D28D9'>👤</text></svg>";
          card.innerHTML = `
            <div class="part-info-left">
              <img src="${p.photo_url || defaultAvatar}" class="part-avatar" alt="${p.display_name}">
              <div>
                <h5 style="margin:0; font-size:0.9rem; color:#1E293B;">${p.display_name}</h5>
                <span style="font-size:0.72rem; color:#10B981; font-weight:600;">● Joined & Ready</span>
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
      if (startBtn) startBtn.disabled = false;
    } else {
      if (hostControls) hostControls.style.display = 'none';
      if (playerMsg) playerMsg.style.display = 'block';
    }
  },

  // 5. Supabase Realtime & BroadcastChannel Sync Engine
  subscribeToRealtime(roomCode) {
    if (!roomCode) return;
    const cleanCode = roomCode.toUpperCase().trim();

    // Re-use active WebSocket channel if already subscribed to this room
    if (this.currentRoomCode === cleanCode && this.realtimeChannel) {
      return;
    }

    this.unsubscribeRealtime();
    this.currentRoomCode = cleanCode;

    const handleSync = async (updatedState) => {
      await this.refreshPlayersList();
      if (updatedState && updatedState.status) {
        this.handleGameStatusUpdate(updatedState);
      }
      if (App.currentScreen === 'mpLobbyWaitingScreen') {
        this.renderLobbyUI();
      } else if (App.currentScreen === 'mpQuizGameplayScreen') {
        this.renderLiveScoreboard();
      }
    };

    // BroadcastChannel sync
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('nexus_mp_channel_' + cleanCode);
        this.broadcastChannel.onmessage = (msg) => {
          if (msg.data && msg.data.state) {
            handleSync(msg.data.state);
          }
        };
      } catch (e) {}
    }

    // Storage event sync
    this.storageListener = (e) => {
      if (e.key === 'nexus_mp_lobby_' + cleanCode) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleSync(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', this.storageListener);

    // 3. Supabase Realtime Channels (Broadcast + Presence + Postgres Changes)
    if (supabaseClient) {
      try {
        const channelName = 'mp_game_' + cleanCode;
        const myUuid = DB.getUserUUID();
        const profile = DB.getStudentProfile() || { name: 'Player' };

        this.realtimeChannel = supabaseClient.channel(channelName, {
          config: {
            presence: { key: myUuid },
            broadcast: { self: true }
          }
        });

        // Supabase Realtime PRESENCE (Auto Online/Offline Presence Tracking)
        this.realtimeChannel
          .on('presence', { event: 'sync' }, async () => {
            await this.refreshPlayersList();
            if (App.currentScreen === 'mpLobbyWaitingScreen') this.renderLobbyUI();
          })
          .on('presence', { event: 'join' }, async () => {
            await this.refreshPlayersList();
            if (App.currentScreen === 'mpLobbyWaitingScreen') this.renderLobbyUI();
          })
          .on('presence', { event: 'leave' }, async () => {
            await this.refreshPlayersList();
            if (App.currentScreen === 'mpLobbyWaitingScreen') this.renderLobbyUI();
          });

        // Supabase Realtime BROADCAST (Sub-50ms Ephemeral Messaging)
        this.realtimeChannel.on('broadcast', { event: 'game_action' }, (payload) => {
          if (payload && payload.payload) {
            const data = payload.payload;
            if (data.action === 'start_game') {
              this.handleGameStatusUpdate({ status: 'active', current_question_index: 0 });
            } else if (data.action === 'next_question') {
              this.handleGameStatusUpdate({ status: 'active', current_question_index: data.index });
            } else if (data.action === 'cancel_game') {
              this.handleGameStatusUpdate({ status: 'cancelled' });
            } else if (data.action === 'finish_game') {
              this.handleGameStatusUpdate({ status: 'finished' });
            }
          }
        });

        // Supabase Realtime POSTGRES_CHANGES (Database Changes)
        this.realtimeChannel
          .on('postgres_changes', { event: '*', schema: 'public', table: 'multiplayer_players' }, async () => handleSync())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_participants' }, async () => handleSync())
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'multiplayer_games' }, async (payload) => {
            if (payload.new && payload.new.room_code === cleanCode) handleSync(payload.new);
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_lobbies' }, async (payload) => {
            if (payload.new && payload.new.access_code === cleanCode) handleSync(payload.new);
          });

        // Subscribe to channel and track presence state
        this.realtimeChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            try {
              this.realtimeChannel.track({
                user_id: myUuid,
                display_name: profile.name || 'Player',
                photo_url: profile.photo || null,
                is_host: this.isHost,
                joined_at: new Date().toISOString()
              });
            } catch (err) {}
          }
        });
      } catch (e) {
        console.warn('Realtime subscription error:', e);
      }
    }
  },

  sendRealtimeBroadcast(action, extraData = {}) {
    if (this.realtimeChannel) {
      try {
        this.realtimeChannel.send({
          type: 'broadcast',
          event: 'game_action',
          payload: { action, ...extraData }
        });
      } catch (e) {}
    }
  },

  unsubscribeRealtime() {
    this.currentRoomCode = null;
    if (this.realtimeChannel && supabaseClient) {
      const ch = this.realtimeChannel;
      this.realtimeChannel = null;
      try { ch.untrack(); } catch (e) {}
      setTimeout(() => {
        try { supabaseClient.removeChannel(ch); } catch (e) {}
      }, 100);
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) {}
      this.broadcastChannel = null;
    }
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
  },

  async handleGameStatusUpdate(gameObj) {
    if (!gameObj) return;

    const status = gameObj.status;

    if (status === 'cancelled') {
      this.stopLobbyPolling();
      this.stopGameplayPolling();
      this.unsubscribeRealtime();
      alert('⚠️ The host has cancelled the game.');
      App.showScreen('homeScreen');
      return;
    }

    if ((status === 'starting' || status === 'active' || status === 'in_progress') && App.currentScreen === 'mpLobbyWaitingScreen') {
      this.stopLobbyPolling();
      if (!this.currentGame) this.currentGame = gameObj;
      const gId = this.currentGame ? this.currentGame.id : gameObj.id;
      const rCode = this.currentGame ? this.currentGame.room_code : (gameObj.room_code || gameObj.access_code);

      this.questionsList = await DB.getMultiplayerQuestions(gId, rCode);
      this.currentIndex = gameObj.current_question_index || 0;
      this.startMultiplayerQuizGameplay();
      return;
    }

    if ((status === 'active' || status === 'in_progress') && App.currentScreen === 'mpQuizGameplayScreen') {
      if (gameObj.current_question_index !== undefined && gameObj.current_question_index !== this.currentIndex) {
        this.currentIndex = gameObj.current_question_index;
        this.renderCurrentQuestion();
      }
    }

    if (status === 'finished' || status === 'completed') {
      this.stopGameplayPolling();
      this.showFinalLeaderboard();
    }
  },

  // 6. Lobby & Gameplay Polling Engine
  startLobbyPolling(roomCode) {
    this.stopLobbyPolling();
    this.lobbyPollInterval = setInterval(async () => {
      if (App.currentScreen !== 'mpLobbyWaitingScreen') {
        this.stopLobbyPolling();
        return;
      }
      const code = roomCode || (this.currentGame ? this.currentGame.room_code : null);
      if (!code) return;

      const gameData = await DB.getMultiplayerGameByCode(code);
      if (gameData) {
        if (gameData.status === 'active' || gameData.status === 'in_progress' || gameData.status === 'starting') {
          this.stopLobbyPolling();
          if (!this.currentGame) this.currentGame = gameData;
          const gId = this.currentGame ? this.currentGame.id : gameData.id;

          this.questionsList = await DB.getMultiplayerQuestions(gId, code);
          this.currentIndex = gameData.current_question_index || 0;
          this.startMultiplayerQuizGameplay();
          return;
        } else if (gameData.status === 'cancelled') {
          this.stopLobbyPolling();
          this.unsubscribeRealtime();
          alert('⚠️ The host has cancelled the game.');
          App.showScreen('homeScreen');
          return;
        }
      }
      await this.refreshPlayersList();
      this.renderLobbyUI();
    }, 1000);
  },

  stopLobbyPolling() {
    if (this.lobbyPollInterval) {
      clearInterval(this.lobbyPollInterval);
      this.lobbyPollInterval = null;
    }
  },

  startGameplayPolling(roomCode) {
    this.stopGameplayPolling();
    this.gameplayPollInterval = setInterval(async () => {
      if (App.currentScreen !== 'mpQuizGameplayScreen') {
        this.stopGameplayPolling();
        return;
      }
      if (this.currentGame) {
        const gameData = await DB.getMultiplayerGameByCode(roomCode);
        if (gameData) {
          if (gameData.status === 'finished') {
            this.stopGameplayPolling();
            this.showFinalLeaderboard();
            return;
          }
          if (gameData.current_question_index !== undefined && gameData.current_question_index !== this.currentIndex) {
            this.currentIndex = gameData.current_question_index;
            this.renderCurrentQuestion();
          }
        }
        await this.refreshPlayersList();
        this.renderLiveScoreboard();
      }
    }, 1500);
  },

  stopGameplayPolling() {
    if (this.gameplayPollInterval) {
      clearInterval(this.gameplayPollInterval);
      this.gameplayPollInterval = null;
    }
  },

  // 7. Host Controls: Start & Cancel Game
  async hostStartGame() {
    if (!this.isHost || !this.currentGame) return;

    try {
      const btn = document.getElementById('mpStartGameBtn');
      if (btn) btn.disabled = true;

      const code = this.currentGame.room_code;
      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'active', 0);

      const localState = DB.getLocalLobbyState(code);
      if (localState) {
        localState.status = 'active';
        localState.currentIndex = 0;
        DB.saveLocalLobbyState(code, localState);
      }

      // Send instant Supabase Realtime Broadcast to all connected clients
      this.sendRealtimeBroadcast('start_game', { index: 0 });

      if (this.questionsList.length === 0) {
        this.questionsList = await DB.getMultiplayerQuestions(this.currentGame.id, code);
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
      const code = this.currentGame.room_code;
      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'cancelled');
      this.sendRealtimeBroadcast('cancel_game');
      const localState = DB.getLocalLobbyState(code);
      if (localState) {
        localState.status = 'cancelled';
        DB.saveLocalLobbyState(code, localState);
      }
      this.stopLobbyPolling();
      this.unsubscribeRealtime();
      App.showScreen('homeScreen');
    }
  },

  // 8. Multiplayer Synchronized Trivia Gameplay
  startMultiplayerQuizGameplay() {
    this.stopLobbyPolling();
    App.showScreen('mpQuizGameplayScreen');
    if (this.currentGame) {
      this.startGameplayPolling(this.currentGame.room_code);
    }
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

    // Render Answer Options (Host Mode vs Player Mode)
    const container = document.getElementById('mpAnswersContainer');
    if (container) {
      container.innerHTML = '';

      if (this.isHost) {
        // Host viewing mode notice banner
        const hostNotice = document.createElement('div');
        hostNotice.style.cssText = 'background:#EEF2FF; border:1px solid #C7D2FE; color:#3730A3; padding:10px 14px; border-radius:12px; font-weight:700; font-size:0.85rem; text-align:center; margin-bottom:12px;';
        hostNotice.innerHTML = '👑 <b>Host Viewing Mode</b> — Viewing question & live player scoreboard. Press <b>Next Question ➡</b> when ready.';
        container.appendChild(hostNotice);

        // Display read-only option choices for host
        if (q.type === 'tf') {
          ['True', 'False'].forEach(label => {
            const btn = document.createElement('button');
            btn.className = 'answer-option-btn tf-option-btn';
            btn.disabled = true;
            btn.style.opacity = '0.85';
            btn.style.cursor = 'default';
            btn.innerHTML = `<span>${label}</span>`;
            container.appendChild(btn);
          });
        } else if (q.type === 'id') {
          const wrap = document.createElement('div');
          wrap.innerHTML = `<div style="padding:12px; background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:10px; color:#475569; text-align:center; font-weight:600;">Identification Question — Waiting for joined players to type answers.</div>`;
          container.appendChild(wrap);
        } else {
          const prefixes = ['A', 'B', 'C', 'D'];
          (q.options || []).forEach((optText, idx) => {
            const btn = document.createElement('button');
            btn.className = 'answer-option-btn';
            btn.disabled = true;
            btn.style.opacity = '0.85';
            btn.style.cursor = 'default';
            btn.innerHTML = `
              <div class="option-badge-pill"><span class="badge-letter">${prefixes[idx] || 'A'}</span></div>
              <span>${optText}</span>
            `;
            container.appendChild(btn);
          });
        }
      } else {
        // Player interactive mode
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
    if (this.isHost || this.hasAnsweredCurrent) return;
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
      this.sendRealtimeBroadcast('finish_game');
      this.showFinalLeaderboard();
    } else {
      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'active', this.currentIndex);
      this.sendRealtimeBroadcast('next_question', { index: this.currentIndex });
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

  getJoinUrl(roomCode) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?join=${roomCode.toUpperCase().trim()}`;
  },

  copyRoomCode() {
    if (!this.currentGame || !this.currentGame.room_code) return;
    const code = this.currentGame.room_code;
    navigator.clipboard.writeText(code).then(() => {
      alert(`Room text code ${code} copied to clipboard!`);
    }).catch(() => {
      prompt('Copy Room Text Code:', code);
    });
  },

  copyJoinLink() {
    if (!this.currentGame || !this.currentGame.room_code) return;
    const link = this.getJoinUrl(this.currentGame.room_code);
    navigator.clipboard.writeText(link).then(() => {
      alert(`Join link copied to clipboard!\n${link}`);
    }).catch(() => {
      prompt('Copy Join Link:', link);
    });
  },

  checkAutoJoinFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let joinCode = urlParams.get('join') || urlParams.get('code');
      if (!joinCode && window.location.hash.includes('join=')) {
        joinCode = window.location.hash.split('join=')[1];
      }

      if (joinCode && joinCode.trim().length === 6) {
        const cleanCode = joinCode.trim().toUpperCase();
        setTimeout(() => {
          this.initJoinGameFlow();
          const input = document.getElementById('mpRoomCodeInput');
          if (input) input.value = cleanCode;
        }, 400);
      }
    } catch (e) {
      console.warn('URL auto-join check error:', e);
    }
  },

  resetState() {
    this.stopLobbyPolling();
    this.stopGameplayPolling();
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
