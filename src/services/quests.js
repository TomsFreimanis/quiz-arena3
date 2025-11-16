// src/services/quests.js
import { db, getUserData, addXP, addCoins } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

// Ilgtermiņa uzdevumi
const QUEST_DEFS = [
  {
    id: "play_10_games",
    type: "games_total",
    target: 10,
    title: "Spēļu maratons",
    desc: "Pabeidz 10 viktorīnas.",
    reward: { xp: 150, coins: 50 },
  },
  {
    id: "score_500_total",
    type: "score_total",
    target: 500,
    title: "Punktu kolekcionārs",
    desc: "Kopā sakrāj 500 punktus.",
    reward: { xp: 200, coins: 80 },
  },
  {
    id: "xp_1000",
    type: "xp_total",
    target: 1000,
    title: "XP meistars",
    desc: "Sakrāj 1000 XP.",
    reward: { xp: 0, coins: 150 },
  },
  {
    id: "sports_5_games",
    type: "sports_games",
    target: 5,
    title: "Sporta fana izaicinājums",
    desc: "Pabeidz 5 spēles sporta tēmā.",
    reward: { xp: 200, coins: 100 },
  },
];

// Nodrošina, ka userim ir quests masīvs
export const ensureQuests = async (uid) => {
  const data = await getUserData(uid);
  const ref = doc(db, "users", uid);

  if (!data?.quests) {
    const initial = QUEST_DEFS.map((q) => ({
      id: q.id,
      progress: 0,
      completed: false,
    }));
    await updateDoc(ref, { quests: initial });
    return initial;
  }

  // Ja pievienosim jaunus questus nākotnē
  const existing = data.quests;
  const idsExisting = existing.map((q) => q.id);
  const missing = QUEST_DEFS.filter((q) => !idsExisting.includes(q.id)).map(
    (q) => ({
      id: q.id,
      progress: 0,
      completed: false,
    })
  );
  if (missing.length) {
    const updated = [...existing, ...missing];
    await updateDoc(ref, { quests: updated });
    return updated;
  }

  return existing;
};

// Atjaunina uzdevumus pēc spēles
// context: { score, topic, xpEarned }
export const updateQuestsOnGameEnd = async (uid, context) => {
  if (!uid) return [];
  const { score = 0, topic = "", xpEarned = 0 } = context || {};

  const data = await getUserData(uid);
  const ref = doc(db, "users", uid);

  let quests = await ensureQuests(uid);
  const newlyCompleted = [];

  const toDef = (id) => QUEST_DEFS.find((q) => q.id === id);

  const totalGames = (data.gamesPlayed || 0) + 1;
  const totalScore = (data.points || 0) + score;
  const totalXp = (data.xp || 0) + xpEarned;

  quests = quests.map((q) => {
    if (q.completed) return q;

    const def = toDef(q.id);
    if (!def) return q;

    let prog = q.progress || 0;

    switch (def.type) {
      case "games_total":
        prog = totalGames;
        break;
      case "score_total":
        prog = totalScore;
        break;
      case "xp_total":
        prog = totalXp;
        break;
      case "sports_games":
        if (topic.toLowerCase().includes("sport")) {
          prog += 1;
        }
        break;
      default:
        break;
    }

    const completed = prog >= def.target;
    if (completed) newlyCompleted.push(def);

    return {
      ...q,
      progress: Math.min(prog, def.target),
      completed,
    };
  });

  await updateDoc(ref, { quests });

  // Piešķir balvas par tikko pabeigtajiem
  for (const def of newlyCompleted) {
    if (def.reward?.xp) await addXP(uid, def.reward.xp);
    if (def.reward?.coins) await addCoins(uid, def.reward.coins);
  }

  return newlyCompleted;
};
