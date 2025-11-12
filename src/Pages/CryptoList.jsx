import React, { useCallback, useEffect, useState } from "react";
import SparklineGraph from "../Components/Crypto/SparklineGraph";
import CoinTable from "../Components/Crypto/CoinTable";
import NewsSection from "../Components/Crypto/NewsSection";
import TopGainers from "@/Components/Crypto/TopGainers";
import TrendingCoins from "@/Components/Crypto/TrendingCoins";
import { formatNumberWithCommas } from "@/Helpers/helper";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getGlobalMarketStats } from "@/api/coinApis";
import TradeModal from "./UserProfile/Components/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";

function CryptoList() {
  const [globalData, setGlobalData] = useState({});
  const [loading, setLoading] = useState(true);
  const { purchasedCoins } = usePurchasedCoins();

  // Trade Modal state at the top level
  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGlobalMarketStats();
      setGlobalData(res);
    } catch (err) {
      console.error("Failed to fetch global market stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler for trade button clicks from CoinTable
  const handleTrade = useCallback((coin) => {
    setTradeModal({
      show: true,
      coin,
      type: "buy",
    });
  }, []);

  // Handler for closing modal
  const handleCloseModal = useCallback(() => {
    setTradeModal({
      show: false,
      coin: null,
      type: "buy",
    });
  }, []);

  return (
    <div className="min-h-screen text-white p-4 lg:p-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Market Stats Grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 py-5 fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Left: Market Stats */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {/* Market Cap Card */}
            <div
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 shadow-2xl fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-gray-400 text-sm mb-3 fade-in"
                    style={{ animationDelay: "0.3s" }}
                  >
                    {loading ? (
                      <Skeleton
                        width={80}
                        baseColor="#2c303a"
                        highlightColor="#3a3f4d"
                      />
                    ) : (
                      "Total Market Cap"
                    )}
                  </p>
                  <h2
                    className="text-2xl lg:text-3xl font-bold text-white mb-3 fade-in truncate"
                    style={{ animationDelay: "0.3s" }}
                  >
                    {loading ? (
                      <Skeleton
                        width={160}
                        height={32}
                        baseColor="#2c303a"
                        highlightColor="#3a3f4d"
                      />
                    ) : (
                      `$${formatNumberWithCommas(
                        globalData?.total_market_cap?.usd
                      )}`
                    )}
                  </h2>
                  {!loading && (
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold fade-in ${
                        globalData?.market_cap_change_percentage_24h_usd < 0
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-green-500/20 text-green-400 border border-green-500/30"
                      }`}
                      style={{ animationDelay: "0.4s" }}
                    >
                      {globalData?.market_cap_change_percentage_24h_usd < 0
                        ? "▼"
                        : "▲"}{" "}
                      {Math.abs(
                        globalData?.market_cap_change_percentage_24h_usd
                      ).toFixed(2)}
                      %
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 self-center fade-in" style={{ animationDelay: "0.5s" }}>
                  {loading ? (
                    <Skeleton
                      width={80}
                      height={50}
                      baseColor="#2c303a"
                      highlightColor="#3a3f4d"
                    />
                  ) : (
                    <SparklineGraph />
                  )}
                </div>
              </div>
            </div>

            {/* 24h Volume Card */}
            <div
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 shadow-2xl fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-gray-400 text-sm mb-3 fade-in"
                    style={{ animationDelay: "0.4s" }}
                  >
                    {loading ? (
                      <Skeleton
                        width={100}
                        baseColor="#2c303a"
                        highlightColor="#3a3f4d"
                      />
                    ) : (
                      "24h Trading Volume"
                    )}
                  </p>
                  <h2
                    className="text-2xl lg:text-3xl font-bold text-white truncate fade-in"
                    style={{ animationDelay: "0.4s" }}
                  >
                    {loading ? (
                      <Skeleton
                        width={180}
                        height={32}
                        baseColor="#2c303a"
                        highlightColor="#3a3f4d"
                      />
                    ) : (
                      `$${formatNumberWithCommas(globalData?.total_volume?.usd)}`
                    )}
                  </h2>
                  {!loading && (
                    <div className="text-cyan-400 text-sm font-medium fade-in" style={{ animationDelay: "0.5s" }}>
                      Global cryptocurrency volume
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 self-center fade-in" style={{ animationDelay: "0.6s" }}>
                  {loading ? (
                    <Skeleton
                      width={80}
                      height={50}
                      baseColor="#2c303a"
                      highlightColor="#3a3f4d"
                    />
                  ) : (
                    <SparklineGraph />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Trending Coins */}
          <div className="fade-in" style={{ animationDelay: "0.4s" }}>
            <TrendingCoins />
          </div>

          {/* Right: Top Gainers */}
          <div className="fade-in" style={{ animationDelay: "0.5s" }}>
            <TopGainers />
          </div>
        </div>

        {/* Coin Table - Pass the trade handler */}
        <div className="fade-in" style={{ animationDelay: "0.6s" }}>
          <CoinTable onTrade={handleTrade} />
        </div>

        {/* News Section */}
        <div className="fade-in" style={{ animationDelay: "0.7s" }}>
          <NewsSection />
        </div>
      </div>

      {/* Trade Modal - Rendered at the top level */}
      <TradeModal
        show={tradeModal.show}
        onClose={handleCloseModal}
        coin={tradeModal.coin}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />
    </div>
  );
}

export default CryptoList;