// src/utils/unlockAchievements.js
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../services/firebase";

export async function unlockAchievement(uid, achievementId, userData) {
  if (!uid || !achievementId) return;

  const already = userData?.achievements || [];
  if (already.includes(achievementId)) return; // already unlocked

  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    achievements: arrayUnion(achievementId),
  });
}

// MAIN CHECKER
export async function checkAchievements(uid, score, mode, userData) {
  if (!uid || !userData) return;

  // Rookie Debut
  await unlockAchievement(uid, "first_game", userData);

  // Kobe 81
  if (score >= 80) {
    await unlockAchievement(uid, "score_80", userData);
  }

  // Wilt 100
  if (score >= 100) {
    await unlockAchievement(uid, "score_100", userData);
  }

  // Hard mode = All-Star mode
  if (mode === "allstar") {
    await unlockAchievement(uid, "hard_mode_win", userData);
  }

  // Ultra GOAT
  if (mode === "ultra") {
    await unlockAchievement(uid, "ultra_lebron_win", userData);
  }

  // 3 wins in a row streak
  const newStreak = (userData.gameStreak || 0) + 1;

  if (newStreak >= 3) {
    await unlockAchievement(uid, "streak_3", userData);
  }

  // Veteran – 20 total games
  if ((userData.gamesPlayed || 0) + 1 >= 20) {
    await unlockAchievement(uid, "20_games", userData);
  }

  // Ironman – 7-day login streak
  if ((userData.dailyReward?.streak || 0) >= 7) {
    await unlockAchievement(uid, "7_day_streak", userData);
  }

  // GM Manager – any purchase
  if (userData.boughtSomethingOnce) {
    await unlockAchievement(uid, "shop_purchase", userData);
  }
}
