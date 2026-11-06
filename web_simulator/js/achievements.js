/* ==========================================================================
   NEXUS ACHIEVEMENTS ENGINE — 84 ACHIEVEMENTS
   6 Categories × 14 Achievements Each:
   1. Speedster (14)
   2. Live Competitor (14)
   3. Experimenter (14)
   4. Perfectionist (14)
   5. Knowledge Seeker (14)
   6. Pet Guardian (14)
   
   Features:
   - Dynamic progress tracking across sessions (e.g. 20% Complete (2/10))
   - 4-Tier Rarity System: Bronze, Silver, Gold, Platinum
   - Category filtering with tab indicators
   - Master progress summary header
   - Interactive preview modal with full stats & XP reward
   - Historical backfill from quiz attempts
   ========================================================================== */

const Achievements = {
  activeCategory: 'all',

  categories: [
    { id: 'all', name: 'All', icon: '🌟', count: 84 },
    { id: 'rankings', name: 'Achievement Rankings', icon: '👑', count: 84 },
    { id: 'speedster', name: 'Speedster', icon: '⚡', count: 14 },
    { id: 'live_competitor', name: 'Live Competitor', icon: '🏆', count: 14 },
    { id: 'experimenter', name: 'Experimenter', icon: '🔬', count: 14 },
    { id: 'perfectionist', name: 'Perfectionist', icon: '💎', count: 14 },
    { id: 'knowledge_seeker', name: 'Knowledge Seeker', icon: '📖', count: 14 },
    { id: 'pet_guardian', name: 'Pet Guardian', icon: '🐾', count: 14 }
  ],

  // All 84 official achievements
  list: [
  {
    "id": "speed_quick_thinker",
    "name": "Quick Thinker",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer your first question correctly in under 10 seconds.",
    "rarity": "bronze",
    "target": 1,
    "statKey": "correctUnder10s",
    "icon": "\u26a1",
    "color": "#CD7F32",
    "xp": 10,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_flash_mind",
    "name": "Flash Mind",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 5 questions correctly in under 10 seconds each.",
    "rarity": "bronze",
    "target": 5,
    "statKey": "correctUnder10s",
    "icon": "\ud83e\udde0",
    "color": "#CD7F32",
    "xp": 15,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_lightning_reflexes",
    "name": "Lightning Reflexes",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 10 questions correctly in under 7 seconds each.",
    "rarity": "bronze",
    "target": 10,
    "statKey": "correctUnder7s",
    "icon": "\u23f1\ufe0f",
    "color": "#CD7F32",
    "xp": 20,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_speed_demon",
    "name": "Speed Demon",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 20 questions correctly in under 5 seconds each.",
    "rarity": "silver",
    "target": 20,
    "statKey": "correctUnder5s",
    "icon": "\ud83d\ude80",
    "color": "#CBD5E1",
    "xp": 25,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_instant_genius",
    "name": "Instant Genius",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 5 consecutive questions correctly in under 3 seconds each.",
    "rarity": "silver",
    "target": 5,
    "statKey": "maxConsecutiveUnder3sStreak",
    "icon": "\ud83d\udca1",
    "color": "#CBD5E1",
    "xp": 30,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_rapid_responder",
    "name": "Rapid Responder",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 50 questions correctly within 10 seconds each.",
    "rarity": "silver",
    "target": 50,
    "statKey": "correctUnder10s",
    "icon": "\ud83c\udfc3",
    "color": "#CBD5E1",
    "xp": 35,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_blazing_fast",
    "name": "Blazing Fast",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 100 questions correctly within 5 seconds each.",
    "rarity": "gold",
    "target": 100,
    "statKey": "correctUnder5s",
    "icon": "\ud83d\udd25",
    "color": "#FBBF24",
    "xp": 45,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_quick_streak",
    "name": "Quick Streak",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Get 10 consecutive correct answers within the time limit.",
    "rarity": "silver",
    "target": 10,
    "statKey": "maxCorrectStreak",
    "icon": "\ud83c\udfaf",
    "color": "#CBD5E1",
    "xp": 30,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_first_to_know",
    "name": "First to Know",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Be the first player to answer correctly in 5 live quiz rounds.",
    "rarity": "gold",
    "target": 5,
    "statKey": "liveFirstToAnswerCount",
    "icon": "\ud83e\udd47",
    "color": "#FBBF24",
    "xp": 40,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_faster_than_light",
    "name": "Faster Than Light",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 25 questions correctly in under 3 seconds each.",
    "rarity": "gold",
    "target": 25,
    "statKey": "correctUnder3s",
    "icon": "\u26a1\ufe0f",
    "color": "#FBBF24",
    "xp": 50,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_swift_scholar",
    "name": "Swift Scholar",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 250 questions correctly within 10 seconds each.",
    "rarity": "gold",
    "target": 250,
    "statKey": "correctUnder10s",
    "icon": "\ud83d\udcda",
    "color": "#FBBF24",
    "xp": 60,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_time_master",
    "name": "Time Master",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Maintain an average correct-answer response time of 5 seconds or less across 50 questions.",
    "rarity": "platinum",
    "target": 50,
    "statKey": "timeMasterCount",
    "icon": "\u23f3",
    "color": "#38BDF8",
    "xp": 75,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_sonic_mind",
    "name": "Sonic Mind",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 500 questions correctly within 5 seconds each.",
    "rarity": "platinum",
    "target": 500,
    "statKey": "correctUnder5s",
    "icon": "\ud83c\udf00",
    "color": "#38BDF8",
    "xp": 85,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "speed_the_flash",
    "name": "The Flash",
    "category": "speedster",
    "categoryName": "Speedster",
    "categoryIcon": "\u26a1",
    "desc": "Answer 1,000 questions correctly within 5 seconds each.",
    "rarity": "platinum",
    "target": 1000,
    "statKey": "correctUnder5s",
    "icon": "\u26a1",
    "color": "#38BDF8",
    "xp": 100,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
  },
  {
    "id": "live_first_appearance",
    "name": "First Appearance",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Join your first live quiz.",
    "rarity": "bronze",
    "target": 1,
    "statKey": "liveQuizzesJoined",
    "icon": "\ud83d\udeaa",
    "color": "#CD7F32",
    "xp": 10,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_team_player",
    "name": "Team Player",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Participate in 3 live quizzes.",
    "rarity": "bronze",
    "target": 3,
    "statKey": "liveQuizzesJoined",
    "icon": "\ud83e\udd1d",
    "color": "#CD7F32",
    "xp": 15,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_regular_competitor",
    "name": "Regular Competitor",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Participate in 5 live quizzes.",
    "rarity": "bronze",
    "target": 5,
    "statKey": "liveQuizzesJoined",
    "icon": "\ud83c\udfae",
    "color": "#CD7F32",
    "xp": 20,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_active_participant",
    "name": "Active Participant",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Participate in 10 live quizzes.",
    "rarity": "silver",
    "target": 10,
    "statKey": "liveQuizzesJoined",
    "icon": "\ud83c\udfc5",
    "color": "#CBD5E1",
    "xp": 25,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_quiz_enthusiast",
    "name": "Quiz Enthusiast",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Participate in 25 live quizzes.",
    "rarity": "silver",
    "target": 25,
    "statKey": "liveQuizzesJoined",
    "icon": "\ud83c\udf1f",
    "color": "#CBD5E1",
    "xp": 35,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_multiplayer_veteran",
    "name": "Multiplayer Veteran",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Participate in 50 live quizzes.",
    "rarity": "gold",
    "target": 50,
    "statKey": "liveQuizzesJoined",
    "icon": "\ud83c\udf96\ufe0f",
    "color": "#FBBF24",
    "xp": 50,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_room_explorer",
    "name": "Room Explorer",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Join 5 different multiplayer rooms.",
    "rarity": "silver",
    "target": 5,
    "statKey": "liveRoomsJoinedCount",
    "icon": "\ud83e\udded",
    "color": "#CBD5E1",
    "xp": 25,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_social_scholar",
    "name": "Social Scholar",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Play with 10 different players.",
    "rarity": "silver",
    "target": 10,
    "statKey": "livePlayersMetCount",
    "icon": "\ud83d\udc65",
    "color": "#CBD5E1",
    "xp": 30,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_lobby_creator",
    "name": "Lobby Creator",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Successfully host your first live quiz.",
    "rarity": "bronze",
    "target": 1,
    "statKey": "liveQuizzesHosted",
    "icon": "\ud83d\udc51",
    "color": "#CD7F32",
    "xp": 15,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_host_master",
    "name": "Host Master",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Successfully host 10 live quizzes.",
    "rarity": "gold",
    "target": 10,
    "statKey": "liveQuizzesHosted",
    "icon": "\ud83c\udf99\ufe0f",
    "color": "#FBBF24",
    "xp": 45,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_never_back_down",
    "name": "Never Back Down",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Complete 10 live quizzes without leaving early.",
    "rarity": "gold",
    "target": 10,
    "statKey": "liveQuizzesCompleted",
    "icon": "\ud83d\udee1\ufe0f",
    "color": "#FBBF24",
    "xp": 40,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_winning_streak",
    "name": "Winning Streak",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Win 3 consecutive live quizzes.",
    "rarity": "gold",
    "target": 3,
    "statKey": "maxLiveConsecutiveWins",
    "icon": "\ud83c\udfc6",
    "color": "#FBBF24",
    "xp": 50,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_champion",
    "name": "Champion",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Win 10 live quizzes.",
    "rarity": "platinum",
    "target": 10,
    "statKey": "liveQuizzesWon",
    "icon": "\ud83e\udd47",
    "color": "#38BDF8",
    "xp": 75,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "live_ultimate_competitor",
    "name": "Ultimate Competitor",
    "category": "live_competitor",
    "categoryName": "Live Competitor",
    "categoryIcon": "\ud83c\udfae",
    "desc": "Win 25 live quizzes.",
    "rarity": "platinum",
    "target": 25,
    "statKey": "liveQuizzesWon",
    "icon": "\ud83d\udd31",
    "color": "#38BDF8",
    "xp": 100,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path></svg>"
  },
  {
    "id": "exp_curious_scientist",
    "name": "Curious Scientist",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Open the experiment simulator for the first time.",
    "rarity": "bronze",
    "target": 1,
    "statKey": "experimentSimulatorOpened",
    "icon": "\ud83e\uddea",
    "color": "#CD7F32",
    "xp": 10,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_first_experiment",
    "name": "First Experiment",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Complete your first experiment.",
    "rarity": "bronze",
    "target": 1,
    "statKey": "experimentsCompletedCount",
    "icon": "\u2697\ufe0f",
    "color": "#CD7F32",
    "xp": 15,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_lab_explorer",
    "name": "Lab Explorer",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Explore 3 different experiments.",
    "rarity": "bronze",
    "target": 3,
    "statKey": "experimentsExploredCount",
    "icon": "\ud83d\udd2c",
    "color": "#CD7F32",
    "xp": 20,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_science_enthusiast",
    "name": "Science Enthusiast",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Complete 5 experiments.",
    "rarity": "silver",
    "target": 5,
    "statKey": "experimentsCompletedCount",
    "icon": "\ud83e\uddeb",
    "color": "#CBD5E1",
    "xp": 25,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_experimental_mind",
    "name": "Experimental Mind",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Complete 10 experiments.",
    "rarity": "silver",
    "target": 10,
    "statKey": "experimentsCompletedCount",
    "icon": "\ud83e\uddec",
    "color": "#CBD5E1",
    "xp": 35,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_variable_manipulator",
    "name": "Variable Manipulator",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Change and test 5 different experimental variables.",
    "rarity": "silver",
    "target": 5,
    "statKey": "variablesManipulatedCount",
    "icon": "\ud83c\udf9b\ufe0f",
    "color": "#CBD5E1",
    "xp": 30,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_trial_and_error",
    "name": "Trial and Error",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Perform 10 different experimental trials.",
    "rarity": "silver",
    "target": 10,
    "statKey": "trialsPerformedCount",
    "icon": "\ud83d\udd04",
    "color": "#CBD5E1",
    "xp": 35,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_observation_expert",
    "name": "Observation Expert",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Complete 5 experiments and record their observations.",
    "rarity": "gold",
    "target": 5,
    "statKey": "observationsRecordedCount",
    "icon": "\ud83d\udcdd",
    "color": "#FBBF24",
    "xp": 45,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_hypothesis_maker",
    "name": "Hypothesis Maker",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Complete 5 experiments after setting a hypothesis.",
    "rarity": "gold",
    "target": 5,
    "statKey": "hypothesesSetCount",
    "icon": "\ud83d\udcad",
    "color": "#FBBF24",
    "xp": 45,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_lab_specialist",
    "name": "Lab Specialist",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Complete 15 experiments.",
    "rarity": "gold",
    "target": 15,
    "statKey": "experimentsCompletedCount",
    "icon": "\ud83e\udd7c",
    "color": "#FBBF24",
    "xp": 50,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_scientific_investigator",
    "name": "Scientific Investigator",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Explore every available experiment at least once.",
    "rarity": "gold",
    "target": 18,
    "statKey": "experimentsExploredCount",
    "icon": "\ud83d\udd0d",
    "color": "#FBBF24",
    "xp": 60,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_master_of_variables",
    "name": "Master of Variables",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Successfully manipulate all available experimental variables.",
    "rarity": "platinum",
    "target": 18,
    "statKey": "variablesManipulatedCount",
    "icon": "\u2699\ufe0f",
    "color": "#38BDF8",
    "xp": 75,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_research_scientist",
    "name": "Research Scientist",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Complete 25 experiments.",
    "rarity": "platinum",
    "target": 25,
    "statKey": "experimentsCompletedCount",
    "icon": "\ud83d\udcca",
    "color": "#38BDF8",
    "xp": 85,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "exp_professor_of_experiments",
    "name": "Professor of Experiments",
    "category": "experimenter",
    "categoryName": "Experimenter",
    "categoryIcon": "\ud83e\uddea",
    "desc": "Complete all available experiments and their required activities.",
    "rarity": "platinum",
    "target": 18,
    "statKey": "experimentsCompletedUniqueCount",
    "icon": "\ud83c\udf93",
    "color": "#38BDF8",
    "xp": 100,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 2v7.31L4.66 18.3A2 2 0 0 0 6.38 21h11.24a2 2 0 0 0 1.72-2.7L14 9.31V2\"></path><line x1=\"8.5\" y1=\"2\" x2=\"15.5\" y2=\"2\"></line><line x1=\"7\" y1=\"16\" x2=\"17\" y2=\"16\"></line></svg>"
  },
  {
    "id": "perf_perfect_start",
    "name": "Perfect Start",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Get your first 100% quiz score.",
    "rarity": "bronze",
    "target": 1,
    "statKey": "quizzes100PercentCount",
    "icon": "\ud83d\udcaf",
    "color": "#CD7F32",
    "xp": 15,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_flawless_five",
    "name": "Flawless Five",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Get 100% on 5 quizzes.",
    "rarity": "bronze",
    "target": 5,
    "statKey": "quizzes100PercentCount",
    "icon": "\u2b50",
    "color": "#CD7F32",
    "xp": 20,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_perfect_ten",
    "name": "Perfect Ten",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Get 100% on 10 quizzes.",
    "rarity": "silver",
    "target": 10,
    "statKey": "quizzes100PercentCount",
    "icon": "\ud83c\udf1f",
    "color": "#CBD5E1",
    "xp": 30,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_no_mistakes",
    "name": "No Mistakes",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Answer 25 consecutive questions correctly.",
    "rarity": "silver",
    "target": 25,
    "statKey": "maxCorrectStreak",
    "icon": "\u2728",
    "color": "#CBD5E1",
    "xp": 35,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_accuracy_expert",
    "name": "Accuracy Expert",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Maintain at least 95% accuracy across 100 questions.",
    "rarity": "silver",
    "target": 100,
    "statKey": "accuracyExpertProgress",
    "icon": "\ud83c\udfaf",
    "color": "#CBD5E1",
    "xp": 40,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_untouchable",
    "name": "Untouchable",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Complete 5 quizzes with zero incorrect answers.",
    "rarity": "gold",
    "target": 5,
    "statKey": "quizzesZeroMistakesCount",
    "icon": "\ud83d\udee1\ufe0f",
    "color": "#FBBF24",
    "xp": 45,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_flawless_run",
    "name": "Flawless Run",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Complete 10 quizzes with 100% scores.",
    "rarity": "gold",
    "target": 10,
    "statKey": "quizzes100PercentCount",
    "icon": "\ud83c\udff9",
    "color": "#FBBF24",
    "xp": 50,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_diamond_mind",
    "name": "Diamond Mind",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Achieve 100% accuracy across 100 consecutive questions.",
    "rarity": "gold",
    "target": 100,
    "statKey": "maxCorrectStreak",
    "icon": "\ud83d\udc8e",
    "color": "#FBBF24",
    "xp": 60,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_perfectionist",
    "name": "Perfectionist",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Achieve 100% accuracy across 250 questions.",
    "rarity": "platinum",
    "target": 250,
    "statKey": "maxCorrectStreak",
    "icon": "\ud83d\udca0",
    "color": "#38BDF8",
    "xp": 75,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_impeccable_scholar",
    "name": "Impeccable Scholar",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Get perfect scores in 20 different topics.",
    "rarity": "gold",
    "target": 20,
    "statKey": "perfectTopicsCount",
    "icon": "\ud83d\udcdc",
    "color": "#FBBF24",
    "xp": 60,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_zero_errors",
    "name": "Zero Errors",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Complete 10 live quizzes without an incorrect answer.",
    "rarity": "gold",
    "target": 10,
    "statKey": "liveQuizzesZeroErrors",
    "icon": "0\ufe0f\u20e3",
    "color": "#FBBF24",
    "xp": 65,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_master_of_perfection",
    "name": "Master of Perfection",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Achieve perfect scores in every topic of one term.",
    "rarity": "platinum",
    "target": 8,
    "statKey": "perfectTopicsInBestTerm",
    "icon": "\ud83d\udc51",
    "color": "#38BDF8",
    "xp": 80,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_absolute_excellence",
    "name": "Absolute Excellence",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Achieve 100% completion and 100% accuracy in an entire term.",
    "rarity": "platinum",
    "target": 8,
    "statKey": "perfectTopicsInBestTerm",
    "icon": "\ud83c\udfc6",
    "color": "#38BDF8",
    "xp": 90,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "perf_the_unrivaled",
    "name": "The Unrivaled",
    "category": "perfectionist",
    "categoryName": "Perfectionist",
    "categoryIcon": "\ud83d\udcaf",
    "desc": "Achieve 100% completion and perfect scores in all available terms.",
    "rarity": "platinum",
    "target": 18,
    "statKey": "perfectTopicsCount",
    "icon": "\ud83c\udf0c",
    "color": "#38BDF8",
    "xp": 100,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 3h12l4 6-10 12L2 9z\"></path><path d=\"M11 3 8 9l4 12 4-12-3-6\"></path><path d=\"M2 9h20\"></path></svg>"
  },
  {
    "id": "know_first_steps",
    "name": "First Steps",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete your first topic.",
    "rarity": "bronze",
    "target": 1,
    "statKey": "completedTopicsCount",
    "icon": "\ud83d\udc63",
    "color": "#CD7F32",
    "xp": 10,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_topic_collector",
    "name": "Topic Collector",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete 3 different topics.",
    "rarity": "bronze",
    "target": 3,
    "statKey": "completedTopicsCount",
    "icon": "\ud83d\udce6",
    "color": "#CD7F32",
    "xp": 15,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_knowledge_builder",
    "name": "Knowledge Builder",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete 5 different topics.",
    "rarity": "bronze",
    "target": 5,
    "statKey": "completedTopicsCount",
    "icon": "\ud83e\uddf1",
    "color": "#CD7F32",
    "xp": 20,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_curious_learner",
    "name": "Curious Learner",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete 10 different topics.",
    "rarity": "silver",
    "target": 10,
    "statKey": "completedTopicsCount",
    "icon": "\ud83d\udcd6",
    "color": "#CBD5E1",
    "xp": 25,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_topic_specialist",
    "name": "Topic Specialist",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete 15 different topics.",
    "rarity": "silver",
    "target": 15,
    "statKey": "completedTopicsCount",
    "icon": "\ud83d\udcd1",
    "color": "#CBD5E1",
    "xp": 35,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_term_explorer",
    "name": "Term Explorer",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete all topics in Term 1.",
    "rarity": "silver",
    "target": 8,
    "statKey": "term1TopicsCount",
    "icon": "\ud83d\uddfa\ufe0f",
    "color": "#CBD5E1",
    "xp": 40,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_second_semester_star",
    "name": "Second Semester Star",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete all topics in Term 2.",
    "rarity": "silver",
    "target": 6,
    "statKey": "term2TopicsCount",
    "icon": "\ud83c\udf20",
    "color": "#CBD5E1",
    "xp": 40,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_third_term_triumph",
    "name": "Third Term Triumph",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete all topics in Term 3.",
    "rarity": "silver",
    "target": 4,
    "statKey": "term3TopicsCount",
    "icon": "\ud83e\udd49",
    "color": "#CBD5E1",
    "xp": 40,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_academic_adventurer",
    "name": "Academic Adventurer",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete all topics across two terms.",
    "rarity": "gold",
    "target": 14,
    "statKey": "completedTopicsCount",
    "icon": "\ud83e\udded",
    "color": "#FBBF24",
    "xp": 50,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_curriculum_conqueror",
    "name": "Curriculum Conqueror",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete all topics across all available terms.",
    "rarity": "gold",
    "target": 18,
    "statKey": "completedTopicsCount",
    "icon": "\ud83c\udfdb\ufe0f",
    "color": "#FBBF24",
    "xp": 60,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_knowledge_collector",
    "name": "Knowledge Collector",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Answer every available question at least once.",
    "rarity": "gold",
    "target": 1000,
    "statKey": "uniqueQuestionsCount",
    "icon": "\ud83d\udcda",
    "color": "#FBBF24",
    "xp": 65,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_subject_master",
    "name": "Subject Master",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Reach the required mastery score in 10 different topics.",
    "rarity": "gold",
    "target": 10,
    "statKey": "masteredTopicsCount",
    "icon": "\ud83c\udf93",
    "color": "#FBBF24",
    "xp": 70,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_all_rounder",
    "name": "All-Rounder",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Reach the required mastery score in every available topic.",
    "rarity": "platinum",
    "target": 18,
    "statKey": "masteredTopicsCount",
    "icon": "\ud83c\udf10",
    "color": "#38BDF8",
    "xp": 85,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "know_grand_scholar",
    "name": "Grand Scholar",
    "category": "knowledge_seeker",
    "categoryName": "Knowledge Seeker",
    "categoryIcon": "\ud83d\udcda",
    "desc": "Complete every topic, every term, and all required learning activities.",
    "rarity": "platinum",
    "target": 18,
    "statKey": "completedTopicsCount",
    "icon": "\ud83c\udf96\ufe0f",
    "color": "#38BDF8",
    "xp": 100,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"></path><path d=\"M6 6h10\"></path><path d=\"M6 10h10\"></path></svg>"
  },
  {
    "id": "pet_new_companion",
    "name": "New Companion",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Obtain your first pet.",
    "rarity": "bronze",
    "target": 1,
    "statKey": "petObtainedStatus",
    "icon": "\ud83d\udc23",
    "color": "#CD7F32",
    "xp": 10,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_first_interaction",
    "name": "First Interaction",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Interact with your pet for the first time.",
    "rarity": "bronze",
    "target": 1,
    "statKey": "petInteractionsCount",
    "icon": "\ud83d\udc4b",
    "color": "#CD7F32",
    "xp": 15,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_caring_owner",
    "name": "Caring Owner",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Perform 10 pet interactions.",
    "rarity": "bronze",
    "target": 10,
    "statKey": "petInteractionsCount",
    "icon": "\u2764\ufe0f",
    "color": "#CD7F32",
    "xp": 20,
    "rarityLabel": "Bronze \u2022 Common",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CD7F32\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_best_buddies",
    "name": "Best Buddies",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Interact with your pet on 5 different days.",
    "rarity": "silver",
    "target": 5,
    "statKey": "petInteractionDaysCount",
    "icon": "\ud83d\udc3e",
    "color": "#CBD5E1",
    "xp": 25,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_daily_companion",
    "name": "Daily Companion",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Maintain a 7-day pet interaction streak.",
    "rarity": "silver",
    "target": 7,
    "statKey": "petInteractionStreak",
    "icon": "\ud83d\udcc5",
    "color": "#CBD5E1",
    "xp": 30,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_growing_together",
    "name": "Growing Together",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Help your pet reach its second evolution.",
    "rarity": "silver",
    "target": 2,
    "statKey": "petEvolutionStage",
    "icon": "\ud83c\udf31",
    "color": "#CBD5E1",
    "xp": 35,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_rising_star",
    "name": "Rising Star",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Help your pet reach its third evolution.",
    "rarity": "gold",
    "target": 3,
    "statKey": "petEvolutionStage",
    "icon": "\u2b50",
    "color": "#FBBF24",
    "xp": 45,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_fully_grown",
    "name": "Fully Grown",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Unlock the final pet evolution.",
    "rarity": "gold",
    "target": 4,
    "statKey": "petEvolutionStage",
    "icon": "\ud83e\udd85",
    "color": "#FBBF24",
    "xp": 55,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_dedicated_guardian",
    "name": "Dedicated Guardian",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Maintain a 14-day interaction streak.",
    "rarity": "gold",
    "target": 14,
    "statKey": "petInteractionStreak",
    "icon": "\ud83d\udee1\ufe0f",
    "color": "#FBBF24",
    "xp": 60,
    "rarityLabel": "Gold \u2022 Rare",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_loyal_companion",
    "name": "Loyal Companion",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Maintain a 30-day interaction streak.",
    "rarity": "platinum",
    "target": 30,
    "statKey": "petInteractionStreak",
    "icon": "\ud83d\udc96",
    "color": "#38BDF8",
    "xp": 75,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_enthusiast",
    "name": "Pet Enthusiast",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Unlock all available pet interactions.",
    "rarity": "silver",
    "target": 4,
    "statKey": "petInteractionsUnlockedCount",
    "icon": "\ud83c\udfad",
    "color": "#CBD5E1",
    "xp": 35,
    "rarityLabel": "Silver \u2022 Uncommon",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#CBD5E1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_evolution_expert",
    "name": "Evolution Expert",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Unlock every available pet evolution.",
    "rarity": "platinum",
    "target": 4,
    "statKey": "petEvolutionStage",
    "icon": "\ud83d\udd2e",
    "color": "#38BDF8",
    "xp": 80,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_forever_friends",
    "name": "Forever Friends",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Reach the maximum pet level.",
    "rarity": "platinum",
    "target": 4,
    "statKey": "petEvolutionStage",
    "icon": "\ud83c\udf1f",
    "color": "#38BDF8",
    "xp": 85,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  },
  {
    "id": "pet_legendary_guardian",
    "name": "Legendary Guardian",
    "category": "pet_guardian",
    "categoryName": "Pet Guardian",
    "categoryIcon": "\ud83d\udc3e",
    "desc": "Maximize your pet's level and unlock all available evolutions and interactions.",
    "rarity": "platinum",
    "target": 1,
    "statKey": "petLegendaryStatus",
    "icon": "\ud83d\udc51",
    "color": "#38BDF8",
    "xp": 100,
    "rarityLabel": "Platinum \u2022 Legendary",
    "svgIcon": "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"4\" r=\"2\"></circle><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><circle cx=\"20\" cy=\"16\" r=\"2\"></circle><path d=\"M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5Z\"></path></svg>"
  }
],

  // --------------------------------------------------------------------------
  // STATS PERSISTENCE & HISTORICAL BACKFILL
  // --------------------------------------------------------------------------
  getStatsKey() {
    const profile = (typeof DB !== 'undefined' && DB.getStudentProfile) ? DB.getStudentProfile() : null;
    const uuid = (profile && profile.id) ? profile.id : ((typeof DB !== 'undefined' && DB.getUserUUID) ? DB.getUserUUID() : 'default');
    return `nexus_achievement_stats_${uuid}`;
  },

  getStats() {
    const key = this.getStatsKey();
    let stats = null;
    try {
      const raw = localStorage.getItem(key);
      if (raw) stats = JSON.parse(raw);
    } catch (e) {}

    if (!stats || typeof stats !== 'object') {
      stats = this.createDefaultStats();
    }

    // Ensure all required fields exist
    stats = Object.assign(this.createDefaultStats(), stats);

    // Historical backfill from DB
    this.backfillStats(stats);
    return stats;
  },

  saveStats(stats) {
    const key = this.getStatsKey();
    try {
      localStorage.setItem(key, JSON.stringify(stats));
    } catch (e) {}
  },

  createDefaultStats() {
    return {
      // Speedster
      correctUnder10s: 0,
      correctUnder7s: 0,
      correctUnder5s: 0,
      correctUnder3s: 0,
      maxConsecutiveUnder3sStreak: 0,
      currentConsecutiveUnder3s: 0,
      maxCorrectStreak: 0,
      currentCorrectStreak: 0,
      timeMasterRecentTimes: [],
      timeMasterCount: 0,
      liveFirstToAnswerCount: 0,

      // Live Competitor
      liveQuizzesJoined: 0,
      liveQuizzesCompleted: 0,
      liveQuizzesHosted: 0,
      liveQuizzesWon: 0,
      currentLiveConsecutiveWins: 0,
      maxLiveConsecutiveWins: 0,
      liveRoomsJoinedCount: 0,
      liveRoomsJoinedList: [],
      livePlayersMetCount: 0,
      livePlayersMetList: [],
      liveQuizzesZeroErrors: 0,

      // Experimenter
      experimentSimulatorOpened: 0,
      experimentsCompletedCount: 0,
      experimentsCompletedUniqueCount: 0,
      experimentsCompletedList: [],
      experimentsExploredCount: 0,
      experimentsExploredList: [],
      variablesManipulatedCount: 0,
      trialsPerformedCount: 0,
      observationsRecordedCount: 0,
      hypothesesSetCount: 0,

      // Perfectionist
      quizzes100PercentCount: 0,
      quizzesZeroMistakesCount: 0,
      accuracyExpertProgress: 0,
      accuracyWindow: [], // last 100 questions boolean (true=correct)
      perfectTopicsCount: 0,
      perfectTopicsList: [],
      perfectTopicsInBestTerm: 0,

      // Knowledge Seeker
      completedTopicsCount: 0,
      completedTopicsList: [],
      term1TopicsCount: 0,
      term1TopicsList: [],
      term2TopicsCount: 0,
      term2TopicsList: [],
      term3TopicsCount: 0,
      term3TopicsList: [],
      uniqueQuestionsCount: 0,
      answeredQuestionsList: [],
      masteredTopicsCount: 0,
      masteredTopicsList: [],

      // Pet Guardian
      petObtainedStatus: 1, // Pet is obtained upon starting Nexus
      petInteractionsCount: 0,
      petInteractionDaysList: [],
      petInteractionDaysCount: 0,
      petInteractionStreak: 0,
      petLastInteractionDate: '',
      petEvolutionStage: 1,
      petInteractionsUnlockedCount: 1,
      petLegendaryStatus: 0
    };
  },

  backfillStats(stats) {
    if (typeof DB === 'undefined') return;
    const allResults = (DB.getQuizResults ? DB.getQuizResults() : null) || [];
    const profile = (DB.getStudentProfile ? DB.getStudentProfile() : null) || {};

    // Backfill quiz metrics if not already populated
    if (allResults.length > 0) {
      const topicSet = new Set(stats.completedTopicsList || []);
      const perfectSet = new Set(stats.perfectTopicsList || []);
      const term1Set = new Set(stats.term1TopicsList || []);
      const term2Set = new Set(stats.term2TopicsList || []);
      const term3Set = new Set(stats.term3TopicsList || []);
      let p100 = 0;
      let zeroMistakes = 0;

      allResults.forEach(r => {
        if (r.topic) topicSet.add(r.topic);
        const total = (r.totalQuestions || (r.correctCount + (r.incorrectCount || 0))) || 1;
        const isPerfect = (r.scorePercentage >= 100) || (r.correctCount === total && total > 0);
        if (isPerfect) {
          p100++;
          if (r.topic) perfectSet.add(r.topic);
        }
        if (r.incorrectCount === 0 && total >= 3) {
          zeroMistakes++;
        }
        if (r.term === 1 || r.term === '1') term1Set.add(r.topic);
        if (r.term === 2 || r.term === '2') term2Set.add(r.topic);
        if (r.term === 3 || r.term === '3') term3Set.add(r.topic);
      });

      stats.completedTopicsList = Array.from(topicSet);
      stats.completedTopicsCount = stats.completedTopicsList.length;

      stats.perfectTopicsList = Array.from(perfectSet);
      stats.perfectTopicsCount = stats.perfectTopicsList.length;

      stats.term1TopicsList = Array.from(term1Set);
      stats.term1TopicsCount = stats.term1TopicsList.length;

      stats.term2TopicsList = Array.from(term2Set);
      stats.term2TopicsCount = stats.term2TopicsList.length;

      stats.term3TopicsList = Array.from(term3Set);
      stats.term3TopicsCount = stats.term3TopicsList.length;

      stats.perfectTopicsInBestTerm = Math.max(stats.term1TopicsCount, stats.term2TopicsCount, stats.term3TopicsCount);

      if (p100 > stats.quizzes100PercentCount) stats.quizzes100PercentCount = p100;
      if (zeroMistakes > stats.quizzesZeroMistakesCount) stats.quizzesZeroMistakesCount = zeroMistakes;
    }

    // Backfill pet evolution stage from XP
    if (typeof ProgressionSystem !== 'undefined' && ProgressionSystem.getCurrentXP) {
      const xp = ProgressionSystem.getCurrentXP();
      let stage = 1;
      if (xp >= 2000) stage = 4;
      else if (xp >= 1000) stage = 3;
      else if (xp >= 300) stage = 2;
      if (stage > stats.petEvolutionStage) stats.petEvolutionStage = stage;
      if (stage >= 4) {
        stats.petInteractionsUnlockedCount = 4;
        stats.petLegendaryStatus = 1;
      }
    }

    if (profile && profile.streak && profile.streak > stats.petInteractionStreak) {
      stats.petInteractionStreak = profile.streak;
    }
  },

  // --------------------------------------------------------------------------
  // DYNAMIC PROGRESS CALCULATION
  // --------------------------------------------------------------------------
  computeProgress(ach, stats) {
    const val = stats[ach.statKey];
    let current = 0;
    if (Array.isArray(val)) {
      current = val.length;
    } else if (typeof val === 'number') {
      current = val;
    } else if (typeof val === 'boolean') {
      current = val ? 1 : 0;
    }

    const target = ach.target || 1;
    const percentage = Math.min(100, Math.max(0, Math.round((current / target) * 100)));
    const isComplete = current >= target;

    return {
      current,
      target,
      percentage,
      isComplete
    };
  },

  // --------------------------------------------------------------------------
  // CHECK AND UNLOCK ACHIEVEMENTS
  // --------------------------------------------------------------------------
  checkAndUnlock(stats) {
    if (!stats) stats = this.getStats();
    const unlocked = (typeof DB !== 'undefined' && DB.getUnlockedAchievements) ? DB.getUnlockedAchievements() : [];
    let newUnlocks = 0;

    this.list.forEach(ach => {
      const { isComplete, percentage } = this.computeProgress(ach, stats);
      if ((isComplete || percentage >= 100) && !unlocked.includes(ach.id)) {
        if (typeof DB !== 'undefined' && DB.saveUnlockedAchievement) {
          DB.saveUnlockedAchievement(ach.id);
        }
        unlocked.push(ach.id);
        newUnlocks++;
      }
    });

    if (newUnlocks > 0) {
      this.saveStats(stats);
    }
    return unlocked;
  },

  showUnlockToast(ach) {
    let toast = document.getElementById('nexusAchievementToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nexusAchievementToast';
      toast.className = 'achievement-toast-banner';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="toast-ach-icon">${ach.icon}</div>
      <div class="toast-ach-info">
        <div class="toast-ach-badge">ACHIEVEMENT UNLOCKED! • ${ach.rarity.toUpperCase()}</div>
        <div class="toast-ach-title">${ach.name}</div>
        <div class="toast-ach-desc">${ach.desc}</div>
      </div>
      <div class="toast-ach-xp">+${ach.xp} XP</div>
    `;

    toast.classList.add('show');
    try {
      if (typeof Experiment !== 'undefined' && Experiment.playAchievementUnlockSfx) {
        Experiment.playAchievementUnlockSfx();
      }
    } catch (e) {}

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  },

  // --------------------------------------------------------------------------
  // EVENT RECORDING HOOKS
  // --------------------------------------------------------------------------
  recordQuestionAnswer(data) {
    // data: { isCorrect, timeSpentSec, streak, topic, term, questionId }
    const stats = this.getStats();

    if (data.questionId) {
      if (!stats.answeredQuestionsList.includes(data.questionId)) {
        stats.answeredQuestionsList.push(data.questionId);
        stats.uniqueQuestionsCount = stats.answeredQuestionsList.length;
      }
    }

    if (data.isCorrect) {
      const t = data.timeSpentSec;
      if (t <= 10) stats.correctUnder10s++;
      if (t <= 7) stats.correctUnder7s++;
      if (t <= 5) stats.correctUnder5s++;
      if (t <= 3) {
        stats.correctUnder3s++;
        stats.currentConsecutiveUnder3s++;
        if (stats.currentConsecutiveUnder3s > stats.maxConsecutiveUnder3sStreak) {
          stats.maxConsecutiveUnder3sStreak = stats.currentConsecutiveUnder3s;
        }
      } else {
        stats.currentConsecutiveUnder3s = 0;
      }

      stats.currentCorrectStreak++;
      if (stats.currentCorrectStreak > stats.maxCorrectStreak) {
        stats.maxCorrectStreak = stats.currentCorrectStreak;
      }

      // Rolling 50-answer average for Time Master
      stats.timeMasterRecentTimes.push(t);
      if (stats.timeMasterRecentTimes.length > 50) stats.timeMasterRecentTimes.shift();
      if (stats.timeMasterRecentTimes.length >= 50) {
        const avg = stats.timeMasterRecentTimes.reduce((a, b) => a + b, 0) / 50;
        if (avg <= 5.0) stats.timeMasterCount = 50;
      }

      // Accuracy Window
      stats.accuracyWindow.push(true);
    } else {
      stats.currentCorrectStreak = 0;
      stats.currentConsecutiveUnder3s = 0;
      stats.accuracyWindow.push(false);
    }

    if (stats.accuracyWindow.length > 100) stats.accuracyWindow.shift();
    const correctCountInWindow = stats.accuracyWindow.filter(Boolean).length;
    if (stats.accuracyWindow.length >= 100 && correctCountInWindow >= 95) {
      stats.accuracyExpertProgress = 100;
    } else {
      stats.accuracyExpertProgress = correctCountInWindow;
    }

    this.checkAndUnlock(stats);
    this.saveStats(stats);
  },

  evaluateSession(session) {
    // session: { term, totalQuestions, correctCount, incorrectCount, scorePoints, streak, totalTimeSec, fastestAnswerSec, topic, accuracy }
    const stats = this.getStats();

    if (session.topic) {
      if (!stats.completedTopicsList.includes(session.topic)) {
        stats.completedTopicsList.push(session.topic);
        stats.completedTopicsCount = stats.completedTopicsList.length;
      }

      if (session.term === 1 || session.term === '1') {
        if (!stats.term1TopicsList.includes(session.topic)) {
          stats.term1TopicsList.push(session.topic);
          stats.term1TopicsCount = stats.term1TopicsList.length;
        }
      } else if (session.term === 2 || session.term === '2') {
        if (!stats.term2TopicsList.includes(session.topic)) {
          stats.term2TopicsList.push(session.topic);
          stats.term2TopicsCount = stats.term2TopicsList.length;
        }
      } else if (session.term === 3 || session.term === '3') {
        if (!stats.term3TopicsList.includes(session.topic)) {
          stats.term3TopicsList.push(session.topic);
          stats.term3TopicsCount = stats.term3TopicsList.length;
        }
      }

      stats.perfectTopicsInBestTerm = Math.max(stats.term1TopicsCount, stats.term2TopicsCount, stats.term3TopicsCount);
    }

    const totalQ = session.totalQuestions || 1;
    const isPerfect = (session.correctCount === totalQ) || (session.accuracy >= 100);

    if (isPerfect) {
      stats.quizzes100PercentCount++;
      if (session.topic && !stats.perfectTopicsList.includes(session.topic)) {
        stats.perfectTopicsList.push(session.topic);
        stats.perfectTopicsCount = stats.perfectTopicsList.length;
      }
    }

    if (session.incorrectCount === 0 && totalQ >= 3) {
      stats.quizzesZeroMistakesCount++;
    }

    if (session.accuracy >= 85 && session.topic) {
      if (!stats.masteredTopicsList.includes(session.topic)) {
        stats.masteredTopicsList.push(session.topic);
        stats.masteredTopicsCount = stats.masteredTopicsList.length;
      }
    }

    if (session.streak && session.streak > stats.maxCorrectStreak) {
      stats.maxCorrectStreak = session.streak;
    }

    this.checkAndUnlock(stats);
    this.saveStats(stats);
  },

  recordExperimentEvent(type, details) {
    // type: 'open' | 'complete' | 'trial' | 'variable' | 'observation' | 'hypothesis'
    const stats = this.getStats();

    if (type === 'open') {
      stats.experimentSimulatorOpened = 1;
      if (details && details.topic) {
        if (!stats.experimentsExploredList.includes(details.topic)) {
          stats.experimentsExploredList.push(details.topic);
          stats.experimentsExploredCount = stats.experimentsExploredList.length;
        }
      }
    } else if (type === 'complete') {
      stats.experimentsCompletedCount++;
      if (details && details.topic) {
        if (!stats.experimentsCompletedList.includes(details.topic)) {
          stats.experimentsCompletedList.push(details.topic);
          stats.experimentsCompletedUniqueCount = stats.experimentsCompletedList.length;
        }
      }
    } else if (type === 'trial') {
      stats.trialsPerformedCount++;
    } else if (type === 'variable') {
      stats.variablesManipulatedCount++;
    } else if (type === 'observation') {
      stats.observationsRecordedCount++;
    } else if (type === 'hypothesis') {
      stats.hypothesesSetCount++;
    }

    this.checkAndUnlock(stats);
    this.saveStats(stats);
  },

  recordLiveQuizEvent(type, details) {
    // type: 'join' | 'host' | 'win' | 'complete' | 'first_answer' | 'zero_errors'
    const stats = this.getStats();

    if (type === 'join') {
      stats.liveQuizzesJoined++;
      if (details && details.roomCode && !stats.liveRoomsJoinedList.includes(details.roomCode)) {
        stats.liveRoomsJoinedList.push(details.roomCode);
        stats.liveRoomsJoinedCount = stats.liveRoomsJoinedList.length;
      }
      if (details && details.players && Array.isArray(details.players)) {
        details.players.forEach(p => {
          if (p && !stats.livePlayersMetList.includes(p)) stats.livePlayersMetList.push(p);
        });
        stats.livePlayersMetCount = stats.livePlayersMetList.length;
      }
    } else if (type === 'host') {
      stats.liveQuizzesHosted++;
    } else if (type === 'first_answer') {
      stats.liveFirstToAnswerCount++;
    } else if (type === 'complete') {
      stats.liveQuizzesCompleted++;
    } else if (type === 'win') {
      stats.liveQuizzesWon++;
      stats.currentLiveConsecutiveWins++;
      if (stats.currentLiveConsecutiveWins > stats.maxLiveConsecutiveWins) {
        stats.maxLiveConsecutiveWins = stats.currentLiveConsecutiveWins;
      }
    } else if (type === 'loss') {
      stats.currentLiveConsecutiveWins = 0;
    } else if (type === 'zero_errors') {
      stats.liveQuizzesZeroErrors++;
    }

    this.checkAndUnlock(stats);
    this.saveStats(stats);
  },

  recordPetEvent(type, details) {
    // type: 'interact' | 'evolution' | 'unlock_interaction' | 'max_level'
    const stats = this.getStats();

    if (type === 'interact') {
      stats.petInteractionsCount++;
      const today = new Date().toISOString().split('T')[0];
      if (!stats.petInteractionDaysList.includes(today)) {
        stats.petInteractionDaysList.push(today);
        stats.petInteractionDaysCount = stats.petInteractionDaysList.length;

        // Check streak
        if (stats.petLastInteractionDate) {
          const lastDate = new Date(stats.petLastInteractionDate);
          const currDate = new Date(today);
          const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            stats.petInteractionStreak++;
          } else if (diffDays > 1) {
            stats.petInteractionStreak = 1;
          }
        } else {
          stats.petInteractionStreak = 1;
        }
        stats.petLastInteractionDate = today;
      }
    } else if (type === 'evolution') {
      if (details && details.stage) {
        stats.petEvolutionStage = Math.max(stats.petEvolutionStage, details.stage);
      }
    } else if (type === 'unlock_interaction') {
      stats.petInteractionsUnlockedCount = Math.min(4, (stats.petInteractionsUnlockedCount || 1) + 1);
    } else if (type === 'max_level') {
      stats.petEvolutionStage = 4;
      stats.petLegendaryStatus = 1;
    }

    this.checkAndUnlock(stats);
    this.saveStats(stats);
  },

  // --------------------------------------------------------------------------
  // RANKING SYSTEM
  // --------------------------------------------------------------------------
  overallRanks: [
    { min: 0, title: 'Rank I: Science Novice', icon: '🥉', badgeClass: 'bronze' },
    { min: 10, title: 'Rank II: Junior Explorer', icon: '🥈', badgeClass: 'silver' },
    { min: 25, title: 'Rank III: Lab Specialist', icon: '🥇', badgeClass: 'gold' },
    { min: 45, title: 'Rank IV: Trivia Master', icon: '💎', badgeClass: 'platinum' },
    { min: 65, title: 'Rank V: Nexus Grandmaster', icon: '👑', badgeClass: 'grandmaster' },
    { min: 84, title: 'Rank VI: The Legendary Paragon', icon: '🌟', badgeClass: 'paragon' }
  ],

  categoryRanks: {
    speedster: [
      { min: 0, title: 'Novice Reflexes', icon: '⚡' },
      { min: 4, title: 'Swift Mind', icon: '⚡' },
      { min: 8, title: 'Speed Demon', icon: '🚀' },
      { min: 11, title: 'Sonic Scholar', icon: '💫' },
      { min: 14, title: 'The Flash', icon: '⚡' }
    ],
    live_competitor: [
      { min: 0, title: 'Casual Competitor', icon: '🎮' },
      { min: 4, title: 'Team Contender', icon: '👥' },
      { min: 8, title: 'Arena Warrior', icon: '⚔️' },
      { min: 11, title: 'Live Champion', icon: '🏆' },
      { min: 14, title: 'Ultimate Competitor', icon: '👑' }
    ],
    experimenter: [
      { min: 0, title: 'Lab Novice', icon: '🧪' },
      { min: 4, title: 'Curious Analyst', icon: '🔬' },
      { min: 8, title: 'Research Scientist', icon: '🥼' },
      { min: 11, title: 'Lab Specialist', icon: '🧬' },
      { min: 14, title: 'Professor of Experiments', icon: '🎓' }
    ],
    perfectionist: [
      { min: 0, title: 'Accurate Thinker', icon: '🎯' },
      { min: 4, title: 'Precision Mind', icon: '✨' },
      { min: 8, title: 'Flawless Runner', icon: '💎' },
      { min: 11, title: 'Diamond Mind', icon: '💠' },
      { min: 14, title: 'The Unrivaled', icon: '👑' }
    ],
    knowledge_seeker: [
      { min: 0, title: 'Eager Reader', icon: '📖' },
      { min: 4, title: 'Topic Collector', icon: '📚' },
      { min: 8, title: 'Term Explorer', icon: '🧭' },
      { min: 11, title: 'Academic Adventurer', icon: '🏛️' },
      { min: 14, title: 'Grand Scholar', icon: '🌟' }
    ],
    pet_guardian: [
      { min: 0, title: 'New Caretaker', icon: '🐾' },
      { min: 4, title: 'Caring Owner', icon: '💖' },
      { min: 8, title: 'Loyal Companion', icon: '🛡️' },
      { min: 11, title: 'Evolution Master', icon: '🔮' },
      { min: 14, title: 'Legendary Guardian', icon: '👑' }
    ]
  },

  categoryDescriptions: {
    rankings: 'Browse achievements by rank: Bronze, Silver, Gold, Platinum',
    speedster: 'Quickness of answering',
    live_competitor: 'Live quiz participation & arena wins',
    experimenter: 'Experiment simulator utilization',
    perfectionist: 'Perfect scores & 100% completion',
    knowledge_seeker: 'Topic and term completion',
    pet_guardian: 'Interactive pet progression & evolutions'
  },

  categoryColors: {
    rankings: { border: '#F59E0B', glow: 'rgba(245, 158, 11, 0.45)', bg: 'rgba(245, 158, 11, 0.15)' },
    speedster: { border: '#FBBF24', glow: 'rgba(251, 191, 36, 0.35)', bg: 'rgba(251, 191, 36, 0.12)' },
    live_competitor: { border: '#EC4899', glow: 'rgba(236, 72, 153, 0.35)', bg: 'rgba(236, 72, 153, 0.12)' },
    experimenter: { border: '#38BDF8', glow: 'rgba(56, 189, 248, 0.35)', bg: 'rgba(56, 189, 248, 0.12)' },
    perfectionist: { border: '#A855F7', glow: 'rgba(168, 85, 247, 0.35)', bg: 'rgba(168, 85, 247, 0.12)' },
    knowledge_seeker: { border: '#34D399', glow: 'rgba(52, 211, 153, 0.35)', bg: 'rgba(52, 211, 153, 0.12)' },
    pet_guardian: { border: '#F472B6', glow: 'rgba(244, 114, 182, 0.35)', bg: 'rgba(244, 114, 182, 0.12)' }
  },

  getOverallRank(unlockedCount) {
    let current = this.overallRanks[0];
    let next = this.overallRanks[1] || null;
    for (let i = 0; i < this.overallRanks.length; i++) {
      if (unlockedCount >= this.overallRanks[i].min) {
        current = this.overallRanks[i];
        next = this.overallRanks[i + 1] || null;
      }
    }
    return { current, next };
  },

  getCategoryRank(categoryId, unlockedCount) {
    const list = this.categoryRanks[categoryId] || [];
    let rank = list[0] || { title: 'Beginner', icon: '🎯' };
    for (const r of list) {
      if (unlockedCount >= r.min) rank = r;
    }
    return rank;
  },

  // --------------------------------------------------------------------------
  // UI RENDERING ENGINE & NAVIGATION
  // --------------------------------------------------------------------------
  render() {
    this.showCategoriesView();
  },

  showCategoriesView() {
    this.checkAndUnlock();
    const hub = document.getElementById('achievementsCategoriesHub');
    if (hub) hub.classList.remove('hidden');

    this.closeCategoryPopup();
    this.closeRankingsPopup();
    this.renderCategoryCards();
  },

  openCategory(catId) {
    this.checkAndUnlock();
    if (catId === 'rankings') {
      this.openRankingsPopup();
      return;
    }
    this.activeCategory = catId;
    const popup = document.getElementById('categoryPopupModal');
    if (popup) popup.classList.remove('hidden');

    this.renderCategoryPopupHeader(catId);
    this.renderCategoryGrid(catId);

    const grid = document.getElementById('achievementsGrid');
    if (grid) grid.scrollTop = 0;
  },

  closeCategoryPopup() {
    const popup = document.getElementById('categoryPopupModal');
    if (popup) popup.classList.add('hidden');
  },

  openRankingsPopup() {
    this.checkAndUnlock();
    const popup = document.getElementById('rankingsPopupModal');
    if (popup) popup.classList.remove('hidden');
    this.showRankingsHub();
  },

  closeRankingsPopup() {
    const popup = document.getElementById('rankingsPopupModal');
    if (popup) popup.classList.add('hidden');
  },

  renderSummaryHeader() {
    const container = document.getElementById('achievementsHeaderSummary');
    if (!container) return;

    const unlocked = (typeof DB !== 'undefined' && DB.getUnlockedAchievements) ? DB.getUnlockedAchievements() : [];
    const totalCount = this.list.length;
    const unlockedCount = unlocked.length;
    const overallPercent = Math.round((unlockedCount / totalCount) * 100);
    const { current, next } = this.getOverallRank(unlockedCount);

    const nextText = next
      ? `• ${next.min - unlockedCount} more to reach ${next.title}`
      : '• Max Rank Reached! 🌟';

    // Calculate counts per rarity
    const rarityCounts = {
      bronze: { total: 0, unlocked: 0 },
      silver: { total: 0, unlocked: 0 },
      gold: { total: 0, unlocked: 0 },
      platinum: { total: 0, unlocked: 0 }
    };

    this.list.forEach(a => {
      const rar = a.rarity;
      if (rarityCounts[rar]) {
        rarityCounts[rar].total++;
        if (unlocked.includes(a.id)) rarityCounts[rar].unlocked++;
      }
    });

    container.innerHTML = `
      <div class="ach-summary-card">
        <div class="ach-rank-banner">
          <div class="ach-rank-left">
            <span class="ach-rank-badge-icon">${current.icon}</span>
            <div class="ach-rank-text-wrap">
              <div class="ach-rank-title">${current.title}</div>
              <div class="ach-rank-next">${unlockedCount} / ${totalCount} Unlocked ${nextText}</div>
            </div>
          </div>
          <div class="ach-summary-percent-pill">${overallPercent}%</div>
        </div>

        <div class="ach-master-progress-bar">
          <div class="ach-master-progress-fill" style="width: ${overallPercent}%;"></div>
        </div>

        <div class="ach-rarity-row">
          <div class="ach-rarity-chip bronze">
            <div class="rarity-chip-label">
              <span class="rarity-dot"></span>
              <span class="rarity-name">Bronze</span>
            </div>
            <span class="rarity-val">${rarityCounts.bronze.unlocked} / ${rarityCounts.bronze.total}</span>
          </div>
          <div class="ach-rarity-chip silver">
            <div class="rarity-chip-label">
              <span class="rarity-dot"></span>
              <span class="rarity-name">Silver</span>
            </div>
            <span class="rarity-val">${rarityCounts.silver.unlocked} / ${rarityCounts.silver.total}</span>
          </div>
          <div class="ach-rarity-chip gold">
            <div class="rarity-chip-label">
              <span class="rarity-dot"></span>
              <span class="rarity-name">Gold</span>
            </div>
            <span class="rarity-val">${rarityCounts.gold.unlocked} / ${rarityCounts.gold.total}</span>
          </div>
          <div class="ach-rarity-chip platinum">
            <div class="rarity-chip-label">
              <span class="rarity-dot"></span>
              <span class="rarity-name">Platinum</span>
            </div>
            <span class="rarity-val">${rarityCounts.platinum.unlocked} / ${rarityCounts.platinum.total}</span>
          </div>
        </div>
      </div>
    `;
  },

  renderCategoryCards() {
    const container = document.getElementById('achievementsCategoryCardsGrid');
    if (!container) return;

    const unlocked = (typeof DB !== 'undefined' && DB.getUnlockedAchievements) ? DB.getUnlockedAchievements() : [];
    const realCats = this.categories.filter(c => c.id !== 'all');

    container.innerHTML = realCats.map(cat => {
      let catAchs, catUnlocked, catPercent, rank, desc, colors;
      if (cat.id === 'rankings') {
        catAchs = this.list;
        catUnlocked = unlocked.length;
        catPercent = Math.round((catUnlocked / catAchs.length) * 100);
        const overall = this.getOverallRank(catUnlocked);
        rank = { icon: overall.current.icon, title: overall.current.title };
        desc = this.categoryDescriptions[cat.id] || 'Browse achievements by rank: Bronze, Silver, Gold, Platinum';
        colors = this.categoryColors[cat.id] || { border: '#F59E0B', glow: 'rgba(245, 158, 11, 0.45)', bg: 'rgba(245, 158, 11, 0.15)' };
      } else {
        catAchs = this.list.filter(a => a.category === cat.id);
        catUnlocked = catAchs.filter(a => unlocked.includes(a.id)).length;
        catPercent = Math.round((catUnlocked / catAchs.length) * 100);
        rank = this.getCategoryRank(cat.id, catUnlocked);
        desc = this.categoryDescriptions[cat.id] || 'Explore and unlock achievements';
        colors = this.categoryColors[cat.id] || { border: '#A855F7', glow: 'rgba(168, 85, 247, 0.3)', bg: 'rgba(168, 85, 247, 0.15)' };
      }

      return `
        <div class="ach-category-card ${cat.id === 'rankings' ? 'featured-rankings-card' : ''}" onclick="Achievements.openCategory('${cat.id}')">
          <div class="ach-cat-card-top">
            <div class="ach-cat-card-icon-wrap" style="border-color: ${colors.border}; background: ${colors.bg}; box-shadow: 0 0 12px ${colors.glow};">
              <span class="ach-cat-card-icon">${cat.icon}</span>
            </div>
            <div class="ach-cat-card-info">
              <div class="ach-cat-card-title">${cat.name}</div>
              <div class="ach-cat-card-desc">${desc}</div>
            </div>
            <div class="ach-cat-card-arrow">➔</div>
          </div>

          <div class="ach-cat-card-bottom">
            <div class="ach-cat-card-rank-row">
              <span class="ach-cat-card-rank-badge" style="border-color: ${colors.border}; color: ${colors.border};">${rank.icon} ${rank.title}</span>
              <span class="ach-cat-card-count">${catUnlocked} / ${catAchs.length} (${catPercent}%)</span>
            </div>
            <div class="ach-cat-card-progress-track">
              <div class="ach-cat-card-progress-fill" style="width: ${catPercent}%; background: ${colors.border}; box-shadow: 0 0 8px ${colors.glow};"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCategoryPopupHeader(catId) {
    const cat = this.categories.find(c => c.id === catId) || this.categories[1];
    const catAchs = this.list.filter(a => a.category === catId);
    const unlocked = (typeof DB !== 'undefined' && DB.getUnlockedAchievements) ? DB.getUnlockedAchievements() : [];
    const catUnlocked = catAchs.filter(a => unlocked.includes(a.id)).length;
    const catPercent = Math.round((catUnlocked / catAchs.length) * 100);
    const rank = this.getCategoryRank(catId, catUnlocked);
    const colors = this.categoryColors[catId] || { border: '#A855F7', glow: 'rgba(168, 85, 247, 0.35)', bg: 'rgba(168, 85, 247, 0.12)' };

    const halo = document.getElementById('catPopupIconHalo');
    if (halo) {
      halo.style.borderColor = colors.border;
      halo.style.background = colors.bg;
      halo.style.boxShadow = `0 0 16px ${colors.glow}`;
    }

    const iconEl = document.getElementById('catPopupIcon');
    if (iconEl) iconEl.textContent = cat.icon;

    const titleEl = document.getElementById('catPopupTitle');
    if (titleEl) titleEl.textContent = cat.name;

    const rankEl = document.getElementById('catPopupRank');
    if (rankEl) {
      rankEl.innerHTML = `${rank.icon} ${rank.title}`;
      rankEl.style.borderColor = colors.border;
      rankEl.style.color = colors.border;
    }

    const countEl = document.getElementById('catPopupCount');
    if (countEl) {
      countEl.textContent = `${catUnlocked} / ${catAchs.length} (${catPercent}%)`;
    }

    const card = document.querySelector('.category-popup-card');
    if (card) {
      card.style.borderColor = colors.border;
      card.style.boxShadow = `0 16px 50px rgba(0, 0, 0, 0.8), 0 0 28px ${colors.glow}`;
    }
  },

  renderCategoryGrid(catId) {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    const unlocked = (typeof DB !== 'undefined' && DB.getUnlockedAchievements) ? DB.getUnlockedAchievements() : [];
    const stats = this.getStats();

    const filtered = this.list.filter(a => a.category === catId);

    grid.innerHTML = '';

    filtered.forEach(ach => {
      const progress = this.computeProgress(ach, stats);
      let isUnlocked = unlocked.includes(ach.id) || progress.isComplete || progress.percentage >= 100;
      if (isUnlocked && !unlocked.includes(ach.id)) {
        unlocked.push(ach.id);
        if (typeof DB !== 'undefined' && DB.saveUnlockedAchievement) {
          DB.saveUnlockedAchievement(ach.id);
        }
      }
      const tile = document.createElement('div');
      tile.className = `ach-tile ${isUnlocked ? 'unlocked achieved' : 'locked'} rarity-${ach.rarity}`;
      tile.onclick = () => this.showModal(ach, isUnlocked, progress);

      const progressHtml = isUnlocked
        ? `<div class="ach-tile-progress-text unlocked">Achieved ✅</div>`
        : `
          <div class="ach-tile-progress-wrap">
            <div class="ach-tile-progress-bar">
              <div class="ach-tile-progress-fill rarity-${ach.rarity}" style="width: ${progress.percentage}%;"></div>
            </div>
            <div class="ach-tile-progress-text">${progress.percentage}% (${progress.current}/${progress.target})</div>
          </div>
        `;

      if (isUnlocked) {
        tile.innerHTML = `
          <div class="ach-rarity-pill rarity-${ach.rarity}">${ach.rarity.toUpperCase()}</div>
          <div class="ach-icon-wrapper unlocked-icon-box rarity-${ach.rarity}">
            <span class="ach-emoji">${ach.icon}</span>
          </div>
          <div class="ach-name">${ach.name}</div>
          ${progressHtml}
        `;
      } else {
        tile.innerHTML = `
          <div class="ach-rarity-pill rarity-${ach.rarity}">${ach.rarity.toUpperCase()}</div>
          <div class="ach-icon-wrapper locked-icon-box rarity-${ach.rarity}">
            <span class="ach-locked-preview">${ach.icon}</span>
            <div class="ach-lock-overlay">🔒</div>
          </div>
          <div class="ach-name">${ach.name}</div>
          ${progressHtml}
        `;
      }

      grid.appendChild(tile);
    });
  },

  // --------------------------------------------------------------------------
  // RANKINGS & TIERS MODAL SHOWCASE
  // --------------------------------------------------------------------------
  showRankingsHub() {
    const content = document.getElementById('rankingsPopupContent');
    if (!content) return;

    const unlocked = (typeof DB !== 'undefined' && DB.getUnlockedAchievements) ? DB.getUnlockedAchievements() : [];
    const totalCount = this.list.length;
    const unlockedCount = unlocked.length;
    const overallPercent = Math.round((unlockedCount / totalCount) * 100);
    const { current, next } = this.getOverallRank(unlockedCount);

    const nextText = next
      ? `${next.min - unlockedCount} more achievements to reach ${next.title}`
      : 'Max Grandmaster Rank Reached! 🌟';

    // Calculate counts per rarity tier
    const rarityCounts = {
      bronze: { total: 0, unlocked: 0, name: 'Bronze', label: 'Common Tier', icon: '🥉', color: '#CD7F32' },
      silver: { total: 0, unlocked: 0, name: 'Silver', label: 'Uncommon Tier', icon: '🥈', color: '#CBD5E1' },
      gold: { total: 0, unlocked: 0, name: 'Gold', label: 'Rare Tier', icon: '🥇', color: '#FBBF24' },
      platinum: { total: 0, unlocked: 0, name: 'Platinum', label: 'Legendary Tier', icon: '💎', color: '#38BDF8' }
    };

    this.list.forEach(a => {
      const rar = a.rarity;
      if (rarityCounts[rar]) {
        rarityCounts[rar].total++;
        if (unlocked.includes(a.id)) rarityCounts[rar].unlocked++;
      }
    });

    content.innerHTML = `
      <div class="category-popup-header">
        <div class="cat-popup-title-group">
          <div class="cat-popup-icon-halo" style="border-color: #F59E0B; background: rgba(245, 158, 11, 0.15); box-shadow: 0 0 14px rgba(245, 158, 11, 0.3);">
            <span>👑</span>
          </div>
          <div class="cat-popup-info-group">
            <h3 class="cat-popup-title">Achievement Rankings</h3>
            <div class="cat-popup-badges-row">
              <span class="cat-popup-rank-badge" style="border-color: #F59E0B; color: #F59E0B;">${current.icon} ${current.title}</span>
              <span class="cat-popup-count">${unlockedCount} / ${totalCount} (${overallPercent}%)</span>
            </div>
          </div>
        </div>
        <button class="cat-popup-close-btn" onclick="Achievements.closeRankingsPopup()" aria-label="Close">✕</button>
      </div>

      <div class="rankings-hub-scroll">
        <!-- Master Rank Status Card -->
        <div class="rank-master-status-card">
          <div class="rank-master-status-top">
            <div>
              <div class="rank-master-subtitle">Overall Standing</div>
              <div class="rank-master-current-title">${current.title}</div>
            </div>
            <div class="rank-master-percent-pill">${overallPercent}%</div>
          </div>
          <div class="ach-cat-card-progress-track" style="margin: 8px 0 6px 0;">
            <div class="ach-cat-card-progress-fill" style="width: ${overallPercent}%; background: linear-gradient(90deg, #F59E0B, #EC4899); box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);"></div>
          </div>
          <div class="rank-master-next-hint">${nextText}</div>
        </div>

        <div class="rank-section-heading">Tap a Rank Tier to View Achievements:</div>

        <!-- 4 Interactive Rank Tier Cards -->
        <div class="rank-tiers-list">
          ${['bronze', 'silver', 'gold', 'platinum'].map(key => {
            const tier = rarityCounts[key];
            const pct = Math.round((tier.unlocked / tier.total) * 100);
            return `
              <div class="rank-tier-card rarity-${key}" onclick="Achievements.showRankAchievements('${key}')">
                <div class="rank-tier-card-left">
                  <div class="rank-tier-icon-wrap">${tier.icon}</div>
                  <div class="rank-tier-info">
                    <div class="rank-tier-name-row">
                      <span class="rank-tier-name">${tier.name} Rank</span>
                      <span class="rank-tier-label-chip">${tier.label}</span>
                    </div>
                    <div class="rank-tier-count-text">${tier.unlocked} of ${tier.total} Unlocked (${pct}%)</div>
                    <div class="rank-tier-mini-track">
                      <div class="rank-tier-mini-fill" style="width: ${pct}%;"></div>
                    </div>
                  </div>
                </div>
                <div class="rank-tier-card-arrow">➔</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  showRankAchievements(rankKey) {
    const content = document.getElementById('rankingsPopupContent');
    if (!content) return;

    const unlocked = (typeof DB !== 'undefined' && DB.getUnlockedAchievements) ? DB.getUnlockedAchievements() : [];
    const stats = this.getStats();

    const rankMeta = {
      bronze: { name: 'Bronze', label: 'Common Tier', icon: '🥉', color: '#CD7F32' },
      silver: { name: 'Silver', label: 'Uncommon Tier', icon: '🥈', color: '#CBD5E1' },
      gold: { name: 'Gold', label: 'Rare Tier', icon: '🥇', color: '#FBBF24' },
      platinum: { name: 'Platinum', label: 'Legendary Tier', icon: '💎', color: '#38BDF8' }
    };

    const currentMeta = rankMeta[rankKey] || rankMeta.gold;
    const filtered = this.list.filter(a => a.rarity === rankKey);
    const countUnlocked = filtered.filter(a => unlocked.includes(a.id)).length;

    // Calculate counts for switcher tabs
    const rarityCounts = {};
    ['bronze', 'silver', 'gold', 'platinum'].forEach(k => {
      const items = this.list.filter(a => a.rarity === k);
      const unl = items.filter(a => unlocked.includes(a.id)).length;
      rarityCounts[k] = { unlocked: unl, total: items.length };
    });

    content.innerHTML = `
      <div class="category-popup-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="rank-back-btn" onclick="Achievements.showRankingsHub()">← Ranks</button>
          <div class="rank-active-pill" style="border-color: ${currentMeta.color}; color: ${currentMeta.color};">
            ${currentMeta.icon} ${currentMeta.name} (${countUnlocked}/${filtered.length})
          </div>
        </div>
        <button class="cat-popup-close-btn" onclick="Achievements.closeRankingsPopup()" aria-label="Close">✕</button>
      </div>

      <!-- Quick Rank Switcher Tabs -->
      <div class="rank-switcher-tabs">
        ${['bronze', 'silver', 'gold', 'platinum'].map(k => {
          const meta = rankMeta[k];
          const counts = rarityCounts[k];
          const isActive = k === rankKey;
          return `
            <button class="rank-switcher-btn ${isActive ? 'active' : ''} rarity-${k}" 
                    onclick="Achievements.showRankAchievements('${k}')">
              <span>${meta.icon}</span>
              <span>${meta.name}</span>
              <span class="rank-switcher-count">${counts.unlocked}/${counts.total}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- 3-Column Achievements Grid for this Rank -->
      <div id="rankAchievementsGrid" class="achievements-popup-grid">
        <!-- Rendered tiles below -->
      </div>
    `;

    const grid = document.getElementById('rankAchievementsGrid');
    if (!grid) return;

    filtered.forEach(ach => {
      const progress = this.computeProgress(ach, stats);
      let isUnlocked = unlocked.includes(ach.id) || progress.isComplete || progress.percentage >= 100;
      if (isUnlocked && !unlocked.includes(ach.id)) {
        unlocked.push(ach.id);
        if (typeof DB !== 'undefined' && DB.saveUnlockedAchievement) {
          DB.saveUnlockedAchievement(ach.id);
        }
      }
      const tile = document.createElement('div');
      tile.className = `ach-tile ${isUnlocked ? 'unlocked achieved' : 'locked'} rarity-${ach.rarity}`;
      tile.onclick = () => this.showModal(ach, isUnlocked, progress);

      const progressHtml = isUnlocked
        ? `<div class="ach-tile-progress-text unlocked">Achieved ✅</div>`
        : `
          <div class="ach-tile-progress-wrap">
            <div class="ach-tile-progress-bar">
              <div class="ach-tile-progress-fill rarity-${ach.rarity}" style="width: ${progress.percentage}%;"></div>
            </div>
            <div class="ach-tile-progress-text">${progress.percentage}% (${progress.current}/${progress.target})</div>
          </div>
        `;

      if (isUnlocked) {
        tile.innerHTML = `
          <div class="ach-rarity-pill rarity-${ach.rarity}">${ach.rarity.toUpperCase()}</div>
          <div class="ach-icon-wrapper unlocked-icon-box rarity-${ach.rarity}">
            <span class="ach-emoji">${ach.icon}</span>
          </div>
          <div class="ach-name">${ach.name}</div>
          ${progressHtml}
        `;
      } else {
        tile.innerHTML = `
          <div class="ach-rarity-pill rarity-${ach.rarity}">${ach.rarity.toUpperCase()}</div>
          <div class="ach-icon-wrapper locked-icon-box rarity-${ach.rarity}">
            <span class="ach-locked-preview">${ach.icon}</span>
            <div class="ach-lock-overlay">🔒</div>
          </div>
          <div class="ach-name">${ach.name}</div>
          ${progressHtml}
        `;
      }

      grid.appendChild(tile);
    });

    grid.scrollTop = 0;
  },

  // Backwards compatibility alias
  renderGrid() {
    if (this.activeCategory && this.activeCategory !== 'all') {
      this.renderCategoryGrid(this.activeCategory);
    } else {
      this.showCategoriesView();
    }
  },

  showModal(ach, isUnlocked, progress) {
    if (!progress) {
      const stats = this.getStats();
      progress = this.computeProgress(ach, stats);
    }
    const isProgressComplete = progress.isComplete || progress.percentage >= 100;
    if (isProgressComplete) {
      isUnlocked = true;
      if (typeof DB !== 'undefined' && DB.saveUnlockedAchievement) {
        DB.saveUnlockedAchievement(ach.id);
      }
    } else if (isUnlocked === undefined) {
      const unlocked = (typeof DB !== 'undefined' && DB.getUnlockedAchievements) ? DB.getUnlockedAchievements() : [];
      isUnlocked = unlocked.includes(ach.id);
    }

    const modalCard = document.querySelector('.achievement-modal-content');
    if (modalCard) {
      if (isUnlocked) {
        modalCard.classList.add('achieved');
      } else {
        modalCard.classList.remove('achieved');
      }
    }

    const iconEl = document.getElementById('modalAchIcon');
    if (iconEl) {
      iconEl.innerHTML = `
        <div class="modal-icon-halo rarity-${ach.rarity} ${isUnlocked ? 'achieved-glow' : ''}">
          <span class="modal-ach-emoji">${ach.icon}</span>
        </div>
      `;
    }

    const nameEl = document.getElementById('modalAchName');
    if (nameEl) nameEl.textContent = ach.name;

    const descEl = document.getElementById('modalAchDesc');
    if (descEl) descEl.textContent = ach.desc;

    const catEl = document.getElementById('modalAchCategory');
    if (catEl) {
      catEl.textContent = `${ach.categoryIcon || '🎯'} ${ach.categoryName || ach.category}`;
    }

    const rarityEl = document.getElementById('modalAchRarity');
    if (rarityEl) {
      rarityEl.className = `ach-status-badge rarity-${ach.rarity}`;
      rarityEl.textContent = ach.rarityLabel || `${ach.rarity.toUpperCase()}`;
    }

    const badge = document.getElementById('modalAchStatus');
    if (badge) {
      if (isUnlocked) {
        badge.innerHTML = 'Achieved 🎉';
        badge.className = 'ach-status-badge unlocked achieved';
      } else {
        badge.innerHTML = 'Locked 🔒';
        badge.className = 'ach-status-badge locked';
      }
    }

    const xpEl = document.getElementById('modalAchXP');
    if (xpEl) {
      xpEl.textContent = `+${ach.xp} XP`;
      if (isUnlocked) {
        xpEl.className = 'ach-status-badge xp-pill achieved-xp';
      } else {
        xpEl.className = 'ach-status-badge xp-pill';
      }
    }

    const progBar = document.getElementById('modalAchProgressBar');
    if (progBar) {
      progBar.style.width = isUnlocked ? '100%' : `${progress.percentage}%`;
      progBar.className = isUnlocked 
        ? `modal-progress-fill achieved-fill rarity-${ach.rarity}` 
        : `modal-progress-fill rarity-${ach.rarity}`;
    }

    const progText = document.getElementById('modalAchProgressText');
    if (progText) {
      progText.textContent = isUnlocked
        ? `100% Completed (${progress.target} / ${progress.target})`
        : `${progress.percentage}% Complete (${progress.current} / ${progress.target})`;
    }

    const modal = document.getElementById('achievementDetailModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeModal() {
    const modal = document.getElementById('achievementDetailModal');
    if (modal) modal.classList.add('hidden');
  }
};

// Auto-initialize when window loads or script loads
if (typeof window !== 'undefined') {
  window.Achievements = Achievements;
}
