/* ==========================================================================
   NEXUS KAHOOT-STYLE REALTIME MULTIPLAYER TRIVIA ENGINE
   Uses Supabase Realtime Channels (game_room_<pin>), Presence (connected user state),
   and Broadcast (ephemeral sub-50ms game events) with Supabase Postgres.
   ========================================================================== */

var Multiplayer = window.Multiplayer = {
  compressImagePromise(src, maxDim = 480, quality = 0.6) {
    return new Promise((resolve) => {
      if (!src || typeof src !== 'string' || !src.startsWith('data:image')) {
        return resolve(src);
      }
      const img = new Image();
      img.onload = () => {
        try {
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (_) {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  },
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
    App.goHome();
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
      if (typeof Achievements !== 'undefined' && Achievements.recordLiveQuizEvent) {
        Achievements.recordLiveQuizEvent('host');
      }
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
    if (nameInput) nameInput.value = profile.username || profile.name || '';
    if (errEl) {
      errEl.classList.add('hidden');
      errEl.innerHTML = '';
    }

    this.renderActiveLobbiesList();
    App.showScreen('mpPlayerJoinScreen');
  },

  renderActiveLobbiesList() {
    const container = document.getElementById('mpActiveLobbiesContainer');
    if (!container) return;

    const allLobbies = (typeof DB !== 'undefined' && DB.getAllLocalLobbies) ? DB.getAllLocalLobbies() : [];
    const now = Date.now();
    const valid = allLobbies.filter(l => (now - (l.lastUpdated || 0) < 1000 * 60 * 180));

    if (valid.length === 0) {
      container.innerHTML = '';
      return;
    }

    let html = '<div style="margin-bottom: 12px; text-align: left;">';
    html += '<div style="font-size: 0.76rem; color: #34D399; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;"><span>🟢</span> ACTIVE LOBBY FOUND:</div>';
    valid.slice(0, 3).forEach(l => {
      const code = (l.code || l.room_code || '').toUpperCase();
      const host = l.hostName || 'Host';
      const parts = (l.participants ? l.participants.length : 1);
      html += '<div style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid rgba(16, 185, 129, 0.45); border-radius: 14px; padding: 10px 14px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s;" onclick="Multiplayer.quickFillPin(\'' + code + '\')" title="Click to auto-fill PIN and join">' +
        '<div style="text-align: left;">' +
          '<span style="font-size: 1.15rem; font-weight: 900; color: #FFFFFF; font-family: var(--font-heading); letter-spacing: 3px;">' + code + '</span>' +
          '<span style="font-size: 0.74rem; color: #A7F3D0; margin-left: 8px;">Host: <b>' + host + '</b> (' + parts + ' online)</span>' +
        '</div>' +
        '<button type="button" class="primary-btn" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 800; border-radius: 8px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); border: none; color: white;">Tap to Join</button>' +
      '</div>';
    });
    html += '</div>';
    container.innerHTML = html;

    const pinInput = document.getElementById('mpPinInput');
    if (pinInput && !pinInput.value && valid.length > 0) {
      pinInput.value = (valid[0].code || '').toUpperCase();
    }
  },

  quickFillPin(code) {
    const pinInput = document.getElementById('mpPinInput');
    if (pinInput) pinInput.value = (code || '').toUpperCase();
    this.submitJoinLobby();
  },

  async startInstantPracticeLobby(pin) {
    const cleanPin = (pin || DB.generate6CharRoomCode()).toUpperCase().trim();
    const profile = DB.getStudentProfile() || {};
    const questions = (typeof DB !== 'undefined' && DB.getQuestions) ? DB.getQuestions('b0000000-0000-0000-0000-000000000001', null, 'multiple_choice', 10) : [];

    try {
      const game = await DB.createMultiplayerGame({
        roomCode: cleanPin,
        termId: 'b0000000-0000-0000-0000-000000000001',
        answerMedium: 'multiple_choice',
        questionCount: 10,
        timeLimit: 20,
        customQuestions: questions
      });

      this.currentGame = game;
      this.isHost = true;
      this.questionsList = game.formattedQuestions || [];

      await this.enterHostLobbyScreen(game);
      if (typeof Achievements !== 'undefined' && Achievements.recordLiveQuizEvent) {
        Achievements.recordLiveQuizEvent('host');
      }
    } catch (e) {
      console.error(e);
      alert('Error launching lobby: ' + (e.message || e));
    }
  },

  async startPracticeMatch(pin) {
    const cleanPin = (pin || 'AI' + Math.floor(1000 + Math.random() * 9000)).toUpperCase().trim();
    const profile = DB.getStudentProfile() || {};
    const myName = (document.getElementById('mpNicknameInput')?.value || '').trim() || profile.username || profile.name || 'Student';
    const questions = (typeof DB !== 'undefined' && DB.getQuestions) ? DB.getQuestions('b0000000-0000-0000-0000-000000000001', null, 'multiple_choice', 10) : [];

    const bots = [
      { user_id: 'bot_sakshi', id: 'bot_sakshi', display_name: 'Sakshi', score: 0, correct_answers: 0, wrong_answers: 0, is_bot: true },
      { user_id: 'bot_raflu', id: 'bot_raflu', display_name: 'Raflu', score: 0, correct_answers: 0, wrong_answers: 0, is_bot: true },
      { user_id: 'bot_palizya', id: 'bot_palizya', display_name: 'Palizya', score: 0, correct_answers: 0, wrong_answers: 0, is_bot: true }
    ];

    const formattedQ = (questions && questions.length > 0) ? questions.map(q => ({ ...q, time_limit: 20 })) : [];

    const localState = {
      code: cleanPin,
      gameId: 'game_' + cleanPin,
      hostId: 'ai_host',
      hostName: 'Nexus Science Host',
      status: 'waiting',
      settings: {
        timeLimitSec: 20,
        questionCount: 10,
        questionsList: formattedQ
      },
      participants: [
        { user_id: 'ai_host', id: 'ai_host', display_name: 'Host', is_host: true, score: 0, correct_answers: 0, wrong_answers: 0 },
        ...bots
      ],
      lastUpdated: Date.now()
    };

    DB.saveLocalLobbyState(cleanPin, localState);

    try {
      const game = await DB.joinMultiplayerGame(cleanPin, myName);
      this.currentGame = game;
      this.isHost = false;
      this.isBotMatch = true;

      await this.enterPlayerLobbyScreen(game, myName);
    } catch (e) {
      console.error(e);
      alert('Error entering match: ' + (e.message || e));
    }
  },

  // 4. Submit Player Join PIN
  async submitJoinLobby() {
    const pinInput = document.getElementById('mpPinInput');
    const nameInput = document.getElementById('mpNicknameInput');
    const errEl = document.getElementById('mpJoinError');
    const btn = document.getElementById('mpJoinSubmitBtn');

    if (errEl) {
      errEl.classList.add('hidden');
      errEl.innerHTML = '';
    }
    const pinVal = (pinInput ? pinInput.value : '').toUpperCase().trim();
    const profile = DB.getStudentProfile() || {};
    const nicknameVal = (nameInput ? nameInput.value : '').trim() || profile.username || profile.name || 'Player';

    if (pinVal.length < 4 || pinVal.length > 8) {
      if (errEl) {
        errEl.textContent = '⚠️ Please enter a valid 5 to 6 character Game PIN (e.g. 482913)!';
        errEl.classList.remove('hidden');
      }
      return;
    }

    try {
      if (btn) btn.disabled = true;
      const game = await DB.joinMultiplayerGame(pinVal, nicknameVal);
      this.currentGame = game;
      this.isHost = false;

      if (typeof Achievements !== 'undefined' && Achievements.recordLiveQuizEvent) {
        Achievements.recordLiveQuizEvent('join', { roomCode: pinVal });
      }

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
      console.warn('Join lobby note:', e);
      if (errEl) {
        errEl.innerHTML = 
          '<div style="background: rgba(239, 68, 68, 0.12); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 14px; padding: 12px; margin-top: 4px;">' +
            '<div style="color: #F87171; font-weight: 800; font-size: 0.92rem; margin-bottom: 4px;">⚠️ Room "' + (pinVal || '') + '" Not Found</div>' +
            '<div style="color: #A5A3C4; font-size: 0.78rem; margin-bottom: 10px;">Make sure the host has started the lobby, or launch this room immediately:</div>' +
            '<div style="display: flex; flex-direction: column; gap: 8px;">' +
              '<button type="button" class="primary-btn" style="width: 100%; padding: 10px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; background: linear-gradient(135deg, #7C3AED, #6366F1); cursor: pointer; border: none; color: white;" onclick="Multiplayer.startInstantPracticeLobby(\'' + (pinVal || '') + '\')">' +
                '👑 Host Room "' + (pinVal || '') + '" & Start Now' +
              '</button>' +
              '<button type="button" class="secondary-btn" style="width: 100%; padding: 9px; border-radius: 12px; font-weight: 700; font-size: 0.82rem; background: rgba(124, 58, 237, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); color: #E9D5FF; cursor: pointer;" onclick="Multiplayer.startPracticeMatch(\'' + (pinVal || '') + '\')">' +
                '🤖 Play Solo with AI Classmates' +
              '</button>' +
            '</div>' +
          '</div>';
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

    // Set up instantaneous zero-delay BroadcastChannel for multi-tab player joins
    const cleanCode = (game.room_code || '').toUpperCase().trim();
    if (this.hostBroadcastChannel) {
      try { this.hostBroadcastChannel.close(); } catch (_) {}
    }
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.hostBroadcastChannel = new BroadcastChannel('nexus_lobby_' + cleanCode);
        this.hostBroadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'PLAYER_JOINED') {
            console.log('⚡ Player join received via BroadcastChannel:', event.data.player);
            this.syncHostRoster();
          }
        };
      }
    } catch (_) {}

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
    this.hostLobbyPollInterval = setInterval(poll, 600);
  },

  isHostPlayer(p) {
    if (!p) return false;
    // Explicit player role or explicit non-host flag can NEVER be the host!
    if (p.role === 'player' || p.is_host === false || p.isHost === false) return false;
    if (p.is_host === true || p.isHost === true || p.role === 'host') return true;
    if (p.display_name === 'Host' || p.playerName === 'Host' || p.name === 'Host' || p.role === 'teacher') return true;

    if (this.currentGame && this.currentGame.host_id) {
      const hostId = String(this.currentGame.host_id).trim();
      if (hostId && hostId.length > 5) {
        if (p.id && String(p.id).trim() === hostId) return true;
        if (p.user_id && String(p.user_id).trim() === hostId) return true;
      }
    }

    return false;
  },

  async syncHostRoster() {
    if (!this.currentGame) return;

    // A. Query Postgres database table for joined players
    const dbPlayers = await DB.getMultiplayerPlayers(this.currentGame.id, this.currentGame.room_code);

    const mergedMap = new Map();
    (dbPlayers || []).forEach(p => {
      if (!this.isHostPlayer(p)) {
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
            if (!this.isHostPlayer(p) && p.playerName) {
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

    // Direct local lobby state check for zero-latency local/multi-tab discovery
    if (this.currentGame && this.currentGame.room_code && typeof DB !== 'undefined' && DB.getLocalLobbyState) {
      const localLobby = DB.getLocalLobbyState(this.currentGame.room_code);
      if (localLobby && Array.isArray(localLobby.participants)) {
        localLobby.participants.forEach(p => {
          if (p && !this.isHostPlayer(p)) {
            const name = p.display_name || p.playerName || p.name || 'Player';
            const key = p.id || p.user_id || name;
            if (key && !mergedMap.has(key)) {
              mergedMap.set(key, {
                id: key,
                user_id: p.user_id || key,
                playerName: name,
                display_name: name,
                photoUrl: p.photo_url || p.photoUrl || p.photo || null,
                score: p.score || 0,
                correct_answers: p.correct_answers || 0,
                wrong_answers: p.wrong_answers || 0,
                role: 'player'
              });
            }
          }
        });
      }
    }

    // C. Preserve existing in-memory scores from this.playersList (e.g. from PLAYER_ANSWERED broadcasts)
    if (this.playersList && this.playersList.length > 0) {
      this.playersList.forEach(existingP => {
        if (this.isHostPlayer(existingP)) return;
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

    this.playersList = Array.from(mergedMap.values()).filter(p => !this.isHostPlayer(p));
    this.refreshHostPresenceRoster();
  },

  // 6. Player Lobby Screen Management & Cross-Device Sync Polling
  async enterPlayerLobbyScreen(game, nickname) {
    App.showScreen('mpPlayerLobbyScreen');
    const badge = document.getElementById('mpPlayerNicknameBadge');
    const tag = document.getElementById('mpPlayerChannelTag');
    const botStartBtn = document.getElementById('mpBotStartMatchBtn');

    const cleanNick = nickname || 'Player';
    this.currentPlayerNickname = cleanNick;
    try {
      sessionStorage.setItem('nexus_current_player_name', cleanNick);
      localStorage.setItem('nexus_current_player_name', cleanNick);
    } catch (_) {}

    if (badge) badge.textContent = `👤 ${cleanNick}`;
    if (tag) tag.textContent = `PIN: ${game.room_code}`;

    if (botStartBtn) {
      if (this.isBotMatch || game.host_id === 'ai_host' || game.host_id === 'demo_host') {
        botStartBtn.style.display = 'block';
      } else {
        botStartBtn.style.display = 'none';
      }
    }

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
        const isLobbyActive = App.currentScreen === 'mpPlayerLobbyScreen' || 
          (document.getElementById('mpPlayerLobbyScreen') && document.getElementById('mpPlayerLobbyScreen').classList.contains('active'));

        // Periodically announce presence to Host while on the waiting screen so host NEVER misses joiner
        if (isLobbyActive && typeof RealtimeRelay !== 'undefined' && RealtimeRelay.isConnected) {
          const myId = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nexus_current_player_id')) || 
                       (typeof DB !== 'undefined' ? DB.getUserUUID() : ('u_' + Date.now()));
          const myName = this.currentPlayerNickname || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nexus_current_player_name')) || 'Player';
          RealtimeRelay.sendJoin({
            id: myId,
            user_id: myId,
            name: myName,
            playerName: myName,
            display_name: myName,
            role: 'player'
          });
        }

        const game = await DB.getMultiplayerGameByCode(this.currentGame.room_code);
        if (!game) return;

        const isGameScreenActive = App.currentScreen === 'mpPlayerGameScreen' ||
          (document.getElementById('mpPlayerGameScreen') && document.getElementById('mpPlayerGameScreen').classList.contains('active'));

        if ((game.status === 'active' || game.status === 'starting' || game.status === 'in_progress') && isLobbyActive) {
          if (typeof RealtimeRelay !== 'undefined' && RealtimeRelay.sendSyncRequest) {
            RealtimeRelay.sendSyncRequest();
          }
          if (!this.questionsList || this.questionsList.length === 0) {
            try {
              this.questionsList = await DB.getMultiplayerQuestions(game.id, game.room_code);
            } catch (_) {}
          }
          if (!this.questionsList || this.questionsList.length === 0) {
            if (typeof window !== 'undefined' && window.OFFLINE_QUESTIONS_BANK && window.OFFLINE_QUESTIONS_BANK.length > 0) {
              this.questionsList = DB._formatQuestions(window.OFFLINE_QUESTIONS_BANK.slice(0, 10));
            }
          }
          App.showScreen('mpPlayerGameScreen');
          const currentIdx = game.current_question_index || 0;
          const qStartTime = game.question_start_time || '';
          this.lastRenderedQuestionKey = `${currentIdx}_${qStartTime}`;
          await this.playerRenderQuestion(currentIdx, game);
        } else if ((game.status === 'active' || game.status === 'starting' || game.status === 'in_progress') && isGameScreenActive) {
          const dbIndex = game.current_question_index || 0;

          // ONLY advance if the host advanced to a NEW question index (dbIndex > this.currentIndex)!
          // NEVER re-render or repeat if the participant is on the current question or already answered it!
          if (dbIndex > this.currentIndex) {
            console.log(`📡 Host advanced to new question: ${dbIndex + 1}`);
            this.currentIndex = dbIndex;
            this.hasAnsweredCurrent = false;
            this.lastRenderedQuestionKey = `q_${dbIndex}`;
            if (!this.questionsList || this.questionsList.length === 0 || !this.questionsList[dbIndex]) {
              try {
                this.questionsList = await DB.getMultiplayerQuestions(game.id, game.room_code);
              } catch (_) {}
            }
            if (!this.questionsList || this.questionsList.length === 0) {
              if (typeof window !== 'undefined' && window.OFFLINE_QUESTIONS_BANK && window.OFFLINE_QUESTIONS_BANK.length > 0) {
                this.questionsList = DB._formatQuestions(window.OFFLINE_QUESTIONS_BANK.slice(0, 10));
              }
            }
            await this.playerRenderQuestion(dbIndex, game);
          }
        } else if ((game.status === 'show_results' || game.status === 'finished') && App.currentScreen !== 'mpLeaderboardScreen') {
          const title = (game.status === 'finished') ? '🏆 Final Podium Leaderboard' : 'Current Standings 📊';
          const leaderboard = await DB.getGameLeaderboard(game.id, game.room_code);
          this.renderLeaderboardScreen(title, leaderboard);
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

    // A. Local BroadcastChannel for seamless instant cross-tab sync without Supabase
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.localBroadcastChannel = new BroadcastChannel('nexus_game_' + cleanPin);
        this.localBroadcastChannel.onmessage = (e) => {
          if (e && e.data) {
            this.handleBroadcastEvent(e.data);
          }
        };
      } catch (err) {}
    }

    // B. RealtimeRelay for seamless cross-device communication (Phone <-> PC across 4G/Wi-Fi)
    if (typeof RealtimeRelay !== 'undefined') {
      const myId = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nexus_current_player_id')) || (typeof DB !== 'undefined' ? DB.getUserUUID() : ('u_' + Date.now()));
      const profile = (typeof DB !== 'undefined' && DB.getStudentProfile) ? DB.getStudentProfile() || {} : {};
      
      const activePlayerName = name || this.currentPlayerNickname || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nexus_current_player_name')) || profile.name || 'Player';
      RealtimeRelay.init(cleanPin, role, {
        id: myId,
        user_id: myId,
        name: activePlayerName,
        playerName: activePlayerName,
        display_name: activePlayerName,
        photoUrl: profile.photo || null,
        role: role
      }, {
        onGameEvent: (payload) => {
          this.handleBroadcastEvent(payload);
        },
        onPlayerJoin: (player) => {
          if (this.isHost) {
            this.handleRemotePlayerJoin(player);
          }
        },
        onRosterSync: (players) => {
          if (!this.isHost && players && players.length > 0) {
            this.playersList = players;
          }
        },
        onGameStart: (payload) => {
          if (!this.isHost) {
            this.onGameStart(payload);
          }
        },
        onQuestionStart: (payload) => {
          if (!this.isHost) {
            this.onQuestionStart(payload);
          }
        },
        onNextQuestion: (payload) => {
          if (!this.isHost) {
            this.onNextQuestion(payload);
          }
        },
        onPlayerAnswer: (payload) => {
          if (this.isHost) {
            this.onPlayerAnswered(payload);
          }
        },
        onQuestionLock: (payload) => {
          if (!this.isHost) {
            this.onQuestionLock(payload);
          }
        },
        onAnswerReveal: (payload) => {
          if (!this.isHost) {
            this.onShowResults(payload);
          }
        },
        onGameFinish: (payload) => {
          if (!this.isHost) {
            this.onGameFinish(payload);
          }
        },
        onSyncRequest: () => {
          if (this.isHost && this.currentGame && this.questionsList && this.questionsList.length > 0) {
            const currentQ = this.questionsList[this.currentIndex || 0];
            if (typeof RealtimeRelay !== 'undefined' && RealtimeRelay.sendSyncResponse) {
              RealtimeRelay.sendSyncResponse({
                status: this.currentGame.status || 'active',
                currentIndex: this.currentIndex || 0,
                questionNumber: (this.currentIndex || 0) + 1,
                question: currentQ,
                customQuestion: currentQ,
                startedAt: this.questionStartedAt || new Date().toISOString(),
                duration: this.questionDurationSec || 20,
                totalQuestions: this.questionsList.length
              });
            }
          }
        },
        onSyncResponse: (payload) => {
          if (!this.isHost && payload) {
            const newIndex = (payload.currentIndex !== undefined) ? payload.currentIndex : ((payload.questionNumber || 1) - 1);
            // ONLY render if host moved to a NEW, HIGHER question index!
            if (newIndex > this.currentIndex && (payload.status === 'active' || payload.status === 'in_progress')) {
              this.currentIndex = newIndex;
              this.hasAnsweredCurrent = false;
              this.onQuestionStart(payload);
            }
          }
        }
      });

      // If student is joining, broadcast player join immediately
      if (role === 'player') {
        const studentPlayer = {
          id: myId,
          user_id: myId,
          name: name,
          playerName: name,
          display_name: name,
          photoUrl: profile.photo || null,
          role: 'player',
          is_host: false,
          score: 0,
          correct_answers: 0,
          wrong_answers: 0
        };
        setTimeout(() => {
          RealtimeRelay.sendJoin(studentPlayer);
          this.sendBroadcast('PLAYER_JOINED', { player: studentPlayer });
        }, 300);
      }
    }

    if (typeof DB !== 'undefined' && DB.canQuerySupabase && DB.canQuerySupabase() && typeof supabaseClient !== 'undefined' && supabaseClient) {
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

    if (this.localBroadcastChannel) {
      try {
        this.localBroadcastChannel.postMessage({ eventType, ...payload });
      } catch (e) {}
    }

    if (typeof RealtimeRelay !== 'undefined' && RealtimeRelay.publish) {
      try {
        RealtimeRelay.publish('game_event', { eventType, ...payload });
      } catch (e) {}
    }
  },

  handleRemotePlayerJoin(player) {
    if (!player || !this.currentGame) return;
    if (!this.playersList) this.playersList = [];

    const cleanName = player.playerName || player.display_name || player.name || 'Player';
    const pId = player.id || player.user_id || ('p_' + cleanName);

    // Don't add host as a player
    if (this.isHostPlayer(player)) return;

    // Check if player is already in roster
    const existingIndex = this.playersList.findIndex(p => p.id === pId || p.playerName === cleanName || p.display_name === cleanName);
    const playerObj = {
      id: pId,
      user_id: pId,
      playerName: cleanName,
      display_name: cleanName,
      photoUrl: player.photoUrl || player.photo_url || player.photo || null,
      score: player.score || 0,
      correct_answers: player.correct_answers || 0,
      wrong_answers: player.wrong_answers || 0,
      role: 'player',
      is_host: false
    };

    if (existingIndex >= 0) {
      this.playersList[existingIndex] = { ...this.playersList[existingIndex], ...playerObj };
    } else {
      this.playersList.push(playerObj);
    }

    // Persist to local lobby state so subsequent refreshes retain them
    const cleanCode = (this.currentGame.room_code || '').toUpperCase().trim();
    if (typeof DB !== 'undefined' && DB.getLocalLobbyState) {
      let localState = DB.getLocalLobbyState(cleanCode);
      if (!localState) {
        localState = {
          code: cleanCode,
          gameId: this.currentGame.id,
          hostId: this.currentGame.host_id,
          status: 'waiting',
          participants: []
        };
      }
      if (!Array.isArray(localState.participants)) localState.participants = [];
      const partIdx = localState.participants.findIndex(p => p.id === pId || p.display_name === cleanName);
      if (partIdx >= 0) {
        localState.participants[partIdx] = { ...localState.participants[partIdx], ...playerObj };
      } else {
        localState.participants.push(playerObj);
      }
      localState.lastUpdated = Date.now();
      DB.saveLocalLobbyState(cleanCode, localState);
    }

    // Update the Connected Players count and list on the Host screen
    this.refreshHostPresenceRoster();

    // Broadcast current roster back to all players across the internet
    if (typeof RealtimeRelay !== 'undefined' && RealtimeRelay.sendRosterSync) {
      RealtimeRelay.sendRosterSync(this.playersList);
    }
  },

  handleBroadcastEvent(data) {
    if (!data) return;
    const eventType = data.eventType || data.event || data.type;
    const payload = data.payload || data;

    if (eventType === 'PLAYER_JOINED' || eventType === 'PLAYER_JOIN') {
      if (this.isHost) {
        this.handleRemotePlayerJoin(payload.player || payload);
      }
    } else if (eventType === 'ROSTER_SYNC') {
      if (!this.isHost && payload.players && payload.players.length > 0) {
        this.playersList = payload.players;
      }
    } else if (eventType === 'GAME_START') {
      this.onGameStart(payload);
    } else if (eventType === 'QUESTION_START') {
      this.onQuestionStart(payload);
    } else if (eventType === 'PLAYER_ANSWERED') {
      this.onPlayerAnswered(payload);
    } else if (eventType === 'QUESTION_LOCK') {
      this.onQuestionLock(payload);
    } else if (eventType === 'SHOW_RESULTS') {
      this.onShowResults(payload);
    } else if (eventType === 'NEXT_QUESTION') {
      this.onNextQuestion(payload);
    } else if (eventType === 'GAME_FINISH') {
      this.onGameFinish(payload);
    } else if (eventType === 'PLAYER_KICKED') {
      this.onPlayerKicked(payload);
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

      const q0 = this.questionsList[0] || {};
      const typeId0 = q0.question_type_id || (q0.question_type === 'true_false' || q0.type === 'true_false' ? 2 : (q0.question_type === 'identification' || q0.type === 'identification' ? 3 : 1));
      let qBroadcastImg = q0.imageUrl || q0.image_url || q0.image || q0.photoUrl || q0.photo_url || q0.photo || null;
      if (qBroadcastImg && typeof qBroadcastImg === 'string' && qBroadcastImg.startsWith('data:image') && qBroadcastImg.length > 40000) {
        try {
          qBroadcastImg = await this.compressImagePromise(qBroadcastImg, 480, 0.6);
        } catch (_) {}
      }

      const choicesObj = {
        a: q0.choice_a || q0.option_a || (q0.options ? q0.options[0] : (typeId0 === 2 ? 'True' : '')),
        b: q0.choice_b || q0.option_b || (q0.options ? q0.options[1] : (typeId0 === 2 ? 'False' : '')),
        c: q0.choice_c || q0.option_c || (q0.options ? q0.options[2] : ''),
        d: q0.choice_d || q0.option_d || (q0.options ? q0.options[3] : '')
      };

      const startPayload = {
        questionNumber: 1,
        currentIndex: 0,
        startedAt: startIso,
        duration: initialDuration,
        questionId: q0.id || 'q_0',
        questionText: q0.question || '',
        imageUrl: qBroadcastImg,
        questionTypeId: typeId0,
        choices: choicesObj,
        customQuestion: {
          id: q0.id || 'q_0',
          question: q0.question || '',
          question_type_id: typeId0,
          question_type: q0.question_type || q0.type,
          choice_a: choicesObj.a,
          choice_b: choicesObj.b,
          choice_c: choicesObj.c,
          choice_d: choicesObj.d,
          correct_answer: q0.correct_answer || q0.correctAnswer || q0.answer,
          imageUrl: qBroadcastImg,
          image_url: qBroadcastImg,
          image: qBroadcastImg,
          photoUrl: qBroadcastImg,
          time_limit: initialDuration
        },
        questionsList: this.questionsList,
        serverTime: Date.now()
      };

      this.sendBroadcast('GAME_START', startPayload);
      this.sendBroadcast('QUESTION_START', startPayload);

      if (typeof RealtimeRelay !== 'undefined') {
        if (RealtimeRelay.sendGameStart) RealtimeRelay.sendGameStart(this.currentGame, this.questionsList);
        if (RealtimeRelay.sendNextQuestion) RealtimeRelay.sendNextQuestion(0, startPayload.customQuestion, initialDuration, this.questionsList);
      }

      this.saveCurrentHostAnalytics();
      this.hostRenderQuestion(0);
    } catch (e) {
      console.error(e);
      alert('Error starting game: ' + e.message);
      if (btn) btn.disabled = false;
    }
  },

  async hostRenderQuestion(index) {
    App.showScreen('mpHostGameScreen');
    this.currentIndex = index;
    this.answeredCount = 0;
    this.answeredPlayerSet = new Set();

    // Clear stale local answer triggers from previous sessions or questions
    try {
      const gKey = this.currentGame ? (this.currentGame.id || this.currentGame.room_code || 'game') : 'game';
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('nexus_ans_') || k.startsWith('nexus_mp_answer_trigger_')) {
          localStorage.removeItem(k);
        }
      });
    } catch (_) {}

    const banner = document.getElementById('mpHostCorrectAnswerBanner');
    if (banner) banner.classList.add('hidden');

    const q = this.questionsList[index];
    if (!q) return;

    document.getElementById('mpHostQCounter').textContent = `Question ${index + 1} of ${this.questionsList.length}`;
    document.getElementById('mpHostQuestionText').textContent = q.question;

    const hostImgBox = document.getElementById('mpHostQuestionImageContainer');
    const hostImgEl = document.getElementById('mpHostQuestionImageEl');
    const hostImgSrc = q.imageUrl || q.image_url || q.image;
    if (hostImgBox && hostImgEl) {
      if (hostImgSrc) {
        hostImgEl.src = hostImgSrc;
        hostImgBox.classList.remove('hidden');
      } else {
        hostImgEl.src = '';
        hostImgBox.classList.add('hidden');
      }
    }

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
              <span class="option-text">${choicesMap[key]}</span>
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
    let qBroadcastImg = q.imageUrl || q.image_url || q.image || q.photoUrl || q.photo_url || q.photo || null;
    if (qBroadcastImg && typeof qBroadcastImg === 'string' && qBroadcastImg.startsWith('data:image') && qBroadcastImg.length > 40000) {
      try {
        qBroadcastImg = await this.compressImagePromise(qBroadcastImg, 480, 0.6);
      } catch (_) {}
    }
    const currentQData = {
      id: q.id || `q_${index}`,
      question: q.question,
      question_type_id: typeId,
      question_type: q.question_type || q.type,
      choice_a: choicesObj.a,
      choice_b: choicesObj.b,
      choice_c: choicesObj.c,
      choice_d: choicesObj.d,
      correct_answer: q.correct_answer || q.correctAnswer || q.answer,
      imageUrl: qBroadcastImg,
      image_url: qBroadcastImg,
      image: qBroadcastImg,
      photoUrl: qBroadcastImg,
      time_limit: this.questionDurationSec
    };

    const questionBroadcastPayload = {
      questionNumber: index + 1,
      currentIndex: index,
      questionId: q.id || `q_${index}`,
      questionText: q.question,
      imageUrl: qBroadcastImg,
      questionTypeId: typeId,
      choices: choicesObj,
      customQuestion: currentQData,
      question: currentQData,
      questionsList: this.questionsList,
      startedAt: startedAt,
      duration: this.questionDurationSec,
      timeLimit: this.questionDurationSec,
      serverTime: Date.now()
    };

    this.sendBroadcast('QUESTION_START', questionBroadcastPayload);
    this.sendBroadcast('NEXT_QUESTION', questionBroadcastPayload);

    if (typeof RealtimeRelay !== 'undefined' && RealtimeRelay.sendNextQuestion) {
      RealtimeRelay.sendNextQuestion(index, currentQData, this.questionDurationSec, this.questionsList);
    }

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
        const updatedPlayers = await DB.getMultiplayerPlayers(this.currentGame.id, this.currentGame.room_code);
        if (updatedPlayers && updatedPlayers.length > 0) {
          if (!this.playersList) this.playersList = [];
          updatedPlayers.forEach(up => {
            if (this.isHostPlayer(up)) return;
            const upName = up.display_name || up.playerName || up.name || 'Player';
            const existing = this.playersList.find(p =>
              (up.id && (p.id === up.id || p.user_id === up.id)) ||
              (up.user_id && (p.user_id === up.user_id || p.id === up.user_id)) ||
              (upName && (p.playerName === upName || p.display_name === upName))
            );
            if (existing) {
              if (up.score !== undefined && up.score > (existing.score || 0)) {
                existing.score = up.score;
              }
              if (up.correct_answers !== undefined && up.correct_answers > (existing.correct_answers || 0)) {
                existing.correct_answers = up.correct_answers;
              }
            } else {
              this.playersList.push({
                ...up,
                playerName: upName,
                display_name: upName,
                role: 'player'
              });
            }
          });
        }

        const currentQ = this.questionsList ? this.questionsList[questionIndex] : null;
        const qId = currentQ ? currentQ.id : null;

        const answeredList = await DB.getAnsweredPlayersForQuestion(this.currentGame.id, questionIndex, qId);
        if (!this.answeredPlayerSet) this.answeredPlayerSet = new Set();
        if (answeredList && answeredList.length > 0) {
          answeredList.forEach(item => {
            if (item) {
              const str = String(item).trim();
              this.answeredPlayerSet.add(str);
              this.answeredPlayerSet.add(str.toLowerCase());
            }
          });
        }
        this.refreshHostPlayerAnswerStatuses();
      } catch (e) {}
    };

    poll();
    this.hostAnswerPollInterval = setInterval(poll, 1000);
  },

  refreshHostPlayerAnswerStatuses() {
    const listEl = document.getElementById('mpHostLivePlayerStatusList');
    const countEl = document.getElementById('mpHostAnswerCount');
    const badgeEl = document.getElementById('mpHostResponseBadge');

    const activeParticipants = (this.playersList || []).filter(p => !this.isHostPlayer(p));
    const total = activeParticipants.length;
    let answeredCount = 0;

    activeParticipants.forEach(p => {
      const pId = p.id || p.user_id || p.playerId;
      const pName = p.playerName || p.display_name || p.name || 'Player';
      const pNameLower = String(pName).toLowerCase().trim();

      const hasAns = (
        p.hasAnswered === true ||
        (this.answeredPlayerSet && (
          (pId && (this.answeredPlayerSet.has(String(pId).trim()) || this.answeredPlayerSet.has(String(pId).toLowerCase().trim()))) ||
          (pName && (this.answeredPlayerSet.has(String(pName).trim()) || this.answeredPlayerSet.has(pNameLower))) ||
          (p.user_id && this.answeredPlayerSet.has(String(p.user_id).trim()))
        )) ||
        localStorage.getItem(`nexus_ans_${this.currentIndex}_${pNameLower}`) === 'true' ||
        (pId && localStorage.getItem(`nexus_ans_${this.currentIndex}_${String(pId).toLowerCase().trim()}`) === 'true')
      );
      if (hasAns) answeredCount++;
    });

    if (countEl) countEl.textContent = `${answeredCount} / ${total} Answered`;
    if (badgeEl) badgeEl.textContent = `${answeredCount} / ${total} Answered`;

    if (listEl) {
      listEl.innerHTML = '';
      if (activeParticipants.length === 0) {
        listEl.innerHTML = '<div style="color:#A5A3C4; padding:12px; text-align:center;">No participants connected</div>';
      } else {
        activeParticipants.forEach(p => {
          const pId = p.id || p.user_id || p.playerId;
          const pName = p.playerName || p.display_name || p.name || 'Player';
          const pNameLower = String(pName).toLowerCase().trim();

          const hasAnswered = (
            p.hasAnswered === true ||
            (this.answeredPlayerSet && (
              (pId && (this.answeredPlayerSet.has(String(pId).trim()) || this.answeredPlayerSet.has(String(pId).toLowerCase().trim()))) ||
              (pName && (this.answeredPlayerSet.has(String(pName).trim()) || this.answeredPlayerSet.has(pNameLower))) ||
              (p.user_id && this.answeredPlayerSet.has(String(p.user_id).trim()))
            )) ||
            localStorage.getItem(`nexus_ans_${this.currentIndex}_${pNameLower}`) === 'true' ||
            (pId && localStorage.getItem(`nexus_ans_${this.currentIndex}_${String(pId).toLowerCase().trim()}`) === 'true')
          );

          const card = document.createElement('div');
          card.className = 'lobby-part-card';
          card.style.background = 'rgba(25, 17, 50, 0.95)';
          card.style.border = hasAnswered ? '1.5px solid rgba(16, 185, 129, 0.5)' : '1.5px solid rgba(139, 92, 246, 0.35)';
          card.style.borderRadius = '16px';
          card.style.padding = '12px 16px';
          card.style.boxShadow = hasAnswered ? '0 0 16px rgba(16, 185, 129, 0.25)' : '0 4px 16px rgba(0, 0, 0, 0.35)';
          card.style.cursor = 'default';

          const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%232E1065'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23C084FC'>👤</text></svg>";
          const pPhoto = p.photoUrl || p.photo || defaultAvatar;

          const ptsText = (p.score !== undefined && p.score > 0) ? ` (+${p.score} pts)` : '';
          const statusBadge = hasAnswered 
            ? `<span style="color:#6EE7B7; background:rgba(16, 185, 129, 0.25); border:1.5px solid #10B981; padding:6px 14px; border-radius:20px; font-size:0.82rem; font-weight:800;">🟢 Answered${ptsText}</span>`
            : '<span style="color:#E9D5FF; background:rgba(124, 58, 237, 0.25); border:1px solid rgba(168, 85, 247, 0.4); padding:6px 14px; border-radius:20px; font-size:0.8rem; font-weight:700;">⏳ Thinking...</span>';

          card.innerHTML = `
            <div class="part-info-left" style="justify-content:space-between; width:100%; align-items:center;">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${pPhoto}" class="part-avatar" 
                     style="width:40px; height:40px; border-radius:50%; border:2px solid ${hasAnswered ? '#10B981' : '#A855F7'}; object-fit:cover;" 
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
        const answeredList = await DB.getAnsweredPlayersForQuestion(this.currentGame.id, this.currentIndex, q.id);
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

    const rawAns = String(q.correct_answer || q.correctAnswer || q.answer || q.rawAnswer || '').trim();
    let displayAnswer = rawAns;
    const keyUpper = rawAns.toUpperCase();

    if (['A', 'B', 'C', 'D'].includes(keyUpper)) {
      const optText = q['choice_' + keyUpper.toLowerCase()] || q['option_' + keyUpper.toLowerCase()] || q['choice' + keyUpper] || q['option' + keyUpper];
      displayAnswer = optText ? `${keyUpper}: ${optText}` : keyUpper;
    }

    if (banner && bannerText) {
      bannerText.textContent = `💡 Correct Answer: ${displayAnswer}`;
      banner.classList.remove('hidden');
    }

    // Highlight ONLY the single correct option card in dark sci-fi neon emerald theme
    const overviewEl = document.getElementById('mpHostAnswersOverview');
    if (overviewEl) {
      const cards = overviewEl.querySelectorAll('.answer-option-btn');
      
      // Reset all cards first
      cards.forEach(card => {
        card.classList.remove('correct-choice', 'selected-choice', 'wrong-choice');
        card.style.opacity = '0.55';
      });

      let correctKey = '';
      if (rawAns) {
        const u = rawAns.toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(u)) {
          correctKey = u;
        } else if (u === 'TRUE') {
          correctKey = 'A';
        } else if (u === 'FALSE') {
          correctKey = 'B';
        } else {
          ['a', 'b', 'c', 'd'].forEach(k => {
            const optVal = q['choice_' + k] || q['option_' + k] || q['choice' + k.toUpperCase()] || q['option' + k.toUpperCase()];
            if (optVal && String(optVal).trim().toLowerCase() === rawAns.toLowerCase()) {
              correctKey = k.toUpperCase();
            }
          });
        }
      }

      cards.forEach(card => {
        const letterEl = card.querySelector('.badge-letter');
        const cardTextEl = card.querySelector('.option-text');

        const letterStr = letterEl ? letterEl.textContent.trim().toUpperCase() : '';
        const textStr = cardTextEl ? cardTextEl.textContent.trim() : '';

        let isTarget = false;
        if (correctKey && letterStr === correctKey) {
          isTarget = true;
        } else if (rawAns && textStr && textStr.toLowerCase() === rawAns.toLowerCase()) {
          isTarget = true;
        }

        if (isTarget) {
          card.classList.add('correct-choice');
          card.style.opacity = '1';
        }
      });
    }
  },

  hostLockAnswers() {
    this.sendBroadcast('QUESTION_LOCK', { questionNumber: this.currentIndex + 1 });
  },

  async hostShowResults() {
    if (!this.currentGame) return;
    await DB.updateMultiplayerGameStatus(this.currentGame.id, 'show_results');
    const leaderboard = await DB.getGameLeaderboard(this.currentGame.id, this.currentGame.room_code);
    this.sendBroadcast('SHOW_RESULTS', { questionNumber: this.currentIndex + 1, leaderboard });
    if (typeof RealtimeRelay !== 'undefined' && RealtimeRelay.sendAnswerReveal) {
      RealtimeRelay.sendAnswerReveal(this.currentIndex, null, { leaderboard });
    }
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

      let totalQ = this.questionsList ? this.questionsList.length : 10;
      const participantStandings = (finalLeaderboard || []).filter(p => {
        if (p.is_host || p.isHost) return false;
        if (this.currentGame && this.currentGame.host_id && (p.user_id === this.currentGame.host_id || p.id === this.currentGame.host_id)) return false;
        return true;
      });

      participantStandings.forEach(p => {
        const c = Number(p.correct_answers || p.correct || 0);
        if (c > totalQ) totalQ = c;
      });

      const analyticsData = {
        gameId: this.currentGame ? this.currentGame.id : 'game_' + Date.now(),
        roomCode: this.currentGame ? (this.currentGame.room_code || this.currentGame.access_code) : '000000',
        title: this.currentGame ? (this.currentGame.title || 'Science Host Quiz') : 'Science Host Quiz',
        totalQuestions: totalQ,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        participants: participantStandings.map(p => {
          let rawCorrect = Number(p.correct_answers || p.correct || 0);
          const correct = Math.min(totalQ, Math.max(0, rawCorrect));
          const points = Number(p.score || p.points || 0);
          const rawPct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
          const pct = Math.min(100, Math.max(0, rawPct));
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

    let totalQ = (this.questionsList && this.questionsList.length > 0) ? this.questionsList.length : 10;
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

        if (correct > totalQ) totalQ = correct;

        mergedMap.set(key, {
          name: name,
          points: score,
          correct: correct,
          totalQuestions: totalQ
        });
      });
    }

    const participantsList = Array.from(mergedMap.values()).map(p => {
      let rawCorrect = Number(p.correct || 0);
      const correct = Math.min(totalQ, Math.max(0, rawCorrect));
      const points = Number(p.points || 0);
      const rawPct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
      const pct = Math.min(100, Math.max(0, rawPct));
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
      if (data && data.questionsList && Array.isArray(data.questionsList) && data.questionsList.length > 0) {
        this.questionsList = data.questionsList;
      }
      if (data && (data.customQuestion || data.question)) {
        if (!this.questionsList) this.questionsList = [];
        this.questionsList[0] = { ...(this.questionsList[0] || {}), ...(data.customQuestion || data.question) };
      }
      App.showScreen('mpPlayerGameScreen');
      const qIndex = (data && data.currentIndex !== undefined) ? data.currentIndex : ((data && data.questionNumber) ? (data.questionNumber - 1) : 0);
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
    const cleanName = playerName || display_name || 'Player';
    const keys = [playerId, user_id, cleanName, cleanName.toLowerCase(), String(cleanName).trim().toLowerCase()].filter(Boolean);
    keys.forEach(k => {
      this.answeredPlayerSet.add(String(k).trim());
      this.answeredPlayerSet.add(String(k).trim().toLowerCase());
    });

    if (!this.playersList) this.playersList = [];

    let p = this.playersList.find(item => 
      (playerId && (item.id === playerId || item.user_id === playerId)) ||
      (cleanName && (
        item.playerName === cleanName || 
        item.name === cleanName || 
        item.display_name === cleanName ||
        (item.display_name && item.display_name.toLowerCase() === cleanName.toLowerCase()) ||
        (item.playerName && item.playerName.toLowerCase() === cleanName.toLowerCase())
      ))
    );

    if (!p) {
      p = {
        id: playerId || user_id || ('p_' + cleanName),
        user_id: playerId || user_id,
        playerName: cleanName,
        display_name: cleanName,
        score: 0,
        correct_answers: 0,
        wrong_answers: 0,
        role: 'player'
      };
      this.playersList.push(p);
    }

    if (p) {
      p.hasAnswered = true;
      if (totalScore !== undefined && totalScore !== null) {
        p.score = Math.max(p.score || 0, totalScore);
      } else if (pointsEarned !== undefined) {
        p.score = (p.score || 0) + pointsEarned;
      }
      
      const totalQ = (this.questionsList && this.questionsList.length > 0) ? this.questionsList.length : 1;
      const qIdx = data.questionIndex !== undefined ? data.questionIndex : (this.currentIndex || 0);

      if (!p.answeredQuestions) p.answeredQuestions = new Set();
      if (!p.answeredQuestions.has(qIdx)) {
        p.answeredQuestions.add(qIdx);
        if (isCorrect) {
          p.correct_answers = Math.min(totalQ, (p.correct_answers || 0) + 1);
        } else {
          p.wrong_answers = (p.wrong_answers || 0) + 1;
        }
      } else {
        // Already recorded this question, clamp correct_answers
        p.correct_answers = Math.min(totalQ, Math.max(0, p.correct_answers || 0));
      }
      p.lastPointsEarned = pointsEarned || 0;
      p.lastAnswerCorrect = !!isCorrect;
    }

    // Immediately update Host UI
    this.refreshHostPlayerAnswerStatuses();
    this.saveCurrentHostAnalytics();

    // Check if ALL active participants have answered
    const activeParticipants = (this.playersList || []).filter(item => !this.isHostPlayer(item));
    const allAnswered = activeParticipants.length > 0 && activeParticipants.every(item => {
      const pId = item.id || item.user_id;
      const pN = item.playerName || item.display_name || item.name || '';
      return this.answeredPlayerSet.has(String(pId).trim()) || 
             this.answeredPlayerSet.has(String(pId).toLowerCase().trim()) || 
             this.answeredPlayerSet.has(String(pN).trim()) || 
             this.answeredPlayerSet.has(String(pN).toLowerCase().trim());
    });

    if (allAnswered) {
      console.log('🎉 All players answered! Automatically updating Host UI...');
      const countEl = document.getElementById('mpHostAnswerCount');
      if (countEl) {
        countEl.innerHTML = `<span style="color:#34D399;">${activeParticipants.length} / ${activeParticipants.length} Answered (All In! 🚀)</span>`;
      }
      const nextBtn = document.getElementById('mpHostNextQBtn');
      if (nextBtn) {
        nextBtn.style.animation = 'pulse 1s infinite';
        nextBtn.style.boxShadow = '0 0 25px rgba(168, 85, 247, 0.9)';
      }
      // Reveal correct answer on teacher host screen
      this.hostShowAnswer();
    }
  },

  onQuestionStart(data) {
    if (this.isHost || !data) return;
    const qIndex = (data.currentIndex !== undefined) ? data.currentIndex : ((data.questionNumber || 1) - 1);

    // If player has already answered this question or is already on it, NEVER repeat or re-render!
    if (this.hasAnsweredCurrent && qIndex <= this.currentIndex) {
      console.log(`🛡️ Participant already answered question ${qIndex + 1}. Ignoring duplicate start.`);
      return;
    }

    App.showScreen('mpPlayerGameScreen');
    const qKey = `q_${qIndex}`;

    if (data.questionsList && Array.isArray(data.questionsList) && data.questionsList.length > 0) {
      this.questionsList = data.questionsList;
    }
    if (data.question) {
      if (!this.questionsList) this.questionsList = [];
      this.questionsList[qIndex] = {
        ...(this.questionsList[qIndex] || {}),
        ...data.question
      };
    }
    if (data.customQuestion) {
      if (!this.questionsList) this.questionsList = [];
      this.questionsList[qIndex] = {
        ...(this.questionsList[qIndex] || {}),
        ...data.customQuestion
      };
    }

    if (qKey !== this.lastRenderedQuestionKey || !this.questionsList || !this.questionsList[qIndex]) {
      this.lastRenderedQuestionKey = qKey;
      this.currentIndex = qIndex;
      this.hasAnsweredCurrent = false;
      this.playerRenderQuestion(qIndex, {
        question_start_time: data.startedAt || new Date().toISOString(),
        serverTime: data.serverTime || Date.now(),
        duration: data.duration || (data.timeLimit || 20),
        questionTypeId: data.questionTypeId || (data.customQuestion && data.customQuestion.question_type_id)
      });
    }
  },

  onNextQuestion(data) {
    if (this.isHost || !data) return;
    const qIndex = (data.currentIndex !== undefined) ? data.currentIndex : ((data.questionNumber || 1) - 1);
    // Only advance when the Host moves to a strictly newer question index!
    if (qIndex > this.currentIndex) {
      this.currentIndex = qIndex;
      this.hasAnsweredCurrent = false;
      this.onQuestionStart(data);
    }
  },

  async playerRenderQuestion(index, gameObj) {
    App.showScreen('mpPlayerGameScreen');
    this.currentIndex = index;
    this.hasAnsweredCurrent = false;

    if ((!this.questionsList || this.questionsList.length === 0 || !this.questionsList[index]) && this.currentGame) {
      try {
        this.questionsList = await DB.getMultiplayerQuestions(this.currentGame.id, this.currentGame.room_code);
      } catch (_) {}
    }
    if (!this.questionsList || this.questionsList.length === 0) {
      if (typeof window !== 'undefined' && window.OFFLINE_QUESTIONS_BANK && window.OFFLINE_QUESTIONS_BANK.length > 0) {
        this.questionsList = DB._formatQuestions(window.OFFLINE_QUESTIONS_BANK.slice(0, 10));
      }
    }

    const q = (this.questionsList && this.questionsList[index]) || (gameObj && (gameObj.customQuestion || gameObj.question)) || {};

    const banner = document.getElementById('mpPlayerFeedbackBanner');
    if (banner) banner.className = 'feedback-banner hidden';

    const totalQCount = (this.questionsList && this.questionsList.length) ? this.questionsList.length : (gameObj && gameObj.questionsList ? gameObj.questionsList.length : 10);
    const counterEl = document.getElementById('mpPlayerQCounter');
    if (counterEl) counterEl.textContent = `Question ${index + 1} of ${totalQCount}`;

    const textEl = document.getElementById('mpPlayerQuestionText');
    if (textEl) textEl.textContent = q.question || 'Science Question';

    const playerImgBox = document.getElementById('mpPlayerQuestionImageContainer');
    const playerImgEl = document.getElementById('mpPlayerQuestionImageEl');
    const playerImgSrc = q.imageUrl || q.image_url || q.image || q.photoUrl || q.photo_url || q.photo || (gameObj && (gameObj.imageUrl || gameObj.image_url || gameObj.image)) || null;

    if (playerImgBox && playerImgEl) {
      if (playerImgSrc && typeof playerImgSrc === 'string' && playerImgSrc.trim().length > 10 && !playerImgSrc.includes('fakepath')) {
        playerImgEl.onload = () => {
          playerImgEl.style.display = 'inline-block';
          playerImgBox.classList.remove('hidden');
          playerImgBox.style.display = 'block';
        };
        playerImgEl.onerror = () => {
          playerImgEl.style.display = 'none';
          playerImgBox.classList.add('hidden');
          playerImgBox.style.display = 'none';
        };
        playerImgEl.src = playerImgSrc;
      } else {
        playerImgEl.src = '';
        playerImgEl.style.display = 'none';
        playerImgBox.classList.add('hidden');
        playerImgBox.style.display = 'none';
      }
    }

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
      // 1. Immediately lock choices so joiner cannot press or submit an answer
      this.disablePlayerChoices();

      const banner = document.getElementById('mpPlayerFeedbackBanner');
      const statusText = document.getElementById('mpPlayerFeedbackText');
      const subText = document.getElementById('mpPlayerFeedbackSub');

      // 2. If joiner has not answered yet, automatically record a 0 score
      if (!this.hasAnsweredCurrent) {
        this.hasAnsweredCurrent = true;

        const myProfile = (typeof DB !== 'undefined' && DB.getStudentProfile) ? (DB.getStudentProfile() || {}) : {};
        const myName = this.currentPlayerNickname || 
                       (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nexus_current_player_name')) || 
                       (typeof localStorage !== 'undefined' && localStorage.getItem('nexus_current_player_name')) || 
                       myProfile.name || 
                       'Player';
        const myId = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nexus_current_player_id')) || 
                     (typeof DB !== 'undefined' ? DB.getUserUUID() : ('u_' + Date.now()));

        try {
          localStorage.setItem(`nexus_ans_${this.currentIndex}_${myName.toLowerCase().trim()}`, 'true');
        } catch (_) {}

        if (banner && statusText) {
          banner.className = 'feedback-banner';
          banner.classList.remove('hidden');
          statusText.textContent = "⏰ Time's Up!";
          if (subText) {
            subText.textContent = 'No answer submitted • 0 points (Waiting for host...)';
          }
        }
        if (typeof App !== 'undefined' && App.playWrongSound) {
          App.playWrongSound();
        }

        // Send 0-point timeout answer to Host over RealtimeRelay and Broadcast
        this.sendBroadcast('PLAYER_ANSWERED', {
          playerId: myId,
          user_id: myId,
          playerName: myName,
          display_name: myName,
          choice: 'TIME_OUT',
          isCorrect: false,
          pointsEarned: 0,
          totalScore: this.playerScore || 0,
          questionIndex: this.currentIndex
        });

        if (typeof RealtimeRelay !== 'undefined' && RealtimeRelay.sendPlayerAnswer) {
          RealtimeRelay.sendPlayerAnswer(myId, myName, 'TIME_OUT', false, 0, this.playerScore || 0);
        }

        // Record in DB if possible
        if (typeof DB !== 'undefined' && DB.submitPlayerAnswer && this.currentGame && q) {
          try {
            DB.submitPlayerAnswer(
              this.currentGame.id,
              myId,
              q.id || `q_${this.currentIndex}`,
              'TIME_OUT',
              this.questionDurationSec || 20
            );
          } catch (_) {}
        }
      }
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
    const myName = this.currentPlayerNickname || 
                   (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nexus_current_player_name')) || 
                   (typeof localStorage !== 'undefined' && localStorage.getItem('nexus_current_player_name')) || 
                   myProfile.name || 
                   'Player';
    const myId = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nexus_current_player_id')) || DB.getUserUUID();

    try {
      localStorage.setItem(`nexus_ans_${this.currentIndex}_${myName.toLowerCase().trim()}`, 'true');
    } catch (_) {}

    const elapsedSec = this.questionStartedAt ? Math.max(0.1, (Date.now() - new Date(this.questionStartedAt).getTime()) / 1000) : 1;

    // Evaluate answer against current question
    let currentQ = (this.questionsList && this.questionsList[this.currentIndex]) || null;
    let isCorrect = false;
    if (currentQ) {
      isCorrect = DB.evaluateAnswerCorrectness(currentQ, selectedChoice);
    }
    const qDuration = (currentQ && currentQ.time_limit) ? currentQ.time_limit : 20;
    const timeRatio = Math.max(0.2, 1 - (elapsedSec / qDuration));
    const pointsEarned = isCorrect ? Math.round(1000 * timeRatio) : 0;

    // Send immediate response over Relay & Broadcast
    this.sendBroadcast('PLAYER_ANSWERED', {
      playerId: myId,
      user_id: myId,
      playerName: myName,
      display_name: myName,
      pointsEarned: pointsEarned,
      totalScore: pointsEarned,
      isCorrect: isCorrect
    });

    if (typeof RealtimeRelay !== 'undefined' && RealtimeRelay.sendPlayerAnswer) {
      RealtimeRelay.sendPlayerAnswer(myId, myName, selectedChoice, isCorrect, pointsEarned, pointsEarned);
    }

    const banner = document.getElementById('mpPlayerFeedbackBanner');
    const statusText = document.getElementById('mpPlayerFeedbackText');
    const subText = document.getElementById('mpPlayerFeedbackSub');

    if (banner && statusText && subText) {
      banner.className = 'feedback-banner';
      if (isCorrect) {
        statusText.textContent = '✅ Correct Answer!';
        subText.textContent = `+${pointsEarned} points earned!`;
        if (typeof App !== 'undefined' && App.playCorrectSound) App.playCorrectSound();
      } else {
        statusText.textContent = '❌ Incorrect Answer';
        subText.textContent = '+0 points';
        if (typeof App !== 'undefined' && App.playWrongSound) App.playWrongSound();
      }
    }

    try {
      await DB.submitPlayerAnswer(
        this.currentGame ? this.currentGame.id : null,
        myId,
        questionId,
        selectedChoice,
        elapsedSec
      );
    } catch (e) {
      console.warn('DB.submitPlayerAnswer non-blocking warning:', e);
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
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.hasAnsweredCurrent = true;
      this.disablePlayerChoices();
      this.renderLeaderboardScreen('Question Results 📊', data ? (data.leaderboard || []) : []);
    }
  },

  onGameFinish(data) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.renderLeaderboardScreen('🏆 Final Podium Leaderboard', data ? (data.finalLeaderboard || []) : []);
  },

  // 10. Synchronized Timer (Calculated locally from question_started_at + duration - now)
  startSynchronizedTimer(timerElementId, startedAtIso, durationSec, onExpire) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    // AI Bots simulation for solo practice match
    if (this.isBotMatch && this.currentGame) {
      const currentPin = this.currentGame.room_code;
      const qIndex = this.currentIndex || 0;
      ['bot_sakshi', 'bot_raflu', 'bot_palizya'].forEach((botId, idx) => {
        const delay = (idx + 1) * 2500 + Math.random() * 2000;
        setTimeout(() => {
          if (!this.currentGame || this.currentGame.room_code !== currentPin) return;
          const isCorrect = Math.random() > 0.25;
          const scoreEarned = isCorrect ? Math.round(700 + Math.random() * 250) : 0;
          const local = DB.getLocalLobbyState(currentPin);
          if (local && local.participants) {
            const b = local.participants.find(p => p.id === botId || p.user_id === botId);
            if (b) {
              b.score = (b.score || 0) + scoreEarned;
              if (isCorrect) b.correct_answers = (b.correct_answers || 0) + 1;
              else b.wrong_answers = (b.wrong_answers || 0) + 1;
              b.current_question_index = qIndex + 1;
              DB.saveLocalLobbyState(currentPin, local);
            }
          }
        }, delay);
      });
    }

    const now = Date.now();
    let startTime = startedAtIso ? new Date(startedAtIso).getTime() : now;
    const durationMs = (durationSec || 20) * 1000;

    // Safety guard against cross-device clock skew (e.g. phone clock vs host clock mismatch):
    // If startTime is invalid, in future, or would result in <=0 remaining time on init,
    // fallback to current local time so the user gets a working countdown and enabled choices.
    if (isNaN(startTime) || startTime > now + 1000 || (now - startTime) >= durationMs) {
      startTime = now;
    }

    let lastSecInt = -1;
    const updateTimer = () => {
      const currentNow = Date.now();
      const elapsedMs = currentNow - startTime;
      let remainingMs = Math.max(0, durationMs - elapsedMs);

      const secInt = Math.ceil(remainingMs / 1000);
      if (remainingMs > 0 && secInt !== lastSecInt) {
        lastSecInt = secInt;
        if (typeof App !== 'undefined' && App.playTickSound) {
          App.playTickSound();
        }
      }

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

  renderLeaderboardScreen(title, standings) {
    App.showScreen('mpLeaderboardScreen');
    const titleEl = document.getElementById('mpLeaderboardTitle');
    const rosterEl = document.getElementById('mpLeaderboardRoster');
    if (titleEl) titleEl.textContent = title;

    let list = standings || [];
    const mergedStandingsMap = new Map();

    const addStandingItem = (item) => {
      if (!item) return;
      const hostId = (this.currentGame && this.currentGame.host_id) ? this.currentGame.host_id : null;
      const isHost = item.is_host === true || item.isHost === true || (hostId && (item.user_id === hostId || item.id === hostId)) || (item.display_name === 'Host' || item.name === 'Host');
      if (isHost) return;

      const name = item.display_name || item.playerName || item.name || 'Participant';
      const score = Number(item.score || item.points || 0);
      const correct = Number(item.correct_answers || item.correct || 0);

      let existingKey = null;
      for (const [key, existing] of mergedStandingsMap.entries()) {
        if ((item.user_id && existing.user_id === item.user_id) || (item.id && existing.id === item.id) || (name && existing.display_name.trim().toLowerCase() === name.trim().toLowerCase())) {
          existingKey = key;
          break;
        }
      }

      if (existingKey) {
        const existing = mergedStandingsMap.get(existingKey);
        existing.score = Math.max(existing.score, score);
        existing.correct_answers = Math.max(existing.correct_answers, correct);
      } else {
        const key = item.user_id || item.id || name.trim().toLowerCase();
        mergedStandingsMap.set(key, {
          id: key,
          user_id: item.user_id || key,
          display_name: name,
          playerName: name,
          photo_url: item.photo_url || item.photoUrl || item.photo || null,
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

    if (!this.isHost && mergedStandingsMap.size === 0) {
      const myProfile = DB.getStudentProfile() || {};
      const myName = myProfile.name || 'Participant';
      const myId = DB.getUserUUID();
      addStandingItem({
        id: myId,
        user_id: myId,
        display_name: myName,
        score: this.playerScore || 0,
        correct_answers: this.playerCorrectCount || 0,
        is_host: false
      });
    }

    const participantStandings = Array.from(mergedStandingsMap.values());
    participantStandings.sort((a, b) => (b.score || 0) - (a.score || 0));

    const myUuid = DB.getUserUUID();
    const myProfile = DB.getStudentProfile() || {};
    const myName = (myProfile.name || '').trim().toLowerCase();

    if (rosterEl) {
      rosterEl.innerHTML = '';
      if (participantStandings.length === 0) {
        rosterEl.innerHTML = '<div style="color:#94A3B8; text-align:center; padding:16px;">No participant scores recorded.</div>';
      } else {
        participantStandings.forEach((p, idx) => {
          const card = document.createElement('div');
          card.className = 'lobby-part-card';

          const isMe = (!this.isHost) && (
            (p.user_id && p.user_id === myUuid) ||
            (p.id && p.id === myUuid) ||
            (myName && p.display_name && p.display_name.trim().toLowerCase() === myName)
          );

          card.style.background = isMe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(25, 17, 50, 0.95)';
          card.style.border = isMe ? '2px solid #10B981' : '1.5px solid rgba(139, 92, 246, 0.35)';
          card.style.borderRadius = '20px';
          card.style.padding = '16px 20px';
          card.style.marginBottom = '12px';
          card.style.display = 'flex';
          card.style.alignItems = 'center';
          card.style.justifyContent = 'space-between';
          if (isMe) card.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';

          if (isMe && (title.includes('Final') || title.includes('Podium'))) {
            if (typeof Achievements !== 'undefined' && Achievements.recordLiveQuizEvent) {
              Achievements.recordLiveQuizEvent('complete');
              if (idx === 0) {
                Achievements.recordLiveQuizEvent('win');
              }
            }
          }

          const medals = ['🥇', '🥈', '🥉'];
          const rankTag = idx < 3 ? medals[idx] : `#${idx + 1}`;
          const displayName = p.display_name || p.name || p.playerName || 'Participant';
          const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%232E1065'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23C084FC'>👤</text></svg>";
          const pPhoto = p.photo_url || p.photoUrl || p.photo || defaultAvatar;

          card.innerHTML = `
            <div class="part-info-left" style="justify-content:space-between; width:100%; align-items:center;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.6rem; display:flex; align-items:center; justify-content:center; min-width:32px;">${rankTag}</span>
                <img src="${pPhoto}" class="part-avatar" style="width:42px; height:42px; border-radius:50%; border:2px solid ${isMe ? '#10B981' : '#A855F7'}; object-fit:cover;" alt="${displayName}">
                <div style="text-align:left;">
                  <h5 style="margin:0; font-size:1.05rem; color:#FFFFFF; font-weight:800; font-family:var(--font-heading);">${displayName} ${isMe ? '<span style="font-size:0.75rem; color:#10B981; background:rgba(16,185,129,0.2); padding:2px 8px; border-radius:10px; margin-left:6px;">(YOU)</span>' : ''}</h5>
                  <span style="font-size:0.82rem; color:#A5A3C4; font-weight:500;">Correct Answers: ${p.correct_answers || 0}</span>
                </div>
              </div>
              <div style="text-align:right;">
                <span style="font-weight:900; color:#34D399; font-size:1.35rem; font-family:var(--font-heading);">${(p.score || 0).toLocaleString()} pts</span>
              </div>
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
    if (typeof RealtimeRelay !== 'undefined' && RealtimeRelay.disconnect) {
      try { RealtimeRelay.disconnect(); } catch(e) {}
    }
    if (this.localBroadcastChannel) {
      try { this.localBroadcastChannel.close(); } catch(e) {}
      this.localBroadcastChannel = null;
    }
    if (this.realtimeChannel && typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        this.realtimeChannel.untrack();
        supabaseClient.removeChannel(this.realtimeChannel);
      } catch (e) {}
      this.realtimeChannel = null;
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
          <button id="mpKickPlayerBtn"
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

    const kickBtn = document.getElementById('mpKickPlayerBtn');
    if (kickBtn) {
      kickBtn.onclick = () => this.kickPlayerFromLobby(pId, cleanName);
    }

    // Async fetch photo from Supabase profiles / multiplayer_players if missing
    if ((!imgSrc || imgSrc === defaultAvatar) && typeof DB !== 'undefined' && DB.canQuerySupabase && DB.canQuerySupabase() && typeof supabaseClient !== 'undefined' && supabaseClient) {
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
    if (e.key && (e.key.startsWith('nexus_mp_sync_trigger_') || e.key.startsWith('nexus_mp_join_trigger_') || e.key.startsWith('nexus_mp_answer_trigger_') || e.key.startsWith('nexus_ans_') || e.key.startsWith('nexus_lobby_'))) {
      if (typeof Multiplayer !== 'undefined' && Multiplayer.isHost && Multiplayer.currentGame) {
        if (e.key.startsWith('nexus_mp_join_trigger_')) {
          Multiplayer.syncHostRoster();
        }
        if ((e.key.startsWith('nexus_mp_answer_trigger_') || e.key.startsWith('nexus_ans_')) && e.newValue) {
          try {
            if (e.key.startsWith('nexus_mp_answer_trigger_')) {
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
              }
            }
            Multiplayer.refreshHostPlayerAnswerStatuses();
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
                  if (data.correct_answers !== undefined) {
                    p.correct_answers = Math.max(p.correct_answers || 0, Number(data.correct_answers || 0));
                  } else if (data.correct) {
                    p.correct_answers = Math.max(p.correct_answers || 0, Number(data.correct || 0));
                  }
                  if (data.wrong_answers !== undefined) {
                    p.wrong_answers = Math.max(p.wrong_answers || 0, Number(data.wrong_answers || 0));
                  }
                }
              }
            }
          } catch (_) {}
        }
        Multiplayer.refreshHostPlayerAnswerStatuses();
        Multiplayer.syncHostRoster();
      }
    }
  });
}


// Explicitly attach to window for global access
if (typeof window !== 'undefined') {
  window.Multiplayer = Multiplayer;
}
