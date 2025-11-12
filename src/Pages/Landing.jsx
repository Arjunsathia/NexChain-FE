import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Zap,
  ArrowDown,
  Sparkles,
  Rocket,
  Target,
  Users,
  Award,
  Clock,
  BarChart3,
  Bitcoin,
  Coins,
  Circle,
  Activity,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import Lottie from "lottie-react";
import cryptoAnim from "../assets/cryptobitcoin.json";
import crypto from "../assets/Cryptocurrency.json";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

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

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-400 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 min-w-[300px] flex-shrink-0">
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 transition-all duration-300 ${
              i < testimonial.rating
                ? "text-yellow-400 fill-yellow-400 group-hover:scale-110"
                : "text-gray-600"
            }`}
            style={{ transitionDelay: `${i * 50}ms` }}
          />
        ))}
      </div>

      <p className="text-gray-200 text-sm leading-relaxed mb-3 line-clamp-3 group-hover:text-white transition-colors duration-300">
        "{testimonial.message}"
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            {testimonial.avatar}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">
              {testimonial.name}
            </p>
            <p className="text-cyan-400 text-xs">{testimonial.timestamp}</p>
          </div>
        </div>
        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
          Verified
        </div>
      </div>
    </div>
  );
};

const TestimonialCarousel = () => {
  const duplicatedTestimonials = [
    ...testimonials,
    ...testimonials,
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* Top Row - Left to Right */}
      <div className="relative py-4">
        <motion.div
          className="flex gap-6"
          animate={{
            x: [0, -1800],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard key={`top-${index}`} testimonial={testimonial} />
          ))}
        </motion.div>
      </div>

      {/* Bottom Row - Right to Left */}
      <div className="relative py-4">
        <motion.div
          className="flex gap-6"
          animate={{
            x: [-1800, 0],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={`bottom-${index}`}
              testimonial={testimonial}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("NEXCHAIN_USER_TOKEN");

  const [livePrices] = useState({
    bitcoin: { price: 64213, change: 2.34 },
    ethereum: { price: 3480, change: 1.56 },
    solana: { price: 145.56, change: -0.89 },
    cardano: { price: 0.48, change: 3.21 },
    dogecoin: { price: 0.12, change: -2.15 },
  });

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

  // const slideFromRight = {
  //   hidden: { opacity: 0, x: 200 },
  //   visible: {
  //     opacity: 1,
  //     x: 0,
  //     transition: {
  //       duration: 0.8,
  //       ease: "easeOut",
  //     },
  //   },
  // };

  // const slideFromLeft = {
  //   hidden: { opacity: 0, x: -200 },
  //   visible: {
  //     opacity: 1,
  //     x: 0,
  //     transition: {
  //       duration: 0.8,
  //       ease: "easeOut",
  //     },
  //   },
  // };

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
    return change >= 0 ? "text-green-400" : "text-red-400";
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
    <div className="bg-gradient-to-br from-black via-[#0b182d] to-black text-white min-h-screen overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
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
                {/* <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 text-sm font-semibold">
                    THE FUTURE OF CRYPTO TRADING
                  </span>
                </div> */}

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Welcome to{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                    NexChain
                  </span>
                </h1>

                <p className="text-xl text-gray-300 max-w-2xl">
                  Track, Trade & Master Crypto — All in one powerful platform
                  designed for modern traders.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => navigate("/auth")}
                    className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <span>Start Trading Now</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>

                  <button
                    onClick={() =>
                      navigate(isLoggedIn ? "/learning" : "/public-learning")
                    }
                    className="group border-2 border-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <span>Explore Learning Hub</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-400">
                  {/* <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>98% Success Rate</span>
                  </div> */}
                  {/* <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>24/7 Real-time Data</span>
                  </div> */}
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
          <div className="flex flex-col items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
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
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-8 hover:border-cyan-400 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10 h-full">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
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
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full mb-4">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold">
                LIVE MARKET
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Market Overview
              </span>
            </h2>
            <p className="text-xl text-gray-400">
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
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-500/30 rounded-3xl p-8 hover:border-amber-400 transition-all duration-500 hover:scale-105 group w-full max-w-md"
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Bitcoin className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">Bitcoin</h3>
                      <span className="text-gray-400 text-sm">BTC</span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                        Live
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-3xl font-bold text-amber-400">
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
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400 transition-all duration-500 hover:scale-105 group flex-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Circle className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">
                          Ethereum
                        </h3>
                        <span className="text-gray-400 text-xs">ETH</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-400 mb-1">
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
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border border-pink-500/30 rounded-2xl p-6 hover:border-pink-400 transition-all duration-500 hover:scale-105 group flex-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Coins className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">Solana</h3>
                        <span className="text-gray-400 text-xs">SOL</span>
                      </div>
                      <p className="text-2xl font-bold text-pink-400 mb-1">
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
                    className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-600 rounded-xl p-4 hover:border-cyan-400 transition-all duration-500 hover:scale-105 group flex-1 max-w-[200px]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${crypto.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {crypto.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="text-sm font-bold text-white">
                            {crypto.name}
                          </h3>
                          <span className="text-gray-400 text-xs">
                            {crypto.symbol}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-cyan-400 mb-1">
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
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full mb-4">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold">
                COMMUNITY LOVE
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                What Our Traders Say
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of successful traders who trust NexChain for their cryptocurrency journey
            </p>
          </motion.div>

          <TestimonialCarousel />
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
            className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Crypto Journey?
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
                Join the smart traders who trust NexChain for their
                cryptocurrency success
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105"
              >
                Get Started for Free
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}