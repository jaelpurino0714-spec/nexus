/* ==========================================================================
   NEXUS ACHIEVEMENTS ENGINE
   Tracks, unlocks, and renders all 14 PRD achievements in a 4-column grid
   ========================================================================== */

const Achievements = {
  // All 14 PRD achievements defined with icons and requirements
  list: [
    {
      id: 'first_steps',
      name: 'First Steps',
      desc: 'Complete your first lesson',
      icon: '🚩',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`
    },
    {
      id: 'perfect_start',
      name: 'Perfect Start',
      desc: 'Score 100% on a lesson',
      icon: '✅',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`
    },
    {
      id: 'zero_mistakes',
      name: 'Zero Mistakes',
      desc: 'Get 0 mistakes in a quiz',
      icon: '0️⃣',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><text x="12" y="16.5" text-anchor="middle" font-size="13" font-weight="900" fill="#C084FC" stroke="none" font-family="sans-serif">0</text></svg>`
    },
    {
      id: 'rising_star',
      name: 'Rising Star',
      desc: 'Earn 100 points',
      icon: '⭐️',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F472B6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
    },
    {
      id: 'nexus_champion',
      name: 'Nexus Champion',
      desc: 'Earn 500 points',
      icon: '💎',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"></path><path d="M11 3 8 9l4 12 4-12-3-6"></path><path d="M2 9h20"></path></svg>`
    },
    {
      id: 'curious_mind',
      name: 'Curious Mind',
      desc: 'Explore all topics in a lesson',
      icon: '🔬',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"></path><path d="M3 22h18"></path><path d="M14 22a7 7 0 1 0-14 0"></path><path d="M9 14l6-8"></path><circle cx="17" cy="4" r="2"></circle></svg>`
    },
    {
      id: 'science_grandmaster',
      name: 'Science Grandmaster',
      desc: 'Earn 1000 points',
      icon: '👑',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>`
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      desc: 'Log in before 8:00 AM',
      icon: '🐦',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"></rect><path d="M16 8s-1.5 3-4 3c-1.5 0-3-1-3-2.5 0-2 2.5-3 5-2.5z"></path></svg>`
    },
    {
      id: 'lightning_reflex',
      name: 'Lightning Reflex',
      desc: 'Answer 10 quizzes in < 5 sec each',
      icon: '⚡️',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FDE047" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
    },
    {
      id: 'quick_thinker',
      name: 'Quick Thinker',
      desc: 'Answer 20 quizzes correctly',
      icon: '🧠',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z"></path></svg>`
    },
    {
      id: 'lightning_top',
      name: 'Lightning Top',
      desc: 'Be in top 3 on the leaderboard',
      icon: '🏆',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>`
    },
    {
      id: 'speedster',
      name: 'Speedster',
      desc: 'Complete a quiz in under 30 seconds',
      icon: '🚀',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z"></path></svg>`
    },
    {
      id: 'blazing_feast',
      name: 'Blazing Feast',
      desc: 'Maintain a 7-day learning streak',
      icon: '🔥',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3Z"></path></svg>`
    },
    {
      id: 'audio_speed_champion',
      name: 'Audio Speed Champion',
      desc: 'Use audio mode 10 times',
      icon: '🎙️',
      svgIcon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v4"></path><path d="M6 6v12"></path><path d="M10 3v18"></path><path d="M14 7v10"></path><path d="M18 5v14"></path><path d="M22 10v4"></path></svg>`
    }
  ],

  // Evaluate round session data against achievement conditions
  evaluateSession(session) {
    const unlocked = DB.getUnlockedAchievements();
    const profile = DB.getStudentProfile() || {};
    const allResults = DB.getQuizResults();

    // 1. First Steps
    if (!unlocked.includes('first_steps')) {
      DB.saveUnlockedAchievement('first_steps');
    }

    // 2. Perfect Start (First 5 correct in session)
    if (session.streak >= 5 && !unlocked.includes('perfect_start')) {
      DB.saveUnlockedAchievement('perfect_start');
    }

    // 3. Zero Mistakes
    if (session.incorrectCount === 0 && session.totalQuestions >= 5 && !unlocked.includes('zero_mistakes')) {
      DB.saveUnlockedAchievement('zero_mistakes');
    }

    // 4 & 5. Points milestones
    const totalPoints = (profile.totalPoints || 0) + session.scorePoints;
    if (totalPoints >= 100 && !unlocked.includes('rising_star')) {
      DB.saveUnlockedAchievement('rising_star');
    }
    if (totalPoints >= 500 && !unlocked.includes('nexus_champion')) {
      DB.saveUnlockedAchievement('nexus_champion');
    }

    // 8. Early Bird (before 8:00 AM)
    const hour = new Date().getHours();
    if (hour < 8 && !unlocked.includes('early_bird')) {
      DB.saveUnlockedAchievement('early_bird');
    }

    // 9. Lightning Reflex (< 5 seconds for a question)
    if (session.fastestAnswerSec != null && session.fastestAnswerSec < 5 && !unlocked.includes('lightning_reflex')) {
      DB.saveUnlockedAchievement('lightning_reflex');
    }

    // 10. Quick Thinker
    if (session.scorePoints >= 20 && !unlocked.includes('quick_thinker')) {
      DB.saveUnlockedAchievement('quick_thinker');
    }

    // 12. Speedster (under 30 seconds)
    if (session.totalTimeSec < 30 && !unlocked.includes('speedster')) {
      DB.saveUnlockedAchievement('speedster');
    }

    // 13. Blazing Feast (7-day streak)
    if (profile.streak >= 7 && !unlocked.includes('blazing_feast')) {
      DB.saveUnlockedAchievement('blazing_feast');
    }

    // 14. Audio Speed Champion
    if ((profile.audioModeCount || 0) >= 10 && !unlocked.includes('audio_speed_champion')) {
      DB.saveUnlockedAchievement('audio_speed_champion');
    }

    // 6. Curious Mind (tried all terms)
    const termsTried = new Set(allResults.map(r => r.term));
    termsTried.add(session.term);
    if (termsTried.size >= 3 && !unlocked.includes('curious_mind')) {
      DB.saveUnlockedAchievement('curious_mind');
    }

    // 7. Science Grandmaster (unlocked all other 13 badges)
    const currentUnlocked = DB.getUnlockedAchievements();
    if (currentUnlocked.length >= 13 && !currentUnlocked.includes('science_grandmaster')) {
      DB.saveUnlockedAchievement('science_grandmaster');
    }
  },

  // Render 4-Column Grid in Settings Submenu per PRD
  renderGrid() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    const unlocked = DB.getUnlockedAchievements();
    grid.innerHTML = '';

    this.list.forEach(ach => {
      const isUnlocked = unlocked.includes(ach.id);
      const tile = document.createElement('div');
      tile.className = `ach-tile ${isUnlocked ? 'unlocked' : 'locked'}`;
      tile.onclick = () => this.showModal(ach, isUnlocked);

      if (isUnlocked) {
        tile.innerHTML = `
          <div class="ach-icon-wrapper unlocked-icon-box">
            <span class="ach-emoji">${ach.icon}</span>
          </div>
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
        `;
      } else {
        tile.innerHTML = `
          <div class="ach-icon-wrapper locked-icon-box">
            ${ach.svgIcon}
          </div>
          <div class="ach-name">${ach.name}</div>
        `;
      }
      grid.appendChild(tile);
    });
  },

  showModal(ach, isUnlocked) {
    document.getElementById('modalAchIcon').innerHTML = isUnlocked ? `<span class="ach-emoji" style="font-size:3rem;">${ach.icon}</span>` : ach.svgIcon;
    document.getElementById('modalAchName').textContent = ach.name;
    document.getElementById('modalAchDesc').textContent = ach.desc;
    
    const badge = document.getElementById('modalAchStatus');
    badge.textContent = isUnlocked ? 'Unlocked 🎉' : 'Locked 🔒';
    badge.style.background = isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)';
    badge.style.color = isUnlocked ? '#34D399' : '#A5A3C4';
    badge.style.border = isUnlocked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)';

    document.getElementById('achievementDetailModal').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('achievementDetailModal').classList.add('hidden');
  }
};
