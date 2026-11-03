import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import SiteFooter from "../layout/SiteFooter";

const CTASection = React.memo(({ sectionVariants, navigate }) => {
  return (
    <motion.section
      className="relative pt-12 md:pt-20 overflow-hidden font-manrope"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      {/* 1. Main CTA Card - Glass Style */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16 md:mb-24">
        <div
          className="
           relative rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 overflow-hidden
           bg-slate-900/20 backdrop-blur-xl
           border border-white/10
           shadow-[0_0_50px_-10px_rgba(79,205,218,0.1)]
           group
        "
        >
          {/* Dynamic Background Sheen */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4fcdda]/5 via-transparent to-[#233784]/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 text-center md:text-left">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-white tracking-tight">
                Ready to start your journey?
              </h2>
              <p className="text-base md:text-lg text-slate-400 font-light">
                Open a free account and start trading with $10,000 in virtual
                funds and live market prices. No real money involved.
              </p>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto">
              {/* Premium Button */}
              <button
                onClick={() => navigate("/auth")}
                className="
                  group relative
                  w-full md:w-auto
                  px-10 py-4
                  rounded-full
                  font-bold text-sm md:text-base tracking-wide text-white
                  transition-all duration-300
                  overflow-hidden
                  backdrop-blur-md
                  shadow-[0_0_20px_-5px_rgba(79,205,218,0.5)]
                  shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_-2px_0_0_rgba(79,205,218,1)]
                  border border-cyan-400/30
                  hover:scale-105
                "
              >
                {/* 1. EXACT GRADIENT BACKGROUND */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4fcdda]/85 via-[#364abe]/85 to-[#233784]/95" />

                {/* 2. SURFACE SHEEN */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-80" />

                {/* 3. CONTENT */}
                <span className="relative flex items-center justify-center gap-2 drop-shadow-sm z-10">
                  Get Started Now
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Footer (shared with the app; only links that exist) */}
      <SiteFooter />
    </motion.section>
  );
});

CTASection.displayName = "CTASection";

export default CTASection;
