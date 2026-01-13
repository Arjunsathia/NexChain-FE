import api, { coinGecko } from "./axiosConfig";

// Cache for blacklisted/frozen coins to minimize API overhead
let frozenCoinsCache = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000;

const ensureFrozenCache = async (force = false) => {
  if (
    !force &&
    Date.now() - lastFetchTime < CACHE_DURATION &&
    frozenCoinsCache.length > 0
  )
    return;
  try {
    const res = await api.get("/coins/frozen");
    if (res.data.success) {
      frozenCoinsCache = res.data.frozenIds || [];
      lastFetchTime = Date.now();
    }
  } catch (e) {
    console.warn("Failed to fetch frozen coins blacklist", e);
  }
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
    coins = coins.map((c) => ({
      ...c,
      isFrozen: frozenCoinsCache.includes(c.id),
    }));

    // Filter if not requested to include
    if (!includeFrozen) {
      coins = coins.filter((c) => !c.isFrozen);
    }

    return coins;
  } catch (error) {
    console.error("Error fetching coins:", error.message);
    throw error;
  }
};

export const getTrendingCoinMarketData = async (idsArray) => {
  try {
    await ensureFrozenCache();

    // Ensure frozen coins are excluded from the request logic

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
    return response.data.filter((c) => !frozenCoinsCache.includes(c.id));
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
    if (Array.isArray(data)) {
      // Filter frozen
      data = data.filter((c) => !frozenCoinsCache.includes(c.id));

      // Sort and slice
      const sorted = data.sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
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
    if (Array.isArray(data)) {
      // Filter frozen
      data = data.filter((c) => !frozenCoinsCache.includes(c.id));

      // Sort ascending for losers
      const sorted = data.sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h,
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
    if (import.meta.env.DEV) console.error("Error fetching coin by ID:", error.message);
    throw error;
  }
};

export const getGlobalMarketStats = async () => {
  try {
    const response = await coinGecko.get("/global");
    return response.data.data;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error fetching global market stats:", error.message);
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
    if (import.meta.env.DEV) console.error("Error fetching market chart:", error.message);
    throw error;
  }
};

// --- Binance Data Extensions (Real-time Precision) ---

const idToSymbol = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  binancecoin: "BNBUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT",
  solana: "SOLUSDT",
  dogecoin: "DOGEUSDT",
  polkadot: "DOTUSDT",
  "matic-network": "MATICUSDT",
  litecoin: "LTCUSDT",
  chainlink: "LINKUSDT",
  stellar: "XLMUSDT",
  cosmos: "ATOMUSDT",
  monero: "XMRUSDT",
  "ethereum-classic": "ETCUSDT",
  "bitcoin-cash": "BCHUSDT",
  filecoin: "FILUSDT",
  theta: "THETAUSDT",
  vechain: "VETUSDT",
  tron: "TRXUSDT",
  avalanche: "AVAXUSDT",
  shiba: "SHIBUSDT",
  toncoin: "TONUSDT",
  "usd-coin": "USDCUSDT",
  tether: "USDTUSDT",
  arbitrum: "ARBUSDT",
  optimism: "OPUSDT",
  near: "NEARUSDT",
  aptos: "APTUSDT",
  fantom: "FTMUSDT",
};

export const getBinanceKlines = async (coinId, days = 1) => {
  const symbol = idToSymbol[coinId];
  if (!symbol) return null;

  let interval = "1h";
  let limit = 500;

  if (days <= 1) {
    interval = "5m";
    limit = 288;
  } else if (days <= 7) {
    interval = "1h";
    limit = 168;
  } else if (days <= 30) {
    interval = "4h";
    limit = 180;
  } else if (days <= 90) {
    interval = "12h";
    limit = 180;
  } else {
    interval = "1d";
    limit = 365;
  }

  try {
    const response = await api.get(`https://api.binance.com/api/v3/klines`, {
      params: { symbol, interval, limit },
    });

    // Format for ApexCharts: [timestamp, price]
    // Binance kline index 0 is open time, index 4 is close price
    const prices = response.data.map((k) => [k[0], parseFloat(k[4])]);
    return { prices };
  } catch (error) {
    console.error(`Binance Klines failed for ${symbol}:`, error.message);
    return null;
  }
};

// Admin Helpers
export const freezeCoin = async (coinData) => {
  const response = await api.post("/coins/freeze", coinData);
  await ensureFrozenCache(true); // Immediate refresh
  return response.data;
};

export const unfreezeCoin = async (coinId) => {
  const response = await api.post("/coins/unfreeze", { coinId });
  await ensureFrozenCache(true); // Immediate refresh
  return response.data;
};
