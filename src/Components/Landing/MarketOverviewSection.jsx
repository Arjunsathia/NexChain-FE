import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import MarketNetworkVisual from "./MarketNetworkVisual";

const MarketOverviewSection = forwardRef(({ TC, sectionVariants, livePrices }, ref) => {
  return (
    <motion.section
      ref={ref}
      className="py-12 md:py-16 pb-0 md:pb-0 relative bg-transparent z-10 -mt-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 font-bold text-xs tracking-[0.2em] uppercase bg-cyan-950/30 text-cyan-300 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="relative flex h-2.5 w-2.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            Live Market Data
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white font-manrope">
            Global Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 filter drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">Overview</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Track real-time prices and market movements across the top digital assets.
          </p>
        </div>
        <div className="w-full flex justify-center">
          <MarketNetworkVisual livePrices={livePrices} />
        </div>
      </div>
    </motion.section>
  );
});

MarketOverviewSection.displayName = "MarketOverviewSection";

export default MarketOverviewSection;
