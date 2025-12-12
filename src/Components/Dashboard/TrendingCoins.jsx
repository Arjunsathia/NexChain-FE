import React, { useEffect, useState, useRef, useMemo } from "react";
import { getTrend, getTrendingCoinMarketData } from "@/api/coinApis";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle, FaFire, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(
    !document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isLight;
};

function TrendingCoins() {
  const isLight = useThemeCheck();
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const ws = useRef(null);

  // 🔁 Fade-in mount effect for outer card (same as others)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 💡 Theme Classes Helper
  const TC = useMemo(
    () => ({
      // Main container: no border, strong shadow in light, glassy in dark
      bgContainer: isLight
        ? "bg-white shadow-sm sm:shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-gray-100"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border border-gray-800",

      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      textPricePositive: isLight ? "text-green-700" : "text-green-400",
      textPriceNegative: isLight ? "text-red-700" : "text-red-400",

      bgItem: isLight
        ? "bg-gray-100/50 border-gray-300 hover:bg-gray-100 hover:border-orange-600/30"
        : "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-orange-400/30",

      bgIcon: isLight ? "bg-orange-100" : "bg-orange-400/10",
      bgRank: (index) => {
        if (index === 0)
          return isLight
            ? "bg-yellow-100 text-yellow-700"
            : "bg-yellow-500/20 text-yellow-400";
        if (index === 1)
          return isLight
            ? "bg-gray-200 text-gray-700"
            : "bg-gray-500/20 text-gray-400";
        return isLight
          ? "bg-orange-100 text-orange-700"
          : "bg-orange-500/20 text-orange-400";
      },

      skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
      skeletonHighlight: isLight ? "#f3f4f6" : "#374151",

      // Footer & action buttons (orange variant)
      bgFooterButton: isLight
        ? "bg-gray-200 border-gray-300 hover:bg-orange-100/70 hover:border-orange-600"
        : "bg-gray-700/50 border-gray-600 hover:bg-orange-900/40 hover:border-orange-400",

      textAccent: isLight ? "text-orange-600" : "text-orange-400",
      textHoverAccent: isLight
        ? "group-hover:text-orange-700"
        : "group-hover:text-orange-300",

      // kept for compatibility if used anywhere else
      textRetry: isLight ? "text-orange-600" : "text-orange-400",

      borderFooter: isLight ? "border-gray-300" : "border-gray-700",
    }),
    [isLight]
  );

  const fetchTrending = async () => {
    try {
      setError(false);
      setLoading(true);
      const trendData = await getTrend();
      const idsArray = trendData.coins.map((coin) => coin.item.id);
      const marketData = await getTrendingCoinMarketData(idsArray.slice(0, 10));
      setTrendingCoins(marketData);
    } catch (err) {
      console.error("Trending Coins Error:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    if (trendingCoins.length === 0) return;

    const symbols = trendingCoins
      .map((coin) => {
        const symbolMap = {
          bitcoin: "btcusdt",
          ethereum: "ethusdt",
          binancecoin: "bnbusdt",
          ripple: "xrpusdt",
          cardano: "adausdt",
          solana: "solusdt",
          dogecoin: "dogeusdt",
          polkadot: "dotusdt",
          "matic-network": "maticusdt",
          litecoin: "ltcusdt",
          chainlink: "linkusdt",
          stellar: "xlmusdt",
          cosmos: "atomusdt",
          monero: "xmusdt",
          "ethereum-classic": "etcusdt",
          "bitcoin-cash": "bchusdt",
          filecoin: "filusdt",
          theta: "thetausdt",
          vechain: "vetusdt",
          tron: "trxusdt",
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
            btcusdt: "bitcoin",
            ethusdt: "ethereum",
            bnbusdt: "binancecoin",
            xrpusdt: "ripple",
            adausdt: "cardano",
            solusdt: "solana",
            dogeusdt: "dogecoin",
            dotusdt: "polkadot",
            maticusdt: "matic-network",
            ltcusdt: "litecoin",
            linkusdt: "chainlink",
            xlmusdt: "stellar",
            atomusdt: "cosmos",
            xmusdt: "monero",
            etcusdt: "ethereum-classic",
            bchusdt: "bitcoin-cash",
            filusdt: "filecoin",
            thetausdt: "theta",
            vetusdt: "vechain",
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

      ws.current.onerror = (error) => {
        console.error("Trending coins WebSocket error:", error);
      };

    } catch (error) {
      console.error("Trending coins WebSocket setup failed:", error);
    }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [trendingCoins]);

  const coinsWithLiveData = useMemo(
    () =>
      trendingCoins.map((coin) => {
        const livePriceData = livePrices[coin.id];
        if (livePriceData) {
          return {
            ...coin,
            current_price: livePriceData.current_price,
            price_change_percentage_24h:
              livePriceData.price_change_percentage_24h,
            hasLiveData: true,
          };
        }
        return {
          ...coin,
          hasLiveData: false,
        };
      }),
    [trendingCoins, livePrices]
  );

  // Show only first 5 coins unless showAll is true
  const displayedCoins = useMemo(
    () => (showAll ? coinsWithLiveData : coinsWithLiveData.slice(0, 5)),
    [coinsWithLiveData, showAll]
  );

  const handleCoinClick = (coin) => {
    navigate(`/coin/coin-details/${coin.id}`);
  };

  const handleRetry = () => {
    fetchTrending();
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div
      className={`
        rounded-lg md:rounded-2xl p-3 md:p-4 h-full flex flex-col fade-in
        ${TC.bgContainer}
        ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
      style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 fade-in">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${TC.bgIcon}`}>
            <FaFire
              className={
                isLight
                  ? "text-orange-600 text-sm"
                  : "text-orange-400 text-sm"
              }
            />
          </div>
          <h2 className="text-base font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Trending
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {loading && (
          <div className="space-y-2 h-full overflow-y-auto scrollbar-hide">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 fade-in"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton
                    circle
                    width={28}
                    height={28}
                    baseColor={TC.skeletonBase}
                    highlightColor={TC.skeletonHighlight}
                  />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton
                      width={50}
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
                  width={45}
                  height={12}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && (error || coinsWithLiveData.length === 0) && (
          <div className="text-center py-4 flex flex-col items-center justify-center gap-2 h-full fade-in">
            <div
              className={`p-2 rounded-full ${
                isLight ? "bg-yellow-100" : "bg-yellow-500/10"
              }`}
            >
              <FaExclamationTriangle
                className={
                  isLight
                    ? "text-yellow-600 text-base"
                    : "text-yellow-500 text-base"
                }
              />
            </div>
            <p className={`${TC.textSecondary} text-xs`}>
              {error ? "Failed to load trending" : "No trending data"}
            </p>
            {/* Try Again Button */}
            <button
              onClick={handleRetry}
              className={`
                text-xs transition-all duration-200 px-3 py-1.5 rounded-lg border mt-1 group
                ${TC.bgFooterButton} ${TC.textAccent} ${TC.textHoverAccent}
              `}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && coinsWithLiveData.length > 0 && (
          <div className="h-full overflow-y-auto scrollbar-hide space-y-1.5">
            {displayedCoins.map((coin, index) => (
              <div
                key={coin.id}
                className={`
                  flex items-center justify-between p-2 rounded-lg border
                  hover:border-orange-400/30 transition-all duration-200
                  cursor-pointer group fade-in ${TC.bgItem}
                `}
                onClick={() => handleCoinClick(coin)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-7 h-7 rounded-full group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`
                          font-semibold text-xs transition-colors truncate
                          ${TC.textPrimary}
                          ${
                            isLight
                              ? "group-hover:text-orange-600"
                              : "group-hover:text-orange-300"
                          }
                        `}
                      >
                        {coin.symbol.toUpperCase()}
                      </span>
                      {index < 3 && (
                        <span
                          className={`
                            text-xs px-1.5 py-0.5 rounded-full font-bold
                            ${TC.bgRank(index)}
                          `}
                        >
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`${TC.textSecondary} text-xs block truncate`}
                    >
                      {coin.name}
                    </span>
                  </div>
                </div>

                <div className="text-right min-w-[60px]">
                  <span
                    className={`font-bold text-xs ${
                      coin.price_change_percentage_24h > 0
                        ? TC.textPricePositive
                        : TC.textPriceNegative
                    }`}
                  >
                    {coin.price_change_percentage_24h > 0 ? "+" : ""}
                    {coin.price_change_percentage_24h?.toFixed(1)}%
                  </span>
                  <div
                    className={`${TC.textSecondary} text-xs mt-0.5 font-medium`}
                  >
                    $
                    {coin.current_price?.toLocaleString("en-IN", {
                      minimumFractionDigits:
                        coin.current_price < 1 ? 4 : 2,
                      maximumFractionDigits:
                        coin.current_price < 1 ? 6 : 2,
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && coinsWithLiveData.length > 0 && (
        <div
          className={`
            flex items-center justify-between pt-2 mt-2 border-t fade-in
            ${TC.borderFooter}
          `}
        >
          <div className="flex items-center gap-2">
            <span className={`${TC.textSecondary} text-xs`}>
              {showAll ? `All ${coinsWithLiveData.length}` : `Top 5`} trending
            </span>

            {/* Show Less/More Button */}
            <button
              onClick={toggleShowAll}
              className={`
                lg:hidden text-xs font-medium py-1 px-2 rounded border
                transition-all duration-200 group
                ${TC.bgFooterButton} ${TC.textAccent} ${TC.textHoverAccent}
              `}
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          </div>

          {/* Explore Button */}
          <button
            onClick={() => navigate("/cryptolist")}
            className={`
              flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg border
              transition-all duration-200 group
              ${TC.bgFooterButton} ${TC.textAccent} ${TC.textHoverAccent}
            `}
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

export default TrendingCoins;
