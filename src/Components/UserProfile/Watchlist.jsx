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
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    
    bgCard: isLight ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    
    
    bgIcon: isLight ? "bg-blue-100" : "bg-cyan-400/10",
    iconColor: isLight ? "text-blue-600" : "text-cyan-400",
    headerGradient: "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",

    
    bgSkeleton: isLight ? "bg-gray-200" : "bg-gray-700",

    
    bgItem: isLight ? "bg-gray-100/70 border-none hover:bg-gray-100 shadow-sm" : "bg-gray-700/30 border-none hover:bg-gray-700/50 shadow-inner",
    textItemHover: isLight ? "group-hover:text-blue-600" : "group-hover:text-cyan-300",
    textAmount: isLight ? "text-gray-800" : "text-gray-300",
    
    
    textPositive: isLight ? "text-green-700" : "text-green-400",
    textNegative: isLight ? "text-red-700" : "text-red-400",

    
    bgErrorIcon: isLight ? "bg-yellow-100" : "bg-yellow-500/10",
    textErrorIcon: isLight ? "text-yellow-700" : "text-yellow-500",
    
    
    btnAction: isLight ? "text-blue-600 hover:text-blue-500 bg-gray-100 hover:bg-gray-200 border-none shadow-sm" : "text-cyan-400 hover:text-cyan-300 bg-gray-700/50 hover:bg-gray-600/50 border-none shadow-inner",
    
    
    borderFooter: isLight ? "border-gray-300/50" : "border-gray-700/50",
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

  return (
    <div className={`${TC.bgCard} rounded-lg sm:rounded-xl p-3 sm:p-5 h-full flex flex-col fade-in`}>
      {}
      <div className="flex items-center justify-between mb-2 sm:mb-4 fade-in">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-lg ${TC.bgIcon}`}>
            <FaStar className={`${TC.iconColor} text-base sm:text-lg`} />
          </div>
          <div>
            <h2 className={`text-base sm:text-lg font-bold ${TC.headerGradient}`}>
              Watchlist
            </h2>
            <p className={`text-[10px] sm:text-xs ${TC.textSecondary}`}>
              {totalCoins} coin{totalCoins !== 1 ? 's' : ''} tracked
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 fade-in">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 ${TC.bgSkeleton} rounded-full animate-pulse`}></div>
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 ${TC.bgSkeleton} rounded w-20 animate-pulse`}></div>
                    <div className={`h-3 ${TC.bgSkeleton} rounded w-16 animate-pulse`}></div>
                  </div>
                </div>
                <div className={`h-4 ${TC.bgSkeleton} rounded w-12 animate-pulse`}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 flex flex-col items-center justify-center gap-3 h-full fade-in">
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
          <div className="text-center py-6 flex flex-col items-center justify-center gap-3 h-full fade-in">
            <div className={`p-3 rounded-full ${TC.bgIcon}`}>
              <FaStar className={`text-lg ${TC.iconColor}`} />
            </div>
            <p className={`${TC.textSecondary} text-sm`}>Your watchlist is empty</p>
            <button 
              onClick={() => navigate("/cryptolist")}
              className={`text-sm transition-all duration-200 px-4 py-2 rounded-lg ${TC.btnAction}`}
            >
              Add Coins
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {displayCoins.map((coin, index) => (
              <div
                key={coin.id}
                className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-200 cursor-pointer group fade-in ${TC.bgItem}`}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <img src={coin.image} alt={coin.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <div className="min-w-0 flex-1">
                    <span className={`font-semibold text-xs sm:text-sm transition-colors truncate block ${TC.textPrimary} ${TC.textItemHover}`}>
                      {coin.name}
                    </span>
                    <span className={`text-[10px] sm:text-xs uppercase ${TC.textSecondary}`}>
                      {coin.symbol}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-xs sm:text-sm ${
                    coin.price_change_percentage_24h >= 0 ? TC.textPositive : TC.textNegative
                  }`}>
                    {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(1)}%
                  </div>
                  <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium ${TC.textAmount}`}>
                    ${coin.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      {!loading && !error && displayCoins.length > 0 && totalCoins > 4 && (
        <div className={`flex items-center justify-between pt-2 mt-2 sm:pt-3 sm:mt-3 ${TC.borderFooter} text-[10px] sm:text-sm ${TC.textSecondary} fade-in`}>
          <span>Showing 4 of {totalCoins}</span>
          <button
            onClick={() => navigate("/watchlist")}
            className={`transition-all duration-200 flex items-center gap-1 text-[10px] sm:text-sm ${TC.textFooterLink}`}
          >
            View all
            <FaArrowRight className="text-[10px] sm:text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Watchlist;