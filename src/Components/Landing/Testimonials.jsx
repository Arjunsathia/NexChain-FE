import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

// ---------------------------
// ENHANCED testimonials data
// ---------------------------
const testimonials = [
  { name: "Asha S.", message: "NexChain helped me trade smarter—the UX is incredibly intuitive and fast!", rating: 5, avatar: "A", timestamp: "2 days ago" },
  { name: "Vikram P.", message: "Simulation mode is brilliant for learning and testing new strategies risk-free.", rating: 4, avatar: "V", timestamp: "1 week ago" },
  { name: "Neha K.", message: "Fast charts and clear analytics—I love the real-time data accuracy.", rating: 5, avatar: "N", timestamp: "3 days ago" },
  { name: "Marcus L.", message: "The Mastery Hub transformed me from a beginner to a confident daily trader.", rating: 5, avatar: "M", timestamp: "1 day ago" },
  { name: "Ethan R.", message: "Exceptional platform stability, even during peak market volatility.", rating: 5, avatar: "E", timestamp: "4 days ago" },
  { name: "Sophia M.", message: "Portfolio tracking is spot-on. I always know my exact P&L instantly.", rating: 4, avatar: "S", timestamp: "2 weeks ago" },
  { name: "David T.", message: "Highly recommend for anyone serious about crypto—professional tools for retail users.", rating: 5, avatar: "D", timestamp: "5 days ago" },
  { name: "Priya C.", message: "Customer support is top-notch. Quick, helpful, and knowledgeable.", rating: 5, avatar: "P", timestamp: "1 week ago" },
];

const TestimonialCard = ({ testimonial, TC, isMobile }) => {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }} 
      className={`
          ${TC.bgTestimonial} rounded-2xl md:rounded-3xl ${isMobile ? 'p-3 min-w-[260px]' : 'p-4 md:p-6 min-w-[250px] md:min-w-[320px]'} transition-all duration-300 group flex-shrink-0 relative overflow-hidden
          hover:shadow-2xl border border-transparent hover:border-white/10 cursor-pointer
        `}
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-xl opacity-15 ${TC.bgTestimonialAccent}`}></div>

      <div className="flex gap-1 mb-2 md:mb-3 relative z-10">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 md:w-4 md:h-4 transition-all duration-300 ${
              i < testimonial.rating
                ? "text-yellow-400 fill-yellow-400"
                : TC.textStarInactive
            }`}
          />
        ))}
      </div>

      <p className={`text-xs md:text-sm leading-snug mb-3 md:mb-4 line-clamp-4 ${TC.textMessage} relative z-10 font-medium font-manrope`}>
        "{testimonial.message}"
      </p>

      <div className={`flex items-center justify-between pt-3 md:pt-4 border-t ${TC.borderDivider} relative z-10`}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#728AD5] to-[#4338CA] rounded-full flex items-center justify-center text-white font-extrabold text-xs md:text-sm shadow-md">
            {testimonial.avatar}
          </div>
          <div className="min-w-0">
            <p className={`text-xs md:text-sm font-bold ${TC.textPrimary} font-manrope truncate`}>{testimonial.name}</p>
            <p className={`text-[10px] md:text-xs ${TC.textTimestamp} font-manrope`}>{testimonial.timestamp}</p>
          </div>
        </div>
        {!isMobile && <div className={`${TC.bgVerified} px-3 py-1 rounded-full text-xs font-bold shadow-md`}>Verified</div>}
      </div>
    </motion.div>
  );
};

const TestimonialCarousel = ({ TC, isMobile }) => {
  // Reduce duplication to 3x which is usually sufficient for smooth looping without excessive DOM size
  const duplicatedTestimonials = useMemo(() => [...testimonials, ...testimonials, ...testimonials], []);
  const duration = 50;

  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
      <div className="py-6">
        <motion.div
          className="flex gap-4 md:gap-8 w-max will-change-transform"
          animate={{ x: "-33.33%" }} 
          initial={{ x: "0%" }}
          transition={{ repeat: Infinity, ease: "linear", duration: duration }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard key={`testimonial-${index}`} testimonial={testimonial} TC={TC} isMobile={isMobile} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
