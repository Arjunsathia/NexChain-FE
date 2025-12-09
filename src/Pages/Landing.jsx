import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

// Components
import InteractiveGridPattern from "../Components/Landing/Background";
import HeroSection from "../Components/Landing/HeroSection";
import { TC } from "../Components/Landing/theme";

// Lazy Load Heavy Sections
const FeaturesSection = React.lazy(() => import("../Components/Landing/FeaturesSection"));
const MarketOverviewSection = React.lazy(() => import("../Components/Landing/MarketOverviewSection"));
const TestimonialsSection = React.lazy(() => import("../Components/Landing/TestimonialsSection"));
const CTASection = React.lazy(() => import("../Components/Landing/CTASection"));

// Section Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1.0] }
  }
};

// Sticky Section Wrapper for Parallax/Fade Effect
const StickySection = React.memo(({ children, className }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <motion.div 
      ref={ref}
      style={{ opacity, scale }}
      className={`sticky top-0 min-h-screen flex flex-col justify-center ${className}`}
    >
      {children}
    </motion.div>
  );
});

// Memoize imported components to prevent re-renders
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

  // Refs for scrolling
  const featuresRef = useRef(null);
  const marketRef = useRef(null);

  // Scroll Hooks for Global Parallax
  const { scrollY } = useScroll();
  const bgParallaxY = useTransform(scrollY, [0, 1000], [0, 300]);

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

  // Live Prices Simulation (Mock WebSocket)
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
        Object.keys(newPrices).forEach(key => {
          const change = (Math.random() - 0.5) * (newPrices[key].price * 0.002);
          newPrices[key].price += change;
          newPrices[key].change += (Math.random() - 0.5) * 0.1;
          newPrices[key].change = parseFloat(newPrices[key].change.toFixed(2));
        });
        return newPrices;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className={`min-h-screen ${TC.bgPage} font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative`}>
      {/* GLOBAL FIXED BACKGROUND - Visible in Hero & Market Overview */}
      <MemoizedInteractiveGridPattern />
      
      {/* Background Glows (Moved to Global Scope for Seamless Blend) */}
      <motion.div style={{ y: bgParallaxY }} className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 bg-cyan-400 pointer-events-none`} /> 
      <motion.div style={{ y: bgParallaxY }} className={`absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 bg-blue-500 pointer-events-none`} /> 
      
      {/* Hero Section */}
      <StickySection className="z-0">
        <MemoizedHeroSection 
          navigate={navigate} 
          isLoggedIn={isLoggedIn} 
          TC={TC} 
          scrollToFeatures={scrollToFeatures} 
        />
      </StickySection>

      {/* Features Section */}
      <StickySection className="z-10"> 
        <React.Suspense fallback={<div className="min-h-screen" />}>
          <MemoizedFeaturesSection 
            ref={featuresRef} 
            TC={TC} 
            sectionVariants={sectionVariants} 
          />
        </React.Suspense>
      </StickySection>

      {/* Market Overview Section */}
      <StickySection className="z-20">
        <React.Suspense fallback={<div className="min-h-screen" />}>
          <MemoizedMarketOverviewSection 
            ref={marketRef} 
            TC={TC} 
            sectionVariants={sectionVariants} 
            livePrices={livePrices} 
          />
        </React.Suspense>
      </StickySection>

      {/* Combined Testimonials & CTA Section */}
      <div className="relative z-30">
        <React.Suspense fallback={<div className="h-96" />}>
          <MemoizedTestimonialsSection 
            TC={TC} 
            sectionVariants={sectionVariants} 
            isMobile={isMobile} 
          />
          <MemoizedCTASection 
            TC={TC} 
            sectionVariants={sectionVariants} 
            navigate={navigate} 
          />
        </React.Suspense>
      </div>
    </div>
  );
}