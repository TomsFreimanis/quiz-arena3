// src/components/AvatarIcon.jsx
export default function AvatarIcon({ url, rarity }) {
  const borderColor = {
    common: "border-gray-400",
    rare: "border-blue-400",
    epic: "border-purple-500",
    legendary: "border-yellow-400",
  }[rarity];

  return (
    <img
      src={url}
      alt=""
      className={`w-20 h-20 rounded-full border-4 ${borderColor} shadow-xl object-cover`}
    />
  );
}
