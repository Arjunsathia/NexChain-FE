import React from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaArrowUp, FaArrowDown, FaHistory } from "react-icons/fa";

function RecentActivity() {
  const { purchasedCoins, transactionHistory, loading } = usePurchasedCoins();

  const recentActivities = React.useMemo(() => {
    const allActivities = [];
    
    purchasedCoins.forEach(coin => {
      allActivities.push({
        type: 'buy',
        coinName: coin.coinName,
        coinSymbol: coin.coinSymbol,
        image: coin.image,
        quantity: coin.quantity,
        amount: coin.total_cost || coin.coinPriceUSD * coin.quantity,
        date: coin.purchaseDate || coin.createdAt,
        id: coin._id
      });
    });

    if (transactionHistory) {
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

    return allActivities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [purchasedCoins, transactionHistory]);

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 h-full fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-400/10 rounded-lg">
            <FaHistory className="text-cyan-400 text-lg" />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Recent Activity
          </h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 h-full fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 fade-in">
        <div className="p-2 bg-cyan-400/10 rounded-lg">
          <FaHistory className="text-cyan-400 text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Recent Activity
          </h2>
          <p className="text-xs text-gray-400">
            Latest transactions and purchases
          </p>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        {recentActivities.length === 0 ? (
          <div className="text-center py-6 flex flex-col items-center justify-center gap-3 h-full fade-in">
            <div className="p-3 bg-cyan-400/10 rounded-full">
              <FaHistory className="text-lg text-cyan-400" />
            </div>
            <p className="text-gray-400 text-sm">No recent activity</p>
            <p className="text-xs text-gray-500">Your transactions will appear here</p>
          </div>
        ) : (
          recentActivities.map((activity, idx) => {
            const isBuy = activity.type === 'buy';
            
            return (
              <div 
                key={activity.id || idx} 
                className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 hover:border-cyan-400/30 transition-all duration-200 group cursor-pointer fade-in"
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={activity.image} 
                    alt={activity.coinName}
                    className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 flex items-center justify-center ${
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
                      <p className="font-semibold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
                        {activity.coinName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {activity.coinSymbol?.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${
                        isBuy ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isBuy ? '+' : '-'}{(activity.quantity || 1).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-300 font-medium">
                        ${((activity.amount || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      isBuy 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {isBuy ? 'Bought' : 'Sold'}
                    </span>
                    <p className="text-xs text-gray-500 truncate">
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