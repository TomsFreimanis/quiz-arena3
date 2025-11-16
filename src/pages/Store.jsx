// src/pages/Store.jsx
import { useEffect, useState } from "react";
import { auth, db, purchaseItem } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import storeItems from "../data/storeItems";

// =========================
// TOAST
// =========================
const Toast = ({ msg, type }) => (
  <div
    className={`
      px-4 py-2 rounded-xl shadow-xl mb-2 text-sm font-semibold text-white 
      animate-slide-in
      ${type === "success" ? "bg-emerald-600" : "bg-red-600"}
    `}
  >
    {msg}
  </div>
);

export default function Store() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  const pushToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  // =========================
  // AUTH + REAL-TIME DATA
  // =========================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);

      if (u) {
        const ref = doc(db, "users", u.uid);
        const unsubSnap = onSnapshot(ref, (snap) => {
          setUserData(snap.data());
        });
        return () => unsubSnap();
      } else {
        setUserData(null);
      }
    });

    setLoading(false);
    return () => unsub();
  }, []);

  // =========================
  // BUY ITEM — FIXED
  // =========================
  const handleBuy = async (item) => {
    console.log("BUY CLICKED:", item); // DEBUG

    if (!firebaseUser) {
      pushToast("🔑 Jāielogojas, lai pirktu!", "error");
      return;
    }

    setBuyingId(item.id);

    try {
      const res = await purchaseItem(firebaseUser.uid, item);
      console.log("purchaseItem result:", res);

      if (!res.ok) {
        if (res.reason === "not_enough_coins") pushToast("Nepietiek monētu!", "error");
        else if (res.reason === "already_owned") pushToast("Šis jau tev pieder!", "error");
        else if (res.reason === "limit_reached") pushToast("Sasniegts maksimums!", "error");
        else pushToast("Pirkums neizdevās!", "error");
      } else {
        pushToast("Pirkums veiksmīgs! 🏀");
      }
    } catch (err) {
      console.error("BUY ERROR:", err);
      pushToast("Kļūda pirkuma laikā", "error");
    }

    setBuyingId(null);
  };

  // =========================
  // UI STATES
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Ielādē...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-slate-900 text-white">
        <div className="bg-slate-900/80 p-6 rounded-xl text-center border border-yellow-500/40">
          <h2 className="text-2xl font-bold mb-2">NBA Market 🛒</h2>
          <p className="text-sm mb-4">Tev jāielogojas, lai pirktu🥲</p>
          <a
            href="/login"
            className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-semibold hover:bg-yellow-300"
          >
            🔑 Ienākt
          </a>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Ielādē profilu...
      </div>
    );
  }

  // =========================
  // USER FIELDS
  // =========================
  const coins = userData.coins ?? 0;
  const boosts = userData.boosts || {};
  const cosmetics = userData.cosmetics || {};
  const unlockedTopics = userData.unlockedTopics || [];
  const isVIP = boosts.vip === true;

  const hasTheme = (id) => cosmetics.themes?.includes(id);
  const hasVFX = (id) => cosmetics.vfx?.includes(id);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 p-8">

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[9999]">
        {toasts.map((t) => (
          <Toast key={t.id} msg={t.msg} type={t.type} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          max-w-5xl mx-auto text-white 
          bg-slate-900/80 p-8 rounded-3xl 
          border border-yellow-400/40 shadow-2xl
        "
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">NBA Market 🛒</h1>
            <p className="text-slate-300">
              Boosti, režīmi un kosmētika.
            </p>
          </div>

          <div className="text-right">
            <p className="text-yellow-300 font-semibold">
              {firebaseUser.displayName || firebaseUser.email}
            </p>
            <p className="text-white">
              💰 <b>{coins}</b> coins
            </p>
            <p className="text-slate-300 text-xs">
              VIP: {isVIP ? "👑 Aktīvs" : "Nav"}
            </p>
          </div>
        </div>

        {/* ITEMS GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {storeItems.map((item) => {
            let owned = false;

            const boostCount = item?.boostKey ? (boosts[item.boostKey] || 0) : 0;

            if (item.type === "vip" && isVIP) owned = true;
            if ((item.type === "mode" || item.type === "topic") && unlockedTopics.includes(item.unlockKey)) owned = true;
            if (item.type === "cosmetic" && cosmetics[item.cosmeticId]) owned = true;
            if (item.type === "theme" && hasTheme(item.themeId)) owned = true;
            if (item.type === "vfx" && hasVFX(item.vfxId)) owned = true;

            const disabled =
              owned ||
              buyingId === item.id ||
              (item.type === "boost" && boostCount >= 5);

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                className="
                  bg-slate-900/60 border border-slate-700 
                  p-4 rounded-2xl shadow-xl flex flex-col justify-between
                "
              >
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {item.icon} {item.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 mb-3">
                    {item.desc}
                  </p>

                  {item.type === "boost" && (
                    <p className="text-xs text-yellow-300">Tev: {boostCount}/5</p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs">
                    Cena:{" "}
                    <span className="text-yellow-300 font-bold">
                      {item.price} 💰
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    disabled={disabled}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold 
                      ${
                        disabled
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-yellow-400 text-black hover:bg-yellow-300"
                      }
                    `}
                  >
                    {owned
                      ? "✔ Iegādāts"
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

/* ANIMATIONS */
const style = document.createElement("style");
style.innerHTML = `
@keyframes slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in .35s ease-out;
}
`;
document.head.appendChild(style);
