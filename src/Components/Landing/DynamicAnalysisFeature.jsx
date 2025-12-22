import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";


const DynamicAnalysisFeature = () => {
  const [dataPoints, setDataPoints] = useState([40, 45, 42, 48, 55, 50, 58, 62, 60, 65, 58, 62, 68, 72, 70]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints(prev => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * 15; 
        let next = last + change;
        
        if (next > 90) next = 85;
        if (next < 20) next = 25;
        return [...prev.slice(1), next];
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  
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

      {}
      <div className="flex-1 relative w-full bg-gray-950/40 rounded-xl border border-gray-800/50 overflow-hidden p-0 shadow-inner">
        {}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10 pointer-events-none">
           {[...Array(24)].map((_,i) => <div key={i} className="border-r border-b border-gray-500/30"></div>)}
        </div>

        {}
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
            
            {}
            <circle cx={width} cy={height - (dataPoints[dataPoints.length-1] / 100) * height} r="1.5" fill="#fff" className="animate-pulse" />
            </svg>
        </div>
        
        {}
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
      
      {}
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

export default DynamicAnalysisFeature;
