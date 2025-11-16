// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  // 🔥 Sync localStorage user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    setLocalUser(stored ? JSON.parse(stored) : null);
  }, []);

  // 🔥 Listen to Firebase auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        localStorage.removeItem("user");
        setLocalUser(null);
      }
    });
    return () => unsub();
  }, []);

  // 🔥 Logout
  const handleLogout = async () => {
    localStorage.removeItem("user"); // remove first
    setLocalUser(null);
    await signOut(auth); // then firebase signOut
  };

  return (
    <nav className="w-full bg-[#0A0D1F] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          🏀 <span>NBA QUIZ</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-8 text-lg font-medium items-center">
          <Link className="hover:text-yellow-400" to="/">Home</Link>
          <Link className="hover:text-yellow-400" to="/quiz-start">Quiz</Link>
          <Link className="hover:text-yellow-400" to="/leaderboard">Leaderboard</Link>
          <Link className="hover:text-yellow-400" to="/achievements">Achievements</Link>
          <Link className="hover:text-yellow-400" to="/store">Store</Link>
          <Link className="hover:text-yellow-400" to="/profile">Profile</Link>
          <Link className="hover:text-yellow-400" to="/packs">🎁 Packs</Link>
          <Link className="hover:text-yellow-400" to="/daily">🎁 Daily</Link>


          {/* 🔥 Login / Logout button */}
          {localUser ? (
            <button
              onClick={handleLogout}
              className="
                ml-4 px-5 py-2 
                bg-gradient-to-r from-red-500 to-red-600
                text-white font-semibold 
                rounded-xl shadow-lg
                hover:scale-105 hover:shadow-[0_0_12px_rgba(255,50,50,0.6)]
                transition-all duration-200
              "
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="
                ml-4 px-5 py-2 
                bg-gradient-to-r from-yellow-400 to-orange-500 
                text-black font-semibold 
                rounded-xl shadow-md
                hover:scale-105 hover:shadow-[0_0_12px_rgba(255,200,40,0.7)]
                transition-all duration-200
              "
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="md:hidden bg-[#0A0D1F] border-t border-white/10 flex flex-col p-4 text-center gap-4 text-lg">
          
          <Link onClick={() => setOpen(false)} to="/">Home</Link>
          <Link onClick={() => setOpen(false)} to="/quiz-start">Quiz</Link>
          <Link onClick={() => setOpen(false)} to="/leaderboard">Leaderboard</Link>
          <Link onClick={() => setOpen(false)} to="/achievements">Achievements</Link>
          <Link onClick={() => setOpen(false)} to="/store">Store</Link>
          <Link onClick={() => setOpen(false)} to="/profile">Profile</Link>
          <Link onClick={() => setOpen(false)} to="/packs">🎁 Packs</Link>
          <Link onClick={() => setOpen(false)} to="/daily">🎁 Daily</Link>


          {localUser ? (
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="
                px-5 py-2 
                bg-gradient-to-r from-red-500 to-red-600
                text-white font-semibold 
                rounded-xl shadow-lg
                hover:bg-red-500/90
                transition-all
              "
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="
                px-5 py-2 
                bg-gradient-to-r from-yellow-400 to-orange-500
                text-black font-semibold 
                rounded-xl shadow-lg
                hover:scale-105
                transition-all
              "
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
