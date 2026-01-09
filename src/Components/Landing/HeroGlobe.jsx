import React from "react";

import GeminiIcon from "../../assets/landing imag/image (2) 1.svg";

const HeroGlobe = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible perspective-[1000px]">
      {/* --- LAYER 1: Ambient Background Atmosphere --- */}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Large faint glow to merge with page background */}

        <div className="w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />

        {/* Tighter, brighter core glow */}

        <div className="absolute w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[60px]" />
      </div>

      {/* --- LAYER 2: The Orbital Ring System --- */}

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer Ring: Dashed Technical Boundary */}

        {/* <div className="absolute w-[350px] h-[350px] md:w-[550px] md:h-[550px] border border-slate-700/30 rounded-full opacity-40 animate-[spin_60s_linear_infinite]" /> */}

        {/* <div className="absolute w-[350px] h-[350px] md:w-[550px] md:h-[550px] border border-dashed border-cyan-500/20 rounded-full animate-[spin_60s_linear_infinite_reverse]" /> */}

        {/* Middle Ring: Dynamic Arcs (The "Cyber" feel) */}

        <div className="absolute w-[280px] h-[280px] md:w-[420px] md:h-[420px] rounded-full animate-[spin_20s_linear_infinite]">
          {/* Using a gradient border effect via masking or pseudo-elements is complex, so we use distinct divs for arcs */}

          {/* <div className="absolute inset-0 rounded-full border-[1px] border-t-cyan-400/60 border-r-transparent border-b-indigo-500/60 border-l-transparent rotate-45" /> */}

          {/* <div className="absolute inset-2 rounded-full border-[1px] border-l-cyan-300/30 border-t-transparent border-r-transparent border-b-transparent" /> */}
        </div>

        {/* Inner Gyroscope Ring: Fast spinner with glow */}

        <div className="absolute w-[220px] h-[220px] md:w-[320px] md:h-[320px] rounded-full border border-indigo-500/20 animate-[spin_15s_linear_infinite_reverse]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        </div>

        {/* Angled Orbit (Simulating 3D Tilt) */}

        <div className="absolute w-[300px] h-[100px] md:w-[500px] md:h-[160px] border border-cyan-500/30 rounded-[100%] rotate-[-15deg] animate-pulse opacity-60" />
      </div>

      {/* --- LAYER 3: The Core (Icon Presenter) --- */}

      <div className="absolute inset-0 z-20 flex items-center justify-center">
        {/* Floating Container */}

        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
          {/* The Icon */}

          <img
            src={GeminiIcon}
            alt="NexChain Core"
            className="relative w-32 h-32 md:w-44 md:h-44 object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] brightness-110"
          />

          {/* Particle Orbiting closely around icon */}

          <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
            <div className="absolute top-2 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
          </div>
        </div>
      </div>

      {/* --- LAYER 4: Decoration Particles --- */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Random stars/dots */}

        <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-cyan-500/40 rounded-full animate-pulse" />

        <div className="absolute bottom-[30%] right-[20%] w-1.5 h-1.5 bg-indigo-500/40 rounded-full animate-pulse delay-700" />

        <div className="absolute top-[40%] right-[30%] w-1 h-1 bg-blue-400/30 rounded-full animate-pulse delay-300" />
      </div>
    </div>
  );
};

export default HeroGlobe;
