// src/pages/Store.jsx
import { useEffect, useState } from "react";
import { auth, getUserData, purchaseItem } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import storeItems from "../data/storeItems";

export default function Store() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

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

  const handleBuy = async (item) => {
    if (!firebaseUser) {
      alert("🔑 Lai pirktu, lūdzu pieslēdzies.");
      return;
    }

    setBuyingId(item.id);

    try {
      const res = await purchaseItem(firebaseUser.uid, item);

      if (!res.ok) {
        if (res.reason === "limit_reached") {
          alert("❌ Sasniegts maksimums šim boostam (5).");
        } else if (res.reason === "not_enough_coins") {
          alert("❌ Nepietiek monētu.");
        } else if (res.reason === "already_owned") {
          alert("❌ Šis jau tev pieder.");
        } else if (res.reason === "already_vip") {
          alert("❌ VIP jau ir aktīvs.");
        } else {
          alert("❌ Neizdevās iegādāties priekšmetu.");
        }
      } else {
        const fresh = await getUserData(firebaseUser.uid);
        setUserData(fresh);
      }
    } catch (err) {
      console.error("Purchase error:", err);
      alert("❌ Kļūda pirkuma laikā.");
    }

    setBuyingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700">
        <p className="text-yellow-200 animate-pulse">Ielādē NBA veikalu...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700">
        <div className="bg-slate-950/80 border border-yellow-500/40 rounded-3xl p-8 text-center text-white max-w-md w-full">
          <h1 className="text-2xl font-bold mb-3">NBA Market 🛒</h1>
          <p className="text-sm text-slate-300 mb-4">
            Lai iegādātos boostus vai režīmus, lūdzu pieslēdzies.
          </p>
          <a
            href="/login"
            className="inline-flex px-5 py-2 rounded-xl bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300"
          >
            🔑 Pieslēgties
          </a>
        </div>
      </div>
    );
  }

  const coins = userData?.coins ?? 0;
  const boosts = userData?.boosts || {};
  const cosmetics = userData?.cosmetics || {};
  const buffs = userData?.buffs || {};
  const unlockedTopics = userData?.unlockedTopics || [];
  const isVIP = boosts.vip === true;

  const hasTheme = (themeId) =>
    Array.isArray(cosmetics.themes) && cosmetics.themes.includes(themeId);
  const hasVfx = (vfxId) =>
    Array.isArray(cosmetics.vfx) && cosmetics.vfx.includes(vfxId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-slate-950/85 border border-yellow-400/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-8 max-w-5xl w-full text-white"
      >
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-1">NBA Market 🛒</h1>
            <p className="text-slate-300 text-sm">
              Izmanto monētas, lai pirktu boostus, kosmetiku un atbloķētu
              režīmus.
            </p>
          </div>

          <div className="text-right text-xs md:text-sm">
            <p className="text-yellow-300 font-semibold">
              {firebaseUser.displayName || firebaseUser.email}
            </p>
            <p className="text-slate-300">
              💰 Monētas:{" "}
              <span className="text-yellow-300 font-bold">{coins}</span>
            </p>
            <p className="text-slate-400 mt-1">
              VIP:{" "}
              {isVIP ? (
                <span className="text-purple-300 font-semibold">Aktīvs 👑</span>
              ) : (
                <span className="text-slate-500">Nav</span>
              )}
            </p>
          </div>
        </div>

        {/* ITEMS */}
        <div className="grid md:grid-cols-3 gap-5">
          {storeItems.map((item) => {
            // OWNED logic
            let owned = false;
            if (item.type === "vip" && isVIP) owned = true;
            if (
              (item.type === "mode" || item.type === "topic") &&
              item.unlockKey &&
              unlockedTopics.includes(item.unlockKey)
            ) {
              owned = true;
            }
            if (item.type === "cosmetic" && item.cosmeticId) {
              owned = !!cosmetics[item.cosmeticId];
            }
            if (item.type === "theme" && item.themeId) {
              owned = hasTheme(item.themeId);
            }
            if (item.type === "vfx" && item.vfxId) {
              owned = hasVfx(item.vfxId);
            }

            // BOOST COUNT
            const boostCount =
              item.type === "boost" && item.boostKey
                ? boosts[item.boostKey] || 0
                : 0;

            const disabled =
              buyingId === item.id ||
              owned ||
              (item.type === "boost" && boostCount >= 5);

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: disabled ? 1 : 1.04 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm shadow-lg flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <span className="text-lg">{item.icon || "•"}</span>
                    <span>{item.name}</span>
                  </h3>
                  <p className="text-xs text-slate-300 mb-3">{item.desc}</p>

                  {item.type === "boost" && (
                    <p className="text-xs text-yellow-300 font-semibold mb-1">
                      Tev: {boostCount}/5
                    </p>
                  )}

                  {item.id === "xp_boost_24h" && buffs.xpBoostUntil > Date.now() && (
                    <p className="text-[11px] text-emerald-300">
                      XP boost jau aktīvs.
                    </p>
                  )}

                  {item.id === "daily_reward_x2" &&
                    buffs.dailyRewardX2Until > Date.now() && (
                      <p className="text-[11px] text-emerald-300">
                        Daily reward x2 ir aktīvs.
                      </p>
                    )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-slate-300">
                    Cena:{" "}
                    <span className="text-yellow-300 font-semibold">
                      {item.price} 💰
                    </span>
                  </div>

                  <button
                    onClick={() => !disabled && handleBuy(item)}
                    disabled={disabled}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      disabled
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-yellow-400 text-slate-900 hover:bg-yellow-300"
                    }`}
                  >
                    {owned
                      ? "✅ Iegādāts"
                      : item.type === "boost" && boostCount >= 5
                      ? "MAX (5)"
                      : buyingId === item.id
                      ? "Pērk..."
                      : "Pirkt"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
