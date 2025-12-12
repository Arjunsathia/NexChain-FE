import React, { useState, useMemo } from 'react';
import { FaExchangeAlt, FaArrowUp, FaArrowDown, FaBell } from 'react-icons/fa';
import PriceAlertModal from '@/Components/Common/PriceAlertModal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HoldingsTable = ({ isLight, holdings, loading, onTrade }) => {
  const [alertModal, setAlertModal] = useState({ show: false, coin: null });

  const handleAlertClick = (e, coin) => {
    e.stopPropagation();
    setAlertModal({ show: true, coin });
  };
  const TC = useMemo(() => ({
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    
    // Card Background (aligned with other components – no border)
    bgCard: isLight
      ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",

    // Table Header Background
    bgHeader: isLight
      ? "bg-gray-100 border-b border-gray-200"
      : "bg-gray-800/70 border-b border-gray-700",
    
    // Table Row Hover
    bgHover: isLight ? "hover:bg-gray-50" : "hover:bg-gray-700/50",
    
    // Skeleton Colors
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
    
    // P&L Colors
    textPositive: isLight ? "text-green-600" : "text-green-400",
    textNegative: isLight ? "text-red-600" : "text-red-400",
    
    // Action Button Colors
    bgButton: isLight
      ? "bg-blue-500/10 text-blue-600 hover:bg-blue-600"
      : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500",
    textButtonHover: "hover:text-white",
  }), [isLight]);

  // Loading State
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

  // Empty State
  if (!holdings || holdings.length === 0) {
    return (
      <div
        className={`
          rounded-2xl p-12 text-center
          ${TC.bgCard}
        `}
      >
        <div className="text-5xl mb-4 text-amber-500">🪙</div>
        <h3 className={`text-xl font-bold mb-2 ${TC.textPrimary}`}>No Holdings Yet</h3>
        <p className={TC.textSecondary}>Start trading to build your portfolio.</p>
      </div>
    );
  }

  // Main Table
  return (
    <div
      className={`
        rounded-lg md:rounded-2xl overflow-hidden
        ${TC.bgCard}
      `}
    >
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr
              className={`
                text-left text-xs font-semibold uppercase tracking-wider
                ${TC.bgHeader} ${TC.textSecondary}
              `}
            >
              <th className="px-4 sm:px-6 py-3 text-center w-12">
                <FaBell className="mx-auto" />
              </th>
              <th className="px-4 sm:px-6 py-3">Asset</th>
              <th className="px-4 sm:px-6 py-3 text-right">Price</th>
              <th className="px-4 sm:px-6 py-3 text-right">Balance</th>
              <th className="px-4 sm:px-6 py-3 text-right">Value</th>
              <th className="px-4 sm:px-6 py-3 text-right">24h Change</th>
              <th className="px-4 sm:px-6 py-3 text-right">PnL</th>
              <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${isLight ? "divide-gray-200" : "divide-gray-700"}`}>
            {holdings.map((coin, index) => (
              <tr
                key={coin.coinId}
                className={`
                  transition-all duration-200 cursor-pointer group fade-in
                  ${TC.bgHover}
                `}
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                {/* Alert Icon */}
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                  <button
                    onClick={(e) => handleAlertClick(e, coin)}
                    className={`p-2 rounded-full transition-colors ${
                      isLight 
                        ? "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50" 
                        : "text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                    }`}
                  >
                    <FaBell />
                  </button>
                </td>

                {/* Asset */}
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={coin.image}
                      alt={coin.coinName}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 dark:border-gray-600 group-hover:scale-110 transition-transform duration-300"
                    />
                    <div>
                      <div className={`font-medium ${TC.textPrimary} group-hover:text-cyan-400 transition-colors`}>{coin.coinName}</div>
                      <div className={`text-xs ${TC.textSecondary}`}>
                        {coin.coinSymbol?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td
                  className={`
                    px-4 sm:px-6 py-3 sm:py-4 text-right text-sm font-medium
                    ${TC.textPrimary}
                  `}
                >
                  ${coin.currentPrice?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}
                </td>

                {/* Balance */}
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                  <div className={`font-medium ${TC.textPrimary} text-sm`}>
                    {coin.totalQuantity?.toFixed(4)}
                  </div>
                  <div className={`text-xs ${TC.textSecondary}`}>
                    {coin.coinSymbol?.toUpperCase()}
                  </div>
                </td>

                {/* Value */}
                <td
                  className={`
                    px-4 sm:px-6 py-3 sm:py-4 text-right font-bold text-sm
                    ${TC.textPrimary}
                  `}
                >
                  ${coin.totalCurrentValue?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                {/* 24h Change */}
                <td
                  className={`
                    px-4 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm
                    ${coin.priceChange24h >= 0 ? TC.textPositive : TC.textNegative}
                  `}
                >
                  {coin.priceChange24h >= 0 ? (
                    <FaArrowUp className="inline mr-1 text-xs" />
                  ) : (
                    <FaArrowDown className="inline mr-1 text-xs" />
                  )}
                  {coin.priceChange24h >= 0 ? "+" : ""}
                  {coin.priceChange24h?.toFixed(2)}%
                </td>

                {/* PnL */}
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                  <div
                    className={`
                      font-bold text-sm
                      ${coin.profitLoss >= 0 ? TC.textPositive : TC.textNegative}
                    `}
                  >
                    {coin.profitLoss >= 0 ? "+" : ""}$
                    {Math.abs(coin.profitLoss).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div
                    className={`
                      text-xs
                      ${coin.profitLossPercentage >= 0 ? TC.textPositive : TC.textNegative}
                    `}
                  >
                    {coin.profitLossPercentage >= 0 ? "+" : ""}
                    {coin.profitLossPercentage?.toFixed(2)}%
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrade(coin);
                    }}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 shadow-md"
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
      
      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {holdings.map((coin, index) => (
          <div 
            key={coin.coinId} 
            className={`p-3 space-y-2 fade-in ${TC.bgHover}`}
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            onClick={() => onTrade(coin)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.coinName} className="w-10 h-10 rounded-full" />
                <div>
                  <div className={`font-bold ${TC.textPrimary}`}>{coin.coinName}</div>
                  <div className={`text-xs ${TC.textSecondary}`}>{coin.coinSymbol?.toUpperCase()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${TC.textPrimary}`}>
                  ${coin.totalCurrentValue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs ${TC.textSecondary}`}>
                  {coin.totalQuantity?.toFixed(4)} {coin.coinSymbol?.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm pt-2">
              <div>
                <div className={`text-xs ${TC.textSecondary}`}>Price</div>
                <div className={`font-medium ${TC.textPrimary}`}>
                  ${coin.currentPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xs ${TC.textSecondary}`}>24h</div>
                <div className={`font-medium ${coin.priceChange24h >= 0 ? TC.textPositive : TC.textNegative}`}>
                  {coin.priceChange24h >= 0 ? "+" : ""}{coin.priceChange24h?.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs ${TC.textSecondary}`}>PnL</div>
                <div className={`font-medium ${coin.profitLoss >= 0 ? TC.textPositive : TC.textNegative}`}>
                  {coin.profitLoss >= 0 ? "+" : ""}${Math.abs(coin.profitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PriceAlertModal 
        show={alertModal.show} 
        onClose={() => setAlertModal({ show: false, coin: null })} 
        coin={alertModal.coin} 
      />
    </div>
  );
};

export default HoldingsTable;
