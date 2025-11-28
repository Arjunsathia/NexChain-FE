import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bitcoin, Circle, TrendingUp, TrendingDown } from "lucide-react";

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

export default MarketNetworkVisual;
