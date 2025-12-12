import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Components
import InteractiveGridPattern from "../Components/Landing/Background";
import HeroSection from "../Components/Landing/HeroSection";
import { TC } from "../Components/Landing/theme";

// Lazy Load Heavy Sections
const FeaturesSection = React.lazy(() => import("../Components/Landing/FeaturesSection"));
const MarketOverviewSection = React.lazy(() => import("../Components/Landing/MarketOverviewSection"));
const TestimonialsSection = React.lazy(() => import("../Components/Landing/TestimonialsSection"));
const CTASection = React.lazy(() => import("../Components/Landing/CTASection"));

// Section Animation Variants - Smoother Fade Up
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

// Standard Section Wrapper
const SectionWrapper = ({ children, className, id }) => {
  return (
    <motion.section 
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -100px 0px" }}
      variants={sectionVariants}
      className={`relative w-full ${className}`}
    >
      {children}
    </motion.section>
  );
};

// Memoize imported components
const MemoizedHeroSection = React.memo(HeroSection);
const MemoizedFeaturesSection = React.memo(FeaturesSection);
const MemoizedMarketOverviewSection = React.memo(MarketOverviewSection);
const MemoizedTestimonialsSection = React.memo(TestimonialsSection);
const MemoizedCTASection = React.memo(CTASection);
const MemoizedInteractiveGridPattern = React.memo(InteractiveGridPattern);

export default function Landing() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [livePrices, setLivePrices] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Check Login Status
  useEffect(() => {
    const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
    setIsLoggedIn(!!token);
  }, []);

  // Check Mobile Status
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Live Prices Simulation (Optimized Interval)
  useEffect(() => {
    const initialPrices = {
      bitcoin: { price: 43250.00, change: 2.4 },
      ethereum: { price: 2280.50, change: 1.8 },
      cardano: { price: 0.52, change: -0.5 },
      dogecoin: { price: 0.08, change: 4.2 },
      solana: { price: 98.40, change: 5.1 },
      ripple: { price: 0.58, change: -1.2 },
      polkadot: { price: 7.20, change: 0.8 },
    };
    setLivePrices(initialPrices);

    const interval = setInterval(() => {
      setLivePrices(prev => {
        const newPrices = { ...prev };
        let hasChanges = false;
        
        // Randomly update subset of prices each tick to look organic but save react cycles
        Object.keys(newPrices).forEach(key => {
          if (Math.random() > 0.3) return; // Skip 30% of updates
          hasChanges = true;
          const change = (Math.random() - 0.5) * (newPrices[key].price * 0.002);
          newPrices[key].price += change;
          newPrices[key].change += (Math.random() - 0.5) * 0.1;
          newPrices[key].change = parseFloat(newPrices[key].change.toFixed(2));
        });
        
        return hasChanges ? newPrices : prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const scrollToFeatures = useCallback(() => {
    // Smooth scroll to features
    const element = document.getElementById('features-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className={`min-h-screen ${TC.bgPage} font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative`}>
      {/* GLOBAL FIXED BACKGROUND */}
      <MemoizedInteractiveGridPattern />
      
      {/* Background Glows - Fixed position to avoid scroll recalculations */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-cyan-400 pointer-events-none z-0" />
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-blue-500 pointer-events-none z-0" />
      
      {/* Hero Section */}
      <div className="relative z-10">
        <MemoizedHeroSection 
          navigate={navigate} 
          isLoggedIn={isLoggedIn} 
          TC={TC} 
          scrollToFeatures={scrollToFeatures} 
        />
      </div>

      {/* Features Section */}
      <SectionWrapper id="features-section" className="z-10 py-10 md:py-20"> 
        <React.Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-slate-500">Loading Features...</div>}>
          <MemoizedFeaturesSection 
            TC={TC} 
            sectionVariants={sectionVariants} 
          />
        </React.Suspense>
      </SectionWrapper>

      {/* Market Overview Section */}
      <SectionWrapper className="z-20 py-10 md:py-20">
        <React.Suspense fallback={<div className="h-96 w-full" />}>
          <MemoizedMarketOverviewSection 
            TC={TC} 
            sectionVariants={sectionVariants} 
            livePrices={livePrices} 
          />
        </React.Suspense>
      </SectionWrapper>

      {/* Testimonials */}
      <SectionWrapper className="z-30 py-10 md:py-20">
        <React.Suspense fallback={<div className="h-96 w-full" />}>
          <MemoizedTestimonialsSection 
            TC={TC} 
            sectionVariants={sectionVariants} 
            isMobile={isMobile} 
          />
        </React.Suspense>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper className="z-30 pb-20">
        <React.Suspense fallback={<div className="h-64 w-full" />}>
          <MemoizedCTASection 
            TC={TC} 
            sectionVariants={sectionVariants} 
            navigate={navigate} 
          />
        </React.Suspense>
      </SectionWrapper>
    </div>
  );
}