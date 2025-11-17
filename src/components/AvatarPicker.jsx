// src/components/AvatarPicker.jsx
import { db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import AvatarIcon from "./AvatarIcon";
import { AVATARS } from "../utils/avatarList";

export default function AvatarPicker({ userData }) {
  if (!userData) return null;

  const owned = userData.ownedAvatars || [];

  async function chooseAvatar(id) {
    await updateDoc(doc(db, "users", userData.id), {
      avatarId: id,
    });
    window.location.reload();
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl text-yellow-300 font-bold mb-3">
        👤 Tavi avatari
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {AVATARS.filter(a => owned.includes(a.id)).map(a => (
          <button
            key={a.id}
            onClick={() => chooseAvatar(a.id)}
            className="flex flex-col items-center"
          >
            <AvatarIcon url={a.url} rarity={a.rarity} />

            <p className="text-sm mt-2">
              {userData.avatarId === a.id ? "✓ Izvēlēts" : a.rarity}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
