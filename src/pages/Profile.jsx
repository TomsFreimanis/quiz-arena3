// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { auth, getUserData } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

import ProfileBadges from "../components/ProfileBadges";
import AvatarPicker from "../components/AvatarPicker";
import AvatarStore from "../components/AvatarStore";

import { AVATARS } from "../utils/avatarList";

export default function Profile() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // Load Firebase user + Firestore
  // ===============================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        const d = await getUserData(user.uid);

        // nodrošina, ka mums ir arī ID
        setData({ ...d, id: user.uid });
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ===============================
  // Loading Screen
  // ===============================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 flex items-center justify-center">
        <p className="text-yellow-300 animate-pulse">Ielādē profilu...</p>
      </div>
    );
  }

  // ===============================
  // If not logged in — show message
  // ===============================
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 flex items-center justify-center">
        <div className="bg-slate-900/80 border border-yellow-500/40 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Profilam vajag pieteikties</h2>
          <a
            href="/login"
            className="inline-block px-5 py-2 bg-yellow-400 text-slate-900 font-semibold rounded-xl hover:bg-yellow-300"
          >
            🔑 Pieslēgties
          </a>
        </div>
      </div>
    );
  }

  // ===============================
  // Extract stats & cosmetics
  // ===============================
  const cosmetics = data?.cosmetics || {};
  const coins = data?.coins ?? 0;
  const points = data?.points ?? 0;
  const level = data?.level ?? 1;
  const xp = data?.xp ?? 0;
  const history = data?.history ?? [];

  // ===============================
  // AVATAR LOGIC — FIXED
  // ===============================
  const avatarId = data?.avatarId || "common1";

  // same structure as avatarList.js: id, rarity, price, url
  const avatarObj =
    AVATARS.find((a) => a.id === avatarId) || AVATARS[0];

  const avatarImg = avatarObj.url; // ALWAYS correct path

  // ===============================
  // PAGE RENDER
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 px-6 py-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-slate-950/85 border border-yellow-400/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-8 max-w-3xl w-full text-white"
      >
        {/* ---------------- AVATAR SECTION ---------------- */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={avatarImg}
              alt="avatar"
              className={`w-28 h-28 rounded-full border-4 object-cover shadow-xl ${
                cosmetics.frame_gold ? "border-yellow-400" : "border-slate-700"
              }`}
            />

            {cosmetics.banner_mvp && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                🏆 MVP
              </div>
            )}
          </div>

          <h1 className="text-3xl font-extrabold mt-5">
            {firebaseUser.displayName || firebaseUser.email}
          </h1>

          <ProfileBadges cosmetics={cosmetics} />
        </div>

        {/* ---------------- STATS ---------------- */}
        <div className="grid grid-cols-2 gap-4 mb-7">
          <StatCard label="Punkti" value={points} color="text-purple-300" />
          <StatCard label="Monētas" value={coins} color="text-yellow-300" />
          <StatCard label="Līmenis" value={level} color="text-blue-300" />
          <StatCard label="XP" value={xp} color="text-emerald-300" />
        </div>

        {/* ---------------- OWNED AVATARS ---------------- */}
        <AvatarPicker userData={data} />

        {/* ---------------- AVATAR STORE ---------------- */}
       <div className="flex justify-center w-full">
  <AvatarStore userData={data} />
</div>

        {/* ---------------- HISTORY ---------------- */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-yellow-300 mb-3">📜 Spēļu vēsture</h2>

          {history.length === 0 ? (
            <p className="text-slate-400">Nav spēļu vēstures.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800"
                >
                  <p className="font-semibold text-white">{h.topic}</p>
                  <p className="text-sm text-slate-300">Punkti: {h.score}</p>
                  <p className="text-xs text-slate-500">{h.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ===============================
function StatCard({ label, value, color }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl shadow-lg text-center">
      <p className="text-sm text-slate-300">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
