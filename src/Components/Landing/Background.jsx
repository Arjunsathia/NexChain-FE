import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const DarkCosmicBlockchainBackground = React.memo(() => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gradientRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false }); 
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const updateGradient = () => {
      if (!ctx) return;
      const g = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      g.addColorStop(0, '#111827'); // Gray 900 Center
      g.addColorStop(0.7, '#020617'); // Slate 950
      g.addColorStop(1, '#000000'); // Black Edges
      gradientRef.current = g;
    };

    // Set canvas size and gradient
    canvas.width = width;
    canvas.height = height;
    updateGradient();
    
    // Handle resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      updateGradient();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Particle system containers
    const particles = [];
    const networkNodes = [];
    const networkLines = [];
    const lightFlares = [];
    
    // Initialize particles - REDUCED COUNT (30 is plenty for mobile/desktop background)
    for (let i = 0; i < 30; i++) { 
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5, 
        speed: Math.random() * 0.2 + 0.05, 
        direction: Math.random() * Math.PI * 2,
        layer: Math.floor(Math.random() * 3), 
        opacity: Math.random() * 0.4 + 0.2 
      });
    }
    
    // Initialize network nodes - REDUCED COUNT (8 is cleaner)
    for (let i = 0; i < 8; i++) { 
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
    
    // Create network connections - Optimized logic
    networkNodes.forEach((node, i) => {
      // Find closest nodes
      const distances = networkNodes.map((other, j) => ({
        index: j,
        distance: Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2)
      }));
      
      distances.sort((a, b) => a.distance - b.distance);
      
      // Connect to 1-2 nearest neighbors
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
              baseWidth: Math.random() * 0.3 + 0.1 
            });
          }
        }
      }
    });
    
    // Initialize light flares - Minimal
    for (let i = 0; i < 2; i++) { 
      lightFlares.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 60 + 20, 
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.0005, 
        opacity: Math.random() * 0.1 + 0.02 
      });
    }
    
    // Animation loop
    const animate = () => {
      if (!ctx || !gradientRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear with CACHED gradient
      ctx.fillStyle = gradientRef.current;
      ctx.fillRect(0, 0, width, height);
      
      // Update and draw particles
      particles.forEach(particle => {
        const moveSpeed = particle.speed * (particle.layer + 1);
        particle.x += Math.cos(particle.direction) * moveSpeed;
        particle.y += Math.sin(particle.direction) * moveSpeed;
        
        // Wrap around screen
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${particle.opacity})`; 
        ctx.fill();
      });
      
      // Update and draw network nodes
      networkNodes.forEach(node => {
        node.pulse += node.pulseSpeed;
        node.x = node.baseX + Math.sin(node.pulse * 0.5) * 1.0; 
        node.y = node.baseY + Math.cos(node.pulse * 0.3) * 1.0; 
        
        const pulseSize = 2.0 + Math.sin(node.pulse) * 1.0; 
        
        // Draw glow
        const g = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, pulseSize * 3.0
        );
        g.addColorStop(0, `rgba(114, 138, 213, ${0.3 + Math.sin(node.pulse) * 0.1})`); 
        g.addColorStop(1, 'rgba(114, 138, 213, 0)');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        
        // Draw core
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${0.6 + Math.sin(node.pulse) * 0.2})`; 
        ctx.fill();
      });
      
      // Update and draw network lines
      networkLines.forEach(line => {
        line.pulse += line.pulseSpeed;
        const fromNode = networkNodes[line.from];
        const toNode = networkNodes[line.to];
        if (!fromNode || !toNode) return;
        
        const pulseWidth = line.baseWidth;
        const pulseOpacity = 0.15 + Math.sin(line.pulse) * 0.1; 
        
        const g = ctx.createLinearGradient(
          fromNode.x, fromNode.y,
          toNode.x, toNode.y
        );
        g.addColorStop(0, `rgba(114, 138, 213, ${pulseOpacity})`);
        g.addColorStop(1, `rgba(114, 138, 213, ${pulseOpacity})`);
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.lineWidth = pulseWidth;
        ctx.strokeStyle = g;
        ctx.stroke();
      });
      
      // Draw rotating light flares
      lightFlares.forEach(flare => {
        flare.rotation += flare.rotationSpeed;
        ctx.save();
        ctx.translate(flare.x, flare.y);
        ctx.rotate(flare.rotation);
        
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, flare.size);
        g.addColorStop(0, `rgba(114, 138, 213, ${flare.opacity * 2})`); 
        g.addColorStop(1, `rgba(114, 138, 213, 0)`);
        
        ctx.beginPath();
        ctx.arc(0, 0, flare.size, 0, Math.PI * 2);
        ctx.fillStyle = g;
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
});

// =================================================================
// SUB-COMPONENTS
// =================================================================

const GridBeam = React.memo(({ delay = 0, duration = 4, top, left, vertical = false }) => (
  <motion.div
    initial={vertical ? { top: '-20%', opacity: 0 } : { left: '-20%', opacity: 0 }}
    animate={vertical ? { top: '120%', opacity: [0, 1, 1, 0] } : { left: '120%', opacity: [0, 1, 1, 0] }}
    transition={{
      repeat: Infinity,
      duration: duration,
      delay: delay,
      ease: "linear",
      repeatDelay: Math.random() * 5 + 2 
    }}
    className={`absolute bg-gradient-to-r from-transparent via-[#728AD5] to-transparent blur-[2px] shadow-[0_0_15px_rgba(114,138,213,0.8)] z-0 will-change-transform`}
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
));

const InteractiveGridPattern = React.memo(({ className = "" }) => {
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
});

export default InteractiveGridPattern;
