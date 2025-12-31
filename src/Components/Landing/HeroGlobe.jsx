import React from 'react';


const HeroGlobe = () => {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center select-none pointer-events-none overflow-hidden">

      {/* 1. Optimized Ambient Glow (Gradient instead of Blur for performance) */}
      <div
        className="absolute inset-0 bg-transparent"
        style={{
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 60%)'
        }}
      />

      {/* 2. Cyber Rings System - Lower Motion Profile */}
      <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center">

        {/* Outer Ring - Static */}
        <div className="absolute inset-10 border border-indigo-500/10 rounded-full" />

        {/* Middle Ring - Slow Counter-Rotation for depth */}
        <div
          className="absolute inset-24 border border-cyan-500/10 border-dashed rounded-full opacity-50"
          style={{ animation: 'spin 40s linear infinite' }}
        />

        {/* Inner Ring - Slow Rotation */}
        <div
          className="absolute inset-36 border border-white/5 rounded-full"
          style={{ animation: 'spin 30s linear infinite', animationDirection: 'reverse' }}
        />

        {/* 4 Orbital Particles */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              animation: 'spin 20s linear infinite',
              animationDelay: `-${i * 5}s`
            }}
          >
            <div className="absolute top-20 left-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_currentColor] opacity-60" />
          </div>
        ))}
      </div>

      {/* 3. Stable High-Performance Core */}
      <div className="absolute z-20">
        <div className="relative w-40 h-40 md:w-56 md:h-56 bg-[#02040a]/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-2xl">

          {/* Static Decorative Ring (No Rotation) */}
          <div className="absolute inset-4 border border-white/5 rounded-full" />

          {/* Logo Content - Stable */}
          <div className="relative flex flex-col items-center">
            <div className="flex items-baseline text-5xl md:text-7xl font-black tracking-tighter">
              <span className="text-white drop-shadow-xl">NE</span>
              <span className="bg-gradient-to-br from-indigo-400 to-cyan-400 bg-clip-text text-transparent italic transform -skew-x-12 filter drop-shadow-lg">X</span>
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-slate-500 mt-1">
              Core
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroGlobe;