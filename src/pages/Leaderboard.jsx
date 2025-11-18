import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { AVATARS } from "../utils/avatarList";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ref = collection(db, "users");
        const snap = await getDocs(ref);

        const data = snap.docs.map((doc) => {
          const u = doc.data();

          const avatarId = u.avatarId || "common1";
          const avatarObj = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
          const avatarImg = avatarObj.url;

          const bestScore = u.history?.length
            ? Math.max(...u.history.map((h) => h.score ?? 0))
            : 0;

          return {
            id: doc.id,
            name: u.name ?? "Nezināms",
            avatarImg,
            totalPoints: u.points ?? 0,
            xp: u.xp ?? 0,
            level: u.level ?? 1,
            gamesPlayed: u.gamesPlayed ?? 0,
            bestScore,
            cosmetics: u.cosmetics || {},
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

  // TOP 10 kategorijas
  const bestGame = [...users]
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 10);

  const grinders = [...users]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10);

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
          Šobrīd spēcīgākie spēlētāji NBA Quiz režīmā.
        </p>

        {/* BEST GAME */}
        <LeaderboardSection
          title="🏆 Labākā viena spēle (TOP 10)"
          players={bestGame}
          valueKey="bestScore"
          valueLabel="Punkti"
        />

        {/* GRINDERS */}
        <LeaderboardSection
          title="🔥 Grind Masters (TOP 10 — Kopējie punkti)"
          players={grinders}
          valueKey="totalPoints"
          valueLabel="Punkti"
        />
      </motion.div>
    </div>
  );
}

/* =================== Subcomponent =================== */

function LeaderboardSection({ title, players, valueKey, valueLabel }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-yellow-300 mb-3">{title}</h2>

      <div className="space-y-3">
        {players.map((u, i) => (
          <motion.div
  key={u.id}
  whileHover={{ scale: 1.02 }}
  className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/70 
             border border-slate-800 shadow-lg transition"
>
  {/* POSITION NUMBER */}
  <div
    className={`
      text-xl font-bold 
      flex items-center justify-center
      w-8 min-w-[32px]
      ${
        i === 0 ? "text-yellow-300" :
        i === 1 ? "text-gray-300" :
        i === 2 ? "text-orange-400" :
        "text-yellow-200/70"
      }
    `}
  >
    #{i + 1}
  </div>

  {/* AVATAR IN FIXED CONTAINER */}
  <div className="w-12 h-12 min-w-[48px] flex items-center justify-center">
    <img
      src={u.avatarImg}
      className={`
        w-12 h-12 rounded-full object-cover border-4
        ${u.cosmetics?.frame_gold ? "border-yellow-400" : "border-yellow-300/30"}
      `}
    />
  </div>

  {/* NAME + STATS */}
  <div className="flex-1 min-w-0">
    <p className="font-semibold text-white truncate">{u.name}</p>
    <p className="text-xs text-slate-400">
      Spēles: {u.gamesPlayed} | Līmenis: {u.level}
    </p>
  </div>

  {/* VALUE */}
  <div className="text-lg font-bold text-yellow-400 text-right w-12 min-w-[48px]">
    {u[valueKey]}
  </div>
</motion.div>

        ))}
      </div>
    </section>
  );
}
