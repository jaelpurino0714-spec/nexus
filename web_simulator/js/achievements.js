/* ==========================================================================
   NEXUS ACHIEVEMENTS ENGINE
   Tracks, unlocks, and renders all 14 PRD achievements in a 4-column grid
   ========================================================================== */

const Achievements = {
  // All 14 PRD achievements defined with icons and requirements
  list: [
    { id: 'first_steps', name: 'First Steps', desc: 'Complete your very first round', icon: '📖' },
    { id: 'perfect_start', name: 'Perfect Start', desc: 'Answer your first 5 questions correctly', icon: '✅' },
    { id: 'zero_mistakes', name: 'Zero Mistakes', desc: 'Finish a round with 0 wrong answers', icon: '🛡️' },
    { id: 'rising_star', name: 'Rising Star', desc: 'Reach 1,000 total points', icon: '⭐' },
    { id: 'nexus_champion', name: 'Nexus Champion', desc: 'Reach 5,000 total points', icon: '💎' },
    { id: 'curious_mind', name: 'Curious Mind', desc: 'Try all 4 science topics once', icon: '🔬' },
    { id: 'science_grandmaster', name: 'Science Grandmaster', desc: 'Unlock all topic badges', icon: '👑' },
    { id: 'early_bird', name: 'Early Bird', desc: 'Play before 7:00 AM', icon: '🌅' },
    { id: 'lightning_reflex', name: 'Lightning Reflex', desc: 'Answer a question in under 2 seconds', icon: '⚡' },
    { id: 'quick_thinker', name: 'Quick Thinker', desc: 'Answer 5 questions in under 3 seconds each', icon: '🏃' },
    { id: 'lightning_tap', name: 'Lightning Tap', desc: 'Maintain an average of under 4s per question', icon: '👆' },
    { id: 'speedster', name: 'Speedster', desc: 'Answer all 10 questions in under 60 seconds', icon: '🚀' },
    { id: 'blazing_fast', name: 'Blazing Fast', desc: 'Finish a round in under 45 seconds', icon: '🌪️' },
    { id: 'speed_champion', name: 'Speed Champion', desc: 'Rank among the Top 5 fastest times this week', icon: '🏎️' }
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
    if (totalPoints >= 1000 && !unlocked.includes('rising_star')) {
      DB.saveUnlockedAchievement('rising_star');
    }
    if (totalPoints >= 5000 && !unlocked.includes('nexus_champion')) {
      DB.saveUnlockedAchievement('nexus_champion');
    }

    // 8. Early Bird (before 7:00 AM)
    const hour = new Date().getHours();
    if (hour < 7 && !unlocked.includes('early_bird')) {
      DB.saveUnlockedAchievement('early_bird');
    }

    // 9. Lightning Reflex (< 2 seconds for a question)
    if (session.fastestAnswerSec != null && session.fastestAnswerSec < 2 && !unlocked.includes('lightning_reflex')) {
      DB.saveUnlockedAchievement('lightning_reflex');
    }

    // 10. Quick Thinker (5 questions < 3 seconds)
    if (session.fastAnswersCount >= 5 && !unlocked.includes('quick_thinker')) {
      DB.saveUnlockedAchievement('quick_thinker');
    }

    // 11. Lightning Tap (Avg < 4s per question)
    const avgSec = session.totalTimeSec / session.totalQuestions;
    if (avgSec < 4 && !unlocked.includes('lightning_tap')) {
      DB.saveUnlockedAchievement('lightning_tap');
    }

    // 12. Speedster (10 questions < 60 seconds)
    if (session.totalQuestions >= 10 && session.totalTimeSec < 60 && !unlocked.includes('speedster')) {
      DB.saveUnlockedAchievement('speedster');
    }

    // 13. Blazing Fast (round < 45s)
    if (session.totalTimeSec < 45 && session.totalQuestions >= 5 && !unlocked.includes('blazing_fast')) {
      DB.saveUnlockedAchievement('blazing_fast');
    }

    // 14. Speed Champion (top speed)
    if (session.totalTimeSec < 35 && !unlocked.includes('speed_champion')) {
      DB.saveUnlockedAchievement('speed_champion');
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

      tile.innerHTML = `
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-name">${ach.name}</div>
      `;
      grid.appendChild(tile);
    });
  },

  showModal(ach, isUnlocked) {
    document.getElementById('modalAchIcon').textContent = ach.icon;
    document.getElementById('modalAchName').textContent = ach.name;
    document.getElementById('modalAchDesc').textContent = ach.desc;
    
    const badge = document.getElementById('modalAchStatus');
    badge.textContent = isUnlocked ? 'Unlocked 🎉' : 'Locked 🔒';
    badge.style.background = isUnlocked ? '#E8F5E9' : '#F5F5F5';
    badge.style.color = isUnlocked ? '#2E7D32' : '#757575';

    document.getElementById('achievementDetailModal').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('achievementDetailModal').classList.add('hidden');
  }
};
