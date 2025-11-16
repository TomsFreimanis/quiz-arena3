// src/services/missions.js
import { db, getUserData, addXP, addCoins } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

const MISSION_POOL = [
  {
    id: "finish_3_games",
    type: "games",
    target: 3,
    reward: { xp: 80, coins: 20 },
    title: "Pabeidz 3 spēles",
    desc: "Izspēlē un pabeidz 3 viktorīnas vienā dienā.",
  },
  {
    id: "score_60",
    type: "score",
    target: 1,
    reward: { xp: 120, coins: 30 },
    title: "Stiprs skors",
    desc: "Iegūsti vismaz 60 punktus vienā spēlē.",
  },
  {
    id: "play_2_sports",
    type: "sports_games",
    target: 2,
    reward: { xp: 70, coins: 15 },
    title: "Sporta diena",
    desc: "Pabeidz 2 spēles sporta tēmā.",
  },
  {
    id: "earn_100_xp",
    type: "xp",
    target: 100,
    reward: { xp: 0, coins: 25 },
    title: "XP krājējs",
    desc: "Sakrāj 100 XP vienā dienā.",
  },
  {
    id: "earn_30_coins",
    type: "coins",
    target: 30,
    reward: { xp: 40, coins: 0 },
    title: "Monētu meistars",
    desc: "Nopelni 30 monētas vienā dienā.",
  },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

function pickRandomMissions(count = 3) {
  const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((m) => ({
    ...m,
    progress: 0,
    completed: false,
  }));
}

// 🔹 Nodrošina, ka lietotājam ir šodienas misijas
export const ensureDailyMissions = async (uid) => {
  const data = await getUserData(uid);
  const ref = doc(db, "users", uid);
  const current = data?.dailyMissions;

  const today = todayStr();

  if (!current || current.date !== today) {
    const missions = pickRandomMissions(3);
    const newObj = { date: today, missions };
    await updateDoc(ref, { dailyMissions: newObj });
    return newObj;
  }

  return current;
};

// 🔹 Atjaunina daily missions pēc spēles
// context: { score, topic, xpEarned, coinsEarned }
export const updateDailyMissionsOnGameEnd = async (uid, context) => {
  if (!uid) return [];
  const { score = 0, topic = "", xpEarned = 0, coinsEarned = 0 } =
    context || {};

  let daily = await ensureDailyMissions(uid);
  const missions = daily.missions || [];

  const newlyCompleted = [];

  const updatedMissions = missions.map((m) => {
    if (m.completed) return m;

    let prog = m.progress || 0;

    switch (m.type) {
      case "games":
        // katra pabeigta spēle +1
        prog += 1;
        break;
      case "score":
        if (score >= 60) prog += 1;
        break;
      case "sports_games":
        if (topic.toLowerCase().includes("sport")) prog += 1;
        break;
      case "xp":
        prog += xpEarned;
        break;
      case "coins":
        prog += coinsEarned;
        break;
      default:
        break;
    }

    const completed = prog >= m.target;
    if (completed) newlyCompleted.push(m);

    return {
      ...m,
      progress: Math.min(prog, m.target),
      completed,
    };
  });

  daily = {
    ...daily,
    missions: updatedMissions,
  };

  await updateDoc(doc(db, "users", uid), {
    dailyMissions: daily,
  });

  // piešķiram balvas par tikko pabeigtajām misijām
  for (const m of newlyCompleted) {
    if (m.reward?.xp) await addXP(uid, m.reward.xp);
    if (m.reward?.coins) await addCoins(uid, m.reward.coins);
  }

  return newlyCompleted;
};
