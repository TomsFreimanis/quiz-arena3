import { useEffect, useState } from "react";
import { getTop3Players } from "../services/firebase";
import { AVATARS } from "../utils/avatarList";
import { motion } from "framer-motion";

export default function Top3ChampionBlock() {
  const [top, setTop] = useState([]);

  useEffect(() => {
    (async () => {
      const players = await getTop3Players();
      setTop(players);
    })();
  }, []);

  if (top.length === 0) {
    return (
      <div className="text-center text-yellow-200 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl mb-6">
        Šomēnes vēl nav TOP spēlētāju.
      </div>
    );
  }

  const champ = top[0];
  const avatarObj = AVATARS.find(a => a.id === champ.avatarId) || AVATARS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-900/80 border border-yellow-400/40 p-5 rounded-2xl mb-8 text-center shadow-xl"
    >
      <h3 className="text-2xl font-bold text-yellow-300 mb-3">
        🥇 ŠĪ BRĪŽA ČEMPIONS
      </h3>

      <div className="flex justify-center relative mb-3">
        {/* Glow trophy */}
        <div className="absolute -top-3 right-1 text-4xl text-yellow-300 animate-pulse">
          🏆
        </div>

        <img
          src={avatarObj.url}
          className={`w-20 h-20 rounded-full object-cover border-4 shadow-xl ${
            champ.cosmetics?.frame_gold ? "border-yellow-400" : "border-yellow-300/40"
          }`}
        />
      </div>

      <p className="text-lg font-bold text-white">{champ.name}</p>
      <p className="text-sm text-slate-300">Līmenis {champ.level}</p>

      <div className="mt-3 text-yellow-300 font-bold text-xl">
        ⭐ Rekords: {champ.bestScore} punkti
      </div>

      <div className="mt-4 text-yellow-400 text-sm animate-pulse">
        ✨ Galvenā balva: Litrs Visītis ✨
      </div>
    </motion.div>
  );
}
