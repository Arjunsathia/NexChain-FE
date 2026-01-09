import React from "react";
import { motion } from "framer-motion";
import TestimonialCarousel from "./Testimonials";

const TestimonialsSection = ({ TC, sectionVariants, isMobile }) => {
  return (
    <motion.section
      className="py-10 md:py-16 relative bg-transparent z-10 -mt-0"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      {}
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white font-manrope">
            Trusted by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4fcdda] via-[#364abe] to-[#233784] filter drop-shadow-[0_0_20px_rgba(79,205,218,0.4)]">
              Top Traders
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            Join thousands of users who have already upgraded their trading
            infrastructure.
          </p>
        </div>
        <TestimonialCarousel TC={TC} isMobile={isMobile} />
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;
