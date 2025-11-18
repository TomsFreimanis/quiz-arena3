import { useEffect, useState } from "react";
import { getMonthlyChampion } from "../services/firebase";
import { motion } from "framer-motion";

export default function MonthlyChampionBanner() {
  const [champion, setChampion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const c = await getMonthlyChampion();
      setChampion(c);
      setLoading(false);
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        bg-gradient-to-r from-yellow-500 to-yellow-700 
        p-4 rounded-2xl text-black mb-6 shadow-lg border border-yellow-300
      "
    >
      {loading ? (
        <p className="text-center font-semibold">Ielādē mēneša līderi...</p>
      ) : champion ? (
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide font-semibold">
            🏆 Šī mēneša NBA čempions
          </p>
          <p className="text-xl font-extrabold mt-1">
            {champion.name || champion.email}
          </p>
          <p className="text-sm font-semibold mt-1">
            {champion.monthStats.totalXP} XP šomēnes
          </p>
        </div>
      ) : (
        <p className="text-center font-semibold">
          👑 Šomēnes vēl nav čempiona — spēlē un kļūsti par pirmo!
        </p>
      )}
    </motion.div>
  );
}
