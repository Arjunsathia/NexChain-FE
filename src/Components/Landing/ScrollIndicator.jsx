import React from "react";
import { motion } from "framer-motion";


const PremiumScrollIndicator = ({ onClick, TC }) => {
  return (
    <motion.div
      
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 1.2,
        duration: 0.65,
        ease: [0.16, 0.72, 0.25, 0.94],
      }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer hidden lg:flex z-30"
      onClick={onClick}
      aria-label="Scroll down"
    >
      {}
      <motion.div
        className="flex flex-col items-center gap-3"
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.03,
          y: -2,
        }}
        whileTap={{ scale: 0.97 }}
      >

        {}
        <div className="h-2 w-16 rounded-full blur-md bg-[#728AD5]/25 pointer-events-none" />

        {}
        <div className="relative">
          <div className="relative w-8 h-14 rounded-full p-[1px] bg-gradient-to-b from-[#728AD5]/80 via-[#728AD5]/20 to-transparent shadow-[0_0_30px_rgba(114,138,213,0.35)]">
            {}
            <div className="relative w-full h-full rounded-full bg-slate-950/80 backdrop-blur-md flex justify-center overflow-hidden">
              {}
              <motion.div
                animate={{
                  y: ["-120%", "60%"],
                  scaleY: [1, 1.18, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.9,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: 0.25,
                }}
                className="absolute w-1.5 h-6 rounded-full bg-[#A5B4FC]"
                style={{ boxShadow: "0 0 8px rgba(114,138,213,1), 0 0 18px rgba(114,138,213,0.8)" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PremiumScrollIndicator;
