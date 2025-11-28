import React from "react";
import {
  FaCoins,
  FaMoneyBillWave,
  FaInfoCircle,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

const TransactionForm = ({
  coinAmount,
  handleCoinAmountChange,
  usdAmount,
  handleUsdAmountChange,
  shouldShowSellAll,
  handleSellAll,
  setMaxAmount,
  maxAvailable,
  symbol,
  currentPrice,
  TC,
  slippage,
  setSlippage,
  isLight,
  calculateTotal,
  isBuyOperation,
  handleSubmit,
  isSubmitting,
}) => {
  return (
    <div className="space-y-4 fade-in">
      {/* Amount Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glow-fade" style={{ animationDelay: "100ms" }}>
          <label
            className={`flex text-xs font-semibold mb-2 items-center gap-1 ${TC.textSecondary}`}
          >
            <FaCoins className="text-yellow-500" />
            Amount ({symbol})
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.000000"
              value={coinAmount}
              onChange={handleCoinAmountChange}
              step="0.000001"
              min="0.000001"
              className={`w-full border rounded-lg pl-3 pr-20 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 text-sm font-semibold transition-all duration-300 ${TC.inputBg}`}
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
              {shouldShowSellAll && (
                <button
                  onClick={handleSellAll}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1 hover:scale-110 group shadow-md"
                  title="Sell All Holdings"
                >
                  <FaCoins className="text-xs group-hover:rotate-12 transition-transform" />
                  ALL
                </button>
              )}
              <button
                onClick={setMaxAmount}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded text-xs font-bold transition-all duration-200 hover:scale-110 group shadow-md"
              >
                <span className="group-hover:scale-110 inline-block transition-transform">
                  MAX
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="glow-fade" style={{ animationDelay: "200ms" }}>
          <label
            className={`flex text-xs font-semibold mb-2 items-center gap-1 ${TC.textSecondary}`}
          >
            <FaMoneyBillWave className="text-green-600" />
            Amount (USD)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={usdAmount}
            onChange={handleUsdAmountChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 text-sm font-semibold transition-all duration-300 ${TC.inputBg}`}
          />
        </div>
      </div>

      {/* Available Balance Info */}
      <div
        className={`flex justify-between items-center text-xs rounded-lg px-3 py-2 border glow-fade hover:border-cyan-600/50 transition-all duration-300 ${TC.bgCard}`}
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center gap-1">
          <FaInfoCircle className="text-cyan-600 text-xs animate-pulse" />
          <span className={`${TC.textSecondary}`}>
            Available:{" "}
            <span className={`${TC.textPrimary} font-bold`}>
              {maxAvailable.toFixed(6)}
            </span>{" "}
            {symbol}
          </span>
        </div>
        <span className={`${TC.textTertiary}`}>
          ≈{" "}
          <span className={`${TC.textPrimary} font-bold`}>
            $
            {(parseFloat(coinAmount || 0) * currentPrice).toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </span>
        </span>
      </div>

      {/* Trading Details */}
      <div
        className={`p-4 rounded-xl space-y-3 glow-fade transition-all duration-300 ${TC.bgCard} ${TC.hoverBorder}`}
        style={{ animationDelay: "400ms" }}
      >
        <h4
          className={`text-sm font-bold mb-2 flex items-center gap-2 ${TC.textSecondary}`}
        >
          <FaExchangeAlt className="text-cyan-600 animate-pulse" />
          Transaction Details
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-xs ${TC.textTertiary}`}>
              Price per {symbol}
            </span>
            <span className={`text-sm font-bold ${TC.textPrimary}`}>
              $
              {currentPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: currentPrice < 1 ? 6 : 2,
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-xs ${TC.textTertiary}`}>
              Slippage Tolerance
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 1.0)}
                step="0.1"
                min="0.1"
                max="5"
                className={`w-16 border rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-cyan-600 font-semibold transition-all duration-300 ${
                  isLight
                    ? "bg-gray-200 border-gray-300 text-gray-900"
                    : "bg-gray-700 border-gray-600 text-white"
                }`}
              />
              <span className={`${TC.textTertiary} text-xs`}>%</span>
            </div>
          </div>
          <div
            className={`border-t ${
              isLight ? "border-gray-300" : "border-gray-600"
            } pt-2 mt-1`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${TC.textSecondary}`}>
                Total {isBuyOperation ? "Cost" : "You Receive"}
              </span>
              <span
                className={`text-lg font-bold ${
                  isBuyOperation ? "text-green-600" : "text-red-600"
                }`}
              >
                ${calculateTotal}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={
          !usdAmount ||
          parseFloat(usdAmount) <= 0 ||
          parseFloat(coinAmount) <= 0 ||
          isSubmitting
        }
        className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl 
                    transition-all duration-300 
                    disabled:opacity-50 disabled:cursor-not-allowed 
                    flex items-center justify-center gap-2 
                    hover:scale-[1.02] active:scale-[0.98] group glow-fade shadow-lg hover:shadow-xl
                    ${
                      isBuyOperation
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50"
                        : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-red-500/30 hover:shadow-red-500/50"
                    }`}
        style={{ animationDelay: "500ms" }}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FaExchangeAlt
              className={`text-sm transition-all duration-300 ${
                isBuyOperation
                  ? "group-hover:rotate-180"
                  : "group-hover:-rotate-180"
              }`}
            />
            <span>
              {isBuyOperation ? "Deposit" : "Withdraw"} {symbol}
            </span>

            {isBuyOperation ? (
              <FaArrowUp className="text-sm transition-transform duration-300 group-hover:-translate-y-1" />
            ) : (
              <FaArrowDown className="text-sm transition-transform duration-300 group-hover:translate-y-1" />
            )}
          </>
        )}
      </button>

      {/* Help Text */}
      <div
        className={`flex items-center gap-2 text-xs rounded px-2 py-1 border glow-fade ${TC.bgCard} ${TC.hoverBorder} transition-all duration-300`}
        style={{ animationDelay: "600ms" }}
      >
        <FaInfoCircle className="text-cyan-600 flex-shrink-0 text-xs animate-pulse" />
        <span className={TC.textTertiary}>
          {isBuyOperation
            ? "You'll receive the coins instantly after purchase confirmation."
            : "Funds will be credited to your wallet immediately after sale."}
        </span>
      </div>
    </div>
  );
};

export default TransactionForm;
