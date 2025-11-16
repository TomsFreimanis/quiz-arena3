import { motion } from "framer-motion";

export default function AchievementCard({ data, unlocked }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        p-4 rounded-2xl border shadow-xl flex items-center gap-4
        backdrop-blur-xl
        ${
          unlocked
            ? "bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-500 text-black"
            : "bg-gray-800 border-gray-600 text-gray-400 opacity-60"
        }
      `}
    >
      <div className="text-4xl">
        {unlocked ? data.icon : "🔒"}
      </div>

      <div>
        <p className="font-bold text-lg">
          {data.title}
        </p>
        <p className="text-sm">
          {data.desc}
        </p>
      </div>
    </motion.div>
  );
}
