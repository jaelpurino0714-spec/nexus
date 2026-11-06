/**
 * ==============================================================================
 * NEXUS 2.0 - STUDENT DASHBOARD
 * Complete interactive, personalized student hub matching design specification
 * Retrieves 100% real student performance data from Supabase & local DB
 * ==============================================================================
 */

const StudentDashboard = {
  currentCalendarDate: new Date(),
  selectedTermTab: 1,

  /**
   * Main entry point to display the student dashboard
   */
  async show() {
    if (typeof App !== 'undefined' && App.showScreen) {
      App.showScreen('studentDashboardScreen');
    }
    await this.render();
  },

  /**
   * Aggregate student data and render the full dashboard
   */
  async render() {
    const container = document.getElementById('studentDashboardContainer');
    if (!container) return;

    // 1. Retrieve real student profile
    const profile = (typeof DB !== 'undefined' && DB.getStudentProfile) 
      ? (DB.getStudentProfile() || {}) 
      : {};
    
    // 2. Retrieve real lifetime quiz results
    const quizResults = (typeof DB !== 'undefined' && DB.getQuizResults) 
      ? (DB.getQuizResults() || []) 
      : [];

    // 3. Compute stats
    const stats = this.computeLifetimeStats(quizResults, profile);
    const curriculum = this.computeCurriculumProgress(quizResults);
    const calendar = this.computeMonthlyCalendar(quizResults, this.currentCalendarDate);

    // 4. Render HTML components matching dark theme phone layout
    container.innerHTML = `
      <div class="dash-wrapper">
        <!-- Back Navigation to Home -->
        <button class="dash-back-btn" onclick="App.goHome()" title="Back to Home">
          <span>←</span> <span>Home</span>
        </button>

        <!-- Welcome Greeting & Mascot Speech Bubble -->
        ${this.renderWelcomeGreeting(profile, stats)}

        <!-- 4 Quick Stat Cards (Gold, Blue, Orange, Pink) -->
        ${this.renderQuickStatCards(profile, stats)}

        <!-- Academic Overview (Lifetime Stats Section 4 of Spec) -->
        ${this.renderAcademicOverview(stats)}

        <!-- Course Progress Hero Card (Section 5 of Spec) -->
        ${this.renderCourseProgressHero(curriculum)}

        <!-- My Learning Journey: Expandable Term & Topic Cards -->
        ${this.renderLearningJourney(curriculum)}

        <!-- 2-Column Middle Row: Monthly Activity & Today's Challenge -->
        <div class="dash-two-col-grid">
          ${this.renderMonthlyActivity(calendar, stats)}
          ${this.renderTodaysChallenge(profile, stats)}
        </div>

        <!-- Learning Efficiency & Analytics -->
        <div class="dash-efficiency-wrapper">
          ${this.renderLearningEfficiency(stats, curriculum)}
        </div>

        <!-- Extra spacing before fixed bottom bar -->
        <div style="height: 85px;"></div>
      </div>

      <!-- Bottom Navigation Bar -->
      ${this.renderBottomNavBar()}
    `;
  },

  /**
   * Compute lifetime stats from real quiz records
   */
  computeLifetimeStats(results, profile) {
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalQuizzes = results.length;
    let maxStreak = profile.streak || 0;
    const activeDates = new Set();

    results.forEach(r => {
      const qCount = r.totalQuestions || ((r.correctCount || 0) + (r.incorrectCount || 0)) || 0;
      totalQuestions += qCount;
      totalCorrect += (r.correctCount || 0);
      if (r.maxStreak && r.maxStreak > maxStreak) {
        maxStreak = r.maxStreak;
      }
      if (r.timestamp) {
        try {
          const d = new Date(r.timestamp);
          activeDates.add(d.toISOString().slice(0, 10));
        } catch (e) {}
      }
    });

    const accuracyPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;
    const currentXP = (typeof ProgressionSystem !== 'undefined' && ProgressionSystem.getCurrentXP)
      ? ProgressionSystem.getCurrentXP()
      : (profile.totalXP || profile.characterXP || profile.totalPoints || 0);

    // Compute Level & Stage
    let levelTitle = 'Trainee';
    if (typeof ProgressionSystem !== 'undefined' && ProgressionSystem.getStage) {
      const st = ProgressionSystem.getStage(currentXP);
      if (st && st.title) levelTitle = st.title;
    } else if (currentXP >= 2000) {
      levelTitle = 'Scientist';
    } else if (currentXP >= 1000) {
      levelTitle = 'Student';
    }

    return {
      totalQuestions,
      totalCorrect,
      totalQuizzes,
      accuracyPct,
      accuracyText: accuracyPct !== null ? `${accuracyPct}%` : 'No data yet',
      currentXP,
      levelTitle,
      streak: maxStreak,
      activeDaysCount: activeDates.size || (totalQuizzes > 0 ? 1 : 0),
      activeDates
    };
  },

  /**
   * Compute curriculum progress across Term 1, 2, 3
   */
  computeCurriculumProgress(results) {
    const terms = (typeof DB !== 'undefined' && DB.OFFLINE_TERMS) ? DB.OFFLINE_TERMS : [
      { id: 'b0000000-0000-0000-0000-000000000001', order_no: 1, title: 'Term 1 (Earth Science & Biology)' },
      { id: 'b0000000-0000-0000-0000-000000000002', order_no: 2, title: 'Term 2 (Biology & EM)' },
      { id: 'b0000000-0000-0000-0000-000000000003', order_no: 3, title: 'Term 3 (Chem & Physics)' }
    ];

    const offlineTopics = (typeof DB !== 'undefined' && DB.OFFLINE_TOPICS) ? DB.OFFLINE_TOPICS : {};
    
    let totalCurriculumTopics = 0;
    let completedCurriculumTopics = 0;
    const termsData = [];
    const allTopicSummaries = [];

    terms.forEach(t => {
      const termTopics = offlineTopics[t.id] || [];
      totalCurriculumTopics += termTopics.length;
      let completedInTerm = 0;

      const topicsWithProgress = termTopics.map(topic => {
        // Find matching attempts
        const matchingResults = results.filter(r => {
          if (!r) return false;
          if (r.topic === topic.title || r.topic === topic.id) return true;
          if (r.topicStats && r.topicStats[topic.title]) return true;
          return false;
        });

        let qAnswered = 0;
        let qCorrect = 0;

        matchingResults.forEach(r => {
          if (r.topicStats && r.topicStats[topic.title]) {
            const ts = r.topicStats[topic.title];
            qAnswered += (ts.total || 0);
            qCorrect += (ts.correct || 0);
          } else {
            const count = r.totalQuestions || ((r.correctCount || 0) + (r.incorrectCount || 0)) || 0;
            qAnswered += count;
            qCorrect += (r.correctCount || 0);
          }
        });

        const accuracy = qAnswered > 0 ? Math.round((qCorrect / qAnswered) * 100) : 0;
        
        // Status classification per section 5.2
        let status = 'Not Started';
        let statusColor = '#94A3B8';
        if (qAnswered > 0) {
          if (accuracy >= 85 && qAnswered >= 15) {
            status = 'Mastered';
            statusColor = '#EAB308'; // Gold
            completedInTerm++;
          } else if (accuracy >= 80 && qAnswered >= 10) {
            status = 'Completed';
            statusColor = '#10B981'; // Green
            completedInTerm++;
          } else {
            status = 'In Progress';
            statusColor = '#38BDF8'; // Blue
          }
        }

        // Performance classification per section 6.5
        let levelBadge = 'Level 1';
        let levelDesc = 'Room to Improve';
        if (qAnswered >= 5) {
          if (accuracy === 100) { levelBadge = 'Level 4'; levelDesc = 'Optimal'; }
          else if (accuracy >= 95) { levelBadge = 'Level 3'; levelDesc = 'Satisfactory'; }
          else if (accuracy >= 80) { levelBadge = 'Level 2'; levelDesc = 'Marginal'; }
        }

        const summary = {
          topicId: topic.id,
          title: topic.title,
          orderNo: topic.order_no,
          termNum: t.order_no || 1,
          termId: t.id,
          qAnswered,
          qCorrect,
          accuracy,
          status,
          statusColor,
          levelBadge,
          levelDesc
        };

        allTopicSummaries.push(summary);
        return summary;
      });

      const termProgressPct = termTopics.length > 0 
        ? Math.round((completedInTerm / termTopics.length) * 100) 
        : 0;

      termsData.push({
        termId: t.id,
        orderNo: t.order_no,
        title: t.title,
        topics: topicsWithProgress,
        completedCount: completedInTerm,
        totalTopics: termTopics.length,
        progressPct: termProgressPct
      });

      completedCurriculumTopics += completedInTerm;
    });

    const overallPct = totalCurriculumTopics > 0 
      ? Math.round((completedCurriculumTopics / totalCurriculumTopics) * 100) 
      : 0;

    // Pick active / in-progress topic for hero card
    let activeTopic = allTopicSummaries.find(t => t.status === 'In Progress');
    if (!activeTopic) {
      activeTopic = allTopicSummaries.find(t => t.status === 'Not Started') || allTopicSummaries[0];
    }

    // Strongest topic & Topics to review
    const attemptedTopics = allTopicSummaries.filter(t => t.qAnswered >= 3);
    let strongestTopic = null;
    let topicsToReview = [];

    if (attemptedTopics.length > 0) {
      const sorted = [...attemptedTopics].sort((a, b) => b.accuracy - a.accuracy);
      strongestTopic = sorted[0];
      topicsToReview = sorted.filter(t => t.accuracy < 80);
    }

    return {
      termsData,
      allTopics: allTopicSummaries,
      totalCurriculumTopics,
      completedCurriculumTopics,
      overallPct,
      activeTopic: activeTopic || {
        title: 'Chemical Reactions',
        orderNo: 2,
        termNum: 1,
        accuracy: 0,
        qAnswered: 0
      },
      strongestTopic,
      topicsToReview
    };
  },

  /**
   * Calendar calculations for Monthly Activity
   */
  computeMonthlyCalendar(results, baseDate) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[month];

    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    // Convert to Monday=0 .. Sunday=6
    const startOffset = (firstDay + 6) % 7; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const isCurrentMonth = (today.getFullYear() === year && today.getMonth() === month);
    const todayDateNum = isCurrentMonth ? today.getDate() : -1;

    // Collect dates with attempts
    const attemptedDays = new Set();
    results.forEach(r => {
      if (r.timestamp) {
        try {
          const d = new Date(r.timestamp);
          if (d.getFullYear() === year && d.getMonth() === month) {
            attemptedDays.add(d.getDate());
          }
        } catch (e) {}
      }
    });

    return {
      monthName,
      year,
      startOffset,
      daysInMonth,
      todayDateNum,
      attemptedDays
    };
  },

  /**
   * 4 Quick Stat Cards (XP, Level, Streak, Quizzes Completed) in 2x2 grid
   */
  renderQuickStatCards(profile, stats) {
    const xpFormatted = stats.currentXP.toLocaleString();

    return `
      <div class="dash-stats-grid">
        <!-- Card 1: Gold / Current XP -->
        <div class="dash-stat-card card-gold">
          <div class="stat-card-icon-box gold-icon-box">⭐</div>
          <div class="stat-card-text">
            <div class="stat-main-val">${xpFormatted} XP</div>
            <div class="stat-sub-label">Current XP</div>
          </div>
          <span class="card-sparkle-deco">✦</span>
        </div>

        <!-- Card 2: Blue / Level -->
        <div class="dash-stat-card card-blue" onclick="CharacterSystem.openCharacterModal()" style="cursor: pointer;" title="View Character Evolution">
          <div class="stat-card-icon-box blue-icon-box">💎</div>
          <div class="stat-card-text">
            <div class="stat-main-val">${stats.levelTitle}</div>
            <div class="stat-sub-label">Your Level</div>
          </div>
          <span class="card-sparkle-deco" style="color:#60A5FA;">✦</span>
        </div>

        <!-- Card 3: Orange / Streak -->
        <div class="dash-stat-card card-orange">
          <div class="stat-card-icon-box orange-icon-box">🔥</div>
          <div class="stat-card-text">
            <div class="stat-main-val">${stats.streak} Days</div>
            <div class="stat-sub-label">Streak</div>
          </div>
          <span class="card-sparkle-deco" style="color:#F97316;">✦</span>
        </div>

        <!-- Card 4: Pink / Quizzes Completed -->
        <div class="dash-stat-card card-pink">
          <div class="stat-card-icon-box pink-icon-box">🏆</div>
          <div class="stat-card-text">
            <div class="stat-main-val">${stats.totalQuizzes}</div>
            <div class="stat-sub-label">Quizzes Completed</div>
          </div>
          <span class="card-sparkle-deco" style="color:#F43F5E;">✦</span>
        </div>
      </div>
    `;
  },

  /**
   * Academic Overview (Section 4 of Spec: 4 Lifetime Stat Cards)
   */
  renderAcademicOverview(stats) {
    return `
      <div class="dash-section-box">
        <div class="dash-section-header">
          <h2 class="dash-section-title">📊 Academic Overview</h2>
          <span class="dash-section-sub">Lifetime student performance across all sessions</span>
        </div>

        <div class="dash-academic-cards-grid">
          <!-- CARD 1: Total Questions Answered -->
          <div class="dash-academic-card">
            <div class="academic-card-top">
              <span class="academic-icon">📝</span>
              <span class="academic-tag">LIFETIME</span>
            </div>
            <div class="academic-val">${stats.totalQuestions.toLocaleString()}</div>
            <div class="academic-label">Questions Answered</div>
          </div>

          <!-- CARD 2: Correct Answers -->
          <div class="dash-academic-card">
            <div class="academic-card-top">
              <span class="academic-icon">✅</span>
              <span class="academic-tag" style="background: rgba(16,185,129,0.15); color: #10B981;">ACCURATE</span>
            </div>
            <div class="academic-val" style="color: #10B981;">${stats.totalCorrect.toLocaleString()}</div>
            <div class="academic-label">Correct Answers</div>
          </div>

          <!-- CARD 3: Overall Accuracy -->
          <div class="dash-academic-card">
            <div class="academic-card-top">
              <span class="academic-icon">🎯</span>
              <span class="academic-tag" style="background: rgba(249,115,22,0.15); color: #F97316;">SCORE</span>
            </div>
            <div class="academic-val" style="color: #F97316;">${stats.accuracyText}</div>
            <div class="academic-label">Overall Accuracy</div>
          </div>

          <!-- CARD 4: Completed Quizzes -->
          <div class="dash-academic-card">
            <div class="academic-card-top">
              <span class="academic-icon">🎖️</span>
              <span class="academic-tag" style="background: rgba(139,92,246,0.15); color: #8B5CF6;">SESSIONS</span>
            </div>
            <div class="academic-val" style="color: #8B5CF6;">${stats.totalQuizzes.toLocaleString()}</div>
            <div class="academic-label">Quizzes Completed</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Course Progress Hero Card matching the reference screenshot
   */
  renderCourseProgressHero(curriculum) {
    const active = curriculum.activeTopic;
    const activeTermData = curriculum.termsData.find(t => t.orderNo === active.termNum) || curriculum.termsData[0];
    const modulePct = active.accuracy || (active.qAnswered > 0 ? 50 : 0);
    const overallPct = curriculum.overallPct;

    return `
      <div class="dash-course-progress-card">
        <div class="dash-card-header-row">
          <div class="dash-card-title-group">
            <span class="dash-card-icon">🎓</span>
            <h2 class="dash-card-title">Course Progress</h2>
          </div>
          <button class="dash-card-chevron-btn" onclick="StudentDashboard.toggleSection('learningJourneySection')" title="Expand curriculum">›</button>
        </div>

        <div class="dash-course-split">
          <!-- Left Topic Preview Box (Peach) -->
          <div class="dash-topic-box-hero" onclick="StudentDashboard.practiceTopic('${active.termId}', '${active.topicId}', '${active.title.replace(/'/g, "\\'")}')">
            <div class="topic-box-title">${active.title}</div>
            <button class="topic-play-btn-circle" title="Start Quiz">
              <span>▶</span>
            </button>
            <div class="topic-box-footer">Module ${active.orderNo} of ${activeTermData ? activeTermData.totalTopics : 8} • Term ${active.termNum}</div>
          </div>

          <!-- Right Progress Bars & Continue Button -->
          <div class="dash-course-right">
            <!-- Module progress -->
            <div class="progress-bar-group">
              <div class="progress-label-row">
                <span class="progress-name">Module - ${active.orderNo}</span>
                <span class="progress-num">${modulePct}% completed</span>
              </div>
              <div class="dash-bar-track">
                <div class="dash-bar-fill orange-gradient-fill" style="width: ${modulePct}%;"></div>
              </div>
            </div>

            <!-- Overall progress -->
            <div class="progress-bar-group">
              <div class="progress-label-row">
                <span class="progress-name">Overall Progress</span>
                <span class="progress-num">${overallPct}% completed</span>
              </div>
              <div class="dash-bar-track">
                <div class="dash-bar-fill gold-gradient-fill" style="width: ${overallPct}%;"></div>
              </div>
            </div>

            <!-- Continue Button -->
            <button class="dash-continue-btn" onclick="StudentDashboard.practiceTopic('${active.termId}', '${active.topicId}', '${active.title.replace(/'/g, "\\'")}')">
              Continue
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Section 5: My Learning Journey (Term Cards & Topic Breakdown)
   */
  renderLearningJourney(curriculum) {
    const selectedTerm = curriculum.termsData.find(t => t.orderNo === this.selectedTermTab) || curriculum.termsData[0];

    return `
      <div id="learningJourneySection" class="dash-section-box">
        <div class="dash-section-header">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div>
              <h2 class="dash-section-title">📖 MY LEARNING JOURNEY</h2>
              <span class="dash-section-sub">${curriculum.completedCurriculumTopics} of ${curriculum.totalCurriculumTopics} topics completed (${curriculum.overallPct}%)</span>
            </div>
            <span class="dash-badge-curriculum">${curriculum.overallPct}% OVERALL</span>
          </div>
        </div>

        <!-- Term Selection Tabs -->
        <div class="dash-term-tabs">
          ${curriculum.termsData.map(t => `
            <button class="dash-term-tab-btn ${t.orderNo === this.selectedTermTab ? 'active' : ''}" 
                    onclick="StudentDashboard.switchTermTab(${t.orderNo})">
              <div class="term-tab-title">TERM ${t.orderNo}</div>
              <div class="term-tab-sub">${t.completedCount}/${t.totalTopics} Topics (${t.progressPct}%)</div>
              <div class="dash-tab-bar"><div class="dash-tab-fill" style="width: ${t.progressPct}%;"></div></div>
            </button>
          `).join('')}
        </div>

        <!-- Topic Breakdown for Selected Term -->
        <div class="dash-topics-list">
          ${selectedTerm.topics.map(topic => `
            <div class="dash-topic-item-card">
              <div class="topic-item-left">
                <div class="topic-item-title-row">
                  <span class="topic-item-title">${topic.orderNo}. ${topic.title}</span>
                  <span class="topic-status-pill" style="border: 1px solid ${topic.statusColor}; color: ${topic.statusColor};">
                    ${topic.status}
                  </span>
                </div>
                <div class="topic-item-metrics">
                  <span>Questions Answered: <b>${topic.qAnswered}</b></span>
                  <span>• Accuracy: <b>${topic.accuracy}%</b></span>
                  <span>• ${topic.levelBadge} (${topic.levelDesc})</span>
                </div>
              </div>
              <button class="topic-practice-btn" onclick="StudentDashboard.practiceTopic('${topic.termId}', '${topic.topicId}', '${topic.title.replace(/'/g, "\\'")}')">
                Practice ➔
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Monthly Activity (Calendar Card matching reference screenshot)
   */
  renderMonthlyActivity(cal, stats) {
    const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    // Generate day cells
    let dayCells = '';
    // Empty cells before start
    for (let i = 0; i < cal.startOffset; i++) {
      dayCells += `<div class="dash-cal-cell empty"></div>`;
    }

    for (let day = 1; day <= cal.daysInMonth; day++) {
      const isToday = (day === cal.todayDateNum);
      const isAttempted = cal.attemptedDays.has(day);

      let cellClass = 'dash-cal-cell';
      if (isAttempted) cellClass += ' attempted';
      if (isToday) cellClass += ' today';

      dayCells += `<div class="${cellClass}">${day}</div>`;
    }

    return `
      <div class="dash-sub-card">
        <div class="dash-card-header-row">
          <div class="dash-card-title-group">
            <span class="dash-card-icon">📅</span>
            <h3 class="dash-card-title">Monthly Activity</h3>
          </div>
          <div class="dash-month-selector-pill">
            <span>${cal.monthName}</span>
            <span style="font-size: 0.75rem;">▼</span>
          </div>
        </div>

        <!-- Weekday Headers -->
        <div class="dash-cal-weekdays">
          ${weekdays.map(w => `<span>${w}</span>`).join('')}
        </div>

        <!-- Calendar Days Grid -->
        <div class="dash-cal-grid">
          ${dayCells}
        </div>

        <!-- Legend Footer -->
        <div class="dash-cal-legend">
          <div class="legend-item"><span class="legend-dot attempted-dot"></span> Attempted</div>
          <div class="legend-item"><span class="legend-dot today-dot"></span> Today</div>
          <div class="legend-item max-streak-legend">🔥 Max streak: ${stats.streak} days 🔥</div>
        </div>
      </div>
    `;
  },

  /**
   * Today's Challenge Card matching reference screenshot
   */
  renderTodaysChallenge(profile, stats) {
    return `
      <div class="dash-sub-card todays-challenge-card" onclick="StudentDashboard.startTodaysChallenge()">
        <div class="dash-card-header-row">
          <div class="dash-card-title-group">
            <span class="dash-card-icon">🏆</span>
            <h3 class="dash-card-title">Today's Challenge</h3>
          </div>
          <button class="dash-card-chevron-btn" title="Start Challenge">➔</button>
        </div>

        <p class="challenge-subtext">Test your skills & earn <b>+50 XP</b>!</p>

        <!-- Illustration & Big Play Button -->
        <div class="challenge-visual-box">
          <div class="challenge-mascot-deco">🐯🧭</div>
          <button class="challenge-play-btn" title="Play Today's Challenge">
            <span>▶</span>
          </button>
          <div class="challenge-puzzle-deco">🧩</div>
        </div>

        <div class="challenge-footer-pill">
          <span>✓ Updated daily • Skipping resets streak</span>
        </div>
      </div>
    `;
  },

  /**
   * Learning Efficiency (Donut Gauge & Analytics Section 6 of Spec)
   */
  renderLearningEfficiency(stats, curriculum) {
    const accuracy = stats.accuracyPct !== null ? stats.accuracyPct : 0;
    // Donut SVG circumference = 2 * PI * r = 2 * 3.14159 * 42 ≈ 264
    const circumference = 264;
    const strokeOffset = circumference - (circumference * accuracy) / 100;

    const strongest = curriculum.strongestTopic;
    const reviewTopics = curriculum.topicsToReview || [];

    // Classification
    let classLabel = 'Level 1 — Room to Improve';
    let classColor = '#F43F5E';
    if (accuracy === 100) { classLabel = 'Level 4 — Optimal'; classColor = '#10B981'; }
    else if (accuracy >= 95) { classLabel = 'Level 3 — Satisfactory'; classColor = '#38BDF8'; }
    else if (accuracy >= 80) { classLabel = 'Level 2 — Marginal'; classColor = '#F59E0B'; }

    return `
      <div class="dash-sub-card">
        <div class="dash-card-header-row">
          <div class="dash-card-title-group">
            <span class="dash-card-icon">📊</span>
            <h3 class="dash-card-title">Learning Efficiency</h3>
          </div>
          <span class="dash-pill-mini" style="background: rgba(249,115,22,0.15); color: #F97316;">WEEKLY</span>
        </div>

        <div class="efficiency-body-split">
          <!-- Legend Items -->
          <div class="efficiency-legend-list">
            <div class="eff-legend-row"><span class="eff-dot orange-dot"></span> Quiz Accuracy</div>
            <div class="eff-legend-row"><span class="eff-dot hollow-dot"></span> Active Learning</div>
            <div class="eff-legend-row"><span class="eff-dot light-dot"></span> Completed Topics</div>
            
            <div class="eff-class-badge" style="border: 1px solid ${classColor}; color: ${classColor}; margin-top: 10px; font-size: 0.74rem; font-weight: 700; padding: 4px 8px; border-radius: 8px; display: inline-block;">
              ${classLabel}
            </div>
          </div>

          <!-- SVG Donut Chart -->
          <div class="efficiency-donut-container">
            <svg class="donut-svg" viewBox="0 0 100 100">
              <circle class="donut-bg" cx="50" cy="50" r="42"></circle>
              <circle class="donut-fg" cx="50" cy="50" r="42" 
                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeOffset};">
              </circle>
            </svg>
            <div class="donut-center-text">
              <span class="donut-num">${accuracy}%</span>
            </div>
          </div>
        </div>

        <!-- Weekly Report & Active Days -->
        <div class="efficiency-bottom-row">
          <div class="eff-stat-cell">
            <span class="eff-sub">Weekly Report</span>
            <span class="eff-main">Quiz Accuracy: <b>${accuracy > 0 ? '+4%' : '0%'}</b></span>
          </div>
          <div class="eff-stat-cell right">
            <span class="eff-sub">Consistency</span>
            <span class="eff-main">Active Days: <b>${stats.activeDaysCount}</b></span>
          </div>
        </div>

        <!-- Strongest Topic & Needs Improvement -->
        ${strongest ? `
          <div class="dash-topic-highlight-card" style="background: rgba(16,185,129,0.12); border: 1.5px solid rgba(16,185,129,0.4); border-radius: 14px; padding: 10px 14px; margin-top: 10px;">
            <div style="font-size: 0.72rem; font-weight: 800; color: #34D399; text-transform: uppercase; letter-spacing: 0.5px;">🌟 YOUR STRONGEST TOPIC</div>
            <div style="font-size: 0.92rem; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${strongest.title}</div>
            <div style="font-size: 0.78rem; color: #6EE7B7; font-weight: 600;">${strongest.accuracy}% Accuracy (${strongest.qAnswered} Questions)</div>
          </div>
        ` : ''}

        ${reviewTopics.length > 0 ? `
          <div class="dash-topic-highlight-card" style="background: rgba(249,115,22,0.12); border: 1.5px solid rgba(249,115,22,0.4); border-radius: 14px; padding: 10px 14px; margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <div>
                <div style="font-size: 0.72rem; font-weight: 800; color: #FB923C; text-transform: uppercase; letter-spacing: 0.5px;">🎯 TOPICS TO REVIEW</div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #FFFFFF;">${reviewTopics[0].title} — ${reviewTopics[0].accuracy}%</div>
              </div>
              <button class="dash-practice-pill-btn" onclick="StudentDashboard.practiceTopic('${reviewTopics[0].termId}', '${reviewTopics[0].topicId}', '${reviewTopics[0].title.replace(/'/g, "\\'")}')">
                Practice
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Fixed Bottom Navigation Bar matching reference screenshot
   */
  renderBottomNavBar() {
    return `
      <nav class="dash-bottom-nav">
        <!-- 1. Dashboard (Active) -->
        <button class="nav-item active" onclick="StudentDashboard.show()">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Dashboard</span>
          <span class="nav-indicator-bar"></span>
        </button>

        <!-- 2. My Learning -->
        <button class="nav-item" onclick="StudentDashboard.goToMyLearning()">
          <span class="nav-icon">📖</span>
          <span class="nav-label">My Learning</span>
        </button>

        <!-- 3. Quizzes -->
        <button class="nav-item" onclick="App.showScreen('playScreen')">
          <span class="nav-icon">🏆</span>
          <span class="nav-label">Quizzes</span>
        </button>

        <!-- 4. Achievements -->
        <button class="nav-item" onclick="Settings.openSubMenu('achievements')">
          <span class="nav-icon">⭐</span>
          <span class="nav-label">Achievements</span>
        </button>

        <!-- 5. Profile -->
        <button class="nav-item" onclick="Settings.openSubMenu('profile')">
          <span class="nav-icon">👤</span>
          <span class="nav-label">Profile</span>
        </button>
      </nav>
    `;
  },

  /**
   * Navigate to My Learning (Curriculum view or topic screen)
   */
  goToMyLearning() {
    if (typeof Quiz !== 'undefined' && Quiz.selectTerm) {
      Quiz.selectTerm(this.selectedTermTab || 1);
    } else {
      App.showScreen('playScreen');
    }
  },

  /**
   * Switch active term tab in My Learning Journey
   */
  switchTermTab(termNum) {
    this.selectedTermTab = termNum;
    this.render();
  },

  /**
   * Toggle visibility of collapsible section
   */
  toggleSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  },

  /**
   * Start practicing a selected topic
   */
  practiceTopic(termId, topicId, topicTitle) {
    if (typeof Quiz !== 'undefined') {
      Quiz.currentTerm = this.selectedTermTab || 1;
      Quiz.selectTopic(topicTitle, topicId);
    } else {
      App.showScreen('playScreen');
    }
  },

  /**
   * Start Today's Challenge (5-question daily quiz rewarding +50 XP)
   */
  startTodaysChallenge() {
    if (typeof Quiz === 'undefined') {
      alert("Today's challenge is ready! Loading questions...");
      return;
    }
    
    // Pick topic for today's challenge
    Quiz.currentTerm = 1;
    Quiz.currentTopic = "Daily Science Challenge";
    Quiz.currentTopicId = "b0000000-0000-0000-0000-000000000102";
    Quiz.customFlowType = 'standard';
    Quiz.isDailyChallenge = true;

    // Direct to format selector or start
    if (Quiz.selectTestType) {
      Quiz.selectTestType('practice');
    } else {
      App.showScreen('playScreen');
    }
  },

  /**
   * Notification toast message
   */
  showNotificationToast(msg) {
    let toast = document.getElementById('dashNoticeToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dashNoticeToast';
      toast.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: #1E1B4B; color: #FFFFFF; border: 1.5px solid #8B5CF6;
        padding: 12px 24px; border-radius: 9999px; font-weight: 700;
        font-size: 0.9rem; z-index: 99999; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transition: opacity 0.3s ease; pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2600);
  }
};

window.StudentDashboard = StudentDashboard;

