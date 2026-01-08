import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { BadgeCheck, TrendingUp, Quote } from "lucide-react";

const testimonials = [
  { name: "Asha S.", handle: "@asha_trades", message: "NexChain's latency is practically zero. My execution speed has doubled since I switched.", pnl: "+124%", avatar: "A", timestamp: "2d ago" },
  { name: "Vikram P.", handle: "@vik_crypto", message: "The simulation mode saved me getting wrecked. Best practice ground for new strats.", pnl: "+45%", avatar: "V", timestamp: "1w ago" },
  { name: "Neha K.", handle: "@neha_charts", message: "Finally, charts that don't lag during high volatility. The analytics are institutional grade.", pnl: "+89%", avatar: "N", timestamp: "3d ago" },
  { name: "Marcus L.", handle: "@marcus_defi", message: "From beginner to funded trader in 3 months thanks to the Mastery Hub. Unbelievable value.", pnl: "+210%", avatar: "M", timestamp: "1d ago" },
  { name: "Sophia M.", handle: "@sophia_yield", message: "Tracking my cross-chain portfolio used to be a nightmare. Now it's one click.", pnl: "+67%", avatar: "S", timestamp: "2w ago" },
  { name: "David T.", handle: "@dave_eth", message: "This feels like a terminal built for pros but accessible enough for retail. Solid work.", pnl: "+15%", avatar: "D", timestamp: "5d ago" },
];

const TraderReviewCard = ({ testimonial }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className="group relative h-full bg-[#0f172a]/20 backdrop-blur-md border border-white/5 rounded-[32px] p-8 overflow-hidden transition-all duration-500 hover:border-cyan-400/30 hover:shadow-[0_0_40px_-10px_rgba(79,205,218,0.15)] flex flex-col snap-center"
      onMouseMove={handleMouseMove}
    >
      {/* 1. Dynamic Gradient Border/Sheen on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4fcdda]/0 via-[#364abe]/0 to-[#233784]/0 group-hover:from-[#4fcdda]/5 group-hover:via-[#364abe]/5 group-hover:to-[#233784]/10 transition-colors duration-500" />

      {/* 2. Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(79, 205, 218, 0.1),
              transparent 80%
            )
          `,
        }}
      />

      {/* 3. Decorative Background Icon */}
      <Quote className="absolute top-6 right-6 w-24 h-24 text-white/[0.02] transform rotate-12 pointer-events-none group-hover:text-[#4fcdda]/10 group-hover:scale-110 transition-all duration-500" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">

        {/* User Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {/* Premium Avatar Ring */}
            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#4fcdda] to-[#233784] opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="w-full h-full rounded-full bg-[#0B0E14] flex items-center justify-center text-cyan-200 text-xl font-bold font-manrope">
                {testimonial.avatar}
              </div>
            </div>
            {/* Verified Badge */}
            <div className="absolute -bottom-1 -right-1 bg-[#0B0E14] rounded-full p-1 border border-[#0B0E14]">
              <BadgeCheck className="w-4 h-4 text-[#4fcdda] fill-[#0B0E14]" />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white font-manrope leading-tight group-hover:text-[#4fcdda] transition-colors">
              {testimonial.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-slate-500 font-medium font-mono uppercase tracking-wider">{testimonial.handle}</p>
              {/* PnL Tag */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-tight">{testimonial.pnl}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Message */}
        <p className="text-slate-400 text-base leading-relaxed group-hover:text-slate-200 transition-colors duration-300 flex-grow font-light">
          &quot;{testimonial.message}&quot;
        </p>

        {/* Footer / Timestamp */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between group-hover:border-[#4fcdda]/20 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4fcdda] shadow-[0_0_8px_#4fcdda] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#4fcdda] font-bold">Verified Trade</span>
          </div>
          <span className="text-xs text-slate-600 font-mono group-hover:text-slate-500 transition-colors">
            {testimonial.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

const TestimonialGrid = () => {
  return (
    <section className="py-0 relative overflow-visible font-manrope bg-transparent">

      {/* REMOVED: Background Ambience div */}

      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        {/* Mobile: Horizontal Swipe */}
        <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-6 px-6 [&::-webkit-scrollbar]:hidden">
          {testimonials.map((t, i) => (
            <div key={i} className="min-w-[320px] snap-center">
              <TraderReviewCard testimonial={t} />
            </div>
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <TraderReviewCard testimonial={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialGrid;