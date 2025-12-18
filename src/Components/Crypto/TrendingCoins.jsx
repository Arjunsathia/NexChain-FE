import { getTrend, getTrendingCoinMarketData } from "@/api/coinApis";
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useThemeCheck from "@/hooks/useThemeCheck";

function TrendingCoins() {
  const isLight = useThemeCheck();
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const ws = useRef(null);
  const bufferRef = useRef({});

  const TC = useMemo(() => ({
    bgContainer: isLight 
      ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textAccentGreen: isLight ? "text-green-600" : "text-green-400",
    textAccentRed: isLight ? "text-red-600" : "text-red-500",
    textHover: isLight ? "hover:text-cyan-600" : "hover:text-cyan-400",
    borderList: isLight ? "border-gray-300" : "border-gray-700",
    textError: isLight ? "text-gray-600" : "text-gray-400",
    skeletonBase: isLight ? "#e5e7eb" : "#2c313c",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a404c",
  }), [isLight]);

  const fetchTrendingCoins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trendData = await getTrend();
      let idsArray = Array.isArray(trendData.coins)
        ? trendData.coins.slice(0, 5).map((coin) => coin.item.id)
        : [];

      if (idsArray.length === 0) {
         // Fallback to known majors if trend is empty
         idsArray = ["bitcoin", "ethereum", "binancecoin", "ripple", "solana"];
      }

      const marketData = await getTrendingCoinMarketData(idsArray);
      setCoins(marketData);
    } catch (err) {
      console.warn("Primary trending fetch failed, using fallback...", err);
      // Fallback mechanism
      try {
        const fallbackIds = ["bitcoin", "ethereum", "binancecoin", "ripple", "solana"];
        const marketData = await getTrendingCoinMarketData(fallbackIds);
        setCoins(marketData);
      } catch (fallbackErr) {
        console.error("Fallback failed", fallbackErr);
        setError("Unable to load trending coins.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingCoins();
  }, [fetchTrendingCoins]);

  // WebSocket Logic
  useEffect(() => {
    if (coins.length === 0) return;

    // Map coin IDs to Binance tickers
    const symbolMap = {
      bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt",
      cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt",
      "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt",
      stellar: "xlmusdt", cosmos: "atomusdt", monero: "xmusdt", "ethereum-classic": "etcusdt",
      "bitcoin-cash": "bchusdt", filecoin: "filusdt", theta: "thetausdt", vechain: "vetusdt",
      tron: "trxusdt", avalanche: "avaxusdt", shiba: "shibusdt", toncoin: "tonusdt"
    };
    
    // Reverse map for incoming data
    const symbolToId = Object.entries(symbolMap).reduce((acc, [key, val]) => {
      acc[val] = key;
      return acc;
    }, {});

    const streams = coins
      .map(c => symbolMap[c.id] ? `${symbolMap[c.id]}@ticker` : null)
      .filter(Boolean)
      .join('/');

    if (!streams) return;

    ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.data) {
        const stream = message.stream; // e.g., 'btcusdt@ticker'
        const symbol = stream.split('@')[0];
        const coinId = symbolToId[symbol];

        if (coinId) {
           bufferRef.current[coinId] = {
             price: parseFloat(message.data.c),
             change: parseFloat(message.data.P), // 24h change %
           };
        }
      }
    };

    // Buffer flush interval
    const interval = setInterval(() => {
      if (Object.keys(bufferRef.current).length > 0) {
        setLivePrices(prev => ({ ...prev, ...bufferRef.current }));
        bufferRef.current = {};
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      if (ws.current) ws.current.close();
    };
  }, [coins]);

  // Merge static data with live updates
  const displayedCoins = useMemo(() => {
    // 🛡️ Safety Guard
    if (!Array.isArray(coins)) return [];
    
    return coins.map(coin => {
      const live = livePrices[coin.id];
      return {
        ...coin,
        current_price: live ? live.price : coin.current_price,
        price_change_percentage_24h_in_currency: live ? live.change : coin.price_change_percentage_24h_in_currency || coin.price_change_percentage_24h
      };
    });
  }, [coins, livePrices]);

  return (
    <div className={`rounded-lg md:rounded-2xl p-3 md:p-6 fade-in ${TC.bgContainer} h-full flex flex-col`} style={{ animationDelay: "0.1s" }}>
      <h2 className={`text-lg font-semibold mb-4 ${TC.textPrimary} fade-in`} style={{ animationDelay: "0.2s" }}>
        🔥 Trending Coins
      </h2>

      {loading ? (
        <ul className="flex-1 flex flex-col justify-between">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <li
                key={index}
                className="flex justify-between items-center text-sm fade-in"
                style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
              >
                <Skeleton
                  width={150}
                  height={18}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
                <Skeleton
                  width={100}
                  height={18}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
              </li>
            ))}
        </ul>
      ) : error || displayedCoins.length === 0 ? (
        <div className={`text-center mt-4 flex flex-col items-center justify-center gap-2 fade-in ${TC.textError}`} style={{ animationDelay: "0.3s" }}>
          <FaExclamationTriangle className="text-3xl" />
          <p className="text-sm">{error || "No trending coins found."}</p>
        </div>
      ) : (
        <ul className="flex-1 flex flex-col justify-between">
          {displayedCoins.map((coin, index) => (
            <li
              key={coin.id}
              className={`flex justify-between items-center text-sm ${TC.textPrimary} border-b ${TC.borderList} last:border-b-0 pb-2 fade-in`}
              style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
            >
              <span
                className={`flex items-center gap-2 cursor-pointer ${TC.textHover} transition-colors`}
                onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-5 h-5 rounded-full"
                />
                {coin.name} ({coin.symbol.toUpperCase()})
              </span>

              <span
                className={
                  (coin.price_change_percentage_24h_in_currency || 0) < 0
                    ? `${TC.textAccentRed} font-semibold transition-colors duration-300`
                    : `${TC.textAccentGreen} font-semibold transition-colors duration-300`
                }
              >
                ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} (
                {coin.price_change_percentage_24h_in_currency?.toFixed(2)}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TrendingCoins;