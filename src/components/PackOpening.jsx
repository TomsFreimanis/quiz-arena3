import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getRandomReward, RARITY } from "../utils/packRewards";

const CARD_WIDTH = 130;
const GAP = 12;
const STEP = CARD_WIDTH + GAP;

export default function PackOpening({ onFinish }) {
  const [stripItems, setStripItems] = useState([]);
  const [finalIndex, setFinalIndex] = useState(null);
  const [finalReward, setFinalReward] = useState(null);
  const [targetX, setTargetX] = useState(null);
  const [highlightFinal, setHighlightFinal] = useState(false);

  const containerRef = useRef(null);

  // Sounds
  const tick = new Audio("/sounds/tick.mp3");
  const whoosh = new Audio("/sounds/whoosh.mp3");
  const win = new Audio("/sounds/win.mp3");

  tick.volume = 0.25;
  whoosh.volume = 0.7;
  win.volume = 0.9;

  useEffect(() => {
    const base = Array.from({ length: 60 }, () => getRandomReward());

    const reward = getRandomReward();
    const index = 28;

    base[index] = reward;

    setStripItems(base);
    setFinalIndex(index);
    setFinalReward(reward);

    let interval = setInterval(() => tick.play(), 75);

    setTimeout(() => {
      whoosh.play();
      clearInterval(interval);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!stripItems.length || finalIndex === null) return;

    const update = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const finalX = -(finalIndex * STEP) + (containerWidth / 2 - CARD_WIDTH / 2);

      setTargetX(finalX);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [stripItems, finalIndex]);

  if (!stripItems.length) return null;

  return (
    <div className="w-full flex flex-col items-center mt-14 text-white">
      <p className="text-slate-300 mb-8">Rullis griežas… skatāmies!</p>

      <div
        ref={containerRef}
        className="relative w-full max-w-[1300px] overflow-hidden mx-auto"
        style={{ height: 200 }}
      >
        {/* Center highlight frame */}
        <div
          className="pointer-events-none"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: CARD_WIDTH,
            height: 180,
            transform: "translate(-50%, -50%)",
            borderRadius: 15,
            zIndex: 15,
            border: "4px solid gold",
            boxShadow: "0 0 25px rgba(255,215,0,0.7)"
          }}
        />

        {/* Reel strip */}
        <motion.div
          className="absolute top-[10px] left-0 flex"
          style={{ gap: `${GAP}px` }}
          initial={{ x: 0 }}
          animate={targetX !== null ? { x: targetX } : {}}
          transition={{
            duration: 4.35,
            ease: [0.15, 0.85, 0.15, 1],
          }}
          onAnimationComplete={() => {
            setHighlightFinal(true);
            win.play();
            onFinish(finalReward);
          }}
        >
          {stripItems.map((item, i) => {
            const rarity = RARITY[item.rarity];
            const color = rarity.color;
            const isFinal = i === finalIndex;

            return (
              <motion.div
                key={i}
                className="w-[130px] h-[180px] rounded-xl border-2 flex flex-col items-center justify-center bg-[#0d1120] text-center select-none relative"
                style={{
                  borderColor: color,
                  boxShadow: isFinal && highlightFinal
                    ? `0 0 45px ${color}, inset 0 0 25px ${color}aa`
                    : `0 0 15px ${color}55`
                }}
                animate={isFinal && highlightFinal ? { scale: 1.25, y: -12 } : {}}
                transition={{ duration: 0.35 }}
              >
                <div className="text-4xl">{item.icon}</div>
                <p className="mt-2 font-bold" style={{ color }}>
                  {item.name}
                </p>
                <p className="text-xs opacity-70 w-[90%]">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
