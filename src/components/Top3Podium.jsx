import { motion } from "framer-motion";

export default function Top3Podium({ players }) {
  if (!players || players.length < 3) return null;

  const [first, second, third] = players;

  const podiumItem = (player, place, color, delay, big = false) => (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center mx-2"
    >
      {/* GLOW RING */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`rounded-full p-1 ${
          color === "gold"
            ? "bg-gradient-to-br from-yellow-300 to-yellow-500"
            : color === "silver"
            ? "bg-gradient-to-br from-gray-300 to-gray-500"
            : "bg-gradient-to-br from-amber-700 to-orange-600"
        }`}
      >
        {/* AVATAR */}
        <img
          src={player.avatarImg}
          className={`rounded-full object-cover border-4 ${
            color === "gold"
              ? "border-yellow-400"
              : color === "silver"
              ? "border-gray-300"
              : "border-amber-700"
          } ${big ? "w-24 h-24" : "w-20 h-20"}`}
        />
      </motion.div>

      <p className="text-white font-bold mt-2">{player.name}</p>
      <p className="text-xs text-slate-400 mb-1">Līmenis: {player.level}</p>

      <div
        className={`px-3 py-1 rounded-xl font-bold text-sm text-black shadow-lg ${
          color === "gold"
            ? "bg-yellow-400"
            : color === "silver"
            ? "bg-gray-300"
            : "bg-amber-500"
        }`}
      >
        {place}. vieta
      </div>

      <p className="text-lg font-bold text-yellow-300 mt-2">
        {player.bestScore} punktu
      </p>
    </motion.div>
  );

  return (
    <div className="w-full flex flex-col items-center my-8">
      <h2 className="text-xl font-bold text-center text-yellow-300 mb-6">
        🏆 Šī brīža TOP 3 NBA spēlētāji
      </h2>

      <div className="flex items-end justify-center">
        {/* 2nd */}
        <div className="translate-y-6">
          {podiumItem(second, 2, "silver", 0.1)}
        </div>

        {/* 1st */}
        <div className="mx-3">
          {podiumItem(first, 1, "gold", 0, true)}
        </div>

        {/* 3rd */}
        <div className="translate-y-8">
          {podiumItem(third, 3, "bronze", 0.2)}
        </div>
      </div>
    </div>
  );
}
