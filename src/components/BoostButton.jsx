import { motion, AnimatePresence } from "framer-motion";

export default function BoostButton({ icon, label, onUse, available }) {
  return (
    <motion.button
      onClick={onUse}
      disabled={!available}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: available ? 1 : 0.9,
        opacity: 1,
        boxShadow: available
          ? "0px 0px 12px rgba(0, 200, 255, 0.8)"
          : "0px 0px 0px rgba(0, 0, 0, 0)",
      }}
      whileTap={{ scale: 0.8 }}
      transition={{ type: "spring", stiffness: 200, damping: 12 }}
      className={`boost-button ${available ? "active" : "disabled"}`}
      style={{
        borderRadius: "12px",
        padding: "12px 18px",
        background: available
          ? "linear-gradient(135deg, #00d4ff, #007bff)"
          : "#555",
        border: "none",
        color: "white",
        cursor: available ? "pointer" : "not-allowed",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow effect */}
      <AnimatePresence>
        {available && (
          <motion.div
            className="glow"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: "-40%",
              left: "-40%",
              width: "180%",
              height: "180%",
              background:
                "radial-gradient(circle, rgba(0,255,255,0.4), rgba(0,0,0,0))",
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      <span style={{ zIndex: 5, fontSize: "18px", fontWeight: "700" }}>
        {icon} {label}
      </span>
    </motion.button>
  );
}
