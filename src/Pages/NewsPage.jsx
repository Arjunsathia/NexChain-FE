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
                    // If we get an object with error, show it
                    if (data?.error) throw new Error(data.error);
                    throw new Error("Invalid news data format received");
                }
            } catch (err) {
                console.error("Failed to fetch news:", err);
                setError("Failed to load news feed. Please try again later.");
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
        <div className={`min-h-screen pb-20 pt-6`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                {/* Header Section */}
                <div
                    className={`
                        sticky top-0 sm:top-2 z-40 
                        w-full mx-auto 
                        sm:rounded-xl sm:shadow-md
                        ${TC.bgHeader} 
                        transition-colors duration-300
                        p-0 mb-6 
                    `}
                >
                    <div className="px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                            <div className="hidden sm:flex items-center gap-3 w-full sm:w-auto">
                                <div
                                    className={`p-2 rounded-lg ${isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400"}`}
                                >
                                    <FaNewspaper className="text-lg" />
                                </div>
                                <div>
                                    <h1 className={`text-lg sm:text-xl font-bold leading-none ${TC.textPrimary}`}>Crypto News</h1>
                                    <p className={`text-[10px] sm:text-xs mt-1 ${TC.textSecondary}`}>
                                        Stay updated with the latest trends
                                    </p>
                                </div>
                            </div>

                            {/* Search Bar on the right */}
                            <div className="relative w-full sm:w-64">
                                <FaSearch
                                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TC.textSecondary} text-sm`}
                                />
                                <input
                                    type="text"
                                    placeholder="Search news..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border outline-none transition-all duration-200 text-sm ${isLight
                                        ? "bg-white border-gray-200 text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                        : "bg-gray-800 border-gray-700 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                                        }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories / Filters */}
                <div className="flex gap-2 overflow-x-auto pb-6 custom-scrollbar mb-4">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(9)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="rounded-2xl overflow-hidden p-4 space-y-3">
                                    <Skeleton height={200} borderRadius="1rem" baseColor={isLight ? "#e5e7eb" : "#1f2937"} highlightColor={isLight ? "#f3f4f6" : "#374151"} />
                                    <Skeleton count={2} baseColor={isLight ? "#e5e7eb" : "#1f2937"} highlightColor={isLight ? "#f3f4f6" : "#374151"} />
                                    <Skeleton width="60%" baseColor={isLight ? "#e5e7eb" : "#1f2937"} highlightColor={isLight ? "#f3f4f6" : "#374151"} />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNews.map((item) => (
                            <a
                                key={item.id}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`
                  group block rounded-2xl overflow-hidden border transition-all duration-300 h-full flex flex-col
                  ${TC.cardBg}
                `}
                            >
                                {/* Image Container */}
                                <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-800">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        {item.categories.slice(0, 2).map((cat, idx) => (
                                            <span key={idx} className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-3 text-xs">
                                        <span className={`font-bold uppercase tracking-wider ${TC.accentText}`}>
                                            {item.source}
                                        </span>
                                        <span className={`flex items-center gap-1 ${TC.textSecondary}`}>
                                            <FaClock size={10} />
                                            {item.timeAgo}
                                        </span>
                                    </div>

                                    <h3 className={`text-lg font-bold mb-3 leading-snug line-clamp-3 group-hover:text-blue-500 transition-colors ${TC.textPrimary}`}>
                                        {item.title}
                                    </h3>

                                    <p className={`text-sm line-clamp-3 mb-4 flex-1 ${TC.textSecondary}`}>
                                        {item.body}
                                    </p>

                                    <div className={`pt-4 border-t ${isLight ? 'border-gray-100' : 'border-gray-700/50'} flex items-center justify-between text-xs font-semibold`}>
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
