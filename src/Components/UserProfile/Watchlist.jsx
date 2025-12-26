import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useEffect, useState, useMemo } from "react";
import { getData } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import { FaStar, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Watchlist() {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const userId = user?.id;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();


  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-400" : "text-gray-500",

    // Glassmorphism Card Style
    bgCard: isLight
      ? "bg-white/80 backdrop-blur-md shadow-md border border-white/40"
      : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

    // Icon & Header
    bgIcon: isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400", // Preserved Color
    iconColor: isLight ? "text-blue-600" : "text-cyan-400", // Preserved Color
    headerGradient: "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent", // Preserved Color

    bgSkeleton: isLight ? "bg-gray-200" : "bg-gray-700",

    // List Items - Refined for premium look
    bgItem: "transparent",
    bgItemHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",

    textItemHover: isLight ? "group-hover:text-blue-600" : "group-hover:text-cyan-300",
    textAmount: isLight ? "text-gray-800" : "text-gray-300",

    // textPositive: isLight ? "text-emerald-600" : "text-emerald-400",
    // textNegative: isLight ? "text-rose-600" : "text-rose-400",

    bgErrorIcon: isLight ? "bg-yellow-100" : "bg-yellow-500/10",
    textErrorIcon: isLight ? "text-yellow-700" : "text-yellow-500",

    btnAction: isLight ? "text-blue-600 hover:text-blue-500 bg-gray-100 hover:bg-gray-200 border-none shadow-sm" : "text-cyan-400 hover:text-cyan-300 bg-gray-700/50 hover:bg-gray-600/50 border-none shadow-inner",

    borderFooter: isLight ? "border-gray-200" : "border-gray-800",
    textFooterLink: isLight ? "text-blue-600 hover:text-blue-500" : "text-cyan-400 hover:text-cyan-300",

  }), [isLight]);


  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await getData("/watchlist", { user_id: userId });
        setData(res || []);
      } catch (err) {
        console.error("Failed to fetch watchlist:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchWatchlist();
  }, [userId]);

  const displayCoins = data.slice(0, 4);
  const totalCoins = data.length;

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (loading) {
    return (
      <div className={`${TC.bgCard} rounded-2xl p-5 h-[380px] flex flex-col`}>
        <div className="animate-pulse space-y-4 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 ${TC.bgSkeleton} rounded-xl`}></div>
            <div className="space-y-2 flex-1">
              <div className={`h-4 ${TC.bgSkeleton} rounded w-1/3`}></div>
              <div className={`h-3 ${TC.bgSkeleton} rounded w-1/4`}></div>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 ${TC.bgSkeleton} rounded-full`}></div>
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 ${TC.bgSkeleton} rounded w-20`}></div>
                    <div className={`h-3 ${TC.bgSkeleton} rounded w-16`}></div>
                  </div>
                </div>
                <div className={`h-4 ${TC.bgSkeleton} rounded w-12`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${TC.bgCard} rounded-2xl p-5 h-[380px] flex flex-col transition-all duration-300 relative overflow-hidden group`}>
      {/* Background Decorative Gradient (Matching Portfolio but tailored for Watchlist) */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-opacity duration-500 ${isLight ? 'opacity-100' : 'opacity-20'}`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${TC.bgIcon} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
            <FaStar className="text-lg" />
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${TC.textPrimary}`}>
              Watchlist
            </h2>
            <div className={`text-xs font-medium ${TC.textSecondary}`}>
              {totalCoins} coin{totalCoins !== 1 ? 's' : ''} tracked
            </div>
          </div>
        </div>
        {displayCoins.length > 0 && (
          <button
            onClick={() => navigate("/cryptolist")}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            + Add
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0 relative z-10">
        {error ? (
          <div className="text-center py-8 flex flex-col items-center justify-center gap-3 h-full">
            <div className={`p-3 rounded-full ${TC.bgErrorIcon}`}>
              <FaExclamationTriangle className={`text-lg ${TC.textErrorIcon}`} />
            </div>
            <p className={`${TC.textSecondary} text-sm`}>
              Failed to load watchlist
            </p>
            <button
              onClick={handleRetry}
              className={`text-sm transition-all duration-200 px-4 py-2 rounded-lg ${TC.btnAction}`}
            >
              Try Again
            </button>
          </div>
        ) : displayCoins.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 h-full">
            <div className="w-16 h-16 rounded-full bg-gray-100/50 flex items-center justify-center mb-3">
              <FaStar className="text-2xl text-gray-300" />
            </div>
            <p className={`text-sm font-medium ${TC.textSecondary}`}>Your watchlist is empty</p>
            <button
              onClick={() => navigate("/cryptolist")}
              className={`mt-3 text-sm transition-all duration-200 px-4 py-2 rounded-lg ${TC.btnAction}`}
            >
              Add Coins
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {displayCoins.map((coin, index) => (
              <div
                key={coin.id}
                className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer group/item ${TC.bgItemHover}`}
                style={{ animationDelay: `${0.1 * index}s` }}
                onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200 shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <span className={`text-sm font-bold block truncate ${TC.textPrimary} ${TC.textItemHover}`}>
                      {coin.name}
                    </span>
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${TC.textSecondary}`}>
                      {coin.symbol}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mb-0.5 ${coin.price_change_percentage_24h >= 0
                    ? (isLight ? 'bg-emerald-100/50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400')
                    : (isLight ? 'bg-rose-100/50 text-rose-600' : 'bg-rose-500/10 text-rose-400')
                    }`}>
                    {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(1)}%
                  </div>
                  <div className={`text-sm font-bold ${TC.textAmount}`}>
                    ${coin.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && displayCoins.length > 0 && totalCoins > 4 && (
        <div className={`flex items-center justify-between pt-3 mt-1 border-t ${TC.borderFooter} text-xs ${TC.textSecondary} shrink-0 relative z-10`}>
          <span>Showing 4 of {totalCoins}</span>
          <button
            onClick={() => navigate("/watchlist")}
            className={`transition-all duration-200 flex items-center gap-1 font-medium hover:underline ${TC.textFooterLink}`}
          >
            View all
            <FaArrowRight className="text-[10px]" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Watchlist;