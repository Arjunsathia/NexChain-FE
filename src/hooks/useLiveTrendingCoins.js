import { useState, useEffect, useCallback } from 'react';
import { getTrend, getTrendingCoinMarketData } from "@/api/coinApis";
import { useBinanceTicker } from './useBinanceTicker';

const FALLBACK_IDS = ["bitcoin", "ethereum", "binancecoin", "ripple", "solana", "cardano", "polkadot"];

export function useLiveTrendingCoins(limit = 10) {
  const [trendingCoins, setTrendingCoins] = useState(() => {
    try {
      const cached = localStorage.getItem("trendingCoins");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data && Array.isArray(parsed.data)) {
          return parsed.data;
        }
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Cache parse error", e);
    }
    return [];
  });

  const [loading, setLoading] = useState(() => trendingCoins.length === 0);
  const [error, setError] = useState(null);

  const fetchTrending = useCallback(async () => {
    const CACHE_KEY = "trendingCoins";
    const CACHE_DURATION = 5 * 60 * 1000;

    try {
      setError(null);
      
      // 1. Check Cache Validity
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (parsed.timestamp && (now - parsed.timestamp < CACHE_DURATION) && Array.isArray(parsed.data) && parsed.data.length > 0) {
             setTrendingCoins(parsed.data);
             setLoading(false);
             return; // EXIT EARLY
          }
        } catch(e) { /* ignore parse error */ }
      }

      setLoading(true);

      const trendData = await getTrend();
      let idsArray = [];
      if (trendData && Array.isArray(trendData.coins)) {
        idsArray = trendData.coins.map((coin) => coin.item.id);
      } else {
        throw new Error("Invalid trend data format");
      }

      // Slice to requested limit
      const marketData = await getTrendingCoinMarketData(idsArray.slice(0, limit));
      
      const toCache = {
          timestamp: Date.now(),
          data: marketData
      };
      
      setTrendingCoins(marketData);
      localStorage.setItem(CACHE_KEY, JSON.stringify(toCache));

    } catch (err) {
      console.warn("Trending Coins API failed, checking fallback cache or static list:", err.message);
      
      // Fallback Strategy:
      // 1. If we have OLD cache, use it instead of crashing, even if expired.
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
           try {
               const parsed = JSON.parse(cached);
               if(Array.isArray(parsed.data)) {
                  setTrendingCoins(parsed.data);
                  setLoading(false);
                  return;
               }
           } catch(e) {}
      }

      // 2. If no cache at all, try static fallback
      try {
        const marketData = await getTrendingCoinMarketData(FALLBACK_IDS.slice(0, limit));
        setTrendingCoins(marketData);
      } catch (fallbackErr) {
        console.warn("Fallback Trending Error:", fallbackErr.message);
        setError("Unable to load trending coins.");
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // WebSocket Logic reused
  const livePrices = useBinanceTicker();

  // Merge Data
  const safeTrendingCoins = Array.isArray(trendingCoins) ? trendingCoins : [];
  const coinsWithLive = safeTrendingCoins.map(c => {
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
