import React, { useState, useEffect, useMemo } from "react";
import { FaSync } from "react-icons/fa";
import toast from "react-hot-toast";
import GlobalStats from "@/Components/Admin/MarketInsights/GlobalStats";
import MarketMovers from "@/Components/Admin/MarketInsights/MarketMovers";
import MarketTable from "@/Components/Admin/MarketInsights/MarketTable";
import CoinListModal from "@/Components/Admin/MarketInsights/CoinListModal";
import MarketCoinDetailsModal from "@/Components/Admin/MarketInsights/MarketCoinDetailsModal";

import useThemeCheck from "@/hooks/useThemeCheck";

const MarketInsights = () => {
  const isLight = useThemeCheck();

  // Premium Theme Classes - Matches User Dashboard
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgCard: isLight
        ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
      bgStatsCard: isLight
        ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-2xl hover:shadow-cyan-400/25",
      bgItem: isLight ? "bg-gray-50" : "bg-white/5",
      bgInput: isLight
        ? "bg-white text-gray-900 placeholder-gray-500 shadow-sm"
        : "bg-gray-900/50 text-white placeholder-gray-500 shadow-inner",

      btnPrimary:
        "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300",
      btnSecondary: isLight
        ? "text-gray-600 hover:bg-gray-100"
        : "text-gray-300 hover:bg-gray-800/50 hover:text-white",

      tableHead: isLight
        ? "bg-gray-100 text-gray-600"
        : "bg-gray-900/50 text-gray-400",
      tableRow: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",

      modalOverlay: "bg-black/80 backdrop-blur-sm",
      modalContent: isLight
        ? "bg-white shadow-2xl"
        : "bg-[#0a0b14] shadow-2xl shadow-black/50",

      headerGradient: "from-cyan-400 to-blue-500",
    }),
    [isLight]
  );

  const [marketData, setMarketData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showTopGainers, setShowTopGainers] = useState(false);
  const [showTopLosers, setShowTopLosers] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setContentLoaded(false);
      // Fetch CoinGecko Data
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h,7d"
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }

      setMarketData(data);

      // Calculate Global Stats
      const totalMarketCap = data.reduce(
        (acc, coin) => acc + coin.market_cap,
        0
      );
      const totalVolume = data.reduce(
        (acc, coin) => acc + coin.total_volume,
        0
      );
      const btcDominance =
        (data.find((c) => c.symbol === "btc")?.market_cap / totalMarketCap) *
        100;

      setGlobalStats({
        marketCap: totalMarketCap,
        volume: totalVolume,
        btcDominance: btcDominance || 0,
        ethDominance:
          (data.find((c) => c.symbol === "eth")?.market_cap / totalMarketCap) *
            100 || 0,
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast.error("Failed to fetch market data. Please try again later.", {
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
      setMarketData([]); // Fallback to empty array
    } finally {
      setLoading(false);
      setTimeout(() => setContentLoaded(true), 300);
    }
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
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const topGainers = [...marketData]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);
  const topLosers = [...marketData]
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5);

  // Loading Skeleton Component
  const MarketSkeleton = () => (
    <div className="space-y-6">
      {/* Global Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`${TC.bgCard} h-32 rounded-2xl animate-pulse`}
          />
        ))}
      </div>

      {/* Market Movers Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className={`${TC.bgCard} h-64 rounded-2xl animate-pulse`}
          />
        ))}
      </div>

      {/* Table Skeleton */}
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
    <div
      className={`flex-1 p-2 sm:p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}
          >
            Market Insights
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-xs sm:text-sm`}>
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
          className={`transition-all duration-500 ease-in-out space-y-4 lg:space-y-6 ${
            contentLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {/* Global Stats */}
          <GlobalStats
            globalStats={globalStats}
            TC={TC}
            formatCompactNumber={formatCompactNumber}
          />

          {/* Market Movers */}
          <MarketMovers
            topGainers={topGainers}
            topLosers={topLosers}
            setShowTopGainers={setShowTopGainers}
            setShowTopLosers={setShowTopLosers}
            TC={TC}
            formatCurrency={formatCurrency}
          />

          {/* Main Market Table */}
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

      {/* Coin Details Modal */}
      <MarketCoinDetailsModal
        selectedCoin={selectedCoin}
        setSelectedCoin={setSelectedCoin}
        TC={TC}
        isLight={isLight}
        formatCurrency={formatCurrency}
        formatCompactNumber={formatCompactNumber}
      />

      {/* Top Gainers Modal */}
      {showTopGainers && (
        <CoinListModal
          title="Top Gainers (24h)"
          coins={[...marketData]
            .filter((coin) => coin.price_change_percentage_24h > 0)
            .sort(
              (a, b) =>
                b.price_change_percentage_24h - a.price_change_percentage_24h
            )}
          onClose={() => setShowTopGainers(false)}
          TC={TC}
          formatCurrency={formatCurrency}
          isLight={isLight}
        />
      )}

      {/* Top Losers Modal */}
      {showTopLosers && (
        <CoinListModal
          title="Top Losers (24h)"
          coins={[...marketData]
            .filter((coin) => coin.price_change_percentage_24h < 0)
            .sort(
              (a, b) =>
                a.price_change_percentage_24h - b.price_change_percentage_24h
            )}
          onClose={() => setShowTopLosers(false)}
          TC={TC}
          formatCurrency={formatCurrency}
          isLight={isLight}
        />
      )}
    </div>
  );
};

export default MarketInsights;