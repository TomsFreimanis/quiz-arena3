// src/pages/Packs.jsx
import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData, openPack } from "../services/firebase";
import PackOpening from "../components/PackOpening";

const PACK_PRICE = 20 // ⭐ Cena packam

export default function Packs() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const data = await getUserData(u.uid);
        setUserData(data);
      }
    });
    return () => unsub();
  }, []);

  // 🔥 Atjaunina userData pēc atvēršanas
  const finishOpening = async (reward) => {
    setReward(reward);

    if (user) {
      await openPack(user.uid, reward);

      // 🔥 Dabū jaunos coins / xp / boosts
      const refreshed = await getUserData(user.uid);
      setUserData(refreshed);
    }

    setOpening(false);
  };

  const startOpening = () => {
    if (!user) return alert("Jāielogojas, lai atvērtu packus.");
    if (userData.coins < PACK_PRICE)
      return alert("Nav pietiekami monētu!");

    // Noņem cenu lokāli
    setUserData((prev) => ({
      ...prev,
      coins: prev.coins - PACK_PRICE,
    }));

    setOpening(true);
    setReward(null);
  };

  return (
    <div className="text-white min-h-screen bg-[#0b0e17] px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 flex justify-center gap-2 items-center">
        🎁 Case Opening
      </h1>

      {/* User stats */}
      {userData && (
        <div className="text-center mb-10">
          <p className="text-lg">
            Monētas:{" "}
            <span className="text-yellow-400 font-bold">{userData.coins}</span>
          </p>
        </div>
      )}

      {/* Pack Open button */}
      {!opening && (
        <div className="flex justify-center">
          <button
            onClick={startOpening}
            className="px-8 py-4 rounded-xl bg-yellow-400 text-black font-bold text-lg hover:bg-yellow-300 transition shadow-xl"
          >
            Atvērt packu — {PACK_PRICE} coins
          </button>
        </div>
      )}

      {/* Pack Opening animation */}
      {opening && (
        <div className="mt-10">
          <PackOpening onFinish={finishOpening} />
        </div>
      )}

      {/* Win message */}
      {reward && !opening && (
        <div className="mt-14 text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            Tu ieguvi:
          </h2>

          <div className="text-xl text-white mb-6">
            {reward.icon} <b>{reward.name}</b> — {reward.desc}
          </div>

          <button
            onClick={startOpening}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold"
          >
            Atvērt vēl vienu 🔁
          </button>
        </div>
      )}
    </div>
  );
}
