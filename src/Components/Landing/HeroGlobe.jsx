import React from "react";
import { motion } from "framer-motion";





const LATITUDE_LINES = [...Array(6)];
const LONGITUDE_LINES = [...Array(6)];

const HeroGlobe = React.memo(() => {
  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
      {}
      <div className="absolute inset-0 bg-white/5 blur-[120px] rounded-full opacity-20 animate-pulse-slow"></div>
      
      {}
      <motion.div 
        className="relative w-[260px] h-[260px] md:w-[500px] md:h-[500px] preserve-3d will-change-transform"
        animate={{ rotateY: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {}
        {LATITUDE_LINES.map((_, i) => (
          <div 
            key={`lat-${i}`}
            className="absolute inset-0 rounded-full border border-[#728AD5]/20"
            style={{ 
              transform: `rotateX(${i * 30}deg)`,
              boxShadow: "0 0 10px rgba(114,138,213,0.1)"
            }}
          />
        ))}
        
        {}
        {LONGITUDE_LINES.map((_, i) => (
          <div 
            key={`long-${i}`}
            className="absolute inset-0 rounded-full border border-[#728AD5]/20"
            style={{ 
              transform: `rotateY(${i * 30}deg)`,
              boxShadow: "0 0 10px rgba(114,138,213,0.1)"
            }}
          />
        ))}

        {}
        <motion.div 
          className="absolute inset-0 will-change-transform"
          animate={{ rotateZ: 360, rotateX: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full blur-[1px] shadow-[0_0_10px_white]" />
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-[#728AD5] rounded-full blur-[1px]" />
          <div className="absolute left-0 top-1/2 w-2 h-2 bg-[#A5B4FC] rounded-full blur-[1px]" />
        </motion.div>
      </motion.div>

      {}
      <div className="absolute z-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-[#0f172a] to-[#020202] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(114,138,213,0.2)] border border-[#728AD5]/40">
         
         {}
         <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#728AD5]/10 to-transparent opacity-40"></div>

         <div className="relative w-full h-full flex items-center justify-center">
            {}
            <div className="absolute inset-3 md:inset-4 border-2 border-dashed border-[#728AD5]/60 rounded-full"></div>
            
            {}
            <div className="flex items-baseline justify-center text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#C7D2FE] via-[#728AD5] to-[#312E81] drop-shadow-lg font-manrope tracking-tighter">
              NE<span className="text-6xl md:text-8xl">X</span>
            </div>
         </div>
      </div>
    </div>
  );
});

export default HeroGlobe;
