import { useState, useEffect, useCallback } from 'react';
import { getTrend, getTrendingCoinMarketData } from "@/api/coinApis";
import { useBinanceTicker } from './useBinanceTicker';

const FALLBACK_IDS = ["bitcoin", "ethereum", "binancecoin", "ripple", "solana", "cardano", "polkadot"];

export function useLiveTrendingCoins(limit = 10) {
  const [trendingCoins, setTrendingCoins] = useState(() => {
    try {
      const cached = localStorage.getItem("trendingCoins");
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error("Cache parse error", e);
    }
    return [];
  });

  const [loading, setLoading] = useState(() => trendingCoins.length === 0);
  const [error, setError] = useState(null);

  const fetchTrending = useCallback(async () => {
    try {
      setError(null);
      if (trendingCoins.length === 0) setLoading(true);

      const trendData = await getTrend();
      let idsArray = [];
      if (trendData && Array.isArray(trendData.coins)) {
        idsArray = trendData.coins.map((coin) => coin.item.id);
      } else {
        throw new Error("Invalid trend data format");
      }

      // Slice to requested limit
      const marketData = await getTrendingCoinMarketData(idsArray.slice(0, limit));
      setTrendingCoins(marketData);
      localStorage.setItem("trendingCoins", JSON.stringify(marketData));

    } catch (err) {
      console.warn("Trending Coins API failed, using fallback:", err.message);
      try {
        const marketData = await getTrendingCoinMarketData(FALLBACK_IDS.slice(0, limit));
        setTrendingCoins(marketData);
        localStorage.setItem("trendingCoins", JSON.stringify(marketData));
      } catch (fallbackErr) {
        console.warn("Fallback Trending Error:", fallbackErr.message);
        setError("Unable to load trending coins.");
      }
    } finally {
      setLoading(false);
    }
  }, [limit, trendingCoins.length]);

  useEffect(() => {
    fetchTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // WebSocket Logic reused
  const livePrices = useBinanceTicker(trendingCoins);

  // Merge Data
  const coinsWithLive = trendingCoins.map(c => {
    const live = livePrices[c.id];
    return {
      ...c,
      current_price: live?.current_price ?? c.current_price,
      price_change_percentage_24h: live?.price_change_percentage_24h ?? c.price_change_percentage_24h,
      price_change_24h: live?.price_change_24h ?? c.price_change_24h,
      price_change_percentage_24h_in_currency: live?.price_change_percentage_24h ?? c.price_change_percentage_24h
    };
  });

  return { coins: coinsWithLive, loading, error, refetch: fetchTrending };
}
