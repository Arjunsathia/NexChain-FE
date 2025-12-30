
import React from "react";
import useThemeCheck from '@/hooks/useThemeCheck';
import { FaWallet, FaArrowUp, FaArrowDown, FaInfoCircle } from "react-icons/fa";

const HoldingsActions = React.memo(({
  setActiveTab,
  currentPrice,
  holdingsSummary,
}) => {
  const isLight = useThemeCheck();

  return (
    <div className="space-y-3">
      <div
        className={`p-3 rounded-lg border transition-all duration-300 ${isLight ? "bg-white/60 border-gray-200" : "bg-gray-800/40 border-white/5"}`}
        style={{ animationDelay: "200ms" }}
      >
        <h3
          className={`text-sm font-bold mb-3 flex items-center gap-2 ${isLight ? "text-gray-700" : "text-gray-300"}`}
        >
          <FaWallet className="text-green-600 animate-pulse" />
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab("deposit")}
            className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white 
                       rounded-lg transition-all duration-200 font-bold shadow-lg shadow-emerald-500/20 active:scale-95
                       flex flex-col items-center gap-1 group"
          >
            <FaArrowUp className="text-lg group-hover:-translate-y-1 transition-transform duration-200" />
            <span className="text-xs">Deposit</span>
          </button>

          <button
            onClick={() => setActiveTab("withdraw")}
            className="py-2.5 px-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white 
                       rounded-lg transition-all duration-200 font-bold shadow-lg shadow-rose-500/20 active:scale-95
                       flex flex-col items-center gap-1 group"
          >
            <FaArrowDown className="text-lg group-hover:translate-y-1 transition-transform duration-200" />
            <span className="text-xs">Withdraw</span>
          </button>
        </div>
      </div>

      { }
      <div
        className={`p-3 rounded-lg border transition-all duration-300 ${isLight ? "bg-white/60 border-gray-200 hover:border-blue-400/50" : "bg-gray-800/40 border-white/5 hover:border-blue-400/20"}`}
        style={{ animationDelay: "300ms" }}
      >
        <div
          className={`flex items-center gap-2 text-xs mb-2 ${isLight ? "text-gray-500" : "text-gray-400"}`}
        >
          <FaInfoCircle className="text-cyan-600 animate-pulse" />
          <span className="font-semibold">Market Information</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="fade-in" style={{ animationDelay: "400ms" }}>
            <span className={isLight ? "text-gray-500" : "text-gray-500"}>Current Price</span>
            <div className={`font-bold mt-1 ${isLight ? "text-gray-900" : "text-white"}`}>
              $
              {currentPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: currentPrice < 1 ? 6 : 2,
              })}
            </div>
          </div>
          <div className="fade-in" style={{ animationDelay: "500ms" }}>
            <span className={isLight ? "text-gray-500" : "text-gray-500"}>Your Avg. Price</span>
            <div className={`font-bold mt-1 ${isLight ? "text-gray-900" : "text-white"}`}>
              $
              {holdingsSummary?.averagePrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits:
                  holdingsSummary?.averagePrice < 1 ? 6 : 2,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HoldingsActions.displayName = "HoldingsActions";

export default HoldingsActions;
