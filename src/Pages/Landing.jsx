import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import HeroSection from "../Components/Landing/HeroSection";
import { TC } from "../Components/Landing/theme";
import useLandingLenis from "@/hooks/useLandingLenis";

const FeaturesSection = React.lazy(
  () => import("../Components/Landing/FeaturesSection"),
);
const MarketOverviewSection = React.lazy(
  () => import("../Components/Landing/MarketOverviewSection"),
);
const TestimonialsSection = React.lazy(
  () => import("../Components/Landing/TestimonialsSection"),
);
const CTASection = React.lazy(() => import("../Components/Landing/CTASection"));

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

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

const MemoizedHeroSection = React.memo(HeroSection);
const MemoizedFeaturesSection = React.memo(FeaturesSection);
const MemoizedMarketOverviewSection = React.memo(MarketOverviewSection);
const MemoizedTestimonialsSection = React.memo(TestimonialsSection);
const MemoizedCTASection = React.memo(CTASection);

export default function Landing() {
  useLandingLenis();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [livePrices, setLivePrices] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const initialPrices = {
      bitcoin: { price: 43250.0, change: 2.4 },
      ethereum: { price: 2280.5, change: 1.8 },
      cardano: { price: 0.52, change: -0.5 },
      dogecoin: { price: 0.08, change: 4.2 },
      solana: { price: 98.4, change: 5.1 },
      ripple: { price: 0.58, change: -1.2 },
      polkadot: { price: 7.2, change: 0.8 },
    };
    setLivePrices(initialPrices);

    const interval = setInterval(() => {
      setLivePrices((prev) => {
        const newPrices = { ...prev };
        let hasChanges = false;

        Object.keys(newPrices).forEach((key) => {
          if (Math.random() > 0.3) return;
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
    const element = document.getElementById("features-section");
    if (element) {
      if (window.lenis) {
        window.lenis.scrollTo(element, { duration: 1.5 });
      } else {
        const top = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      <div className="relative z-10">
        <MemoizedHeroSection
          navigate={navigate}
          isLoggedIn={isLoggedIn}
          TC={TC}
          scrollToFeatures={scrollToFeatures}
        />
      </div>

      <SectionWrapper id="features-section" className="z-10 py-16 md:py-20">
        <React.Suspense
          fallback={
            <div className="h-screen w-full flex items-center justify-center text-slate-500">
              Loading Features...
            </div>
          }
        >
          <MemoizedFeaturesSection TC={TC} sectionVariants={sectionVariants} />
        </React.Suspense>
      </SectionWrapper>

      <SectionWrapper id="market-section" className="z-20 py-12 md:py-16">
        <React.Suspense fallback={<div className="h-96 w-full" />}>
          <MemoizedMarketOverviewSection
            TC={TC}
            sectionVariants={sectionVariants}
            livePrices={livePrices}
          />
        </React.Suspense>
      </SectionWrapper>

      <SectionWrapper id="testimonials-section" className="z-30 py-12 md:py-16">
        <React.Suspense fallback={<div className="h-96 w-full" />}>
          <MemoizedTestimonialsSection
            TC={TC}
            sectionVariants={sectionVariants}
            isMobile={isMobile}
          />
        </React.Suspense>
      </SectionWrapper>

      <SectionWrapper id="contact-section" className="z-30 pb-20">
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
