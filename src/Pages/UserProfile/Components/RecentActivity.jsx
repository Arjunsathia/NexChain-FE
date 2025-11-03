import React from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';

function RecentActivity() {
  const { purchasedCoins, loading } = usePurchasedCoins();

  const recentActivities = [...purchasedCoins]
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
    .slice(0, 4);

  if (loading) {
    return (
      <div className="bg-transparent border border-gray-700 rounded-xl p-3 sm:p-4 h-full">
        <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Recent Activity</h2>
        <div className="animate-pulse space-y-1 sm:space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-700 rounded w-16 sm:w-20"></div>
                <div className="h-2 bg-gray-700 rounded w-12 sm:w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent border border-gray-700 rounded-xl p-3 sm:p-4 h-full">
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Recent Activity</h2>
      
      {recentActivities.length === 0 ? (
        <div className="text-center py-3 sm:py-4">
          <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">📝</div>
          <p className="text-gray-400 text-xs sm:text-sm">No activity</p>
        </div>
      ) : (
        <div className="space-y-1 sm:space-y-2">
          {recentActivities.map((activity, idx) => (
            <div 
              key={activity._id || idx} 
              className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors group"
            >
              <img 
                src={activity.image} 
                alt={activity.coinName}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full group-hover:scale-110 transition-transform flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-1 sm:gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-white text-xs sm:text-sm truncate group-hover:text-cyan-300 transition-colors">
                      {activity.coinName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {activity.coinSymbol?.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-1">
                    <p className="font-semibold text-green-400 text-xs sm:text-sm">
                      +{(activity.quantity || 1).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ₹{((activity.quantity || 1) * activity.coinPriceUSD).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {new Date(activity.purchaseDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;