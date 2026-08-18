/* ==========================================================================
   NEXUS KAHOOT-STYLE REALTIME MULTIPLAYER TRIVIA ENGINE
   Uses Supabase Realtime Channels (game_room_<pin>), Presence (connected user state),
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
  hostLobbyPollInterval: null,
  playerSyncInterval: null,
  questionStartedAt: null,
  lastRenderedQuestionKey: null,

  resetState() {
    this.currentGame = null;
    this.currentPlayer = null;
    this.isHost = false;
    this.playersList = [];
    this.questionsList = [];
    this.currentIndex = 0;
    this.hasAnsweredCurrent = false;
    this.answeredCount = 0;
    this.answeredPlayerSet = new Set();
    this.lastRenderedQuestionKey = null;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.hostLobbyPollInterval) clearInterval(this.hostLobbyPollInterval);
    if (this.playerSyncInterval) clearInterval(this.playerSyncInterval);
    this.unsubscribeRealtime();
  },

  goHome() {
    this.resetState();
    App.showScreen('homeScreen');
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
          <option value="term-1">Term 1</option>
          <option value="term-2">Term 2</option>
          <option value="term-3">Term 3</option>
        `;
      } else {
        const top3 = terms.slice(0, 3);
        top3.forEach((t, i) => {
          const opt = document.createElement('option');
          opt.value = t.id;
          opt.textContent = t.name || `Term ${t.order_no || i + 1}`;
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
    const timeSelect = document.getElementById('mpTimeSelect');
    const maxPartSelect = document.getElementById('mpMaxParticipantsSelect');
    const errEl = document.getElementById('mpCreateError');

    if (errEl) errEl.classList.add('hidden');

    const config = {
      termId: termSelect ? termSelect.value : null,
      topicId: topicSelect ? topicSelect.value : null,
      answerMedium: mediumSelect ? mediumSelect.value : 'multiple_choice',
      questionCount: countSelect ? Math.min(30, Math.max(1, parseInt(countSelect.value, 10) || 10)) : 10,
      timeLimit: timeSelect ? Math.min(60, Math.max(10, parseInt(timeSelect.value, 10) || 20)) : 20,
      maxParticipants: maxPartSelect ? parseInt(maxPartSelect.value, 10) || 9999 : 9999
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
        this.playerRenderQuestion(this.currentIndex, game);
        this.startPlayerGameSyncPolling();
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

  // 5. Host Lobby Screen Management & Dual DB/Presence Sync
  showHostLobbyScreen(game) {
    return this.enterHostLobbyScreen(game || this.currentGame);
  },

  async enterHostLobbyScreen(game) {
    App.showScreen('mpHostLobbyScreen');
    const pinDisplay = document.getElementById('mpPinDisplay');
    if (pinDisplay) pinDisplay.textContent = game.room_code;

    const joinUrl = this.getJoinUrl(game.room_code);
    const qrImg = document.getElementById('mpQrCodeImg');
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(joinUrl)}`;
    }

    await this.subscribeToGameChannel(game.room_code || game.id, 'host', (DB.getStudentProfile() || {}).name || 'Host');
    await this.startHostLobbyPolling();
  },

  async startHostLobbyPolling() {
    if (this.hostLobbyPollInterval) clearInterval(this.hostLobbyPollInterval);

    const poll = async () => {
      if (!this.currentGame || App.currentScreen !== 'mpHostLobbyScreen') {
        clearInterval(this.hostLobbyPollInterval);
        return;
      }
      await this.syncHostRoster();
    };

    await poll();
    this.hostLobbyPollInterval = setInterval(poll, 1500);
  },

  async syncHostRoster() {
    if (!this.currentGame) return;

    // A. Query Postgres database table for joined players
    const dbPlayers = await DB.getMultiplayerPlayers(this.currentGame.id, this.currentGame.room_code);

    const mergedMap = new Map();
    (dbPlayers || []).forEach(p => {
      if (!p.is_host) {
        const key = p.user_id || p.id || p.display_name;
        if (key) mergedMap.set(key, {
          id: key,
          playerName: p.display_name || p.student_name || 'Player',
          photoUrl: p.photo_url || p.photo || null,
          role: 'player'
        });
      }
    });

    // B. Merge with Supabase Realtime Presence state
    if (this.realtimeChannel && typeof this.realtimeChannel.presenceState === 'function') {
      try {
        const presenceObj = this.realtimeChannel.presenceState();
        Object.values(presenceObj).forEach(presences => {
          (presences || []).forEach(p => {
            if (p.role === 'player' && p.playerName) {
              const key = p.playerId || p.user_id || p.playerName;
              if (key && !mergedMap.has(key)) {
                mergedMap.set(key, {
                  id: key,
                  playerName: p.playerName,
                  photoUrl: p.photoUrl || null,
                  role: 'player'
                });
              }
            }
          });
        });
      } catch (e) {}
    }

    this.playersList = Array.from(mergedMap.values());
    this.refreshHostPresenceRoster();
  },

  // 6. Player Lobby Screen Management & Cross-Device Sync Polling
  async enterPlayerLobbyScreen(game, nickname) {
    App.showScreen('mpPlayerLobbyScreen');
    const badge = document.getElementById('mpPlayerNicknameBadge');
    const tag = document.getElementById('mpPlayerChannelTag');
    if (badge) badge.textContent = nickname;
    if (tag) tag.textContent = `PIN: ${game.room_code}`;

    await this.subscribeToGameChannel(game.room_code || game.id, 'player', nickname);
    this.startPlayerGameSyncPolling();
  },

  startPlayerGameSyncPolling() {
    if (this.playerSyncInterval) clearInterval(this.playerSyncInterval);

    const poll = async () => {
      if (!this.currentGame || this.isHost) {
        clearInterval(this.playerSyncInterval);
        return;
      }

      try {
        const game = await DB.getMultiplayerGameByCode(this.currentGame.room_code);
        if (!game) return;

        if ((game.status === 'active' || game.status === 'starting' || game.status === 'in_progress') && App.currentScreen === 'mpPlayerLobbyScreen') {
          if (this.questionsList.length === 0) {
            this.questionsList = await DB.getMultiplayerQuestions(game.id, game.room_code);
          }
          App.showScreen('mpPlayerGameScreen');
          const currentIdx = game.current_question_index || 0;
          const qStartTime = game.question_start_time || '';
          this.lastRenderedQuestionKey = `${currentIdx}_${qStartTime}`;
          this.playerRenderQuestion(currentIdx, game);
        } else if ((game.status === 'active' || game.status === 'in_progress') && App.currentScreen === 'mpPlayerGameScreen') {
          const dbIndex = game.current_question_index || 0;
          const qStartTime = game.question_start_time || '';
          const qKey = `${dbIndex}_${qStartTime}`;

          if (qKey !== this.lastRenderedQuestionKey) {
            this.lastRenderedQuestionKey = qKey;
            this.playerRenderQuestion(dbIndex, game);
          }
        } else if (game.status === 'finished' && App.currentScreen !== 'mpLeaderboardScreen') {
          const finalLeaderboard = await DB.getGameLeaderboard(game.id);
          this.renderLeaderboardScreen('🏆 Final Podium Leaderboard', finalLeaderboard);
        }
      } catch (e) {}
    };

    this.playerSyncInterval = setInterval(poll, 1500);
  },

  // 7. Supabase Realtime Channel (`game_room_<pin>`) with Presence & Broadcast
  async subscribeToGameChannel(roomCodeOrId, role, name) {
    if (!roomCodeOrId) return;
    const cleanPin = String(roomCodeOrId).toUpperCase().trim();
    const channelName = 'game_room_' + cleanPin;

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

        // A. PRESENCE: Live online tracking
        this.realtimeChannel
          .on('presence', { event: 'sync' }, () => this.syncHostRoster())
          .on('presence', { event: 'join' }, () => this.syncHostRoster())
          .on('presence', { event: 'leave' }, () => this.syncHostRoster());

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

  refreshHostPresenceRoster() {
    const rosterEl = document.getElementById('mpHostPresenceRoster');
    const countEl = document.getElementById('mpHostPlayerCount');
    const startBtn = document.getElementById('mpStartGameBtn');

    if (startBtn) startBtn.disabled = false;

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

    const btn = document.getElementById('mpStartGameBtn');
    try {
      if (btn) btn.disabled = true;

      if (!this.questionsList || this.questionsList.length === 0) {
        this.questionsList = await DB.getMultiplayerQuestions(this.currentGame.id, this.currentGame.room_code);
      }

      if (!this.questionsList || this.questionsList.length === 0) {
        alert('⚠️ Loading questions from Supabase question bank, please try starting again in a second!');
        if (btn) btn.disabled = false;
        return;
      }

      await DB.updateMultiplayerGameStatus(this.currentGame.id, 'active', 0);

      this.currentIndex = 0;
      const initialDuration = (this.questionsList[0] && this.questionsList[0].time_limit) ? this.questionsList[0].time_limit : ((this.currentGame && this.currentGame.time_limit) ? this.currentGame.time_limit : 20);
      this.sendBroadcast('GAME_START', { questionNumber: 1, startedAt: new Date().toISOString(), duration: initialDuration });
      this.hostRenderQuestion(0);
    } catch (e) {
      console.error(e);
      alert('Error starting game: ' + e.message);
      if (btn) btn.disabled = false;
    }
  },

  hostRenderQuestion(index) {
    App.showScreen('mpHostGameScreen');
    this.currentIndex = index;
    this.answeredCount = 0;
    this.answeredPlayerSet = new Set();

    const banner = document.getElementById('mpHostCorrectAnswerBanner');
    if (banner) banner.classList.add('hidden');

    const q = this.questionsList[index];
    if (!q) return;

    document.getElementById('mpHostQCounter').textContent = `Question ${index + 1} of ${this.questionsList.length}`;
    document.getElementById('mpHostQuestionText').textContent = q.question;

    // Host Perspective: Keep clean question view; answer revealed only when host clicks "Show Answer 💡"
    const overviewEl = document.getElementById('mpHostAnswersOverview');
    if (overviewEl) {
      overviewEl.innerHTML = '';
    }

    this.refreshHostPlayerAnswerStatuses();

    const startedAt = new Date().toISOString();
    this.questionStartedAt = startedAt;
    this.questionDurationSec = (q && q.time_limit) ? q.time_limit : ((this.currentGame && this.currentGame.time_limit) ? this.currentGame.time_limit : 20);

    if (this.currentGame && this.currentGame.id) {
      DB.updateMultiplayerGameStatus(this.currentGame.id, 'active', index);
    }

    const typeId = q.question_type_id || (q.question_type === 'true_false' ? 2 : (q.question_type === 'identification' ? 3 : 1));

    // Send QUESTION_START Broadcast payload
    this.sendBroadcast('QUESTION_START', {
      questionNumber: index + 1,
      questionId: q.id,
      questionText: q.question,
      questionTypeId: typeId,
      choices: {
        a: q.choice_a || q.option_a || (typeId === 2 ? 'True' : null),
        b: q.choice_b || q.option_b || (typeId === 2 ? 'False' : null),
        c: q.choice_c || q.option_c || null,
        d: q.choice_d || q.option_d || null
      },
      startedAt: startedAt,
      duration: this.questionDurationSec,
      serverTime: Date.now()
    });

    this.startSynchronizedTimer('mpHostTimerValue', startedAt, this.questionDurationSec, () => {
      this.hostLockAnswers();
    });
  },

  refreshHostPlayerAnswerStatuses() {
    const listEl = document.getElementById('mpHostLivePlayerStatusList');
    const countEl = document.getElementById('mpHostAnswerCount');
    const badgeEl = document.getElementById('mpHostResponseBadge');

    const total = this.playersList.length || 0;
    const answeredCount = this.answeredPlayerSet ? this.answeredPlayerSet.size : 0;

    if (countEl) countEl.textContent = `${answeredCount} / ${total} Answered`;
    if (badgeEl) badgeEl.textContent = `${answeredCount} / ${total} Answered`;

    if (listEl) {
      listEl.innerHTML = '';
      if (this.playersList.length === 0) {
        listEl.innerHTML = '<div style="color:#94A3B8; padding:12px; text-align:center;">No participants connected</div>';
      } else {
        this.playersList.forEach(p => {
          const pId = p.id || p.user_id || p.playerName;
          const hasAnswered = this.answeredPlayerSet && (this.answeredPlayerSet.has(pId) || this.answeredPlayerSet.has(p.playerName));

          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          card.style.padding = '10px 14px';

          const statusBadge = hasAnswered 
            ? '<span style="color:#059669; background:#D1FAE5; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:700;">🟢 Answered</span>'
            : '<span style="color:#6B21A8; background:#F3E8FF; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:700;">⏳ Thinking...</span>';

          const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23DDD6FE'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236D28D9'>👤</text></svg>";

          card.innerHTML = `
            <div class="part-info-left" style="justify-content:space-between; width:100%; align-items:center;">
              <div style="display:flex; align-items:center; gap:8px;">
                <img src="${p.photoUrl || defaultAvatar}" class="part-avatar" style="width:32px; height:32px;" alt="${p.playerName}">
                <h5 style="margin:0; font-size:0.9rem; color:#1E293B; font-weight:700;">${p.playerName}</h5>
              </div>
              ${statusBadge}
            </div>
          `;
          listEl.appendChild(card);
        });
      }
    }
  },

  hostShowAnswer() {
    const q = this.questionsList[this.currentIndex];
    if (!q) return;

    const banner = document.getElementById('mpHostCorrectAnswerBanner');
    const bannerText = document.getElementById('mpHostCorrectAnswerText');

    let displayAnswer = q.correct_answer || '';
    if (q.question_type_id === 1) {
      const key = String(q.correct_answer || '').toUpperCase();
      const optText = q['choice_' + key.toLowerCase()] || q['option_' + key.toLowerCase()];
      displayAnswer = optText ? `${key}: ${optText}` : key;
    }

    if (banner && bannerText) {
      bannerText.textContent = `💡 Correct Answer: ${displayAnswer}`;
      banner.classList.remove('hidden');
    }

    // Highlight correct option card in green on host overview
    const overviewEl = document.getElementById('mpHostAnswersOverview');
    if (overviewEl) {
      const cards = overviewEl.querySelectorAll('.answer-option-btn');
      cards.forEach(card => {
        const letterEl = card.querySelector('.badge-letter');
        if (letterEl && letterEl.textContent.trim().toUpperCase() === String(q.correct_answer).trim().toUpperCase()) {
          card.style.borderColor = '#10B981';
          card.style.background = '#ECFDF5';
          card.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.2)';
        }
      });
    }
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

      const totalQ = this.questionsList ? this.questionsList.length : 10;
      const participantStandings = (finalLeaderboard || []).filter(p => !p.is_host && !p.isHost);

      const analyticsData = {
        gameId: this.currentGame ? this.currentGame.id : 'game_' + Date.now(),
        roomCode: this.currentGame ? (this.currentGame.room_code || this.currentGame.access_code) : '000000',
        title: this.currentGame ? (this.currentGame.title || 'Science Host Quiz') : 'Science Host Quiz',
        totalQuestions: totalQ,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        participants: participantStandings.map(p => {
          const correct = p.correct_answers || p.correct || 0;
          const pct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
          return {
            name: p.display_name || p.name || 'Participant',
            points: p.score || p.points || 0,
            correct: correct,
            totalQuestions: totalQ,
            correctRatio: `${correct}/${totalQ}`,
            accuracyPct: pct
          };
        })
      };

      DB.saveHostedGameAnalytics(analyticsData);
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

  // 9. Player Broadcast Event Callbacks & Question Rendering
  onGameStart(data) {
    if (!this.isHost) {
      App.showScreen('mpPlayerGameScreen');
    }
  },

  onQuestionStart(data) {
    if (this.isHost) return;
    const qIndex = (data.questionNumber || 1) - 1;
    const qKey = `${qIndex}_${data.startedAt || ''}`;
    if (qKey !== this.lastRenderedQuestionKey) {
      this.lastRenderedQuestionKey = qKey;
      this.playerRenderQuestion(qIndex, {
        question_start_time: data.startedAt || new Date().toISOString(),
        serverTime: data.serverTime || Date.now(),
        duration: data.duration,
        questionTypeId: data.questionTypeId
      });
    }
  },

  async playerRenderQuestion(index, gameObj) {
    App.showScreen('mpPlayerGameScreen');
    this.currentIndex = index;
    this.hasAnsweredCurrent = false;

    if (this.questionsList.length === 0 && this.currentGame) {
      this.questionsList = await DB.getMultiplayerQuestions(this.currentGame.id, this.currentGame.room_code);
    }

    const q = this.questionsList[index] || {};

    const banner = document.getElementById('mpPlayerFeedbackBanner');
    if (banner) banner.className = 'feedback-banner hidden';

    document.getElementById('mpPlayerQCounter').textContent = `Question ${index + 1} of ${this.questionsList.length || 10}`;
    document.getElementById('mpPlayerQuestionText').textContent = q.question || 'Question';

    this.questionDurationSec = (q && q.time_limit) ? q.time_limit : ((gameObj && gameObj.duration) ? gameObj.duration : ((this.currentGame && this.currentGame.time_limit) ? this.currentGame.time_limit : 20));

    let startedAt = (gameObj && gameObj.question_start_time) ? gameObj.question_start_time : null;
    const now = Date.now();
    if (startedAt) {
      let startTime = new Date(startedAt).getTime();
      if (gameObj && gameObj.serverTime) {
        const clockOffset = now - gameObj.serverTime;
        startTime += clockOffset;
      }
      const elapsedSec = (now - startTime) / 1000;
      if (isNaN(startTime) || elapsedSec < -2 || elapsedSec >= this.questionDurationSec) {
        startedAt = new Date().toISOString();
      }
    } else {
      startedAt = new Date().toISOString();
    }

    this.questionStartedAt = startedAt;

    const container = document.getElementById('mpPlayerAnswersContainer');
    if (container) {
      container.innerHTML = '';
      const typeId = (gameObj && gameObj.questionTypeId) ? gameObj.questionTypeId : (q.question_type_id || (q.question_type === 'true_false' ? 2 : (q.question_type === 'identification' ? 3 : 1)));

      if (typeId === 3) {
        const inputWrap = document.createElement('div');
        inputWrap.style.gridColumn = '1 / -1';
        inputWrap.style.display = 'flex';
        inputWrap.style.flexDirection = 'column';
        inputWrap.style.gap = '12px';
        inputWrap.innerHTML = `
          <input type="text" id="mpPlayerTextInput" placeholder="Type your answer here..." class="customize-input" style="font-size:1.2rem; font-weight:700; text-align:center; padding:14px;" />
          <button id="mpSubmitTextBtn" class="primary-btn bottom-start-btn" onclick="Multiplayer.submitPlayerTextChoice('${q.id}')">
            Submit Answer ➔
          </button>
        `;
        container.appendChild(inputWrap);
      } else {
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
          const val = choicesMap[key];
          if (val) {
            const btn = document.createElement('button');
            btn.className = 'answer-option-btn';
            btn.type = 'button';
            btn.innerHTML = `
              <span class="option-badge-pill"><span class="badge-letter">${key}</span></span>
              <span class="option-text" style="font-weight:700; text-align:left; color:#3B0764;">${val}</span>
            `;
            const handleSelect = (e) => {
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
              this.submitPlayerChoice(q.id, key, btn);
            };
            btn.onclick = handleSelect;
            container.appendChild(btn);
          }
        });
      }
    }

    this.enablePlayerChoices();

    this.startSynchronizedTimer('mpPlayerTimerValue', startedAt, this.questionDurationSec, () => {
      this.disablePlayerChoices();
    });
  },

  enablePlayerChoices() {
    const container = document.getElementById('mpPlayerAnswersContainer');
    if (container) {
      const elements = container.querySelectorAll('.answer-option-btn, #mpSubmitTextBtn, #mpPlayerTextInput');
      elements.forEach(b => {
        b.disabled = false;
        b.style.pointerEvents = 'auto';
        b.style.opacity = '1';
        b.style.borderColor = '';
        b.style.background = '';
      });
    }
  },

  async submitPlayerChoice(questionId, selectedChoice, btnEl) {
    if (this.hasAnsweredCurrent) return;
    this.hasAnsweredCurrent = true;
    this.disablePlayerChoices();

    if (btnEl) {
      btnEl.style.borderColor = '#6D28D9';
      btnEl.style.background = '#EDE9FE';
      btnEl.style.opacity = '1';
    }

    const banner = document.getElementById('mpPlayerFeedbackBanner');
    const statusText = document.getElementById('mpPlayerFeedbackText');
    const subText = document.getElementById('mpPlayerFeedbackSub');

    if (banner && statusText && subText) {
      banner.className = 'feedback-banner';
      statusText.textContent = '⏳ Answer Submitted!';
      subText.textContent = 'Validating score with server...';
    }

    const elapsedSec = this.questionStartedAt ? Math.max(0.1, (Date.now() - new Date(this.questionStartedAt).getTime()) / 1000) : 1;

    try {
      const result = await DB.submitPlayerAnswer(
        this.currentGame ? this.currentGame.id : null,
        DB.getUserUUID(),
        questionId,
        selectedChoice,
        elapsedSec
      );

      this.sendBroadcast('PLAYER_ANSWERED', {
        playerId: DB.getUserUUID(),
        playerName: (DB.getStudentProfile() || {}).name || 'Player'
      });

      if (banner && statusText && subText) {
        statusText.textContent = result.is_correct ? '✅ Correct Answer!' : '❌ Incorrect Answer';
        subText.textContent = `+${result.points_earned || 0} points earned!`;
      }
    } catch (e) {
      console.warn('Answer submit fallback:', e);
      if (banner && statusText) {
        statusText.textContent = '✅ Answer Recorded!';
      }
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
      elements.forEach(b => {
        b.disabled = true;
        b.style.pointerEvents = 'none';
        b.style.opacity = '0.7';
      });
    }
  },

  onPlayerAnswered(data) {
    if (this.isHost && data) {
      if (data.playerId) this.answeredPlayerSet.add(data.playerId);
      if (data.playerName) this.answeredPlayerSet.add(data.playerName);
      this.refreshHostPlayerAnswerStatuses();
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
    if (isNaN(startTime) || startTime > Date.now() + 2000) {
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
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = null;
        if (typeof onExpire === 'function') onExpire();
      }
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 50);
  },

  openLeaveGameModal() {
    const modal = document.getElementById('leaveGameConfirmModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeLeaveGameModal() {
    const modal = document.getElementById('leaveGameConfirmModal');
    if (modal) modal.classList.add('hidden');
  },

  async confirmLeaveGame() {
    this.closeLeaveGameModal();
    if (this.currentGame && this.currentGame.id) {
      const userUuid = DB.getUserUUID();
      await DB.leaveMultiplayerGame(this.currentGame.id, userUuid);
      this.sendBroadcast('PLAYER_LEFT', { playerId: userUuid });
    }
    this.goHome();
  },

  // 11. Render Leaderboard & Podium Standings (Excludes Host, Accurately Ranks Joined Participants)
  renderLeaderboardScreen(title, standings) {
    App.showScreen('mpLeaderboardScreen');
    const titleEl = document.getElementById('mpLeaderboardTitle');
    const rosterEl = document.getElementById('mpLeaderboardRoster');
    if (titleEl) titleEl.textContent = title;

    // Filter out host entries so ONLY joined participants appear on the leaderboard
    const participantStandings = (standings || []).filter(p => {
      if (p.is_host || p.isHost) return false;
      if (this.currentGame && (p.user_id === this.currentGame.host_id || p.id === this.currentGame.host_id)) return false;
      return true;
    });

    // Sort by score descending for accurate participant ranking
    participantStandings.sort((a, b) => (b.score || 0) - (a.score || 0));

    if (rosterEl) {
      rosterEl.innerHTML = '';
      if (participantStandings.length === 0) {
        rosterEl.innerHTML = '<div style="color:#94A3B8; text-align:center; padding:16px;">No participant scores recorded.</div>';
      } else {
        participantStandings.forEach((p, idx) => {
          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          const medals = ['🥇', '🥈', '🥉'];
          const rankTag = idx < 3 ? medals[idx] : `#${idx + 1}`;
          const displayName = p.display_name || p.name || 'Player';
          card.innerHTML = `
            <div class="part-info-left" style="justify-content:space-between; width:100%;">
              <div style="display:flex; align-items:center; gap:10px;">
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
