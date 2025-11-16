// src/components/Roller.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getRandomReward } from "../utils/packRewards";

const ITEM_WIDTH = 130;
const TOTAL_ITEMS = 70;

export default function Roller({ onStop }) {
  const [items, setItems] = useState([]);
  const [winnerIndex, setWinnerIndex] = useState(0);

  useEffect(() => {
    const temp = [];
    for (let i = 0; i < TOTAL_ITEMS; i++) temp.push(getRandomReward());

    const winIdx = Math.floor(TOTAL_ITEMS - 8); // winner always inside "window"
    const winner = getRandomReward();
    temp[winIdx] = winner;

    setItems(temp);
    setWinnerIndex(winIdx);
  }, []);

  const finalX = -winnerIndex * ITEM_WIDTH + 180; // perfectly center item

  return (
    <div className="mt-10">
      {/* Window Glow */}
      <div className="mx-auto w-[300px] h-[100px] border-2 border-yellow-400 shadow-[0_0_40px_gold] rounded-xl relative -mb-[100px] z-10"></div>

      <div className="overflow-hidden w-[600px] mx-auto bg-black/40 border border-slate-700 rounded-xl py-6 backdrop-blur-md shadow-xl">
        <motion.div
          className="flex gap-2"
          initial={{ x: 0 }}
          animate={{ x: finalX }}
          transition={{
            duration: 4,
            ease: [0.05, 0.82, 0.15, 1],
          }}
          onAnimationComplete={() => {
            const winner = items[winnerIndex];
            onStop(winner);
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="w-[130px] h-[100px] flex flex-col justify-center items-center rounded-lg bg-slate-900 border border-slate-700 text-center"
            >
              <div className="text-2xl">
                {item.type === "boost" && "⚡"}
                {item.type === "coins" && "💰"}
                {item.type === "xp" && "⭐"}
                {item.type === "cosmetic" && "🎨"}
              </div>
              <p className="text-xs mt-1">{item.name}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
