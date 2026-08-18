/* ==========================================================================
   NEXUS DATABASE & SUPABASE LIVE INTEGRATION
   Replaces all local hardcoded mock data with live Supabase PostgreSQL backend
   ========================================================================== */

var SUPABASE_URL = "https://bmebwqvdotwmtqcaxrnk.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWJ3cXZkb3R3bXRxY2F4cm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzUxNTQsImV4cCI6MjEwMTU1MTE1NH0._t0YaKroymMbtSnySVpe8Sw9uwUviAFYdkXeZADeVL8";

var supabaseClient = null;

function getSupabaseClient() {
  if (typeof window !== 'undefined' && window._supabaseClientInstance) {
    supabaseClient = window._supabaseClientInstance;
    return window._supabaseClientInstance;
  }
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      window._supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        realtime: {
          params: { eventsPerSecond: 10 },
          timeout: 30000,
          heartbeatIntervalMs: 15000
        }
      });
      window.supabaseClient = window._supabaseClientInstance;
      supabaseClient = window._supabaseClientInstance;
      return window._supabaseClientInstance;
    } catch (e) {
      console.warn('Error creating Supabase client:', e);
    }
  }
  return null;
}

supabaseClient = getSupabaseClient();
if (typeof window !== 'undefined') {
  window.supabaseClient = supabaseClient || getSupabaseClient();
}

var DB = {
  // UUID validator helper
  isValidUuid(val) {
    if (typeof val !== 'string') return false;
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
  },

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
  formatTermTitle(rawTitle, orderNo) {
    if (!rawTitle) return `Term ${orderNo || 1}`;
    let formatted = rawTitle
      .replace(/1st Quarter:/gi, 'Term 1:')
      .replace(/2nd Quarter:/gi, 'Term 2:')
      .replace(/3rd Quarter:/gi, 'Term 3:')
      .replace(/4th Quarter:/gi, 'Term 4:')
      .replace(/1st Quarter/gi, 'Term 1')
      .replace(/2nd Quarter/gi, 'Term 2')
      .replace(/3rd Quarter/gi, 'Term 3')
      .replace(/4th Quarter/gi, 'Term 4')
      .replace(/Quarter/gi, 'Term');
    return formatted;
  },

  async getTerms() {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('terms')
        .select('*')
        .order('order_no', { ascending: true });
      if (error) throw error;
      if (data) {
        return data.map(t => ({
          ...t,
          title: this.formatTermTitle(t.title, t.order_no),
          name: t.name ? t.name.replace(/Quarter/gi, 'Term') : `Term ${t.order_no || 1}`
        }));
      }
      return [];
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
      if (quizType) {
        const normalizedQuizType = String(quizType).replace('-', '_');
        query = query.eq('quiz_type', normalizedQuizType);
      }

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
    if (!Array.isArray(rawQuestions)) return [];
    return rawQuestions.map(q => {
      let typeId = q.question_type_id || 1;
      let choiceA = q.choice_a || q.option_a || '';
      let choiceB = q.choice_b || q.option_b || '';
      let choiceC = q.choice_c || q.option_c || '';
      let choiceD = q.choice_d || q.option_d || '';

      if (typeId === 2 || (!choiceC && !choiceD && (q.correct_answer === 'True' || q.correct_answer === 'False' || q.correct_answer === 'TRUE' || q.correct_answer === 'FALSE'))) {
        choiceA = 'True';
        choiceB = 'False';
        choiceC = '';
        choiceD = '';
        typeId = 2;
      }

      const opts = [];
      if (choiceA && choiceA.trim() !== '') opts.push(choiceA);
      if (choiceB && choiceB.trim() !== '') opts.push(choiceB);
      if (choiceC && choiceC.trim() !== '') opts.push(choiceC);
      if (choiceD && choiceD.trim() !== '') opts.push(choiceD);

      let ansIndex = 0;
      const ansUpper = (q.correct_answer || '').toUpperCase().trim();
      if (ansUpper === 'A' || ansUpper === choiceA.toUpperCase().trim()) ansIndex = 0;
      else if (ansUpper === 'B' || ansUpper === choiceB.toUpperCase().trim()) ansIndex = 1;
      else if (ansUpper === 'C' || ansUpper === choiceC.toUpperCase().trim()) ansIndex = 2;
      else if (ansUpper === 'D' || ansUpper === choiceD.toUpperCase().trim()) ansIndex = 3;

      let qTypeStr = 'mc';
      if (typeId === 2 || q.question_type === 'true_false') qTypeStr = 'tf';
      if (typeId === 3 || q.question_type === 'identification') qTypeStr = 'id';

      return {
        id: q.id,
        topicId: q.topic_id,
        questionTypeId: typeId,
        question_type_id: typeId,
        term: 1,
        topic: q.difficulty || 'Science',
        question: q.question || 'Science Question',
        options: opts,
        choice_a: choiceA,
        choice_b: choiceB,
        choice_c: choiceC,
        choice_d: choiceD,
        option_a: choiceA,
        option_b: choiceB,
        option_c: choiceC,
        option_d: choiceD,
        answer: ansIndex,
        rawAnswer: q.correct_answer,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        timeLimit: q.time_limit || 20,
        time_limit: q.time_limit || 20,
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
        if (k.startsWith('nexus_lobby_') || k.startsWith('nexus_mp_lobby_')) {
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

  getActiveProfile() {
    const userUuid = this.getUserUUID();
    const teacherRaw = localStorage.getItem(this.STORAGE_TEACHER);
    if (teacherRaw) {
      try {
        const teacher = JSON.parse(teacherRaw);
        return {
          id: userUuid,
          role: 'teacher',
          name: teacher.name || 'Prof. Teacher',
          photo: teacher.photo || null,
          isTeacher: true
        };
      } catch (e) {}
    }

    const student = this.getStudentProfile();
    if (student) {
      return {
        id: userUuid,
        role: 'student',
        name: student.name || 'Student Player',
        photo: student.photo || null,
        isTeacher: false
      };
    }

    return {
      id: userUuid,
      role: 'student',
      name: 'Player ' + Math.floor(100 + Math.random() * 900),
      photo: null,
      isTeacher: false
    };
  },

  async isValidPasscode(passcode) {
    if (!passcode) return false;
    const clean = passcode.trim();
    if (['123456', 'NEXUS10'].includes(clean)) return true;
    if (!supabaseClient) return false;
    try {
      const { data, error } = await supabaseClient
        .from('teacher_passcodes')
        .select('*')
        .eq('passcode', clean)
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;
      return data !== null;
    } catch (e) {
      console.warn('Teacher passcode validation fallback:', e);
      return false;
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

  async fetchProfileFromSupabase(userId) {
    if (!supabaseClient || !userId) return null;
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        role: data.role || 'student',
        name: data.full_name || data.name || 'User',
        full_name: data.full_name || data.name || 'User',
        username: data.username || '',
        gradeLevel: data.grade_level || '',
        section: data.section || '',
        photo: data.photo_url || null,
        createdAt: data.created_at || new Date().toISOString()
      };
    } catch (e) {
      console.warn('Error fetching profile from Supabase:', e);
      return null;
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
    let uuid = null;
    try {
      uuid = sessionStorage.getItem('nexus_session_tab_uuid');
    } catch (e) {}

    const isValidUUID = uuid && uuid.length === 36 && uuid.includes('-');
    if (!isValidUUID) {
      uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
      try {
        sessionStorage.setItem('nexus_session_tab_uuid', uuid);
      } catch (e) {}
      this.saveUserUUID(uuid);
    }
    return uuid;
  },

  saveUserUUID(uuid) {
    this.safeSetItem(this.STORAGE_USER_UUID, uuid);
  },

  async saveCustomQuiz(quizObj) {
    if (!quizObj) return;

    // 1. Save to LocalStorage immediately
    const list = JSON.parse(localStorage.getItem('nexus_custom_quizzes') || '[]');
    const existingIdx = list.findIndex(q => q.id === quizObj.id);
    if (existingIdx >= 0) {
      list[existingIdx] = quizObj;
    } else {
      list.push(quizObj);
    }
    this.safeSetItem('nexus_custom_quizzes', JSON.stringify(list));

    // 2. Sync to Supabase if client available
    if (supabaseClient) {
      const userUuid = this.getUserUUID();
      try {
        await supabaseClient.from('custom_quizzes').upsert({
          id: this.isValidUuid(quizObj.id) ? quizObj.id : undefined,
          title: quizObj.title,
          term_id: quizObj.term || 1,
          created_by: userUuid,
          questions_json: quizObj.questions
        });
      } catch (e) {}

      // Upsert individual questions into Supabase question bank for full query resilience
      if (quizObj.questions && Array.isArray(quizObj.questions)) {
        for (const q of quizObj.questions) {
          try {
            const optA = q.choice_a || q.option_a || q.optionA || (q.options ? q.options[0] : null);
            const optB = q.choice_b || q.option_b || q.optionB || (q.options ? q.options[1] : null);
            const optC = q.choice_c || q.option_c || q.optionC || (q.options ? q.options[2] : null);
            const optD = q.choice_d || q.option_d || q.optionD || (q.options ? q.options[3] : null);

            let eqAns = q.equivalent_answer || q.equivalentAnswer || q.counterpart;
            if (!eqAns && (q.question_type === 'multiple_choice' || q.question_type_id === 1)) {
              const corr = String(q.correct_answer || q.correctAnswer || q.answer || 'A').toUpperCase();
              if (corr === 'A' || corr === '0') eqAns = optA;
              else if (corr === 'B' || corr === '1') eqAns = optB;
              else if (corr === 'C' || corr === '2') eqAns = optC;
              else if (corr === 'D' || corr === '3') eqAns = optD;
            }

            await supabaseClient.from('questions').upsert({
              id: this.isValidUuid(q.id) ? q.id : undefined,
              question: q.question,
              question_type_id: q.question_type_id || (q.question_type === 'true_false' ? 2 : (q.question_type === 'identification' ? 3 : 1)),
              choice_a: optA,
              choice_b: optB,
              choice_c: optC,
              choice_d: optD,
              correct_answer: q.correct_answer || q.correctAnswer || q.answer,
              equivalent_answer: eqAns,
              term_id: quizObj.term || 1,
              is_active: true
            });
          } catch (e) {}
        }
      }
    }
  },

  getCustomQuizzes() {
    const raw = localStorage.getItem('nexus_custom_quizzes');
    let localList = raw ? JSON.parse(raw) : [];

    if (supabaseClient) {
      supabaseClient
        .from('custom_quizzes')
        .select('*')
        .then(({ data: remoteQuizzes }) => {
          if (remoteQuizzes && remoteQuizzes.length > 0) {
            let updated = false;
            remoteQuizzes.forEach(rq => {
              const parsed = {
                id: rq.id,
                title: rq.title,
                term: rq.term_id,
                questions: rq.questions_json || []
              };
              if (!localList.some(l => l.id === parsed.id || l.title === parsed.title)) {
                localList.push(parsed);
                updated = true;
              }
            });
            if (updated) {
              localStorage.setItem('nexus_custom_quizzes', JSON.stringify(localList));
            }
          }
        })
        .catch(() => {});
    }

    return localList;
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
    const profile = this.getActiveProfile();
    profile.id = userUuid;
    try {
      await this.saveStudentProfile(profile);
    } catch (e) {}

    const roomCode = this.generate6CharRoomCode();

    let selectedQuestions = [];
    if (config.customQuestions && config.customQuestions.length > 0) {
      selectedQuestions = config.customQuestions.map((q, idx) => {
        const optA = q.options ? q.options[0] : (q.optionA || q.choice_a || q.option_a || '');
        const optB = q.options ? q.options[1] : (q.optionB || q.choice_b || q.option_b || '');
        const optC = q.options ? q.options[2] : (q.optionC || q.choice_c || q.option_c || '');
        const optD = q.options ? q.options[3] : (q.optionD || q.choice_d || q.option_d || '');

        let corrAns = q.answer !== undefined ? q.answer : (q.correctAnswer || q.correct_answer || 0);
        let eqAns = q.equivalent_answer || q.equivalentAnswer || q.counterpart;
        if (!eqAns && (q.questionType === 'multiple_choice' || q.question_type === 'multiple_choice' || q.question_type_id === 1)) {
          const cStr = String(corrAns).toUpperCase();
          if (cStr === 'A' || cStr === '0') eqAns = optA;
          else if (cStr === 'B' || cStr === '1') eqAns = optB;
          else if (cStr === 'C' || cStr === '2') eqAns = optC;
          else if (cStr === 'D' || cStr === '3') eqAns = optD;
        }

        return {
          id: q.id || `custom_q_${idx}`,
          question: q.question || q.prompt || 'Custom Question',
          options: q.options || [optA, optB, optC, optD].filter(Boolean),
          optionA: optA,
          optionB: optB,
          optionC: optC,
          optionD: optD,
          choice_a: optA,
          choice_b: optB,
          choice_c: optC,
          choice_d: optD,
          answer: corrAns,
          correct_answer: corrAns,
          correctAnswer: corrAns,
          equivalent_answer: eqAns,
          counterpart: q.counterpart || eqAns,
          question_type: q.questionType || q.question_type || q.type || 'multiple_choice',
          time_limit: config.timeLimit || 20
        };
      });
    } else if (supabaseClient) {
      try {
        let qTypeId = null;
        if (config.answerMedium === 'true_false') qTypeId = 2;
        else if (config.answerMedium === 'identification') qTypeId = 3;
        else if (config.answerMedium === 'multiple_choice') qTypeId = 1;

        let query = supabaseClient.from('questions').select('*').eq('is_active', true);
        if (config.topicId) query = query.eq('topic_id', config.topicId);
        if (qTypeId) query = query.eq('question_type_id', qTypeId);

        let { data: questions } = await query;
        if (!questions || questions.length === 0) {
          if (config.topicId) {
            const { data: topicQ } = await supabaseClient.from('questions').select('*').eq('is_active', true).eq('topic_id', config.topicId);
            questions = topicQ || [];
          }
          if ((!questions || questions.length === 0) && config.termId) {
            const { data: termQ } = await supabaseClient.from('questions').select('*').eq('is_active', true).eq('term_id', config.termId);
            questions = termQ || [];
          }
          if (!questions || questions.length === 0) {
            const fallbackRes = await supabaseClient.from('questions').select('*').eq('is_active', true).limit(30);
            questions = fallbackRes.data || [];
          }
        }
        const qCount = Math.min(30, Math.max(1, config.questionCount || 10));
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        selectedQuestions = shuffled.slice(0, qCount);
      } catch (e) {
        console.warn('Questions query error, using local fallback:', e);
      }
    }

    const tLimit = Math.min(60, Math.max(10, config.timeLimit || 20));
    const formattedQuestions = this._formatQuestions(selectedQuestions).map(q => ({
      ...q,
      time_limit: tLimit
    }));

    const termUuid = this.isValidUuid(config.termId) ? config.termId : null;
    const topicUuid = this.isValidUuid(config.topicId) ? config.topicId : null;

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
      try {
        const { data: gRes, error: gErr } = await supabaseClient
          .from('multiplayer_games')
          .insert({
            room_code: roomCode,
            host_id: userUuid,
            term_id: termUuid,
            topic_id: topicUuid,
            answer_medium: config.answerMedium || 'multiple_choice',
            question_count: selectedQuestions.length || config.questionCount || 10,
            status: 'waiting',
            current_question_index: 0
          })
          .select()
          .single();

        if (!gErr && gRes) {
          gameData = {
            ...gameData,
            ...gRes,
            formattedQuestions: formattedQuestions
          };
          if (selectedQuestions.length > 0) {
            const qEntries = selectedQuestions
              .map((q, idx) => ({
                game_id: gameData.id,
                question_id: this.isValidUuid(q.id) ? q.id : null,
                question_order: idx + 1
              }))
              .filter(e => e.question_id !== null);

            if (qEntries.length > 0) {
              try {
                await supabaseClient.from('multiplayer_game_questions').insert(qEntries);
              } catch (e) {}
            }
          }
          try {
            await supabaseClient.from('multiplayer_players').insert({
              game_id: gameData.id,
              user_id: userUuid,
              display_name: profile.name || 'Host',
              photo_url: (profile.photo && profile.photo.length < 5000) ? profile.photo : null,
              is_host: true
            });
          } catch (e) {}

          try {
            await supabaseClient.from('quiz_lobbies').insert({
              id: gameData.id,
              access_code: roomCode,
              host_id: userUuid,
              host_name: profile.name || 'Host',
              photo_url: (profile.photo && profile.photo.length < 5000) ? profile.photo : null
            });
          } catch (e) {}
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
        id: userUuid,
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
    const profile = this.getActiveProfile();
    profile.id = userUuid;

    // Save student profile to Supabase first to satisfy profiles FK constraint
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

    // Fallback to local lobby state if not found in Supabase
    if (!game) {
      const localState = this.getLocalLobbyState(cleanCode);
      if (localState) {
        game = {
          id: localState.gameId || ('game_' + cleanCode),
          room_code: cleanCode,
          status: localState.status || 'waiting',
          host_id: localState.hostId || null,
          isLocalOnly: true
        };
      }
    }

    if (!game) {
      throw new Error('Room not found! Check code or make sure host created the lobby.');
    }

    if (game.status === 'finished' || game.status === 'completed' || game.status === 'cancelled') {
      throw new Error('This game session has ended!');
    }

    const isHost = (game.host_id === userUuid);

    // Insert or Upsert Player into Supabase
    if (supabaseClient && !game.isLocalOnly) {
      // 1. Upsert / Insert into multiplayer_players
      try {
        const payloadMp = {
          game_id: game.id,
          user_id: userUuid,
          display_name: profile.name || 'Player',
          photo_url: (profile.photo && profile.photo.length < 5000) ? profile.photo : null,
          is_host: isHost
        };
        const { error: upErr } = await supabaseClient
          .from('multiplayer_players')
          .upsert(payloadMp, { onConflict: 'game_id,user_id' });

        if (upErr) {
          await supabaseClient.from('multiplayer_players').insert(payloadMp);
        }
      } catch (e) {
        try {
          await supabaseClient.from('multiplayer_players').insert({
            game_id: game.id,
            display_name: profile.name || 'Player',
            photo_url: (profile.photo && profile.photo.length < 5000) ? profile.photo : null,
            is_host: isHost
          });
        } catch (err) {}
      }

      // 2. Dual fallback insert into lobby_participants
      try {
        const payloadLobby = {
          lobby_id: game.id,
          student_id: userUuid,
          student_name: profile.name || 'Player',
          photo_url: (profile.photo && profile.photo.length < 5000) ? profile.photo : null
        };
        const { error: lErr } = await supabaseClient
          .from('lobby_participants')
          .upsert(payloadLobby, { onConflict: 'lobby_id,student_id' });

        if (lErr) {
          await supabaseClient.from('lobby_participants').insert(payloadLobby);
        }
      } catch (e) {}
    }

    // Always update local lobby state for local/multi-tab sync
    let localState = this.getLocalLobbyState(cleanCode);
    if (!localState) {
      localState = {
        code: cleanCode,
        gameId: game.id,
        hostId: game.host_id,
        status: game.status || 'waiting',
        participants: []
      };
    }
    if (!localState.participants) localState.participants = [];
    const exists = localState.participants.some(p => (p.user_id === userUuid || p.id === userUuid || p.display_name === profile.name));
    if (!exists) {
      localState.participants.push({
        user_id: userUuid,
        id: userUuid,
        display_name: profile.name || 'Player',
        photo_url: profile.photo || null,
        is_host: isHost,
        score: 0,
        correct_answers: 0,
        wrong_answers: 0
      });
      this.saveLocalLobbyState(cleanCode, localState);
    }

    return game;
  },

  async getMultiplayerPlayers(gameId, roomCode) {
    const playerMap = new Map();

    // 1. Fetch from Supabase tables if connected
    if (supabaseClient) {
      try {
        let targetGameIds = [];
        if (gameId) targetGameIds.push(gameId);

        if (roomCode) {
          const cleanCode = roomCode.toUpperCase().trim();
          const { data: gList } = await supabaseClient
            .from('multiplayer_games')
            .select('id')
            .eq('room_code', cleanCode);

          if (gList && gList.length > 0) {
            gList.forEach(g => {
              if (g && g.id && !targetGameIds.includes(g.id)) {
                targetGameIds.push(g.id);
              }
            });
          }

          const { data: lList } = await supabaseClient
            .from('quiz_lobbies')
            .select('id')
            .eq('access_code', cleanCode);

          if (lList && lList.length > 0) {
            lList.forEach(l => {
              if (l && l.id && !targetGameIds.includes(l.id)) {
                targetGameIds.push(l.id);
              }
            });
          }
        }

        for (const targetId of targetGameIds) {
          const { data: p1 } = await supabaseClient
            .from('multiplayer_players')
            .select('*')
            .eq('game_id', targetId);

          if (p1 && p1.length > 0) {
            p1.forEach(p => {
              const key = p.user_id || p.id || p.display_name;
              if (key && !playerMap.has(key)) {
                playerMap.set(key, {
                  id: p.id || p.user_id,
                  game_id: p.game_id,
                  user_id: p.user_id || p.id,
                  display_name: p.display_name || p.name || 'Player',
                  photo_url: p.photo_url || p.photo || null,
                  score: p.score || 0,
                  correct_answers: p.correct_answers || 0,
                  wrong_answers: p.wrong_answers || 0,
                  current_question_index: p.current_question_index || 0,
                  is_finished: p.is_finished || false,
                  is_host: !!p.is_host
                });
              }
            });
          }

          const { data: p2 } = await supabaseClient
            .from('lobby_participants')
            .select('*')
            .eq('lobby_id', targetId);

          if (p2 && p2.length > 0) {
            p2.forEach(p => {
              const key = p.student_id || p.id || p.student_name;
              if (key && !playerMap.has(key)) {
                playerMap.set(key, {
                  id: p.id,
                  game_id: p.lobby_id,
                  user_id: p.student_id || p.id,
                  display_name: p.student_name || 'Player',
                  photo_url: p.photo_url || null,
                  score: p.score || 0,
                  correct_answers: p.correct_count || 0,
                  wrong_answers: p.wrong_count || 0,
                  current_question_index: p.current_question_index || 0,
                  is_finished: p.is_finished || false,
                  is_host: false
                });
              }
            });
          }
        }
      } catch (e) {
        console.warn('Error fetching players from Supabase:', e);
      }
    }

    // 2. Merge with Local Lobby State
    const cleanCode = roomCode ? roomCode.toUpperCase().trim() : null;
    if (cleanCode) {
      const localState = this.getLocalLobbyState(cleanCode);
      if (localState && Array.isArray(localState.participants)) {
        localState.participants.forEach(p => {
          const key = p.user_id || p.id || p.display_name || p.name;
          if (key && !playerMap.has(key)) {
            playerMap.set(key, {
              id: p.id || p.user_id,
              game_id: gameId,
              user_id: p.user_id || p.id,
              display_name: p.display_name || p.name || 'Player',
              photo_url: p.photo_url || p.photo || null,
              score: p.score || 0,
              correct_answers: p.correct_answers || 0,
              wrong_answers: p.wrong_answers || 0,
              current_question_index: p.current_question_index || 0,
              is_finished: p.is_finished || false,
              is_host: !!p.is_host
            });
          }
        });
      }
    }

    return Array.from(playerMap.values());
  },


  async getMultiplayerQuestions(gameId, roomCode) {
    if (!supabaseClient) return [];

    try {
      if (gameId) {
        const { data: gameQ } = await supabaseClient
          .from('multiplayer_game_questions')
          .select('question_id, question_order')
          .eq('game_id', gameId)
          .order('question_order', { ascending: true });

        if (gameQ && gameQ.length > 0) {
          const qIds = gameQ.map(item => item.question_id);
          const { data: rawQ } = await supabaseClient.from('questions').select('*').in('id', qIds);
          if (rawQ && rawQ.length > 0) {
            const formatted = this._formatQuestions(rawQ);
            const ordered = [];
            gameQ.forEach(item => {
              const found = formatted.find(q => q.id === item.question_id);
              if (found) ordered.push(found);
            });
            if (ordered.length > 0) return ordered;
          }
        }
      }

      // Fallback query if multiplayer_game_questions not present
      const gameObj = await this.getMultiplayerGameByCode(roomCode);
      let query = supabaseClient.from('questions').select('*').eq('is_active', true);
      if (gameObj && gameObj.term_id) query = query.eq('term_id', gameObj.term_id);
      if (gameObj && gameObj.topic_id) query = query.eq('topic_id', gameObj.topic_id);

      let { data: fallbackQ } = await query.limit(30);
      if (!fallbackQ || fallbackQ.length === 0) {
        const { data: allQ } = await supabaseClient.from('questions').select('*').eq('is_active', true).limit(20);
        fallbackQ = allQ || [];
      }

      const formatted = this._formatQuestions(fallbackQ);
      const count = (gameObj && gameObj.question_count) ? gameObj.question_count : 10;
      return formatted.slice(0, count);
    } catch (e) {
      console.error('Error fetching game questions:', e);
      return [];
    }
  },

  evaluateAnswerCorrectness(q, selectedChoice) {
    if (!q || selectedChoice === undefined || selectedChoice === null) return false;

    const dbCorrect = String(q.correct_answer || q.correctAnswer || q.answer || '').trim();
    const eqCorrect = String(q.equivalent_answer || q.equivalentAnswer || q.counterpart || '').trim();
    const userSel = String(selectedChoice).trim();

    const letterMap = { 'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', '0': 'a', '1': 'b', '2': 'c', '3': 'd' };

    let dbLower = dbCorrect.toLowerCase();
    let eqLower = eqCorrect.toLowerCase();
    let userLower = userSel.toLowerCase();

    if (letterMap[userLower]) {
      userLower = letterMap[userLower];
    }
    if (letterMap[dbLower]) {
      dbLower = letterMap[dbLower];
    }

    // 1. Direct case-insensitive equality
    if (userLower === dbLower || (eqLower && userLower === eqLower)) return true;

    // 2. Map choices
    const choicesMap = {
      a: String(q.choice_a || q.option_a || q.optionA || (q.options ? q.options[0] : '') || '').trim().toLowerCase(),
      b: String(q.choice_b || q.option_b || q.optionB || (q.options ? q.options[1] : '') || '').trim().toLowerCase(),
      c: String(q.choice_c || q.option_c || q.optionC || (q.options ? q.options[2] : '') || '').trim().toLowerCase(),
      d: String(q.choice_d || q.option_d || q.optionD || (q.options ? q.options[3] : '') || '').trim().toLowerCase()
    };

    // If user selected A/B/C/D letter (or index 0..3)
    if (['a', 'b', 'c', 'd'].includes(userLower)) {
      if (dbLower === userLower) return true;
      const textForUserLetter = choicesMap[userLower];
      if (textForUserLetter && (textForUserLetter === dbLower || textForUserLetter === eqLower)) {
        return true;
      }
      if (textForUserLetter && dbLower.length > 2 && (textForUserLetter.includes(dbLower) || dbLower.includes(textForUserLetter))) {
        return true;
      }
    }

    // If dbCorrect is a letter A/B/C/D (or index 0..3)
    if (['a', 'b', 'c', 'd'].includes(dbLower)) {
      if (dbLower === userLower) return true;
      const textForDbLetter = choicesMap[dbLower];
      if (textForDbLetter && (textForDbLetter === userLower || textForDbLetter === eqLower)) {
        return true;
      }
      if (textForDbLetter && userLower.length > 2 && (textForDbLetter.includes(userLower) || userLower.includes(textForDbLetter))) {
        return true;
      }
    }

    // 3. True / False handling
    const trueSyns = ['true', 't'];
    const falseSyns = ['false', 'f'];
    if (q.question_type_id === 2 || q.question_type === 'true_false' || (choicesMap.a === 'true' && choicesMap.b === 'false')) {
      if (trueSyns.includes(dbLower) && trueSyns.includes(userLower)) return true;
      if (falseSyns.includes(dbLower) && falseSyns.includes(userLower)) return true;
    }

    // 4. Substring / Counterpart fallback for text/identification answer (minimum length 3)
    if (userLower.length >= 3 && (eqLower.length >= 3 || dbLower.length >= 3)) {
      const targetText = eqLower || dbLower;
      if (userLower === targetText || userLower.includes(targetText) || targetText.includes(userLower)) return true;
    }

    return false;
  },

  async submitPlayerAnswer(gameId, userUuid, questionId, selectedChoice, responseTimeSec = 0) {
    if (!gameId) return { is_correct: false, points_earned: 0 };

    try {
      // 1. Fetch Question details to validate answer authoritatively
      let q = null;
      if (typeof Multiplayer !== 'undefined' && Multiplayer.questionsList && Multiplayer.questionsList.length > 0) {
        q = Multiplayer.questionsList.find(item => item && (item.id === questionId || item.id == questionId));
      }

      if (!q && supabaseClient && this.isValidUuid(questionId)) {
        try {
          const { data: dbQ } = await supabaseClient
            .from('questions')
            .select('correct_answer, time_limit, question_type_id, choice_a, choice_b, choice_c, choice_d')
            .eq('id', questionId)
            .maybeSingle();
          if (dbQ) q = dbQ;
        } catch (err) {}
      }

      const isCorrect = this.evaluateAnswerCorrectness(q, selectedChoice);

      // 2. Calculate score (Speed bonus based on response time)
      let pointsEarned = 0;
      if (isCorrect) {
        const timeLimit = (q && q.time_limit ? q.time_limit : 20) || 20;
        const timeRatio = Math.max(0.2, 1 - (responseTimeSec / timeLimit));
        pointsEarned = Math.round(1000 * timeRatio);
      }

      // 3. Find Player ID in multiplayer_players
      const { data: player } = await supabaseClient
        .from('multiplayer_players')
        .select('id, score, correct_answers, wrong_answers')
        .eq('game_id', gameId)
        .or(`user_id.eq.${userUuid},id.eq.${userUuid}`)
        .maybeSingle();

      if (player) {
        const pId = player.id;

        // Insert record into multiplayer_answers
        try {
          await supabaseClient
            .from('multiplayer_answers')
            .insert({
              game_id: gameId,
              player_id: pId,
              question_id: questionId,
              answer: String(selectedChoice),
              is_correct: isCorrect,
              response_time: responseTimeSec,
              points_earned: pointsEarned
            });
        } catch (err) {}

        // Update player score & stats
        const newScore = (player.score || 0) + pointsEarned;
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
            .eq('id', pId);
        } catch (err) {}
      }

      return { is_correct: isCorrect, points_earned: pointsEarned };
    } catch (e) {
      console.error('Error submitting player answer:', e);
      return { is_correct: false, points_earned: 0 };
    }
  },

  async submitMultiplayerAnswer(gameId, playerId, questionId, answerText, isCorrect, responseTime, pointsEarned) {
    return this.submitPlayerAnswer(gameId, playerId, questionId, answerText, responseTime);
  },

  async getGameLeaderboard(gameId) {
    if (!supabaseClient || !gameId) return [];
    try {
      const { data: players } = await supabaseClient
        .from('multiplayer_players')
        .select('id, user_id, display_name, score, correct_answers, wrong_answers, is_host')
        .eq('game_id', gameId)
        .eq('is_host', false)
        .order('score', { ascending: false });

      return (players || []).filter(p => !p.is_host);
    } catch (e) {
      console.error('Error fetching game leaderboard:', e);
      return [];
    }
  },

  async leaveMultiplayerGame(gameId, userUuid) {
    if (!gameId || !userUuid) return;
    if (supabaseClient) {
      try {
        await supabaseClient
          .from('multiplayer_players')
          .delete()
          .eq('game_id', gameId)
          .eq('user_id', userUuid);
      } catch (e) {}

      try {
        await supabaseClient
          .from('multiplayer_player_answers')
          .delete()
          .eq('game_id', gameId)
          .eq('player_id', userUuid);
      } catch (e) {}
    }
  },

  async updateMultiplayerGameStatus(gameId, status, currentQIndex = 0) {
    if (!gameId) return;

    const mpStatus = (status === 'in_progress') ? 'active' : (status === 'completed' ? 'finished' : status);
    const qlStatus = (status === 'active' || status === 'starting') ? 'in_progress' : (status === 'finished' ? 'completed' : status);

    const nowIso = new Date().toISOString();
    const payloadMp = {
      status: mpStatus,
      current_question_index: currentQIndex,
      question_start_time: nowIso
    };
    if (mpStatus === 'active' || mpStatus === 'starting') payloadMp.started_at = nowIso;
    if (mpStatus === 'finished' || mpStatus === 'cancelled') payloadMp.ended_at = nowIso;

    const payloadQl = {
      status: qlStatus,
      current_question_index: currentQIndex,
      is_started: (qlStatus === 'in_progress'),
      is_finished: (qlStatus === 'completed')
    };

    if (supabaseClient) {
      try { await supabaseClient.from('multiplayer_games').update(payloadMp).eq('id', gameId); } catch (e) {}
      try { await supabaseClient.from('multiplayer_games').update(payloadMp).eq('room_code', gameId); } catch (e) {}
      try { await supabaseClient.from('quiz_lobbies').update(payloadQl).eq('id', gameId); } catch (e) {}
      try { await supabaseClient.from('quiz_lobbies').update(payloadQl).eq('access_code', gameId); } catch (e) {}
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

    return null;
  },

  saveHostedGameAnalytics(data) {
    if (!data) return;
    try {
      localStorage.setItem('nexus_latest_hosted_game_analytics', JSON.stringify(data));
    } catch (e) {
      console.warn('Error saving hosted game analytics:', e);
    }
  },

  getLatestHostedGameAnalytics() {
    try {
      const raw = localStorage.getItem('nexus_latest_hosted_game_analytics');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
};

if (typeof window !== 'undefined') {
  window.DB = DB;
  window.db = DB;
  if (typeof App !== 'undefined') {
    App.db = DB;
    App.DB = DB;
  }
}


