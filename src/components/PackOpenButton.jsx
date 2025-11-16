export default function PackOpenButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        relative px-7 py-3 
        rounded-2xl font-extrabold text-black 
        bg-gradient-to-r from-amber-300 to-orange-500 
        shadow-[0_0_20px_rgba(255,165,0,0.6)]
        hover:shadow-[0_0_35px_rgba(255,180,0,0.9)]
        hover:scale-[1.06]
        active:scale-[0.97]
        transition-all duration-200
        overflow-hidden
      "
    >
      {/* Gloss Shine Overlay */}
      <span
        className="
          absolute left-0 top-0 w-full h-full
          bg-gradient-to-b from-white/40 to-transparent
          opacity-40 pointer-events-none
          rounded-2xl
        "
      ></span>

      {/* Animated Diagonal Shine */}
      <span
        className="
          absolute top-0 left-[-150%]
          w-[200%] h-full
          bg-gradient-to-r from-transparent via-white/50 to-transparent
          animate-[shine_2.5s_linear_infinite]
          pointer-events-none
        "
      ></span>

      🎁 Open Pack (25 coins)
    </button>
  );
}
