import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import CryptoStats from "@/Components/Admin/Cryptocurrencies/CryptoStats";
import CryptoTable from "@/Components/Admin/Cryptocurrencies/CryptoTable";
import CryptoDetailsModal from "@/Components/Admin/Cryptocurrencies/CryptoDetailsModal";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(!document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return isLight;
};

const AdminCryptocurrencies = () => {
  const isLight = useThemeCheck();
  const { coins } = useCoinContext() ?? { coins: [] };
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false); // New state for animation
  const coinsPerPage = 10;

  useEffect(() => {
    // Simulate loading/data fetch completion for animation
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 50); // Small delay to ensure component mounts before animating
    return () => clearTimeout(timer);
  }, []);

  // Premium Theme Classes - Matches User Dashboard
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgCard: isLight 
        ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
      bgStatsCard: isLight
        ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-2xl hover:shadow-cyan-400/25",
      bgItem: isLight ? "bg-gray-50" : "bg-white/5",
      bgInput: isLight ? "bg-white text-gray-900 placeholder-gray-500 shadow-sm" : "bg-gray-900/50 text-white placeholder-gray-500 shadow-inner",

      tableHead: isLight ? "bg-gray-100 text-gray-600" : "bg-gray-900/50 text-gray-400",
      tableRow: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",

      modalOverlay: "bg-black/80 backdrop-blur-sm",
      modalContent: isLight ? "bg-white shadow-2xl" : "bg-[#0a0b14] shadow-2xl shadow-black/50",

      // Gradient matching the Dashboard component: from-cyan-400 to-blue-500
      headerGradient: "from-cyan-400 to-blue-500",
    }),
    [isLight]
  );

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredCoins.slice(indexOfFirstCoin, indexOfLastCoin);
  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    return num?.toLocaleString?.() ?? num;
  };

  return (
    // Applied Dashboard's inner content div for max width and responsive padding
    <div className={`flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* Applied Dashboard's Heading Style */}
          <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}>
            Cryptocurrencies
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-xs sm:text-sm`}>Monitor market prices and coin performance</p>
        </div>
        <div className="relative w-full sm:w-72">
          <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${isLight ? "text-gray-400 group-focus-within:text-cyan-500" : "text-gray-500 group-focus-within:text-cyan-400"}`} />
          <input
            type="text"
            placeholder="Search coins..."
            className={`w-full rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${isLight ? "bg-white text-gray-900 placeholder-gray-400" : "bg-gray-900/50 text-white placeholder-gray-500"}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          contentLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >

        {/* Stats Cards */}
        <CryptoStats coins={coins} TC={TC} />

        {/* Coins Table */}
        <CryptoTable
          currentCoins={currentCoins}
          TC={TC}
          isLight={isLight}
          formatCurrency={formatCurrency}
          formatLargeNumber={formatLargeNumber}
          setSelectedCoin={setSelectedCoin}
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />

      </div>

      {/* Coin Details Modal */}
      <CryptoDetailsModal
        selectedCoin={selectedCoin}
        setSelectedCoin={setSelectedCoin}
        TC={TC}
        isLight={isLight}
        formatCurrency={formatCurrency}
        formatLargeNumber={formatLargeNumber}
      />
    </div>
  );
};

export default AdminCryptocurrencies;
