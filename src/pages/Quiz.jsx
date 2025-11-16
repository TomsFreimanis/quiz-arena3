// src/pages/Quiz.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  auth,
  getUserData,
  addPoints,
  addCoins,
  addXP,
  saveGameHistory,
  consumeBoost,
  db,
} from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import nbaQuizData from "../data/nbaQuizData";
import { NBA_ACHIEVEMENTS } from "../data/achievements";

// 🔧 režīmu konfigurācija
const MODE_CONFIG = {
  rookie: {
    id: "rookie",
    label: "Rookie Mode",
    questions: 10,
    timePerQ: 25,
    baseScore: 10,
  },
  allstar: {
    id: "allstar",
    label: "All-Star Mode",
    questions: 12,
    timePerQ: 15,
    baseScore: 15,
  },
  ultra: {
    id: "ultra",
    label: "ULTRA LEBRON MODE",
    questions: 15,
    timePerQ: 12,
    baseScore: 25,
  },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Boost poga – vienmēr redzama, pelēka ja 0
function BoostChip({ label, count = 0, onClick, color }) {
  const base =
    "px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition flex items-center gap-1";

  if (!count || count <= 0) {
    return (
      <button
        type="button"
        disabled
        title="Nav boostu – vari nopirkt veikalā"
        className={`${base} bg-slate-700/70 text-slate-400 border border-slate-600 cursor-not-allowed`}
      >
        {label}
        <span className="text-[10px] opacity-70">(0)</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} text-white hover:opacity-90 ${color}`}
    >
      {label}
      <span className="text-[11px] opacity-90">x{count}</span>
    </button>
  );
}

/**
 * 🔥 ACHIEVEMENT ID – ŠIE SAKRĪT AR src/data/achievements.js
 *
 *  first_game
 *  score_80
 *  score_100
 *  hard_mode_win
 *  ultra_lebron_win
 *  streak_3
 *  "20_games"
 *  "7_day_streak"   (tiks atbloķēts citur – daily)
 *  "shop_purchase"  (tiks atbloķēts veikalā)
 */
function computeUnlockedAchievements(prevUser, finalScore, modeId) {
  const already = Array.isArray(prevUser.achievements)
    ? prevUser.achievements
    : [];
  const gamesBefore = prevUser.gamesPlayed || 0;

  const earned = [];

  // 1) Pirmā spēle
  if (!already.includes("first_game") && gamesBefore === 0) {
    earned.push("first_game");
  }

  // 2) 80+ punkti
  if (!already.includes("score_80") && finalScore >= 80) {
    earned.push("score_80");
  }

  // 3) 100+ punkti
  if (!already.includes("score_100") && finalScore >= 100) {
    earned.push("score_100");
  }

  // 4) Hard mode win (All-Star vai Ultra)
  if (
    !already.includes("hard_mode_win") &&
    modeId !== "rookie" &&
    finalScore >= 120
  ) {
    earned.push("hard_mode_win");
  }

  // 5) Ultra LeBron – Ultra režīms ar augstu scoru
  if (
    !already.includes("ultra_lebron_win") &&
    modeId === "ultra" &&
    finalScore >= 220
  ) {
    earned.push("ultra_lebron_win");
  }

  // 6) Triple-Double – ļoti spēcīga spēle (150+)
  if (!already.includes("streak_3") && finalScore >= 150) {
    earned.push("streak_3");
  }

  // 7) Veteran – 20+ spēles (pēc šīs spēles)
  if (!already.includes("20_games") && gamesBefore + 1 >= 20) {
    earned.push("20_games");
  }

  return earned;
}

// 🔐 Pieraksta achievementus Firestore
async function unlockAchievementsForUser(uid, ids) {
  if (!uid || !ids || ids.length === 0) return;
  const ref = doc(db, "users", uid);

  // arrayUnion atbalsta vairākus argumentus
  await updateDoc(ref, {
    achievements: arrayUnion(...ids),
  });
}

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode") || "rookie";
  const mode = MODE_CONFIG[modeParam] ? modeParam : "rookie";
  const config = MODE_CONFIG[mode];

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(config.timePerQ);
  const [finished, setFinished] = useState(false);

  const [boosts, setBoosts] = useState({
    freezeTime: 0,
    doubleXP: 0,
    fiftyFifty: 0,
    hint: 0,
    skip: 0,
    golden: 0,
    streakSaver: 0,
    vip: false,
  });
  const [doubleXPUsed, setDoubleXPUsed] = useState(false);
  const [goldenActive, setGoldenActive] = useState(false);
  const [visibleOptions, setVisibleOptions] = useState(null);
  const [newAchievementIds, setNewAchievementIds] = useState([]);

  // kosmētika / effekti
  const [cosmetics, setCosmetics] = useState({});
  const hasArenaVFX = cosmetics?.vfx?.includes("vfx_arena");
  const hasSlamDunkFX = cosmetics?.vfx?.includes("vfx_slamdunk");

  // 🔹 Auth + user data
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        const data = await getUserData(u.uid);
        setUserData(data);

        const userBoosts = data?.boosts || {};
        setBoosts({
          freezeTime: Math.min(userBoosts.freezeTime || 0, 5),
          doubleXP: Math.min(userBoosts.doubleXP || 0, 5),
          fiftyFifty: Math.min(userBoosts.fiftyFifty || 0, 5),
          hint: Math.min(userBoosts.hint || 0, 5),
          skip: Math.min(userBoosts.skip || 0, 5),
          golden: Math.min(userBoosts.golden || 0, 5),
          streakSaver: Math.min(userBoosts.streakSaver || 0, 5),
          vip: userBoosts.vip || false,
        });

        setCosmetics(data?.cosmetics || {});
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔹 Ielādē quiz jautājumus no nbaQuizData
  useEffect(() => {
    setLoading(true);
    setError("");
    setFinished(false);
    setScore(0);
    setCurrent(0);
    setTimer(config.timePerQ);
    setAnswered(false);
    setSelectedOption(null);
    setVisibleOptions(null);
    setGoldenActive(false);
    setDoubleXPUsed(false);
    setNewAchievementIds([]);

    try {
     const normalized = nbaQuizData.map((q) => {
  // Sajauc atbilžu variantus
  const shuffledOptions = shuffle([ ...(q.options || []) ]);

  return {
    ...q,
    options: shuffledOptions,
    correct: q.correctAnswer,
  };
});

const shuffled = shuffle(normalized).slice(0, config.questions);
setQuestions(shuffled);

    } catch (err) {
      console.error("NBA question load error:", err);
      setError("Neizdevās ielādēt NBA jautājumus.");
    }

    setLoading(false);
  }, [modeParam, config.questions, config.timePerQ]);

  // 🔹 Taimeris
  useEffect(() => {
    if (answered || finished || loading) return;
    if (timer === 0) {
      nextQuestion();
      return;
    }
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, answered, finished, loading]);

  const currentQuestion = questions[current];
  const optionsToShow =
    visibleOptions && visibleOptions.length > 0
      ? visibleOptions
      : currentQuestion?.options || [];

  // FX helperi
  const playCorrectFX = () => {
    if (hasArenaVFX) spawnVFXBubble("correct");
    if (hasSlamDunkFX) {
      const audio = new Audio("/sounds/dunk.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  };

  const playWrongFX = () => {
    if (hasArenaVFX) spawnVFXBubble("wrong");
    if (hasSlamDunkFX) {
      const audio = new Audio("/sounds/miss.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  };

  const spawnVFXBubble = (type) => {
    const el = document.createElement("div");
    el.className =
      "fixed pointer-events-none z-[9999] text-4xl font-extrabold select-none";
    el.style.top = "45%";
    el.style.left = "50%";
    el.style.transform = "translate(-50%, -50%)";

    el.textContent = type === "correct" ? "✔" : "✖";
    el.style.color = type === "correct" ? "#22c55e" : "#ef4444";
    el.style.textShadow =
      type === "correct"
        ? "0 0 20px rgba(34,197,94,0.9)"
        : "0 0 20px rgba(239,68,68,0.9)";
    el.style.transition = "all 0.6s ease-out";
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = "translate(-50%, -80%) scale(1.3)";
      el.style.opacity = "0";
    });

    setTimeout(() => {
      el.remove();
    }, 650);
  };

  const handleAnswer = async (option) => {
    if (answered || !currentQuestion) return;

    const correct = currentQuestion.correct;

    // 🛟 StreakSaver loģika – ja atbilde ir nepareiza, bet ir streakSaver, tad
    // neuzrādām kļūdu, vienkārši "izglābjam" un ejam tālāk
    if (option !== correct && boosts.streakSaver > 0 && firebaseUser) {
      // Patērē lokāli
      setBoosts((prev) => ({
        ...prev,
        streakSaver: prev.streakSaver - 1,
      }));

      try {
        await consumeBoost(firebaseUser.uid, "streakSaver");
      } catch (e) {
        console.error("consumeBoost streakSaver error:", e);
      }

      // Neliekam wrong stilu, vienkārši jautājums tiek izlaists
      playWrongFX();
      nextQuestion();
      return;
    }

    setAnswered(true);
    setSelectedOption(option);

    if (option === correct) {
      let gained = config.baseScore;
      if (goldenActive) gained *= 3;
      setScore((s) => s + gained);
      playCorrectFX();
    } else {
      playWrongFX();
    }

    setTimeout(() => nextQuestion(), 1400);
  };

  const nextQuestion = () => {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setAnswered(false);
      setSelectedOption(null);
      setTimer(config.timePerQ);
      setVisibleOptions(null);
      setGoldenActive(false);
    } else {
      setFinished(true);
    }
  };

  const useBoost = async (key) => {
    if (!firebaseUser || !currentQuestion) return;
    if (!boosts[key] || boosts[key] <= 0) return;

    setBoosts((prev) => ({
      ...prev,
      [key]: prev[key] - 1,
    }));

    try {
      await consumeBoost(firebaseUser.uid, key);
    } catch (e) {
      console.error("consumeBoost error:", e);
    }

    if (key === "freezeTime") {
      setTimer((t) => t + 12);
    } else if (key === "doubleXP") {
      setDoubleXPUsed(true);
    } else if (key === "skip") {
      nextQuestion();
    } else if (key === "golden") {
      setGoldenActive(true);
    } else if (key === "fiftyFifty") {
      const incorrect = currentQuestion.options.filter(
        (o) => o !== currentQuestion.correct
      );
      const keepWrong =
        incorrect[Math.floor(Math.random() * incorrect.length)];
      setVisibleOptions(shuffle([currentQuestion.correct, keepWrong]));
    }
  };

  // 🔹 Spēle pabeigta → saglabā + achievements
  useEffect(() => {
    if (!finished || !firebaseUser || !userData) return;

    (async () => {
      const baseXP = score * 2;
      // Šeit ņem vērā tikai DoubleXP boostu, 24h buff nāk no addXP() pusē
      const xpEarned = doubleXPUsed ? baseXP * 2 : baseXP;
      const extraUltra = mode === "ultra" ? 10 : 0;
      const coinsEarned = Math.floor(score / 5) + extraUltra;

      try {
        await addPoints(firebaseUser.uid, score);
        await addXP(firebaseUser.uid, xpEarned);
        await addCoins(firebaseUser.uid, coinsEarned);
        await saveGameHistory(
          firebaseUser.uid,
          MODE_CONFIG[mode].label,
          score
        );

        // achievements: izmanto userData PIRMS spēles (gamesPlayed, utt.)
        const newly = computeUnlockedAchievements(userData, score, mode);

        if (newly.length > 0) {
          await unlockAchievementsForUser(firebaseUser.uid, newly);
          setNewAchievementIds(newly);
          console.log("🎖 Unlocked achievements:", newly);
        } else {
          console.log("No new achievements this game.");
        }
      } catch (e) {
        console.error("Save game / achievements error:", e);
      }
    })();
  }, [finished, firebaseUser, userData, score, mode, doubleXPUsed]);

  // ================== UI ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-900 flex items-center justify-center px-4 py-8">
      <div className="relative max-w-3xl w-full">
        {/* Stikla kartiņa */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] p-6 md:p-8 text-slate-50">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
                NBA Quiz Arena 🏀
              </h1>
              <p className="mt-1 text-xs md:text-sm text-slate-300">
                Režīms:{" "}
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900/60 border border-white/15 text-[11px] md:text-xs font-semibold text-yellow-300">
                  {config.label}
                </span>
              </p>
            </div>

            <div className="text-right text-xs md:text-sm">
              {firebaseUser && (
                <p className="text-slate-200 font-medium truncate max-w-[180px] ml-auto">
                  {firebaseUser.displayName || firebaseUser.email}
                </p>
              )}
              <p className="text-slate-400 mt-1">
                Score:{" "}
                <span className="text-yellow-300 font-bold">{score}</span>
              </p>
              <p className="text-slate-500 text-[11px]">
                Jautājumi: {current + 1}/{questions.length || config.questions}
              </p>
            </div>
          </div>

          {/* Boost row */}
          <div className="flex flex-wrap justify-center gap-2 mb-4 text-xs">
            <BoostChip
              label="Freeze time (+12s)"
              count={boosts.freezeTime}
              onClick={() => useBoost("freezeTime")}
              color="bg-indigo-500/90"
            />
            <BoostChip
              label="Double XP"
              count={boosts.doubleXP}
              onClick={() => useBoost("doubleXP")}
              color="bg-purple-500/90"
            />
            <BoostChip
              label="50/50"
              count={boosts.fiftyFifty}
              onClick={() => useBoost("fiftyFifty")}
              color="bg-emerald-500/90"
            />
            <BoostChip
              label="Skip"
              count={boosts.skip}
              onClick={() => useBoost("skip")}
              color="bg-slate-500/90"
            />
            <BoostChip
              label="Golden"
              count={boosts.golden}
              onClick={() => useBoost("golden")}
              color="bg-pink-500/90"
            />
            <BoostChip
              label="Streak saver"
              count={boosts.streakSaver}
              onClick={() => {}} // tas aktivizējas automātiski pie nepareizas atbildes
              color="bg-amber-500/90"
            />
          </div>

          {goldenActive && (
            <p className="text-[11px] text-pink-200 mb-1">
              🌟 Golden question – pareizā atbilde dos x3 punktus!
            </p>
          )}
          {doubleXPUsed && (
            <p className="text-[11px] text-purple-200 mb-1">
              ⚡ Double XP aktīvs – šīs spēles XP tiks dubultots.
            </p>
          )}
          {boosts.streakSaver > 0 && (
            <p className="text-[11px] text-amber-200 mb-1">
              🛡 Streak Saver: pirmais misclick tiks automātiski izglābts.
            </p>
          )}

          {/* Loading / error */}
          {loading && (
            <p className="text-slate-200 animate-pulse">
              Ielādē NBA jautājumus...
            </p>
          )}
          {error && <p className="text-red-400">{error}</p>}

          {/* Jautājumi */}
          {!loading && !error && !finished && currentQuestion && (
            <>
              <div className="flex items-center justify-between text-[11px] md:text-xs text-slate-300 mb-3">
                <span>
                  Jautājums {current + 1}/{questions.length}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/70 border border-white/10">
                  ⏱ <span className="font-semibold">{timer}s</span>
                </span>
              </div>

              <h3 className="text-lg md:text-xl font-semibold mb-4 leading-snug text-slate-50">
                {currentQuestion.question}
              </h3>

              <div className="grid grid-cols-1 gap-3 text-left">
                {optionsToShow.map((opt, i) => {
                  const correct = currentQuestion.correct;
                  let style =
                    "bg-slate-900/70 hover:bg-slate-900 border-slate-700/80";

                  if (answered) {
                    if (opt === correct && opt === selectedOption) {
                      style =
                        "bg-emerald-500/90 border-emerald-300 text-white";
                    } else if (opt === correct) {
                      style =
                        "bg-emerald-900/70 border-emerald-500 text-emerald-200";
                    } else if (opt === selectedOption && opt !== correct) {
                      style = "bg-red-700/80 border-red-400 text-red-100";
                    } else {
                      style =
                        "bg-slate-900/60 border-slate-800 text-slate-300";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      disabled={answered}
                      className={`p-3 rounded-2xl border text-sm md:text-base transition-colors ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Rezultāts */}
          {finished && (
            <div className="mt-6 text-center space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">🎉 Spēle pabeigta!</h2>
                <p className="text-sm text-slate-200">
                  Režīms:{" "}
                    <span className="text-yellow-300 font-semibold">
                      {config.label}
                    </span>
                </p>
                <p className="text-lg mt-2">
                  Tu ieguvi{" "}
                  <span className="font-bold text-yellow-300">{score}</span>{" "}
                  punktus.
                </p>
              </div>

              {newAchievementIds.length > 0 && (
                <div className="bg-slate-900/70 border border-yellow-400/40 rounded-2xl px-4 py-3 text-left text-sm">
                  <p className="font-semibold text-yellow-300 mb-1">
                    🎖 Jauni NBA achievements:
                  </p>
                  <ul className="list-disc list-inside text-slate-100 text-xs md:text-sm space-y-1">
                    {newAchievementIds.map((id) => {
                      const meta = NBA_ACHIEVEMENTS[id];
                      return (
                        <li key={id}>
                          {meta ? (
                            <>
                              {meta.icon} <b>{meta.title}</b> — {meta.desc}
                            </>
                          ) : (
                            id
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Pilnu sarakstu vari apskatīt sadaļā{" "}
                    <span className="font-semibold text-yellow-300">
                      Achievements
                    </span>
                    .
                  </p>
                </div>
              )}

              <button
                onClick={() => window.location.reload()}
                className="mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:opacity-90"
              >
                Spēlēt vēlreiz 🔁
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
