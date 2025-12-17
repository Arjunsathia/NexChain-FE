import React from "react";
import { motion } from "framer-motion";

const Preloader = () => {
  const letters = "NEXCHAIN".split("");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Premium Spinner */}
        <div className="relative w-24 h-24 mb-12">
          {/* Core Glow */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(6,182,212,0.2)",
                "0 0 60px rgba(6,182,212,0.6)",
                "0 0 20px rgba(6,182,212,0.2)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-transparent"
          />

          {/* Outer Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-cyan-500/20 border-t-cyan-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle Ring */}
          <motion.div
            className="absolute inset-2 rounded-full border border-blue-500/20 border-b-blue-400"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner Ring */}
          <motion.div
            className="absolute inset-4 rounded-full border border-purple-500/20 border-l-purple-400"
            animate={{ rotate: 180 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          {/* Center Dot */}
          <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white shadow-[0_0_15px_white]" />
        </div>

        {/* Text Reveal */}
        <div className="flex overflow-hidden">
          {letters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + index * 0.04,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              className="text-5xl md:text-6xl font-bold font-outfit tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500"
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.8em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-4 text-xs font-medium text-cyan-500/80 uppercase"
        >
          The Future of Trading
        </motion.div>

        {/* Minimal Progress Bar */}
        <div className="mt-16 w-32 h-[1px] bg-gray-800 relative overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;
