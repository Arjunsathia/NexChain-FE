import React from "react";
import { motion } from "framer-motion";

const Preloader = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030303] text-white overflow-hidden"
    >
      {/* Cinematic Background - Deep, clean void */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_0%,_rgba(0,0,0,0)_100%)] opacity-50 will-change-transform" />
      </div>

      <div
        className="relative z-10 flex flex-col items-center justify-center p-8"
        style={{ transform: "translateZ(0)" }}
      >
        {/* The "Nexus" - Advanced Kinetic Structure */}
        <div className="relative w-32 h-32 mb-12 perspective-1000">
          {/* Ring 1 - The Stabilizer (Slow, Horizontal) */}
          <motion.div
            animate={{ rotateX: [60, 70, 60], rotateZ: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[1px] border-white/20 will-change-transform"
            style={{
              borderTopColor: "rgba(255,255,255,0.8)",
              borderBottomColor: "transparent",
            }}
          />

          {/* Ring 2 - The Accelerator (Medium, Vertical-ish) */}
          <motion.div
            animate={{ rotateY: [60, 50, 60], rotateZ: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-[1px] border-cyan-400/20 will-change-transform"
            style={{
              borderLeftColor: "rgba(34,211,238, 0.8)",
              borderRightColor: "transparent",
            }}
          />

          {/* Ring 3 - The Core (Fast, Omni) */}
          <motion.div
            animate={{
              rotateX: [45, -45, 45],
              rotateY: [45, 45, 45],
              rotateZ: 360,
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 rounded-full border-[1px] border-blue-500/20 will-change-transform"
            style={{
              borderTopColor: "rgba(59,130,246, 0.9)",
              borderLeftColor: "transparent",
            }}
          />

          {/* Central Singularity Point */}
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full shadow-[0_0_20px_white] will-change-transform"
          />
        </div>

        {/* Brand Name - Pure & Clean */}
        <div className="relative overflow-hidden">
          <motion.h1
            initial={{ y: 30, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} // smooth custom bezier
            className="text-4xl font-light font-outfit tracking-[0.3em] text-white select-none will-change-transform"
          >
            NEXCHAIN
          </motion.h1>
          {/* Reflection glint */}
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "100%", opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 will-change-transform"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;
