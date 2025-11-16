// src/services/chests.js
import { db, getUserData, addXP, addCoins } from "./firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export const grantChest = async (uid, type = "basic") => {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    [`chests.${type}`]: increment(1),
  });
};

// Atver lādīti un piešķir random balvu
export const openChest = async (uid, type = "basic") => {
  if (!uid) return { ok: false, reason: "no_uid" };

  const data = await getUserData(uid);
  const currentCount = data?.chests?.[type] || 0;
  if (currentCount <= 0) {
    return { ok: false, reason: "no_chest" };
  }

  // Vienkāršs random loģikas piemērs
  let reward = { xp: 0, coins: 0 };

  if (type === "basic") {
    reward = {
      xp: 50 + Math.floor(Math.random() * 51), // 50-100
      coins: 20 + Math.floor(Math.random() * 31), // 20-50
    };
  } else if (type === "rare") {
    reward = {
      xp: 120 + Math.floor(Math.random() * 81),
      coins: 60 + Math.floor(Math.random() * 61),
    };
  } else if (type === "epic") {
    reward = {
      xp: 250 + Math.floor(Math.random() * 151),
      coins: 120 + Math.floor(Math.random() * 101),
    };
  }

  if (reward.xp) await addXP(uid, reward.xp);
  if (reward.coins) await addCoins(uid, reward.coins);

  // Samazinam lādīšu skaitu
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    [`chests.${type}`]: currentCount - 1,
  });

  return { ok: true, reward };
};
