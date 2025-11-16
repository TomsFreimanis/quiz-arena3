import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ref = collection(db, "users");
        const snap = await getDocs(ref);

        const data = snap.docs.map(doc => {
          const u = doc.data();

          const bestScore = u.history?.length
            ? Math.max(...u.history.map(h => h.score ?? 0))
            : 0;

          return {
            id: doc.id,
            name: u.name,
            photo: u.photo,
            totalPoints: u.points ?? 0,
            xp: u.xp ?? 0,
            level: u.level ?? 1,
            gamesPlayed: u.gamesPlayed ?? 0,
            bestScore,
          };
        });

        setUsers(data);
      } catch (err) {
        console.error("Leaderboard error:", err);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center 
                      bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700">
        <p className="text-yellow-200 animate-pulse">Ielādēju Leaderboard...</p>
      </div>
    );
  }

  const bestGame = [...users]
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 20);

  const grinders = [...users]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl mx-auto bg-slate-950/80 border border-yellow-400/40
                   rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-8 text-white"
      >
        {/* HEADER */}
        <h1 className="text-3xl font-extrabold text-center">
          👑 Leaderboard Arena
        </h1>
        <p className="text-slate-300 text-center mt-1 mb-10 text-sm">
          Spēcīgākie spēlētāji Quiz Arena NBA režīmā.
        </p>

        {/* BEST GAME */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-yellow-300 mb-3">
            🏆 Labākā viena spēle (max 200)
          </h2>

          <div className="space-y-3">
            {bestGame.map((u, i) => (
              <motion.div
                key={u.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/70 
                           border border-slate-800 shadow-lg transition"
              >
                <div className="text-2xl font-bold w-10 text-yellow-300">
                  #{i + 1}
                </div>

                <img
                  src={u.photo}
                  className="w-12 h-12 rounded-full border border-yellow-300/30 shadow"
                />

                <div className="flex-1">
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-slate-400">
                    Spēles: {u.gamesPlayed} | Līmenis: {u.level}
                  </p>
                </div>

                <div className="text-xl font-bold text-yellow-400">
                  {u.bestScore}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* GRINDERS */}
        <section>
          <h2 className="text-xl font-bold text-yellow-300 mb-3">
            🔥 Grind Masters (kopējie punkti)
          </h2>

          <div className="space-y-3">
            {grinders.map((u, i) => (
              <motion.div
                key={u.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/70 
                           border border-slate-800 shadow-lg transition"
              >
                <div className="text-2xl font-bold w-10 text-yellow-300">
                  #{i + 1}
                </div>

                <img
                  src={u.photo}
                  className="w-12 h-12 rounded-full border border-yellow-300/30 shadow"
                />

                <div className="flex-1">
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-slate-400">
                    XP: {u.xp} | Līmenis: {u.level}
                  </p>
                </div>

                <div className="text-xl font-bold text-yellow-400">
                  {u.totalPoints}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
