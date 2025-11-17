// src/components/AvatarStore.jsx
import { db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import AvatarIcon from "./AvatarIcon";
import { AVATARS } from "../utils/avatarList";

export default function AvatarStore({ userData }) {
  if (!userData) return null;

  const owned = userData.ownedAvatars || [];

  async function buyAvatar(avatar) {
    if (owned.includes(avatar.id)) return;
    if (userData.coins < avatar.price) return alert("Nepietiek monētu!");

    await updateDoc(doc(db, "users", userData.id), {
      coins: userData.coins - avatar.price,
      ownedAvatars: [...owned, avatar.id],
    });

    window.location.reload();
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl text-yellow-300 font-bold mb-3">
        🛒 Avataru veikals
      </h2>

      {/* 🔥 GRID centrēšana */}
      <div className="
        grid 
        grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
        gap-6 
        justify-items-center
        w-full
      ">
        {AVATARS.map(a => (
          <div
            key={a.id}
            className="
              p-4 
              bg-slate-900/80 
              border border-slate-700 
              rounded-xl 
              text-center
              w-full max-w-[150px]
            "
          >
            <AvatarIcon url={a.url} rarity={a.rarity} />

            <p className="mt-3 font-bold capitalize">{a.rarity}</p>

            {owned.includes(a.id) ? (
              <p className="text-green-400 mt-2">✔ Iegādāts</p>
            ) : (
              <>
                <p className="text-yellow-300 mt-2">{a.price} coins</p>
                <button
                  onClick={() => buyAvatar(a)}
                  className="mt-2 px-3 py-1 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
                >
                  Pirkt
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
