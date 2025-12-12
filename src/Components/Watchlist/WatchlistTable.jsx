import React from "react";
import { FaExchangeAlt, FaBell } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Sparkline from "./Sparkline";

const WatchlistTable = ({ coins, TC, isLight, handleCoinClick, handleTrade, setRemoveModal, handleAlertClick }) => {
  return (
    <div className={`hidden md:block rounded-xl sm:rounded-2xl overflow-hidden fade-in ${TC.bgCard}`} style={{ animationDelay: "0.2s" }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${isLight ? "bg-gray-50 border-b border-gray-200" : "bg-gray-900/50 border-b border-gray-700"}`}>
              <th className={`py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider ${TC.textSecondary} w-12`}>
                <FaBell className="mx-auto" />
              </th>
              <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                Coin
              </th>
              <th className={`py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                Price
              </th>
              <th className={`py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                24h Change
              </th>
              <th className={`py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                Market Cap
              </th>
              <th className={`py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                7d Trend
              </th>
              <th className={`py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                Holdings
              </th>
              <th className={`py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? "divide-gray-200" : "divide-gray-700"}`}>
            {coins.map((coin, index) => (
              <tr
                key={coin.id}
                onClick={() => handleCoinClick(coin)}
                className={`transition-all duration-200 cursor-pointer group fade-in ${
                  isLight ? "hover:bg-gray-50" : "hover:bg-gray-700/30"
                }`}
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                {/* Alert Icon */}
                <td className="py-4 px-6 text-center">
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

                {/* Coin Info */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src={coin.image} 
                      alt={coin.name} 
                      className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="min-w-0">
                      <div className={`font-semibold text-base truncate group-hover:text-cyan-400 transition-colors ${TC.textPrimary}`}>
                        {coin.name}
                      </div>
                      <div className={`text-sm uppercase ${TC.textSecondary}`}>
                        {coin.symbol}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className={`py-4 px-6 text-right ${TC.textPrimary}`}>
                  <div className="font-semibold text-base">
                    ${coin.current_price?.toLocaleString("en-IN", { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: coin.current_price < 1 ? 6 : 2 
                    }) || "0"}
                  </div>
                </td>

                {/* 24h Change */}
                <td className="py-4 px-6 text-right">
                  <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                    (coin.price_change_percentage_24h || 0) >= 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {(coin.price_change_percentage_24h || 0) >= 0 ? "↑" : "↓"}
                    {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                  </div>
                </td>

                {/* Market Cap */}
                <td className={`py-4 px-6 text-right font-medium ${TC.textSecondary}`}>
                  ${(coin.market_cap || 0) >= 1e12 
                    ? ((coin.market_cap || 0) / 1e12).toFixed(2) + "T"
                    : (coin.market_cap || 0) >= 1e9 
                    ? ((coin.market_cap || 0) / 1e9).toFixed(2) + "B"
                    : (coin.market_cap || 0) >= 1e6 
                    ? ((coin.market_cap || 0) / 1e6).toFixed(2) + "M"
                    : (coin.market_cap || 0).toLocaleString("en-IN")}
                </td>

                {/* 7d Trend */}
                <td className="py-4 px-6">
                  <div className="flex justify-center">
                    <Sparkline 
                      data={coin.sparkline_in_7d?.price || []} 
                      width={120} 
                      height={40}
                      positive={(coin.price_change_percentage_24h || 0) >= 0}
                    />
                  </div>
                </td>

                {/* Holdings */}
                <td className="py-4 px-6 text-center">
                  {coin.userHolding ? (
                    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      isLight ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400"
                    }`}>
                      {(coin.userHolding.totalQuantity || coin.userHolding.quantity || 0).toFixed(4)} {coin.symbol.toUpperCase()}
                    </div>
                  ) : (
                    <span className={`text-sm ${TC.textSecondary}`}>—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleTrade(coin)}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 shadow-md"
                    >
                      <FaExchangeAlt className="text-xs" />
                      Trade
                    </button>
                    <button
                      onClick={() => setRemoveModal({ show: true, coin })}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                        isLight ? "bg-gray-100 text-red-600 hover:bg-red-600 hover:text-white" : "bg-gray-700 text-red-400 hover:bg-red-600 hover:text-white"
                      }`}
                    >
                      <MdDeleteForever className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className={`px-6 py-4 border-t ${isLight ? "bg-gray-50 border-gray-200" : "bg-gray-900/50 border-gray-700"}`}>
        <div className={`flex justify-between items-center text-sm ${TC.textSecondary}`}>
          <span>Showing {coins.length} coins</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistTable;
