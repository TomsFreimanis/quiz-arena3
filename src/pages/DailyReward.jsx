import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { claimDailyReward, getUserData } from "../services/firebase";
import { motion } from "framer-motion";

export default function DailyReward() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [rewardResult, setRewardResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) setData(await getUserData(u.uid));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleClaim = async () => {
    if (!user) return;
    setClaiming(true);

    const res = await claimDailyReward(user.uid);

    if (!res.ok) {
      alert("❌ Today's reward already claimed!");
      setClaiming(false);
      return;
    }

    setRewardResult(res);
    const fresh = await getUserData(user.uid);
    setData(fresh);
    setClaiming(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-300">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <a href="/login" className="bg-yellow-400 px-4 py-2 rounded-xl text-black">
          Log in to claim rewards
        </a>
      </div>
    );
  }

  const lastClaim = data?.dailyReward?.lastClaim
    ? new Date(data.dailyReward.lastClaim).toDateString()
    : "Never";

  const today = new Date().toDateString();
  const claimedToday = lastClaim === today;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 flex justify-center items-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-950/80 border border-yellow-400/40 p-8 rounded-3xl text-white max-w-md w-full shadow-xl"
      >
        <h1 className="text-3xl font-bold text-center mb-6">🎁 Daily Reward</h1>

        {!rewardResult ? (
          <>
            <p className="text-slate-300 text-center mb-3">
              Streak: <span className="text-yellow-300">{data.dailyReward.streak || 0} days</span>
            </p>

            <p className="text-slate-400 text-center mb-6">
              Last claim: {lastClaim}
            </p>

            <button
              disabled={claimedToday || claiming}
              onClick={handleClaim}
              className={`w-full py-3 rounded-xl text-black font-bold transition ${
                claimedToday
                  ? "bg-slate-600 cursor-not-allowed text-white"
                  : "bg-yellow-400 hover:bg-yellow-300"
              }`}
            >
              {claiming
                ? "Claiming..."
                : claimedToday
                ? "Already claimed"
                : "Claim reward"}
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-3 text-yellow-300">
              🎉 Reward Claimed!
            </h2>

            <p className="text-lg mb-4">
              Streak: <span className="text-yellow-300">{rewardResult.streak} days</span>
            </p>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-yellow-400/30 mb-6">
              <p className="text-xl font-bold text-white">
                {rewardResult.reward.type === "coins" &&
                  `💰 +${rewardResult.reward.amount * rewardResult.multiplier} Coins`}
                {rewardResult.reward.type === "xp" &&
                  `⭐ +${rewardResult.reward.amount * rewardResult.multiplier} XP`}
                {rewardResult.reward.type === "boost" &&
                  `⚡ BOOST: +1 ${rewardResult.reward.key}`}
                {rewardResult.reward.type === "cosmetic" &&
                  `🎨 New cosmetic unlocked!`}
              </p>
            </div>

            <a
              href="/"
              className="mt-4 inline-block bg-yellow-400 px-5 py-2 rounded-xl text-black font-bold hover:bg-yellow-300"
            >
              Back Home
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
