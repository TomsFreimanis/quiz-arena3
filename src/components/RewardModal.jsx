// src/components/RewardModal.jsx
export default function RewardModal({ reward, onClose }) {
  if (!reward) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-2xl border border-yellow-400 text-center shadow-2xl w-[300px]">
        <h2 className="text-xl font-bold mb-4">🎉 Tu ieguvi!</h2>

        <div className="text-4xl mb-2">
          {reward.type === "boost" && "⚡"}
          {reward.type === "coins" && "💰"}
          {reward.type === "xp" && "⭐"}
          {reward.type === "cosmetic" && "🎨"}
        </div>

        <p className="text-yellow-300 text-lg font-bold">{reward.name}</p>

        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300"
        >
          Aizvērt
        </button>
      </div>
    </div>
  );
}
