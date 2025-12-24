import React, { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, ShieldCheck, Zap, Layout, Smartphone } from "lucide-react";

const featuresList = [
  { id: 0, title: "Advanced Analytics", description: "Real-time charting with 100+ indicators and AI-driven pattern recognition.", icon: BarChart3 },
  { id: 1, title: "Fortress Security", description: "Your assets are protected by industry-leading encryption and cold storage protocols.", icon: ShieldCheck },
  { id: 2, title: "Lightning Execution", description: "Trade with confidence using our ultra-low latency matching engine.", icon: Zap },
  { id: 3, title: "Cross-Platform", description: "Seamlessly sync your portfolio across desktop, mobile, and tablet devices.", icon: Layout },
];

const FeaturesSection = forwardRef(({ TC }, ref) => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section
      id="features-section"
      ref={ref}
      className="py-16 md:py-24 relative overflow-hidden bg-transparent z-10"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${TC.textPrimary} font-manrope`}>Why Choose NexChain?</h2>
          <p className={`text-lg ${TC.textSecondary} max-w-2xl mx-auto font-light font-manrope`}>
            We combine institutional-grade tools with an intuitive interface to give you the edge in every trade.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          { }
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            {featuresList.map((feature, index) => (
              <div
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${activeFeature === index
                    ? "bg-[#728AD5]/10 border-[#728AD5]/50 shadow-lg shadow-[#728AD5]/10"
                    : "bg-[#0a0f1e]/40 border-white/5 hover:bg-[#0a0f1e]/60 hover:border-white/20"
                  }`}
              >
                <div className="flex items-start gap-4 relaticve z-10">
                  <div className={`p-3 rounded-xl transition-colors duration-300 ${activeFeature === index
                      ? "bg-[#728AD5] text-white shadow-md"
                      : "bg-[#1e293b] text-slate-400 group-hover:bg-[#2d3b55] group-hover:text-white"
                    }`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-1 transition-colors duration-300 ${activeFeature === index ? "text-white" : "text-slate-300 group-hover:text-white"
                      } font-manrope`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${activeFeature === index ? "text-slate-200" : "text-slate-500 group-hover:text-slate-400"
                      } font-manrope`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          { }
          <div className="lg:col-span-7 h-[300px] md:h-[500px] relative">
            <div className="w-full h-full rounded-3xl bg-[#0a0f1e] border border-white/10 p-6 relative overflow-hidden shadow-2xl flex items-center justify-center">
              { }
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 text-center"
                >
                  {activeFeature === 0 && (
                    <div className="flex flex-col items-center">
                      <BarChart3 className="w-32 h-32 text-[#728AD5] mb-6 drop-shadow-[0_0_15px_rgba(114,138,213,0.5)]" />
                      <h4 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h4>
                      <p className="text-slate-400 max-w-sm">Professional grade charting tools available at your fingertips.</p>
                    </div>
                  )}
                  {activeFeature === 1 && (
                    <div className="flex flex-col items-center">
                      <ShieldCheck className="w-32 h-32 text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                      <h4 className="text-2xl font-bold text-white mb-2">Fortress Security</h4>
                      <p className="text-slate-400 max-w-sm">Industry-leading protocols keeping your assets safe 24/7.</p>
                    </div>
                  )}
                  {activeFeature === 2 && (
                    <div className="flex flex-col items-center">
                      <Zap className="w-32 h-32 text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                      <h4 className="text-2xl font-bold text-white mb-2">Lightning Fast</h4>
                      <p className="text-slate-400 max-w-sm">Ultra-low latency execution for the best market prices.</p>
                    </div>
                  )}
                  {activeFeature === 3 && (
                    <div className="flex flex-col items-center">
                      <Layout className="w-32 h-32 text-purple-500 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                      <h4 className="text-2xl font-bold text-white mb-2">Cross-Platform</h4>
                      <p className="text-slate-400 max-w-sm">Trade anywhere, anytime from any device.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;
