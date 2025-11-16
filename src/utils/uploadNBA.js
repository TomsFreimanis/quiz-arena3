import { db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import nbaQuizData from "../data/nbaQuizData";

export const uploadNBAQuestions = async () => {
  try {
    await setDoc(doc(db, "questions", "nba"), {
      questions: nbaQuizData,
    });

    console.log("NBA questions uploaded! 🔥");
  } catch (err) {
    console.error("Upload failed:", err);
  }
};
