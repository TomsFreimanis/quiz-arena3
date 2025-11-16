import { useState, useEffect } from "react";
import { auth, getUserData } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { NBA_ACHIEVEMENTS } from "../data/achievements";
import AchievementCard from "../components/AchievementCard";
import { motion } from "framer-motion";

export default function Achievements() {
  const [userData, setUserData] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        const data = await getUserData(u.uid);
        setUserData(data);
      }
    });
    return () => unsub();
  }, []);

  if (!firebaseUser)
    return (
      <div className="text-center mt-20 text-white">
        <p>Pieslēdzies, lai redzētu sasniegumus.</p>
      </div>
    );

  const unlocked = userData?.achievements || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-4xl font-extrabold text-yellow-400 mb-10"
      >
        🏆 NBA Achievements
      </motion.h1>

      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(NBA_ACHIEVEMENTS).map(([key, ach]) => (
          <AchievementCard
            key={key}
            data={ach}
            unlocked={unlocked.includes(key)}
          />
        ))}
      </div>
    </div>
  );
}
