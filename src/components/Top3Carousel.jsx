import { useEffect, useState } from "react";
import { getTop3Players } from "../services/firebase";
import { motion } from "framer-motion";
import { AVATARS } from "../utils/avatarList";

export default function Top3Carousel() {
  const [top, setTop] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await getTop3Players();
      if (!result) return;

      // Ensure every player has avatar URL
      const fixed = result.map((p) => {
        const avatarObj = AVATARS.find(a => a.id === p.avatarId) || AVATARS[0];
        return {
          ...p,
          avatarImg: avatarObj.url,
        };
      });

      setTop(fixed);
    })();
  }, []);

  if (top.length === 0) {
    return (
      <div className="text-center text-yellow-200 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl mb-6">
        Šomēnes vēl nav TOP spēlētāju.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900/80 border border-yellow-500/40 p-4 rounded-xl mb-8"
    >
      <h3 className="text-center text-xl text-yellow-300 font-bold mb-4">
        🏆 Šī brīža TOP 3 spēlētāji
      </h3>

      {/* MOBILE SCROLLING */}
      <div
        className="
          flex gap-4 
          overflow-x-scroll 
          no-scrollbar 
          pb-3
          w-full
          md:justify-center md:overflow-x-visible
        "
      >
        {top.map((p, index) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.05 }}
            className="
              bg-slate-800/80 
              p-4 rounded-2xl shadow-xl text-center 
              min-w-[135px] w-[135px]
              flex-shrink-0
            "
          >
            <div className="text-3xl mb-1">
              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
            </div>

            <img
              src={p.avatarImg}
              className={`
                w-14 h-14 rounded-full mx-auto object-cover border-4 mb-2
                ${p.cosmetics?.frame_gold ? "border-yellow-400" : "border-yellow-300/30"}
              `}
            />

            <p className="font-semibold text-white text-sm truncate">
              {p.name}
            </p>

            <p className="text-xs text-slate-400">Līmenis {p.level}</p>

            <p className="text-xl font-bold text-yellow-300 mt-1">
              {p.bestScore}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
