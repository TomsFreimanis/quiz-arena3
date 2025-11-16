// src/services/weekly.js
import { db, getUserData, addCoins } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

const defaultWeeklyChallenge = () => {
  // šobrīd – vienkāršs XP challenge
  return {
    type: "xp",
    progress: 0,
    target: 400,
    reward: { coins: 150, frame: "gold_frame" },
    completed: false,
    claimed: false,
  };
};

// Nodrošina weekly objektu
export const ensureWeeklyChallenge = async (uid) => {
  const data = await getUserData(uid);
  const ref = doc(db, "users", uid);

  const { year, week } = getWeekKey();
  const current = data?.weekly;

  if (!current || current.year !== year || current.week !== week) {
    const weekly = {
      year,
      week,
      ...defaultWeeklyChallenge(),
    };
    await updateDoc(ref, { weekly });
    return weekly;
  }

  return current;
};

// Atjaunina weekly pēc spēles
// context: { xpEarned }
export const updateWeeklyOnGameEnd = async (uid, context) => {
  if (!uid) return null;
  const { xpEarned = 0 } = context || {};

  let weekly = await ensureWeeklyChallenge(uid);
  if (!weekly || weekly.completed) return weekly;

  let prog = weekly.progress || 0;
  prog += xpEarned;

  let completed = prog >= weekly.target;

  weekly = {
    ...weekly,
    progress: Math.min(prog, weekly.target),
    completed,
  };

  await updateDoc(doc(db, "users", uid), { weekly });

  // Balvu piešķirsim FRONTEND pusē (kad lietotājs "claim")
  return weekly;
};

// Vienkāršs claim (piemēram no Weekly.jsx vēlāk)
export const claimWeeklyReward = async (uid) => {
  const data = await getUserData(uid);
  if (!data?.weekly) return null;

  const weekly = data.weekly;
  if (!weekly.completed || weekly.claimed) return weekly;

  const ref = doc(db, "users", uid);
  if (weekly.reward?.coins) {
    await addCoins(uid, weekly.reward.coins);
  }

  const updated = {
    ...weekly,
    claimed: true,
  };

  await updateDoc(ref, { weekly: updated });

  return updated;
};
