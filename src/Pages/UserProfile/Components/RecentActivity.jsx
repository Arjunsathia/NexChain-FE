import React, { useMemo, useState, useEffect } from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaArrowUp, FaArrowDown, FaHistory } from "react-icons/fa";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

function RecentActivity() {
  const isLight = useThemeCheck();
  const { purchasedCoins, transactionHistory, loading } = usePurchasedCoins();

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    
    bgCard: isLight ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    
    // Header
    bgIcon: isLight ? "bg-blue-100" : "bg-cyan-400/10",
    iconColor: isLight ? "text-blue-600" : "text-cyan-400",
    headerGradient: "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",

    // Skeleton
    bgSkeleton: isLight ? "bg-gray-200" : "bg-gray-700",

    // Activity Item
    bgItem: isLight ? "bg-gray-100/70 border-none hover:bg-gray-100 shadow-sm" : "bg-gray-700/30 border-none hover:bg-gray-700/50 shadow-inner",
    textItemHover: isLight ? "group-hover:text-blue-600" : "group-hover:text-cyan-300",
    
    // Status (Buy/Sell)
    bgBuy: isLight ? "bg-green-100 text-green-700 border-none" : "bg-green-500/20 text-green-400 border-none",
    bgSell: isLight ? "bg-red-100 text-red-700 border-none" : "bg-red-500/20 text-red-400 border-none",
    
    textBuyValue: isLight ? "text-green-700" : "text-green-400",
    textSellValue: isLight ? "text-red-700" : "text-red-400",
    textAmount: isLight ? "text-gray-800" : "text-gray-300",

    // Icon Border
    iconBorder: isLight ? "border-white" : "border-gray-800",

    // Empty State
    bgEmptyIcon: isLight ? "bg-blue-100" : "bg-cyan-400/10",
    textEmptyIcon: isLight ? "text-blue-600" : "text-cyan-400",

  }), [isLight]);

  const recentActivities = useMemo(() => {
    const allActivities = [];
    
    // Assuming purchasedCoins contains purchase history or current holdings
    purchasedCoins.forEach(coin => {
      // Create a 'buy' activity for each holding
      allActivities.push({
        type: 'buy',
        coinName: coin.coinName,
        coinSymbol: coin.coinSymbol,
        image: coin.image,
        quantity: coin.quantity,
        amount: coin.total_cost || coin.coinPriceUSD * coin.quantity,
        date: coin.purchaseDate || coin.createdAt,
        id: coin._id + '-buy'
      });
    });

    if (transactionHistory) {
      transactionHistory.forEach(transaction => {
        // Add actual transactions (buy/sell)
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

    // Filter to remove duplicates if necessary and sort
    const uniqueActivities = allActivities.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    return uniqueActivities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [purchasedCoins, transactionHistory]);

  if (loading) {
    return (
      <div className={`${TC.bgCard} rounded-xl p-5 h-full fade-in`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${TC.bgIcon}`}>
            <FaHistory className={`${TC.iconColor} text-lg`} />
          </div>
          <h2 className={`text-lg font-bold ${TC.headerGradient}`}>
            Recent Activity
          </h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className={`w-10 h-10 ${TC.bgSkeleton} rounded-full`}></div>
              <div className="flex-1 space-y-2">
                <div className={`h-4 ${TC.bgSkeleton} rounded w-20`}></div>
                <div className={`h-3 ${TC.bgSkeleton} rounded w-16`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${TC.bgCard} rounded-xl p-5 h-full fade-in`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 fade-in">
        <div className={`p-2 rounded-lg ${TC.bgIcon}`}>
          <FaHistory className={`${TC.iconColor} text-lg`} />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${TC.headerGradient}`}>
            Recent Activity
          </h2>
          <p className={`text-xs ${TC.textSecondary}`}>
            Latest transactions and purchases
          </p>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        {recentActivities.length === 0 ? (
          <div className="text-center py-6 flex flex-col items-center justify-center gap-3 h-full fade-in">
            <div className={`p-3 rounded-full ${TC.bgEmptyIcon}`}>
              <FaHistory className={`text-lg ${TC.textEmptyIcon}`} />
            </div>
            <p className={`${TC.textSecondary} text-sm`}>No recent activity</p>
            <p className={`${TC.textTertiary} text-xs`}>Your transactions will appear here</p>
          </div>
        ) : (
          recentActivities.map((activity, idx) => {
            const isBuy = activity.type === 'buy';
            const statusClasses = isBuy ? TC.bgBuy : TC.bgSell;
            const valueClasses = isBuy ? TC.textBuyValue : TC.textSellValue;
            
            return (
              <div 
                key={activity.id || idx} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group cursor-pointer fade-in ${TC.bgItem}`}
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={activity.image} 
                    alt={activity.coinName}
                    className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 ${TC.iconBorder} flex items-center justify-center ${
                    isBuy ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isBuy ? (
                      <FaArrowUp className="text-white text-xs" />
                    ) : (
                      <FaArrowDown className="text-white text-xs" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm truncate transition-colors ${TC.textPrimary} ${TC.textItemHover}`}>
                        {activity.coinName}
                      </p>
                      <p className={`text-xs truncate ${TC.textSecondary}`}>
                        {activity.coinSymbol?.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${valueClasses}`}>
                        {isBuy ? '+' : '-'}{(activity.quantity || 1).toFixed(2)}
                      </p>
                      <p className={`text-xs font-medium ${TC.textAmount}`}>
                        ${((activity.amount || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusClasses}`}>
                      {isBuy ? 'Bought' : 'Sold'}
                    </span>
                    <p className={`text-xs truncate ${TC.textTertiary}`}>
                      {activity.date ? new Date(activity.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Recent'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentActivity;