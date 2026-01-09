import React, { useState } from "react";
import { FaExchangeAlt, FaBell } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Sparkline from "./Sparkline";
import { useLocation } from "react-router-dom";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";

const WatchlistTable = ({
  coins,
  TC,
  isLight,
  handleCoinClick,
  handleTrade,
  setRemoveModal,
  handleAlertClick,
  disableAnimations = false,
}) => {
  const location = useLocation();
  const { isVisited } = useVisitedRoutes();
  const [shouldAnimate] = useState(
    !disableAnimations && !isVisited(location.pathname),
  );

  return (
    <div
      className={`hidden md:block p-1 rounded-xl ${shouldAnimate ? "fade-in" : ""} ${TC.bgCard}`}
      style={shouldAnimate ? { animationDelay: "0.2s" } : {}}
    >
      {/* Dashboard Style Header */}
      <div className="px-4 pt-3 flex items-center justify-between mb-2">
        <h3 className="font-bold text-base bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
          <FaExchangeAlt className="text-blue-500" size={14} />
          Market Watch
        </h3>
        {coins.length > 0 && (
          <span
            className={`text-[10px] ${TC.textSecondary} px-2 py-0.5 rounded-full border ${isLight ? "border-gray-200" : "border-gray-700"} font-bold uppercase tracking-wider`}
          >
            {coins.length} Assets
          </span>
        )}
      </div>

      <div
        className={`overflow-hidden rounded-xl border ${isLight ? "border-gray-100" : "border-white/5"} shadow-lg mx-2 mb-2`}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className={`${isLight ? "bg-gray-100/50" : "bg-white/5"} uppercase tracking-wider text-[10px] font-bold`}
            >
              <th className={`py-4 px-6 ${TC.textSecondary}`}>Coin</th>
              <th className={`py-4 px-6 text-right ${TC.textSecondary}`}>
                Price
              </th>
              <th className={`py-4 px-6 text-right ${TC.textSecondary}`}>
                24h Change
              </th>
              <th className={`py-4 px-6 text-right ${TC.textSecondary}`}>
                Market Cap
              </th>
              <th className={`py-4 px-6 text-center ${TC.textSecondary}`}>
                7d Trend
              </th>
              <th className={`py-4 px-6 text-center ${TC.textSecondary}`}>
                Holdings
              </th>
              <th className={`py-4 px-6 text-center ${TC.textSecondary}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${isLight ? "divide-gray-100" : "divide-white/5"}`}
          >
            {coins.map((coin, index) => (
              <tr
                key={coin.id}
                onClick={() => handleCoinClick(coin)}
                className={`transition-all duration-200 cursor-pointer group ${shouldAnimate ? "fade-in" : ""} ${TC.bgHover || (isLight ? "hover:bg-gray-50" : "hover:bg-white/5")}`}
                style={
                  shouldAnimate
                    ? { animationDelay: `${0.3 + index * 0.05}s` }
                    : {}
                }
              >
                {}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="relative group/bell">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlertClick(e, coin);
                        }}
                        className="absolute -top-1 -left-1 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-yellow-500"
                      >
                        <FaBell size={10} />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`font-bold text-base truncate group-hover:text-cyan-400 transition-colors ${TC.textPrimary}`}
                      >
                        {coin.name}
                      </div>
                      <div
                        className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60`}
                      >
                        {coin.symbol}
                      </div>
                    </div>
                  </div>
                </td>

                {}
                <td className={`py-4 px-6 text-right ${TC.textPrimary}`}>
                  <div className="font-semibold text-base">
                    $
                    {coin.current_price?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
                    }) || "0"}
                  </div>
                </td>

                {}
                <td className="py-4 px-6 text-right">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-sm ${
                      (coin.price_change_percentage_24h || 0) >= 0
                        ? `${isLight ? "bg-emerald-100" : "bg-emerald-500/20"} ${TC.textPositive}`
                        : `${isLight ? "bg-rose-100" : "bg-red-500/20"} ${TC.textNegative}`
                    }`}
                  >
                    <span className="text-xs">
                      {(coin.price_change_percentage_24h || 0) >= 0 ? "↑" : "↓"}
                    </span>
                    {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}
                    %
                  </div>
                </td>

                {}
                <td
                  className={`py-4 px-6 text-right font-medium ${TC.textSecondary}`}
                >
                  $
                  {(coin.market_cap || 0) >= 1e12
                    ? ((coin.market_cap || 0) / 1e12).toFixed(2) + "T"
                    : (coin.market_cap || 0) >= 1e9
                      ? ((coin.market_cap || 0) / 1e9).toFixed(2) + "B"
                      : (coin.market_cap || 0) >= 1e6
                        ? ((coin.market_cap || 0) / 1e6).toFixed(2) + "M"
                        : (coin.market_cap || 0).toLocaleString("en-IN")}
                </td>

                {}
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

                {}
                <td className="py-4 px-6 text-center">
                  {coin.userHolding ? (
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        isLight
                          ? "bg-green-100 text-green-700"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {(
                        coin.userHolding.totalQuantity ||
                        coin.userHolding.quantity ||
                        0
                      ).toFixed(4)}{" "}
                      {coin.symbol.toUpperCase()}
                    </div>
                  ) : (
                    <span className={`text-sm ${TC.textSecondary}`}>—</span>
                  )}
                </td>

                {}
                <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleTrade(coin)}
                      className={`${TC.btnPrimary || "bg-blue-600 text-white rounded-lg"} px-4 py-2 transition-all duration-200 flex items-center gap-2`}
                    >
                      <FaExchangeAlt className="text-xs" />
                      Trade
                    </button>
                    <button
                      onClick={() => setRemoveModal({ show: true, coin })}
                      className={`p-2 rounded-xl border transition-all duration-200 ${
                        isLight
                          ? "bg-gray-100/50 text-red-600 hover:bg-red-600 hover:text-white border-gray-200"
                          : "bg-white/5 text-red-400 hover:bg-red-600 hover:text-white border-white/5"
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

      {}
      <div
        className={`px-6 py-4 border-t ${isLight ? "bg-gray-50/50 border-gray-100" : "bg-white/5 border-white/5"}`}
      >
        <div
          className={`flex justify-between items-center text-sm ${TC.textSecondary}`}
        >
          <span className="font-medium">Showing {coins.length} coins</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
            <span className="font-medium">Live Market Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistTable;
