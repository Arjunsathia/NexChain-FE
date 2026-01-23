import React, { useEffect, useState, useMemo } from "react";
import { getData } from "@/api/axiosConfig";
import useThemeCheck from "@/hooks/useThemeCheck";
import { FaNewspaper, FaSearch, FaClock, FaExternalLinkAlt, FaFire } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2069&auto=format&fit=crop";

export default function NewsPage() {
    const isLight = useThemeCheck();
    const [news, setNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const data = await getData("/news");
                if (Array.isArray(data)) {
                    // Map raw data to UI format
                    const formatted = data.map((item) => ({
                        id: item.id,
                        title: item.title,
                        body: item.body,
                        image: item.imageurl || FALLBACK_IMAGE,
                        source: item.source_info?.name || item.source,
                        time: item.published_on, // Keep as timestamp for sorting if needed
                        timeAgo: formatTimeAgo(item.published_on),
                        link: item.url,
                        categories: item.categories ? item.categories.split("|") : [],
                    }));
                    setNews(formatted);
                    setFilteredNews(formatted);
                } else {
                    console.error("News API returned non-array data:", data);
                    // Determine what went wrong
                    const debugInfo = typeof data === 'object' ? JSON.stringify(data).slice(0, 100) : String(data);

                    if (data?.error) throw new Error(data.error);
                    throw new Error(`Invalid news data format. Received: ${typeof data} (${debugInfo})`);
                }
            } catch (err) {
                console.error("Failed to fetch news:", err);
                // Show the actual error message to help debugging
                const errorMessage = err.response?.data?.error || err.message || "Failed to load news feed.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchNews();
    }, []);

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return "";
        const now = Date.now();
        const diff = now - timestamp * 1000;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    // Filter Logic
    useEffect(() => {
        let result = news;

        // Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (item) =>
                    item.title.toLowerCase().includes(lowerQuery) ||
                    item.body.toLowerCase().includes(lowerQuery) ||
                    item.source.toLowerCase().includes(lowerQuery)
            );
        }

        // Category Filter
        if (activeCategory !== "All") {
            result = result.filter((item) =>
                item.categories.includes(activeCategory)
            );
        }

        setFilteredNews(result);
    }, [searchQuery, activeCategory, news]);

    // Extract unique categories for filter tabs
    const categories = useMemo(() => {
        const all = new Set(news.flatMap((item) => item.categories));
        const popular = ["BTC", "ETH", "ALTCOIN", "BUSINESS", "TECHNOLOGY"];
        // Prioritize popular ones, then others
        const filtered = Array.from(all).filter((c) => !popular.includes(c));
        return ["All", ...popular, ...filtered].slice(0, 10); // Limit tabs
    }, [news]);

    const TC = useMemo(
        () => ({
            bgHeader: isLight
                ? "sm:bg-white/80 sm:backdrop-blur-md sm:border sm:border-gray-100"
                : "sm:bg-gray-900/95 sm:backdrop-blur-none sm:border-b sm:border-gray-700/50 sm:isolation-isolate sm:prevent-seam",
            bgContainer: "", // Removed specific background
            cardBg: isLight
                ? "bg-white border-gray-200 shadow-sm hover:shadow-md"
                : "bg-[#1E2026] border-gray-800 hover:border-gray-700 hover:bg-[#252830]",
            textPrimary: isLight ? "text-gray-900" : "text-white",
            textSecondary: isLight ? "text-gray-500" : "text-gray-400",
            accentText: isLight ? "text-blue-600" : "text-cyan-400",
            inputBg: isLight
                ? "bg-white border-gray-200 focus:ring-blue-100"
                : "bg-[#1E2026] border-gray-800 focus:ring-cyan-900/20",
        }),
        [isLight]
    );

    return (
        <div className={`min-h-screen pb-20 pt-4 sm:pt-6`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div
                    className={`
                        sticky top-0 sm:top-2 z-40 
                        w-full mx-auto 
                        sm:rounded-xl sm:shadow-md
                        ${TC.bgHeader} 
                        transition-colors duration-300
                        p-0 mb-4 sm:mb-6 
                    `}
                >
                    <div className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                            {/* Logo/Title - Hidden on Mobile, Visible on Desktop */}
                            <div className="hidden sm:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                <div
                                    className={`p-1.5 sm:p-2 rounded-lg ${isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400"}`}
                                >
                                    <FaNewspaper className="text-base sm:text-lg" />
                                </div>
                                <div className="flex-1 sm:flex-none">
                                    <h1 className={`text-base sm:text-xl font-bold leading-none ${TC.textPrimary}`}>Crypto News</h1>
                                    <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${TC.textSecondary}`}>
                                        Latest market insights
                                    </p>
                                </div>
                            </div>

                            {/* Search Bar - Full width on mobile */}
                            <div className="relative w-full sm:w-64">
                                <FaSearch
                                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TC.textSecondary} text-xs sm:text-sm`}
                                />
                                <input
                                    type="text"
                                    placeholder="Search news..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border outline-none transition-all duration-200 text-sm ${isLight
                                        ? "bg-white border-gray-200 text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                        : "bg-gray-800 border-gray-700 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                                        }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories / Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border
                                ${activeCategory === cat
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                    : isLight
                                        ? "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        : "bg-[#1E2026] text-gray-400 border-gray-800 hover:bg-[#2B2F36] hover:text-white"
                                }
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* News Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {Array(9).fill(0).map((_, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden p-4 space-y-3 border border-transparent">
                                <Skeleton height={200} borderRadius="1rem" baseColor={isLight ? "#e5e7eb" : "#1f2937"} highlightColor={isLight ? "#f3f4f6" : "#374151"} />
                                <Skeleton count={2} baseColor={isLight ? "#e5e7eb" : "#1f2937"} highlightColor={isLight ? "#f3f4f6" : "#374151"} />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 font-semibold">{error}</p>
                    </div>
                ) : filteredNews.length === 0 ? (
                    <div className={`text-center py-20 ${TC.textSecondary}`}>
                        <p>No news found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredNews.map((item) => (
                            <a
                                key={item.id}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`
                                  group block sm:rounded-2xl overflow-hidden sm:border transition-all duration-300 h-full
                                  rounded-xl border
                                  flex flex-row sm:flex-col 
                                  items-start sm:items-stretch
                                  gap-3 sm:gap-0
                                  p-3 sm:p-0
                                  ${TC.cardBg}
                                `}
                            >
                                {/* Image Container */}
                                <div className="relative w-24 h-24 sm:w-full sm:h-48 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-none bg-gray-200 dark:bg-gray-800">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Categories - Hidden on mobile small view, shown on desktop */}
                                    <div className="absolute top-2 left-2 hidden sm:flex gap-2">
                                        {item.categories.slice(0, 2).map((cat, idx) => (
                                            <span key={idx} className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 sm:p-5 flex flex-col min-h-0 sm:min-h-[200px]">
                                    {/* Mobile Source/Time Header */}
                                    <div className="flex items-center justify-between mb-1.5 sm:mb-3 text-[10px] sm:text-xs">
                                        <span className={`font-bold uppercase tracking-wider ${TC.accentText} truncate max-w-[80px] sm:max-w-none`}>
                                            {item.source}
                                        </span>
                                        <span className={`flex items-center gap-1 ${TC.textSecondary} whitespace-nowrap`}>
                                            <FaClock size={10} />
                                            {item.timeAgo}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className={`text-sm sm:text-lg font-bold mb-1 sm:mb-3 leading-snug line-clamp-2 sm:line-clamp-3 group-hover:text-blue-500 transition-colors ${TC.textPrimary}`}>
                                        {item.title}
                                    </h3>

                                    {/* Body Text - Hidden on Mobile */}
                                    <p className={`hidden sm:block text-sm line-clamp-3 mb-4 flex-1 ${TC.textSecondary}`}>
                                        {item.body}
                                    </p>

                                    {/* Desktop Footer */}
                                    <div className={`hidden sm:flex pt-4 border-t ${isLight ? 'border-gray-100' : 'border-gray-700/50'} items-center justify-between text-xs font-semibold`}>
                                        <span className="flex items-center gap-1 group-hover:gap-2 transition-all text-blue-500">
                                            Read Full Story <FaExternalLinkAlt size={10} />
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
