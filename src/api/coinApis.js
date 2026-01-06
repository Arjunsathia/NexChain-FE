import api, { coinGecko } from "./axiosConfig";

// --- Blacklist Cache System ---
let frozenCoinsCache = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

const ensureFrozenCache = async (force = false) => {
  if (!force && Date.now() - lastFetchTime < CACHE_DURATION && frozenCoinsCache.length > 0) return;
  try {
     const res = await api.get('/coins/frozen');
     if (res.data.success) {
       frozenCoinsCache = res.data.frozenIds || [];
       lastFetchTime = Date.now();
     }
  } catch (e) {
     console.warn("Failed to fetch frozen coins blacklist", e);
  }
};

// Exposed helper to force refresh (e.g., after Admin action)
export const refreshFrozenCache = async () => {
    await ensureFrozenCache(true);
};

export const getCoins = async (customParams = {}) => {
  try {
    const { includeFrozen, ...apiParams } = customParams;
    
    // Ensure we have the blacklist
    await ensureFrozenCache();

    const response = await coinGecko.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: true,
        price_change_percentage: "1h,24h,7d",
        ...apiParams,
      },
    });

    let coins = response.data;

    if (!Array.isArray(coins)) return [];

    // Mark frozen status
    coins = coins.map(c => ({
        ...c,
        isFrozen: frozenCoinsCache.includes(c.id)
    }));

    // Filter if not requested to include
    if (!includeFrozen) {
        coins = coins.filter(c => !c.isFrozen);
    }

    return coins;
  } catch (error) {
    console.error("Error fetching coins:", error.message);
    throw error;
  }
};


export const getTrend = async () => {
  try {
    await ensureFrozenCache();
    const response = await coinGecko.get("/search/trending");
    
    // Filter trending coins
    // Structure: response.data.coins is Array<{ item: { id: ... } }>
    const filteredCoins = (response.data.coins || []).filter(c => !frozenCoinsCache.includes(c.item.id));
    
    return { ...response.data, coins: filteredCoins };
  } catch (error) {
    console.error("Error fetching trending coins:", error.message);
    throw error;
  }
};


export const getTrendingCoinMarketData = async (idsArray) => {
  try {
    await ensureFrozenCache();
    
    // Filter IDs before requesting if possible, or after?
    // Let's filter after to ensure we don't break expected array length if that matters (it doesn't usually)
    // Actually, asking for a frozen ID might return data, but we shouldn't show it.
    
    const ids = idsArray.join(","); 
    const response = await coinGecko.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        ids,
        sparkline: true,
        price_change_percentage: "1h,24h,7d",
      },
    });
    
    // Filter result
    return response.data.filter(c => !frozenCoinsCache.includes(c.id));
  } catch (error) {
    console.error("Error fetching trending market data:", error.message);
    throw error;
  }
};


export const getTopGainers = async () => {
  try {
    await ensureFrozenCache();
    
    const response = await coinGecko.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      },
    });

    let data = response.data;
    if(Array.isArray(data)) {
        // Filter frozen
        data = data.filter(c => !frozenCoinsCache.includes(c.id));
        
        // Sort and slice
        const sorted = data.sort(
            (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
        );
        return sorted.slice(0, 5);
    }
    return [];

  } catch (error) {
    console.error("Error fetching top gainers:", error.message);
    throw error;
  }
};

export const getTopLosers = async () => {
  try {
    await ensureFrozenCache();

    const response = await coinGecko.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc", // Still fetch top 100 by market cap to avoid garbage coins
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      },
    });

    let data = response.data;
    if(Array.isArray(data)) {
        // Filter frozen
        data = data.filter(c => !frozenCoinsCache.includes(c.id));

        // Sort ascending for losers
        const sorted = data.sort(
          (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
        );

        return sorted.slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error("Error fetching top losers:", error.message);
    throw error;
  }
};


export const getCoinById = async (id) => {
  try {
    // We optionally block access here too
    await ensureFrozenCache();
    if (frozenCoinsCache.includes(id)) {
        throw new Error("This asset is currently unavailable.");
    }

    const response = await coinGecko.get(`/coins/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching coin by ID:", error.message);
    throw error;
  }
};


export const getGlobalMarketStats = async () => {
  try {
    const response = await coinGecko.get("/global");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching global market stats:", error.message);
    throw error;
  }
};


export const getMarketChart = async (id, days = 7) => {
  try {
    const response = await coinGecko.get(`/coins/${id}/market_chart`, {
      params: {
        vs_currency: "usd",
        days,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching market chart:", error.message);
    throw error;
  }
};

// Admin Helpers
export const freezeCoin = async (coinData) => {
    const response = await api.post('/coins/freeze', coinData);
    await refreshFrozenCache(); // Immediate refresh
    return response.data;
};

export const unfreezeCoin = async (coinId) => {
    const response = await api.post('/coins/unfreeze', { coinId });
    await refreshFrozenCache(); // Immediate refresh
    return response.data;
};
