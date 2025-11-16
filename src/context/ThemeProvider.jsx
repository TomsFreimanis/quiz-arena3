// src/context/ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, getUserData } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setTheme("default");
        return;
      }

      const user = await getUserData(u.uid);
      const cosmetics = user?.cosmetics;

      if (cosmetics?.themes?.includes("theme_ultra_nba")) {
        setTheme("ultra_nba");
      } else {
        setTheme("default");
      }
    });

    return () => unsub();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div className={theme === "ultra_nba" ? "ultra-theme" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
