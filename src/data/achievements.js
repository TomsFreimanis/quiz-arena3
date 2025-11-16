// src/data/achievements.js
export const NBA_ACHIEVEMENTS = {
  first_game: {
    title: "Rookie Debut",
    desc: "Pabeidz savu pirmo NBA quiz spēli.",
    icon: "🏀",
    rarity: "bronze",
    progress: (user) => (user.gamesPlayed > 0 ? 1 : 0),
    goal: 1,
  },

  score_80: {
    title: "Kobe 81 Mode",
    desc: "Iegūsti vismaz 80 punktus vienā spēlē.",
    icon: "🔥",
    rarity: "silver",
    progress: (user) => (user.bestScore >= 80 ? 1 : 0),
    goal: 1,
  },

  score_100: {
    title: "Wilt 100 Club",
    desc: "Iegūsti perfekto 100 punktu spēli.",
    icon: "💯",
    rarity: "gold",
    progress: (user) => (user.bestScore >= 100 ? 1 : 0),
    goal: 1,
  },

  hard_mode_win: {
    title: "Mamba Mentality",
    desc: "Uzvari Hard mode.",
    icon: "🐍",
    rarity: "gold",
    progress: (user) => user.hardWins || 0,
    goal: 1,
  },

  ultra_lebron_win: {
    title: "Ultra LeBron GOAT",
    desc: "Pārvari ULTRA LeBron režīmu.",
    icon: "👑",
    rarity: "diamond",
    progress: (user) => user.ultraWins || 0,
    goal: 1,
  },

  streak_3: {
    title: "Triple-Double",
    desc: "Uzvari 3 spēles pēc kārtas.",
    icon: "📊",
    rarity: "silver",
    progress: (user) => user.bestStreak || 0,
    goal: 3,
  },

  "20_games": {
    title: "Veteran",
    desc: "Nospēlē 20 spēles.",
    icon: "🧓",
    rarity: "silver",
    progress: (user) => user.gamesPlayed || 0,
    goal: 20,
  },

  "7_day_streak": {
    title: "Ironman Streak",
    desc: "Ielogojies 7 dienas pēc kārtas.",
    icon: "🔥🔥",
    rarity: "gold",
    progress: (user) => user.dailyReward?.streak || 0,
    goal: 7,
  },

  shop_purchase: {
    title: "GM Manager",
    desc: "Nopērc priekšmetu veikalā.",
    icon: "💼",
    rarity: "bronze",
    progress: (user) => (user.shopPurchases > 0 ? 1 : 0),
    goal: 1,
  },
};
