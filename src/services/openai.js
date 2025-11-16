import OpenAI from "openai";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateQuizQuestions(topic, count = 5, difficulty = "medium") {
  const prompt = `
Tu esi inteliģents viktorīnas veidotājs. Izveido ${count} pilnīgi unikālus, pareizi formulētus viktorīnas jautājumus latviešu valodā par tēmu "${topic}".
Katram jautājumam pievieno 4 atbilžu variantus, un norādi, kura ir pareizā.
Atbildi tikai derīgā JSON masīvā, šādā formātā:
[
  {
    "question": "Jautājuma teksts",
    "options": ["Atbilde1", "Atbilde2", "Atbilde3", "Atbilde4"],
    "correct": "Atbilde3",
    "difficulty": "${difficulty}"
  }
]
`;

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      temperature: 0.8
    });

    const raw = response.output[0].content[0].text.trim();

    // Izņem markdown (` ```json ... ``` `)
    const cleaned = raw.replace(/```json|```/g, "").trim();

    const questions = JSON.parse(cleaned);

    // Saglabā Firebase
    const topicRef = collection(db, "questions", topic.toLowerCase(), "items");
    for (const q of questions) {
      await addDoc(topicRef, q);
    }

    return questions;
  } catch (err) {
    console.error("❌ Kļūda ģenerējot jautājumus:", err);
    return [];
  }
}
