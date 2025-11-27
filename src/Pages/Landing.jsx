import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bitcoin,
  Circle,
  ArrowDown, // Kept for reference but not used in the new indicator
  MoveDown, // <-- NEW PREMIUM ICON
  ShieldCheck,
  Zap,
  Layout,
  Smartphone,
  Activity,
  DollarSign,
} from "lucide-react";


import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

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

// Utility to force dark mode (isLight is always false)
const useThemeCheck = () => {
  // Always returns false to force dark mode
  return false;
};

// =================================================================
// DARK COSMIC BLOCKCHAIN BACKGROUND COMPONENT
// =================================================================

const DarkCosmicBlockchainBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Handle resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Particle system
    const particles = [];
    const networkNodes = [];
    const networkLines = [];
    const lightFlares = [];
    
    // Colors - INDIGO PREMIUM
    const colors = {
      primary: '#0f172a', // Slate 900
      secondary: '#1e293b', // Slate 800
      accent1: '#728AD5', // Indigo (Main)
      accent2: '#A5B4FC', // Light Indigo
      accent3: '#4338CA', // Dark Indigo
      glow: '#6366f1'     // Indigo 500
    };
    
    // Initialize particles - REDUCED COUNT for Minimalism
    for (let i = 0; i < 60; i++) { 
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5, // Slightly larger
        speed: Math.random() * 0.2 + 0.05, 
        direction: Math.random() * Math.PI * 2,
        layer: Math.floor(Math.random() * 3), 
        opacity: Math.random() * 0.4 + 0.2 // Brighter opacity
      });
    }
    
    // Initialize network nodes - REDUCED COUNT
    for (let i = 0; i < 15; i++) { 
      networkNodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.01 + 0.005, 
        connections: []
      });
    }
    
    // Create network connections
    networkNodes.forEach((node, i) => {
      const distances = networkNodes.map((other, j) => ({
        index: j,
        distance: Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2)
      }));
      
      distances.sort((a, b) => a.distance - b.distance);
      
      // Connect to fewer nodes for cleaner look
      const numConnections = Math.floor(Math.random() * 2) + 1;
      for (let j = 1; j <= numConnections && j < distances.length; j++) {
        if (!node.connections.includes(distances[j].index)) {
          node.connections.push(distances[j].index);
          
          const lineExists = networkLines.some(line => 
            (line.from === i && line.to === distances[j].index) || 
            (line.from === distances[j].index && line.to === i)
          );
          
          if (!lineExists) {
            networkLines.push({
              from: i,
              to: distances[j].index,
              pulse: Math.random() * Math.PI * 2,
              pulseSpeed: Math.random() * 0.015 + 0.005,
              baseWidth: Math.random() * 0.3 + 0.1 // Thinner lines
            });
          }
        }
      }
    });
    
    // Initialize light flares - MINIMAL
    for (let i = 0; i < 2; i++) { 
      lightFlares.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 60 + 20, 
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.0005, 
        opacity: Math.random() * 0.1 + 0.02 // Extremely subtle
      });
    }
    
    // Soft glow waves - REMOVED for cleaner look
    const glowWaves = [];
    
    // Animation loop
    const animate = () => {
      // Clear canvas with BRIGHTER DARK gradient
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      gradient.addColorStop(0, '#111827'); // Gray 900 Center (Visible)
      gradient.addColorStop(0.7, '#020617'); // Slate 950
      gradient.addColorStop(1, '#000000'); // Black Edges
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw glow waves - REMOVED
      
      // Update and draw particles with parallax - BRIGHTER
      particles.forEach(particle => {
        const moveSpeed = particle.speed * (particle.layer + 1);
        particle.x += Math.cos(particle.direction) * moveSpeed;
        particle.y += Math.sin(particle.direction) * moveSpeed;
        
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        // Indigo/Light Blue particles
        ctx.fillStyle = `rgba(165, 180, 252, ${particle.opacity})`; 
        ctx.fill();
      });
      
      // Update and draw network nodes - BRIGHTER
      networkNodes.forEach(node => {
        node.pulse += node.pulseSpeed;
        node.x = node.baseX + Math.sin(node.pulse * 0.5) * 1.0; 
        node.y = node.baseY + Math.cos(node.pulse * 0.3) * 1.0; 
        
        const pulseSize = 2.0 + Math.sin(node.pulse) * 1.0; 
        
        // Visible glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, pulseSize * 3.0
        );
        gradient.addColorStop(0, `rgba(114, 138, 213, ${0.3 + Math.sin(node.pulse) * 0.1})`); 
        gradient.addColorStop(1, 'rgba(114, 138, 213, 0)');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${0.6 + Math.sin(node.pulse) * 0.2})`; // Brighter core
        ctx.fill();
      });
      
      // Update and draw network lines - VISIBLE
      networkLines.forEach(line => {
        line.pulse += line.pulseSpeed;
        const fromNode = networkNodes[line.from];
        const toNode = networkNodes[line.to];
        if (!fromNode || !toNode) return;
        
        const pulseWidth = line.baseWidth;
        const pulseOpacity = 0.15 + Math.sin(line.pulse) * 0.1; // Increased opacity
        
        const gradient = ctx.createLinearGradient(
          fromNode.x, fromNode.y,
          toNode.x, toNode.y
        );
        gradient.addColorStop(0, `rgba(114, 138, 213, ${pulseOpacity})`);
        gradient.addColorStop(1, `rgba(114, 138, 213, ${pulseOpacity})`);
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.lineWidth = pulseWidth;
        ctx.strokeStyle = gradient;
        ctx.stroke();
      });
      
      // Draw rotating light flares - BRIGHTER
      lightFlares.forEach(flare => {
        flare.rotation += flare.rotationSpeed;
        ctx.save();
        ctx.translate(flare.x, flare.y);
        ctx.rotate(flare.rotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flare.size);
        gradient.addColorStop(0, `rgba(114, 138, 213, ${flare.opacity * 2})`); // Brighter
        gradient.addColorStop(1, `rgba(114, 138, 213, 0)`);
        
        ctx.beginPath();
        ctx.arc(0, 0, flare.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: '#02040a' }}
    />
  );
};

// =================================================================
// SUB-COMPONENTS
// =================================================================

const GridBeam = ({ delay = 0, duration = 4, top, left, vertical = false }) => (
  <motion.div
    initial={vertical ? { top: '-20%', opacity: 0 } : { left: '-20%', opacity: 0 }}
    animate={vertical ? { top: '120%', opacity: [0, 1, 1, 0] } : { left: '120%', opacity: [0, 1, 1, 0] }}
    transition={{
      repeat: Infinity,
      duration: duration,
      delay: delay,
      ease: "linear",
      repeatDelay: Math.random() * 5 + 2 // Randomize repeat delay
    }}
    className={`absolute bg-gradient-to-r from-transparent via-[#728AD5] to-transparent blur-[2px] shadow-[0_0_15px_rgba(114,138,213,0.8)] z-0`}
    style={{
      ...(vertical ? { 
          left: left, 
          width: '1px', 
          height: '200px', 
          background: 'linear-gradient(to bottom, transparent, #728AD5, transparent)' 
        } : { 
          top: top, 
          height: '1px', 
          width: '200px' 
        })
    }}
  />
);



const InteractiveGridPattern = ({ className = "" }) => {
  return (
    <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden h-full w-full bg-[#02040a] ${className}`}> 
      {/* Dark Cosmic Blockchain Background */}
      <DarkCosmicBlockchainBackground />
      
      {/* Subtle noise texture with very low opacity */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.01]"></div>

      {/* FEWER shooting stars for minimal look */}
      <>
        <GridBeam top="15%" delay={0} duration={7} />
        <GridBeam top="65%" delay={2} duration={8} />
        <GridBeam left="25%" delay={4} duration={6} vertical />
      </>
    </div>
  );
};

// =================================================================
// PARALLAX SECTION BACKGROUND (For Features, Testimonials, CTA)
// =================================================================

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
         {/* Subtle Gradient Orbs */}
         <motion.div style={{ y: y1 }} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/5 blur-[120px] rounded-full" />
         <motion.div style={{ y: y2 }} className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/5 blur-[120px] rounded-full" />
         
         {/* Grid or Pattern */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
    </div>
  );
};

const TestimonialCard = ({ testimonial, TC, isMobile }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, rotateY: 3, rotateX: 1, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} 
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
          ${TC.bgTestimonial} rounded-2xl md:rounded-3xl ${isMobile ? 'p-3 min-w-[260px]' : 'p-4 md:p-6 min-w-[250px] md:min-w-[320px]'} transition-all duration-500 group flex-shrink-0 relative overflow-hidden
          hover:shadow-3xl hover:border-opacity-100 backdrop-blur-sm transform-style-preserve-3d cursor-pointer
          border-2 border-transparent
          before:content-[''] before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500
          ${TC.bgTestimonialGlow}
        `}
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-xl opacity-15 ${TC.bgTestimonialAccent}`}></div>

      <div className="flex gap-1 mb-2 md:mb-3 relative z-10">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 md:w-4 md:h-4 transition-all duration-300 ${
              i < testimonial.rating
                ? "text-yellow-400 fill-yellow-400 group-hover:scale-110"
                : TC.textStarInactive
            }`}
            style={{ transitionDelay: `${i * 50}ms` }}
          />
        ))}
      </div>

      <p className={`text-xs md:text-sm leading-snug mb-3 md:mb-4 line-clamp-4 transition-colors duration-300 ${TC.textMessage} relative z-10 font-medium font-manrope`}>
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
  const duplicatedTestimonials = useMemo(() => [...testimonials, ...testimonials], []);
  const duration = 50;

  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
      <div className="py-6">
        <motion.div
          className="flex gap-4 md:gap-8"
          animate={{ x: [0, -3200] }}
          transition={{ x: { repeat: Infinity, repeatType: "loop", duration: duration, ease: "linear" } }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard key={`top-${index}`} testimonial={testimonial} TC={TC} isMobile={isMobile} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// New Component for the Premium Market Visual - Rotating Wireframe Block
const AnimatedMarketChart = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      setRotation(prev => ({
        x: (prev.x + 0.005) % (Math.PI * 2),
        y: (prev.y + 0.01) % (Math.PI * 2)
      }));
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 3D Cube Projection Logic
  const size = 40;
  const points = [
    { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
    { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
    { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
  ];

  const project = (p, rotX, rotY) => {
    // Rotate Y
    let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    let z = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    // Rotate X
    let y = p.y * Math.cos(rotX) - z * Math.sin(rotX);
    z = p.y * Math.sin(rotX) + z * Math.cos(rotX);
    
    // Perspective
    const scale = 100 / (100 + z * 20); // Simple perspective
    return {
      x: x * size * scale + 150, // Center X (300/2)
      y: y * size * scale + 100  // Center Y (200/2)
    };
  };

  const projectedPoints = points.map(p => project(p, rotation.x, rotation.y));

  // Edges connecting the points
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // Back face
    [4, 5], [5, 6], [6, 7], [7, 4], // Front face
    [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting lines
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gray-950/20">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#728AD5]/20 via-transparent to-transparent opacity-50"></div>

      {/* 3D SVG Container */}
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 300 200">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Draw Edges */}
        {edges.map((edge, i) => (
          <line
            key={i}
            x1={projectedPoints[edge[0]].x}
            y1={projectedPoints[edge[0]].y}
            x2={projectedPoints[edge[1]].x}
            y2={projectedPoints[edge[1]].y}
            stroke="#728AD5"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            filter="url(#glow)"
          />
        ))}

        {/* Draw Vertices (Dots) */}
        {projectedPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill="#fff"
            filter="url(#glow)"
          />
        ))}
      </svg>

      {/* Center Core */}
      <div className="absolute w-4 h-4 bg-[#728AD5] rounded-full shadow-[0_0_30px_rgba(114,138,213,1)] animate-pulse z-10"></div>

      {/* Info Overlay */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-20">
        <p className="text-xs font-bold text-[#A5B4FC] tracking-[0.2em] uppercase mb-1">Live Block Data</p>
        <p className="text-[10px] text-slate-500 font-mono">Processing Hash...</p>
      </div>
    </div>
  );
};


// New Component for Dynamic Market Analysis Tab
const DynamicAnalysisFeature = () => {
  const [dataPoints, setDataPoints] = useState([40, 45, 42, 48, 55, 50, 58, 62, 60, 65, 58, 62, 68, 72, 70]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints(prev => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * 15; // Random movement
        let next = last + change;
        // Keep within bounds
        if (next > 90) next = 85;
        if (next < 20) next = 25;
        return [...prev.slice(1), next];
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Calculate SVG path
  const width = 100;
  const height = 60;
  const stepX = width / (dataPoints.length - 1);
  
  const pathData = dataPoints.map((val, i) => {
    const x = i * stepX;
    const y = height - (val / 100) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="w-full h-full flex flex-col p-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-white">Market Sentiment</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#728AD5] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#728AD5]"></span>
            </span>
            <p className="text-xs text-[#A5B4FC] font-medium">Live Analysis</p>
          </div>
        </div>
        <div className="bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20 backdrop-blur-md">
          <span className="text-green-400 font-mono text-xs font-bold tracking-wider">STRONG BUY</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative w-full bg-gray-950/40 rounded-xl border border-gray-800/50 overflow-hidden p-0 shadow-inner">
        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10 pointer-events-none">
           {[...Array(24)].map((_,i) => <div key={i} className="border-r border-b border-gray-500/30"></div>)}
        </div>

        {/* SVG Chart */}
        <div className="absolute inset-0 top-4 bottom-0 left-0 right-0">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#728AD5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#728AD5" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#chartGradient)" />
            <path d={pathData} fill="none" stroke="#728AD5" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            
            {/* Pulsing Dot at the end */}
            <circle cx={width} cy={height - (dataPoints[dataPoints.length-1] / 100) * height} r="1.5" fill="#fff" className="animate-pulse" />
            </svg>
        </div>
        
        {/* Overlay Info */}
        <div className="absolute top-4 left-4 z-10">
           <div className="text-3xl font-bold text-white tracking-tight">
             ${(45000 + dataPoints[dataPoints.length-1] * 100).toLocaleString(undefined, {maximumFractionDigits: 0})}
           </div>
           <div className="flex items-center gap-1 text-xs text-green-400 font-medium bg-green-500/10 px-1.5 py-0.5 rounded w-fit mt-1">
             <TrendingUp className="w-3 h-3" />
             <span>+2.4% (24h)</span>
           </div>
        </div>
      </div>
      
      {/* Bottom Indicators */}
      <div className="flex items-center gap-3 mt-5">
         <div className="text-xs text-gray-400 font-medium whitespace-nowrap">Volume</div>
         <div className="h-2 flex-1 bg-gray-800/50 rounded-full overflow-hidden relative">
            <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#728AD5] to-[#4338CA]" 
                initial={{ width: "50%" }}
                animate={{ width: `${50 + (dataPoints[dataPoints.length-1] - 50) / 2}%` }}
                transition={{ duration: 0.5 }}
            />
         </div>
         <div className="text-xs text-[#A5B4FC] font-mono">{(50 + (dataPoints[dataPoints.length-1] - 50) / 2).toFixed(1)}%</div>
      </div>
    </div>
  );
};


// New Component for the Premium Scroll Indicator
const PremiumScrollIndicator = ({ onClick, TC }) => {
  return (
    <motion.div
      // ENTRANCE: soft wipe-up + fade-in
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 1.2,
        duration: 0.65,
        ease: [0.16, 0.72, 0.25, 0.94],
      }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer hidden lg:flex z-30"
      onClick={onClick}
      aria-label="Scroll down"
    >
      {/* FLOATING WRAPPER */}
      <motion.div
        className="flex flex-col items-center gap-3"
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.03,
          y: -2,
        }}
        whileTap={{ scale: 0.97 }}
      >

        {/* GLOW RING UNDERNEATH */}
        <div className="h-2 w-16 rounded-full blur-md bg-[#728AD5]/25 pointer-events-none" />

        {/* OUTER GRADIENT FRAME */}
        <div className="relative">
          <div className="relative w-8 h-14 rounded-full p-[1px] bg-gradient-to-b from-[#728AD5]/80 via-[#728AD5]/20 to-transparent shadow-[0_0_30px_rgba(114,138,213,0.35)]">
            {/* INNER TRACK */}
            <div className="relative w-full h-full rounded-full bg-slate-950/80 backdrop-blur-md flex justify-center overflow-hidden">
              {/* MOVING PILL */}
              <motion.div
                animate={{
                  y: ["-120%", "60%"],
                  scaleY: [1, 1.18, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.9,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: 0.25,
                }}
                className="absolute w-1.5 h-6 rounded-full bg-[#A5B4FC]"
                style={{ boxShadow: "0 0 8px rgba(114,138,213,1), 0 0 18px rgba(114,138,213,0.8)" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// NEW: Market Network Visual Component (Moved from Hero & Enhanced)
const MarketNetworkVisual = ({ livePrices }) => {
  // Helper to safely get price data
  const getPrice = (id) => livePrices && livePrices[id] ? livePrices[id].price : 0;
  const getChange = (id) => livePrices && livePrices[id] ? livePrices[id].change : 0;
  const format = (p) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: p < 1 ? 4 : 2 }).format(p);

  // Coin Logos
  const CoinLogo = ({ symbol, className }) => {
    switch (symbol) {
      case 'BTC': return <Bitcoin className={className} />;
      case 'ETH': return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781L16.498 4 9 16.22l7.498 4.353 7.496-4.354zM24 17.616l-7.502 4.351L9 17.617l7.498 10.378 7.502-10.379z"/>
        </svg>
      );
      case 'ADA': return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-3.773-18.735l-2.016 2.684-2.67-2.028 2.016-2.684 2.67 2.028zm6.443-4.896l-2.684 2.016-2.028-2.67 2.684-2.016 2.028 2.67zm4.896 6.443l-2.016-2.684 2.67-2.028 2.016 2.684-2.67 2.028zm-6.443 4.896l2.684-2.016 2.028 2.67-2.684 2.016-2.028-2.67zm-8.457-1.547a2.004 2.004 0 1 1 0-4.008 2.004 2.004 0 0 1 0 4.008zm13.547 0a2.004 2.004 0 1 1 0-4.008 2.004 2.004 0 0 1 0 4.008zm-6.773 5.227a2.004 2.004 0 1 1 0-4.008 2.004 2.004 0 0 1 0 4.008zm0-13.547a2.004 2.004 0 1 1 0-4.008 2.004 2.004 0 0 1 0 4.008z"/>
        </svg>
      );
      case 'DOGE': return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm2.667-22.667h-6.667v13.333h6.667c3.682 0 6.667-2.985 6.667-6.667s-2.985-6.667-6.667-6.667zm0 10.667h-4v-8h4c2.209 0 4 1.791 4 4s-1.791 4-4 4z"/>
        </svg>
      );
      case 'SOL': return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M4.6 22.85l2.25-2.25h18.3l2.25 2.25-2.25 2.25H6.85L4.6 22.85zm0-13.7l2.25-2.25h18.3l2.25 2.25-2.25 2.25H6.85L4.6 9.15zm22.8 6.85l-2.25 2.25H6.85l-2.25-2.25 2.25-2.25h18.3l2.25 2.25z"/>
        </svg>
      );
      case 'XRP': return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-5.26-21.74L4.22 16.78l6.52 6.52 6.52-6.52-6.52-6.52zm10.52 0l-6.52 6.52 6.52 6.52 6.52-6.52-6.52-6.52z"/>
        </svg>
      );
      case 'DOT': return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <circle cx="16" cy="16" r="16"/>
          <path fill="white" d="M10 16a6 6 0 1 1 12 0 6 6 0 0 1-12 0z"/>
        </svg>
      );
      default: return <Circle className={className} />;
    }
  };

  // Responsive check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    // COMPACT MOBILE VIEW (Grid Layout)
    return (
      <div className="w-full px-4 py-8 font-manrope">
        <div className="grid grid-cols-2 gap-3">
          {['bitcoin', 'ethereum', 'cardano', 'dogecoin', 'solana', 'ripple'].map((coin, i) => (
            <motion.div
              key={coin}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-lg flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 ${
                   coin === 'bitcoin' ? 'bg-orange-500/20 text-orange-500' :
                   coin === 'ethereum' ? 'bg-purple-500/20 text-purple-500' :
                   coin === 'cardano' ? 'bg-blue-500/20 text-blue-500' :
                   coin === 'dogecoin' ? 'bg-yellow-500/20 text-yellow-500' :
                   coin === 'solana' ? 'bg-indigo-500/20 text-indigo-500' :
                   coin === 'ripple' ? 'bg-cyan-500/20 text-cyan-500' :
                   'bg-pink-500/20 text-pink-500'
                 }`}>
                    <CoinLogo symbol={coin === 'bitcoin' ? 'BTC' : coin === 'ethereum' ? 'ETH' : coin === 'cardano' ? 'ADA' : coin === 'dogecoin' ? 'DOGE' : coin === 'solana' ? 'SOL' : coin === 'ripple' ? 'XRP' : 'DOT'} className="w-4 h-4" />
                 </div>
                 <div className="min-w-0">
                    <div className="text-xs font-bold text-white leading-none truncate capitalize">{coin}</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase">{coin === 'bitcoin' ? 'BTC' : coin === 'ethereum' ? 'ETH' : coin === 'cardano' ? 'ADA' : coin === 'dogecoin' ? 'DOGE' : coin === 'solana' ? 'SOL' : coin === 'ripple' ? 'XRP' : 'DOT'}</div>
                 </div>
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-tight">{format(getPrice(coin))}</div>
                <div className={`text-[10px] font-mono flex items-center gap-1 font-bold ${getChange(coin) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                   {getChange(coin) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {getChange(coin)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // DESKTOP VIEW (Advanced Network)
  return (
    <div className="relative w-full h-[800px] flex items-center justify-center perspective-1000 overflow-visible font-manrope hidden md:flex">
      {/* Advanced Radar Background */}
      <div className="absolute inset-0 bg-[#728AD5]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
         <div className="w-[600px] h-[600px] border border-[#728AD5]/10 rounded-full animate-[spin_60s_linear_infinite]" />
         <div className="absolute w-[400px] h-[400px] border border-[#728AD5]/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
         <div className="absolute w-[800px] h-[800px] border border-[#728AD5]/5 rounded-full border-dashed animate-[spin_100s_linear_infinite]" />
      </div>
      
      {/* Connecting Data Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <linearGradient id="dataFlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(114, 138, 213, 0)" />
            <stop offset="50%" stopColor="rgba(114, 138, 213, 0.6)" />
            <stop offset="100%" stopColor="rgba(114, 138, 213, 0)" />
          </linearGradient>
          <filter id="glowLine">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Animated Data Paths */}
        {[
          { x2: "15%", y2: "15%" }, { x2: "10%", y2: "45%" }, { x2: "15%", y2: "85%" },
          { x2: "85%", y2: "80%" }, { x2: "90%", y2: "25%" }, { x2: "50%", y2: "12%" }, { x2: "50%", y2: "88%" }
        ].map((pos, i) => (
           <line 
             key={i}
             x1="50%" y1="50%" x2={pos.x2} y2={pos.y2} 
             stroke="url(#dataFlowGradient)" 
             strokeWidth="1.5" 
             strokeDasharray="10,10"
             className="opacity-50"
             filter="url(#glowLine)"
           >
             <animate attributeName="stroke-dashoffset" from="100" to="0" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
           </line>
        ))}
      </svg>

      {/* Central Hub - Reactor Style */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative z-20 w-48 h-48 bg-[#0f172a] rounded-full flex items-center justify-center border-4 border-[#728AD5]/20 shadow-[0_0_80px_rgba(114,138,213,0.4)]"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#728AD5]/20 to-transparent animate-pulse" />
        <Bitcoin className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10" />
        
        {/* Reactor Rings */}
        <div className="absolute -inset-4 border-2 border-[#728AD5]/30 rounded-full border-t-transparent animate-spin-slow" />
        <div className="absolute -inset-8 border border-[#728AD5]/10 rounded-full border-b-transparent animate-[spin_8s_linear_infinite_reverse]" />
      </motion.div>

      {/* Floating Cards Wrapper */}
      
      {/* Card 1: Top Left - Bitcoin */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
        className="absolute top-[5%] left-[5%] md:left-[10%] z-30"
      >
        <motion.div
          animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.05, zIndex: 50 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col gap-2 min-w-[220px] cursor-pointer hover:border-[#728AD5]/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 group-hover:bg-orange-500 transition-colors duration-300">
                <CoinLogo symbol="BTC" className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors duration-300" />
             </div>
             <div>
                <div className="text-base font-bold text-white leading-none">Bitcoin</div>
                <div className="text-xs font-medium text-slate-400 mt-0.5">BTC</div>
             </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">{format(getPrice('bitcoin'))}</div>
          <div className="flex items-center gap-2">
             <div className={`text-sm font-mono flex items-center gap-1 font-bold ${getChange('bitcoin') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
               {getChange('bitcoin') >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} {getChange('bitcoin')}%
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Card 2: Left Middle - Ethereum */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
        className="absolute top-[40%] left-[-2%] md:left-[2%] z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          whileHover={{ scale: 1.05, zIndex: 50 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col gap-2 min-w-[220px] cursor-pointer hover:border-[#728AD5]/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 group-hover:bg-purple-600 transition-colors duration-300">
                <CoinLogo symbol="ETH" className="w-6 h-6 text-purple-500 group-hover:text-white transition-colors duration-300" />
             </div>
             <div>
                <div className="text-base font-bold text-white leading-none">Ethereum</div>
                <div className="text-xs font-medium text-slate-400 mt-0.5">ETH</div>
             </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">{format(getPrice('ethereum'))}</div>
          <div className="flex items-center gap-2">
             <div className={`text-sm font-mono flex items-center gap-1 font-bold ${getChange('ethereum') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {getChange('ethereum') >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} {getChange('ethereum')}%
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Card 3: Bottom Left - Cardano */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
        className="absolute bottom-[10%] left-[10%] md:left-[15%] z-30"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          whileHover={{ scale: 1.05, zIndex: 50 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex flex-col gap-2 min-w-[180px] cursor-pointer hover:border-[#728AD5]/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-600 transition-colors duration-300">
                <CoinLogo symbol="ADA" className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors duration-300" />
             </div>
             <div>
                <div className="text-sm font-bold text-white leading-none">Cardano</div>
                <div className="text-xs font-medium text-slate-400 mt-0.5">ADA</div>
             </div>
          </div>
          <div className="text-xl font-bold text-white mt-1">{format(getPrice('cardano'))}</div>
          <div className="flex items-center gap-2">
             <div className={`text-xs font-mono flex items-center gap-1 font-bold ${getChange('cardano') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {getChange('cardano') >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {getChange('cardano')}%
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Card 4: Bottom Right - Dogecoin */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.8 }}
        className="absolute bottom-[15%] right-[5%] md:right-[15%] z-20"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          whileHover={{ scale: 1.05, zIndex: 50 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col gap-2 min-w-[220px] cursor-pointer hover:border-[#728AD5]/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 group-hover:bg-yellow-600 transition-colors duration-300">
                <CoinLogo symbol="DOGE" className="w-6 h-6 text-yellow-500 group-hover:text-white transition-colors duration-300" />
             </div>
             <div>
                <div className="text-base font-bold text-white leading-none">Dogecoin</div>
                <div className="text-xs font-medium text-slate-400 mt-0.5">DOGE</div>
             </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">{format(getPrice('dogecoin'))}</div>
          <div className="flex items-center gap-2">
             <div className={`text-sm font-mono flex items-center gap-1 font-bold ${getChange('dogecoin') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {getChange('dogecoin') >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} {getChange('dogecoin')}%
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Card 5: Top Right - Solana */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.0 }}
        className="absolute top-[25%] right-[2%] md:right-[5%] z-30"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          whileHover={{ scale: 1.05, zIndex: 50 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col gap-2 min-w-[210px] cursor-pointer hover:border-[#728AD5]/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:bg-indigo-600 transition-colors duration-300">
                <CoinLogo symbol="SOL" className="w-6 h-6 text-indigo-500 group-hover:text-white transition-colors duration-300" />
             </div>
             <div>
                <div className="text-base font-bold text-white leading-none">Solana</div>
                <div className="text-xs font-medium text-slate-400 mt-0.5">SOL</div>
             </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">{format(getPrice('solana'))}</div>
          <div className="flex items-center gap-2">
             <div className={`text-sm font-mono flex items-center gap-1 font-bold ${getChange('solana') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {getChange('solana') >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} {getChange('solana')}%
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Card 6: Top Center - Ripple */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.1 }}
        className="absolute top-[5%] left-[50%] -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          whileHover={{ scale: 1.05, zIndex: 50 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[160px] cursor-pointer hover:border-[#728AD5]/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:bg-cyan-600 transition-colors duration-300">
                <CoinLogo symbol="XRP" className="w-5 h-5 text-cyan-500 group-hover:text-white transition-colors duration-300" />
             </div>
             <div>
                <div className="text-sm font-bold text-white leading-none">Ripple</div>
                <div className="text-[10px] font-medium text-slate-400">XRP</div>
             </div>
          </div>
          <div className="text-lg font-bold text-white mt-1">{format(getPrice('ripple'))}</div>
          <div className="flex items-center gap-2">
             <div className={`text-[10px] font-mono flex items-center gap-1 font-bold ${getChange('ripple') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {getChange('ripple') >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {getChange('ripple')}%
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Card 7: Bottom Center - Polkadot */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.2 }}
        className="absolute bottom-[5%] left-[50%] -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          whileHover={{ scale: 1.05, zIndex: 50 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[160px] cursor-pointer hover:border-[#728AD5]/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 group-hover:bg-pink-600 transition-colors duration-300">
                <CoinLogo symbol="DOT" className="w-5 h-5 text-pink-500 group-hover:text-white transition-colors duration-300" />
             </div>
             <div>
                <div className="text-sm font-bold text-white leading-none">Polkadot</div>
                <div className="text-[10px] font-medium text-slate-400">DOT</div>
             </div>
          </div>
          <div className="text-lg font-bold text-white mt-1">{format(getPrice('polkadot'))}</div>
          <div className="flex items-center gap-2">
             <div className={`text-[10px] font-mono flex items-center gap-1 font-bold ${getChange('polkadot') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {getChange('polkadot') >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {getChange('polkadot')}%
             </div>
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
};


// =================================================================
// MAIN LANDING COMPONENT
// =================================================================

// =================================================================
// HERO VISUAL: Premium 3D Holographic Globe
// =================================================================

// =================================================================
// HERO VISUAL: Premium 3D Holographic Globe
// =================================================================

const HeroGlobe = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
      {/* Core Glow - Silver/White */}
      <div className="absolute inset-0 bg-white/5 blur-[120px] rounded-full opacity-20 animate-pulse-slow"></div>
      
      {/* Rotating Globe Container */}
      <motion.div 
        className="relative w-[260px] h-[260px] md:w-[500px] md:h-[500px] preserve-3d"
        animate={{ rotateY: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Latitude Lines - Indigo */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={`lat-${i}`}
            className="absolute inset-0 rounded-full border border-[#728AD5]/20"
            style={{ 
              transform: `rotateX(${i * 30}deg)`,
              boxShadow: "0 0 10px rgba(114,138,213,0.1)"
            }}
          />
        ))}
        
        {/* Longitude Lines - Indigo */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={`long-${i}`}
            className="absolute inset-0 rounded-full border border-[#728AD5]/20"
            style={{ 
              transform: `rotateY(${i * 30}deg)`,
              boxShadow: "0 0 10px rgba(114,138,213,0.1)"
            }}
          />
        ))}

        {/* Floating Particles (Orbiting) - White/Indigo */}
        <motion.div 
          className="absolute inset-0"
          animate={{ rotateZ: 360, rotateX: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full blur-[1px] shadow-[0_0_10px_white]" />
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-[#728AD5] rounded-full blur-[1px]" />
          <div className="absolute left-0 top-1/2 w-2 h-2 bg-[#A5B4FC] rounded-full blur-[1px]" />
        </motion.div>
      </motion.div>

      {/* Central NexChain Logo/Core - STATIC & PREMIUM COLOR */}
      <div className="absolute z-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-[#0f172a] to-[#020202] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(114,138,213,0.2)] border border-[#728AD5]/40">
         
         {/* Inner Gradient Depth */}
         <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#728AD5]/10 to-transparent opacity-40"></div>

         <div className="relative w-full h-full flex items-center justify-center">
            {/* Dashed Ring - Static */}
            <div className="absolute inset-3 md:inset-4 border-2 border-dashed border-[#728AD5]/60 rounded-full"></div>
            
            {/* NX Text */}
            <div className="flex items-baseline justify-center text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#C7D2FE] via-[#728AD5] to-[#312E81] drop-shadow-lg font-manrope tracking-tighter">
              NE<span className="text-6xl md:text-8xl">X</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default function Landing() {
  const isLight = useThemeCheck(); 
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("NEXCHAIN_USER_TOKEN");

  // Responsive check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // FRAMER MOTION SCROLL HOOKS
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const marketRef = useRef(null);
  const containerRef = useRef(null);

  const { scrollYProgress: documentScroll } = useScroll(); 
  const bgParallaxY = useTransform(documentScroll, [0, 0.5], [0, -200]); 
  const fgParallaxY = useTransform(documentScroll, [0, 0.5], [0, 50]); 

  const { scrollYProgress: featuresScroll } = useScroll({ target: featuresRef, offset: ["start end", "end start"] });
  const yFeatureText = useTransform(featuresScroll, [0, 1], [-50, 50]);

  const { scrollYProgress: marketScroll } = useScroll({ target: marketRef, offset: ["start end", "end start"] });
  
  // Hero Parallax
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  // Interactive Feature Tabs State
  const [activeFeature, setActiveFeature] = useState(0);

  // Mouse Move Handler for Grid Effect 
  const handleMouseMove = (e) => {
    if (containerRef.current) {
      // Use viewport coordinates directly for fixed background
      const x = e.clientX;
      const y = e.clientY;
      containerRef.current.style.setProperty("--mouse-x", `${x}px`);
      containerRef.current.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  // 💡 Ultimate Advanced Theme Classes Helper - **PREMIUM DARK MODE**
  const TC = useMemo(
    () => ({
      // General
      // MODIFIED: Much darker background color
      bgPage: "bg-[#02040a] text-white", // Even darker, richer black/blue
      textPrimary: "text-white",
      textSecondary: "text-slate-400", // Slightly cooler gray
      textHeroGradient: "bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-600",
      
      // Buttons - PREMIUM GRADIENT
      btnPrimary: "bg-gradient-to-r from-[#728AD5] to-[#4338CA] text-white hover:shadow-[0_0_30px_rgba(114,138,213,0.5)] transition-all duration-300", 
      btnSecondary: "border border-[#728AD5]/50 text-[#A5B4FC] hover:bg-[#728AD5]/10 hover:border-[#728AD5] backdrop-blur-md transition-all duration-300 shadow-[0_0_15px_rgba(114,138,213,0.1)]", 

      // Features Section
      bgFeatureCard: "bg-[#0a0f1e]/60 border border-white/5 shadow-2xl backdrop-blur-2xl", 
      bgFeatureTabActive: "bg-white/5 text-cyan-400 border-l-2 border-cyan-500", 
      bgFeatureTabInactive: "hover:bg-white/5 text-slate-500 border-l-2 border-transparent",
      
      // Coin Cards
      bgCoinCard: "bg-[#0a0f1e]/80 border border-white/5 backdrop-blur-xl shadow-xl", 
      bgCoinLive: "bg-emerald-500/10 text-emerald-400",
      textPriceMain: "text-white",
      textPriceSecondary: "text-slate-400",
      textPriceTertiary: "text-slate-500",
      textPriceSmall: "text-cyan-400",
      textCoinSymbol: "text-slate-500",

      // Testimonials
      bgTestimonial: "bg-[#0a0f1e]/60 border border-white/5", 
      bgTestimonialGlow: "group-hover:before:bg-cyan-500/5", 
      bgTestimonialAccent: "bg-cyan-500",
      textMessage: "text-slate-300 group-hover:text-white",
      textStarInactive: "text-slate-800",
      borderDivider: "border-white/5",
      textTimestamp: "text-cyan-400",
      bgVerified: "bg-emerald-500/10 text-emerald-400",

      // CTA
      bgCTA: "bg-gradient-to-b from-[#0a0f1e] to-black border border-white/10 shadow-2xl", 
      textGreen: "text-emerald-400",
      textRed: "text-rose-400",
    }),
    []
  );

  const [livePrices, setLivePrices] = useState({
    bitcoin: { price: 64213, change: 2.34 },
    ethereum: { price: 3480, change: 1.56 },
    solana: { price: 145.56, change: -0.89 },
    cardano: { price: 0.48, change: 3.21 },
    dogecoin: { price: 0.12, change: -2.15 },
    ripple: { price: 0.62, change: 1.15 },
    polkadot: { price: 7.35, change: -0.45 },
  });

  const ws = useRef(null);

  useEffect(() => {
    const symbols = ["btcusdt@ticker", "ethusdt@ticker", "solusdt@ticker", "adausdt@ticker", "dogeusdt@ticker", "xrpusdt@ticker", "dotusdt@ticker"];
    const streams = symbols.join("/");

    try {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbolToCoinId = { 
            btcusdt: "bitcoin", 
            ethusdt: "ethereum", 
            solusdt: "solana", 
            adausdt: "cardano", 
            dogeusdt: "dogecoin",
            xrpusdt: "ripple",
            dotusdt: "polkadot"
          };
          const coinId = symbolToCoinId[message.stream.replace("@ticker", "")];
          if (coinId) {
            setLivePrices((prev) => ({
              ...prev,
              [coinId]: { price: parseFloat(message.data.c), change: parseFloat(message.data.P), lastUpdate: Date.now() },
            }));
          }
        }
      };
    } catch (error) { console.error("WS setup failed:", error); }

    return () => { if (ws.current) ws.current.close(); };
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: price < 1 ? 4 : 2, maximumFractionDigits: price < 1 ? 4 : 2 }).format(price);
  const getChangeColor = (change) => change >= 0 ? TC.textGreen : TC.textRed;
  const getChangeIcon = (change) => change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  const scrollToFeatures = () => document.getElementById("features-section").scrollIntoView({ behavior: "smooth" });

  const lottieRef = useRef(null);

  const featuresList = [
    {
      id: 0,
      title: "Advanced Analytics",
      description: "Professional-grade charting tools with 100+ indicators and real-time data visualization.",
      icon: BarChart3,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      id: 1,
      title: "Fortress Security",
      description: "Your assets are protected by industry-leading encryption and cold storage protocols.",
      icon: ShieldCheck,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      id: 2,
      title: "Lightning Execution",
      description: "Execute trades in milliseconds with our high-performance matching engine.",
      icon: Zap,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    },
    {
      id: 3,
      title: "Cross-Platform",
      description: "Trade seamlessly across desktop, mobile, and tablet devices.",
      icon: Smartphone,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  // Section Animation Variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1.0] }
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`min-h-screen ${TC.bgPage} font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative`}
    >
      {/* GLOBAL FIXED BACKGROUND - Visible in Hero & Market Overview */}
      <InteractiveGridPattern />
      
      {/* Background Glows (Moved to Global Scope for Seamless Blend) */}
      <motion.div style={{ y: bgParallaxY }} className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 bg-cyan-400 pointer-events-none`} /> 
      <motion.div style={{ y: bgParallaxY }} className={`absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 bg-blue-500 pointer-events-none`} /> 
      
      {/* Hero Section - Transparent to show Fixed BG */}
      <section className="min-h-screen flex items-center justify-center pt-16 pb-20 md:py-20 relative bg-transparent" ref={heroRef}> 

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left space-y-3 md:space-y-8 order-2 lg:order-1"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase bg-white/5 text-[#A5B4FC] border border-white/10 backdrop-blur-md`}
              > 
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#728AD5]"></span>
                </span>
                Next Gen Trading
              </motion.div>

              <h1 className="text-3xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-2 md:mb-6 font-manrope">
                The Future of <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C7D2FE] via-[#728AD5] to-[#312E81] drop-shadow-lg">
                  Digital Assets
                </span>
              </h1>

              <p className={`text-sm md:text-xl max-w-xl mx-auto lg:mx-0 ${TC.textSecondary} leading-relaxed font-light font-manrope`}>
                Experience institutional-grade crypto trading with real-time analytics, 
                AI-powered insights, and zero-latency execution.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start pt-4">
                <button
                  onClick={() => navigate("/auth")}
                  className={`group px-6 py-2.5 md:px-8 md:py-4 rounded-full font-bold text-sm tracking-wide transition-all transform hover:scale-105 flex items-center justify-center gap-3 ${TC.btnPrimary}`}
                >
                  <span>Start Trade</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate(isLoggedIn ? "/learning" : "/public-learning")}
                  className={`group px-6 py-2.5 md:px-8 md:py-4 rounded-full font-bold text-sm tracking-wide transition-all transform hover:scale-105 flex items-center justify-center gap-3 ${TC.btnSecondary}`}
                >
                  <span>Learning Hub</span>
                </button>
              </div>

              {/* Trust Stats - Reverted to here */}
              <div className="pt-4 md:pt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 border-t border-white/5 mt-4 md:mt-8"> 
                {[
                  { label: "Active Users", value: "50K+" },
                  { label: "Quarterly Volume", value: "$2B+" },
                  { label: "Countries", value: "120+" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <p className={`text-lg md:text-2xl font-bold text-white tracking-tight`}>{stat.value}</p>
                    <p className={`text-[10px] md:text-xs font-medium ${TC.textSecondary} uppercase tracking-wider`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Visual - Replaces Lottie */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative order-1 lg:order-2 h-[280px] md:h-[500px] flex flex-col items-center justify-center mb-2 md:mb-0"
              style={{ y: fgParallaxY }}
            >
               <HeroGlobe />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator (NEW PREMIUM COMPONENT) */}
        <PremiumScrollIndicator onClick={scrollToFeatures} TC={TC} />
      </section>

      {/* Features Section (Interactive Tabs) */}
      {/* Features Section - SOLID BG to cover Fixed BG */}
      <motion.section 
        id="features-section" 
        ref={featuresRef} 
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

      {/* Market Overview Section - TRANSPARENT to reveal Fixed BG */}
      <motion.section 
        ref={marketRef} 
        className="py-12 md:py-24 relative bg-transparent z-10 -mt-1"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-10 md:mb-20">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 font-bold text-xs tracking-widest uppercase bg-[#728AD5]/15 text-[#A5B4FC] border border-[#728AD5]/30 backdrop-blur-sm`}>
              <Activity className="w-4 h-4 animate-pulse" />
              LIVE MARKET
            </div>
            <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${TC.textPrimary} font-manrope`}>Market Overview</h2>
          </div>

          <div className="w-full flex justify-center">
            <MarketNetworkVisual livePrices={livePrices} />
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section - TRANSPARENT BG */}
      <motion.section 
        className="py-24 relative bg-transparent z-10 -mt-1"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        {/* BACKGROUND REMOVED as requested */}
        
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${TC.textPrimary} font-manrope`}>Trusted by Traders</h2>
            <p className={`text-xl ${TC.textSecondary}`}>Join thousands of successful investors on NexChain.</p>
          </div>
          <TestimonialCarousel TC={TC} isMobile={isMobile} />
        </div>
      </motion.section>

      {/* CTA Section - SOLID BG */}
      <motion.section 
        className="py-12 px-4 md:py-24 md:px-6 sticky top-0 z-40 bg-[#02040a] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden -mt-1"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        {/* BACKGROUND: Parallax for CTA - Custom Gradient */}
        <ParallaxSectionBackground bgClass="bg-gradient-to-b from-[#0E151A] to-[#02040a]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className={`rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-20 text-center relative overflow-hidden ${TC.bgCTA}`}>
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className={`absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/30 blur-[150px] rounded-full`}></div> 
              <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/30 blur-[150px] rounded-full`}></div> 
            </div>

            <div className="relative z-10">
              <h2 className={`text-2xl md:text-6xl font-extrabold mb-4 md:mb-6 ${TC.textPrimary}`}>
                Start Your Journey Today
              </h2>
              <p className={`text-sm md:text-xl mb-6 md:mb-10 max-w-2xl mx-auto ${TC.textSecondary}`}>
                Join the fastest growing crypto exchange. Safe, secure, and built for everyone.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className={`px-8 py-3 md:px-12 md:py-5 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg transition-all transform hover:scale-105 shadow-xl ${TC.btnPrimary}`}
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}