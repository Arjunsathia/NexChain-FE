import React, { useState, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import useCoinContext from "@/hooks/useCoinContext";
import CryptoStats from "@/Components/Admin/Cryptocurrencies/CryptoStats";
import CryptoTable from "@/Components/Admin/Cryptocurrencies/CryptoTable";
import CryptoDetailsModal from "@/Components/Admin/Cryptocurrencies/CryptoDetailsModal";

import useThemeCheck from "@/hooks/useThemeCheck";

const AdminCryptocurrencies = () => {
  const isLight = useThemeCheck();
  const { coins } = useCoinContext() ?? { coins: [] };
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState(null);

  const coinsPerPage = 10;


  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-xl border border-gray-700/50 ring-1 ring-white/5 glass-card",
      bgStatsCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100 glass-card hover:bg-white/80"
        : "bg-gray-900/95 backdrop-blur-none shadow-xl border border-gray-700/50 ring-1 ring-white/5 glass-card hover:bg-gray-800/80",
      bgItem: isLight
        ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate"
        : "bg-transparent hover:bg-white/5 border border-white/5 isolation-isolate",
      bgInput: isLight
        ? "bg-gray-100/50 border-gray-200 focus:bg-white focus:border-blue-500 shadow-inner"
        : "bg-white/5 border-white/5 focus:bg-white/10 focus:border-cyan-500 text-white placeholder-gray-500 shadow-inner",

      tableHead: isLight ? "bg-gray-100/80 text-gray-600" : "bg-white/5 text-gray-400",
      tableRow: isLight ? "hover:bg-gray-50 transition-colors" : "hover:bg-white/5 transition-colors",

      modalOverlay: "bg-black/40 backdrop-blur-sm",
      modalContent: isLight ? "bg-white shadow-2xl" : "bg-[#0B0E11] border border-gray-800 glass-card",


      headerGradient: "from-blue-600 to-cyan-500",
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
    <>
      <div className={`flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary} fade-in`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}>
              Crypto <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className={`text-sm font-medium ${TC.textSecondary}`}>Monitor market prices and coin performance</p>
          </div>
          <div className="relative group w-full sm:w-72">
            <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors ${TC.textSecondary} group-focus-within:text-cyan-500`} />
            <input
              type="text"
              placeholder="Search coins..."
              className={`w-full rounded-xl py-2.5 pl-12 pr-4 text-sm font-medium outline-none transition-all border ${TC.bgInput}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="fade-in" style={{ animationDelay: "0.2s" }}>
          <CryptoStats coins={coins} TC={TC} />
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
      </div>

      <CryptoDetailsModal
        selectedCoin={selectedCoin}
        setSelectedCoin={setSelectedCoin}
        TC={TC}
        isLight={isLight}
        formatCurrency={formatCurrency}
        formatLargeNumber={formatLargeNumber}
      />
    </>
  );
};

export default AdminCryptocurrencies;
