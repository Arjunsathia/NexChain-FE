import React from "react";
import { motion } from "framer-motion";
import TestimonialCarousel from "./Testimonials";

const TestimonialsSection = ({ TC, sectionVariants, isMobile }) => {
  return (
    <motion.section 
      className="py-24 relative bg-transparent z-10 -mt-1"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      {}
      
      <div className="relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${TC.textPrimary} font-manrope`}>Trusted by Traders</h2>
          <p className={`text-xl ${TC.textSecondary}`}>Join thousands of successful investors on NexChain.</p>
        </div>
        <TestimonialCarousel TC={TC} isMobile={isMobile} />
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;
