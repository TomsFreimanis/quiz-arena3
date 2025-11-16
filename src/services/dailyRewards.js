// src/services/dailyRewards.js
import { db, getUserData, addXP, addCoins } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";
import { grantChest } from "./chests";

const todayStr = () => new Date().toISOString().slice(0, 10);

function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Nodrošina, ka lietotājam ir dailyReward objekts
export const ensureDailyReward = async (uid) => {
  const data = await getUserData(uid);
  const ref = doc(db, "users", uid);

  if (!data?.dailyReward) {
    const obj = { lastClaim: null, streak: 0 };
    await updateDoc(ref, { dailyReward: obj });
    return obj;
  }
  return data.dailyReward;
};

// Gala funkcija – lietotājs saņem dienas balvu
export const claimDailyReward = async (uid) => {
  if (!uid) return { ok: false, reason: "no_uid" };

  const ref = doc(db, "users", uid);
  let daily = await ensureDailyReward(uid);

  const today = todayStr();
  const last = daily.lastClaim;

  if (last && last === today) {
    return { ok: false, reason: "already_claimed", daily };
  }

  let newStreak = 1;
  if (last) {
    const diff = daysBetween(last, today);
    if (diff === 1) newStreak = (daily.streak || 0) + 1;
    else if (diff > 1) newStreak = 1;
  }

  // Balvu tabula
  let reward = { xp: 20, coins: 10, chest: null };

  if (newStreak === 3) reward = { xp: 40, coins: 30, chest: null };
  if (newStreak === 5) reward = { xp: 70, coins: 40, chest: null };
  if (newStreak === 7) reward = { xp: 100, coins: 60, chest: "basic" };
  if (newStreak === 14) reward = { xp: 200, coins: 120, chest: "rare" };
  if (newStreak === 30) reward = { xp: 400, coins: 200, chest: "epic" };

  // Pieliek XP/coins
  if (reward.xp) await addXP(uid, reward.xp);
  if (reward.coins) await addCoins(uid, reward.coins);
  if (reward.chest) await grantChest(uid, reward.chest);

  daily = { lastClaim: today, streak: newStreak };
  await updateDoc(ref, { dailyReward: daily });

  return { ok: true, reward, daily };
};
