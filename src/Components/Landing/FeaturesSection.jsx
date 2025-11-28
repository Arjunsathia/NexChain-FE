import React, { useState, forwardRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { BarChart3, ShieldCheck, Zap, Layout, Smartphone } from "lucide-react";
import DynamicAnalysisFeature from "./DynamicAnalysisFeature";

const featuresList = [
  { id: 0, title: "Advanced Analytics", description: "Real-time charting with 100+ indicators and AI-driven pattern recognition.", icon: BarChart3 },
  { id: 1, title: "Fortress Security", description: "Your assets are protected by industry-leading encryption and cold storage protocols.", icon: ShieldCheck },
  { id: 2, title: "Lightning Execution", description: "Trade with confidence using our ultra-low latency matching engine.", icon: Zap },
  { id: 3, title: "Cross-Platform", description: "Seamlessly sync your portfolio across desktop, mobile, and tablet devices.", icon: Layout },
];

const FeaturesSection = forwardRef(({ TC, sectionVariants }, ref) => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const yFeatureText = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <motion.section 
      id="features-section" 
      ref={ref} 
      className="py-10 md:py-24 relative overflow-hidden bg-transparent z-10 -mt-1"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      {/* Top Fade Border Removed for seamless look */}
      {/* BACKGROUND: Parallax for Features - Custom Gradient - HIDDEN ON MOBILE */}
      <div className="hidden md:block">
        {/* Background removed as requested */}
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div style={{ y: yFeatureText }} className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${TC.textPrimary} font-manrope`}>Why Choose NexChain?</h2>
          <p className={`text-lg ${TC.textSecondary} max-w-2xl mx-auto font-light font-manrope`}>
            We combine institutional-grade tools with an intuitive interface to give you the edge in every trade.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Feature Tabs - Premium Redesign */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 lg:flex lg:flex-col lg:gap-4">
            {featuresList.map((feature, index) => (
              <motion.div
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden border ${
                  activeFeature === index 
                    ? "bg-gradient-to-r from-[#728AD5]/20 to-transparent border-[#728AD5]/50" 
                    : "bg-[#0a0f1e]/40 border-white/5 hover:border-white/10 hover:bg-[#0a0f1e]/60" 
                }`}
                whileHover={{ x: 5 }}
              >
                {/* Active Indicator Glow */}
                {activeFeature === index && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#728AD5] shadow-[0_0_20px_#728AD5]" 
                  />
                )}
                
                <div className="flex items-start gap-3 md:gap-5 relative z-10">
                  <div className={`p-2 md:p-3.5 rounded-xl transition-all duration-500 ${
                    activeFeature === index 
                      ? "bg-[#728AD5] text-white shadow-lg shadow-[#728AD5]/30 scale-110" 
                      : "bg-[#1e293b] text-slate-400 group-hover:text-white group-hover:bg-[#2d3b55]"
                  }`}>
                    <feature.icon className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm md:text-lg mb-1 transition-colors duration-300 ${
                      activeFeature === index ? "text-white" : "text-slate-300 group-hover:text-white"
                    } font-manrope`}>
                      {feature.title}
                    </h3>
                    <p className={`text-xs md:text-sm leading-relaxed transition-colors duration-300 hidden md:block ${
                      activeFeature === index ? "text-slate-200" : "text-slate-500 group-hover:text-slate-400"
                    } font-manrope`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Visual - Advanced Holographic Display */}
          <div className="lg:col-span-7 h-[280px] md:h-[500px] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#728AD5]/10 to-transparent rounded-3xl blur-2xl -z-10" />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="w-full h-full rounded-3xl bg-[#0a0f1e]/80 backdrop-blur-2xl border border-white/10 p-1 relative overflow-hidden shadow-2xl"
              >
                {/* Inner Frame */}
                <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                
                <div className="w-full h-full rounded-[20px] bg-[#02040a] relative overflow-hidden flex items-center justify-center">
                  
                  {/* 1. Advanced Analytics (Chart) */}
                  {activeFeature === 0 && (
                    <div className="w-full h-full relative">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#728AD5]/5 to-transparent pointer-events-none" />
                      <DynamicAnalysisFeature />
                    </div>
                  )}

                  {/* 2. Bank-Grade Security (Scanning Shield) */}
                  {activeFeature === 1 && (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      {/* Grid Background */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(114,138,213,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(114,138,213,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
                      
                      <div className="relative z-10">
                        <motion.div 
                          animate={{ boxShadow: ["0 0 20px rgba(16, 185, 129, 0.2)", "0 0 60px rgba(16, 185, 129, 0.4)", "0 0 20px rgba(16, 185, 129, 0.2)"] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-48 h-48 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative overflow-hidden"
                        >
                          <ShieldCheck className="w-24 h-24 text-emerald-400 relative z-20" />
                          
                          {/* Scanning Beam */}
                          <motion.div 
                            animate={{ top: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent z-10"
                          />
                        </motion.div>
                        
                        {/* Floating Particles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                            initial={{ x: 0, y: 0, opacity: 0 }}
                            animate={{ 
                              x: (Math.random() - 0.5) * 200, 
                              y: (Math.random() - 0.5) * 200, 
                              opacity: [0, 1, 0] 
                            }}
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                          />
                        ))}
                      </div>
                      
                      <div className="mt-8 text-center z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          System Secure
                        </div>
                        <h3 className="text-2xl font-bold text-white font-manrope">Military-Grade Encryption</h3>
                      </div>
                    </div>
                  )}

                  {/* 3. Lightning Execution (Warp Speed) */}
                  {activeFeature === 2 && (
                    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                      {/* Speed Lines */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         {[...Array(20)].map((_, i) => (
                           <motion.div
                             key={i}
                             className="absolute w-[2px] h-[100px] bg-gradient-to-b from-transparent via-yellow-400/50 to-transparent"
                             style={{ rotate: i * 18, transformOrigin: "50% 50%" }}
                             animate={{ height: ["100px", "300px", "100px"], opacity: [0.3, 0.8, 0.3] }}
                             transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                           />
                         ))}
                      </div>

                      <div className="relative z-10">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.2, repeat: Infinity }}
                          className="w-40 h-40 rounded-full bg-yellow-500/10 border-2 border-yellow-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)]"
                        >
                          <Zap className="w-20 h-20 text-yellow-400" />
                        </motion.div>
                      </div>

                      <div className="mt-12 text-center z-10">
                        <h3 className="text-5xl font-black text-white italic tracking-tighter font-manrope">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">50ms</span>
                        </h3>
                        <p className="text-yellow-400/80 font-bold tracking-widest uppercase text-sm mt-2">Latency</p>
                      </div>
                    </div>
                  )}

                  {/* 4. Cross-Platform (Device Sync) */}
                  {activeFeature === 3 && (
                    <div className="relative w-full h-full flex items-center justify-center">
                       {/* Connecting Line */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[2px] bg-slate-700">
                          <motion.div 
                            animate={{ x: [-100, 100], opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-[40px] h-[4px] bg-indigo-400 blur-[2px] absolute top-[-1px] left-1/2"
                          />
                       </div>

                       <div className="flex items-center gap-12 md:gap-24 relative z-10">
                          {/* Laptop */}
                          <motion.div 
                            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                            className="w-32 h-20 md:w-48 md:h-32 rounded-lg border-2 border-slate-600 bg-slate-800 flex items-center justify-center relative"
                          >
                             <div className="absolute bottom-[-10px] w-[120%] h-[4px] bg-slate-700 rounded-b-lg" />
                             <Layout className="w-10 h-10 md:w-16 md:h-16 text-indigo-400" />
                          </motion.div>

                          {/* Phone */}
                          <motion.div 
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                            className="w-12 h-20 md:w-16 md:h-28 rounded-[1rem] border-2 border-slate-600 bg-slate-800 flex items-center justify-center"
                          >
                             <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
                          </motion.div>
                       </div>
                       
                       <div className="absolute bottom-10 text-center">
                          <p className="text-indigo-300 font-manrope font-bold tracking-wide">Real-time Sync</p>
                       </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;
