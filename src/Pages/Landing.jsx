import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  ChevronRight,
  TrendingUp,
  Shield,
  BookOpen,
  Zap,
  ArrowDown,
} from "lucide-react";
import Lottie from "lottie-react";
import cryptoAnim from "../assets/cryptobitcoin.json";
import crypto from "../assets/Cryptocurrency.json";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import useCoinContext from "@/Context/CoinContext/useCoinContext";

// Mock Testimonial Context (replace with your actual context)
const testimonials = [
  {
    id: 1,
    type: "praise",
    name: "Sarah Mitchell",
    avatar: "SM",
    message:
      "NexChain has been an incredible platform for tracking my crypto investments. The real-time data and beautiful interface keep me coming back!",
    timestamp: "Oct 25, 2024",
    rating: 5,
  },
  {
    id: 2,
    type: "suggestion",
    name: "Marcus Chen",
    avatar: "MC",
    message:
      "I love the learning hub! It would be great to see more advanced trading strategies covered in the future.",
    timestamp: "Oct 20, 2024",
    rating: 4,
  },
  {
    id: 3,
    type: "praise",
    name: "Emily Rodriguez",
    avatar: "ER",
    message:
      "The demo trading feature is a game-changer for beginners. I was able to practice without risking real money. Highly recommend!",
    timestamp: "Oct 18, 2024",
    rating: 5,
  },
  {
    id: 4,
    type: "praise",
    name: "David Thompson",
    avatar: "DT",
    message:
      "As a crypto newbie, the educational content helped me understand complex concepts easily. The market tracking is spot on!",
    timestamp: "Oct 15, 2024",
    rating: 5,
  },
  {
    id: 5,
    type: "suggestion",
    name: "Priya Sharma",
    avatar: "PS",
    message:
      "Would love to see more altcoins added to the platform. Overall, great experience with real-time updates.",
    timestamp: "Oct 12, 2024",
    rating: 4,
  },
  {
    id: 6,
    type: "bug",
    name: "Alex Johnson",
    avatar: "AJ",
    message:
      "Found a minor issue with the portfolio export feature. Support team was quick to respond and fix it!",
    timestamp: "Oct 10, 2024",
    rating: 4,
  },
];

const TestimonialCard = ({ testimonial }) => {
  const getAvatarColor = (type) => {
    switch (type) {
      case "praise":
        return "from-emerald-400 to-teal-400";
      case "suggestion":
        return "from-amber-400 to-orange-400";
      case "bug":
        return "from-red-400 to-rose-400";
      default:
        return "from-cyan-400 to-blue-400";
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "praise":
        return {
          bg: "bg-green-500/20",
          text: "text-green-400",
          label: "Praise",
        };
      case "suggestion":
        return {
          bg: "bg-yellow-500/20",
          text: "text-yellow-400",
          label: "Suggestion",
        };
      case "bug":
        return {
          bg: "bg-red-500/20",
          text: "text-red-400",
          label: "Bug Report",
        };
      default:
        return {
          bg: "bg-blue-500/20",
          text: "text-blue-400",
          label: "Feedback",
        };
    }
  };

  const badge = getTypeBadge(testimonial.type);

  return (
    <div className="bg-[#161b22] border border-gray-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`text-sm transition-all duration-300 ${
              i < (testimonial.rating || 4)
                ? "text-yellow-400 fill-yellow-400 group-hover:scale-110"
                : "text-gray-600"
            }`}
            style={{ transitionDelay: `${i * 50}ms` }}
          />
        ))}
      </div>

      {/* Quote */}
      <div className="relative mb-4">
        <svg
          className="text-cyan-400/20 w-6 h-6 mb-2"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
        <p className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
          {testimonial.message}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700 group-hover:border-gray-600 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 bg-gradient-to-r ${getAvatarColor(
              testimonial.type
            )} rounded-full flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform duration-300 shadow-lg`}
          >
            {testimonial.avatar || "AU"}
          </div>
          <div>
            <p className="text-white text-sm font-medium group-hover:text-cyan-400 transition-colors duration-300">
              {testimonial.name || "Anonymous User"}
            </p>
            <p className="text-gray-400 text-xs">{testimonial.timestamp}</p>
          </div>
        </div>
        <div
          className={`${badge.bg} ${badge.text} px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 group-hover:scale-105`}
        >
          {badge.label}
        </div>
      </div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("NEXCHAIN_USER_TOKEN");
  const { coins } = useCoinContext();

  const [livePrices, setLivePrices] = useState({
    bitcoin: { price: 64213, change: 2.34 },
    ethereum: { price: 3480, change: 1.56 },
    solana: { price: 145.56, change: -0.89 },
  });

  const [showAllTestimonials, setShowAllTestimonials] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Update live prices from coin context
  useEffect(() => {
    if (coins && coins.length > 0) {
      const bitcoin = coins.find((coin) => coin.id === "bitcoin");
      const ethereum = coins.find((coin) => coin.id === "ethereum");
      const solana = coins.find((coin) => coin.id === "solana");

      setLivePrices({
        bitcoin: {
          price: bitcoin?.current_price || 64213,
          change: bitcoin?.price_change_percentage_24h || 2.34,
        },
        ethereum: {
          price: ethereum?.current_price || 3480,
          change: ethereum?.price_change_percentage_24h || 1.56,
        },
        solana: {
          price: solana?.current_price || 145.56,
          change: solana?.price_change_percentage_24h || -0.89,
        },
      });
    }
  }, [coins]);

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
    return change >= 0 ? "↗" : "↘";
  };

  const scrollToFeatures = () => {
    document.getElementById("features-section").scrollIntoView({
      behavior: "smooth",
    });
  };

  const toggleTestimonials = () => {
    setShowAllTestimonials(!showAllTestimonials);
  };

  // Determine which testimonials to show based on screen size and state
  const getTestimonialsToShow = () => {
    // Always show all testimonials on medium and large screens
    if (window.innerWidth >= 768) {
      return testimonials;
    }
    // On small screens, show 3 initially, then all when showAllTestimonials is true
    return showAllTestimonials ? testimonials : testimonials.slice(0, 3);
  };

  return (
    <div className="bg-gradient-to-br from-black via-[#0b182d] to-black text-white">
      {/* Full Screen Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Lottie Animation */}
            <div className="relative">
              <div className="w-full aspect-square max-w-lg mx-auto relative">
                <Lottie
                  animationData={cryptoAnim}
                  loop
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-center md:text-left space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-6xl font-extrabold leading-tight"
              >
                Welcome to{" "}
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate("/dashboard")}
                >
                  NexChain
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-300"
              >
                Track, Trade & Learn Crypto — all in one platform.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-gray-400"
              >
                Monitor real-time market data, demo trade with virtual wallets,
                explore crypto terms, and stay updated with live news.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              >
                <button
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Get Started
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    navigate(isLoggedIn ? "/learning" : "/public-learning")
                  }
                  className="border-2 border-cyan-500 hover:bg-cyan-500/10 text-cyan-400 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Explore Learning Hub
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator - Hidden on medium and small screens */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer hidden lg:block"
          onClick={scrollToFeatures}
        >
          <div className="flex flex-col items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
            <span className="text-sm font-medium">Explore More</span>
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
      <section
        id="features-section"
        className="min-h-screen flex items-center py-20"
      >
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Why Choose NexChain?
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 text-lg"
            >
              Everything you need in one powerful platform
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] p-8 rounded-2xl border border-cyan-500/30 hover:border-cyan-500 transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Real-Time Tracking
              </h3>
              <p className="text-gray-400">
                Monitor live cryptocurrency prices and market movements with
                instant updates.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] p-8 rounded-2xl border border-purple-500/30 hover:border-purple-500 transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Safe Demo Trading
              </h3>
              <p className="text-gray-400">
                Practice trading strategies with virtual money before risking
                real capital.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] p-8 rounded-2xl border border-green-500/30 hover:border-green-500 transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Learning Hub
              </h3>
              <p className="text-gray-400">
                Master crypto fundamentals with our comprehensive educational
                resources.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compact Market Overview Section */}
      <section className="min-h-screen flex items-center py-20 relative">
        {/* Small Background Animation */}
        <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
          <Lottie
            animationData={crypto}
            loop
            className="w-full h-full scale-50"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full mb-4">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-semibold">
                  LIVE UPDATES
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Market Overview
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Real-time cryptocurrency prices and market movements
              </p>
            </motion.div>
          </div>

          {/* Horizontal Coin Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {/* Bitcoin */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-[#161b22] to-[#0d1117] p-6 rounded-2xl border border-cyan-500/30 hover:border-cyan-500 transition-all duration-300 hover:scale-105 group shadow-xl text-center"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">₿</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Bitcoin</h3>
              <p className="text-gray-400 text-sm mb-4">BTC</p>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400 mb-2">
                  {formatPrice(livePrices.bitcoin.price)}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-sm font-semibold ${getChangeColor(
                      livePrices.bitcoin.change
                    )}`}
                  >
                    {getChangeIcon(livePrices.bitcoin.change)}{" "}
                    {Math.abs(livePrices.bitcoin.change)?.toFixed(2) || "0.00"}%
                  </span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Ethereum */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-[#161b22] to-[#0d1117] p-6 rounded-2xl border border-purple-500/30 hover:border-purple-500 transition-all duration-300 hover:scale-105 group shadow-xl text-center"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">◆</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Ethereum</h3>
              <p className="text-gray-400 text-sm mb-4">ETH</p>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400 mb-2">
                  {formatPrice(livePrices.ethereum.price)}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-sm font-semibold ${getChangeColor(
                      livePrices.ethereum.change
                    )}`}
                  >
                    {getChangeIcon(livePrices.ethereum.change)}{" "}
                    {Math.abs(livePrices.ethereum.change)?.toFixed(2) || "0.00"}
                    %
                  </span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Solana */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-[#161b22] to-[#0d1117] p-6 rounded-2xl border border-pink-500/30 hover:border-pink-500 transition-all duration-300 hover:scale-105 group shadow-xl text-center"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">◎</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Solana</h3>
              <p className="text-gray-400 text-sm mb-4">SOL</p>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-400 mb-2">
                  {formatPrice(livePrices.solana.price)}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-sm font-semibold ${getChangeColor(
                      livePrices.solana.change
                    )}`}
                  >
                    {getChangeIcon(livePrices.solana.change)}{" "}
                    {Math.abs(livePrices.solana.change)?.toFixed(2) || "0.00"}%
                  </span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="min-h-screen flex items-center py-20">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
                  What Our Users Say
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Real feedback from our community of crypto enthusiasts and
                traders
              </p>
            </motion.div>

            {/* Testimonials Grid - Different behavior based on screen size */}
            <div className="hidden md:block">
              {/* Desktop/Tablet: Always show all 6 testimonials */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    variants={fadeInUp}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Mobile: Show 3 initially, then all when showAllTestimonials is true */}
            <div className="block md:hidden">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                className="grid grid-cols-1 gap-6"
              >
                {getTestimonialsToShow().map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    variants={fadeInUp}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Show More/Less Button - Only show on mobile */}
              {testimonials.length > 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-center mt-8"
                >
                  <button
                    onClick={toggleTestimonials}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    {showAllTestimonials
                      ? "Show Less"
                      : `Show More`}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="min-h-screen flex items-center py-20">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-3xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Crypto Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust NexChain for their
              cryptocurrency needs
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-xl shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105"
            >
              Get Started for Free
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
