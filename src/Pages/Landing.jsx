import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Target,
  Activity,
  DollarSign,
  TrendingDown,
  BarChart3,
  Bitcoin,
  Coins,
  Circle,
  Users,
  ArrowDown,
} from "lucide-react";
import Lottie from "lottie-react";
import cryptoAnim from "../assets/cryptobitcoin.json";
import crypto from "../assets/Cryptocurrency.json";
import { motion } from "framer-motion";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

const testimonials = [
  {
    id: 1,
    type: "praise",
    name: "Sarah Mitchell",
    avatar: "SM",
    message:
      "NexChain's real-time tracking helped me make profitable trades with confidence. The interface is incredibly intuitive!",
    timestamp: "2 days ago",
    rating: 5,
  },
  {
    id: 2,
    type: "praise",
    name: "Marcus Chen",
    avatar: "MC",
    message:
      "The demo trading feature is brilliant. I practiced for weeks before investing real money!",
    timestamp: "1 week ago",
    rating: 5,
  },
  {
    id: 3,
    type: "praise",
    name: "Emily Rodriguez",
    avatar: "ER",
    message:
      "Learning hub transformed me from beginner to confident trader in just 30 days!",
    timestamp: "3 days ago",
    rating: 5,
  },
  {
    id: 4,
    type: "praise",
    name: "David Thompson",
    avatar: "DT",
    message:
      "Portfolio tracking is spot-on. Never miss a market movement with their alerts!",
    timestamp: "5 days ago",
    rating: 5,
  },
  {
    id: 5,
    type: "praise",
    name: "Priya Sharma",
    avatar: "PS",
    message:
      "The community support and educational content are worth the subscription alone!",
    timestamp: "2 weeks ago",
    rating: 5,
  },
  {
    id: 6,
    type: "praise",
    name: "Alex Johnson",
    avatar: "AJ",
    message:
      "Made my first profitable trade within a week of using NexChain. Game changer!",
    timestamp: "1 day ago",
    rating: 5,
  },
  {
    id: 7,
    type: "praise",
    name: "Jennifer Lee",
    avatar: "JL",
    message:
      "The mobile app is flawless. Track my portfolio on the go with ease!",
    timestamp: "4 days ago",
    rating: 5,
  },
  {
    id: 8,
    type: "praise",
    name: "Robert Garcia",
    avatar: "RG",
    message:
      "Customer support is exceptional. They actually care about your success!",
    timestamp: "1 week ago",
    rating: 5,
  },
  {
    id: 9,
    type: "praise",
    name: "Michael Brown",
    avatar: "MB",
    message:
      "The analytics tools are incredible. Made data-driven decisions that doubled my portfolio!",
    timestamp: "3 days ago",
    rating: 5,
  },
  {
    id: 10,
    type: "praise",
    name: "Sophia Williams",
    avatar: "SW",
    message:
      "Best crypto platform I've used. The learning curve was minimal and results were immediate!",
    timestamp: "2 weeks ago",
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial, TC }) => {
  return (
    <div className={`${TC.bgTestimonial} rounded-2xl p-5 transition-all duration-300 group hover:scale-105 min-w-[300px] flex-shrink-0`}>
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 transition-all duration-300 ${
              i < testimonial.rating
                ? "text-yellow-400 fill-yellow-400 group-hover:scale-110"
                : TC.textStarInactive
            }`}
            style={{ transitionDelay: `${i * 50}ms` }}
          />
        ))}
      </div>

      <p className={`text-sm leading-relaxed mb-3 line-clamp-3 transition-colors duration-300 ${TC.textMessage}`}>
        "{testimonial.message}"
      </p>

      <div className={`flex items-center justify-between pt-3 border-t ${TC.borderDivider}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            {testimonial.avatar}
          </div>
          <div>
            <p className={`text-sm font-semibold ${TC.textPrimary}`}>
              {testimonial.name}
            </p>
            <p className={`text-xs ${TC.textTimestamp}`}>{testimonial.timestamp}</p>
          </div>
        </div>
        <div className={`${TC.bgVerified} px-2 py-1 rounded-full text-xs font-medium`}>
          Verified
        </div>
      </div>
    </div>
  );
};

const TestimonialCarousel = ({ TC }) => {
  const duplicatedTestimonials = useMemo(() => [...testimonials, ...testimonials], []);

  return (
    // Responsive container for carousel rows
    <div className="w-full overflow-hidden">
      {/* Top Row - Left to Right */}
      <div className="py-4">
        <motion.div
          className="flex gap-6"
          animate={{
            x: [0, -2800], // Increased travel distance for smoother loop
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 50,
              ease: "linear",
            },
          }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard key={`top-${index}`} testimonial={testimonial} TC={TC} />
          ))}
        </motion.div>
      </div>

      {/* Bottom Row - Right to Left */}
      <div className="py-4">
        <motion.div
          className="flex gap-6"
          animate={{
            x: [-2800, 0], // Increased travel distance for smoother loop
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 50,
              ease: "linear",
            },
          }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={`bottom-${index}`}
              testimonial={testimonial}
              TC={TC}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default function Landing() {
  const isLight = useThemeCheck();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("NEXCHAIN_USER_TOKEN");

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    // General
    bgPage: isLight ? "bg-white text-gray-900" : "bg-gradient-to-br from-black via-[#0b182d] to-black text-white",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textHeroGradient: "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600",
    
    // Buttons
    btnPrimary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50",
    btnSecondary: isLight ? "border-2 border-blue-500 hover:bg-blue-500/20 text-blue-600" : "border-2 border-cyan-500 hover:bg-cyan-500/20 text-cyan-400",

    // Features Section
    bgFeatureCard: isLight ? "bg-gray-100 border-gray-300 hover:border-blue-400 hover:shadow-blue-500/10" : "bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-cyan-400 hover:shadow-cyan-500/10",
    
    // Coin Cards (Market Overview)
    bgCoinCard: isLight ? "bg-gray-100 border-gray-300" : "bg-gradient-to-br from-gray-900 to-gray-800",
    bgCoinLive: isLight ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400",
    textPriceMain: isLight ? "text-blue-600" : "text-amber-400",
    textPriceSecondary: isLight ? "text-purple-600" : "text-purple-400",
    textPriceTertiary: isLight ? "text-pink-600" : "text-pink-400",
    textPriceSmall: isLight ? "text-blue-600" : "text-cyan-400",
    textCoinSymbol: isLight ? "text-gray-500" : "text-gray-400",

    // Testimonials
    bgTestimonial: isLight ? "bg-gray-50 border-gray-300 hover:border-blue-400 hover:shadow-blue-500/10" : "bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/20 hover:border-cyan-400 hover:shadow-cyan-500/20",
    textMessage: isLight ? "text-gray-700 group-hover:text-gray-900" : "text-gray-200 group-hover:text-white",
    textStarInactive: isLight ? "text-gray-400" : "text-gray-600",
    borderDivider: isLight ? "border-gray-300" : "border-gray-700",
    textTimestamp: isLight ? "text-blue-600" : "text-cyan-400",
    bgVerified: isLight ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400",
    
    // CTA
    bgCTA: isLight ? "bg-blue-100/50 border-blue-500/30" : "bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-cyan-500/30",
    
    // Price Change Colors (Used via helper function)
    textGreen: isLight ? "text-green-700" : "text-green-400",
    textRed: isLight ? "text-red-700" : "text-red-400",
    
  }), [isLight]);


  const [livePrices, setLivePrices] = useState({
    bitcoin: { price: 64213, change: 2.34 },
    ethereum: { price: 3480, change: 1.56 },
    solana: { price: 145.56, change: -0.89 },
    cardano: { price: 0.48, change: 3.21 },
    dogecoin: { price: 0.12, change: -2.15 },
  });

  const ws = useRef(null);

  // WebSocket setup for live price updates (Logic remains unchanged)
  useEffect(() => {
    const symbols = [
      "btcusdt@ticker",
      "ethusdt@ticker", 
      "solusdt@ticker",
      "adausdt@ticker",
      "dogeusdt@ticker"
    ];
    const streams = symbols.join('/');

    try {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected for landing page live prices');
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace('@ticker', '');
          const coinData = message.data;
          
          const symbolToCoinId = {
            "btcusdt": "bitcoin",
            "ethusdt": "ethereum",
            "solusdt": "solana",
            "adausdt": "cardano",
            "dogeusdt": "dogecoin"
          };

          const coinId = symbolToCoinId[symbol];
          if (coinId) {
            const currentPrice = parseFloat(coinData.c);
            const priceChangePercent = parseFloat(coinData.P);
            
            setLivePrices(prev => ({
              ...prev,
              [coinId]: {
                price: currentPrice,
                change: priceChangePercent,
                lastUpdate: Date.now()
              }
            }));
          }
        }
      };

      ws.current.onerror = (error) => {
        console.error('Landing page WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('Landing page WebSocket disconnected');
      };

    } catch (error) {
      console.error('Landing page WebSocket setup failed:', error);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  const coinCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  const getChangeColor = (change) => {
    return change >= 0 ? TC.textGreen : TC.textRed;
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  const scrollToFeatures = () => {
    document.getElementById("features-section").scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className={`min-h-screen overflow-hidden ${TC.bgPage}`}>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
        <div className="absolute inset-0 "></div>

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Animation - Left Side (Medium Size) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative order-1 lg:order-1"
            >
              <div className="w-full h-[350px] lg:h-[600px] relative">
                <Lottie
                  animationData={cryptoAnim}
                  loop
                  className="w-full h-full"
                />
                <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-r from-transparent via-white/50 to-transparent' : 'bg-gradient-to-r from-transparent via-black/20 to-transparent'}`}></div>
              </div>
            </motion.div>

            {/* Content - Right Side */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left space-y-8 order-2 lg:order-2"
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Welcome to{" "}
                  <span className={`text-transparent bg-clip-text ${TC.textHeroGradient}`}>
                    NexChain
                  </span>
                </h1>

                <p className={`text-xl max-w-2xl ${TC.textSecondary}`}>
                  Track, Trade & Master Crypto — All in one powerful platform
                  designed for modern traders.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => navigate("/auth")}
                    className={`group px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-110 flex items-center justify-center gap-3 relative overflow-hidden ${TC.btnPrimary}`}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative">Start Trading Now</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative" />
                  </button>

                  <button
                    onClick={() =>
                      navigate(isLoggedIn ? "/learning" : "/public-learning")
                    }
                    className={`group px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-110 flex items-center justify-center gap-3 relative overflow-hidden ${TC.btnSecondary} ${isLight ? "glass-effect-light" : "glass-effect"}`}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative">Explore Learning Hub</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on small and medium screens */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer hidden lg:flex"
          onClick={scrollToFeatures}
        >
          <div className={`flex flex-col items-center gap-2 transition-colors duration-300 ${isLight ? "text-blue-600 hover:text-blue-500" : "text-cyan-400 hover:text-cyan-300"}`}>
            <span className="text-sm font-medium">Discover Features</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowDown className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Why Choose NexChain?
              </span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${TC.textSecondary}`}>
              Everything you need to succeed in cryptocurrency trading, packed
              into one intuitive platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Real-Time Analytics",
                description:
                  "Live market data with advanced charting tools and instant price alerts",
                color: "from-cyan-500 to-blue-500",
                delay: 0,
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Demo Trading",
                description:
                  "Practice with virtual funds and master strategies risk-free",
                color: "from-purple-500 to-pink-500",
                delay: 1,
              },
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Learning Hub",
                description:
                  "Comprehensive educational resources for all skill levels",
                color: "from-green-500 to-teal-500",
                delay: 2,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                custom={feature.delay}
                initial="hidden"
                whileInView="visible"
                variants={cardVariants}
                viewport={{ once: true }}
                className="group"
              >
                <div className={`rounded-3xl p-8 transition-all duration-500 hover:scale-105 h-full ${TC.bgFeatureCard}`}>
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-white`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${TC.textPrimary}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-lg leading-relaxed ${TC.textSecondary}`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Overview Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${isLight ? "bg-blue-100 border-blue-500/30 text-blue-600" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"}`}>
              <Activity className="w-4 h-4" />
              <span className="text-sm font-semibold">
                LIVE MARKET
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Market Overview
              </span>
            </h2>
            <p className={`text-xl ${TC.textSecondary}`}>
              Real-time cryptocurrency prices and trends
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Inverted Triangle Layout */}
            <div className="flex flex-col items-center space-y-6 relative">
              {/* Top Row - Single Large Card (Bitcoin) */}
              <motion.div
                custom={0}
                initial="hidden"
                whileInView="visible"
                variants={coinCardVariants}
                viewport={{ once: true }}
                className={`rounded-3xl p-8 transition-all duration-500 hover:scale-105 group w-full max-w-md ${TC.bgCoinCard} ${isLight ? "border-amber-500/60 shadow-lg" : "border-amber-500/30"}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Bitcoin className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-2xl font-bold ${TC.textPrimary}`}>Bitcoin</h3>
                      <span className={TC.textCoinSymbol}>BTC</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${TC.bgCoinLive}`}>
                        Live
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`text-3xl font-bold ${TC.textPriceMain}`}>
                        {formatPrice(livePrices.bitcoin.price)}
                      </p>
                      <span
                        className={`text-lg font-semibold ${getChangeColor(
                          livePrices.bitcoin.change
                        )} flex items-center gap-1`}
                      >
                        {getChangeIcon(livePrices.bitcoin.change)}
                        {livePrices.bitcoin.change >= 0 ? "+" : ""}
                        {livePrices.bitcoin.change?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Middle Row - Two Medium Cards */}
              <div className="flex gap-6 justify-center w-full max-w-2xl">
                <motion.div
                  custom={1}
                  initial="hidden"
                  whileInView="visible"
                  variants={coinCardVariants}
                  viewport={{ once: true }}
                  className={`rounded-2xl p-6 transition-all duration-500 hover:scale-105 group flex-1 ${TC.bgCoinCard} ${isLight ? "border-purple-500/60 shadow-md" : "border-purple-500/30"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Circle className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-xl font-bold ${TC.textPrimary}`}>
                          Ethereum
                        </h3>
                        <span className={TC.textCoinSymbol}>ETH</span>
                      </div>
                      <p className={`text-2xl font-bold mb-1 ${TC.textPriceSecondary}`}>
                        {formatPrice(livePrices.ethereum.price)}
                      </p>
                      <span
                        className={`text-sm font-semibold ${getChangeColor(
                          livePrices.ethereum.change
                        )} flex items-center gap-1`}
                      >
                        {getChangeIcon(livePrices.ethereum.change)}
                        {livePrices.ethereum.change >= 0 ? "+" : ""}
                        {livePrices.ethereum.change?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  custom={2}
                  initial="hidden"
                  whileInView="visible"
                  variants={coinCardVariants}
                  viewport={{ once: true }}
                  className={`rounded-2xl p-6 transition-all duration-500 hover:scale-105 group flex-1 ${TC.bgCoinCard} ${isLight ? "border-pink-500/60 shadow-md" : "border-pink-500/30"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Coins className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-xl font-bold ${TC.textPrimary}`}>Solana</h3>
                        <span className={TC.textCoinSymbol}>SOL</span>
                      </div>
                      <p className={`text-2xl font-bold mb-1 ${TC.textPriceTertiary}`}>
                        {formatPrice(livePrices.solana.price)}
                      </p>
                      <span
                        className={`text-sm font-semibold ${getChangeColor(
                          livePrices.solana.change
                        )} flex items-center gap-1`}
                      >
                        {getChangeIcon(livePrices.solana.change)}
                        {livePrices.solana.change >= 0 ? "+" : ""}
                        {livePrices.solana.change?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Row - Two Small Cards */}
              <div className="flex gap-4 justify-center w-full max-w-3xl">
                {[
                  {
                    coin: "cardano",
                    name: "Cardano",
                    symbol: "ADA",
                    color: "from-blue-500 to-blue-600",
                    icon: <Activity className="w-6 h-6 text-white" />,
                  },
                  {
                    coin: "dogecoin",
                    name: "Dogecoin",
                    symbol: "DOGE",
                    color: "from-yellow-500 to-amber-600",
                    icon: <DollarSign className="w-6 h-6 text-white" />,
                  },
                ].map((crypto, index) => (
                  <motion.div
                    key={crypto.coin}
                    custom={3 + index}
                    initial="hidden"
                    whileInView="visible"
                    variants={coinCardVariants}
                    viewport={{ once: true }}
                    className={`rounded-xl p-4 transition-all duration-500 hover:scale-105 group flex-1 max-w-[200px] ${TC.bgCoinCard} ${isLight ? "border-gray-500 shadow-sm" : "border-gray-600"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${crypto.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {crypto.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className={`text-sm font-bold ${TC.textPrimary}`}>
                            {crypto.name}
                          </h3>
                          <span className={TC.textCoinSymbol}>
                            {crypto.symbol}
                          </span>
                        </div>
                        <p className={`text-lg font-bold mb-1 ${TC.textPriceSmall}`}>
                          {formatPrice(livePrices[crypto.coin].price)}
                        </p>
                        <span
                          className={`text-xs font-semibold ${getChangeColor(
                            livePrices[crypto.coin].change
                          )} flex items-center gap-1`}
                        >
                          {getChangeIcon(livePrices[crypto.coin].change)}
                          {livePrices[crypto.coin].change >= 0 ? "+" : ""}
                          {livePrices[crypto.coin].change?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side - Animation */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative h-[500px] flex items-center justify-center"
            >
              <Lottie
                animationData={crypto}
                loop
                className="w-full h-full opacity-70"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 relative">
        <div className="">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${isLight ? "bg-blue-100 border-blue-500/30 text-blue-600" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"}`}>
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">
                COMMUNITY LOVE
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                What Our Traders Say
              </span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${TC.textSecondary}`}>
              Join thousands of successful traders who trust NexChain for their
              cryptocurrency journey
            </p>
          </motion.div>

          <TestimonialCarousel TC={TC} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`rounded-3xl p-12 text-center relative overflow-hidden ${TC.bgCTA}`}
          >
            {/* Background Effects */}
            <div className={`absolute inset-0 ${isLight ? "bg-blue-500/5" : "bg-gradient-to-r from-cyan-500/5 to-purple-500/5"}`}></div>
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl ${isLight ? "bg-blue-500/10" : "bg-cyan-500/10"}`}></div>
            <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl ${isLight ? "bg-purple-500/10" : "bg-purple-500/10"}`}></div>
            <div className="relative z-10">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300 ${TC.textPrimary}`}>
                Ready to Start Your Crypto Journey?
              </h2>
              <p className={`text-lg mb-8 max-w-md mx-auto ${TC.textSecondary}`}>
                Join the smart traders who trust NexChain for their
                cryptocurrency success
              </p>
              <button
                onClick={() => navigate("/auth")}
                className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-110 relative overflow-hidden group/btn ${TC.btnPrimary}`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative">Get Started for Free</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}