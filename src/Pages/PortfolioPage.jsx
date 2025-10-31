import MainLayout from "../Components/layout/MainLayout";
import useUserContext from "../Context/UserContext/useUserContext";
import React, { useCallback, useEffect } from "react";
import { usePurchasedCoins } from "../hooks/usePurchasedCoins";
import HoldingsCard from "@/Components/portfolio/HoldingsCard";
import PerformanceChart from "@/Components/portfolio/ PerformanceChart";
import TransactionHistory from "@/Components/portfolio/ TransactionHistory";
import PortfolioDistribution from "@/Components/portfolio/ PortfolioDistribution";

const PortfolioPage = () => {
  const { user } = useUserContext();
  const userFromLocalStorage = JSON.parse(
    localStorage.getItem("NEXCHAIN_USER") || "{}"
  );
  
  // Use consistent user ID
  const userId = user?.id || userFromLocalStorage?.id;

  // Use the purchased coins hook
  const { purchasedCoins, loading, error, refetch } = usePurchasedCoins();

  // console.log("User ID:", userId);
  // console.log("Purchased Coins:", purchasedCoins);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh when user changes
  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);

  return (
      <div className="text-white py-2 glow-fade" style={{ animationDelay: "0.3s" }}>
        <div className="md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-cyan-400">My Portfolio</h1>
              <p className="text-sm text-gray-400 mt-2">Track your cryptocurrency investments</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </>
              )}
            </button>
          </div>

          {/* Debug Info - Remove in production */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-400">Error: {error}</p>
              <p className="text-red-300 text-sm">
                User ID: {userId || "Not found"}
              </p>
              <p className="text-red-300 text-sm">Data count: {purchasedCoins.length}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {!userId && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-4">
              <p className="text-yellow-400">Please log in to view your portfolio</p>
            </div>
          )}

          {userId && purchasedCoins.length === 0 && !loading && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-8 text-center">
              <div className="text-blue-400 text-lg mb-2">No investments yet</div>
              <p className="text-blue-300 text-sm">
                Start by buying some coins from the watchlist or market page
              </p>
            </div>
          )}

          {/* ✅ Top Section: Holdings (wide) + Distribution (small) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* HoldingsCard spans 2 cols */}
            <div className="md:col-span-2 flex flex-col h-full">
              <HoldingsCard data={purchasedCoins} loading={loading} />
            </div>

            {/* PortfolioDistribution spans 1 col */}
            <div className="md:col-span-1 flex flex-col h-full">
              <PortfolioDistribution data={purchasedCoins} loading={loading} />
            </div>
          </div>

          {/* ✅ Bottom Section: Transactions + Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col h-full">
              <TransactionHistory data={purchasedCoins} loading={loading} />
            </div>
            <div className="flex flex-col h-full">
              <PerformanceChart data={purchasedCoins} loading={loading} />
            </div>
          </div>
        </div>
      </div>
  );
};

export default PortfolioPage;