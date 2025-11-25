import React, { useMemo } from 'react';
import { FaExchangeAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HoldingsTable = ({ isLight, holdings, loading, onTrade }) => {
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgCard: isLight ? "bg-white border-gray-200 shadow-sm" : "bg-gray-800/40 backdrop-blur-md border-gray-700/50 shadow-xl",
    bgHeader: isLight ? "bg-gray-50 border-b border-gray-200" : "bg-gray-800/50 border-b border-gray-700",
    bgHover: isLight ? "hover:bg-gray-50" : "hover:bg-gray-700/30",
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
    textPositive: isLight ? "text-green-600" : "text-green-400",
    textNegative: isLight ? "text-red-600" : "text-red-400",
  }), [isLight]);

  if (loading) {
    return (
      <div className={`rounded-2xl border overflow-hidden ${TC.bgCard}`}>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={60} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} borderRadius={12} />
          ))}
        </div>
      </div>
    );
  }

  if (!holdings || holdings.length === 0) {
    return (
      <div className={`rounded-2xl border p-12 text-center ${TC.bgCard}`}>
        <div className="text-5xl mb-4">🪙</div>
        <h3 className={`text-xl font-bold mb-2 ${TC.textPrimary}`}>No Holdings Yet</h3>
        <p className={TC.textSecondary}>Start trading to build your portfolio.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${TC.bgCard}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`text-left text-xs font-semibold uppercase tracking-wider ${TC.bgHeader} ${TC.textSecondary}`}>
              <th className="px-6 py-4">Asset</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Balance</th>
              <th className="px-6 py-4 text-right">Value</th>
              <th className="px-6 py-4 text-right">24h Change</th>
              <th className="px-6 py-4 text-right">PnL</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? "divide-gray-200" : "divide-gray-700"}`}>
            {holdings.map((coin) => (
              <tr key={coin.coinId} className={`transition-colors duration-200 ${TC.bgHover}`}>
                {/* Asset */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.coinName} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className={`font-bold ${TC.textPrimary}`}>{coin.coinName}</div>
                      <div className={`text-xs ${TC.textSecondary}`}>{coin.coinSymbol?.toUpperCase()}</div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className={`px-6 py-4 text-right font-medium ${TC.textPrimary}`}>
                  ${coin.currentPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </td>

                {/* Balance */}
                <td className="px-6 py-4 text-right">
                  <div className={`font-bold ${TC.textPrimary}`}>{coin.totalQuantity?.toFixed(4)}</div>
                  <div className={`text-xs ${TC.textSecondary}`}>{coin.coinSymbol?.toUpperCase()}</div>
                </td>

                {/* Value */}
                <td className={`px-6 py-4 text-right font-bold ${TC.textPrimary}`}>
                  ${coin.totalCurrentValue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                {/* 24h Change */}
                <td className={`px-6 py-4 text-right font-semibold ${coin.priceChange24h >= 0 ? TC.textPositive : TC.textNegative}`}>
                  {coin.priceChange24h >= 0 ? "+" : ""}{coin.priceChange24h?.toFixed(2)}%
                </td>

                {/* PnL */}
                <td className="px-6 py-4 text-right">
                  <div className={`font-bold ${coin.profitLoss >= 0 ? TC.textPositive : TC.textNegative}`}>
                    {coin.profitLoss >= 0 ? "+" : ""}${Math.abs(coin.profitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs ${coin.profitLoss >= 0 ? TC.textPositive : TC.textNegative}`}>
                    {coin.profitLossPercentage >= 0 ? "+" : ""}{coin.profitLossPercentage?.toFixed(2)}%
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onTrade(coin)}
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200"
                    title="Trade"
                  >
                    <FaExchangeAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;
