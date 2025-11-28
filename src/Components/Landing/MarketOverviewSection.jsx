import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import MarketNetworkVisual from "./MarketNetworkVisual";

const MarketOverviewSection = forwardRef(({ TC, sectionVariants, livePrices }, ref) => {
  return (
    <motion.section 
      ref={ref} 
      className="py-12 md:py-24 relative bg-transparent z-10 -mt-1"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-20">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 font-bold text-xs tracking-widest uppercase bg-[#728AD5]/15 text-[#A5B4FC] border border-[#728AD5]/30 backdrop-blur-sm`}>
            <Activity className="w-4 h-4 animate-pulse" />
            LIVE MARKET
          </div>
          <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${TC.textPrimary} font-manrope`}>Market Overview</h2>
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
