import React, { useState, useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { BarChart3, ShieldCheck, Zap, Layout } from "lucide-react";

// --- Feature Data ---
const featuresList = [
  {
    id: 0,
    title: "Advanced Analytics",
    description:
      "Real-time charting with 100+ indicators and AI-driven pattern recognition.",
    icon: BarChart3,
  },
  {
    id: 1,
    title: "Fortress Security",
    description:
      "Your assets are protected by industry-leading encryption and cold storage protocols.",
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: "Lightning Execution",
    description:
      "Trade with confidence using our ultra-low latency matching engine.",
    icon: Zap,
  },
  {
    id: 3,
    title: "Cross-Platform",
    description:
      "Seamlessly sync your portfolio across desktop, mobile, and tablet devices.",
    icon: Layout,
  },
];

// --- Animated Wave Component ---
const WaveConnection = ({ activeIndex }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let frameId;
    const animate = () => {
      setPhase((prev) => (prev + 0.05) % (Math.PI * 2));
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  const count = featuresList.length;
  const ITEM_HEIGHT = 120;
  const GAP = 24;
  const TOTAL_HEIGHT = count * ITEM_HEIGHT + (count - 1) * GAP;
  const CENTER_Y = TOTAL_HEIGHT / 2;

  const generatePath = (index, isActive) => {
    const startY = index * (ITEM_HEIGHT + GAP) + ITEM_HEIGHT / 2;
    const endY = CENTER_Y;
    const width = 100;
    const segments = 50;
    const points = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = t * width;
      const ease = t * t * (3 - 2 * t);
      const baseY = startY + (endY - startY) * ease;
      let waveY = 0;
      if (isActive) {
        const envelope = Math.sin(t * Math.PI);
        const amplitude = 10;
        const frequency = (Math.PI * 4) / width;
        waveY = amplitude * envelope * Math.sin(x * frequency - phase * 4);
      }
      points.push(`${x},${baseY + waveY}`);
    }
    return (
      `M ${points[0]} ` +
      points
        .slice(1)
        .map((p) => `L ${p}`)
        .join(" ")
    );
  };

  return (
    <svg
      className="w-full h-full overflow-visible"
      viewBox={`0 0 100 ${TOTAL_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4fcdda" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#4fcdda" stopOpacity="1" />
          <stop offset="100%" stopColor="#364abe" stopOpacity="0.1" />
        </linearGradient>
        <filter id="waveGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {featuresList.map((_, index) => {
        const isSelected = activeIndex === index;
        return (
          <path
            key={index}
            d={generatePath(index, isSelected)}
            fill="none"
            stroke={
              isSelected ? "url(#waveGradient)" : "rgba(255, 255, 255, 0.05)"
            }
            strokeWidth={isSelected ? 3 : 1}
            className="transition-all duration-500 ease-out"
            filter={isSelected ? "url(#waveGlow)" : undefined}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
};

// --- Main Component ---
const FeaturesSection = forwardRef((props, ref) => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section
      id="features-section"
      ref={ref}
      className="py-20 md:py-32 relative overflow-hidden bg-transparent z-10 font-manrope"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(79,205,218,0.03),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white font-manrope">
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4fcdda] via-[#364abe] to-[#233784] filter drop-shadow-[0_0_20px_rgba(79,205,218,0.4)]">
              NexChain
            </span>
            ?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            We combine institutional-grade tools with an intuitive interface to
            give you the trade advantage.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-0 relative">
          {/* LEFT: Feature List */}
          <div className="w-full lg:w-[35%] flex flex-col gap-6 relative z-20">
            {featuresList.map((feature, index) => {
              const isActive = activeFeature === index;

              return (
                <div
                  key={feature.id}
                  onClick={() => setActiveFeature(index)}
                  className={`
                       group relative p-6 min-h-[100px] h-auto rounded-3xl cursor-pointer transition-all duration-300
                       overflow-hidden flex items-center
                       ${isActive
                      ? /* TRANSPARENT LOOK: Low Opacity Background + High Blur + Borders */
                      "bg-gradient-to-r from-[#4fcdda]/10 via-[#364abe]/10 to-[#233784]/10 backdrop-blur-xl border border-cyan-400/50 shadow-[0_0_30px_-10px_rgba(79,205,218,0.3)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                      : "bg-transparent border border-transparent hover:bg-white/5"
                    }
                    `}
                >
                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-5 w-full">
                    {/* Icon */}
                    <div
                      className={`
                         w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300
                         ${isActive
                          ? "bg-cyan-400/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                          : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
                        }
                      `}
                    >
                      <feature.icon className="w-6 h-6" />
                    </div>

                    {/* Text */}
                    <div>
                      <h3
                        className={`text-lg font-bold font-manrope transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`text-sm mt-1 leading-relaxed transition-colors ${isActive ? "text-cyan-100/80 font-medium" : "text-slate-500"}`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CENTER: Wavy Connection */}
          <div className="hidden lg:block absolute left-[35%] right-[45%] top-0 bottom-0 pointer-events-none z-10">
            <WaveConnection activeIndex={activeFeature} />
          </div>

          {/* RIGHT: Dynamic Display */}
          <div className="w-full lg:w-[45%] relative z-20 flex justify-center items-center h-auto min-h-[400px] lg:h-[520px]">
            {/* Connection Dot */}
            <div className="hidden lg:block absolute left-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0B0E14] border-2 border-[#4fcdda] shadow-[0_0_15px_#4fcdda] z-30" />

            {/* Glass Container */}
            <div className="relative w-full h-full max-h-[450px] bg-[#0f172a]/30 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 flex items-center justify-center overflow-hidden shadow-2xl group">
              {/* Internal Monitor Glows */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#364abe]/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#4fcdda]/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Tech Grid */}
              <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative z-10 flex flex-col items-center text-center max-w-md"
                >
                  {/* Large Icon Box - also Transparent Glass Style */}
                  <div
                    className="
                     w-24 h-24 rounded-3xl mb-8
                     flex items-center justify-center
                     relative overflow-hidden
                     bg-gradient-to-br from-[#4fcdda]/10 to-[#364abe]/10
                     backdrop-blur-md
                     border border-cyan-400/30
                     shadow-[0_0_30px_-5px_rgba(79,205,218,0.2)]
                  "
                  >
                    {React.createElement(featuresList[activeFeature].icon, {
                      className:
                        "w-10 h-10 text-cyan-400 relative z-10 drop-shadow-[0_0_10px_rgba(79,205,218,0.5)]",
                    })}
                  </div>

                  <h3 className="text-4xl font-bold text-white mb-6 font-manrope tracking-tight drop-shadow-lg">
                    {featuresList[activeFeature].title}
                  </h3>

                  <p className="text-slate-300 text-lg leading-relaxed font-light">
                    {featuresList[activeFeature].description}
                  </p>
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
