import React, { useEffect, useState, useRef, useMemo } from "react";
import { getData } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import { FaStar, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";

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

function WatchlistPreview() {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const userId = user?.id;
  const [watchlistData, setWatchlistData] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const ws = useRef(null);
  const livePricesRef = useRef({});
  
  // 💡 Theme Classes Helper (UPDATED to include dedicated footer button classes)
  const TC = useMemo(() => ({
    bgContainer: isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-xl",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textPricePositive: isLight ? "text-green-700" : "text-green-400",
    textPriceNegative: isLight ? "text-red-700" : "text-red-400",
    bgItem: isLight ? "bg-gray-100/50 border-gray-300 hover:bg-gray-100 hover:border-cyan-600/30" : "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-cyan-400/30",
    bgIcon: isLight ? "bg-cyan-100" : "bg-cyan-500/10",
    textIcon: isLight ? "text-cyan-600" : "text-cyan-400",
    skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
    skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
    
    // START CHANGE: Dedicated Footer Button Classes (using light cyan hover)
    bgFooterButton: isLight 
      ? "bg-gray-200 border-gray-300 hover:bg-cyan-100/70 hover:border-cyan-500" // Light: Light cyan background with cyan border
      : "bg-gray-700/50 border-gray-600 hover:bg-cyan-900/40 hover:border-cyan-400", // Dark: Darker cyan transparent background with cyan border
    
    textFooterButton: isLight ? "text-cyan-600" : "text-cyan-400", // Base color
    textHoverAccent: isLight 
      ? "group-hover:text-cyan-700" // Light: Darker cyan text on hover
      : "group-hover:text-cyan-300", // Dark: Lighter cyan text on hover
    // END CHANGE
    
    borderFooter: isLight ? "border-gray-300" : "border-gray-700",
  }), [isLight]);


  useEffect(() => { livePricesRef.current = livePrices; }, [livePrices]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await getData("/watchlist", { user_id: userId });
        setWatchlistData(res || []);
      } catch (err) {
        console.error("Failed to fetch watchlist preview:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchWatchlist();
  }, [userId]);

  useEffect(() => {
    if (watchlistData.length === 0) return;

    const symbols = watchlistData
      .map((coin) => {
        const symbolMap = {
          bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt", cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt", "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt", stellar: "xlmusdt", cosmos: "atomusdt", monero: "xmusdt", "ethereum-classic": "etcusdt", "bitcoin-cash": "bchusdt", filecoin: "filusdt", theta: "thetausdt", vechain: "vetusdt", trxusdt: "trxusdt",
        };
        return symbolMap[coin.id] ? `${symbolMap[coin.id]}@ticker` : null;
      })
      .filter(Boolean);

    if (symbols.length === 0) return;

    const streams = symbols.join("/");

    try {
      ws.current = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${streams}`
      );

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.stream && message.data) {
          const symbol = message.stream.replace("@ticker", "");
          const coinData = message.data;

          const symbolToCoinId = {
            btcusdt: "bitcoin", ethusdt: "ethereum", bnbusdt: "binancecoin", xrpusdt: "ripple", adausdt: "cardano", solusdt: "solana", dogeusdt: "dogecoin", dotusdt: "polkadot", maticusdt: "matic-network", ltcusdt: "litecoin", linkusdt: "chainlink", xlmusdt: "stellar", atomusdt: "cosmos", xmusdt: "monero", etcusdt: "ethereum-classic", bchusdt: "bitcoin-cash", filusdt: "filecoin", thetausdt: "theta", vetusdt: "vechain", trxusdt: "tron",
          };

          const coinId = symbolToCoinId[symbol];

          if (coinId) {
            setLivePrices((prev) => ({
              ...prev,
              [coinId]: {
                current_price: parseFloat(coinData.c),
                price_change_percentage_24h: parseFloat(coinData.P),
                price_change_24h: parseFloat(coinData.p),
              },
            }));
          }
        }
      };
    } catch (err) { console.error("WS error:", err); }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [watchlistData]);

  const mergedCoins = useMemo(() => {
    return watchlistData
      .map((coin) => ({
        ...coin,
        ...(livePrices[coin.id] || {}),
      }))
      .filter(Boolean);
  }, [watchlistData, livePrices]);

  // Show only first 5 coins unless showAll is true
  const displayedCoins = useMemo(() => {
    return showAll ? mergedCoins : mergedCoins.slice(0, 5);
  }, [mergedCoins, showAll]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => window.location.reload(), 500);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div className={`rounded-xl p-4 h-full flex flex-col fade-in border ${TC.bgContainer}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 fade-in">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${TC.bgIcon}`}>
            <FaStar className={TC.textIcon + " text-sm"} />
          </div>
          <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
            Watchlist
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="space-y-2 h-full overflow-y-auto scrollbar-hide">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 fade-in">
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton
                    circle
                    width={32}
                    height={32}
                    baseColor={TC.skeletonBase}
                    highlightColor={TC.skeletonHighlight}
                  />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton
                      width={60}
                      height={12}
                      baseColor={TC.skeletonBase}
                      highlightColor={TC.skeletonHighlight}
                    />
                    <Skeleton
                      width={40}
                      height={10}
                      baseColor={TC.skeletonBase}
                      highlightColor={TC.skeletonHighlight}
                    />
                  </div>
                </div>
                <Skeleton
                  width={50}
                  height={12}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 flex flex-col items-center justify-center gap-2 h-full fade-in">
            <div className={`p-2 rounded-full ${isLight ? "bg-yellow-100" : "bg-yellow-500/10"}`}>
              <FaExclamationTriangle className={isLight ? "text-yellow-600 text-base" : "text-yellow-500 text-base"} />
            </div>
            <p className={`${TC.textSecondary} text-xs`}>Failed to load watchlist</p>
            {/* Try Again Button (Applying new hover classes) */}
            <button
              onClick={handleRetry}
              className={`text-xs transition-all duration-200 px-3 py-1.5 rounded-lg border mt-1 group ${TC.bgFooterButton} ${TC.textFooterButton} ${TC.textHoverAccent}`}
            >
              Try Again
            </button>
          </div>
        ) : mergedCoins.length === 0 ? (
          <div className="text-center py-4 flex flex-col items-center justify-center gap-2 h-full fade-in">
            <div className={`p-2 rounded-full ${TC.bgIcon}`}>
              <FaStar className={TC.textIcon + " text-base"} />
            </div>
            <p className={`${TC.textSecondary} text-xs`}>Your watchlist is empty</p>
            {/* Add Coins Button (Applying new hover classes) */}
            <button
              onClick={() => navigate("/cryptolist")}
              className={`text-xs transition-all duration-200 px-3 py-1.5 rounded-lg border mt-1 group ${TC.bgFooterButton} ${TC.textFooterButton} ${TC.textHoverAccent}`}
            >
              Add Coins
            </button>
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-hide space-y-1.5">
            {displayedCoins.map((coin) => (
              <div
                key={coin.id}
                className={`flex items-center justify-between p-2 rounded-lg border hover:border-cyan-400/30 transition-all duration-200 cursor-pointer group fade-in ${TC.bgItem}`}
                onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-7 h-7 rounded-full group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`font-semibold text-xs transition-colors truncate ${TC.textPrimary} ${isLight ? "group-hover:text-cyan-600" : "group-hover:text-cyan-300"}`}>
                        {coin.symbol.toUpperCase()}
                      </span>
                    </div>
                    <span className={`${TC.textSecondary} text-xs block truncate`}>
                      {coin.name}
                    </span>
                  </div>
                </div>

                <div className="text-right min-w-[60px]">
                  <span
                    className={`font-bold text-xs ${
                      coin.price_change_percentage_24h >= 0
                        ? TC.textPricePositive
                        : TC.textPriceNegative
                    }`}
                  >
                    {coin.price_change_percentage_24h?.toFixed(1)}%
                  </span>
                  <div className={`${TC.textSecondary} text-xs mt-0.5 font-medium`}>
                    $
                    {coin.current_price?.toLocaleString("en-IN", {
                      minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
                      maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && mergedCoins.length > 0 && (
        <div className={`flex items-center justify-between pt-2 mt-2 border-t fade-in ${TC.borderFooter}`}>
          <div className="flex items-center gap-2">
            <span className={`${TC.textSecondary} text-xs`}>
              {showAll ? `All ${mergedCoins.length}` : `Top 5`} coins
            </span>
            
            {/* Show Less/More Button (Applying new hover classes) */}
            <button
              onClick={toggleShowAll}
              className={`lg:hidden text-xs font-medium py-1 px-2 rounded border transition-all duration-200 group ${TC.bgFooterButton} ${TC.textFooterButton} ${TC.textHoverAccent}`}
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          </div>

          {/* Explore Button (Applying new hover classes) */}
          <button
            onClick={() => navigate("/watchlist")}
            className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all duration-200 group ${TC.bgFooterButton} ${TC.textFooterButton} ${TC.textHoverAccent}`}
          >
            Explore
            <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @media (max-width: 1024px) {
          .overflow-y-auto {
            max-height: 300px;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default WatchlistPreview;