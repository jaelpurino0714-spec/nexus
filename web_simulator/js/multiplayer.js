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
    if (nameInput) nameInput.value = profile.username || profile.name || '';
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
    const profile = DB.getStudentProfile() || {};
    const nicknameVal = (nameInput ? nameInput.value : '').trim() || profile.username || profile.name || 'Player';

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
        if (key) {
          mergedMap.set(key, {
            id: key,
            user_id: p.user_id || key,
            playerName: p.display_name || p.student_name || 'Player',
            display_name: p.display_name || p.student_name || 'Player',
            photoUrl: p.photo_url || p.photo || null,
            score: p.score || 0,
            correct_answers: p.correct_answers || 0,
            wrong_answers: p.wrong_answers || 0,
            role: 'player'
          });
        }
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
              if (key) {
                if (!mergedMap.has(key)) {
                  mergedMap.set(key, {
                    id: key,
                    user_id: p.user_id || key,
                    playerName: p.playerName,
                    display_name: p.playerName,
                    photoUrl: p.photoUrl || null,
                    score: p.score || 0,
                    correct_answers: p.correct_answers || 0,
                    wrong_answers: p.wrong_answers || 0,
                    role: 'player'
                  });
                } else {
                  const existing = mergedMap.get(key);
                  if (p.score && p.score > existing.score) {
                    existing.score = p.score;
                  }
                  if (p.correct_answers && p.correct_answers > existing.correct_answers) {
                    existing.correct_answers = p.correct_answers;
                  }
                }
              }
            }
          });
        });
      } catch (e) {}
    }

    // C. Preserve existing in-memory scores from this.playersList (e.g. from PLAYER_ANSWERED broadcasts)
    if (this.playersList && this.playersList.length > 0) {
      this.playersList.forEach(existingP => {
        const name = existingP.playerName || existingP.display_name || existingP.name;
        let matchedKey = null;
        for (const [key, item] of mergedMap.entries()) {
          if ((existingP.id && item.id === existingP.id) || (existingP.user_id && item.user_id === existingP.user_id) || (name && item.display_name === name)) {
            matchedKey = key;
            break;
          }
        }
        if (matchedKey) {
          const item = mergedMap.get(matchedKey);
          if ((existingP.score || 0) > (item.score || 0)) {
            item.score = existingP.score;
          }
          if ((existingP.correct_answers || 0) > (item.correct_answers || 0)) {
            item.correct_answers = existingP.correct_answers;
          }
        } else if (name) {
          mergedMap.set(existingP.id || name, {
            id: existingP.id || name,
            user_id: existingP.user_id || existingP.id || name,
            playerName: name,
            display_name: name,
            photoUrl: existingP.photoUrl || null,
            score: existingP.score || 0,
            correct_answers: existingP.correct_answers || 0,
            wrong_answers: existingP.wrong_answers || 0,
            role: 'player'
          });
        }
      });
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

        const isLobbyActive = App.currentScreen === 'mpPlayerLobbyScreen' || 
          (document.getElementById('mpPlayerLobbyScreen') && document.getElementById('mpPlayerLobbyScreen').classList.contains('active'));

        const isGameScreenActive = App.currentScreen === 'mpPlayerGameScreen' ||
          (document.getElementById('mpPlayerGameScreen') && document.getElementById('mpPlayerGameScreen').classList.contains('active'));

        if ((game.status === 'active' || game.status === 'starting' || game.status === 'in_progress') && isLobbyActive) {
          if (!this.questionsList || this.questionsList.length === 0) {
            this.questionsList = await DB.getMultiplayerQuestions(game.id, game.room_code);
          }
          App.showScreen('mpPlayerGameScreen');
          const currentIdx = game.current_question_index || 0;
          const qStartTime = game.question_start_time || '';
          this.lastRenderedQuestionKey = `${currentIdx}_${qStartTime}`;
          await this.playerRenderQuestion(currentIdx, game);
        } else if ((game.status === 'active' || game.status === 'starting' || game.status === 'in_progress') && isGameScreenActive) {
          const dbIndex = game.current_question_index || 0;
          const qStartTime = game.question_start_time || '';
          const qKey = `${dbIndex}_${qStartTime}`;

          if (qKey !== this.lastRenderedQuestionKey || !this.questionsList || this.questionsList.length === 0) {
            this.lastRenderedQuestionKey = qKey;
            if (!this.questionsList || this.questionsList.length === 0) {
              this.questionsList = await DB.getMultiplayerQuestions(game.id, game.room_code);
            }
            await this.playerRenderQuestion(dbIndex, game);
          }
        } else if (game.status === 'finished' && App.currentScreen !== 'mpLeaderboardScreen') {
          const finalLeaderboard = await DB.getGameLeaderboard(game.id);
          this.renderLeaderboardScreen('🏆 Final Podium Leaderboard', finalLeaderboard);
        }
      } catch (e) {}
    };

    this.playerSyncInterval = setInterval(poll, 1000);
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
          if (payload) {
            this.handleBroadcastEvent(payload.payload || payload);
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
    this.setupRosterEventDelegation();

    const online = this.playersList || [];
    if (countEl) countEl.textContent = `Connected Players (${online.length})`;

    if (rosterEl) {
      rosterEl.innerHTML = '';
      if (online.length === 0) {
        rosterEl.innerHTML = '<div style="color:#A5A3C4; padding:16px; text-align:center;">Waiting for players to enter PIN...</div>';
      } else {
        online.forEach(p => {
          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          card.style.background = 'rgba(25, 17, 50, 0.95)';
          card.style.border = '1.5px solid rgba(139, 92, 246, 0.35)';
          card.style.borderRadius = '16px';
          card.style.padding = '12px 16px';
          card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.35)';
          card.style.cursor = 'pointer';
          card.style.transition = 'all 0.2s ease';
          card.title = 'Click to view participant profile & photo';

          const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%232E1065'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23C084FC'>👤</text></svg>";
          const pName = p.playerName || p.display_name || p.name || 'Player';
          const pPhoto = p.photoUrl || p.photo || p.photo_url || defaultAvatar;

          card.setAttribute('data-player-name', pName);
          card.setAttribute('data-player-photo', pPhoto);
          card.setAttribute('data-player-id', p.id || p.user_id || pName);
          card._playerObj = p;

          card.onmouseover = function() {
            this.style.borderColor = '#C084FC';
            this.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.5)';
            this.style.transform = 'translateY(-2px)';
          };
          card.onmouseout = function() {
            this.style.borderColor = 'rgba(139, 92, 246, 0.35)';
            this.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.35)';
            this.style.transform = 'translateY(0)';
          };

          card.onclick = () => {
            Multiplayer.viewParticipantProfile(pName, pPhoto, p);
          };

          card.innerHTML = `
            <div class="part-info-left" style="display:flex; align-items:center; justify-content:space-between; width:100%;">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${pPhoto}" class="part-avatar" 
                     style="width:44px; height:44px; border-radius:50%; border:2px solid #A855F7; object-fit:cover;" 
                     alt="${pName}">
                <div>
                  <h5 style="margin:0; font-size:0.98rem; color:#FFFFFF; font-weight:700;">${pName}</h5>
                  <span style="font-size:0.75rem; color:#34D399; font-weight:600;">● Online in Lobby</span>
                </div>
              </div>
              <button style="background: rgba(139, 92, 246, 0.25); border: 1px solid rgba(168, 85, 247, 0.4); color: #E9D5FF; font-size: 0.78rem; font-weight: 700; padding: 6px 14px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; pointer-events: none;">
                👤 View Profile
              </button>
            </div>
          `;
          rosterEl.appendChild(card);
        });
      }
    }

    if (this.isHost) {
      this.saveCurrentHostAnalytics();
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
      const startIso = new Date().toISOString();

      this.sendBroadcast('GAME_START', { questionNumber: 1, startedAt: startIso, duration: initialDuration });
      this.sendBroadcast('QUESTION_START', { questionNumber: 1, startedAt: startIso, duration: initialDuration });

      this.saveCurrentHostAnalytics();
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

    const typeId = q.question_type_id || (q.question_type === 'true_false' || q.type === 'true_false' ? 2 : (q.question_type === 'identification' || q.type === 'identification' ? 3 : 1));

    // Teacher Perspective: Display question and choices Overview
    const overviewEl = document.getElementById('mpHostAnswersOverview');
    if (overviewEl) {
      overviewEl.innerHTML = '';
      if (typeId === 3) {
        const card = document.createElement('div');
        card.className = 'answer-option-btn';
        card.style.cursor = 'default';
        card.style.gridColumn = '1 / -1';
        card.style.textAlign = 'center';
        card.innerHTML = `
          <span style="font-weight:700; color:#4C1D95;">📝 Identification Question (Text Input)</span>
        `;
        overviewEl.appendChild(card);
      } else {
        let choicesMap = {};
        if (typeId === 2 || (!q.choice_c && !q.choice_d && (q.correct_answer === 'True' || q.correct_answer === 'False' || q.correct_answer === 'TRUE' || q.correct_answer === 'FALSE'))) {
          choicesMap = { A: 'True', B: 'False' };
        } else {
          const cA = q.choice_a || q.option_a || q.optionA || (q.options ? q.options[0] : null) || (q.choices ? q.choices.a : null);
          const cB = q.choice_b || q.option_b || q.optionB || (q.options ? q.options[1] : null) || (q.choices ? q.choices.b : null);
          const cC = q.choice_c || q.option_c || q.optionC || (q.options ? q.options[2] : null) || (q.choices ? q.choices.c : null);
          const cD = q.choice_d || q.option_d || q.optionD || (q.options ? q.options[3] : null) || (q.choices ? q.choices.d : null);

          if (cA && String(cA).trim() !== '') choicesMap.A = cA;
          if (cB && String(cB).trim() !== '') choicesMap.B = cB;
          if (cC && String(cC).trim() !== '') choicesMap.C = cC;
          if (cD && String(cD).trim() !== '') choicesMap.D = cD;
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
    }

    this.refreshHostPlayerAnswerStatuses();

    const startedAt = new Date().toISOString();
    this.questionStartedAt = startedAt;
    this.questionDurationSec = (q && q.time_limit) ? q.time_limit : ((this.currentGame && this.currentGame.time_limit) ? this.currentGame.time_limit : 20);

    if (this.currentGame && this.currentGame.id) {
      DB.updateMultiplayerGameStatus(this.currentGame.id, 'active', index);
    }

    const choicesObj = {
      a: q.choice_a || q.option_a || (q.options ? q.options[0] : (typeId === 2 ? 'True' : null)),
      b: q.choice_b || q.option_b || (q.options ? q.options[1] : (typeId === 2 ? 'False' : null)),
      c: q.choice_c || q.option_c || (q.options ? q.options[2] : null),
      d: q.choice_d || q.option_d || (q.options ? q.options[3] : null)
    };

    // Send QUESTION_START Broadcast payload with full custom question info
    this.sendBroadcast('QUESTION_START', {
      questionNumber: index + 1,
      questionId: q.id,
      questionText: q.question,
      questionTypeId: typeId,
      choices: choicesObj,
      customQuestion: {
        id: q.id,
        question: q.question,
        question_type_id: typeId,
        question_type: q.question_type || q.type,
        choice_a: choicesObj.a,
        choice_b: choicesObj.b,
        choice_c: choicesObj.c,
        choice_d: choicesObj.d,
        correct_answer: q.correct_answer || q.correctAnswer
      },
      startedAt: startedAt,
      duration: this.questionDurationSec,
      serverTime: Date.now()
    });

    this.startSynchronizedTimer('mpHostTimerValue', startedAt, this.questionDurationSec, () => {
      this.hostLockAnswers();
    });

    this.saveCurrentHostAnalytics();
    this.startHostAnswerSyncPolling(index);
  },

  startHostAnswerSyncPolling(questionIndex) {
    if (this.hostAnswerPollInterval) clearInterval(this.hostAnswerPollInterval);
    if (!this.currentGame || !this.isHost) return;

    const poll = async () => {
      if (!this.currentGame || !this.isHost) {
        clearInterval(this.hostAnswerPollInterval);
        return;
      }
      try {
        const answeredList = await DB.getAnsweredPlayersForQuestion(this.currentGame.id, questionIndex);
        if (answeredList && answeredList.length > 0) {
          if (!this.answeredPlayerSet) this.answeredPlayerSet = new Set();
          answeredList.forEach(item => {
            if (item) {
              const str = String(item).trim();
              this.answeredPlayerSet.add(str);
              this.answeredPlayerSet.add(str.toLowerCase());
            }
          });
          this.refreshHostPlayerAnswerStatuses();
        }
      } catch (e) {}
    };

    poll();
    this.hostAnswerPollInterval = setInterval(poll, 1000);
  },

  refreshHostPlayerAnswerStatuses() {
    const listEl = document.getElementById('mpHostLivePlayerStatusList');
    const countEl = document.getElementById('mpHostAnswerCount');
    const badgeEl = document.getElementById('mpHostResponseBadge');

    const total = this.playersList ? this.playersList.length : 0;
    let answeredCount = 0;
    if (this.playersList) {
      this.playersList.forEach(p => {
        const pId = p.id || p.user_id || p.playerId;
        const pName = p.playerName || p.display_name || p.name || 'Player';
        const pNameLower = String(pName).toLowerCase().trim();

        const hasAns = (
          (this.answeredPlayerSet && (
            (pId && (this.answeredPlayerSet.has(String(pId).trim()) || this.answeredPlayerSet.has(String(pId).toLowerCase().trim()))) ||
            (pName && (this.answeredPlayerSet.has(String(pName).trim()) || this.answeredPlayerSet.has(pNameLower))) ||
            (p.user_id && this.answeredPlayerSet.has(String(p.user_id).trim()))
          )) ||
          localStorage.getItem(`nexus_ans_${this.currentIndex}_${pNameLower}`) === 'true'
        );
        if (hasAns) answeredCount++;
      });
    }

    if (countEl) countEl.textContent = `${answeredCount} / ${total} Answered`;
    if (badgeEl) badgeEl.textContent = `${answeredCount} / ${total} Answered`;

    if (listEl) {
      listEl.innerHTML = '';
      if (!this.playersList || this.playersList.length === 0) {
        listEl.innerHTML = '<div style="color:#A5A3C4; padding:12px; text-align:center;">No participants connected</div>';
      } else {
        this.playersList.forEach(p => {
          const pId = p.id || p.user_id || p.playerId;
          const pName = p.playerName || p.display_name || p.name || 'Player';
          const pNameLower = String(pName).toLowerCase().trim();

          const hasAnswered = (
            (this.answeredPlayerSet && (
              (pId && (this.answeredPlayerSet.has(String(pId).trim()) || this.answeredPlayerSet.has(String(pId).toLowerCase().trim()))) ||
              (pName && (this.answeredPlayerSet.has(String(pName).trim()) || this.answeredPlayerSet.has(pNameLower))) ||
              (p.user_id && this.answeredPlayerSet.has(String(p.user_id).trim()))
            )) ||
            localStorage.getItem(`nexus_ans_${this.currentIndex}_${pNameLower}`) === 'true'
          );

          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          card.style.background = 'rgba(25, 17, 50, 0.95)';
          card.style.border = '1.5px solid rgba(139, 92, 246, 0.35)';
          card.style.borderRadius = '16px';
          card.style.padding = '12px 16px';
          card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.35)';
          card.style.cursor = 'default';

          const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%232E1065'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23C084FC'>👤</text></svg>";
          const pPhoto = p.photoUrl || p.photo || defaultAvatar;

          const statusBadge = hasAnswered 
            ? '<span style="color:#6EE7B7; background:rgba(16, 185, 129, 0.25); border:1px solid rgba(16, 185, 129, 0.4); padding:6px 14px; border-radius:20px; font-size:0.8rem; font-weight:700;">🟢 Answered</span>'
            : '<span style="color:#E9D5FF; background:rgba(124, 58, 237, 0.25); border:1px solid rgba(168, 85, 247, 0.4); padding:6px 14px; border-radius:20px; font-size:0.8rem; font-weight:700;">⏳ Thinking...</span>';

          card.innerHTML = `
            <div class="part-info-left" style="justify-content:space-between; width:100%; align-items:center;">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${pPhoto}" class="part-avatar" 
                     style="width:40px; height:40px; border-radius:50%; border:2px solid #A855F7; object-fit:cover;" 
                     alt="${pName}">
                <h5 style="margin:0; font-size:0.95rem; color:#FFFFFF; font-weight:700;">${pName}</h5>
              </div>
              <div style="display:flex; align-items:center;">
                ${statusBadge}
              </div>
            </div>
          `;
          listEl.appendChild(card);
        });
      }
    }
  },

  async hostShowAnswer() {
    const q = this.questionsList[this.currentIndex];
    if (!q) return;

    if (this.currentGame) {
      try {
        const answeredList = await DB.getAnsweredPlayersForQuestion(this.currentGame.id, this.currentIndex);
        if (answeredList && answeredList.length > 0) {
          if (!this.answeredPlayerSet) this.answeredPlayerSet = new Set();
          answeredList.forEach(item => {
            if (item) {
              const str = String(item).trim();
              this.answeredPlayerSet.add(str);
              this.answeredPlayerSet.add(str.toLowerCase());
            }
          });
        }
      } catch (e) {}
    }
    this.refreshHostPlayerAnswerStatuses();

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
    const leaderboard = await DB.getGameLeaderboard(this.currentGame.id, this.currentGame.room_code);
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
      const finalLeaderboard = await DB.getGameLeaderboard(this.currentGame.id, this.currentGame.room_code);

      const totalQ = this.questionsList ? this.questionsList.length : 10;
      const participantStandings = (finalLeaderboard || []).filter(p => {
        if (p.is_host || p.isHost) return false;
        if (this.currentGame && this.currentGame.host_id && (p.user_id === this.currentGame.host_id || p.id === this.currentGame.host_id)) return false;
        return true;
      });

      const analyticsData = {
        gameId: this.currentGame ? this.currentGame.id : 'game_' + Date.now(),
        roomCode: this.currentGame ? (this.currentGame.room_code || this.currentGame.access_code) : '000000',
        title: this.currentGame ? (this.currentGame.title || 'Science Host Quiz') : 'Science Host Quiz',
        totalQuestions: totalQ,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        participants: participantStandings.map(p => {
          const correct = Number(p.correct_answers || p.correct || 0);
          const points = Number(p.score || p.points || 0);
          const pct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
          return {
            name: p.display_name || p.playerName || p.name || 'Participant',
            points: points,
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

  saveCurrentHostAnalytics() {
    if (!this.isHost || !this.currentGame) return;

    const totalQ = (this.questionsList && this.questionsList.length > 0) ? this.questionsList.length : 10;
    const mergedMap = new Map();

    // Add ALL players who connected to the lobby/game (including players with 0 points)
    if (this.playersList && this.playersList.length > 0) {
      this.playersList.forEach(p => {
        if (!p) return;
        const isHost = p.is_host || p.isHost || (this.currentGame && (p.user_id === this.currentGame.host_id || p.id === this.currentGame.host_id));
        if (isHost) return;

        const name = p.playerName || p.display_name || p.name || 'Participant';
        const key = p.user_id || p.id || name.trim().toLowerCase();
        const score = Number(p.score || p.points || 0);
        const correct = Number(p.correct_answers || p.correct || 0);

        mergedMap.set(key, {
          name: name,
          points: score,
          correct: correct,
          totalQuestions: totalQ
        });
      });
    }

    const participantsList = Array.from(mergedMap.values()).map(p => {
      const correct = Number(p.correct || 0);
      const points = Number(p.points || 0);
      const pct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
      return {
        name: p.name,
        points: points,
        correct: correct,
        totalQuestions: totalQ,
        correctRatio: `${correct}/${totalQ}`,
        accuracyPct: pct
      };
    });

    const analyticsData = {
      gameId: this.currentGame.id || 'game_' + Date.now(),
      roomCode: this.currentGame.room_code || this.currentGame.access_code || '000000',
      title: this.currentGame.title || 'Science Host Quiz',
      totalQuestions: totalQ,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      participants: participantsList
    };

    DB.saveHostedGameAnalytics(analyticsData);
  },

  async confirmAction(options) {
    if (typeof App !== 'undefined' && typeof App.confirm === 'function') {
      return await App.confirm(options);
    }
    const msg = typeof options === 'string' ? options : (options.message || 'Are you sure?');
    return confirm(msg);
  },

  async hostCancelGame() {
    const confirmed = await this.confirmAction({
      title: 'Cancel Game Session',
      message: 'Are you sure you want to cancel and close this multiplayer room for all connected participants?',
      icon: '🚪',
      confirmText: 'Yes, Cancel Game',
      cancelText: 'Keep Room Open',
      danger: true
    });
    if (confirmed) {
      this.unsubscribeRealtime();
      App.showScreen('homeScreen');
    }
  },

  async onGameStart(data) {
    if (!this.isHost) {
      App.showScreen('mpPlayerGameScreen');
      const qIndex = (data && data.questionNumber) ? (data.questionNumber - 1) : 0;
      if (!this.questionsList || this.questionsList.length === 0) {
        if (this.currentGame) {
          this.questionsList = await DB.getMultiplayerQuestions(this.currentGame.id, this.currentGame.room_code);
        }
      }
      const qKey = `${qIndex}_${(data && data.startedAt) || ''}`;
      this.lastRenderedQuestionKey = qKey;
      await this.playerRenderQuestion(qIndex, data || {});
    }
  },

  onPlayerAnswered(data) {
    if (!this.isHost || !data) return;
    const { playerId, playerName, user_id, display_name, pointsEarned, totalScore, isCorrect } = data;

    if (!this.answeredPlayerSet) this.answeredPlayerSet = new Set();
    const keys = [playerId, playerName, user_id, display_name].filter(Boolean);
    keys.forEach(k => {
      const str = String(k).trim();
      this.answeredPlayerSet.add(str);
      this.answeredPlayerSet.add(str.toLowerCase());
    });

    if (this.playersList && this.playersList.length > 0) {
      let p = this.playersList.find(item => 
        (playerId && (item.id === playerId || item.user_id === playerId)) ||
        (playerName && (item.playerName === playerName || item.name === playerName || item.display_name === playerName))
      );
      if (!p && (playerName || playerId)) {
        p = {
          id: playerId || playerName,
          user_id: playerId,
          playerName: playerName || 'Player',
          display_name: playerName || 'Player',
          score: 0,
          correct_answers: 0,
          wrong_answers: 0,
          role: 'player'
        };
        this.playersList.push(p);
      }

      if (p) {
        if (totalScore !== undefined && totalScore !== null) {
          p.score = Math.max(p.score || 0, totalScore);
        } else if (pointsEarned !== undefined) {
          p.score = (p.score || 0) + pointsEarned;
        }
        if (isCorrect !== undefined) {
          p.correct_answers = (p.correct_answers || 0) + (isCorrect ? 1 : 0);
          p.wrong_answers = (p.wrong_answers || 0) + (isCorrect ? 0 : 1);
        }
      }
    }

    this.refreshHostPlayerAnswerStatuses();
    this.saveCurrentHostAnalytics();
  },

  onQuestionStart(data) {
    if (this.isHost) return;
    const qIndex = (data.questionNumber || 1) - 1;
    const qKey = `${qIndex}_${data.startedAt || ''}`;

    if (data.customQuestion) {
      if (!this.questionsList) this.questionsList = [];
      this.questionsList[qIndex] = {
        ...this.questionsList[qIndex],
        ...data.customQuestion
      };
    }

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

    if ((!this.questionsList || this.questionsList.length === 0 || !this.questionsList[index]) && this.currentGame) {
      this.questionsList = await DB.getMultiplayerQuestions(this.currentGame.id, this.currentGame.room_code);
    }

    const q = this.questionsList[index] || {};

    const banner = document.getElementById('mpPlayerFeedbackBanner');
    if (banner) banner.className = 'feedback-banner hidden';

    document.getElementById('mpPlayerQCounter').textContent = `Question ${index + 1} of ${this.questionsList.length || 10}`;
    document.getElementById('mpPlayerQuestionText').textContent = q.question || 'Question';

    this.questionDurationSec = (q && q.time_limit) ? q.time_limit : ((gameObj && gameObj.duration) ? gameObj.duration : ((this.currentGame && this.currentGame.time_limit) ? this.currentGame.time_limit : 20));

    const nowIso = new Date().toISOString();
    let startedAt = (gameObj && gameObj.question_start_time) ? gameObj.question_start_time : nowIso;
    const now = Date.now();
    let startTimeMs = new Date(startedAt).getTime();

    // If timestamp is invalid or would cause immediate expiration due to device clock offset, reset to local time
    if (isNaN(startTimeMs) || startTimeMs > now + 1000 || (now - startTimeMs) >= (this.questionDurationSec * 1000)) {
      startedAt = nowIso;
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
          const cA = q.choice_a || q.option_a || q.optionA || (q.options ? q.options[0] : null) || (q.choices ? q.choices.a : null);
          const cB = q.choice_b || q.option_b || q.optionB || (q.options ? q.options[1] : null) || (q.choices ? q.choices.b : null);
          const cC = q.choice_c || q.option_c || q.optionC || (q.options ? q.options[2] : null) || (q.choices ? q.choices.c : null);
          const cD = q.choice_d || q.option_d || q.optionD || (q.options ? q.options[3] : null) || (q.choices ? q.choices.d : null);

          if (cA && String(cA).trim() !== '') choicesMap.A = cA;
          if (cB && String(cB).trim() !== '') choicesMap.B = cB;
          if (cC && String(cC).trim() !== '') choicesMap.C = cC;
          if (cD && String(cD).trim() !== '') choicesMap.D = cD;
        }

        Object.keys(choicesMap).forEach(key => {
          const val = choicesMap[key];
          if (val) {
            const btn = document.createElement('button');
            btn.className = 'answer-option-btn';
            btn.type = 'button';
            btn.style.cursor = 'pointer';
            btn.style.touchAction = 'manipulation';
            btn.style.webkitTapHighlightColor = 'transparent';
            btn.innerHTML = `
              <span class="option-badge-pill"><span class="badge-letter">${key}</span></span>
              <span class="option-text" style="font-weight:700; text-align:left; color:#FFFFFF;">${val}</span>
            `;

            let hasSubmitted = false;
            const handleSelect = (e) => {
              if (hasSubmitted) return;
              hasSubmitted = true;
              if (e) {
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
              }
              this.submitPlayerChoice(q.id, key, btn);
            };

            btn.onclick = handleSelect;
            btn.addEventListener('touchend', handleSelect, { passive: false });
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
        b.style.cursor = 'pointer';
        b.style.touchAction = 'manipulation';
        b.classList.remove('selected-choice', 'correct-choice', 'wrong-choice');
      });
    }
  },

  async submitPlayerChoice(questionId, selectedChoice, btnEl) {
    if (this.hasAnsweredCurrent) return;
    this.hasAnsweredCurrent = true;
    this.disablePlayerChoices();

    if (btnEl) {
      btnEl.style.borderColor = '';
      btnEl.style.background = '';
      btnEl.classList.add('selected-choice');
      btnEl.style.opacity = '1';
    }

    const myProfile = DB.getStudentProfile() || {};
    const myName = myProfile.name || 'Player';
    const myId = DB.getUserUUID();

    try {
      localStorage.setItem(`nexus_ans_${this.currentIndex}_${myName.toLowerCase().trim()}`, 'true');
    } catch (_) {}

    this.sendBroadcast('PLAYER_ANSWERED', {
      playerId: myId,
      user_id: myId,
      playerName: myName,
      display_name: myName,
      pointsEarned: 0,
      totalScore: 0,
      isCorrect: false
    });

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
        playerName: (DB.getStudentProfile() || {}).name || 'Player',
        pointsEarned: result.points_earned || 0,
        totalScore: result.total_score !== undefined ? result.total_score : (result.points_earned || 0),
        isCorrect: result.is_correct || false
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

    const now = Date.now();
    let startTime = startedAtIso ? new Date(startedAtIso).getTime() : now;
    const durationMs = (durationSec || 20) * 1000;

    // Safety guard against cross-device clock skew (e.g. phone clock vs host clock mismatch):
    // If startTime is invalid, in future, or would result in <=0 remaining time on init,
    // fallback to current local time so the user gets a working countdown and enabled choices.
    if (isNaN(startTime) || startTime > now + 1000 || (now - startTime) >= durationMs) {
      startTime = now;
    }

    const updateTimer = () => {
      const currentNow = Date.now();
      const elapsedMs = currentNow - startTime;
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

    let list = standings || [];
    const mergedStandingsMap = new Map();

    const addStandingItem = (item) => {
      if (!item) return;
      const isHost = item.is_host || item.isHost || (this.currentGame && this.currentGame.host_id && (item.user_id === this.currentGame.host_id || item.id === this.currentGame.host_id));
      if (isHost) return;

      const name = item.display_name || item.playerName || item.name || 'Player';
      const score = Number(item.score || item.points || 0);
      const correct = Number(item.correct_answers || item.correct || 0);

      let existingKey = null;
      for (const [key, existing] of mergedStandingsMap.entries()) {
        if ((item.user_id && existing.user_id === item.user_id) || (item.id && existing.id === item.id) || (name && existing.display_name === name)) {
          existingKey = key;
          break;
        }
      }

      if (existingKey) {
        const existing = mergedStandingsMap.get(existingKey);
        existing.score = Math.max(existing.score, score);
        existing.correct_answers = Math.max(existing.correct_answers, correct);
      } else {
        const key = item.user_id || item.id || name;
        mergedStandingsMap.set(key, {
          id: key,
          user_id: item.user_id || key,
          display_name: name,
          playerName: name,
          score: score,
          correct_answers: correct,
          is_host: false
        });
      }
    };

    (list || []).forEach(addStandingItem);
    if (this.playersList && this.playersList.length > 0) {
      this.playersList.forEach(addStandingItem);
    }

    const participantStandings = Array.from(mergedStandingsMap.values());
    participantStandings.sort((a, b) => (b.score || 0) - (a.score || 0));

    if (rosterEl) {
      rosterEl.innerHTML = '';
      if (participantStandings.length === 0) {
        rosterEl.innerHTML = '<div style="color:#94A3B8; text-align:center; padding:16px;">No participant scores recorded.</div>';
      } else {
        participantStandings.forEach((p, idx) => {
          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          card.style.background = 'rgba(25, 17, 50, 0.95)';
          card.style.border = '1.5px solid rgba(139, 92, 246, 0.35)';
          card.style.borderRadius = '20px';
          card.style.padding = '16px 20px';
          card.style.marginBottom = '12px';
          card.style.display = 'flex';
          card.style.alignItems = 'center';
          card.style.justifyContent = 'space-between';

          const medals = ['🥇', '🥈', '🥉'];
          const rankTag = idx < 3 ? medals[idx] : `#${idx + 1}`;
          const displayName = p.display_name || p.name || p.playerName || 'Player';
          card.innerHTML = `
            <div class="part-info-left" style="justify-content:space-between; width:100%; align-items:center;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.6rem; display:flex; align-items:center; justify-content:center;">${rankTag}</span>
                <div style="text-align:left;">
                  <h5 style="margin:0; font-size:1.05rem; color:#FFFFFF; font-weight:800; font-family:var(--font-heading);">${displayName}</h5>
                  <span style="font-size:0.82rem; color:#A5A3C4; font-weight:500;">Correct: ${p.correct_answers || 0}</span>
                </div>
              </div>
              <span style="font-weight:900; color:#34D399; font-size:1.3rem; font-family:var(--font-heading);">${(p.score || 0).toLocaleString()} pts</span>
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
  },

  handleBroadcastEvent(data) {
    if (!data) return;
    const eventType = data.event || data.type;
    const payload = data.payload || data;

    switch (eventType) {
      case 'GAME_START':
        this.onGameStart(payload);
        break;
      case 'QUESTION_START':
        this.onQuestionStart(payload);
        break;
      case 'PLAYER_ANSWERED':
        this.onPlayerAnswered(payload);
        break;
      case 'GAME_FINISH':
        this.onGameFinish(payload);
        break;
      case 'PLAYER_KICKED':
        this.onPlayerKicked(payload);
        break;
    }
  },

  onPlayerKicked(payload) {
    if (this.isHost) return;
    const myUuid = DB.getUserUUID();
    const profile = DB.getStudentProfile() || {};
    const myName = profile.name || 'Player';

    if (payload && (payload.playerId === myUuid || payload.playerName === myName)) {
      alert('You have been removed from the game lobby by the host.');
      this.unsubscribeRealtime();
      App.showScreen('homeScreen');
    }
  },

  async viewParticipantProfile(playerName, photoUrl, playerObj = null) {
    const modal = this.createAvatarModal();
    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%232E1065'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23C084FC'>👤</text></svg>";

    let p = (typeof playerObj === 'object' && playerObj !== null) ? playerObj : null;
    if (!p && this.playersList && this.playersList.length > 0) {
      const searchKey = (playerName || '').trim().toLowerCase();
      p = this.playersList.find(item => {
        const name = (item.playerName || item.display_name || item.name || '').trim().toLowerCase();
        return (playerName && name === searchKey) || (photoUrl && item.photoUrl === photoUrl);
      });
    }

    const cleanName = (p ? (p.playerName || p.display_name || p.name) : null) || (playerName && playerName !== 'Participant' ? playerName : 'Participant');
    let imgSrc = (p ? (p.photoUrl || p.photo || p.photo_url) : null) || (photoUrl && photoUrl !== '' && !photoUrl.includes('data:image/svg+xml') ? photoUrl : null);

    const pts = p ? Number(p.score || p.points || 0) : 0;
    const correct = p ? Number(p.correct_answers || p.correct || 0) : 0;
    const pId = p ? (p.id || p.user_id || cleanName) : cleanName;

    modal.innerHTML = `
      <div class="modal-card" style="background: linear-gradient(135deg, rgba(22, 14, 45, 0.98) 0%, rgba(16, 10, 34, 0.98) 100%); border: 1.5px solid rgba(139, 92, 246, 0.4); border-radius: 24px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.85); max-width: 400px; width: 88%; text-align: center; color: white; margin: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="margin: 0; color: #FFFFFF; font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800;">Participant Profile & Photo</h4>
          <button class="close-modal-btn" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.15); font-size: 1.1rem; cursor: pointer; color: #FFFFFF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onclick="Multiplayer.closeAvatarModal()">✕</button>
        </div>

        <div style="position: relative; display: inline-block; margin: 8px 0 14px 0;">
          <img id="mpParticipantModalPhoto" src="${imgSrc || defaultAvatar}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%; border: 3.5px solid #A855F7; box-shadow: 0 0 32px rgba(168, 85, 247, 0.7);" alt="${cleanName}">
        </div>

        <h3 id="mpParticipantModalName" style="margin: 4px 0 2px 0; color: #FFFFFF; font-weight: 800; font-size: 1.45rem; font-family: var(--font-heading);">${cleanName}</h3>
        <span style="display: inline-block; background: rgba(52, 211, 153, 0.2); color: #34D399; border: 1px solid rgba(52, 211, 153, 0.4); font-weight: 700; font-size: 0.78rem; padding: 5px 16px; border-radius: 20px; margin-bottom: 16px;">● Online in Game Lobby</span>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(139, 92, 246, 0.25); padding: 14px; border-radius: 16px; margin-bottom: 16px;">
          <div>
            <strong style="font-size: 1.2rem; color: #C084FC; font-weight: 800;">${pts.toLocaleString()}</strong>
            <div style="font-size: 0.75rem; color: #A5A3C4; margin-top: 2px;">Total Score</div>
          </div>
          <div>
            <strong style="font-size: 1.2rem; color: #34D399; font-weight: 800;">${correct}</strong>
            <div style="font-size: 0.75rem; color: #A5A3C4; margin-top: 2px;">Correct Answers</div>
          </div>
        </div>

        ${this.isHost ? `
          <button onclick="Multiplayer.kickPlayerFromLobby('${String(pId).replace(/'/g, "\\'")}', '${String(cleanName).replace(/'/g, "\\'")}')" 
                  style="width: 100%; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #FCA5A5; font-weight: 700; font-size: 0.88rem; padding: 12px; border-radius: 14px; cursor: pointer; transition: all 0.2s;"
                  onmouseover="this.style.background='rgba(239, 68, 68, 0.35)';"
                  onmouseout="this.style.background='rgba(239, 68, 68, 0.2)';">
            🚫 Remove Player from Lobby
          </button>
        ` : ''}
      </div>
    `;

    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    // Async fetch photo from Supabase profiles / multiplayer_players if missing
    if ((!imgSrc || imgSrc === defaultAvatar) && typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        let fetchedPhoto = null;
        let fetchedName = null;

        if (pId && typeof DB !== 'undefined' && DB.isValidUuid && DB.isValidUuid(pId)) {
          const { data: prof } = await supabaseClient.from('profiles').select('name, full_name, photo_url, photo').eq('id', pId).maybeSingle();
          if (prof) {
            fetchedPhoto = prof.photo_url || prof.photo;
            fetchedName = prof.full_name || prof.name;
          }
        }

        if (!fetchedPhoto && this.currentGame && this.currentGame.id) {
          const { data: mp } = await supabaseClient
            .from('multiplayer_players')
            .select('display_name, photo_url')
            .eq('game_id', this.currentGame.id)
            .or(`user_id.eq.${pId},display_name.eq.${cleanName}`)
            .maybeSingle();
          if (mp) {
            fetchedPhoto = mp.photo_url;
            fetchedName = mp.display_name;
          }
        }

        const imgEl = document.getElementById('mpParticipantModalPhoto');
        const nameEl = document.getElementById('mpParticipantModalName');
        if (fetchedPhoto && imgEl) {
          imgEl.src = fetchedPhoto;
          if (p) p.photoUrl = fetchedPhoto;
        }
        if (fetchedName && nameEl && cleanName === 'Participant') {
          nameEl.textContent = fetchedName;
          if (p) p.playerName = fetchedName;
        }
      } catch (e) {}
    }
  },

  async kickPlayerFromLobby(playerId, playerName) {
    if (!playerName && !playerId) return;
    const targetName = playerName || 'Participant';
    
    const confirmed = await this.confirmAction({
      title: 'Remove Player from Lobby',
      message: `Are you sure you want to remove "${targetName}" from this game lobby?`,
      icon: '🚫',
      confirmText: 'Yes, Remove Player',
      cancelText: 'Cancel',
      danger: true
    });

    if (confirmed) {
      this.closeAvatarModal();

      if (this.playersList) {
        this.playersList = this.playersList.filter(p => 
          p.id !== playerId && 
          p.user_id !== playerId && 
          p.playerName !== targetName && 
          p.display_name !== targetName && 
          p.name !== targetName
        );
      }

      if (this.currentGame && this.currentGame.id) {
        try {
          if (typeof DB !== 'undefined' && DB.leaveMultiplayerGame) {
            await DB.leaveMultiplayerGame(this.currentGame.id, playerId);
          }
        } catch (err) {}
      }

      this.sendBroadcast('game_event', { event: 'PLAYER_KICKED', payload: { playerId, playerName: targetName } });
      this.refreshHostPresenceRoster();
    }
  },

  openParticipantInfo(playerName, photoUrl, playerId = null) {
    let pObj = null;
    if (typeof playerId === 'object' && playerId !== null) {
      pObj = playerId;
    } else if (this.playersList && this.playersList.length > 0) {
      pObj = this.playersList.find(item => 
        (playerId && (item.id === playerId || item.user_id === playerId)) ||
        (playerName && (item.playerName === playerName || item.name === playerName || item.display_name === playerName))
      );
    }
    this.viewParticipantProfile(playerName, photoUrl, pObj);
  },

  setupRosterEventDelegation() {
    const rosterEl = document.getElementById('mpHostPresenceRoster');
    if (rosterEl && !rosterEl._delegated) {
      rosterEl._delegated = true;
      const handler = (e) => {
        const card = e.target.closest('.lobby-part-card');
        if (card) {
          const name = card.getAttribute('data-player-name') || (card._playerObj ? card._playerObj.playerName : 'Participant');
          const photo = card.getAttribute('data-player-photo') || (card._playerObj ? card._playerObj.photoUrl : '');
          const pId = card.getAttribute('data-player-id') || '';
          const pObj = card._playerObj || null;
          Multiplayer.viewParticipantProfile(name, photo, pObj || pId);
        }
      };
      rosterEl.addEventListener('click', handler);
      rosterEl.addEventListener('touchend', (e) => {
        handler(e);
      });
    }
  },

  createAvatarModal() {
    let modal = document.getElementById('mpParticipantPhotoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'mpParticipantPhotoModal';
      modal.className = 'modal-backdrop hidden';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
      modal.style.backdropFilter = 'blur(8px)';
      modal.style.display = 'none';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '99999';
      modal.onclick = (e) => {
        if (e.target === modal) this.closeAvatarModal();
      };
      document.body.appendChild(modal);
    }
    return modal;
  },

  closeAvatarModal() {
    const modal = document.getElementById('mpParticipantPhotoModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && (e.key.startsWith('nexus_mp_sync_trigger_') || e.key.startsWith('nexus_mp_answer_trigger_') || e.key.startsWith('nexus_lobby_'))) {
      if (typeof Multiplayer !== 'undefined' && Multiplayer.isHost && Multiplayer.currentGame) {
        if (e.key.startsWith('nexus_mp_answer_trigger_') && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            if (data && (data.userUuid || data.displayName)) {
              if (!Multiplayer.answeredPlayerSet) Multiplayer.answeredPlayerSet = new Set();
              if (data.userUuid) {
                Multiplayer.answeredPlayerSet.add(String(data.userUuid).trim());
                Multiplayer.answeredPlayerSet.add(String(data.userUuid).toLowerCase().trim());
              }
              if (data.displayName) {
                Multiplayer.answeredPlayerSet.add(String(data.displayName).trim());
                Multiplayer.answeredPlayerSet.add(String(data.displayName).toLowerCase().trim());
              }
              Multiplayer.refreshHostPlayerAnswerStatuses();
            }
          } catch (_) {}
        }
        if (e.key.startsWith('nexus_mp_sync_trigger_') && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            if (data && data.displayName && data.score !== undefined) {
              if (Multiplayer.playersList && Multiplayer.playersList.length > 0) {
                let p = Multiplayer.playersList.find(item =>
                  (data.userUuid && (item.id === data.userUuid || item.user_id === data.userUuid)) ||
                  (item.playerName === data.displayName || item.display_name === data.displayName || item.name === data.displayName)
                );
                if (p) {
                  p.score = Math.max(p.score || 0, data.score || 0);
                  if (data.correct) p.correct_answers = (p.correct_answers || 0) + data.correct;
                }
              }
            }
          } catch (_) {}
        }
        Multiplayer.syncHostRoster();
      }
    }
  });
}
