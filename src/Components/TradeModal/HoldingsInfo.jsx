import React from "react";
import { FaCoins, FaChartLine, FaInfoCircle } from "react-icons/fa";

const HoldingsInfo = React.memo(
  ({ holdingsSummary, activeTab, isLight, currentPrice, coin }) => {
    if (!holdingsSummary) return null;

    return (
      <div className="mb-4 transition-all duration-300">
        {/* 1. Persistent Data Grid (Always Visible) */}
        <div
          className={`rounded-xl border transition-all duration-300 overflow-hidden ${
            activeTab === "details"
              ? "bg-cyan-500/5 border-cyan-500/20 shadow-sm mb-4"
              : `${isLight ? "bg-white border-gray-200" : "bg-gray-800/40 border-white/5"}`
          }`}
        >
          {activeTab === "details" && (
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${isLight ? "border-gray-200 bg-gray-50/50" : "border-white/5 bg-white/5"}`}
            >
              <h3
                className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? "text-cyan-700" : "text-cyan-400"}`}
              >
                <FaCoins className="text-yellow-500 text-[10px]" />
                Holdings Summary
              </h3>
            </div>
          )}

          <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-white/5">
            {/* Qty */}
            <div
              className={`p-3 flex flex-col ${isLight ? "bg-white" : "bg-gray-900"}`}
            >
              <span
                className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isLight ? "text-gray-400" : "text-gray-500"}`}
              >
                Qty Owned
              </span>
              <div
                className={`text-xs font-bold ${isLight ? "text-gray-900" : "text-white"}`}
              >
                {holdingsSummary.totalQuantity.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                })}
              </div>
            </div>

            {/* Value */}
            <div
              className={`p-3 flex flex-col ${isLight ? "bg-white" : "bg-gray-900"}`}
            >
              <span
                className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isLight ? "text-gray-400" : "text-gray-500"}`}
              >
                Current Value
              </span>
              <div
                className={`text-xs font-bold ${isLight ? "text-gray-900" : "text-white"}`}
              >
                $
                {holdingsSummary.currentValue.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>

            {/* Avg */}
            <div
              className={`p-3 flex flex-col ${isLight ? "bg-white" : "bg-gray-900"}`}
            >
              <span
                className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isLight ? "text-gray-400" : "text-gray-500"}`}
              >
                Avg Price
              </span>
              <div
                className={`text-xs font-bold ${isLight ? "text-gray-900" : "text-white"}`}
              >
                $
                {holdingsSummary.averagePrice.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>

            {/* Invested */}
            <div
              className={`p-3 flex flex-col ${isLight ? "bg-white" : "bg-gray-900"}`}
            >
              <span
                className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isLight ? "text-gray-400" : "text-gray-500"}`}
              >
                Invested
              </span>
              <div
                className={`text-xs font-bold ${isLight ? "text-gray-900" : "text-white"}`}
              >
                $
                {holdingsSummary.remainingInvestment.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>

            {/* Net P&L */}
            <div
              className={`p-3 flex flex-col ${isLight ? "bg-white" : "bg-gray-900"}`}
            >
              <span
                className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isLight ? "text-gray-400" : "text-gray-500"}`}
              >
                Net P&L
              </span>
              <div
                className={`text-xs font-bold ${holdingsSummary.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {holdingsSummary.profitLoss >= 0 ? "+" : ""}$
                {Math.abs(holdingsSummary.profitLoss).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>

            {/* P&L % */}
            <div
              className={`p-3 flex flex-col ${isLight ? "bg-white" : "bg-gray-900"}`}
            >
              <span
                className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isLight ? "text-gray-400" : "text-gray-500"}`}
              >
                P&L %
              </span>
              <div
                className={`text-xs font-bold ${holdingsSummary.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {holdingsSummary.profitLoss >= 0 ? "+" : ""}
                {holdingsSummary.profitLossPercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* 2. Conditional Details (Only in Holdings Tab) */}
        {activeTab === "details" && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
            {/* Market Info */}
            <div
              className={`p-4 rounded-xl border ${isLight ? "bg-blue-50/50 border-blue-100" : "bg-gray-800 border-gray-700"}`}
            >
              <h3
                className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${isLight ? "text-blue-700" : "text-white"}`}
              >
                <FaChartLine
                  className={`text-[10px] ${isLight ? "text-blue-500" : "text-cyan-400"}`}
                />
                Market Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Current Price
                  </span>
                  <span
                    className={`font-mono font-bold ${isLight ? "text-gray-900" : "text-white"}`}
                  >
                    $
                    {currentPrice?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}
                  >
                    24h Change
                  </span>
                  <span
                    className={`font-mono font-bold flex items-center gap-1 ${(coin?.price_change_percentage_24h || 0) >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {(coin?.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
                    {(coin?.price_change_percentage_24h || 0).toFixed(2)}%
                  </span>
                </div>

                <div className="flex flex-col">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}
                  >
                    24h High
                  </span>
                  <span
                    className={`font-mono font-bold ${isLight ? "text-gray-900" : "text-white"}`}
                  >
                    $
                    {(
                      coin?.high_24h ||
                      coin?.market_data?.high_24h?.usd ||
                      0
                    ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}
                  >
                    24h Low
                  </span>
                  <span
                    className={`font-mono font-bold ${isLight ? "text-gray-900" : "text-white"}`}
                  >
                    $
                    {(
                      coin?.low_24h ||
                      coin?.market_data?.low_24h?.usd ||
                      0
                    ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              {/* Info Footnote */}
              <div
                className={`mt-3 flex items-start gap-1.5 text-[10px] leading-tight ${isLight ? "text-gray-500" : "text-gray-400"}`}
              >
                <FaInfoCircle className="mt-0.5 shrink-0" />
                <p>
                  Net P&L shows your profit/loss in USD ($), while P&L % shows
                  your percentage return on investment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

HoldingsInfo.displayName = "HoldingsInfo";
export default HoldingsInfo;
