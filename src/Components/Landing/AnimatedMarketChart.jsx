import React, { useState, useEffect } from "react";


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

  
  const size = 40;
  const points = [
    { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
    { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
    { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
  ];

  const project = (p, rotX, rotY) => {
    
    let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    let z = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    
    let y = p.y * Math.cos(rotX) - z * Math.sin(rotX);
    z = p.y * Math.sin(rotX) + z * Math.cos(rotX);
    
    
    const scale = 100 / (100 + z * 20); 
    return {
      x: x * size * scale + 150, 
      y: y * size * scale + 100  
    };
  };

  const projectedPoints = points.map(p => project(p, rotation.x, rotation.y));

  
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], 
    [4, 5], [5, 6], [6, 7], [7, 4], 
    [0, 4], [1, 5], [2, 6], [3, 7]  
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gray-950/20">
      {}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#728AD5]/20 via-transparent to-transparent opacity-50"></div>

      {}
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

        {}
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

        {}
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

      {}
      <div className="absolute w-4 h-4 bg-[#728AD5] rounded-full shadow-[0_0_30px_rgba(114,138,213,1)] animate-pulse z-10"></div>

      {}
      <div className="absolute bottom-6 left-0 right-0 text-center z-20">
        <p className="text-xs font-bold text-[#A5B4FC] tracking-[0.2em] uppercase mb-1">Live Block Data</p>
        <p className="text-[10px] text-slate-500 font-mono">Processing Hash...</p>
      </div>
    </div>
  );
};

export default AnimatedMarketChart;
