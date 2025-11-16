import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getRandomReward } from "../utils/packRewards";

export default function NewPackOpening({ onFinish }) {
  const [cards, setCards] = useState([]);
  const [revealedIndex, setRevealedIndex] = useState(null);

  useEffect(() => {
    const hiddenCards = Array(3).fill({ type: "hidden" });
    const reward = getRandomReward();

    // Insert reward always in the center
    hiddenCards[1] = reward;

    setCards(hiddenCards);
  }, []);

  const reveal = () => {
    setRevealedIndex(1);
    setTimeout(() => onFinish(cards[1]), 1200);
  };

  return (
    <div className="flex flex-col items-center mt-10 text-white">
      <h2 className="text-xl font-bold mb-3">🎁 Pack Opening</h2>
      <p className="text-slate-300 text-sm mb-4">Klikšķini atklāt...</p>

      <div className="flex gap-6 mt-4">
        {cards.map((card, i) => {
          const isReward = i === 1;
          const isRevealed = revealedIndex === i;

          return (
            <motion.div
              key={i}
              onClick={() => isReward && reveal()}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{
                scale: isRevealed ? 1.2 : 1,
                opacity: 1,
                rotateY: isRevealed ? 180 : 0,
              }}
              transition={{ duration: 0.6 }}
              className="
                w-[130px] h-[170px]
                bg-slate-800/80 border border-slate-600
                rounded-xl cursor-pointer flex flex-col items-center justify-center
                shadow-xl relative
              "
            >
              {!isRevealed && (
                <div className="text-3xl">
                  🎁
                </div>
              )}

              {isRevealed && card.type !== "hidden" && (
                <div className="flex flex-col items-center text-center px-2">
                  <div className="text-4xl mb-2">
                    {card.type === "boost" && "⚡"}
                    {card.type === "coins" && "💰"}
                    {card.type === "xp" && "⭐"}
                    {card.type === "cosmetic" && "🎨"}
                  </div>
                  <p className="font-bold">{card.name}</p>
                  <p className="text-xs text-slate-300">{card.desc}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
