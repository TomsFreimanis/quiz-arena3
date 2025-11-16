// src/components/AchievementCard.jsx
import { motion } from "framer-motion";

const rarityStyles = {
  bronze: "from-amber-700 to-amber-500 border-amber-600",
  silver: "from-gray-400 to-gray-200 border-gray-300",
  gold: "from-yellow-400 to-yellow-600 border-yellow-500",
  diamond: "from-cyan-300 to-blue-400 border-cyan-300",
};

export default function AchievementCard({ data, unlocked, progress, goal }) {
  const pct = Math.min(100, Math.round((progress / goal) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      className={`
        p-4 rounded-2xl border backdrop-blur-xl shadow-xl 
        flex flex-col gap-3

        ${unlocked
          ? `bg-gradient-to-r ${rarityStyles[data.rarity]} text-black`
          : "bg-gray-800/70 border-gray-700 text-gray-400"}
      `}
    >
      {/* Icon + texts */}
      <div className="flex items-center gap-4">
        <div className="text-4xl">
          {unlocked ? data.icon : "🔒"}
        </div>

        <div>
          <p className="font-bold text-lg">{data.title}</p>
          <p className="text-sm">{data.desc}</p>
        </div>
      </div>

      {/* Progress bar */}
      {!unlocked && (
        <div className="w-full bg-gray-700/60 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            className="h-full bg-yellow-400"
          />
        </div>
      )}

      <p className="text-xs text-right opacity-80">
        {progress} / {goal}
      </p>
    </motion.div>
  );
}
