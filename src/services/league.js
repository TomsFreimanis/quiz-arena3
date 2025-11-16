// src/services/league.js
import { db, getUserData } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

const DIVISIONS = [
  { id: "bronze", name: "Bronze", minPoints: 0 },
  { id: "silver", name: "Silver", minPoints: 200 },
  { id: "gold", name: "Gold", minPoints: 500 },
  { id: "platinum", name: "Platinum", minPoints: 900 },
  { id: "diamond", name: "Diamond", minPoints: 1400 },
];

export const ensureLeague = async (uid) => {
  const data = await getUserData(uid);
  const ref = doc(db, "users", uid);

  if (!data?.league) {
    const base = { division: "bronze", points: 0 };
    await updateDoc(ref, { league: base });
    return base;
  }
  return data.league;
};

// context: { score }
export const updateLeagueOnGameEnd = async (uid, context) => {
  if (!uid) return null;
  const { score = 0 } = context || {};

  let league = await ensureLeague(uid);
  let points = league.points || 0;

  // pievienojam, piemēram, score/2
  points += Math.round(score / 2);

  let newDivision = league.division;
  for (const div of DIVISIONS) {
    if (points >= div.minPoints) {
      newDivision = div.id;
    }
  }

  const promoted = newDivision !== league.division;

  league = {
    division: newDivision,
    points,
  };

  await updateDoc(doc(db, "users", uid), {
    league,
  });

  return { ...league, promoted };
};
