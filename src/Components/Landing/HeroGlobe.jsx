import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const LATITUDE_LINES = [...Array(12)];
const LONGITUDE_LINES = [...Array(12)];
const PARTICLES = [...Array(15)];

const HeroGlobe = () => {
  // Generate orbital data nodes
  const particles = useMemo(() => 
    PARTICLES.map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * -20,
      orbit: Math.random() * 360,
      color: i % 3 === 0 ? '#818CF8' : i % 2 === 0 ? '#22D3EE' : '#FFFFFF',
    })), []);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center perspective-[2000px] select-none">
      
      {/* 1. Atmospheric Glow Overlay */}
      <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse pointer-events-none" />

      {/* 2. The 3D Rotating Wireframe */}
      <motion.div 
        className="relative w-[280px] h-[280px] md:w-[500px] md:h-[500px] preserve-3d will-change-transform"
        animate={{ rotateY: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {/* Latitude Grid */}
        {LATITUDE_LINES.map((_, i) => (
          <div 
            key={`lat-${i}`}
            className="absolute inset-0 rounded-full border-[0.5px] border-indigo-400/20"
            style={{ transform: `rotateX(${i * (180 / LATITUDE_LINES.length)}deg)` }}
          />
        ))}
        
        {/* Longitude Grid */}
        {LONGITUDE_LINES.map((_, i) => (
          <div 
            key={`long-${i}`}
            className="absolute inset-0 rounded-full border-[0.5px] border-cyan-400/20"
            style={{ transform: `rotateY(${i * (360 / LONGITUDE_LINES.length)}deg)` }}
          />
        ))}

        {/* Orbital Data Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute inset-0 preserve-3d"
            style={{ rotateY: p.orbit }}
            animate={{ rotateZ: 360 }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
          >
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_10px_currentColor]"
              style={{ 
                width: p.size, 
                height: p.size, 
                backgroundColor: p.color,
                color: p.color,
                filter: `blur(${p.size < 4 ? '0px' : '1px'})` 
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Glassmorphic Central Branding Core */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute z-20"
      >
        <div className="relative w-32 h-32 md:w-52 md:h-52 bg-slate-900/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_60px_rgba(79,70,229,0.3)] overflow-hidden">
          
          {/* Internal Kinetic Rings */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-t border-l border-indigo-500/40 rounded-full"
          />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-b border-r border-cyan-500/20 border-dashed rounded-full"
          />

          {/* NEX Logo Text */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="flex items-baseline text-4xl md:text-6xl font-black tracking-tighter">
              <span className="text-white drop-shadow-2xl">NE</span>
              <span className="text-6xl md:text-8xl bg-gradient-to-tr from-indigo-400 via-cyan-400 to-white bg-clip-text text-transparent italic transform -skew-x-12">
                X
              </span>
            </div>
            <div className="text-[8px] md:text-[10px] tracking-[0.4em] uppercase font-bold text-indigo-300/60 text-center">
              Exchange Core
            </div>
          </div>

          {/* Surface Shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .preserve-3d { transform-style: preserve-3d; }
      `}} />
    </div>
  );
};

export default function App() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <HeroGlobe />
    </div>
  );
}