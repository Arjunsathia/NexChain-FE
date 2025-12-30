
import React from "react";
import { FaCoins, FaArrowUp, FaArrowDown, FaExchangeAlt, FaChartLine, FaInfoCircle } from "react-icons/fa";

const HoldingsInfo = React.memo(({ holdingsSummary, activeTab, isLight, symbol, currentPrice, coin, setActiveTab }) => {
  if (!holdingsSummary) return null;

  return (
    <div className={`mb-4 mx-4 transition-all duration-300`}>

      {/* 1. Persistent Data Strip (Always Visible) */}
      <div
        className={`p-3 rounded-xl border transition-all duration-300 ${activeTab === "details"
          ? "bg-cyan-500/5 border-cyan-500/20 shadow-sm mb-4"
          : `${isLight ? "bg-white/60 border-gray-200" : "bg-gray-800/40 border-white/5"}`
          }`}
      >
        {activeTab === 'details' && (
          <h3 className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>
            <FaCoins className="text-yellow-500 text-[10px]" />
            Holdings Summary
          </h3>
        )}

        <div className="flex justify-between items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex flex-col min-w-[70px]">
            <span className={`text-[9px] uppercase font-bold tracking-wider ${isLight ? "text-gray-400" : "text-gray-500"}`}>Qty</span>
            <div className={`text-xs font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
              {holdingsSummary.totalQuantity.toFixed(4)} <span className="text-[9px] text-gray-400">{symbol}</span>
            </div>
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 shrink-0" />
          <div className="flex flex-col min-w-[70px]">
            <span className={`text-[9px] uppercase font-bold tracking-wider ${isLight ? "text-gray-400" : "text-gray-500"}`}>Value</span>
            <div className={`text-xs font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
              ${holdingsSummary.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 shrink-0" />
          <div className="flex flex-col min-w-[70px]">
            <span className={`text-[9px] uppercase font-bold tracking-wider ${isLight ? "text-gray-400" : "text-gray-500"}`}>Avg</span>
            <div className={`text-xs font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
              ${holdingsSummary.averagePrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 shrink-0" />
          <div className="flex flex-col min-w-[70px]">
            <span className={`text-[9px] uppercase font-bold tracking-wider ${isLight ? "text-gray-400" : "text-gray-500"}`}>P&L</span>
            <div className={`text-xs font-bold flex items-center gap-1 ${holdingsSummary.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
              {holdingsSummary.profitLoss >= 0 ? "+" : ""}{holdingsSummary.profitLossPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Conditional Details (Only in Holdings Tab) */}
      {activeTab === "details" && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">

          {/* Quick Actions */}
          <div className={`p-4 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200" : "bg-white/5 border-white/5"}`}>
            <h3 className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${isLight ? "text-gray-700" : "text-gray-300"}`}>
              <FaExchangeAlt className="text-blue-500 text-[10px]" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg border font-bold transition-all active:scale-95
                  ${isLight
                    ? "bg-white border-gray-200 hover:border-emerald-500 hover:text-emerald-500 text-gray-700 shadow-sm"
                    : "bg-white/5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 text-white"}
                `}
              >
                <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500 mb-1">
                  <FaArrowUp size={10} />
                </div>
                <span className="text-xs">Buy {symbol}</span>
              </button>

              <button
                onClick={() => setActiveTab('withdraw')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg border font-bold transition-all active:scale-95
                  ${isLight
                    ? "bg-white border-gray-200 hover:border-rose-500 hover:text-rose-500 text-gray-700 shadow-sm"
                    : "bg-white/5 border-white/10 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400 text-white"}
                `}
              >
                <div className="p-1.5 rounded-full bg-rose-500/10 text-rose-500 mb-1">
                  <FaArrowDown size={10} />
                </div>
                <span className="text-xs">Sell {symbol}</span>
              </button>
            </div>
          </div>

          {/* Market Info */}
          <div className={`p-4 rounded-xl border ${isLight ? "bg-blue-50/50 border-blue-100" : "bg-gray-800 border-gray-700"}`} >
            <h3 className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${isLight ? "text-blue-700" : "text-white"}`}>
              <FaChartLine className={`text-[10px] ${isLight ? "text-blue-500" : "text-cyan-400"}`} />
              Market Information
            </h3>
            <div className="flex justify-between items-center text-sm">
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}>Current Price</span>
                <span className={`font-mono font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
                  ${currentPrice?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}>24h Change</span>
                <span className={`font-mono font-bold flex items-center gap-1 ${(coin?.price_change_percentage_24h || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}>
                  {(coin?.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
                  {(coin?.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
              </div>
            </div>
            {/* Info Footnote */}
            <div className={`mt-3 flex items-start gap-1.5 text-[10px] leading-tight ${isLight ? "text-gray-500" : "text-gray-400"}`}>
              <FaInfoCircle className="mt-0.5 shrink-0" />
              <p>Market data is updated in real-time. P&L is calculated based on your average buy price.</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
});

HoldingsInfo.displayName = "HoldingsInfo";
export default HoldingsInfo;
