// src/components/PackRewardModal.jsx
import { motion } from "framer-motion";

export default function PackRewardModal({ reward, onClose }) {
  if (!reward) return null;

  const icon =
    reward.type === "boost"
      ? "⚡"
      : reward.type === "coins"
      ? "💰"
      : reward.type === "xp"
      ? "⭐"
      : "🎨";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-950/90 border border-yellow-400/50 rounded-3xl p-6 max-w-sm w-full text-center text-white shadow-2xl"
      >
        <p className="text-3xl mb-2">🎉 GG!</p>
        <p className="text-sm text-slate-300 mb-3">
          Tu dabūji pack balvu:
        </p>

        <div className="flex flex-col items-center mb-4">
          <div className="text-5xl mb-2">{icon}</div>
          <p className="font-bold text-lg">{reward.name}</p>
          <p className="text-xs text-slate-300">{reward.desc}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-2 px-5 py-2 rounded-xl bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300"
        >
          OK
        </button>
      </motion.div>
    </div>
  );
}
