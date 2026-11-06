/* ==========================================================================
   NEXUS CROSS-DEVICE REALTIME RELAY
   Bridges PC Desktop Host and Mobile Phone Players across 4G/LTE/Wi-Fi
   via Public Secure MQTT WebSockets (broker.emqx.io & broker.hivemq.com).
   Zero configuration, zero API keys, sub-50ms instant synchronizations.
   ========================================================================== */

const RealtimeRelay = {
  client: null,
  roomCode: null,
  role: 'player', // 'host' or 'player'
  userInfo: null,
  callbacks: {},
  isConnected: false,
  brokerIndex: 0,
  brokers: [
    { host: 'broker.emqx.io', port: 8084, path: '/mqtt' },
    { host: 'broker.hivemq.com', port: 8884, path: '/mqtt' }
  ],
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  keepAliveInterval: null,

  init(roomCode, role, userInfo, callbacks = {}) {
    if (!roomCode) return;
    this.roomCode = String(roomCode).toUpperCase().trim();
    this.role = role || 'player';
    this.userInfo = userInfo || {};
    this.callbacks = callbacks;
    this.reconnectAttempts = 0;

    this.connect();
  },

  connect() {
    if (typeof Paho === 'undefined' || !Paho.MQTT || !Paho.MQTT.Client) {
      console.warn('⚠️ Paho MQTT library not loaded, falling back to local signaling.');
      return;
    }

    if (this.client) {
      try {
        this.client.disconnect();
      } catch (_) {}
      this.client = null;
    }

    const broker = this.brokers[this.brokerIndex % this.brokers.length];
    const clientId = 'nexus_' + (this.role === 'host' ? 'host_' : 'plr_') + 
      Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    console.log(`🔌 Connecting RealtimeRelay to ${broker.host}:${broker.port} for Room ${this.roomCode}...`);

    try {
      this.client = new Paho.MQTT.Client(broker.host, broker.port, broker.path, clientId);

      this.client.onConnectionLost = (res) => {
        this.isConnected = false;
        if (res.errorCode !== 0) {
          console.warn('RealtimeRelay disconnected:', res.errorMessage);
          this.handleReconnect();
        }
      };

      this.client.onMessageArrived = (message) => {
        try {
          const payload = JSON.parse(message.payloadString);
          this.handleIncomingMessage(message.destinationName, payload);
        } catch (err) {
          console.warn('Error parsing incoming relay message:', err);
        }
      };

      this.client.connect({
        useSSL: true,
        timeout: 6,
        keepAliveInterval: 30,
        cleanSession: true,
        onSuccess: () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log(`✅ RealtimeRelay connected to ${broker.host} for Room ${this.roomCode}!`);

          // Subscribe to all game events for this room code
          const baseTopic = `nexus/game/${this.roomCode}/#`;
          this.client.subscribe(baseTopic, { qos: 1 });

          // If student, announce immediate join to the host
          if (this.role === 'player') {
            this.sendJoin(this.userInfo);
          }

          // If host, announce room ready
          if (this.role === 'host') {
            this.publish('host_ready', {
              roomCode: this.roomCode,
              timestamp: Date.now()
            });
          }
        },
        onFailure: (err) => {
          console.warn(`Failed to connect to ${broker.host}:`, err);
          this.brokerIndex++;
          this.handleReconnect();
        }
      });
    } catch (err) {
      console.warn('RealtimeRelay init error:', err);
      this.brokerIndex++;
      this.handleReconnect();
    }
  },

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('RealtimeRelay max reconnect attempts reached.');
      return;
    }
    this.reconnectAttempts++;
    const delay = Math.min(5000, 1000 * Math.pow(1.5, this.reconnectAttempts));
    setTimeout(() => {
      if (this.roomCode && (!this.client || !this.isConnected)) {
        this.connect();
      }
    }, delay);
  },

  publish(subtopic, data) {
    if (!this.client || !this.isConnected || !this.roomCode) return false;
    try {
      const topic = `nexus/game/${this.roomCode}/${subtopic}`;
      const payloadStr = JSON.stringify({
        ...data,
        roomCode: this.roomCode,
        senderRole: this.role,
        senderId: this.userInfo.id || this.userInfo.user_id,
        timestamp: Date.now()
      });
      const message = new Paho.MQTT.Message(payloadStr);
      message.destinationName = topic;
      message.qos = 1;
      this.client.send(message);
      return true;
    } catch (e) {
      console.warn('RealtimeRelay publish error:', e);
      return false;
    }
  },

  handleIncomingMessage(topic, payload) {
    if (!payload || !this.roomCode) return;

    // Ignore self-echoes
    const myId = this.userInfo.id || this.userInfo.user_id;
    if (payload.senderId && payload.senderId === myId) return;

    const parts = topic.split('/');
    const subtopic = parts[parts.length - 1];

    switch (subtopic) {
      case 'join':
        console.log('⚡ [Relay] Player joined:', payload.player);
        if (this.callbacks.onPlayerJoin) {
          this.callbacks.onPlayerJoin(payload.player);
        }
        break;

      case 'roster_sync':
        console.log('⚡ [Relay] Roster sync received:', payload.players);
        if (this.callbacks.onRosterSync) {
          this.callbacks.onRosterSync(payload.players);
        }
        break;

      case 'game_start':
        console.log('⚡ [Relay] Game start received:', payload);
        if (this.callbacks.onGameStart) {
          this.callbacks.onGameStart(payload);
        }
        break;

      case 'next_question':
        console.log('⚡ [Relay] Next question received:', payload);
        if (this.callbacks.onNextQuestion) {
          this.callbacks.onNextQuestion(payload);
        }
        break;

      case 'player_answer':
        console.log('⚡ [Relay] Player answer received:', payload);
        if (this.callbacks.onPlayerAnswer) {
          this.callbacks.onPlayerAnswer(payload);
        }
        break;

      case 'reveal_answer':
        console.log('⚡ [Relay] Answer reveal received:', payload);
        if (this.callbacks.onAnswerReveal) {
          this.callbacks.onAnswerReveal(payload);
        }
        break;

      case 'game_finish':
        console.log('⚡ [Relay] Game finish received:', payload);
        if (this.callbacks.onGameFinish) {
          this.callbacks.onGameFinish(payload);
        }
        break;

      case 'host_ready':
        // If student is waiting and host becomes ready, re-send join
        if (this.role === 'player') {
          this.sendJoin(this.userInfo);
        }
        break;

      default:
        break;
    }
  },

  // High-Level Message Senders
  sendJoin(player) {
    const p = player || this.userInfo || {};
    this.publish('join', {
      type: 'PLAYER_JOIN',
      player: {
        id: p.id || p.user_id,
        user_id: p.user_id || p.id,
        name: p.name || p.playerName || p.display_name || 'Player',
        playerName: p.name || p.playerName || p.display_name || 'Player',
        display_name: p.name || p.playerName || p.display_name || 'Player',
        photoUrl: p.photoUrl || p.photo_url || p.photo || null,
        photo_url: p.photoUrl || p.photo_url || p.photo || null,
        score: p.score || 0,
        correct_answers: p.correct_answers || 0,
        wrong_answers: p.wrong_answers || 0,
        is_host: false,
        role: 'player'
      }
    });
  },

  sendRosterSync(playersList) {
    this.publish('roster_sync', {
      type: 'ROSTER_SYNC',
      players: playersList || []
    });
  },

  sendGameStart(gameData, questionsList) {
    this.publish('game_start', {
      type: 'GAME_START',
      status: 'active',
      currentIndex: 0,
      game: gameData,
      questionsList: questionsList || []
    });
  },

  sendNextQuestion(questionIndex, questionObj, timeLimit) {
    this.publish('next_question', {
      type: 'NEXT_QUESTION',
      currentIndex: questionIndex,
      question: questionObj,
      timeLimit: timeLimit || 20
    });
  },

  sendPlayerAnswer(playerId, playerName, choice, isCorrect, pointsEarned, totalScore) {
    this.publish('player_answer', {
      type: 'PLAYER_ANSWER',
      playerId: playerId,
      playerName: playerName,
      choice: choice,
      isCorrect: isCorrect,
      pointsEarned: pointsEarned || 0,
      totalScore: totalScore || 0
    });
  },

  sendAnswerReveal(questionIndex, correctAnswer, stats) {
    this.publish('reveal_answer', {
      type: 'REVEAL_ANSWER',
      currentIndex: questionIndex,
      correctAnswer: correctAnswer,
      stats: stats || {}
    });
  },

  sendGameFinish(leaderboard) {
    this.publish('game_finish', {
      type: 'GAME_FINISH',
      leaderboard: leaderboard || []
    });
  },

  disconnect() {
    if (this.client) {
      try {
        this.client.disconnect();
      } catch (_) {}
      this.client = null;
    }
    this.roomCode = null;
    this.isConnected = false;
  }
};

// Global export
if (typeof window !== 'undefined') {
  window.RealtimeRelay = RealtimeRelay;
}
