import { useState } from "react";
import { motion } from "framer-motion";

export default function TwoFactorModal({ email, onVerify }) {
  const [code, setCode] = useState("");

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-3">🔐 Divu faktoru pārbaude</h2>
        <p className="text-gray-600 mb-4">
          Mēs nosūtījām 6-ciparu kodu uz <b>{email}</b>
        </p>

        <input
          type="text"
          maxLength="6"
          className="w-full p-3 border rounded-xl mb-4 text-center tracking-widest text-xl"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button
          onClick={() => onVerify(code)}
          className="w-full bg-indigo-600 text-white p-3 rounded-xl font-semibold"
        >
          Apstiprināt
        </button>
      </div>
    </motion.div>
  );
}
