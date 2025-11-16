// src/pages/Login.jsx
import { useEffect, useState } from "react";
import {
  auth,
  signInWithGoogle,
  signUpWithEmail,
  signInUserWithEmail,
} from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

// 🔥 Saglabā user lokāli, lai Navbar var noteikt, vai esi ielogojies
function saveUserToLocalStorage(u) {
  if (!u) return;

  const userData = {
    name: u.displayName || u.email,
    email: u.email,
    uid: u.uid,
  };

  localStorage.setItem("user", JSON.stringify(userData));
}

export default function Login() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔥 Kad Firebase pamana, ka esi ielogojies → saglabā user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) saveUserToLocalStorage(u);
    });
    return () => unsub();
  }, []);

  // 🔥 Email login/register
  const handleEmailSubmit = async () => {
    setError("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        const u = await signInUserWithEmail(email, password);
        saveUserToLocalStorage(u.user);
      } else {
        const u = await signUpWithEmail(email, password, name);
        saveUserToLocalStorage(u.user);
      }
    } catch (err) {
      setError(err.message || "Neizdevās pabeigt darbību.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          bg-slate-950/80 
          border border-yellow-500/40 
          rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.9)] 
          p-8 
          w-full max-w-md 
          text-center text-white
        "
      >
        <h1 className="text-4xl font-extrabold text-yellow-300 mb-2 drop-shadow">
          🏀 NBA LOGIN
        </h1>
        <p className="text-slate-300 mb-6 text-sm">
          Pieslēdzies, lai piedalītos NBA kvízos, celtu līmeni un atbloķētu Ultra režīmus.
        </p>

        {/* 🔥 Ja esi ielogojies */}
        {user ? (
          <div className="space-y-4">
            <p className="text-lg">
              Sveiks,{" "}
              <span className="font-bold text-yellow-300">
                {user.displayName || user.email}
              </span>
              !
            </p>
            <p className="text-xs text-slate-400">
              Tu jau esi ielogojies — dodies spēlēt!
            </p>
            <a
              href="/"
              className="
                inline-flex justify-center items-center 
                px-6 py-3 w-full
                rounded-xl 
                bg-yellow-400 text-slate-900
                font-semibold text-sm
                hover:bg-yellow-300
                transition shadow-lg
              "
            >
              🚀 Uz sākumu
            </a>
          </div>
        ) : (
          <>
            {/* Mode Switch */}
            <div className="flex mb-6 bg-slate-900/70 rounded-xl p-1 text-xs">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 rounded-lg transition ${
                  mode === "login"
                    ? "bg-yellow-400 text-slate-900 font-bold"
                    : "text-slate-400"
                }`}
              >
                Ienākt
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 rounded-lg transition ${
                  mode === "register"
                    ? "bg-yellow-400 text-slate-900 font-bold"
                    : "text-slate-400"
                }`}
              >
                Reģistrēties
              </button>
            </div>

            {/* Email Form */}
            <div className="space-y-3 text-left mb-4">

              {mode === "register" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Vārds</label>
                  <input
                    type="text"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tavs vārds"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">E-pasts</label>
                <input
                  type="email"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Parole</label>
                <input
                  type="password"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

              <button
                onClick={handleEmailSubmit}
                disabled={submitting}
                className="
                  w-full mt-2 py-2.5 rounded-xl 
                  bg-yellow-400 text-slate-900 
                  hover:bg-yellow-300 
                  font-semibold text-sm
                  disabled:opacity-60 shadow-lg
                "
              >
                {submitting
                  ? "Apstrādā..."
                  : mode === "login"
                  ? "Ienākt"
                  : "Reģistrēties"}
              </button>
            </div>

            {/* Divider */}
            <div className="my-4 text-xs text-slate-500 flex items-center gap-2">
              <span className="flex-1 h-px bg-slate-700" />
              <span>vai</span>
              <span className="flex-1 h-px bg-slate-700" />
            </div>

            {/* GOOGLE LOGIN */}
            <button
              onClick={async () => {
                const u = await signInWithGoogle();
                saveUserToLocalStorage(u.user);
              }}
              className="
                w-full flex items-center justify-center gap-3 py-2.5 
                rounded-xl bg-white text-slate-900 
                text-sm font-semibold hover:bg-slate-100 transition
              "
            >
              <img
                src='https://www.svgrepo.com/show/475656/google-color.svg'
                alt='Google'
                className='w-5 h-5'
              />
              Turpināt ar Google
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
