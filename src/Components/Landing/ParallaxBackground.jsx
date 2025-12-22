import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";





const ParallaxSectionBackground = ({ bgClass = "bg-[#02040a]" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  
  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden -z-10 ${bgClass}`}>
         {}
         <motion.div style={{ y: y1 }} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/5 blur-[120px] rounded-full" />
         <motion.div style={{ y: y2 }} className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/5 blur-[120px] rounded-full" />
         
         {}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
    </div>
  );
};

export default ParallaxSectionBackground;
