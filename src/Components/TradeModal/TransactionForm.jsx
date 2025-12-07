import React from "react";
import {
  FaCoins,
  FaMoneyBillWave,
  FaInfoCircle,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
  FaBell,
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
  orderType,
  setOrderType,
  limitPrice,
  handleLimitPriceChange,
  isAlertMode,
  setIsAlertMode,
  alertTargetPrice,
  setAlertTargetPrice,
  stopPrice,
  setStopPrice,
}) => {
  return (
    <div className="space-y-4 fade-in">
      {/* Mode Toggles */}
      <div className="flex gap-2 mb-4">
          <div className={`flex-1 flex p-1 rounded-lg overflow-x-auto ${isLight ? "bg-white border border-gray-200" : "bg-gray-800/50 border-none"}`}>
            {['market', 'limit', 'stop_limit', 'stop_market'].map((type) => (
              <button
                key={type}
                onClick={() => { setOrderType(type); setIsAlertMode(false); }}
                className={`flex-1 py-1.5 px-2 text-[10px] sm:text-xs font-bold rounded-md capitalize whitespace-nowrap transition-all duration-200 ${
                  orderType === type && !isAlertMode
                    ? "bg-cyan-600 text-white shadow-sm dark:bg-gray-700 dark:text-cyan-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
      </div>

      {/* Alert Mode UI */}
      {isAlertMode ? (
        <div className="glow-fade space-y-4">
            {/* ... existing alert UI ... */}
            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 text-center">
                <FaBell className="text-3xl text-yellow-500 mx-auto mb-2" />
                <h3 className="font-bold text-yellow-700 dark:text-yellow-500">Set Price Alert</h3>
                <p className="text-xs text-yellow-600/80 dark:text-yellow-500/70 mt-1">
                    Get notified when {symbol} hits your target price.
                </p>
            </div>

            <div>
              <label className={`flex text-xs font-semibold mb-2 items-center gap-1 ${TC.textSecondary}`}>
                <FaExchangeAlt className="text-yellow-500" />
                Target Price (USD)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm font-semibold transition-all duration-300 ${TC.inputBg}`}
              />
            </div>
            
            <div className="text-center text-xs text-gray-500">
                Current Price: <span className="font-bold">${currentPrice.toLocaleString()}</span>
            </div>
        </div>
      ) : (
        <>
            {/* Stop Price Input */}
            {(orderType === 'stop_limit' || orderType === 'stop_market') && (
                <div className="glow-fade">
                <label className={`flex text-xs font-semibold mb-2 items-center gap-1 ${TC.textSecondary}`}>
                    <FaExchangeAlt className="text-red-500" />
                    Stop Price (USD)
                </label>
                <input
                    type="number"
                    placeholder="0.00"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 text-sm font-semibold transition-all duration-300 ${TC.inputBg}`}
                />
                </div>
            )}

            {/* Limit Price Input */}
            {(orderType === 'limit' || orderType === 'stop_limit') && (
                <div className="glow-fade">
                <label className={`flex text-xs font-semibold mb-2 items-center gap-1 ${TC.textSecondary}`}>
                    <FaExchangeAlt className="text-purple-500" />
                    Limit Price (USD)
                </label>
                <input
                    type="number"
                    placeholder="0.00"
                    value={limitPrice}
                    onChange={handleLimitPriceChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 text-sm font-semibold transition-all duration-300 ${TC.inputBg}`}
                />
                </div>
            )}

            {/* Amount Inputs */}
            <div className="grid grid-cols-2 gap-3">
                {/* ... existing amount inputs ... */}
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
                    {(parseFloat(coinAmount || 0) * (orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : currentPrice)).toLocaleString(
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
                    {orderType === 'limit' ? 'Limit Price' : `Price per ${symbol}`}
                    </span>
                    <span className={`text-sm font-bold ${TC.textPrimary}`}>
                    $
                    {(orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : currentPrice).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: (orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : currentPrice) < 1 ? 6 : 2,
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
        </>
      )}

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={
          isAlertMode 
            ? (!alertTargetPrice || parseFloat(alertTargetPrice) <= 0 || isSubmitting)
            : (
                !usdAmount || parseFloat(usdAmount) <= 0 || parseFloat(coinAmount) <= 0 || isSubmitting ||
                (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) ||
                (orderType === 'stop_limit' && (!limitPrice || parseFloat(limitPrice) <= 0 || !stopPrice || parseFloat(stopPrice) <= 0)) ||
                (orderType === 'stop_market' && (!stopPrice || parseFloat(stopPrice) <= 0))
              )
        }
        className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl 
                    transition-all duration-300 
                    disabled:opacity-50 disabled:cursor-not-allowed 
                    flex items-center justify-center gap-2 
                    hover:scale-[1.02] active:scale-[0.98] group glow-fade shadow-lg hover:shadow-xl
                    ${
                      isAlertMode
                        ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-yellow-500/30 hover:shadow-yellow-500/50"
                        : isBuyOperation
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
        ) : isAlertMode ? (
            <>
                <FaBell className="text-sm" />
                <span>Set Price Alert</span>
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
