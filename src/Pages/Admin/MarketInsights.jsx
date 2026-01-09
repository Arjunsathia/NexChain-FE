import React, { useState, useEffect, useMemo } from "react";
import { FaSync } from "react-icons/fa";
import toast from "react-hot-toast";
import GlobalStats from "@/Components/Admin/MarketInsights/GlobalStats";
import MarketMovers from "@/Components/Admin/MarketInsights/MarketMovers";
import MarketTable from "@/Components/Admin/MarketInsights/MarketTable";
import CoinListModal from "@/Components/Admin/MarketInsights/CoinListModal";
import MarketCoinDetailsModal from "@/Components/Admin/MarketInsights/MarketCoinDetailsModal";

import useThemeCheck from "@/hooks/useThemeCheck";
import { coinGecko } from "@/api/axiosConfig";

const MarketInsights = () => {
  const isLight = useThemeCheck();

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      // Glassmorphism Cards - Synced with Admin Sidebar exact styling
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      // Stat Cards - Match sidebar styling with hover effect
      bgStatsCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card hover:bg-white/80 hover:shadow-lg"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 hover:bg-gray-800/80",

      bgItem: isLight
        ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate"
        : "bg-transparent hover:bg-white/5 isolation-isolate",

      bgInput: isLight
        ? "bg-gray-100/50 border-gray-200 focus:bg-white focus:border-blue-500 shadow-inner"
        : "bg-white/5 border-white/5 focus:bg-white/10 focus:border-cyan-500 text-white placeholder-gray-500 shadow-inner",

      btnPrimary:
        "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm font-bold",
      btnSecondary: isLight
        ? "bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 sm:p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-cyan-500/20"
        : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 p-2 sm:p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-cyan-500/20",

      tableHead: isLight
        ? "bg-gray-100/80 text-gray-600"
        : "bg-white/5 text-gray-400",
      tableRow: isLight
        ? "hover:bg-gray-50 transition-colors"
        : "hover:bg-white/5 transition-colors",

      modalOverlay: "bg-black/40 backdrop-blur-sm",
      modalContent: isLight
        ? "bg-white"
        : "bg-[#0B0E11] border border-gray-800 glass-card",

      headerGradient: "from-blue-600 to-cyan-500",
    }),
    [isLight],
  );

  const [marketData, setMarketData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showTopGainers, setShowTopGainers] = useState(false);
  const [showTopLosers, setShowTopLosers] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchMarketData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMarketData = async () => {
    const cacheKey = "marketInsightsData_v1";
    const cached = localStorage.getItem(cacheKey);
    let hasCachedData = false;

    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        setMarketData(data);
        calculateGlobalStats(data);
        hasCachedData = true;
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    try {
      const response = await coinGecko.get("/coins/markets", {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 50,
          page: 1,
          sparkline: true,
          price_change_percentage: "24h,7d",
        },
      });

      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }

      setMarketData(data);
      calculateGlobalStats(data);

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Error fetching market data:", error);
      if (!hasCachedData) {
        toast.error("Failed to fetch market data.", {
          style: {
            background: "#FEE2E2",
            color: "#991B1B",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 16px",
            border: "none",
          },
          iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
        });
        setMarketData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateGlobalStats = (data) => {
    const totalMarketCap = data.reduce((acc, coin) => acc + coin.market_cap, 0);
    const totalVolume = data.reduce((acc, coin) => acc + coin.total_volume, 0);

    const btcDominance =
      (data.find((c) => c.symbol === "btc")?.market_cap / totalMarketCap) * 100;

    setGlobalStats({
      marketCap: totalMarketCap,
      volume: totalVolume,
      btcDominance: btcDominance || 0,
      ethDominance:
        (data.find((c) => c.symbol === "eth")?.market_cap / totalMarketCap) *
          100 || 0,
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCompactNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(number);
  };

  const filteredData = marketData.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const topGainers = [...marketData]
    .sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
    )
    .slice(0, 5);
  const topLosers = [...marketData]
    .sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h,
    )
    .slice(0, 5);

  const MarketSkeleton = () => (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`${TC.bgCard} h-32 rounded-2xl animate-pulse`}
          />
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className={`${TC.bgCard} h-64 rounded-2xl animate-pulse`}
          />
        ))}
      </div>

      {}
      <div className={`${TC.bgCard} rounded-2xl overflow-hidden p-4`}>
        <div className="space-y-4">
          <div
            className={`h-10 w-full ${TC.tableHead} rounded animate-pulse`}
          />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-16 w-full ${TC.bgItem} rounded-xl animate-pulse`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`flex-1 p-2 sm:p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary} fade-in`}
        style={{ animationDelay: "0.1s" }}
      >
        {}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1
              className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}
            >
              Market{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className={`text-sm font-medium ${TC.textSecondary}`}>
              Global crypto market analysis and trends
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {loading && (
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </div>
            )}
            <button
              onClick={fetchMarketData}
              disabled={loading}
              className={`px-3 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 ${TC.btnPrimary} w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FaSync className={loading ? "animate-spin" : ""} /> Refresh Data
            </button>
          </div>
        </div>

        {loading ? (
          <MarketSkeleton />
        ) : (
          <div
            className="space-y-4 lg:space-y-6 fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {}
            <GlobalStats
              globalStats={globalStats}
              TC={TC}
              formatCompactNumber={formatCompactNumber}
            />

            {}
            <MarketMovers
              topGainers={topGainers}
              topLosers={topLosers}
              setShowTopGainers={setShowTopGainers}
              setShowTopLosers={setShowTopLosers}
              TC={TC}
              formatCurrency={formatCurrency}
            />

            {}
            <MarketTable
              currentItems={currentItems}
              filteredData={filteredData}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              paginate={paginate}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              TC={TC}
              isLight={isLight}
              formatCurrency={formatCurrency}
              formatCompactNumber={formatCompactNumber}
              setSelectedCoin={setSelectedCoin}
            />
          </div>
        )}
      </div>

      {}
      <MarketCoinDetailsModal
        selectedCoin={selectedCoin}
        setSelectedCoin={setSelectedCoin}
        TC={TC}
        isLight={isLight}
        formatCurrency={formatCurrency}
        formatCompactNumber={formatCompactNumber}
      />

      {}
      {showTopGainers && (
        <CoinListModal
          title="Top Gainers (24h)"
          coins={[...marketData]
            .filter((coin) => coin.price_change_percentage_24h > 0)
            .sort(
              (a, b) =>
                b.price_change_percentage_24h - a.price_change_percentage_24h,
            )}
          onClose={() => setShowTopGainers(false)}
          TC={TC}
          formatCurrency={formatCurrency}
          isLight={isLight}
        />
      )}

      {}
      {showTopLosers && (
        <CoinListModal
          title="Top Losers (24h)"
          coins={[...marketData]
            .filter((coin) => coin.price_change_percentage_24h < 0)
            .sort(
              (a, b) =>
                a.price_change_percentage_24h - b.price_change_percentage_24h,
            )}
          onClose={() => setShowTopLosers(false)}
          TC={TC}
          formatCurrency={formatCurrency}
          isLight={isLight}
        />
      )}
    </>
  );
};

export default MarketInsights;
