import { coinGecko } from "./axiosConfig";

// ✅ Get list of coins with market data
export const getCoins = async () => {
  try {
    const response = await coinGecko.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: true,
        price_change_percentage: "1h,24h,7d",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching coins:", error.message);
    throw error;
  }
};

// ✅ Get trending coins (search/trending)
export const getTrend = async () => {
  try {
    const response = await coinGecko.get("/search/trending");
    return response.data;
  } catch (error) {
    console.error("Error fetching trending coins:", error.message);
    throw error;
  }
};

// ✅ Get trending coin market data by IDs
export const getTrendingCoinMarketData = async (idsArray) => {
  try {
    const ids = idsArray.join(","); // Convert array to comma-separated string
    const response = await coinGecko.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        ids,
        price_change_percentage: "1h,24h,7d",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching trending market data:", error.message);
    throw error;
  }
};

// ✅ Get top 5 gainers by 24h percentage change
export const getTopGainers = async () => {
  try {
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

    const sorted = response.data.sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    );

    return sorted.slice(0, 5);
  } catch (error) {
    console.error("Error fetching top gainers:", error.message);
    throw error;
  }
};

// ✅ Get full coin info by ID
export const getCoinById = async (id) => {
  try {
    const response = await coinGecko.get(`/coins/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching coin by ID:", error.message);
    throw error;
  }
};

// ✅ Get global crypto market stats
export const getGlobalMarketStats = async () => {
  try {
    const response = await coinGecko.get("/global");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching global market stats:", error.message);
    throw error;
  }
};
