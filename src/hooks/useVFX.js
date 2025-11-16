// src/hooks/useVFX.js
import { useEffect } from "react";

export function useVFX(cosmetics) {
  const hasArenaVFX = cosmetics?.vfx?.includes("vfx_arena");
  const hasSlamDunkFX = cosmetics?.vfx?.includes("vfx_slamdunk");

  const playCorrect = () => {
    if (hasSlamDunkFX) {
      new Audio("/sounds/dunk.mp3").play();
    }
  };

  const playWrong = () => {
    if (hasSlamDunkFX) {
      new Audio("/sounds/miss.mp3").play();
    }
  };

  const sparkles = () => {
    if (!hasArenaVFX) return;
    const el = document.createElement("div");
    el.className =
      "fixed pointer-events-none animate-ping bg-yellow-400 w-6 h-6 rounded-full opacity-80";
    el.style.top = Math.random() * 80 + "%";
    el.style.left = Math.random() * 80 + "%";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
  };

  return { playCorrect, playWrong, sparkles };
}
