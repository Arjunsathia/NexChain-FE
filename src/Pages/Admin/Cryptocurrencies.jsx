import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import CryptoStats from "@/Components/Admin/Cryptocurrencies/CryptoStats";
import CryptoTable from "@/Components/Admin/Cryptocurrencies/CryptoTable";
import CryptoDetailsModal from "@/Components/Admin/Cryptocurrencies/CryptoDetailsModal";

import useThemeCheck from "@/hooks/useThemeCheck";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoins, freezeCoin, unfreezeCoin } from "@/api/coinApis";
import useTransitionDelay from "@/hooks/useTransitionDelay";
import { useLocation } from "react-router-dom";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";

const AdminCryptocurrencies = () => {
  const isLight = useThemeCheck();
  const queryClient = useQueryClient();
  const isReady = useTransitionDelay();
  const location = useLocation();
  const { isVisited, markVisited } = useVisitedRoutes();
  const [isFirstVisit] = useState(!isVisited(location.pathname));

  useEffect(() => {
    markVisited(location.pathname);
  }, [location.pathname, markVisited]);

  // React Query Implementation
  const { data: coins = [], isLoading } = useQuery({
    queryKey: ["adminCoins"],
    queryFn: () => getCoins({ includeFrozen: true }),
    staleTime: 60000,
    // keepPreviousData is deprecated/removed in v5, safe to omit or use placeholderData
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState(null);

  const [loadingId, setLoadingId] = useState(null);

  const handleToggleFreeze = async (coin) => {
    if (loadingId) return;
    setLoadingId(coin.id);

    try {
      if (coin.isFrozen) {
        await unfreezeCoin(coin.id);
        toast.success(`${coin.name} has been unfrozen`);
      } else {
        await freezeCoin({
          coinId: coin.id,
          symbol: coin.symbol,
          name: coin.name,
        });
        toast.success(`${coin.name} has been frozen`);
      }

      // Update local cache
      queryClient.invalidateQueries(["adminCoins"]);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update coin status");
    } finally {
      setLoadingId(null);
    }
  };

  const coinsPerPage = 10;
  // ... rest of the component ...
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",
      bgStatsCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card hover:bg-white/80 hover:shadow-lg"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 hover:bg-gray-800/80",
      bgItem: isLight
        ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate"
        : "bg-transparent hover:bg-white/5 isolation-isolate",
      bgInput: isLight
        ? "bg-gray-100/50 border-gray-200 focus:bg-white focus:border-blue-500 shadow-inner"
        : "bg-white/5 border-white/5 focus:bg-white/10 focus:border-cyan-500 text-white placeholder-gray-500 shadow-inner",

      tableHead: isLight
        ? "bg-gray-100/80 text-gray-600"
        : "bg-white/5 text-gray-400",
      tableRow: isLight
        ? "hover:bg-gray-50 transition-colors"
        : "hover:bg-white/5 transition-colors",

      modalOverlay: "bg-black/40 backdrop-blur-sm",
      modalContent: isLight
        ? "bg-white shadow-2xl"
        : "bg-[#0B0E11] border border-gray-800 glass-card",

      headerGradient: "from-blue-600 to-cyan-500",
    }),
    [isLight],
  );

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
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
      <div
        className={`flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary} ${isFirstVisit ? "fade-in" : ""}`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4">
          <div className="w-full sm:w-auto text-center sm:text-left">
            <h1
              className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}
            >
              Crypto{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className={`text-sm font-medium ${TC.textSecondary}`}>
              Monitor market prices and coin performance
            </p>
          </div>
          <div className="relative group w-full sm:w-72">
            <FaSearch
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors ${TC.textSecondary} group-focus-within:text-cyan-500`}
            />
            <input
              type="text"
              placeholder="Search coins..."
              className={`w-full rounded-xl py-2.5 pl-12 pr-4 text-sm font-medium outline-none transition-all border ${TC.bgInput}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div
          className={isFirstVisit ? "fade-in" : ""}
          style={{ animationDelay: "0.2s" }}
        >
          {!isReady || isLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
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
                onToggleFreeze={handleToggleFreeze}
                loadingId={loadingId}
              />
            </>
          )}
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
