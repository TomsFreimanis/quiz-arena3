// src/pages/Achievements.jsx
import { useState, useEffect } from "react";
import { auth, getUserData } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { NBA_ACHIEVEMENTS } from "../data/achievements";
import AchievementCard from "../components/AchievementCard";
import { motion } from "framer-motion";

export default function Achievements() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) setUserData(await getUserData(u.uid));
    });
    return () => unsub();
  }, []);

  if (!userData)
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <p>Pieslēdzies, lai redzētu sasniegumus...</p>
      </div>
    );

  const unlocked = userData.achievements || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-4xl font-extrabold text-yellow-400 mb-10"
      >
        🏆 NBA Achievements
      </motion.h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Object.entries(NBA_ACHIEVEMENTS).map(([key, ach]) => {
          const progress = ach.progress(userData) || 0;
          const goal = ach.goal || 1;
          const isUnlocked = unlocked.includes(key);

          return (
            <AchievementCard
              key={key}
              data={ach}
              unlocked={isUnlocked}
              progress={progress}
              goal={goal}
            />
          );
        })}
      </div>
    </div>
  );
}
