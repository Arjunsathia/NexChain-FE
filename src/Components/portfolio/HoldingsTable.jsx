import React, { useState, useMemo } from "react";
import {
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
  FaBell,
  FaLayerGroup,
} from "react-icons/fa";
import PriceAlertModal from "@/Components/Common/PriceAlertModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useMediaQuery from "@/hooks/useMediaQuery";

const HoldingsTable = ({
  isLight,
  holdings,
  loading,
  onTrade,
  TC: passedTC,
  disableAnimations = false,
}) => {
  const [alertModal, setAlertModal] = useState({ show: false, coin: null });
  const isMobile = useMediaQuery("(max-width: 767px)"); // Below Tailwind md

  const handleAlertClick = (e, coin) => {
    e.stopPropagation();
    setAlertModal({ show: true, coin });
  };

  const TC = useMemo(() => {
    if (passedTC) return passedTC;

    return {
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",

      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      bgHeader: isLight
        ? "bg-gray-100/50 border-b border-gray-200"
        : "bg-gray-900/95 border-b border-gray-700/50",

      bgHover: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",

      skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
      skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",

      textPositive: isLight ? "text-emerald-600" : "text-emerald-400",
      textNegative: isLight ? "text-rose-600" : "text-rose-400",

      btnPrimary:
        "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-sm font-bold",
    };
  }, [isLight, passedTC]);

  if (loading) {
    return (
      <div
        className={`
          rounded-2xl
          ${TC.bgCard}
        `}
      >
        <div className="p-4 sm:p-6 space-y-4">
          <Skeleton
            height={40}
            baseColor={TC.skeletonBase}
            highlightColor={TC.skeletonHighlight}
            borderRadius={12}
          />
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              height={50}
              baseColor={TC.skeletonBase}
              highlightColor={TC.skeletonHighlight}
              borderRadius={12}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!holdings || holdings.length === 0) {
    return (
      <div
        className={`
          rounded-2xl p-12 text-center
          ${TC.bgCard}
        `}
      >
        <div className="text-5xl mb-4 text-amber-500">🪙</div>
        <h3 className={`text-xl font-bold mb-2 ${TC.textPrimary}`}>
          No Holdings Yet
        </h3>
        <p className={TC.textSecondary}>
          Start trading to build your portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-1 rounded-xl ${TC.bgCard}`}>
      {/* Dashboard Style Header */}
      <div className="px-4 pt-3 flex items-center justify-between mb-2">
        <h3 className="font-bold text-base bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
          <FaLayerGroup className="text-blue-500" size={14} />
          Your Assets
        </h3>
        {holdings.length > 0 && (
          <span
            className={`text-[10px] ${TC.textSecondary} px-2 py-0.5 rounded-full border ${isLight ? "border-gray-200" : "border-gray-700"} font-bold uppercase tracking-wider`}
          >
            {holdings.length} {holdings.length === 1 ? "Asset" : "Assets"}
          </span>
        )}
      </div>

      {!isMobile ? (
        <div
          className={`overflow-hidden rounded-xl border ${isLight ? "border-gray-100" : "border-gray-700/50"} shadow-md mx-2 mb-2`}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`${TC.bgHeader} uppercase tracking-wider text-xs font-bold`}
              >
                <th className={`px-4 sm:px-6 py-4 ${TC.textSecondary}`}>Name</th>
                <th
                  className={`px-4 sm:px-6 py-4 text-right ${TC.textSecondary}`}
                >
                  Price
                </th>
                <th
                  className={`px-4 sm:px-6 py-4 text-right ${TC.textSecondary}`}
                >
                  Quantity
                </th>
                <th
                  className={`px-4 sm:px-6 py-4 text-right ${TC.textSecondary}`}
                >
                  Value
                </th>
                <th
                  className={`px-4 sm:px-6 py-4 text-right ${TC.textSecondary}`}
                >
                  24h Change
                </th>
                <th
                  className={`px-4 sm:px-6 py-4 text-right ${TC.textSecondary}`}
                >
                  PnL
                </th>
                <th
                  className={`px-4 sm:px-6 py-4 text-center ${TC.textSecondary}`}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody
              className={`divide-y ${isLight ? "divide-gray-100" : "divide-white/5"}`}
            >
              {holdings.map((coin) => (
                <tr
                  key={coin.coinId}
                  className={`
                    transition-all duration-200 cursor-pointer group
                    ${TC.bgHover}
                  `}
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative group/bell">
                        <img
                          src={coin.image}
                          alt={coin.coinName}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 dark:border-white/10 group-hover:scale-110 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlertClick(e, coin);
                          }}
                          className="absolute -top-1 -left-1 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-yellow-500 hover:scale-110"
                        >
                          <FaBell size={8} />
                        </button>
                      </div>
                      <div>
                        <div
                          className={`font-bold ${TC.textPrimary} group-hover:text-cyan-400 transition-colors text-sm`}
                        >
                          {coin.coinName}
                        </div>
                        <div
                          className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60`}
                        >
                          {coin.coinSymbol?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td
                    className={`
                      px-4 sm:px-6 py-3 sm:py-4 text-right text-sm font-medium
                      ${TC.textPrimary}
                    `}
                  >
                    $
                    {coin.currentPrice?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </td>

                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                    <div
                      className={`font-bold text-sm ${coin.profitLoss >= 0 ? TC.textPositive : TC.textNegative}`}
                    >
                      {coin.totalQuantity?.toFixed(4)}
                    </div>
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60`}
                    >
                      {coin.coinSymbol?.toUpperCase()}
                    </div>
                  </td>

                  <td
                    className={`
                      px-4 sm:px-6 py-3 sm:py-4 text-right font-bold text-sm
                      ${coin.profitLoss >= 0 ? TC.textPositive : TC.textNegative}
                    `}
                  >
                    $
                    {coin.totalCurrentValue?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                    <div
                      className={`font-bold text-sm ${coin.priceChange24h >= 0 ? TC.textPositive : TC.textNegative}`}
                    >
                      {coin.priceChange24h >= 0 ? "+" : ""}
                      {coin.priceChange24h?.toFixed(2)}%
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                    <div
                      className={`font-bold text-sm ${coin.profitLoss >= 0 ? TC.textPositive : TC.textNegative}`}
                    >
                      {coin.profitLoss >= 0 ? "+" : ""}$
                      {Math.abs(coin.profitLoss).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div
                      className={`text-[10px] font-bold ${coin.profitLossPercentage >= 0 ? TC.textPositive : TC.textNegative} opacity-80`}
                    >
                      {coin.profitLossPercentage >= 0 ? "+" : ""}
                      {coin.profitLossPercentage?.toFixed(2)}%
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrade(coin);
                      }}
                      className={`${TC.btnPrimary || "bg-blue-600 text-white rounded-lg"} px-4 py-2 transition-all duration-200 inline-flex items-center justify-center gap-2`}
                      title="Trade"
                    >
                      <FaExchangeAlt className="text-xs" />
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4 px-2 pb-2">
          {holdings.map((coin, index) => (
            <div
              key={coin.coinId}
              className={`p-4 rounded-xl ${TC.bgCard} transition-all duration-300 cursor-pointer group relative overflow-hidden`}
              style={
                disableAnimations ? {} : { animationDelay: `${index * 0.05}s` }
              }
              onClick={() => onTrade(coin)}
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    <img
                      src={coin.image}
                      alt={coin.coinName}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                  <div>
                    <div className={`font-bold tracking-tight ${TC.textPrimary}`}>
                      {coin.coinName}
                    </div>
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary}`}
                    >
                      {coin.coinSymbol?.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold tracking-tight ${coin.profitLoss >= 0 ? TC.textPositive : TC.textNegative}`}
                  >
                    $
                    {coin.totalCurrentValue?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className={`text-[10px] font-medium ${TC.textSecondary}`}>
                    {coin.totalQuantity?.toFixed(4)}{" "}
                    {coin.coinSymbol?.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm pt-2 relative z-10">
                <div>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60 mb-1`}
                  >
                    Price
                  </div>
                  <div className={`font-bold text-xs ${TC.textPrimary}`}>
                    $
                    {coin.currentPrice?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60 mb-1`}
                  >
                    24h
                  </div>
                  <div
                    className={`font-bold text-xs ${coin.priceChange24h >= 0 ? TC.textPositive : TC.textNegative}`}
                  >
                    {coin.priceChange24h >= 0 ? "+" : ""}
                    {coin.priceChange24h?.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60 mb-1`}
                  >
                    PnL
                  </div>
                  <div
                    className={`font-bold text-xs ${coin.profitLoss >= 0 ? TC.textPositive : TC.textNegative}`}
                  >
                    {coin.profitLoss >= 0 ? "+" : ""}$
                    {Math.abs(coin.profitLoss).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              <div
                className="mt-4 pt-4 border-t border-dashed relative z-10"
                style={{
                  borderColor: isLight ? "#e2e8f0" : "rgba(255,255,255,0.1)",
                }}
              >
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20">
                  Trade Asset
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <PriceAlertModal
        show={alertModal.show}
        onClose={() => setAlertModal({ show: false, coin: null })}
        coin={alertModal.coin}
      />
    </div>
  );
};

export default HoldingsTable;
