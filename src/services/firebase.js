// =======================================================
//  Firebase BACKEND — pilns fails ar draugu sistēmu
// =======================================================

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
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { AVATARS } from "../utils/avatarList";

// =======================================================
// 🔧 Helperi
// =======================================================

// Vienkāršs friend code ģenerators: ABC123
function generateFriendCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 3; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
}

// =======================================================
// 🎁 DAILY REWARD
// =======================================================

export const claimDailyReward = async (uid) => {
  if (!uid) return { ok: false, reason: "not_logged_in" };

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ok: false, reason: "user_not_found" };

  const user = snap.data();
  const now = Date.now();
  const today = new Date().toDateString();

  const lastClaim = user.dailyReward?.lastClaim
    ? new Date(user.dailyReward.lastClaim).toDateString()
    : null;

  let streak = user.dailyReward?.streak || 0;

  if (lastClaim === today) {
    return { ok: false, reason: "already_claimed" };
  }

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastClaim === yesterday) streak += 1;
  else streak = 1;

  const rewardTable = {
    1: { type: "coins", amount: 50 },
    2: { type: "xp", amount: 100 },
    3: { type: "coins", amount: 100 },
    4: { type: "boost", key: "freezeTime" },
    5: { type: "boost", key: "doubleXP" },
    6: { type: "coins", amount: 150 },
    7: { type: "cosmetic", cosmeticId: "frame_gold" },
  };

  const reward = rewardTable[streak] || rewardTable[1];

  const hasX2 = user.buffs?.dailyRewardX2Until > now;
  const multiplier = hasX2 && reward.amount ? 2 : 1;

  const updates = {
    "dailyReward.lastClaim": now,
    "dailyReward.streak": streak,
  };

  if (reward.type === "coins") {
    updates.coins = increment(reward.amount * multiplier);
  }
  if (reward.type === "xp") {
    updates.xp = (user.xp || 0) + reward.amount * multiplier;
  }
  if (reward.type === "boost") {
    const cur = user.boosts?.[reward.key] || 0;
    updates[`boosts.${reward.key}`] = cur + 1;
  }
  if (reward.type === "cosmetic") {
    updates[`cosmetics.${reward.cosmeticId}`] = true;
  }

  await updateDoc(ref, updates);

  return {
    ok: true,
    streak,
    reward,
    multiplier,
  };
};

// =======================================================
//  Firebase CONFIG
// =======================================================

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

// =======================================================
// ⭐ createUserProfile (ja kur citur izmanto)
// =======================================================

export async function createUserProfile(user) {
  const defaultAvatar =
    AVATARS.find((a) => a.price === 0) || {
      id: "common1",
      url: "/avatars/common1.png",
    };

  await setDoc(doc(db, "users", user.uid), {
    name: user.displayName || "Player",
    email: user.email,
    photoURL: user.photoURL || defaultAvatar.url,
    avatarId: defaultAvatar.id,
    coins: 0,
    xp: 0,
    level: 1,
    ownedAvatars: [defaultAvatar.id],
  });
}

// =======================================================
//  ensureUserDocument + draugu sistēmas lauki
// =======================================================

export const ensureUserDocument = async (uid, email, name, photo) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  // Jaunas lietotājs
  if (!snap.exists()) {
    const defaultAvatar =
      AVATARS.find((a) => a.price === 0) || {
        id: "common1",
        url: "/avatars/common1.png",
      };

    await setDoc(ref, {
      email: email || "",
      name: name || "",
      photo: photo || "",
      points: 0,
      coins: 500,
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      history: [],
      unlockedTopics: ["rookie"],

      boosts: {
        doubleXP: 1,
        freezeTime: 1,
        fiftyFifty: 1,
        hint: 1,
        skip: 1,
        golden: 1,
        streakSaver: 1,
        vip: false,
      },

      cosmetics: {
        frame_basic: true,
        banner_basic: true,
      },

      dailyReward: { lastClaim: null, streak: 0 },

      buffs: {
        xpBoostUntil: 0,
        dailyRewardX2Until: 0,
      },

      packs: {
        freeLast: null,
        progress: 0,
        cosmetics: [],
      },

      achievements: [],

      avatarId: defaultAvatar.id,
      ownedAvatars: [defaultAvatar.id],

      // ⭐ Draugu sistēma
      friendCode: generateFriendCode(),
      friends: [],
      friendRequests: {
        incoming: [],
        outgoing: [],
      },

      joinedAt: new Date().toISOString(),
    });

    console.log("🎉 New user created with starter pack + friendCode");
    return;
  }

  // Patch existing user – salabojam trūkstošos laukus
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

  // Draugu sistēma
  if (!data.friendCode) patch.friendCode = generateFriendCode();
  if (!Array.isArray(data.friends)) patch.friends = [];
  if (!data.friendRequests)
    patch.friendRequests = { incoming: [], outgoing: [] };

  if (Object.keys(patch).length > 0) {
    await updateDoc(ref, patch);
  }
};

// =======================================================
// Auth: Google / Email
// =======================================================

export const signInWithGoogle = async () => {
  const res = await signInWithPopup(auth, googleProvider);
  const u = res.user;
  await ensureUserDocument(u.uid, u.email, u.displayName, u.photoURL);
  return res;
};

export const signUpWithEmail = async (email, password, name = "") => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const u = res.user;
  await ensureUserDocument(u.uid, email, name, "");
  return res;
};

export const signInUserWithEmail = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const u = res.user;
  await ensureUserDocument(u.uid, u.email, u.displayName, u.photoURL);
  return res;
};

export const logout = () => signOut(auth);

// =======================================================
// User Get / Update
// =======================================================

export const getUserData = async (uid) => {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserSafe = async (uid, updates) => {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, updates);
};

// =======================================================
// Points / Coins / XP
// =======================================================

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

// =======================================================
// GAME HISTORY
// =======================================================

export const saveGameHistory = async (uid, topic, score) => {
  if (!uid) return;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthId = `${year}-${month}`;

  const lastReset = data.monthStats?.lastResetMonth || null;
  const shouldReset = lastReset !== monthId;

  const updates = {
    gamesPlayed: increment(1),
    history: arrayUnion({
      topic,
      score,
      date: now.toISOString(),
    }),
  };

  if (shouldReset) {
    updates["monthStats"] = {
      totalXP: score,
      totalGames: 1,
      lastResetMonth: monthId,
    };
  } else {
    updates["monthStats.totalXP"] = increment(score);
    updates["monthStats.totalGames"] = increment(1);
  }

  await updateDoc(ref, updates);
};
export const getMonthlyChampion = async () => {
  const q = query(
    collection(db, "users"),
    where("monthStats.totalXP", ">", 0)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  let best = null;

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const xp = data.monthStats?.totalXP ?? 0;
    if (!best || xp > best.monthStats.totalXP) {
      best = { id: docSnap.id, ...data };
    }
  });

  return best;
};

// =======================================================
// 🏆 TOP 3 pēc labākā spēles rezultāta
// =======================================================
export const getTop3Players = async () => {
  const q = query(
    collection(db, "users"),
    where("history", "!=", []) // kuriem ir vismaz 1 spēle
  );

  const snap = await getDocs(q);
  if (snap.empty) return [];

  const list = snap.docs.map(docSnap => {
    const data = docSnap.data();
    const bestScore = data.history?.length
      ? Math.max(...data.history.map(h => h.score ?? 0))
      : 0;

    return {
      id: docSnap.id,
      name: data.name || data.email,
      photo: data.photo || "",
      level: data.level ?? 1,
      bestScore,
    };
  });

  list.sort((a, b) => b.bestScore - a.bestScore);

  return list.slice(0, 3); // TOP 3
};


// =======================================================
// Boost consumption
// =======================================================

export const consumeBoost = async (uid, key) => {
  if (!uid || !key) return;
  if (key === "vip") return;

  await updateDoc(doc(db, "users", uid), {
    [`boosts.${key}`]: increment(-1),
  });
};

// =======================================================
// Achievements
// =======================================================

export const unlockAchievements = async (uid, ids) => {
  if (!uid || !ids?.length) return;

  await updateDoc(doc(db, "users", uid), {
    achievements: arrayUnion(...ids),
  });
};

// =======================================================
// ⭐ PACK OPENING
// =======================================================

export const openPack = async (uid, reward) => {
  if (!uid) return { ok: false, reason: "not_logged_in" };

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ok: false, reason: "user_not_found" };

  const user = snap.data();
  const currentCoins = user.coins || 0;

  if (currentCoins < 25) {
    return { ok: false, reason: "not_enough_coins" };
  }

  let coinsDelta = -25;

  const updates = {
    "packs.progress": increment(1),
  };

  if (reward.type === "coins") coinsDelta += reward.amount || 0;
  updates.coins = increment(coinsDelta);

  if (reward.type === "xp" && typeof reward.amount === "number") {
    updates.xp = increment(reward.amount);
  }
  if (reward.type === "boost" && reward.key) {
    updates[`boosts.${reward.key}`] = increment(1);
  }
  if (reward.type === "cosmetic" && reward.cosmeticId) {
    updates[`cosmetics.${reward.cosmeticId}`] = true;
  }

  await updateDoc(ref, updates);
  return { ok: true };
};

// =======================================================
// 🛒 STORE PURCHASE
// =======================================================

export const purchaseItem = async (uid, item) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ok: false, reason: "user_not_found" };

  const user = snap.data();

  if (user.coins < item.price) {
    return { ok: false, reason: "not_enough_coins" };
  }

  const updates = {
    coins: increment(-item.price),
  };

  if (item.type === "boost" && item.boostKey) {
    updates[`boosts.${item.boostKey}`] = increment(1);
  }

  if (item.type === "cosmetic" && item.cosmeticId) {
    updates[`cosmetics.${item.cosmeticId}`] = true;
  }

  if (item.type === "vip") {
    updates["boosts.vip"] = true;
  }

  if (item.type === "topic" && item.unlockKey) {
    updates.unlockedTopics = arrayUnion(item.unlockKey);
  }

  await updateDoc(ref, updates);
  return { ok: true };
};

// =======================================================
// 🟦 FRIEND SYSTEM — Backend
// =======================================================

// Atrod user pēc friend code
export const getUserByFriendCode = async (code) => {
  if (!code) return null;

  const q = query(
    collection(db, "users"),
    where("friendCode", "==", code)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

// Sūta friend request pēc friend code (šis sader ar Friends.jsx)
export const sendFriendRequest = async (fromUid, friendCode) => {
  if (!fromUid || !friendCode) {
    return { ok: false, reason: "invalid" };
  }

  const target = await getUserByFriendCode(friendCode);
  if (!target) {
    return { ok: false, reason: "not_found" };
  }

  const toUid = target.id;
  if (toUid === fromUid) {
    return { ok: false, reason: "self_request" };
  }

  const fromRef = doc(db, "users", fromUid);
  const toRef = doc(db, "users", toUid);

  const [fromSnap, toSnap] = await Promise.all([getDoc(fromRef), getDoc(toRef)]);
  if (!fromSnap.exists() || !toSnap.exists()) {
    return { ok: false, reason: "user_not_found" };
  }

  const fromData = fromSnap.data();
  const toData = toSnap.data();

  const fromFriends = fromData.friends || [];
  const toFriends = toData.friends || [];
  const fromOutgoing = fromData.friendRequests?.outgoing || [];
  const fromIncoming = fromData.friendRequests?.incoming || [];
  const toOutgoing = toData.friendRequests?.outgoing || [];
  const toIncoming = toData.friendRequests?.incoming || [];

  if (fromFriends.includes(toUid) || toFriends.includes(fromUid)) {
    return { ok: false, reason: "already_friends" };
  }

  if (
    fromOutgoing.includes(toUid) ||
    fromIncoming.includes(toUid) ||
    toOutgoing.includes(fromUid) ||
    toIncoming.includes(fromUid)
  ) {
    return { ok: false, reason: "already_sent" };
  }

  await updateDoc(fromRef, {
    "friendRequests.outgoing": arrayUnion(toUid),
  });

  await updateDoc(toRef, {
    "friendRequests.incoming": arrayUnion(fromUid),
  });

  return { ok: true };
};

// Accept request
export const acceptFriendRequest = async (uid, fromUid) => {
  const myRef = doc(db, "users", uid);
  const theirRef = doc(db, "users", fromUid);

  await updateDoc(myRef, {
    "friendRequests.incoming": arrayRemove(fromUid),
    friends: arrayUnion(fromUid),
  });

  await updateDoc(theirRef, {
    "friendRequests.outgoing": arrayRemove(uid),
    friends: arrayUnion(uid),
  });

  return { ok: true };
};

// Decline
export const declineFriendRequest = async (uid, fromUid) => {
  const myRef = doc(db, "users", uid);

  await updateDoc(myRef, {
    "friendRequests.incoming": arrayRemove(fromUid),
  });

  return { ok: true };
};

// Remove friend
export const removeFriend = async (uid, friendUid) => {
  const myRef = doc(db, "users", uid);
  const theirRef = doc(db, "users", friendUid);

  await updateDoc(myRef, {
    friends: arrayRemove(friendUid),
  });

  await updateDoc(theirRef, {
    friends: arrayRemove(uid),
  });

  return { ok: true };
};
