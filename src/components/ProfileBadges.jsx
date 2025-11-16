// src/components/ProfileBadges.jsx
export default function ProfileBadges({ cosmetics }) {
  return (
    <div className="flex gap-2 mt-3">
      {cosmetics?.frame_gold && (
        <span className="px-2 py-1 rounded-md border border-yellow-400 text-yellow-300 text-xs">
          🟨 Gold Frame
        </span>
      )}

      {cosmetics?.banner_mvp && (
        <span className="px-2 py-1 rounded-md border border-purple-300 text-purple-300 text-xs">
          🏆 MVP Banner
        </span>
      )}
    </div>
  );
}
