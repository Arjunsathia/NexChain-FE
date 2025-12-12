import React from "react";
import { FaTimes, FaMoneyBillWave } from "react-icons/fa";

const TradeModalHeader = ({
  coin,
  coinName,
  symbol,
  currentPrice,
  shouldShowHoldingsInfo,
  activeTab,
  isBuyOperation,
  isLight,
  TC,
  handleClose,
}) => {
  // Dynamic header accent classes
  const headerAccentClass = (() => {
    if (shouldShowHoldingsInfo && activeTab === "details")
      return TC.bgCyanAccent;
    if (isBuyOperation) return TC.bgGreenAccent;
    return TC.bgRedAccent;
  })();

  return (
    <div
      className={`relative flex items-center justify-between p-3 md:p-4 border-b transition-all duration-300 ${headerAccentClass}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative group">
          <img
            src={coin.image}
            alt={coinName}
            className={`w-10 h-10 rounded-full border-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
              isLight ? "border-gray-300" : "border-gray-600"
            }`}
          />
          <div
            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${
              isLight ? "border-white" : "border-gray-900"
            } transition-all duration-300 ${
              shouldShowHoldingsInfo && activeTab === "details"
                ? "bg-cyan-500 animate-pulse"
                : isBuyOperation
                ? "bg-green-500 animate-pulse"
                : "bg-red-500 animate-pulse"
            }`}
          ></div>
        </div>
        <div className="fade-in">
          <h2 className={`text-lg font-bold ${TC.textPrimary}`}>
            {shouldShowHoldingsInfo ? (
              <>
                {coinName}
                <span className="text-cyan-600 ml-1 text-sm">({symbol})</span>
              </>
            ) : (
              <>
                <span
                  className={isBuyOperation ? "text-green-600" : "text-red-600"}
                >
                  {isBuyOperation ? "Deposit" : "Withdraw"}
                </span>{" "}
                {symbol}
              </>
            )}
          </h2>
          <p
            className={`${TC.textSecondary} text-xs flex items-center gap-1 mt-1`}
          >
            <FaMoneyBillWave className="text-yellow-500 " />
            <span className="font-semibold">
              $
              {currentPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: currentPrice < 1 ? 6 : 2,
              })}
            </span>
          </p>
        </div>
      </div>
      <button
        onClick={handleClose}
        className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${
          isLight
            ? "text-gray-500 hover:text-red-600 hover:bg-red-100"
            : "text-gray-400 hover:text-white hover:bg-red-500/20"
        }`}
      >
        <FaTimes className="text-lg group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default TradeModalHeader;
