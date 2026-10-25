import { useSelector } from "react-redux";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";
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
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -100px 0px" }}
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
  const isLoggedIn = useSelector((state) => state.user.status === "authenticated");
  // Real Binance prices (the shared ticker connects while this page is open)
  const livePrices = useBinanceTicker();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
          scrollToFeatures={scrollToFeatures}
        />
      </div>

      <SectionWrapper id="features-section" className="z-10 py-12 md:py-16">
        <React.Suspense
          fallback={
            <div className="h-[600px] w-full flex items-center justify-center text-slate-500">
              Loading Features...
            </div>
          }
        >
          <MemoizedFeaturesSection sectionVariants={sectionVariants} />
        </React.Suspense>
      </SectionWrapper>

      <SectionWrapper id="market-section" className="z-20 py-8 md:py-12">
        <React.Suspense fallback={<div className="h-[800px] w-full" />}>
          <MemoizedMarketOverviewSection
            sectionVariants={sectionVariants}
            livePrices={livePrices}
          />
        </React.Suspense>
      </SectionWrapper>

      <SectionWrapper id="testimonials-section" className="z-30 py-8 md:py-12">
        <React.Suspense fallback={<div className="h-[500px] w-full" />}>
          <MemoizedTestimonialsSection
            sectionVariants={sectionVariants}
            isMobile={isMobile}
          />
        </React.Suspense>
      </SectionWrapper>

      <SectionWrapper id="contact-section" className="z-30 pb-20">
        <React.Suspense fallback={<div className="h-[400px] w-full" />}>
          <MemoizedCTASection
            sectionVariants={sectionVariants}
            navigate={navigate}
          />
        </React.Suspense>
      </SectionWrapper>
    </div>
  );
}
