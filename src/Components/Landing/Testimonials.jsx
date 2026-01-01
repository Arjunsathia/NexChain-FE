import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { BadgeCheck, TrendingUp } from "lucide-react";

const testimonials = [
  { name: "Asha S.", handle: "@asha_trades", message: "NexChain's latency is practically zero. My execution speed has doubled since I switched.", pnl: "+124%", avatar: "A", timestamp: "2d ago" },
  { name: "Vikram P.", handle: "@vik_crypto", message: "The simulation mode saved me getting wrecked. Best practice ground for new strats.", pnl: "+45%", avatar: "V", timestamp: "1w ago" },
  { name: "Neha K.", handle: "@neha_charts", message: "Finally, charts that don't lag during high volatility. The analytics are institutional grade.", pnl: "+89%", avatar: "N", timestamp: "3d ago" },
  { name: "Marcus L.", handle: "@marcus_defi", message: "From beginner to funded trader in 3 months thanks to the Mastery Hub. Unbelievable value.", pnl: "+210%", avatar: "M", timestamp: "1d ago" },
  { name: "Sophia M.", handle: "@sophia_yield", message: "Tracking my cross-chain portfolio used to be a nightmare. Now it's one click.", pnl: "+67%", avatar: "S", timestamp: "2w ago" },
  { name: "David T.", handle: "@dave_eth", message: "This feels like a terminal built for pros but accessible enough for retail. Solid work.", pnl: "+15%", avatar: "D", timestamp: "5d ago" },
];

const TraderReviewCard = ({ testimonial, TC }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className="group relative border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl px-6 py-6 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)] min-w-[300px] md:min-w-0 snap-center"
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight Efx - Enhanced */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              rgba(6, 182, 212, 0.1),
              transparent 80%
            )
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between gap-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-900/50 to-blue-900/50 border border-white/10 flex items-center justify-center text-cyan-200 font-bold font-mono shadow-inner">
              {testimonial.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className={`text-sm font-bold ${TC?.textPrimary || 'text-white'}`}>{testimonial.name}</h4>
                <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-500 font-medium font-mono">{testimonial.handle}</p>
            </div>
          </div>

          {/* PnL Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_-4px_rgba(16,185,129,0.3)]">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 font-mono tracking-tight">{testimonial.pnl}</span>
          </div>
        </div>

        {/* Message */}
        <p className={`text-sm leading-relaxed ${TC?.textSecondary || 'text-slate-400'} group-hover:text-slate-300 transition-colors`}>
          "{testimonial.message}"
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-hover:text-cyan-400/80 transition-colors">Verified Trader</span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono font-medium">{testimonial.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

const TestimonialGrid = ({ TC }) => {
  return (
    <div className="w-full">
      {/* Mobile: Horizontal Swipe */}
      <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {testimonials.map((t, i) => (
          <TraderReviewCard key={i} testimonial={t} TC={TC} />
        ))}
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <TraderReviewCard testimonial={t} TC={TC} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialGrid;
