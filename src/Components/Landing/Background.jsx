import React, { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

const QuantumNebulaBackground = React.memo(() => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Cosmic Entities
    const stars = [];
    const nebulas = [];
    const starCount = 150;

    // Initialize Starfield (Quantum Particles)
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2,
        opacity: Math.random(),
        blinkSpeed: Math.random() * 0.02 + 0.005,
        driftX: (Math.random() - 0.5) * 0.2,
        driftY: (Math.random() - 0.5) * 0.2,
      });
    }

    // Initialize Deep Glows (Nebula effects)
    const colors = ['rgba(6, 182, 212,', 'rgba(139, 92, 246,', 'rgba(30, 58, 138,'];
    for (let i = 0; i < 4; i++) {
      nebulas.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 400 + 200,
        color: colors[i % colors.length],
        pulse: 0,
        pulseSpeed: Math.random() * 0.005 + 0.002
      });
    }

    const animate = () => {
      // 1. Deep Space Base
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Nebulas (Atmospheric depth)
      nebulas.forEach(n => {
        n.pulse += n.pulseSpeed;
        const currentOpacity = 0.03 + Math.sin(n.pulse) * 0.02;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        g.addColorStop(0, `${n.color} ${currentOpacity})`);
        g.addColorStop(1, `${n.color} 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      });

      // 3. Draw Quantum Stars
      stars.forEach(s => {
        s.opacity += s.blinkSpeed;
        if (s.opacity > 1 || s.opacity < 0) s.blinkSpeed *= -1;
        
        // Drift movement
        s.x += s.driftX;
        s.y += s.driftY;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.opacity)})`;
        ctx.fill();

        // Subtle glow for larger stars
        if (s.size > 1) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = "white";
        } else {
          ctx.shadowBlur = 0;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
});

// Advanced Beam Component for the "Handshake" effect
const QuantumBeam = ({ vertical, position, color, delay }) => (
  <motion.div
    initial={vertical ? { y: "-100%", opacity: 0 } : { x: "-100%", opacity: 0 }}
    animate={vertical ? { y: "200%", opacity: [0, 0.5, 0] } : { x: "200%", opacity: [0, 0.5, 0] }}
    transition={{
      duration: 5,
      repeat: Infinity,
      delay: delay,
      ease: "linear",
    }}
    className="absolute pointer-events-none z-1"
    style={{
      background: `linear-gradient(${vertical ? 'to bottom' : 'to right'}, transparent, ${color}, transparent)`,
      ...(vertical ? { left: position, width: "1px", height: "40vh" } : { top: position, height: "1px", width: "40vw" }),
      filter: "blur(1px) drop-shadow(0 0 10px " + color + ")",
    }}
  />
);

const InteractiveGridPattern = React.memo(({ className = "" }) => {
  return (
    <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden h-full w-full bg-[#02040a] ${className}`}>
      {/* 1. Base Quantum Starfield */}
      <QuantumNebulaBackground />

      {/* 2. High-Tech Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* 3. Aesthetic Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#02040a]/40 to-[#02040a]" />

      {/* 4. Quantum Beams (The "Advanced" look) */}
      <QuantumBeam vertical position="20%" color="#06b6d4" delay={0} />
      <QuantumBeam vertical position="80%" color="#8b5cf6" delay={2} />
      <QuantumBeam vertical={false} position="30%" color="#3b82f6" delay={1} />
      <QuantumBeam vertical={false} position="70%" color="#06b6d4" delay={3} />

      {/* 5. Noise Texture for premium feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
    </div>
  );
});

InteractiveGridPattern.displayName = "InteractiveGridPattern";
export default InteractiveGridPattern;