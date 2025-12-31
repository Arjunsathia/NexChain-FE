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
    <section className="min-h-screen flex items-center justify-center pt-20 pb-20 md:pt-0 md:pb-0 relative bg-transparent" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-12 items-center">
          { }
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left space-y-3 md:space-y-8 order-2 lg:order-1 relative z-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase bg-white/5 text-[#A5B4FC] border border-white/10 backdrop-blur-md`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#728AD5]"></span>
              </span>
              Next Gen Trading
            </motion.div>

            <h1 className="text-3xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-2 md:mb-6 font-manrope">
              The Future of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C7D2FE] via-[#728AD5] to-[#312E81] drop-shadow-lg">
                Digital Assets
              </span>
            </h1>

            <p className={`text-sm md:text-xl max-w-xl mx-auto lg:mx-0 ${TC.textSecondary} leading-relaxed font-light font-manrope`}>
              Experience institutional-grade crypto trading with real-time analytics,
              AI-powered insights, and zero-latency execution.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start pt-4">
              <button
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
                className={`group px-6 py-2.5 md:px-8 md:py-4 rounded-full font-bold text-sm tracking-wide transition-all transform hover:scale-105 flex items-center justify-center gap-3 ${TC.btnPrimary}`}
              >
                <span>Start Trading</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate(isLoggedIn ? "/learning" : "/public-learning")}
                className={`group px-6 py-2.5 md:px-8 md:py-4 rounded-full font-bold text-sm tracking-wide transition-all transform hover:scale-105 flex items-center justify-center gap-3 ${TC.btnSecondary}`}
              >
                <span>Learning Hub</span>
              </button>
            </div>
          </motion.div>

          { }
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-1 lg:order-2 h-[280px] md:h-[500px] flex flex-col items-center justify-center mb-2 md:mb-0"
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
