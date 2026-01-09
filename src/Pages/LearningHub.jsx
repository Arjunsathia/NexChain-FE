import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useState, useMemo, useEffect } from "react";
import {
  FaGraduationCap,
  FaBook,
  FaChartLine,
  FaShieldAlt,
  FaRocket,
  FaPlay,
  FaArrowRight,
  FaSearch,
  FaBolt,
  FaClock,
  FaSignal,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// --- Mock Data ---
const MOCK_COURSES = [
  {
    id: 1,
    title: "Crypto Fundamentals",
    subtitle: "Start your journey here. Understand the core concepts.",
    category: "basics",
    duration: "2h 15m",
    lessons: 12,
    level: "Beginner",
    progress: 0,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    id: 2,
    title: "Technical Analysis",
    subtitle: "Master candlesticks, indicators, and market trends.",
    category: "trading",
    duration: "4h 30m",
    lessons: 18,
    level: "Intermediate",
    progress: 0,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  {
    id: 3,
    title: "Wallet Security",
    subtitle: "Essential security practices for every crypto investor.",
    category: "security",
    duration: "1h 45m",
    lessons: 8,
    level: "Beginner",
    progress: 0,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    id: 4,
    title: "Smart Contracts",
    subtitle: "Build your first dApp on Ethereum.",
    category: "advanced",
    duration: "6h 15m",
    lessons: 24,
    level: "Advanced",
    progress: 0,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
];

const CATEGORIES = [
  { id: "all", name: "Discover" },
  { id: "basics", name: "Basics" },
  { id: "trading", name: "Trading" },
  { id: "security", name: "Security" },
];

function LearningHub() {
  const isLight = useThemeCheck();
  const { isVisited, markVisited } = useVisitedRoutes();
  const location = useLocation();
  // Freeze validated state on mount
  const [hasVisited] = useState(() => isVisited(location.pathname));

  useEffect(() => {
    markVisited(location.pathname);
  }, [location.pathname, markVisited]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  // Instant load if visited, otherwise simulate loading
  const [loading, setLoading] = useState(!hasVisited);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasVisited) return;
    // Simulate data fetching delay matching other pages
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [hasVisited]);

  // Premium Styling Config
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textMuted: isLight ? "text-gray-400" : "text-gray-600",

      // Glass Cards (No solid backgrounds)
      cardBase: isLight
        ? "bg-white/60 backdrop-blur-md border border-gray-200"
        : "bg-white/5 backdrop-blur-md border border-white/10",

      cardHover: isLight
        ? "hover:bg-white hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/50"
        : "hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/20",

      accentGradient:
        "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500",

      // Skeleton Colors (Matches Watchlist)
      skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
      skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
    }),
    [isLight],
  );

  const filteredCourses = MOCK_COURSES.filter(
    (c) => selectedCategory === "all" || c.category === selectedCategory,
  );

  return (
    // No global background, fits into parent
    <div
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 font-sans ${hasVisited ? "" : `transition-all duration-300 ease-out transform-gpu ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}`}
    >
      {/* --- Hero: "Start Here" (Premium Banner) --- */}
      {!loading && selectedCategory === "all" && (
        <div
          className={`relative w-full rounded-3xl overflow-hidden mb-16 group cursor-pointer ${hasVisited ? "" : "animate-in fade-in slide-in-from-bottom-6 duration-700"}`}
        >
          {/* Abstract Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900"></div>
          <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-fixed"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-cyan-300 text-xs font-bold mb-4 backdrop-blur-sm">
                <FaBolt size={10} /> RECOMMENDED STARTER
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Crypto 101: <br />
                The Foundation
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Everything you need to know to start trading. From blockchain
                basics to setting up your first wallet securely.
              </p>

              <div className="flex items-center gap-4">
                <button className="px-8 py-3.5 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-cyan-50 transition-colors flex items-center gap-2">
                  <FaPlay size={12} /> Start Lesson 1
                </button>
                <span className="text-slate-400 text-sm font-medium">
                  12 Lessons • 2h 15m
                </span>
              </div>
            </div>

            {/* Visual Element (Glass Card inside Hero) */}
            <div className="hidden md:block">
              <div className="w-64 h-40 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-500">
                <FaRocket className="text-6xl text-white/20" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-1">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
              pb-3 text-sm font-medium transition-all relative whitespace-nowrap
              ${selectedCategory === cat.id ? TC.textPrimary : TC.textSecondary}
              hover:${TC.textPrimary}
            `}
            >
              {cat.name}
              {selectedCategory === cat.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar (Moved Here) */}
        <div className={`relative group w-full sm:w-64 mb-2 sm:mb-0`}>
          <input
            type="text"
            placeholder="Search topics..."
            className={`w-full py-2 px-4 pr-10 rounded-full text-sm outline-none transition-all duration-300
                 ${
                   isLight
                     ? "bg-gray-100 focus:bg-white focus:shadow-md border border-transparent focus:border-gray-200 text-gray-900 placeholder-gray-500"
                     : "bg-white/5 focus:bg-gray-900 focus:shadow-lg border border-white/5 focus:border-white/20 text-white placeholder-gray-500"
                 }
               `}
          />
          <FaSearch
            className={`absolute right-3.5 top-2.5 text-gray-400 group-focus-within:text-cyan-500 transition-colors`}
            size={14}
          />
        </div>
      </div>

      {/* --- Premium Grid --- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 h-[260px] flex flex-col justify-between ${TC.cardBase}`}
            >
              <div className="flex justify-between items-start">
                <Skeleton
                  circle
                  width={48}
                  height={48}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
                <Skeleton
                  width={60}
                  height={20}
                  borderRadius={6}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
              </div>
              <div className="space-y-3">
                <Skeleton
                  width="90%"
                  height={24}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
                <Skeleton
                  width="70%"
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/5">
                <Skeleton
                  width={80}
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
                <Skeleton
                  circle
                  width={32}
                  height={32}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${hasVisited ? "" : "animate-in fade-in slide-in-from-bottom-4 duration-500"}`}
        >
          {filteredCourses.map((course) => (
            <PremiumCard key={course.id} course={course} TC={TC} />
          ))}

          {/* "Coming Soon" Placeholder for visual balance */}
          <div
            className={`rounded-2xl border border-dashed ${isLight ? "border-gray-300" : "border-gray-800"} flex flex-col items-center justify-center p-8 text-center opacity-60 h-full min-h-[260px]`}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <span className="text-xl">✨</span>
            </div>
            <p className={`text-sm font-medium ${TC.textPrimary}`}>
              More coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Components ---

const PremiumCard = ({ course, TC }) => {
  return (
    <div
      className={`
      group relative rounded-2xl p-6 transition-all duration-500 ease-out cursor-pointer
      ${TC.cardBase} ${TC.cardHover}
      flex flex-col h-full min-h-[260px]
    `}
    >
      {/* Icon Top Right */}
      <div className="flex justify-between items-start mb-12">
        <div className={`p-3 rounded-2xl ${course.bg} ${course.border} border`}>
          {course.category === "basics" && (
            <FaGraduationCap className={course.color} size={20} />
          )}
          {course.category === "trading" && (
            <FaChartLine className={course.color} size={20} />
          )}
          {course.category === "security" && (
            <FaShieldAlt className={course.color} size={20} />
          )}
          {course.category === "advanced" && (
            <FaRocket className={course.color} size={20} />
          )}
        </div>

        {/* Level Badge */}
        <span
          className={`text-[10px] font-bold tracking-widest uppercase py-1 px-2 rounded-md ${TC.textSecondary} bg-gray-100/50 dark:bg-gray-800/50`}
        >
          {course.level}
        </span>
      </div>

      {/* Info */}
      <div className="mt-auto">
        <h3
          className={`text-lg font-bold mb-1 ${TC.textPrimary} group-hover:text-cyan-500 transition-colors`}
        >
          {course.title}
        </h3>
        <p className={`text-sm ${TC.textSecondary} mb-6`}>{course.subtitle}</p>

        {/* Footer Meta */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <FaClock size={10} /> {course.duration}
          </div>

          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
            <FaArrowRight
              size={10}
              className="-rotate-45 group-hover:rotate-0 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningHub;
