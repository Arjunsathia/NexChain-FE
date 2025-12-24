import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useMemo } from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaArrowUp, FaArrowDown, FaHistory, FaExchangeAlt } from "react-icons/fa";

function RecentActivity() {
  const isLight = useThemeCheck();
  const { purchasedCoins, transactionHistory, loading } = usePurchasedCoins();

  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-400" : "text-gray-500",

    // Glassmorphism Card Style
    bgCard: isLight
      ? "bg-white/80 backdrop-blur-md shadow-sm md:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/40"
      : "bg-gray-900/40 backdrop-blur-md shadow-sm md:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/5",

    // Header
    bgIcon: isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400",
    iconColor: isLight ? "text-blue-600" : "text-cyan-400",
    headerGradient: "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",

    bgSkeleton: isLight ? "bg-gray-200" : "bg-gray-700",

    // List Items
    bgItemHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",
    textItemHover: isLight ? "group-hover:text-blue-600" : "group-hover:text-cyan-300",

    // Status badges
    bgBuy: isLight ? "bg-emerald-100/60 text-emerald-700" : "bg-emerald-500/10 text-emerald-400",
    bgSell: isLight ? "bg-rose-100/60 text-rose-700" : "bg-rose-500/10 text-rose-400",

    textBuyValue: isLight ? "text-emerald-700" : "text-emerald-400",
    textSellValue: isLight ? "text-rose-700" : "text-rose-400",

    textAmount: isLight ? "text-gray-700" : "text-gray-300",
    iconBorder: isLight ? "border-white" : "border-gray-900",

    bgEmptyIcon: isLight ? "bg-blue-50" : "bg-blue-500/10",
    textEmptyIcon: isLight ? "text-blue-500" : "text-cyan-400",

  }), [isLight]);

  const recentActivities = useMemo(() => {
    const allActivities = [];

    if (Array.isArray(purchasedCoins)) {
      purchasedCoins.forEach(coin => {
        allActivities.push({
          type: 'buy',
          coinName: coin.coinName,
          coinSymbol: coin.coinSymbol,
          image: coin.image,
          quantity: coin.quantity,
          amount: coin.total_cost || (coin.coinPriceUSD * coin.quantity),
          date: coin.purchaseDate || coin.createdAt,
          id: coin._id + '-buy'
        });
      });
    }

    if (Array.isArray(transactionHistory)) {
      transactionHistory.forEach(transaction => {
        allActivities.push({
          type: transaction.type || 'buy',
          coinName: transaction.coinName || transaction.coin_name,
          coinSymbol: transaction.coinSymbol || transaction.coin_symbol,
          image: transaction.image,
          quantity: transaction.quantity,
          amount: transaction.totalValue || transaction.total_cost,
          date: transaction.transactionDate || transaction.purchase_date,
          id: transaction._id
        });
      });
    }

    // Filter unique by ID to avoid potential dupes if any logic overlaps
    const uniqueActivities = allActivities.reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) return acc.concat([current]);
      return acc;
    }, []);

    return uniqueActivities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10); // Show slightly more if user scrolls
  }, [purchasedCoins, transactionHistory]);

  if (loading) {
    return (
      <div className={`${TC.bgCard} rounded-2xl p-5 h-[380px] flex flex-col`}>
        <div className="animate-pulse space-y-4 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 ${TC.bgSkeleton} rounded-xl`}></div>
            <div className="space-y-2 flex-1">
              <div className={`h-4 ${TC.bgSkeleton} rounded w-1/3`}></div>
              <div className={`h-3 ${TC.bgSkeleton} rounded w-1/4`}></div>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className={`w-8 h-8 ${TC.bgSkeleton} rounded-full`}></div>
                <div className="flex-1 space-y-2">
                  <div className={`h-4 ${TC.bgSkeleton} rounded w-20`}></div>
                  <div className={`h-3 ${TC.bgSkeleton} rounded w-16`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${TC.bgCard} rounded-2xl p-5 h-[380px] flex flex-col transition-all duration-300 relative overflow-hidden group`}>
      {/* Background Decorative Gradient */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-opacity duration-500 ${isLight ? 'opacity-100' : 'opacity-20'}`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${TC.bgIcon} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
            <FaHistory className="text-lg" />
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${TC.textPrimary}`}>
              Activity
            </h2>
            <p className={`text-xs font-medium ${TC.textSecondary}`}>
              Recent transactions
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0 relative z-10">
        {recentActivities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 h-full">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${TC.bgEmptyIcon}`}>
              <FaExchangeAlt className={`text-2xl ${TC.textEmptyIcon}`} />
            </div>
            <p className={`text-sm font-medium ${TC.textSecondary}`}>No recent activity</p>
            <p className={`text-xs ${TC.textTertiary} mt-1`}>Your transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentActivities.map((activity, idx) => {
              const isBuy = activity.type === 'buy';
              const statusClasses = isBuy ? TC.bgBuy : TC.bgSell;
              const valueClasses = isBuy ? TC.textBuyValue : TC.textSellValue;

              return (
                <div
                  key={activity.id || idx}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 group cursor-default ${TC.bgItemHover}`}
                  style={{ animationDelay: `${0.1 * idx}s` }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative flex-shrink-0">
                      <img
                        src={activity.image}
                        alt={activity.coinName}
                        className="w-8 h-8 rounded-full shadow-sm group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${TC.iconBorder} flex items-center justify-center ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}>
                        {isBuy ? (
                          <FaArrowUp className="text-white text-[8px]" />
                        ) : (
                          <FaArrowDown className="text-white text-[8px]" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold truncate ${TC.textPrimary} ${TC.textItemHover}`}>
                          {activity.coinName}
                        </p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${statusClasses}`}>
                          {isBuy ? 'Buy' : 'Sell'}
                        </span>
                      </div>
                      <p className={`text-[10px] font-medium ${TC.textSecondary}`}>
                        {activity.date ? new Date(activity.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Recent'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <p className={`text-sm font-bold ${valueClasses}`}>
                      {isBuy ? '+' : '-'}{(activity.quantity || 1).toFixed(4)}
                    </p>
                    <p className={`text-[10px] font-medium ${TC.textAmount}`}>
                      ${((activity.amount || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentActivity;