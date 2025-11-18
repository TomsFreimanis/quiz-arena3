// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, getUserData } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import Top3ChampionBlock from "../components/Top3ChampionBlock";



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
          🏀 NBA VIKTORĪNA
        </h1>
      
<Top3ChampionBlock />




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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              <HomeStat label="Punkti" value={points} color="text-purple-300" />
              <HomeStat label="Monētas" value={coins} color="text-yellow-300" />
              <HomeStat label="Līmenis" value={level} color="text-blue-300" />
              <HomeStat label="XP" value={xp} color="text-emerald-300" />
            </div>

            {/* MAIN BUTTON */}
            <button
              onClick={() => navigate("/quiz-start")}
              className="w-full py-3 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-lg hover:bg-yellow-300 mb-8"
            >
              🚀 Sākt NBA spēli
            </button>

            {/* MENU CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* LEADERBOARD */}
              <MenuCard
                icon="👑"
                title="Līderi"
                desc="Apskati labākos NBA spēlētājus un sacenties ar citiem!"
                link="/leaderboard"
                color="from-purple-700 to-indigo-700"
              />

              {/* STORE */}
              <MenuCard
                icon="🛒"
                title="Veikals"
                desc="Boosts, kosmetika un režīmi — uzlabo savu pieredzi!"
                link="/store"
                color="from-emerald-600 to-green-700"
              />

              {/* PACKS / SPINS */}
              <MenuCard
                icon="🎁"
                title="Packs / Spin Wheel"
                desc="Griez laimes ratu un laimē XP, boostus, monētas un rare kosmetiku!"
                link="/packs"
                color="from-yellow-500 to-orange-500"
                highlight
              />
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

/* ======================= Components ======================== */

function HomeStat({ label, value, color }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl text-center">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function MenuCard({ icon, title, desc, link, color, highlight }) {
  return (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`
          bg-gradient-to-br ${color}
          rounded-2xl p-5 h-full 
          shadow-xl cursor-pointer 
          border border-slate-700
          transition relative
          ${highlight ? "ring-2 ring-yellow-300" : ""}
        `}
      >
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-slate-200 mt-1">{desc}</p>

        {highlight && (
          <span className="absolute top-3 right-3 text-[10px] bg-black/40 px-2 py-1 rounded-full text-yellow-200 font-semibold">
            NEW
          </span>
        )}
      </motion.div>
    </Link>
  );
}
