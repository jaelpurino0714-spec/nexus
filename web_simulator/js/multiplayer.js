/* ==========================================================================
   NEXUS KAHOOT-STYLE REALTIME MULTIPLAYER TRIVIA ENGINE
   Uses Supabase Realtime Channels (game:<game_id>), Presence (connected user state),
   and Broadcast (ephemeral sub-50ms game events) with Supabase Postgres.
   ========================================================================== */

const Multiplayer = {
  currentGame: null,
  currentPlayer: null,
  isHost: false,
  realtimeChannel: null,
  currentChannelName: null,
  playersList: [],
  questionsList: [],
  currentIndex: 0,
  timerInterval: null,
  questionStartedAt: null,
  questionDurationSec: 20,
  hasAnsweredCurrent: false,
  answeredCount: 0,

  resetState() {
    this.currentGame = null;
    this.currentPlayer = null;
    this.isHost = false;
    this.playersList = [];
    this.questionsList = [];
    this.currentIndex = 0;
    this.hasAnsweredCurrent = false;
    this.answeredCount = 0;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.unsubscribeRealtime();
  },

  // 1. Host Flow: Open Host Create Screen & Populate Term/Topic Dropdowns
  async initCreateGameFlow() {
    this.resetState();
    App.showScreen('mpHostCreateScreen');

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

  // 2. Submit Host Game Creation & Generate PIN
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

      await this.enterHostLobbyScreen(game);
    } catch (e) {
      console.error(e);
      if (errEl) {
        errEl.textContent = `⚠️ Error generating PIN: ${e.message || 'Server error'}`;
        errEl.classList.remove('hidden');
      }
    } finally {
      const btn = document.getElementById('mpCreateBtn');
      if (btn) btn.disabled = false;
    }
  },

  // 3. Player Flow: Open Player Join Screen
  initJoinGameFlow() {
    this.resetState();
    const pinInput = document.getElementById('mpPinInput');
    const nameInput = document.getElementById('mpNicknameInput');
    const errEl = document.getElementById('mpJoinError');

    const profile = DB.getStudentProfile() || {};
    if (pinInput) pinInput.value = '';
    if (nameInput) nameInput.value = profile.name || '';
    if (errEl) errEl.classList.add('hidden');

    App.showScreen('mpPlayerJoinScreen');
  },

  // 4. Submit Player Join PIN
  async submitJoinLobby() {
    const pinInput = document.getElementById('mpPinInput');
    const nameInput = document.getElementById('mpNicknameInput');
    const errEl = document.getElementById('mpJoinError');
    const btn = document.getElementById('mpJoinSubmitBtn');

    if (errEl) errEl.classList.add('hidden');
    const pinVal = (pinInput ? pinInput.value : '').toUpperCase().trim();
    const nicknameVal = (nameInput ? nameInput.value : '').trim() || 'Player';

    if (pinVal.length !== 6) {
      if (errEl) {
        errEl.textContent = '⚠️ Please enter a valid 6-digit Game PIN (e.g. 482913)!';
        errEl.classList.remove('hidden');
      }
      return;
    }

    try {
      if (btn) btn.disabled = true;
      const game = await DB.joinMultiplayerGame(pinVal, nicknameVal);
      this.currentGame = game;
      this.isHost = false;

      if (game.status === 'active' || game.status === 'in_progress' || game.status === 'question') {
        App.showScreen('mpPlayerGameScreen');
        this.questionsList = await DB.getMultiplayerQuestions(game.id, game.room_code);
        this.currentIndex = game.current_question_index || 0;
        this.startPlayerGameplay();
      } else {
        await this.enterPlayerLobbyScreen(game, nicknameVal);
      }
    } catch (e) {
      console.error(e);
      if (errEl) {
        errEl.textContent = `⚠️ ${e.message || 'Unable to join game'}`;
        errEl.classList.remove('hidden');
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  // 5. Host Lobby Screen Management
  async enterHostLobbyScreen(game) {
    App.showScreen('mpHostLobbyScreen');
    const pinDisplay = document.getElementById('mpPinDisplay');
    if (pinDisplay) pinDisplay.textContent = game.room_code;

    const joinUrl = this.getJoinUrl(game.room_code);
    const qrImg = document.getElementById('mpQrCodeImg');
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(joinUrl)}`;
    }

    await this.subscribeToGameChannel(game.id, 'host', (DB.getStudentProfile() || {}).name || 'Host');
    this.refreshHostPresenceRoster();
  },

  // 6. Player Lobby Screen Management
  async enterPlayerLobbyScreen(game, nickname) {
    App.showScreen('mpPlayerLobbyScreen');
    const badge = document.getElementById('mpPlayerNicknameBadge');
    const tag = document.getElementById('mpPlayerChannelTag');
    if (badge) badge.textContent = nickname;
    if (tag) tag.textContent = `game:${game.id}`;

    await this.subscribeToGameChannel(game.id, 'player', nickname);
  },

  // 7. Supabase Realtime Channel (`game:<game_id>`) with Presence & Broadcast
  async subscribeToGameChannel(gameId, role, name) {
    if (!gameId) return;
    const channelName = 'game:' + gameId;

    this.unsubscribeRealtime();
    this.currentChannelName = channelName;

    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        const myUuid = DB.getUserUUID();
        const profile = DB.getStudentProfile() || {};

        this.realtimeChannel = supabaseClient.channel(channelName, {
          config: {
            presence: { key: myUuid },
            broadcast: { self: true }
          }
        });

        // A. PRESENCE: Live online tracking & unexpected disconnect handling
        this.realtimeChannel
          .on('presence', { event: 'sync' }, () => this.handlePresenceUpdate())
          .on('presence', { event: 'join' }, () => this.handlePresenceUpdate())
          .on('presence', { event: 'leave' }, () => this.handlePresenceUpdate());

        // B. BROADCAST: Ephemeral game events
        this.realtimeChannel.on('broadcast', { event: 'game_event' }, (payload) => {
          if (payload && payload.payload) {
            this.handleBroadcastEvent(payload.payload);
          }
        });

        // C. Subscribe & Track Presence State
        this.realtimeChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            try {
              await this.realtimeChannel.track({
                playerId: myUuid,
                playerName: name || profile.name || 'Player',
                photoUrl: profile.photo || null,
                role: role,
                joinedAt: new Date().toISOString()
              });
            } catch (err) {}
          }
        });
      } catch (e) {
        console.warn('Realtime subscription error:', e);
      }
    }
  },

  handlePresenceUpdate() {
    if (!this.realtimeChannel || typeof this.realtimeChannel.presenceState !== 'function') return;

    try {
      const presenceObj = this.realtimeChannel.presenceState();
      const onlinePlayers = [];

      Object.values(presenceObj).forEach(presences => {
        (presences || []).forEach(p => {
          if (p.role === 'player' && p.playerName) {
            onlinePlayers.push(p);
          }
        });
      });

      this.playersList = onlinePlayers;

      if (App.currentScreen === 'mpHostLobbyScreen') {
        this.refreshHostPresenceRoster();
      }
    } catch (e) {}
  },

  refreshHostPresenceRoster() {
    const rosterEl = document.getElementById('mpHostPresenceRoster');
    const countEl = document.getElementById('mpHostPlayerCount');

    const online = this.playersList || [];
    if (countEl) countEl.textContent = `Connected Players (${online.length})`;

    if (rosterEl) {
      rosterEl.innerHTML = '';
      if (online.length === 0) {
        rosterEl.innerHTML = '<div style="color:#94A3B8; padding:16px; text-align:center;">Waiting for players to enter PIN...</div>';
      } else {
        online.forEach(p => {
          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23DDD6FE'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236D28D9'>👤</text></svg>";
          card.innerHTML = `
            <div class="part-info-left">
              <img src="${p.photoUrl || defaultAvatar}" class="part-avatar" alt="${p.playerName}">
              <div>
                <h5 style="margin:0; font-size:0.95rem; color:#1E293B; font-weight:700;">${p.playerName}</h5>
                <span style="font-size:0.75rem; color:#10B981; font-weight:600;">● Online in Lobby</span>
              </div>
            </div>
          `;
          rosterEl.appendChild(card);
        });
      }
    }
  },

  sendBroadcast(eventType, payload = {}) {
    if (this.realtimeChannel) {
      try {
        this.realtimeChannel.send({
          type: 'broadcast',
          event: 'game_event',
          payload: { eventType, ...payload }
        });
      } catch (e) {}
    }
  },

  handleBroadcastEvent(data) {
    const { eventType } = data;

    if (eventType === 'GAME_START') {
      this.onGameStart(data);
    } else if (eventType === 'QUESTION_START') {
      this.onQuestionStart(data);
    } else if (eventType === 'PLAYER_ANSWERED') {
      this.onPlayerAnswered(data);
    } else if (eventType === 'QUESTION_LOCK') {
      this.onQuestionLock(data);
    } else if (eventType === 'SHOW_RESULTS') {
      this.onShowResults(data);
    } else if (eventType === 'NEXT_QUESTION') {
      this.onNextQuestion(data);
    } else if (eventType === 'GAME_FINISH') {
      this.onGameFinish(data);
    }
  },

  // 8. Host Controls
  async hostStartGame() {
    if (!this.currentGame) return;

    try {
      const btn = document.getElementById('mpStartGameBtn');
      if (btn) btn.disabled = true;

      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'active', 0);
      if (this.questionsList.length === 0) {
        this.questionsList = await DB.getMultiplayerQuestions(this.currentGame.id, this.currentGame.room_code);
      }

      this.currentIndex = 0;
      this.sendBroadcast('GAME_START', { questionNumber: 1, startedAt: new Date().toISOString(), duration: 20 });
      this.hostRenderQuestion(0);
    } catch (e) {
      console.error(e);
      alert('Error starting game: ' + e.message);
    }
  },

  hostRenderQuestion(index) {
    App.showScreen('mpHostGameScreen');
    this.currentIndex = index;
    this.answeredCount = 0;
    const q = this.questionsList[index];
    if (!q) return;

    document.getElementById('mpHostQCounter').textContent = `Question ${index + 1} of ${this.questionsList.length}`;
    document.getElementById('mpHostQuestionText').textContent = q.question;
    document.getElementById('mpHostAnswerCount').textContent = `0 / ${this.playersList.length} Answered`;

    // Render Host Choice Cards Overview
    const overviewEl = document.getElementById('mpHostAnswersOverview');
    if (overviewEl) {
      overviewEl.innerHTML = '';
      const typeId = q.question_type_id || 1;
      let choicesMap = {};

      if (typeId === 2 || (!q.choice_c && !q.choice_d && (q.correct_answer === 'True' || q.correct_answer === 'False' || q.correct_answer === 'TRUE' || q.correct_answer === 'FALSE'))) {
        choicesMap = { A: 'True', B: 'False' };
      } else {
        choicesMap = {
          A: q.choice_a || q.option_a || 'Option A',
          B: q.choice_b || q.option_b || 'Option B',
          C: q.choice_c || q.option_c || 'Option C',
          D: q.choice_d || q.option_d || 'Option D'
        };
      }

      Object.keys(choicesMap).forEach(key => {
        if (choicesMap[key]) {
          const card = document.createElement('div');
          card.className = 'answer-option-btn';
          card.style.cursor = 'default';
          card.innerHTML = `
            <span class="option-badge-pill"><span class="badge-letter">${key}</span></span>
            <span class="option-text" style="font-weight:600; color:#1E293B;">${choicesMap[key]}</span>
          `;
          overviewEl.appendChild(card);
        }
      });
    }

    const startedAt = new Date().toISOString();
    this.questionStartedAt = startedAt;
    this.questionDurationSec = q.time_limit || 20;

    // Send QUESTION_START Broadcast payload WITHOUT correct_answer!
    this.sendBroadcast('QUESTION_START', {
      questionNumber: index + 1,
      questionId: q.id,
      questionText: q.question,
      questionTypeId: q.question_type_id || 1,
      choices: {
        a: q.choice_a || q.option_a || (q.question_type_id === 2 ? 'True' : null),
        b: q.choice_b || q.option_b || (q.question_type_id === 2 ? 'False' : null),
        c: q.choice_c || q.option_c || null,
        d: q.choice_d || q.option_d || null
      },
      startedAt: startedAt,
      duration: this.questionDurationSec
    });

    this.startSynchronizedTimer('mpHostTimerValue', startedAt, this.questionDurationSec, () => {
      this.hostLockAnswers();
    });
  },

  hostLockAnswers() {
    this.sendBroadcast('QUESTION_LOCK', { questionNumber: this.currentIndex + 1 });
  },

  async hostShowResults() {
    if (!this.currentGame) return;
    const leaderboard = await DB.getGameLeaderboard(this.currentGame.id);
    this.sendBroadcast('SHOW_RESULTS', { questionNumber: this.currentIndex + 1, leaderboard });
    this.renderLeaderboardScreen('Current Standings 📊', leaderboard);
  },

  async hostNextQuestion() {
    if (this.currentIndex + 1 < this.questionsList.length) {
      const nextIdx = this.currentIndex + 1;
      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'active', nextIdx);
      this.hostRenderQuestion(nextIdx);
    } else {
      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'finished');
      const finalLeaderboard = await DB.getGameLeaderboard(this.currentGame.id);
      this.sendBroadcast('GAME_FINISH', { finalLeaderboard });
      this.renderLeaderboardScreen('🏆 Final Podium Leaderboard', finalLeaderboard);
    }
  },

  hostCancelGame() {
    if (confirm('Cancel game session?')) {
      this.unsubscribeRealtime();
      App.showScreen('homeScreen');
    }
  },

  // 9. Player Broadcast Event Callbacks
  onGameStart(data) {
    if (!this.isHost) {
      App.showScreen('mpPlayerGameScreen');
    }
  },

  onQuestionStart(data) {
    if (this.isHost) return;
    App.showScreen('mpPlayerGameScreen');
    this.hasAnsweredCurrent = false;

    const banner = document.getElementById('mpPlayerFeedbackBanner');
    if (banner) banner.className = 'feedback-banner hidden';

    document.getElementById('mpPlayerQCounter').textContent = `Question ${data.questionNumber} of ${this.questionsList.length || 10}`;
    document.getElementById('mpPlayerQuestionText').textContent = data.questionText;

    this.questionStartedAt = data.startedAt;
    this.questionDurationSec = data.duration || 20;

    const container = document.getElementById('mpPlayerAnswersContainer');
    if (container) {
      container.innerHTML = '';
      const typeId = data.questionTypeId || 1;

      if (typeId === 3) {
        // Identification Question: Render Text Input & Submit Button
        const inputWrap = document.createElement('div');
        inputWrap.style.gridColumn = '1 / -1';
        inputWrap.style.display = 'flex';
        inputWrap.style.flexDirection = 'column';
        inputWrap.style.gap = '12px';
        inputWrap.innerHTML = `
          <input type="text" id="mpPlayerTextInput" placeholder="Type your answer here..." class="customize-input" style="font-size:1.2rem; font-weight:700; text-align:center; padding:14px;" />
          <button id="mpSubmitTextBtn" class="primary-btn bottom-start-btn" onclick="Multiplayer.submitPlayerTextChoice('${data.questionId}')">
            Submit Answer ➔
          </button>
        `;
        container.appendChild(inputWrap);
      } else {
        // Multiple Choice or True/False: Render styled .answer-option-btn
        const rawChoices = data.choices || {};
        let choicesMap = {};

        if (typeId === 2 || (rawChoices.a === 'True' && rawChoices.b === 'False')) {
          choicesMap = {
            A: rawChoices.a || 'True',
            B: rawChoices.b || 'False'
          };
        } else {
          choicesMap = {
            A: rawChoices.a || rawChoices.A,
            B: rawChoices.b || rawChoices.B,
            C: rawChoices.c || rawChoices.C,
            D: rawChoices.d || rawChoices.D
          };
        }

        Object.keys(choicesMap).forEach(key => {
          const val = choicesMap[key];
          if (val) {
            const btn = document.createElement('button');
            btn.className = 'answer-option-btn';
            btn.innerHTML = `
              <span class="option-badge-pill"><span class="badge-letter">${key}</span></span>
              <span class="option-text" style="font-weight:700; text-align:left; color:#3B0764;">${val}</span>
            `;
            btn.onclick = () => this.submitPlayerChoice(data.questionId, key, btn);
            container.appendChild(btn);
          }
        });
      }
    }

    this.startSynchronizedTimer('mpPlayerTimerValue', data.startedAt, data.duration, () => {
      this.disablePlayerChoices();
    });
  },

  async submitPlayerChoice(questionId, selectedChoice, btnEl) {
    if (this.hasAnsweredCurrent) return;
    this.hasAnsweredCurrent = true;
    this.disablePlayerChoices();

    if (btnEl) {
      btnEl.style.borderColor = '#6D28D9';
      btnEl.style.background = '#EDE9FE';
    }

    const elapsedSec = this.questionStartedAt ? Math.max(0.1, (Date.now() - new Date(this.questionStartedAt).getTime()) / 1000) : 1;

    const result = await DB.submitPlayerAnswer(
      this.currentGame ? this.currentGame.id : null,
      DB.getUserUUID(),
      questionId,
      selectedChoice,
      elapsedSec
    );

    this.sendBroadcast('PLAYER_ANSWERED', { playerId: DB.getUserUUID() });

    const banner = document.getElementById('mpPlayerFeedbackBanner');
    const statusText = document.getElementById('mpPlayerFeedbackText');
    const subText = document.getElementById('mpPlayerFeedbackSub');

    if (banner && statusText && subText) {
      banner.className = 'feedback-banner';
      statusText.textContent = result.is_correct ? '✅ Correct Answer!' : '❌ Incorrect Answer';
      subText.textContent = `+${result.points_earned || 0} points earned!`;
    }
  },

  async submitPlayerTextChoice(questionId) {
    const input = document.getElementById('mpPlayerTextInput');
    const btn = document.getElementById('mpSubmitTextBtn');
    if (!input) return;
    const textVal = input.value.trim();
    if (!textVal) return;

    if (btn) btn.disabled = true;
    await this.submitPlayerChoice(questionId, textVal, null);
  },

  disablePlayerChoices() {
    const container = document.getElementById('mpPlayerAnswersContainer');
    if (container) {
      const elements = container.querySelectorAll('.answer-option-btn, #mpSubmitTextBtn, #mpPlayerTextInput');
      elements.forEach(b => b.disabled = true);
    }
  },

  onPlayerAnswered(data) {
    if (this.isHost) {
      this.answeredCount = (this.answeredCount || 0) + 1;
      const countEl = document.getElementById('mpHostAnswerCount');
      if (countEl) countEl.textContent = `${this.answeredCount} / ${this.playersList.length} Answered`;
    }
  },

  onQuestionLock(data) {
    this.disablePlayerChoices();
  },

  onShowResults(data) {
    if (!this.isHost) {
      this.renderLeaderboardScreen('Question Results 📊', data.leaderboard || []);
    }
  },

  onNextQuestion(data) {
    if (!this.isHost) {
      App.showScreen('mpPlayerGameScreen');
    }
  },

  onGameFinish(data) {
    this.renderLeaderboardScreen('🏆 Final Podium Leaderboard', data.finalLeaderboard || []);
  },

  // 10. Synchronized Timer (Calculated locally from question_started_at + duration - now)
  startSynchronizedTimer(timerElementId, startedAtIso, durationSec, onExpire) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    let startTime = startedAtIso ? new Date(startedAtIso).getTime() : Date.now();
    if (isNaN(startTime) || startTime > Date.now()) {
      startTime = Date.now();
    }
    const durationMs = (durationSec || 20) * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      let remainingMs = Math.max(0, durationMs - elapsedMs);

      const remainingSec = (remainingMs / 1000).toFixed(2);

      const el = document.getElementById(timerElementId);
      if (el) el.textContent = `${remainingSec}s`;

      if (remainingMs <= 0) {
        clearInterval(this.timerInterval);
        if (typeof onExpire === 'function') onExpire();
      }
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 100);
  },

  // 11. Render Leaderboard & Podium Standings
  renderLeaderboardScreen(title, standings) {
    App.showScreen('mpLeaderboardScreen');
    const titleEl = document.getElementById('mpLeaderboardTitle');
    const rosterEl = document.getElementById('mpLeaderboardRoster');
    if (titleEl) titleEl.textContent = title;

    if (rosterEl) {
      rosterEl.innerHTML = '';
      if (!standings || standings.length === 0) {
        rosterEl.innerHTML = '<div style="color:#94A3B8; text-align:center; padding:16px;">No scores recorded.</div>';
      } else {
        standings.forEach((p, idx) => {
          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          const medals = ['🥇', '🥈', '🥉'];
          const rankTag = idx < 3 ? medals[idx] : `#${idx + 1}`;
          const displayName = p.display_name || p.name || 'Player';
          card.innerHTML = `
            <div class="part-info-left" style="justify-content:space-between; width:100%;">
              <div style="display:flex; align-align:center; gap:10px;">
                <span style="font-size:1.4rem;">${rankTag}</span>
                <div>
                  <h5 style="margin:0; font-size:1rem; color:#1E293B; font-weight:700;">${displayName}</h5>
                  <span style="font-size:0.75rem; color:#64748B;">Correct: ${p.correct_answers || 0}</span>
                </div>
              </div>
              <span style="font-weight:800; color:#6D28D9; font-size:1.1rem;">${p.score || 0} pts</span>
            </div>
          `;
          rosterEl.appendChild(card);
        });
      }
    }
  },

  getJoinUrl(pin) {
    return `${window.location.origin}${window.location.pathname}?pin=${pin}`;
  },

  copyGamePin() {
    if (this.currentGame) {
      navigator.clipboard.writeText(this.currentGame.room_code);
      alert('Game PIN copied to clipboard!');
    }
  },

  copyJoinLink() {
    if (this.currentGame) {
      navigator.clipboard.writeText(this.getJoinUrl(this.currentGame.room_code));
      alert('Join link copied to clipboard!');
    }
  },

  leavePlayerLobby() {
    this.unsubscribeRealtime();
    App.showScreen('homeScreen');
  },

  unsubscribeRealtime() {
    if (this.realtimeChannel && typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        this.realtimeChannel.untrack();
        supabaseClient.removeChannel(this.realtimeChannel);
      } catch (e) {}
      this.realtimeChannel = null;
    }
  }
};
