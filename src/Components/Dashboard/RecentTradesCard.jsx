import React, { useMemo, useState, useEffect } from "react";
import {
  FaHistory,
  FaExchangeAlt,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(
    !document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isLight;
};

function RecentTradesCard() {
  const isLight = useThemeCheck();
  const { transactionHistory, loading: transactionsLoading } =
    usePurchasedCoins();
  const navigate = useNavigate();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const TC = useMemo(
    () => ({
      bgContainer: isLight
        ? "bg-white shadow-sm sm:shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-gray-100"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border border-gray-800",
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      bgItem: isLight
        ? "bg-gray-100/50 border-gray-300 hover:bg-gray-100 hover:border-cyan-600/30"
        : "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-cyan-400/30",
      borderItem: isLight ? "border-gray-300" : "border-gray-700/50",
      bgIcon: isLight ? "bg-cyan-100" : "bg-cyan-400/10",
      textIcon: isLight ? "text-cyan-600" : "text-cyan-400",
      bgTradeIcon: (isBuy) =>
        isBuy
          ? isLight
            ? "bg-green-100/70 text-green-600"
            : "bg-green-500/20 text-green-400"
          : isLight
          ? "bg-red-100/70 text-red-600"
          : "bg-red-500/20 text-red-400",
      textPriceAccent: isLight ? "text-yellow-600/70" : "text-yellow-400/70",
      textDateAccent: isLight ? "text-cyan-600/70" : "text-cyan-400/70",
      textPLPositive: isLight ? "text-green-700" : "text-green-400",
      textPLNegative: isLight ? "text-red-700" : "text-red-400",
      bgPLPositive: isLight ? "bg-green-100/50" : "bg-green-500/20",
      bgPLNegative: isLight ? "bg-red-100/50" : "bg-red-500/20",
      bgLoading: isLight ? "bg-gray-200" : "bg-gray-700",
      bgEmpty: isLight
        ? "bg-gray-100/70 border-gray-300"
        : "bg-gray-700/30 border-gray-600",
      textEmpty: isLight ? "text-gray-500" : "text-gray-400",
      bgFooterButton: isLight
        ? "bg-gray-200 border-gray-300 hover:bg-cyan-100/70 hover:border-cyan-500"
        : "bg-gray-700/50 border-gray-600 hover:bg-cyan-900/40 hover:border-cyan-400",
      textFooterButton: isLight ? "text-cyan-600" : "text-cyan-400",
      textHoverAccent: isLight
        ? "group-hover:text-cyan-700"
        : "group-hover:text-cyan-300",
    }),
    [isLight]
  );

  // Recent transactions (last 4)
  const recentTransactions = useMemo(() => {
    if (!transactionHistory) return [];
    return transactionHistory
      .sort(
        (a, b) =>
          new Date(b.transactionDate || b.purchase_date) -
          new Date(a.transactionDate || a.purchase_date)
      )
      .slice(0, 4);
  }, [transactionHistory]);

  const handleViewAllTrades = () => {
    navigate("/portfolio");
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <div
      className={`
        rounded-lg md:rounded-2xl p-3 md:p-4 h-full flex flex-col gap-4 fade-in
        ${TC.bgContainer}
        ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
      style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
    >
      <div className="fade-in flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${TC.bgIcon}`}>
              <FaHistory className={TC.textIcon + " text-sm"} />
            </div>
            <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Recent Trades
            </h2>
          </div>
        </div>

        {transactionsLoading ? (
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 fade-in">
                <div
                  className={`w-6 h-6 rounded ${TC.bgLoading} animate-pulse`}
                ></div>
                <div className="flex-1 space-y-1.5">
                  <div
                    className={`w-24 h-3 ${TC.bgLoading} rounded animate-pulse`}
                  ></div>
                  <div
                    className={`w-20 h-2 ${TC.bgLoading} rounded animate-pulse`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div
            className={`text-center py-4 flex flex-col items-center justify-center gap-2 rounded-xl border flex-1 fade-in ${TC.bgEmpty}`}
          >
            <div className={`p-2 rounded-full ${TC.bgIcon}`}>
              <FaExchangeAlt className={TC.textIcon + " text-base"} />
            </div>
            <p className={`text-xs ${TC.textEmpty}`}>No recent trades</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Scrollable transactions list */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2">
              {recentTransactions.map((transaction, index) => {
                const isBuy = transaction.type === "buy";

                return (
                  <div
                    key={transaction._id || `tx-${index}`}
                    className={`flex items-center gap-2 p-2 rounded-lg border hover:border-cyan-600/30 transition-all duration-200 cursor-pointer group fade-in ${TC.bgItem}`}
                    onClick={() => navigate("/portfolio")}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isBuy ? TC.bgTradeIcon(true) : TC.bgTradeIcon(false)
                      }`}
                    >
                      {isBuy ? (
                        <FaArrowUp className="text-sm" />
                      ) : (
                        <FaArrowDown className="text-sm" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-semibold text-xs truncate ${TC.textPrimary}`}
                          >
                            {transaction.coinName || transaction.coin_name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`text-xs ${TC.textSecondary}`}
                            >
                              {transaction.coinSymbol?.toUpperCase()}
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                isBuy ? TC.bgPLPositive : TC.bgPLNegative
                              }`}
                            >
                              {isBuy ? "Bought" : "Sold"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 ml-2">
                          <p
                            className={`font-bold text-xs ${
                              isBuy ? TC.textPLPositive : TC.textPLNegative
                            }`}
                          >
                            {isBuy ? "+" : "-"}
                            {(transaction.quantity || 0).toFixed(4)}
                          </p>
                          <p className={`text-xs ${TC.textSecondary}`}>
                            $
                            {(
                              transaction.totalValue ||
                              transaction.total_cost ||
                              0
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between text-xs ${TC.textSecondary} pt-1 border-t ${TC.borderItem}`}
                      >
                        <div className="flex items-center gap-1">
                          <FaMoneyBillWave
                            className={TC.textPriceAccent + " text-xs"}
                          />
                          $
                          {(
                            transaction.price ||
                            transaction.coin_price_usd ||
                            0
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits:
                              (transaction.price ||
                                transaction.coin_price_usd ||
                                0) < 1
                                ? 6
                                : 2,
                          })}
                        </div>
                        <span className="flex items-center gap-1">
                          <FaExchangeAlt
                            className={TC.textDateAccent + " text-xs"}
                          />
                          {formatDateTime(
                            transaction.transactionDate ||
                              transaction.purchase_date
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View All Trades Button */}
        <button
          onClick={handleViewAllTrades}
          className={`
            w-full mt-3 text-xs font-semibold py-2 rounded-lg transition-all duration-200 
            flex items-center justify-center gap-1 group fade-in border 
            ${TC.bgFooterButton} 
            ${TC.textFooterButton}
            ${TC.textHoverAccent}
          `}
        >
          View All Trades
          <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default RecentTradesCard;
