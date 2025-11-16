const storeItems = [
  /* =====================================================================================
     🎮 BOOSTS (MAX 5 LIMIT) 
     ===================================================================================== */
  {
    id: "freeze_pack",
    name: "Freeze Time x3",
    icon: "❄️",
    desc: "+12s pie taimeriem (3 reizes).",
    price: 60,
    type: "boost",
    boostKey: "freezeTime"
  },
  {
    id: "doublexp_pack",
    name: "Double XP x3",
    icon: "⚡",
    desc: "Dubulto XP 3 spēlēm.",
    price: 80,
    type: "boost",
    boostKey: "doubleXP"
  },
  {
    id: "fifty_pack",
    name: "50/50 x3",
    icon: "🎰",
    desc: "Noņem 2 nepareizas atbildes (3 reizes).",
    price: 70,
    type: "boost",
    boostKey: "fiftyFifty"
  },
  {
    id: "skip_pack",
    name: "Skip x3",
    icon: "⏩",
    desc: "Izlaid 3 jautājumus bez soda.",
    price: 50,
    type: "boost",
    boostKey: "skip"
  },
  {
    id: "golden_pack",
    name: "Golden Question x2",
    icon: "🌟",
    desc: "2 golden jautājumi ar x3 punktiem.",
    price: 90,
    type: "boost",
    boostKey: "golden"
  },

  /* =====================================================================================
     👑 VIP / PREMIUM
     ===================================================================================== */
  {
    id: "vip_pass",
    name: "VIP Pass",
    icon: "👑",
    desc: "Pastāvīgs XP + bonusi nākotnē.",
    price: 200,
    type: "vip"
  },

  /* =====================================================================================
     🔓 UNLOCKABLES / MODES
     ===================================================================================== */
  {
    id: "ultra_mode",
    name: "Ultra LeBron Unlock",
    icon: "🔥",
    desc: "Atbloķē ULTRA LEBRON režīmu.",
    price: 150,
    type: "topic",
    unlockKey: "mode_ultra"
  },
  {
    id: "hardcore_mode",
    name: "Hardcore NBA Unlock",
    icon: "💀",
    desc: "Atbloķē Hardcore NBA jautājumus + bonus XP.",
    price: 45,
    type: "topic",
    unlockKey: "mode_hardcore"
  },

  /* =====================================================================================
     🎨 COSMETICS (frames, banners, icons)
     ===================================================================================== */
  {
    id: "profile_frame_gold",
    name: "Zelta profila rāmis",
    icon: "🟨",
    desc: "Premium profila rāmis MVP spēlētājiem.",
    price: 22,
    type: "cosmetic",
    cosmeticId: "frame_gold"
  },
  {
    id: "mvp_banner",
    name: "MVP Profila Baneris",
    icon: "🏆",
    desc: "Ekskluzīvs baneris profilā spēlētājiem ar statusu.",
    price: 20,
    type: "cosmetic",
    cosmeticId: "banner_mvp"
  },

  /* =====================================================================================
     🌈 UI THEMES
     ===================================================================================== */
  {
    id: "ultra_ui_theme",
    name: "Ultra NBA UI Theme",
    icon: "🎨",
    desc: "Premium zilo/zeltaino NBA stilu UI.",
    price: 50,
    type: "theme",
    themeId: "theme_ultra_nba"
  },

  /* =====================================================================================
     💥 VFX PACKS
     ===================================================================================== */
  {
    id: "arena_vfx_pack",
    name: "Arena VFX Pack",
    icon: "✨",
    desc: "Premium VFX pareizām/nepareizām atbildēm.",
    price: 40,
    type: "vfx",
    vfxId: "vfx_arena"
  },
  {
    id: "slam_dunk_fx",
    name: "Slam Dunk FX",
    icon: "🏀",
    desc: "Speciālas skaņas boostiem un pareizām atbildēm.",
    price: 18,
    type: "vfx",
    vfxId: "vfx_slamdunk"
  },

  /* =====================================================================================
     ⏳ BUFFS (Temporary boosts)
     ===================================================================================== */
  {
    id: "xp_boost_24h",
    name: "XP x2 — 24h",
    icon: "⏱️",
    desc: "24h laikā iegūsti x2 XP visam.",
    price: 55,
    type: "duration_boost",
    boostKey: "doubleXP24h",
    durationHours: 24
  },
  {
    id: "daily_reward_x2",
    name: "Daily Reward x2 — 3 days",
    icon: "🎁",
    desc: "3 dienas saņem dubultu daily reward.",
    price: 32,
    type: "duration_boost",
    boostKey: "dailyReward2x",
    durationHours: 72
  },

  /* =====================================================================================
     ⚡ SPECIAL ITEMS
     ===================================================================================== */
  {
    id: "streak_saver",
    name: "Streak Saver",
    icon: "🛟",
    desc: "1x aizsargā tavu streeeku, ja zaudē.",
    price: 30,
    type: "special"
  },
  {
    id: "random_booster_pack",
    name: "Random Booster Pack",
    icon: "🎁",
    desc: "Saņem 1–3 random boosterus.",
    price: 25,
    type: "special"
  }
];

export default storeItems;
