// src/utils/packRewards.js

// --- CS2 style rarity colors ---
export const RARITY = {
  common: { color: "#dcdcdc", chance: 60 },
  rare: { color: "#4da6ff", chance: 30 },
  epic: { color: "#b44dff", chance: 8 },
  legendary: { color: "#ffcc33", chance: 2 },
};

// --- Reward pool with rarities ---
export const POOL = [
  // COMMON (60%)
  {
    type: "coins",
    amount: 200,
    name: "200coins",
    desc: "Monētu bonuss",
    rarity: "common",
  },
  {
    type: "xp",
    amount: 20,
    name: "20 XP",
    desc: "XP bonuss",
    rarity: "common",
  },
  {
    type: "boost",
    key: "skip",
    name: "Skip",
    desc: "Izlaid 1 jautājumu",
    rarity: "common",
  },

  // RARE (30%)
  {
    type: "boost",
    key: "freezeTime",
    name: "Freeze Time",
    desc: "+12s pie taimeriem",
    rarity: "rare",
  },
  {
    type: "coins",
    amount: 500,
    name: "500 coins",
    desc: "Jackpot coins",
    rarity: "rare",
  },
  {
    type: "xp",
    amount: 50,
    name: "50 XP",
    desc: "Mega XP",
    rarity: "rare",
  },

  // EPIC (8%)
  {
    type: "boost",
    key: "doubleXP",
    name: "Double XP",
    desc: "x2 XP spēlei",
    rarity: "epic",
  },

  // LEGENDARY (2%)
  {
    type: "cosmetic",
    cosmeticId: "mvp_banner_gold",
    name: "Golden MVP Banner",
    desc: "Ekskluzīvs profils",
    rarity: "legendary",
  },
];

// --- Weighted random pick ---
export function getRandomReward() {
  const roll = Math.random() * 100;

  let cumulative = 0;
  for (const rarity in RARITY) {
    cumulative += RARITY[rarity].chance;
    if (roll <= cumulative) {
      const filtered = POOL.filter(r => r.rarity === rarity);
      return { ...filtered[Math.floor(Math.random() * filtered.length)] };
    }
  }

  // fallback (never happens)
  return { ...POOL[0] };
}
