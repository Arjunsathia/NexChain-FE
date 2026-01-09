import React from "react";
import useThemeCheck from "@/hooks/useThemeCheck";
import { FaArrowDown, FaChevronDown } from "react-icons/fa";
import AdvancedOptions from "./AdvancedOptions";

const TransactionForm = React.memo(
  ({
    setMaxAmount,
    coinAmount,
    handleCoinAmountChange,
    usdAmount,
    handleUsdAmountChange,
    maxAvailable,
    symbol,
    slippage,
    setSlippage,
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
    stopPrice,
    setStopPrice,
  }) => {
    const isLight = useThemeCheck();
    const [isOrderTypeOpen, setIsOrderTypeOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOrderTypeOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatOrderType = (type) => {
      const types = {
        market: "Market",
        limit: "Limit",
        stop_limit: "Stop-Limit",
      };
      return types[type] || type;
    };

    const inputStyle = `w-full text-right bg-transparent outline-none font-mono text-base font-semibold placeholder-gray-400 dark:placeholder-gray-600 transition-colors
    ${isLight ? "text-gray-900" : "text-white"}
  `;

    const inputContainerStyle = `relative flex items-center justify-between px-3 py-3 sm:px-4 sm:py-3.5 rounded-xl border transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-0
    ${
      isLight
        ? "bg-white border-gray-200 focus-within:border-blue-400 focus-within:ring-blue-100"
        : "bg-gray-800 border-gray-700 focus-within:ring-cyan-500/50"
    }
  `;

    return (
      <div className="flex flex-col gap-2 sm:gap-3 pb-2 sm:pb-4">
        {/* Order Type Inline Row */}
        {!isAlertMode && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-gray-500" : "text-gray-400"}`}
            >
              Order Type
            </span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOrderTypeOpen(!isOrderTypeOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all
                ${
                  isLight
                    ? "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                }
              `}
              >
                <span>{formatOrderType(orderType)}</span>
                <FaChevronDown
                  className={`text-[8px] transition-transform ${isOrderTypeOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOrderTypeOpen && (
                <div
                  className={`absolute right-0 top-full mt-1 w-32 rounded-lg border shadow-xl overflow-hidden z-30 ${
                    isLight
                      ? "bg-white border-gray-200"
                      : "bg-[#1a1d24] border-white/10"
                  }`}
                >
                  {["market", "limit", "stop_limit"].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setOrderType(type);
                        setIsAlertMode(false);
                        setIsOrderTypeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors
                      ${
                        orderType === type
                          ? isLight
                            ? "bg-blue-50 text-blue-600"
                            : "bg-blue-500/10 text-blue-400"
                          : isLight
                            ? "text-gray-700 hover:bg-gray-50"
                            : "text-gray-300 hover:bg-white/5"
                      }
                    `}
                    >
                      {formatOrderType(type)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Limit/Stop Price Inputs */}
        {(orderType === "limit" ||
          orderType === "stop_limit" ||
          orderType === "stop_market") && (
          <div className="flex gap-2 animate-in slide-in-from-top-2">
            {(orderType === "stop_limit" || orderType === "stop_market") && (
              <div
                className={`flex-1 px-3 py-2.5 rounded-lg border ${
                  isLight
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                  Stop Price
                </div>
                <input
                  type="number"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-transparent font-mono font-bold text-sm outline-none ${
                    isLight ? "text-gray-900" : "text-white"
                  }`}
                />
              </div>
            )}
            {(orderType === "limit" || orderType === "stop_limit") && (
              <div
                className={`flex-1 px-3 py-2.5 rounded-lg border ${
                  isLight
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                  Limit Price
                </div>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={handleLimitPriceChange}
                  placeholder="0.00"
                  className={`w-full bg-transparent font-mono font-bold text-sm outline-none ${
                    isLight ? "text-gray-900" : "text-white"
                  }`}
                />
              </div>
            )}
          </div>
        )}

        {/* Main Input Section */}
        <div className="flex flex-col gap-2.5 relative">
          {/* Pay Input */}
          <div className={inputContainerStyle}>
            <div className="flex flex-col items-start gap-1.5 flex-1">
              <input
                type="number"
                placeholder="0.00"
                value={usdAmount}
                onChange={handleUsdAmountChange}
                className={`${inputStyle.replace("text-right", "text-left")} w-full`}
              />
              <div className="flex gap-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      if (pct === 100) {
                        setMaxAmount();
                      } else {
                        const amount = maxAvailable * (pct / 100);
                        if (isBuyOperation) {
                          handleUsdAmountChange({
                            target: { value: amount.toString() },
                          });
                        } else {
                          handleCoinAmountChange({
                            target: { value: amount.toString() },
                          });
                        }
                      }
                    }}
                    className={`text-[9px] px-2 py-0.5 rounded-md font-bold transition-all
                    ${
                      isLight
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200"
                        : "bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10"
                    }
                  `}
                  >
                    {pct === 100 ? "MAX" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-0.5 items-end pl-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Pay
              </span>
              <span className="text-xs font-semibold text-gray-500">USD</span>
            </div>
          </div>

          {/* Receive Input */}
          <div className={inputContainerStyle}>
            <input
              type="number"
              placeholder="0.00"
              value={coinAmount}
              onChange={handleCoinAmountChange}
              className={`${inputStyle.replace("text-right", "text-left")} flex-1`}
            />
            <div className="flex flex-col gap-0.5 items-end pl-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Receive
              </span>
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[8px] text-white font-bold shadow-sm">
                  {symbol ? symbol[0] : "C"}
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {symbol}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <AdvancedOptions
          orderType={orderType}
          slippage={slippage}
          setSlippage={setSlippage}
        />

        {/* Summary Footer */}
        <div
          className={`flex justify-between items-center px-3 py-2 rounded-lg text-[10px] font-semibold ${
            isLight ? "bg-gray-50 text-gray-600" : "bg-white/5 text-gray-400"
          }`}
        >
          <span>
            Available: {maxAvailable.toFixed(4)}{" "}
            {isBuyOperation ? "USD" : symbol}
          </span>
          <span>Fee: ~0.1%</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !usdAmount || parseFloat(usdAmount) <= 0}
          className={`
          w-full py-4 rounded-xl font-bold text-sm shadow-lg transform active:scale-[0.98] transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          flex items-center justify-center gap-2
          ${
            isBuyOperation
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-500/20"
              : "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-rose-500/20"
          }
        `}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{isBuyOperation ? `Buy ${symbol}` : `Sell ${symbol}`}</span>
              <span className="opacity-70 font-normal">
                | ${calculateTotal}
              </span>
            </>
          )}
        </button>
      </div>
    );
  },
);

TransactionForm.displayName = "TransactionForm";
export default TransactionForm;
