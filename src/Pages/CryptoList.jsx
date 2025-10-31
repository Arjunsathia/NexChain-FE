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

function CryptoList() {
  const [globalData, setGlobalData] = useState({});
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-5 fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        {/* Left: Market Stats */}
        <div className="flex flex-col gap-4">
          {/* Market Cap */}
          <div
            className="border border-gray-700 rounded-xl p-4 sm:p-5 shadow-md fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className="text-gray-500 text-xs sm:text-sm mb-2 fade-in"
                  style={{ animationDelay: "0.3s" }}
                >
                  {loading ? (
                    <Skeleton
                      width={80}
                      baseColor="#2c303a"
                      highlightColor="#3a3f4d"
                    />
                  ) : (
                    "Market Cap"
                  )}
                </p>
                <h2
                  className="text-xl sm:text-2xl font-bold text-white mb-2 fade-in truncate"
                  style={{ animationDelay: "0.3s" }}
                >
                  {loading ? (
                    <Skeleton
                      width={140}
                      height={28}
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
                  <p
                    className={`text-xs sm:text-sm font-semibold fade-in ${
                      globalData?.market_cap_change_percentage_24h_usd < 0
                        ? "text-red-500"
                        : "text-green-400"
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
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 self-center">
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

          {/* 24h Volume */}
          <div
            className="border border-gray-700 rounded-xl p-4 sm:p-5 shadow-md fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className="text-gray-500 text-xs sm:text-sm mb-2 fade-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  {loading ? (
                    <Skeleton
                      width={80}
                      baseColor="#2c303a"
                      highlightColor="#3a3f4d"
                    />
                  ) : (
                    "24h Trading Volume"
                  )}
                </p>
                <h2
                  className="text-xl sm:text-2xl font-bold text-white truncate fade-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  {loading ? (
                    <Skeleton
                      width={160}
                      height={28}
                      baseColor="#2c303a"
                      highlightColor="#3a3f4d"
                    />
                  ) : (
                    `$${formatNumberWithCommas(globalData?.total_volume?.usd)}`
                  )}
                </h2>
              </div>

              <div className="flex-shrink-0 self-center">
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

        {/* Middle: Trending */}
        <TrendingCoins />

        {/* Right: Top Gainers */}
        <TopGainers />
      </div>

      <CoinTable />
      <NewsSection />
    </>
  );
}

export default CryptoList;
