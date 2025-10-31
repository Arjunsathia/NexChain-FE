import React from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';

function RecentActivity() {
  const { purchasedCoins, loading } = usePurchasedCoins();

  // Sort by most recent first
  const recentActivities = [...purchasedCoins]
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="bg-gradient-to-br p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
      
      {recentActivities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-400">No recent activity</p>
          <p className="text-sm text-gray-500 mt-1">Your transactions will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentActivities.map((activity, idx) => (
            <div 
              key={activity._id || idx} 
              className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
            >
              <img 
                src={activity.image} 
                alt={activity.coinName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <p className="font-semibold text-white truncate">
                      {activity.coinName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {activity.coinSymbol?.toUpperCase()} • Purchase
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">
                      +{(activity.quantity || 1).toFixed(4)}
                    </p>
                    <p className="text-sm text-gray-400">
                      ₹{((activity.quantity || 1) * activity.coinPriceUSD).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(activity.purchaseDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
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