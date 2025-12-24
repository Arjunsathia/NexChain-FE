import React, { useMemo } from "react";
import useThemeCheck from "@/hooks/useThemeCheck";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaHistory, FaArrowUp, FaArrowDown, FaExchangeAlt } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function RecentTradesCard() {
  const isLight = useThemeCheck();
  const { transactionHistory, loading } = usePurchasedCoins();


  const TC = useMemo(() => ({
    bgContainer: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100 glass-card"
      : "bg-gray-900/95 backdrop-blur-none shadow-xl border border-gray-700/50 ring-1 ring-white/5 glass-card",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",


    bgItem: isLight
      ? "hover:bg-blue-50/50 border-b border-gray-100 last:border-0 isolation-isolate"
      : "hover:bg-white/5 border-b border-gray-700/50 last:border-0 isolation-isolate",


    bgBuyIcon: isLight ? "bg-green-100 text-green-600" : "bg-green-500/20 text-green-400",
    bgSellIcon: isLight ? "bg-red-100 text-red-600" : "bg-red-500/20 text-red-400",


    textBuy: isLight ? "text-green-600" : "text-green-400",
    textSell: isLight ? "text-red-600" : "text-red-400",
  }), [isLight]);


  const recentTrades = useMemo(() => {
    if (!transactionHistory) return [];
    return [...transactionHistory]
      .sort((a, b) => new Date(b.transactionDate || b.purchase_date) - new Date(a.transactionDate || a.purchase_date))
      .slice(0, 4);
  }, [transactionHistory]);

  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className={`p-4 rounded-xl h-full flex flex-col ${TC.bgContainer}`}>
        <div className="flex items-center gap-2 mb-3">
          <Skeleton circle width={24} height={24} baseColor={isLight ? "#e5e7eb" : "#2c303a"} highlightColor={isLight ? "#f3f4f6" : "#3a3f4b"} />
          <Skeleton width={100} baseColor={isLight ? "#e5e7eb" : "#2c303a"} highlightColor={isLight ? "#f3f4f6" : "#3a3f4b"} />
        </div>
        <div className="space-y-3">
          <Skeleton height={40} baseColor={isLight ? "#e5e7eb" : "#2c303a"} highlightColor={isLight ? "#f3f4f6" : "#3a3f4b"} />
          <Skeleton height={40} baseColor={isLight ? "#e5e7eb" : "#2c303a"} highlightColor={isLight ? "#f3f4f6" : "#3a3f4b"} />
          <Skeleton height={40} baseColor={isLight ? "#e5e7eb" : "#2c303a"} highlightColor={isLight ? "#f3f4f6" : "#3a3f4b"} />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-1 rounded-xl h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl ${TC.bgContainer}`}>
      { }
      <div className="px-4 pt-3 flex items-center justify-between mb-2">
        <h3 className={`font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2`}>
          <FaHistory className="text-blue-500" />
          Recent Trades
        </h3>
        {recentTrades.length > 0 && (
          <span className={`text-[10px] ${TC.textSecondary} px-2 py-0.5 rounded-full border ${isLight ? "border-gray-200" : "border-gray-700"}`}>
            Last {recentTrades.length}
          </span>
        )}
      </div>

      { }
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 scrollbar-hide max-h-[240px] md:max-h-full">
        {recentTrades.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className={`p-3 rounded-full mb-2 ${isLight ? "bg-gray-100" : "bg-gray-700"}`}>
              <FaExchangeAlt />
            </div>
            <p className={`text-xs ${TC.textSecondary}`}>No transactions yet</p>
          </div>
        ) : (
          recentTrades.map((tx, i) => {
            const isBuy = tx.type === 'buy';
            return (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors fade-in ${TC.bgItem}`}
              >
                { }
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${isBuy ? TC.bgBuyIcon : TC.bgSellIcon}`}>
                    {isBuy ? <FaArrowUp /> : <FaArrowDown />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${TC.textPrimary}`}>
                      {tx.coinSymbol?.toUpperCase() || "COIN"}
                    </p>
                    <p className={`text-[10px] ${TC.textSecondary}`}>
                      {formatTime(tx.transactionDate || tx.purchase_date)}
                    </p>
                  </div>
                </div>

                { }
                <div className="text-right">
                  <p className={`text-xs font-bold ${isBuy ? TC.textBuy : TC.textSell}`}>
                    {isBuy ? "+" : "-"}{tx.quantity?.toFixed(4)}
                  </p>
                  <p className={`text-[10px] ${TC.textSecondary}`}>
                    ${(tx.totalValue || tx.total_cost || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
