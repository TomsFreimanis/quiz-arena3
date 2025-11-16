// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, getUserData } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

export default function Home() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      setData(u ? await getUserData(u.uid) : null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const points = data?.points ?? 0;
  const coins = data?.coins ?? 0;
  const xp = data?.xp ?? 0;
  const level = data?.level ?? 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-yellow-300 animate-pulse">Loading NBA Arena...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 flex justify-center items-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-slate-950/85 border border-yellow-400/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] max-w-4xl p-10 text-white w-full"
      >
        <h1 className="text-4xl font-extrabold text-center mb-8">
          🏀 NBA QUIZ ARENA
        </h1>

        {firebaseUser ? (
          <>
            <p className="text-center text-slate-300 mb-7">
              Sveiks,{" "}
              <span className="font-bold text-yellow-300">
                {firebaseUser.displayName || firebaseUser.email}
              </span>
              !
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              <HomeStat label="Punkti" value={points} color="text-purple-300" />
              <HomeStat label="Monētas" value={coins} color="text-yellow-300" />
              <HomeStat label="Līmenis" value={level} color="text-blue-300" />
              <HomeStat label="XP" value={xp} color="text-emerald-300" />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => navigate("/quiz-start")}
                className="w-full md:w-1/2 py-3 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-lg hover:bg-yellow-300"
              >
                🚀 Sākt NBA spēli
              </button>

              <div className="flex gap-4">
                <Link
                  to="/leaderboard"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold shadow"
                >
                  👑 Līderi
                </Link>

                <Link
                  to="/store"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-semibold shadow"
                >
                  🛒 Veikals
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-slate-300 mb-6">
              Lai spēlētu un krātu XP/monētas, pieslēdzies.
            </p>
            <Link
              to="/login"
              className="px-6 py-3 bg-yellow-400 text-slate-900 rounded-xl shadow-lg hover:bg-yellow-300 inline-block font-semibold"
            >
              🔑 Pieslēgties
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function HomeStat({ label, value, color }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl text-center">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
