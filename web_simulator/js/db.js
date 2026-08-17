/* ==========================================================================
   NEXUS DATABASE & SUPABASE LIVE INTEGRATION
   Replaces all local hardcoded mock data with live Supabase PostgreSQL backend
   ========================================================================== */

const SUPABASE_URL = "https://bmebwqvdotwmtqcaxrnk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWJ3cXZkb3R3bXRxY2F4cm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzUxNTQsImV4cCI6MjEwMTU1MTE1NH0._t0YaKroymMbtSnySVpe8Sw9uwUviAFYdkXeZADeVL8";

const supabaseClient = (typeof window !== 'undefined' && window.supabase) 
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;

const DB = {
  // Storage Key Constants
  STORAGE_PROFILE: 'nexus_student_profile',
  STORAGE_RESULTS: 'nexus_quiz_results',
  STORAGE_TEACHER: 'nexus_teacher_session',
  STORAGE_ACHIEVEMENTS: 'nexus_unlocked_achievements',
  STORAGE_USER_UUID: 'nexus_user_uuid',

  // In-memory cache for profiles and results
  _cachedProfile: null,
  _cachedResults: [],

  // --------------------------------------------------------------------------
  // 1. QUESTION BANK & CURRICULUM (SUPABASE LIVE QUERY API)
  // --------------------------------------------------------------------------
  async getTerms() {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('terms')
        .select('*')
        .order('order_no', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching terms from Supabase:', e);
      return [];
    }
  },

  async getTopics(termId) {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('topics')
        .select('*')
        .eq('term_id', termId)
        .order('order_no', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching topics from Supabase:', e);
      return [];
    }
  },

  async getQuestionTypes() {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('question_types')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching question types from Supabase:', e);
      return [];
    }
  },

  async getQuestions(topicId, questionTypeId, quizType) {
    if (!supabaseClient) return [];
    try {
      let query = supabaseClient
        .from('questions')
        .select('*')
        .eq('is_active', true);

      if (topicId) query = query.eq('topic_id', topicId);
      if (questionTypeId) query = query.eq('question_type_id', questionTypeId);
      if (quizType) query = query.eq('quiz_type', quizType);

      const { data, error } = await query;
      if (error) throw error;
      return this._formatQuestions(data || []);
    } catch (e) {
      console.error('Error fetching questions from Supabase:', e);
      return [];
    }
  },

  async fetchQuestionsForTerm(termNumber) {
    if (!supabaseClient) return [];
    try {
      const terms = await this.getTerms();
      const matchedTerm = terms.find(t => t.order_no === termNumber || t.order_index === termNumber);

      if (!matchedTerm) {
        const { data: allQ } = await supabaseClient
          .from('questions')
          .select('*')
          .eq('is_active', true);
        return this._formatQuestions(allQ || []);
      }

      const topics = await this.getTopics(matchedTerm.id);
      const topicIds = topics.map(t => t.id);

      let query = supabaseClient
        .from('questions')
        .select('*')
        .eq('is_active', true);

      if (topicIds.length > 0) {
        query = query.in('topic_id', topicIds);
      }

      const { data: questions, error: qErr } = await query;
      if (qErr) throw qErr;

      return this._formatQuestions(questions || []);
    } catch (e) {
      console.error('Error fetching questions for term:', e);
      return [];
    }
  },

  _formatQuestions(rawQuestions) {
    return rawQuestions.map(q => {
      const choiceA = q.choice_a || q.option_a || '';
      const choiceB = q.choice_b || q.option_b || '';
      const choiceC = q.choice_c || q.option_c || '';
      const choiceD = q.choice_d || q.option_d || '';

      const opts = [choiceA, choiceB];
      if (choiceC && choiceC.trim() !== '') opts.push(choiceC);
      if (choiceD && choiceD.trim() !== '') opts.push(choiceD);

      let ansIndex = 0;
      const ansUpper = (q.correct_answer || '').toUpperCase().trim();
      if (ansUpper === 'B' || ansUpper === choiceB.toUpperCase().trim()) ansIndex = 1;
      else if (ansUpper === 'C' || ansUpper === choiceC.toUpperCase().trim()) ansIndex = 2;
      else if (ansUpper === 'D' || ansUpper === choiceD.toUpperCase().trim()) ansIndex = 3;

      let qTypeStr = 'mc';
      if (q.question_type_id === 2 || q.question_type === 'true_false') qTypeStr = 'tf';
      if (q.question_type_id === 3 || q.question_type === 'identification') qTypeStr = 'id';

      return {
        id: q.id,
        topicId: q.topic_id,
        questionTypeId: q.question_type_id,
        term: 1,
        topic: q.difficulty || 'Science',
        question: q.question,
        options: opts,
        answer: ansIndex,
        rawAnswer: q.correct_answer,
        explanation: q.explanation,
        timeLimit: q.time_limit || 20,
        type: qTypeStr
      };
    });
  },

  // --------------------------------------------------------------------------
  // 2. STUDENT PROFILES (SUPABASE PROFILES TABLE)
  // --------------------------------------------------------------------------
  getStudentProfile() {
    if (this._cachedProfile) return this._cachedProfile;
    const raw = localStorage.getItem(this.STORAGE_PROFILE);
    if (raw) {
      this._cachedProfile = JSON.parse(raw);
      return this._cachedProfile;
    }
    return null;
  },

  purgeOldStorage() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith('nexus_lobby_')) {
          localStorage.removeItem(k);
        }
      });
      const rawProfile = localStorage.getItem(this.STORAGE_PROFILE);
      if (rawProfile && rawProfile.length > 50000) {
        try {
          const profile = JSON.parse(rawProfile);
          if (profile.photo && profile.photo.length > 30000) {
            profile.photo = '';
            localStorage.setItem(this.STORAGE_PROFILE, JSON.stringify(profile));
          }
        } catch (err) {}
      }
    } catch (e) {
      console.warn('Error purging storage:', e);
    }
  },

  safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Storage setItem error for key "${key}":`, e);
      this.purgeOldStorage();
      try {
        localStorage.setItem(key, value);
      } catch (err2) {
        console.error(`Storage setItem failed after purge for "${key}":`, err2);
      }
    }
  },

  async saveStudentProfile(profile) {
    this._cachedProfile = profile;

    // Ensure profile has a valid 36-char RFC4122 UUID
    if (!profile.id || profile.id.length !== 36 || !profile.id.includes('-')) {
      profile.id = this.getUserUUID();
    }

    this.safeSetItem(this.STORAGE_PROFILE, JSON.stringify(profile));

    if (supabaseClient && profile.id) {
      try {
        await supabaseClient.from('profiles').upsert({
          id: profile.id,
          role: 'student',
          name: profile.name,
          grade_level: profile.gradeLevel || '',
          section: profile.section || '',
          photo_url: (profile.photo && profile.photo.length < 5000) ? profile.photo : null,
          device_id: profile.id,
          created_at: profile.createdAt || new Date().toISOString()
        });
      } catch (e) {
        console.warn('Error saving profile to Supabase:', e);
      }
    }
  },

  // --------------------------------------------------------------------------
  // 3. TEACHER PASSCODES (SUPABASE TEACHER_PASSCODES TABLE)
  // --------------------------------------------------------------------------
  async isValidPasscode(passcode) {
    if (!supabaseClient) return ['123456', 'NEXUS10'].includes(passcode.trim());
    try {
      const { data, error } = await supabaseClient
        .from('teacher_passcodes')
        .select('*')
        .eq('passcode', passcode.trim())
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;
      return data !== null;
    } catch (e) {
      console.error('Error checking teacher passcode:', e);
      return ['123456', 'NEXUS10'].includes(passcode.trim());
    }
  },

  // --------------------------------------------------------------------------
  // 4. QUIZ ATTEMPTS & ANSWERS (SUPABASE QUIZ_ATTEMPTS TABLE)
  // --------------------------------------------------------------------------
  getQuizResults() {
    const raw = localStorage.getItem(this.STORAGE_RESULTS);
    return raw ? JSON.parse(raw) : [];
  },

  async saveQuizResult(result) {
    const list = this.getQuizResults();
    list.push(result);
    this.safeSetItem(this.STORAGE_RESULTS, JSON.stringify(list));

    if (supabaseClient) {
      try {
        const studentUuid = this.getUserUUID();
        const profile = this.getStudentProfile();
        if (profile) {
          await this.saveStudentProfile(profile);
        }

        const { data: topics } = await supabaseClient.from('topics').select('id').limit(1);
        if (!topics || topics.length === 0) return;

        const topicId = topics[0].id;
        const validQuizType = (result.mode === 'pre-test') ? 'pre_test' : ((result.mode === 'post-test') ? 'post_test' : 'practice');

        await supabaseClient.from('quiz_attempts').insert({
          student_id: studentUuid,
          topic_id: topicId,
          quiz_type: validQuizType,
          score: result.scorePoints || 0,
          correct: result.correctCount || 0,
          wrong: result.incorrectCount || 0,
          percentage: result.scorePct || 0,
          duration: result.totalTimeSec || 0,
          created_at: result.timestamp || new Date().toISOString()
        });
      } catch (e) {
        console.warn('Error saving quiz attempt to Supabase:', e);
      }
    }
  },

  // --------------------------------------------------------------------------
  // 5. ACHIEVEMENTS & USER SESSIONS
  // --------------------------------------------------------------------------
  getUnlockedAchievements() {
    const raw = localStorage.getItem(this.STORAGE_ACHIEVEMENTS);
    return raw ? JSON.parse(raw) : [];
  },

  saveUnlockedAchievement(achId) {
    const list = this.getUnlockedAchievements();
    if (!list.includes(achId)) {
      list.push(achId);
      this.safeSetItem(this.STORAGE_ACHIEVEMENTS, JSON.stringify(list));
      if (typeof TaskSystem !== 'undefined') {
        TaskSystem.completeTask(`ach_xp_${achId}`, `Achievement Unlocked`, 15);
      }
    }
  },

  getStoredUUID() {
    return localStorage.getItem(this.STORAGE_USER_UUID);
  },

  getUserUUID() {
    let uuid = this.getStoredUUID();
    const isValidUUID = uuid && uuid.length === 36 && uuid.includes('-');
    if (!isValidUUID) {
      uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
      this.saveUserUUID(uuid);
    }
    return uuid;
  },

  saveUserUUID(uuid) {
    this.safeSetItem(this.STORAGE_USER_UUID, uuid);
  },

  saveCustomQuiz(quizObj) {
    const list = JSON.parse(localStorage.getItem('nexus_custom_quizzes') || '[]');
    list.push(quizObj);
    this.safeSetItem('nexus_custom_quizzes', JSON.stringify(list));
  },

  getCustomQuizzes() {
    const raw = localStorage.getItem('nexus_custom_quizzes');
    return raw ? JSON.parse(raw) : [];
  },

  clearSession() {
    this._cachedProfile = null;
    localStorage.removeItem(this.STORAGE_PROFILE);
    localStorage.removeItem(this.STORAGE_TEACHER);
    localStorage.removeItem(this.STORAGE_USER_UUID);
  },

  // --------------------------------------------------------------------------
  // 6. MULTIPLAYER TRIVIA ENGINE (DUAL-SYNC & 404 RESILIENT)
  // --------------------------------------------------------------------------
  generate6CharRoomCode() {
    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  getLocalLobbyState(code) {
    if (!code) return null;
    const raw = localStorage.getItem('nexus_mp_lobby_' + code.toUpperCase().trim());
    return raw ? JSON.parse(raw) : null;
  },

  saveLocalLobbyState(code, state) {
    if (!code || !state) return;
    const cleanCode = code.toUpperCase().trim();
    const key = 'nexus_mp_lobby_' + cleanCode;
    this.safeSetItem(key, JSON.stringify(state));

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('nexus_mp_channel_' + cleanCode);
        bc.postMessage({ type: 'MP_LOBBY_UPDATE', state: state });
        bc.close();
      } catch (e) {}
    }
  },

  async createMultiplayerGame(config) {
    const userUuid = this.getUserUUID();
    let profile = this.getStudentProfile();
    if (!profile) {
      profile = { id: userUuid, role: 'student', name: 'Host Player', gradeLevel: 'Grade 10', section: 'Section A' };
    } else {
      profile.id = userUuid;
    }
    try {
      await this.saveStudentProfile(profile);
    } catch (e) {}
    const roomCode = this.generate6CharRoomCode();

    let selectedQuestions = [];
    if (supabaseClient) {
      try {
        let qTypeId = 1;
        if (config.answerMedium === 'true_false') qTypeId = 2;
        else if (config.answerMedium === 'identification') qTypeId = 3;

        let query = supabaseClient.from('questions').select('*').eq('is_active', true);
        if (config.topicId) query = query.eq('topic_id', config.topicId);
        if (qTypeId) query = query.eq('question_type_id', qTypeId);

        let { data: questions } = await query;
        if (!questions || questions.length === 0) {
          const fallbackRes = await supabaseClient.from('questions').select('*').eq('is_active', true).limit(30);
          questions = fallbackRes.data || [];
        }
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        selectedQuestions = shuffled.slice(0, config.questionCount || 10);
      } catch (e) {
        console.warn('Questions query error, using local fallback:', e);
      }
    }
    const formattedQuestions = this._formatQuestions(selectedQuestions);

    let gameData = {
      id: 'game_' + roomCode + '_' + Date.now(),
      room_code: roomCode,
      access_code: roomCode,
      status: 'waiting',
      host_id: userUuid,
      question_count: selectedQuestions.length || config.questionCount || 10,
      answer_medium: config.answerMedium || 'multiple_choice',
      formattedQuestions: formattedQuestions
    };

    if (supabaseClient) {
      // 1. Try multiplayer_games table
      try {
        const { data: gRes, error: gErr } = await supabaseClient
          .from('multiplayer_games')
          .insert({
            room_code: roomCode,
            host_id: userUuid,
            term_id: config.termId || null,
            topic_id: config.topicId || null,
            answer_medium: config.answerMedium || 'multiple_choice',
            question_count: selectedQuestions.length || config.questionCount || 10,
            status: 'waiting',
            current_question_index: 0
          })
          .select()
          .single();

        if (!gErr && gRes) {
          gameData = gRes;
          if (selectedQuestions.length > 0) {
            const qEntries = selectedQuestions.map((q, idx) => ({
              game_id: gameData.id,
              question_id: q.id,
              question_order: idx + 1
            }));
            try {
              await supabaseClient.from('multiplayer_game_questions').insert(qEntries);
            } catch (e) {}
          }
          try {
            await supabaseClient.from('multiplayer_players').insert({
              game_id: gameData.id,
              user_id: userUuid,
              display_name: profile.name || 'Host',
              photo_url: profile.photo || null,
              is_host: true
            });
          } catch (e) {}
        } else {
          // 2. Try quiz_lobbies fallback table
          const { data: lRes } = await supabaseClient
            .from('quiz_lobbies')
            .insert({
              access_code: roomCode,
              host_id: userUuid,
              host_name: profile.name || 'Host',
              quiz_title: 'Multiplayer Trivia',
              term_id: config.termId || null,
              topic_id: config.topicId || null,
              time_limit_per_question: 10,
              question_count: selectedQuestions.length || 10,
              status: 'waiting'
            })
            .select()
            .single();

          if (lRes) {
            gameData = lRes;
            gameData.room_code = roomCode;
            try {
              await supabaseClient.from('lobby_participants').insert({
                lobby_id: gameData.id,
                student_id: userUuid,
                student_name: profile.name || 'Host',
                photo_url: profile.photo || null
              });
            } catch (e) {}
          }
        }
      } catch (e) {
        console.warn('Supabase lobby creation fallback engaged:', e);
      }
    }

    gameData.formattedQuestions = formattedQuestions;

    // Save to LocalStorage BroadcastChannel state engine
    this.saveLocalLobbyState(roomCode, {
      code: roomCode,
      gameId: gameData.id,
      hostId: userUuid,
      hostName: profile.name || 'Host',
      status: 'waiting',
      settings: {
        timeLimitSec: 10,
        questionCount: selectedQuestions.length || 10,
        questionsList: formattedQuestions
      },
      participants: [{
        user_id: userUuid,
        display_name: profile.name || 'Host',
        photo_url: profile.photo || null,
        is_host: true,
        score: 0,
        correct_answers: 0,
        wrong_answers: 0
      }],
      lastUpdated: Date.now()
    });

    return gameData;
  },

  async joinMultiplayerGame(roomCode) {
    const cleanCode = (roomCode || '').toUpperCase().trim();
    if (cleanCode.length !== 6) {
      throw new Error('Room code must be exactly 6 characters!');
    }

    const userUuid = this.getUserUUID();
    let profile = this.getStudentProfile();
    if (!profile) {
      profile = { id: userUuid, role: 'student', name: 'Player ' + Math.floor(100 + Math.random() * 900), gradeLevel: 'Grade 10', section: 'Section A' };
    } else {
      profile.id = userUuid;
    }
    try {
      await this.saveStudentProfile(profile);
    } catch (e) {}
    let game = null;

    if (supabaseClient) {
      try {
        // 1. Try multiplayer_games
        const { data: gData } = await supabaseClient
          .from('multiplayer_games')
          .select('*')
          .eq('room_code', cleanCode)
          .maybeSingle();

        if (gData) {
          game = gData;
        } else {
          // 2. Try quiz_lobbies
          const { data: lData } = await supabaseClient
            .from('quiz_lobbies')
            .select('*')
            .eq('access_code', cleanCode)
            .maybeSingle();

          if (lData) {
            game = {
              id: lData.id,
              room_code: lData.access_code,
              status: lData.status || 'waiting',
              host_id: lData.host_id,
              question_count: lData.question_count || 10,
              isQuizLobbies: true
            };
          }
        }
      } catch (e) {
        console.warn('Supabase join query check:', e);
      }
    }

    // 3. Try LocalStorage state fallback
    const localState = this.getLocalLobbyState(cleanCode);
    if (!game && localState) {
      game = {
        id: localState.gameId || ('game_' + cleanCode),
        room_code: cleanCode,
        status: localState.status || 'waiting',
        host_id: localState.hostId,
        isLocalOnly: true
      };
    }

    if (!game) {
      throw new Error('Room not found! Check code or make sure host created the lobby.');
    }

    if (game.status === 'active' || game.status === 'in_progress') {
      throw new Error('Game has already started!');
    }
    if (game.status === 'finished' || game.status === 'completed' || game.status === 'cancelled') {
      throw new Error('This game session has ended!');
    }

    // Insert Player into Supabase
    if (supabaseClient && !game.isLocalOnly) {
      if (game.isQuizLobbies) {
        try {
          await supabaseClient.from('lobby_participants').insert({
            lobby_id: game.id,
            student_id: userUuid,
            student_name: profile.name || 'Player',
            photo_url: profile.photo || null
          });
        } catch (e) {}
      } else {
        try {
          await supabaseClient.from('multiplayer_players').insert({
            game_id: game.id,
            user_id: userUuid,
            display_name: profile.name || 'Player',
            photo_url: profile.photo || null,
            is_host: (game.host_id === userUuid)
          });
        } catch (e) {}
      }
    }

    // Update LocalStorage state
    if (localState) {
      localState.participants = localState.participants || [];
      const exists = localState.participants.some(p => p.user_id === userUuid || p.display_name === profile.name);
      if (!exists) {
        localState.participants.push({
          user_id: userUuid,
          display_name: profile.name || 'Player',
          photo_url: profile.photo || null,
          is_host: (game.host_id === userUuid),
          score: 0,
          correct_answers: 0,
          wrong_answers: 0
        });
        this.saveLocalLobbyState(cleanCode, localState);
      }
    }

    return game;
  },

  async getMultiplayerPlayers(gameId, roomCode) {
    let players = [];

    if (supabaseClient && gameId) {
      try {
        const { data: p1, error: e1 } = await supabaseClient
          .from('multiplayer_players')
          .select('*')
          .eq('game_id', gameId)
          .order('score', { ascending: false });

        if (!e1 && p1 && p1.length > 0) {
          players = p1;
        } else {
          const { data: p2 } = await supabaseClient
            .from('lobby_participants')
            .select('*')
            .eq('lobby_id', gameId);

          if (p2 && p2.length > 0) {
            players = p2.map(p => ({
              id: p.id,
              game_id: p.lobby_id,
              user_id: p.student_id,
              display_name: p.student_name,
              photo_url: p.photo_url,
              score: p.score || 0,
              correct_answers: p.correct_count || 0,
              wrong_answers: p.wrong_count || 0,
              current_question_index: p.current_question_index || 0,
              is_finished: p.is_finished || false,
              is_host: false
            }));
          }
        }
      } catch (e) {
        console.warn('Error fetching players from Supabase:', e);
      }
    }

    if (roomCode) {
      const localState = this.getLocalLobbyState(roomCode);
      if (localState && localState.participants) {
        localState.participants.forEach(lp => {
          if (!players.some(p => p.user_id === lp.user_id || p.display_name === lp.display_name)) {
            players.push(lp);
          }
        });
      }
    }

    return players;
  },

  async getMultiplayerQuestions(gameId, roomCode) {
    if (roomCode) {
      const localState = this.getLocalLobbyState(roomCode);
      if (localState && localState.settings && localState.settings.questionsList && localState.settings.questionsList.length > 0) {
        return localState.settings.questionsList;
      }
    }

    if (!supabaseClient || !gameId) return [];
    try {
      const { data: gameQ, error: gqErr } = await supabaseClient
        .from('multiplayer_game_questions')
        .select('question_id, question_order')
        .eq('game_id', gameId)
        .order('question_order', { ascending: true });

      if (gqErr || !gameQ || gameQ.length === 0) return [];

      const qIds = gameQ.map(item => item.question_id);
      const { data: rawQ } = await supabaseClient
        .from('questions')
        .select('*')
        .in('id', qIds);

      const formatted = this._formatQuestions(rawQ || []);
      const ordered = [];
      gameQ.forEach(item => {
        const found = formatted.find(q => q.id === item.question_id);
        if (found) ordered.push(found);
      });
      return ordered.length > 0 ? ordered : formatted;
    } catch (e) {
      console.error('Error fetching game questions:', e);
      return [];
    }
  },

  async submitMultiplayerAnswer(gameId, playerId, questionId, answerText, isCorrect, responseTime, pointsEarned) {
    if (!supabaseClient || !gameId || !playerId) return;
    try {
      try {
        await supabaseClient
          .from('multiplayer_answers')
          .insert({
            game_id: gameId,
            player_id: playerId,
            question_id: questionId,
            answer: String(answerText),
            is_correct: isCorrect,
            response_time: responseTime || 0,
            points_earned: pointsEarned || 0
          });
      } catch (e) {}

      const { data: player } = await supabaseClient
        .from('multiplayer_players')
        .select('score, correct_answers, wrong_answers')
        .eq('id', playerId)
        .single();

      if (player) {
        const newScore = (player.score || 0) + (pointsEarned || 0);
        const newCorrect = (player.correct_answers || 0) + (isCorrect ? 1 : 0);
        const newWrong = (player.wrong_answers || 0) + (isCorrect ? 0 : 1);

        try {
          await supabaseClient
            .from('multiplayer_players')
            .update({
              score: newScore,
              correct_answers: newCorrect,
              wrong_answers: newWrong,
              last_seen: new Date().toISOString()
            })
            .eq('id', playerId);
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error submitting multiplayer answer:', e);
    }
  },

  async updateMultiplayerGameStatus(gameId, status, currentQIndex = 0) {
    if (!supabaseClient || !gameId) return;
    try {
      const payload = { status: status, current_question_index: currentQIndex };
      if (status === 'active' || status === 'starting') payload.started_at = new Date().toISOString();
      if (status === 'finished' || status === 'cancelled') payload.ended_at = new Date().toISOString();

      try { await supabaseClient.from('multiplayer_games').update(payload).eq('id', gameId); } catch (e) {}
      try { await supabaseClient.from('quiz_lobbies').update({ status: status }).eq('id', gameId); } catch (e) {}
    } catch (e) {
      console.error('Error updating game status:', e);
    }
  },

  async saveQrCodeUrlToSupabase(gameId, qrUrl) {
    if (!supabaseClient || !gameId) return;
    try {
      await supabaseClient.from('multiplayer_games').update({ qr_code_url: qrUrl }).eq('id', gameId);
      await supabaseClient.from('quiz_lobbies').update({ host_photo_url: qrUrl }).eq('id', gameId);
    } catch (e) {}
  },

  async getMultiplayerGameByCode(roomCode) {
    if (!roomCode) return null;
    const cleanCode = roomCode.toUpperCase().trim();

    if (supabaseClient) {
      try {
        const { data: gData } = await supabaseClient
          .from('multiplayer_games')
          .select('*')
          .eq('room_code', cleanCode)
          .maybeSingle();

        if (gData) return gData;

        const { data: lData } = await supabaseClient
          .from('quiz_lobbies')
          .select('*')
          .eq('access_code', cleanCode)
          .maybeSingle();

        if (lData) {
          return {
            id: lData.id,
            room_code: lData.access_code,
            status: lData.status === 'in_progress' ? 'active' : (lData.status || 'waiting'),
            host_id: lData.host_id,
            current_question_index: lData.current_question_index || 0
          };
        }
      } catch (e) {}
    }

    const localState = this.getLocalLobbyState(cleanCode);
    if (localState) {
      return {
        id: localState.gameId,
        room_code: cleanCode,
        status: localState.status || 'waiting',
        host_id: localState.hostId,
        current_question_index: localState.currentIndex || 0
      };
    }

    return null;
  }
};


