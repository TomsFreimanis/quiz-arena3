import { useEffect, useState } from "react";
import { getTop3Players } from "../services/firebase";
import { motion } from "framer-motion";

export default function Top3Carousel() {
  const [top, setTop] = useState([]);

  useEffect(() => {
    (async () => {
      const t = await getTop3Players();
      setTop(t);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900/80 border border-yellow-500/40 p-4 rounded-xl mb-8"
    >
      <h3 className="text-center text-xl text-yellow-300 font-bold mb-4">
        🏆 Šī brīža TOP 3 spēlētāji
      </h3>

      {/* SCROLLABLE ROW ON MOBILE */}
      <div
        className="
          flex gap-5 justify-center 
          overflow-x-auto 
          scrollbar-none 
          pb-2
          md:overflow-visible
        "
      >
        {top.map((p, index) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.05 }}
            className="
              bg-slate-800/70 
              p-4 rounded-2xl shadow-lg text-center 
              min-w-[110px] 
              w-[110px]
              flex-shrink-0
            "
          >
            <div className="text-3xl mb-2">
              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
            </div>

            <div className="text-sm font-bold text-white leading-tight">
              {p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name}
            </div>

            <div className="text-xs text-slate-400">
              Līmenis {p.level}
            </div>

            <div className="text-yellow-300 text-xl font-bold mt-2">
              {p.bestScore}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
