// src/services/rewards.js
import { db, getUserData, addCoins } from "./firebase";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";

const LEVEL_REWARDS = {
  5: {
    coins: 50,
    boosts: { fiftyFifty: 1 },
  },
  10: {
    coins: 100,
    boosts: { golden: 1 },
  },
  20: {
    coins: 200,
    boosts: { golden: 2, stopTime: 2 },
    frame: "gold_frame",
  },
};

export const checkAndGrantLevelRewards = async (uid) => {
  const data = await getUserData(uid);
  if (!data) return [];

  const level = data.level || 1;
  const claimed = data.claimedLevelRewards || [];
  const ref = doc(db, "users", uid);

  const newlyClaimed = [];

  for (const [lvlStr, reward] of Object.entries(LEVEL_REWARDS)) {
    const lvl = parseInt(lvlStr, 10);
    if (level >= lvl && !claimed.includes(lvl)) {
      // piešķiram naglas
      if (reward.coins) {
        await addCoins(uid, reward.coins);
      }
      if (reward.boosts) {
        const updateObj = {};
        for (const [key, amount] of Object.entries(reward.boosts)) {
          updateObj[`boosts.${key}`] = increment(amount);
        }
        await updateDoc(ref, updateObj);
      }
      if (reward.frame) {
        await updateDoc(ref, {
          ownedFrames: arrayUnion(reward.frame),
        });
      }
      newlyClaimed.push(lvl);
    }
  }

  if (newlyClaimed.length > 0) {
    await updateDoc(ref, {
      claimedLevelRewards: arrayUnion(...newlyClaimed),
    });
  }

  return newlyClaimed;
};
