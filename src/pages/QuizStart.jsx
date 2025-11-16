// src/pages/QuizStart.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, getUserData } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

const MODES = [
  {
    id: "rookie",
    label: "Rookie Mode",
    subtitle: "Sāc savu NBA ceļu",
    desc: "10 jautājumi, mierīgs temps, ideāli iesācējiem.",
    emoji: "🟢",
    alwaysUnlocked: true,
  },
  {
    id: "allstar",
    label: "All-Star Mode",
    subtitle: "Grūtāks izaicinājums",
    desc: "12 jautājumi, ātrāks temps. Atbloķējas pie 200+ punktiem.",
    emoji: "⭐",
    unlockPoints: 200,
  },
  {
    id: "ultra",
    label: "ULTRA LEBRON MODE",
    subtitle: "Only for true GOATs",
    desc: "15 jautājumi, ļoti ātrs temps, liels punktu potenciāls.",
    emoji: "👑",
    requiresUltraKey: true, // mode_ultra vai VIP
  },
];

export default function QuizStart() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        const data = await getUserData(u.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const points = userData?.points ?? 0;
  const coins = userData?.coins ?? 0;
  const boosts = userData?.boosts || {};
  const unlockedTopics = userData?.unlockedTopics || [];
  const isVIP = boosts.vip === true;

  const isModeUnlocked = (mode) => {
    if (mode.alwaysUnlocked) return true;

    if (mode.id === "allstar") {
      return points >= (mode.unlockPoints || 200);
    }

    if (mode.id === "ultra") {
      if (isVIP) return true;
      if (unlockedTopics.includes("mode_ultra")) return true;
      return false;
    }

    return false;
  };

  const handleSelect = (mode) => {
    if (!firebaseUser) {
      alert("🔑 Lai spēlētu, lūdzu pieslēdzies savam kontam.");
      return;
    }

    const unlocked = isModeUnlocked(mode);
    if (!unlocked) {
      if (mode.id === "allstar") {
        alert("🔒 All-Star Mode atbloķējas, kad sasniedz vismaz 200 punktus.");
      } else if (mode.id === "ultra") {
        alert(
          "🔒 ULTRA LEBRON MODE atbloķējas ar VIP vai veikalā nopērkot Ultra režīmu."
        );
      }
      return;
    }

    navigate(`/quiz?mode=${mode.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-yellow-700">
        <p className="text-yellow-200 animate-pulse">Ielādē NBA režīmus...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-4xl bg-slate-950/80 border border-yellow-500/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              NBA Quiz Arena 🏀
            </h1>
            <p className="text-slate-300 text-sm md:text-base">
              Izvēlies savu režīmu un pierādi, ka esi īsts NBA eksperts.
            </p>
          </div>

          {firebaseUser && (
            <div className="text-right text-xs md:text-sm">
              <p className="text-yellow-300 font-semibold">
                {firebaseUser.displayName || firebaseUser.email}
              </p>
              <p className="text-slate-400">
                Punkti: <span className="text-yellow-300">{points}</span> ·
                Monētas: <span className="text-yellow-300">{coins}</span>
              </p>
              {isVIP && (
                <p className="text-[11px] text-purple-300 mt-1">
                  👑 VIP aktīvs – ekstra XP un atslēgtas funkcijas.
                </p>
              )}
            </div>
          )}
        </div>

        {!firebaseUser && (
          <div className="mb-6 text-sm text-yellow-200 bg-yellow-900/30 border border-yellow-600/40 rounded-2xl px-4 py-3">
            🔑 Lai saglabātu progresu, monētas un līmeni, lūdzu{" "}
            <span className="font-semibold">pieslēdzies</span> sadaļā Login.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {MODES.map((mode) => {
            const unlocked = isModeUnlocked(mode);
            return (
              <motion.button
                key={mode.id}
                whileHover={{ scale: unlocked ? 1.04 : 1 }}
                whileTap={{ scale: unlocked ? 0.97 : 1 }}
                onClick={() => handleSelect(mode)}
                className={`relative text-left rounded-2xl p-5 border shadow-lg transition ${
                  unlocked
                    ? "border-yellow-400/60 bg-gradient-to-br from-purple-900/80 to-yellow-700/40 hover:border-yellow-300"
                    : "border-slate-700 bg-slate-900/80 opacity-70 cursor-pointer"
                }`}
              >
                {!unlocked && (
                  <div className="absolute top-3 right-3 text-xs bg-slate-900/80 border border-slate-700 rounded-full px-2 py-0.5 text-slate-300 flex items-center gap-1">
                    🔒 Bloķēts
                  </div>
                )}

                <div className="text-3xl mb-3">{mode.emoji}</div>
                <h2 className="text-lg font-bold mb-1">{mode.label}</h2>
                <p className="text-xs text-slate-300 mb-2">
                  {mode.subtitle}
                </p>
                <p className="text-[11px] text-slate-400">{mode.desc}</p>

                {mode.id === "allstar" && (
                  <p className="text-[11px] text-yellow-300 mt-2">
                    Atbloķējas pie {mode.unlockPoints || 200} punktiem.
                  </p>
                )}
                {mode.id === "ultra" && (
                  <p className="text-[11px] text-purple-300 mt-2">
                    Atbloķē VIP vai veikalā (Ultra LeBron Unlock).
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
