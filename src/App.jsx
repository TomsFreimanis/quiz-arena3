import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import QuizStart from "./pages/QuizStart";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Store from "./pages/Store";
import Achievements from "./pages/Achievements";
import Packs from "./pages/Packs";
import Login from "./pages/Login"; // ← 🔥 PIEVIENOTS

export default function App() {
  return (
    <Router>
      <Navbar />

      <main className="min-h-screen pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz-start" element={<QuizStart />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/store" element={<Store />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/packs" element={<Packs />} />

          {/* 🔥 LOGIN PAGE */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </Router>
  );
}
