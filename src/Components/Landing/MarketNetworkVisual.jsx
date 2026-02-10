import React, { memo } from "react";
import { motion } from "framer-motion";
import { Bitcoin, Circle, TrendingUp, TrendingDown } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";

const priceFormatFull = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const priceFormatSmall = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const format = (p) => (p < 1 ? priceFormatSmall.format(p) : priceFormatFull.format(p));

// --- SVG Icons ---
const CoinLogo = ({ symbol, className }) => {
  switch (symbol) {
    case "BTC":
      return <Bitcoin className={className} />;
    case "ETH":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781L16.498 4 9 16.22l7.498 4.353 7.496-4.354zM24 17.616l-7.502 4.351L9 17.617l7.498 10.378 7.502-10.379z" />
        </svg>
      );
    case "ADA":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-3.773-18.735l-2.016 2.684-2.67-2.028 2.016-2.684 2.67 2.028zm6.443-4.896l-2.684 2.016-2.028-2.67 2.684-2.016 2.028 2.67zm4.896 6.443l-2.016-2.684 2.67-2.028 2.016 2.684-2.67 2.028zm-6.443 4.896l2.684-2.016 2.028 2.67-2.684 2.016-2.028-2.67zm-8.457-1.547a2.004 2.004 0 1 1 0-4.008 2.004 2.004 0 0 1 0 4.008zm13.547 0a2.004 2.004 0 1 1 0-4.008 2.004 2.004 0 0 1 0 4.008zm-6.773 5.227a2.004 2.004 0 1 1 0-4.008 2.004 2.004 0 0 1 0 4.008zm0-13.547a2.004 2.004 0 1 1 0-4.008 2.004 2.004 0 0 1 0 4.008z" />
        </svg>
      );
    case "DOGE":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm2.667-22.667h-6.667v13.333h6.667c3.682 0 6.667-2.985 6.667-6.667s-2.985-6.667-6.667-6.667zm0 10.667h-4v-8h4c2.209 0 4 1.791 4 4s-1.791 4-4 4z" />
        </svg>
      );
    case "SOL":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M4.6 22.85l2.25-2.25h18.3l2.25 2.25-2.25 2.25H6.85L4.6 22.85zm0-13.7l2.25-2.25h18.3l2.25 2.25-2.25 2.25H6.85L4.6 9.15zm22.8 6.85l-2.25 2.25H6.85l-2.25-2.25 2.25-2.25h18.3l2.25 2.25z" />
        </svg>
      );
    case "XRP":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-5.26-21.74L4.22 16.78l6.52 6.52 6.52-6.52-6.52-6.52zm10.52 0l-6.52 6.52 6.52 6.52 6.52-6.52-6.52-6.52z" />
        </svg>
      );
    case "DOT":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <circle cx="16" cy="16" r="16" />
          <path fill="white" d="M10 16a6 6 0 1 1 12 0 6 6 0 0 1-12 0z" />
        </svg>
      );
    default:
      return <Circle className={className} />;
  }
};

// --- Coin Data Configuration ---
const desktopCoins = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    pos: "top-[5%] left-[5%] md:left-[10%]",
    float: { y: [0, -15, 0] },
    theme: {
      text: "text-orange-500",
      bg: "bg-orange-500",
      border: "hover:border-orange-500/50",
      shadow: "hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]",
    },
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    pos: "top-[40%] left-[-2%] md:left-[2%]",
    float: { y: [0, 10, 0] },
    theme: {
      text: "text-purple-500",
      bg: "bg-purple-600",
      border: "hover:border-purple-500/50",
      shadow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]",
    },
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    pos: "bottom-[10%] left-[10%] md:left-[15%]",
    float: { y: [0, -8, 0] },
    theme: {
      text: "text-blue-500",
      bg: "bg-blue-600",
      border: "hover:border-blue-500/50",
      shadow: "hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]",
    },
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    pos: "bottom-[15%] right-[5%] md:right-[15%]",
    float: { y: [0, 12, 0] },
    theme: {
      text: "text-yellow-500",
      bg: "bg-yellow-600",
      border: "hover:border-yellow-500/50",
      shadow: "hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]",
    },
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    pos: "top-[25%] right-[2%] md:right-[5%]",
    float: { y: [0, -10, 0] },
    theme: {
      text: "text-indigo-500",
      bg: "bg-indigo-600",
      border: "hover:border-indigo-500/50",
      shadow: "hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]",
    },
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "Ripple",
    pos: "top-[5%] left-[50%] -translate-x-1/2",
    float: { y: [0, 8, 0] },
    theme: {
      text: "text-cyan-500",
      bg: "bg-cyan-600",
      border: "hover:border-cyan-500/50",
      shadow: "hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]",
    },
  },
  {
    id: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    pos: "bottom-[5%] left-[50%] -translate-x-1/2",
    float: { y: [0, -6, 0] },
    theme: {
      text: "text-pink-500",
      bg: "bg-pink-600",
      border: "hover:border-pink-500/50",
      shadow: "hover:shadow-[0_0_40px_rgba(236,72,153,0.3)]",
    },
  },
];

const CoinCard = memo(({ coin, index, price, change }) => {
  return (
    <motion.div
      key={coin.id}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className={`absolute ${coin.pos} z-30`}
    >
      <motion.div
        animate={{ y: coin.float.y }}
        transition={{
          duration: 5 + index,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.5,
        }}
        whileHover={{ scale: 1.05, zIndex: 100 }}
        className={`
           group relative
           bg-slate-900/40 backdrop-blur-md
           border border-white/10
           p-5 rounded-[24px]
           min-w-[180px]
           cursor-pointer
           transition-all duration-300 ease-out
           shadow-[0_4px_30px_rgba(0,0,0,0.1)]
           hover:bg-slate-900/60
           ${coin.theme.border}
            ${coin.theme.shadow}
            hover:-translate-y-1
            overflow-hidden
            will-change-transform
         `}
        style={{ transform: "translateZ(0)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    bg-white/5 border border-white/10 
                    group-hover:${coin.theme.bg} group-hover:text-white
                    transition-colors duration-300
                    ${coin.theme.text}
                `}
            >
              <CoinLogo
                symbol={coin.symbol}
                className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-none">
                {coin.name}
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                {coin.symbol}
              </div>
            </div>
          </div>

          <div className="text-xl font-bold text-white tracking-tight">
            {format(price)}
          </div>

          <div
            className={`mt-1 text-xs font-mono flex items-center gap-1 font-bold ${change >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}%
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

const MarketNetworkVisual = memo(({ livePrices }) => {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <div className="w-full px-4 py-8 font-manrope">
        <div className="grid grid-cols-2 gap-3">
          {desktopCoins.slice(0, 6).map((coin, i) => {
            const price = livePrices?.[coin.id]?.price ?? 0;
            const change = livePrices?.[coin.id]?.change ?? 0;
            return (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`
                   bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg flex flex-col gap-2
                   ${coin.theme.border.replace("hover:", "")} 
                `}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-white/5 ${coin.theme.text}`}
                  >
                    <CoinLogo symbol={coin.symbol} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white leading-none truncate capitalize">
                      {coin.id}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase">
                      {coin.symbol}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white tracking-tight">
                    {format(price)}
                  </div>
                  <div
                    className={`text-[10px] font-mono flex items-center gap-1 font-bold ${change >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}{" "}
                    {change}%
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center perspective-1000 overflow-visible font-manrope hidden md:flex">
      {/* 1. Ambient Background Glows - Reduced opacity and blur for performance */}
      <div className="absolute inset-0 bg-[#728AD5]/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[600px] h-[600px] border border-[#728AD5]/10 rounded-full animate-[spin_100s_linear_infinite]" />
        <div className="absolute w-[400px] h-[400px] border border-[#728AD5]/20 rounded-full animate-[spin_80s_linear_infinite_reverse]" />
      </div>

      {/* 2. Data Flow Lines (SVG) - Optimized: Removed expensive filters and simplified */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <linearGradient
            id="dataFlowGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgba(114, 138, 213, 0)" />
            <stop offset="50%" stopColor="rgba(114, 138, 213, 0.6)" />
            <stop offset="100%" stopColor="rgba(114, 138, 213, 0)" />
          </linearGradient>
          <filter id="glowLine">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[
          { x2: "15%", y2: "15%" },
          { x2: "10%", y2: "45%" },
          { x2: "15%", y2: "85%" },
          { x2: "85%", y2: "80%" },
          { x2: "90%", y2: "25%" },
          { x2: "50%", y2: "12%" },
          { x2: "50%", y2: "88%" },
        ].map((pos, i) => (
          <line
            key={i}
            x1="50%"
            y1="50%"
            x2={pos.x2}
            y2={pos.y2}
            stroke="url(#dataFlowGradient)"
            strokeWidth="1.5"
            strokeDasharray="10,10"
            className="opacity-50"
            filter="url(#glowLine)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="100"
              to="0"
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}
      </svg>

      {/* 3. Central Node (Bitcoin Core) */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative z-20 w-48 h-48 bg-[#0f172a] rounded-full flex items-center justify-center border-4 border-[#728AD5]/20 shadow-[0_0_60px_rgba(114,138,213,0.3)]"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#728AD5]/20 to-transparent animate-pulse" />
        <Bitcoin className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10" />
        <div className="absolute -inset-4 border-2 border-[#728AD5]/30 rounded-full border-t-transparent animate-[spin_10s_linear_infinite]" />
        <div className="absolute -inset-8 border border-[#728AD5]/10 rounded-full border-b-transparent animate-[spin_8s_linear_infinite_reverse]" />
      </motion.div>

      {/* 4. Satellite Cards (Memoized for performance) */}
      {desktopCoins.map((coin, index) => {
        const price = livePrices?.[coin.id]?.price ?? 0;
        const change = livePrices?.[coin.id]?.change ?? 0;
        return (
          <CoinCard
            key={coin.id}
            coin={coin}
            index={index}
            price={price}
            change={change}
          />
        );
      })}
    </div>
  );
});

MarketNetworkVisual.displayName = "MarketNetworkVisual";
CoinCard.displayName = "CoinCard";

export default MarketNetworkVisual;
