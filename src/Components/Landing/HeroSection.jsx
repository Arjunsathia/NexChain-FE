import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";
import HeroGlobe from "./HeroGlobe";
import PremiumScrollIndicator from "./ScrollIndicator";

const HeroSection = ({ navigate, isLoggedIn, TC, scrollToFeatures }) => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const fgParallaxY = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <section
      className="min-h-screen flex items-center justify-center pt-20 pb-20 md:pt-0 md:pb-0 relative bg-transparent"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <motion.div
          variants={{}}
          style={{ y: heroY, opacity: heroOpacity }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center"
        >
          {/* MOBILE ONLY BADGE: Order 1 */}
          <div className="order-1 lg:hidden w-full flex justify-center mb-2 relative z-30">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-[#0B0E14] text-cyan-200 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <svg
                className="w-3.5 h-3.5 text-cyan-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Next Gen Trading
            </div>
          </div>

          {/* Text Content - Order 3 on Mobile (Bottom), Order 1 on Desktop (Left) */}
          <motion.div
            variants={{}}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8 order-3 lg:order-1 relative z-20 max-w-[520px] mx-auto lg:mx-0"
          >
            {/* BADGE: Match Image - Sleek & Darker - DESKTOP ONLY */}
            <div className="hidden lg:inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase bg-[#0B0E14] text-cyan-200 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <svg
                className="w-3.5 h-3.5 text-cyan-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Next Gen Trading
            </div>

            {/* HEADLINE: Bold & Refined Gradient */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.15] tracking-tight font-manrope text-white">
              The Future of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-700 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                Digital Assets
              </span>
            </h1>

            {/* SUBTEXT: Clean & Readable */}
            <p className="text-slate-400 text-sm md:text-lg leading-relaxed font-normal max-w-[90%] mx-auto lg:mx-0">
              Institutional-grade crypto trading with real-time analytics,
              AI-driven insights, and near-zero latency.
            </p>

            {/* BUTTONS: CTA Row - Fixed Sizing & Styling */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto pt-4 sm:pt-6">
              {/* Primary Button: Cyan Border + Gloss + Semi-Transparent */}
              {/* Primary Button: Cyan Border + Gloss + Semi-Transparent */}
              <button
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
                className="
    group relative 
    w-full sm:w-auto
    px-10 py-3.5 
    rounded-full 
    font-bold text-sm md:text-base tracking-wide text-white 
    transition-all duration-300 
    overflow-hidden
    backdrop-blur-md
    
    /* THE OUTER GLOW (Bloom effect) */
    shadow-[0_0_20px_-5px_rgba(79,205,218,0.5)] 
    
    /* THE GLASS EFFECT BORDERS (The Key Part) */
    /* 1. inset 0 1px 0: Creates the sharp white reflection on TOP */
    /* 2. inset 0 -2px 0: Creates the shining cyan refraction on BOTTOM line */
    shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_-2px_0_0_rgba(79,205,218,1)]
    border border-cyan-400/30
  "
              >
                {/* 1. EXACT GRADIENT BACKGROUND - Slightly Transparent */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4fcdda]/85 via-[#364abe]/85 to-[#233784]/95" />

                {/* 2. SURFACE SHEEN (Top half gloss) */}
                {/* This creates the 'dome' look by lightening the top half slightly */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-80" />

                {/* 3. CONTENT */}
                <span className="relative flex items-center justify-center gap-2 drop-shadow-sm z-10">
                  Start Trading
                  <ChevronRight className="w-4 h-4 stroke-[3px] group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              {/* Secondary Button: Matching Size & Thin Border */}
              <button
                onClick={() =>
                  navigate(isLoggedIn ? "/learning" : "/public-learning")
                }
                className="w-full sm:w-auto group px-10 py-3.5 rounded-full font-bold text-sm md:text-base tracking-wide text-gray-300 transition-all duration-300 hover:text-white border border-white/10 hover:border-cyan-500/30 hover:bg-white/5 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <span>Learning Hub</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-50 group-hover:opacity-100" />
              </button>
            </div>
          </motion.div>

          {/* Visual Content - Order 2 on Mobile (Middle), Order 2 on Desktop (Right) */}
          <motion.div
            variants={{}}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-2 lg:order-2 h-[280px] xs:h-[320px] md:h-[600px] flex flex-col items-center justify-center mb-0 md:mb-0 pointer-events-none lg:translate-x-12"
            style={{ y: fgParallaxY }}
          >
            <HeroGlobe />
          </motion.div>
        </motion.div>
      </div>

      { }
      <PremiumScrollIndicator onClick={scrollToFeatures} TC={TC} />
    </section>
  );
};

export default HeroSection;
