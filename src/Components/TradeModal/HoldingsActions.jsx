import React from "react";
import { FaWallet, FaArrowUp, FaArrowDown, FaInfoCircle } from "react-icons/fa";

const HoldingsActions = ({
  setActiveTab,
  TC,
  currentPrice,
  holdingsSummary,
}) => {
  return (
    <div className="space-y-3">
      <div
        className={`p-3 rounded-lg border glow-fade ${TC.bgCard}`}
        style={{ animationDelay: "200ms" }}
      >
        <h3
          className={`text-sm font-bold mb-3 flex items-center gap-2 ${TC.textSecondary}`}
        >
          <FaWallet className="text-green-600 animate-pulse" />
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab("deposit")}
            className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white 
                       rounded-lg transition-all duration-300 font-bold 
                       flex flex-col items-center gap-1 shadow-md
                       hover:scale-105 group"
          >
            <FaArrowUp className="text-lg group-hover:-translate-y-1 transition-transform duration-300" />
            <span className="text-xs">Deposit</span>
          </button>

          <button
            onClick={() => setActiveTab("withdraw")}
            className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white 
                       rounded-lg transition-all duration-300 font-bold 
                       flex flex-col items-center gap-1 shadow-md
                       hover:scale-105 group"
          >
            <FaArrowDown className="text-lg group-hover:translate-y-1 transition-transform duration-300" />
            <span className="text-xs">Withdraw</span>
          </button>
        </div>
      </div>

      {/* Market Info Card */}
      <div
        className={`p-3 rounded-lg border glow-fade ${TC.bgCard} ${TC.hoverBorder} transition-all duration-300`}
        style={{ animationDelay: "300ms" }}
      >
        <div
          className={`flex items-center gap-2 text-xs mb-2 ${TC.textTertiary}`}
        >
          <FaInfoCircle className="text-cyan-600 animate-pulse" />
          <span className="font-semibold">Market Information</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="fade-in" style={{ animationDelay: "400ms" }}>
            <span className={TC.textTertiary}>Current Price</span>
            <div className={`${TC.textPrimary} font-bold mt-1`}>
              $
              {currentPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: currentPrice < 1 ? 6 : 2,
              })}
            </div>
          </div>
          <div className="fade-in" style={{ animationDelay: "500ms" }}>
            <span className={TC.textTertiary}>Your Avg. Price</span>
            <div className={`${TC.textPrimary} font-bold mt-1`}>
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
};

export default HoldingsActions;
