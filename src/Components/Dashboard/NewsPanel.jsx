import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useMemo, useState, useEffect } from "react";
import { FaNewspaper, FaClock, FaFire } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getData } from "@/api/axiosConfig";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2069&auto=format&fit=crop";

export default function NewsPanel() {
  const isLight = useThemeCheck();
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // GET /news -> calls http://localhost:5000/api/news
        const data = await getData("/news");

        // Data is likely an array directly if backend returns res.json(response.data.Data) which is an array
        // We need to map it to our UI structure
        if (Array.isArray(data)) {
          const formatted = data.slice(0, 10).map((item) => ({
            id: item.id,
            title: item.title,
            image: item.imageurl || FALLBACK_IMAGE,
            source: item.source_info?.name || item.source,
            time: formatTimeAgo(item.published_on),
            link: item.url,
          }));
          setNewsData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Unable to load latest news.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = Date.now();
    // API returns unix timestamp in seconds, convert to ms
    const diff = now - (timestamp * 1000);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const navigate = useNavigate();

  const TC = useMemo(
    () => ({
      bgContainer: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 glass-card",
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      textSource: isLight ? "text-cyan-600" : "text-cyan-400",
      bgItem: isLight
        ? "hover:bg-gray-50 border-b border-gray-100"
        : "hover:bg-white/5 border-b border-gray-700/50",
      iconColor: isLight ? "text-rose-500" : "text-rose-400", // Changed to rose for "Hot"
      bgIcon: isLight ? "bg-rose-100" : "bg-rose-500/10",
    }),
    [isLight],
  );

  return (
    <div
      className={`rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 ease-in-out hover:shadow-lg ${TC.bgContainer} h-full flex flex-col`}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${TC.bgIcon}`}>
            <FaFire className={TC.iconColor} />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent">
            Latest News
          </h2>
        </div>
        <button
          onClick={() => navigate("/news")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border ${isLight ? "border-gray-300 hover:bg-gray-100" : "border-gray-600 hover:bg-gray-700"} ${TC.textSecondary}`}
        >
          View All
        </button>
      </div>

      <div
        data-lenis-prevent
        className="flex flex-col gap-1.5 overflow-y-auto flex-1 custom-scrollbar pr-1"
      >
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex gap-4 p-2">
              <Skeleton baseColor={isLight ? "#e5e7eb" : "#374151"} highlightColor={isLight ? "#f3f4f6" : "#4b5563"} width={48} height={48} borderRadius="0.5rem" />
              <div className="flex-1">
                <Skeleton baseColor={isLight ? "#e5e7eb" : "#374151"} highlightColor={isLight ? "#f3f4f6" : "#4b5563"} count={2} />
                <Skeleton baseColor={isLight ? "#e5e7eb" : "#374151"} highlightColor={isLight ? "#f3f4f6" : "#4b5563"} width="40%" className="mt-2" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className={`text-center py-10 text-sm ${TC.textSecondary}`}>
            {error}
          </div>
        ) : (
          newsData.slice(0, 5).map((news, index) => (
            <a
              key={news.id}
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                group flex items-start gap-2 p-2 rounded-xl transition-all duration-200 cursor-pointer
                ${isLight ? "hover:shadow-sm" : ""}
                ${index !== 4 ? TC.bgItem : "hover:bg-gray-50 dark:hover:bg-white/5"}
              `}
            >
              <div className="relative w-10 h-10 sm:w-14 sm:h-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">
                <img
                  src={news.image}
                  alt={news.title}
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[2.5rem] sm:h-auto gap-1">
                <h3
                  className={`font-semibold text-[11px] sm:text-xs leading-snug line-clamp-2 ${TC.textPrimary} group-hover:text-cyan-500 transition-colors`}
                >
                  {news.title}
                </h3>

                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider ${TC.textSource}`}
                  >
                    {news.source}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-[9px] ${TC.textSecondary}`}
                  >
                    <FaClock className="text-[9px]" />
                    {news.time}
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
