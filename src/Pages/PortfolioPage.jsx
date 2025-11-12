import React, { useEffect } from "react";
import useUserContext from "../Context/UserContext/useUserContext";
import { usePurchasedCoins } from "../hooks/usePurchasedCoins";
import HoldingsCard from "@/Components/portfolio/HoldingsCard";
import PerformanceChart from "@/Components/portfolio/PerformanceChart";
import TransactionHistory from "@/Components/portfolio/TransactionHistory";
import PortfolioDistribution from "@/Components/portfolio/PortfolioDistribution";

const PortfolioPage = () => {
  const { user } = useUserContext();
  const userFromLocalStorage = JSON.parse(localStorage.getItem("NEXCHAIN_USER") || "{}");
  const userId = user?.id || userFromLocalStorage?.id;
  const {   error, refetch } = usePurchasedCoins();

  // const handleRefresh = useCallback(() => refetch(), [refetch]);

  useEffect(() => {
    if (userId) refetch();
  }, [userId, refetch]);

  return (
    // <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          {/* <div>
            <h1 className="text-xl font-bold text-cyan-400">My Portfolio</h1>
            <p className="text-xs text-gray-400 mt-1">Track your cryptocurrency investments</p>
          </div> */}
          {/* <button onClick={handleRefresh} disabled={loading} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white rounded-lg transition-all duration-200 flex items-center gap-1 text-sm">
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button> */}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-3">
            <p className="text-red-400 text-sm">Error loading portfolio data</p>
          </div>
        )}

        {!userId && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mb-3">
            <p className="text-yellow-400 text-sm">Please log in to view your portfolio</p>
          </div>
        )}

        {/* {userId && purchasedCoins.length === 0 && !loading && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-center">
            <div className="text-blue-400 text-sm mb-1">No investments yet</div>
            <p className="text-blue-300 text-xs">Start by buying coins from the market</p>
          </div>
        )} */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="md:col-span-2">
            <HoldingsCard />
          </div>
          <div className="md:col-span-1">
            <PortfolioDistribution />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <TransactionHistory />
          </div>
          <div>
            <PerformanceChart />
          </div>
        </div>
      </div>
    // </div>
  );
};

export default PortfolioPage;