// src/services/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";

// -----------------------------------------------------
// 🔥 FIREBASE CONFIG
// -----------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// -----------------------------------------------------
// 🧩 ensureUserDocument — creates missing fields
// -----------------------------------------------------
export const ensureUserDocument = async (uid, email, name, photo) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: email || "",
      name: name || "",
      photo: photo || "",
      points: 0,
      coins: 0,
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      history: [],
      unlockedTopics: [],
      boosts: {
        doubleXP: 0,
        freezeTime: 0,
        fiftyFifty: 0,
        hint: 0,
        skip: 0,
        golden: 0,
        streakSaver: 0,
        vip: false,
      },
      dailyReward: { lastClaim: null, streak: 0 },
      achievements: [],
      cosmetics: {},
      buffs: {
        xpBoostUntil: 0,
        dailyRewardX2Until: 0,
      },
      packs: {
        freeLast: null,
        progress: 0,
        cosmetics: [],
      },
      joinedAt: new Date().toISOString(),
    });

    return;
  }

  const data = snap.data();
  const patch = {};

  if (data.points == null) patch.points = 0;
  if (data.coins == null) patch.coins = 0;
  if (data.level == null) patch.level = 1;
  if (data.xp == null) patch.xp = 0;
  if (data.gamesPlayed == null) patch.gamesPlayed = 0;

  if (!Array.isArray(data.history)) patch.history = [];
  if (!Array.isArray(data.unlockedTopics)) patch.unlockedTopics = [];
  if (!Array.isArray(data.achievements)) patch.achievements = [];

  if (data.dailyReward == null)
    patch.dailyReward = { lastClaim: null, streak: 0 };

  if (data.boosts == null)
    patch.boosts = {
      doubleXP: 0,
      freezeTime: 0,
      fiftyFifty: 0,
      hint: 0,
      skip: 0,
      golden: 0,
      streakSaver: 0,
      vip: false,
    };

  if (data.cosmetics == null) patch.cosmetics = {};
  if (data.buffs == null)
    patch.buffs = { xpBoostUntil: 0, dailyRewardX2Until: 0 };

  if (data.packs == null)
    patch.packs = {
      freeLast: null,
      progress: 0,
      cosmetics: [],
    };

  if (Object.keys(patch).length > 0) {
    await updateDoc(ref, patch);
  }
};

// -----------------------------------------------------
// 🔐 Google login
// -----------------------------------------------------
export const signInWithGoogle = async () => {
  const res = await signInWithPopup(auth, googleProvider);
  const u = res.user;
  await ensureUserDocument(u.uid, u.email, u.displayName, u.photoURL);
  return res;
};

// -----------------------------------------------------
// 🔐 Email register
// -----------------------------------------------------
export const signUpWithEmail = async (email, password, name = "") => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const u = res.user;
  await ensureUserDocument(u.uid, email, name, "");
  return res;
};

// -----------------------------------------------------
// 🔐 Email login
// -----------------------------------------------------
export const signInUserWithEmail = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const u = res.user;
  await ensureUserDocument(u.uid, u.email, u.displayName, u.photoURL);
  return res;
};

// -----------------------------------------------------
export const logout = () => signOut(auth);

// -----------------------------------------------------
// 📄 User helpers
// -----------------------------------------------------
export const getUserData = async (uid) => {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserSafe = async (uid, updates) => {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, updates, { merge: true });
  } else {
    await updateDoc(ref, updates);
  }
};

// -----------------------------------------------------
// ⭐ Points / coins / XP
// -----------------------------------------------------
export const addPoints = (uid, pts) =>
  updateDoc(doc(db, "users", uid), { points: increment(pts) });

export const addCoins = (uid, c) =>
  updateDoc(doc(db, "users", uid), { coins: increment(c) });

export const addXP = async (uid, xpToAdd) => {
  if (!uid || !xpToAdd) return;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const currentXP = data.xp || 0;
  const currentLevel = data.level || 1;

  let multiplier = 1;

  if (data.buffs?.xpBoostUntil > Date.now()) {
    multiplier = 2;
  }

  const finalXP = currentXP + xpToAdd * multiplier;
  const threshold = 100 * currentLevel;

  if (finalXP >= threshold) {
    await updateDoc(ref, {
      level: currentLevel + 1,
      xp: finalXP - threshold,
    });
  } else {
    await updateDoc(ref, { xp: finalXP });
  }
};

// -----------------------------------------------------
// 📝 Game history (USED BY QUIZ)
// -----------------------------------------------------
export const saveGameHistory = async (uid, topic, score) => {
  if (!uid) return;

  await updateDoc(doc(db, "users", uid), {
    gamesPlayed: increment(1),
    history: arrayUnion({
      topic,
      score,
      date: new Date().toISOString(),
    }),
  });
};

// -----------------------------------------------------
// ⚡ Boost consumption
// -----------------------------------------------------
export const consumeBoost = async (uid, key) => {
  if (!uid || !key) return;
  if (key === "vip") return;
  await updateDoc(doc(db, "users", uid), {
    [`boosts.${key}`]: increment(-1),
  });
};

// -----------------------------------------------------
// 🏆 Achievements unlock
// -----------------------------------------------------
export const unlockAchievements = async (uid, ids) => {
  if (!uid || !ids?.length) return;

  await updateDoc(doc(db, "users", uid), {
    achievements: arrayUnion(...ids),
  });
};

// -----------------------------------------------------
// 🎁 OPEN PACK — removes 25 coins + gives reward
// -----------------------------------------------------
export const openPack = async (uid, reward) => {
  if (!uid) return { ok: false, reason: "not_logged_in" };

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ok: false, reason: "user_not_found" };

  const user = snap.data();
  const currentCoins = user.coins ?? 0;

  if (currentCoins < 25) {
    return { ok: false, reason: "not_enough_coins" };
  }

  // coins delta: -25 cost + possible reward coins
  let coinsDelta = -25;

  const updates = {
    // coins tiks iestatīti tālāk, kad zināms coinsDelta
    "packs.progress": increment(1),
    history: arrayUnion({
      type: "pack_open",
      reward,
      date: new Date().toISOString(),
    }),
  };

  // 🟡 Reward: coins
  if (reward.type === "coins") {
    coinsDelta += reward.amount || 0;
  }

  updates.coins = increment(coinsDelta);

  // 🟣 Reward: XP
  if (reward.type === "xp" && typeof reward.amount === "number") {
    updates.xp = increment(reward.amount);
  }

  // ⚡ Reward: Boost
  if (reward.type === "boost" && reward.key) {
    updates[`boosts.${reward.key}`] = increment(1);
  }

  // ⭐ Reward: Cosmetic
  if (reward.type === "cosmetic" && reward.cosmeticId) {
    updates[`cosmetics.${reward.cosmeticId}`] = true;
  }

  await updateDoc(ref, updates);
  return { ok: true };
};

// -----------------------------------------------------
// 🛒 Store purchase item
// -----------------------------------------------------
export const purchaseItem = async (uid, item) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return { ok: false, reason: "user_not_found" };

  const user = snap.data();

  if (user.coins < item.price) {
    return { ok: false, reason: "not_enough_coins" };
  }

  const updates = { coins: increment(-item.price) };

  // boost
  if (item.type === "boost" && item.boostKey) {
    const current = user.boosts?.[item.boostKey] || 0;
    updates[`boosts.${item.boostKey}`] = current + 1;
  }

  // cosmetic
  if (item.type === "cosmetic" && item.cosmeticId) {
    updates[`cosmetics.${item.cosmeticId}`] = true;
  }

  // topics
  if (item.type === "topic" && item.unlockKey) {
    updates.unlockedTopics = arrayUnion(item.unlockKey);
  }

  await updateDoc(ref, updates);
  return { ok: true };
};
