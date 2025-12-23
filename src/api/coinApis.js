import { coinGecko } from "./axiosConfig";


export const getCoins = async (customParams = {}) => {
  try {
    const response = await coinGecko.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: true,
        price_change_percentage: "1h,24h,7d",
        ...customParams,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching coins:", error.message);
    throw error;
  }
};


export const getTrend = async () => {
  try {
    const response = await coinGecko.get("/search/trending");
    return response.data;
  } catch (error) {
    console.error("Error fetching trending coins:", error.message);
    throw error;
  }
};


export const getTrendingCoinMarketData = async (idsArray) => {
  try {
    const ids = idsArray.join(","); 
    const response = await coinGecko.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        ids,
        sparkline: true,
        price_change_percentage: "1h,24h,7d",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching trending market data:", error.message);
    throw error;
  }
};


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


export const getCoinById = async (id) => {
  try {
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
