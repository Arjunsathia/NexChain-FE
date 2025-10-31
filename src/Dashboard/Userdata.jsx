// Userdata.jsx
import useUserContext from '@/Context/UserContext/useUserContext';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import React from 'react';

function Userdata({ showProfile = true, showPortfolio = true, showRecentTrades = true }) {
  const { user } = useUserContext();
  const { balance } = useWalletContext();
  const { purchasedCoins, loading } = usePurchasedCoins();

  // Calculate portfolio stats from real data
  const totalInvested = purchasedCoins.reduce((total, coin) => {
    return total + (coin.coinPriceUSD * (coin.quantity || 1));
  }, 0);

  // Get top 3 coins for portfolio display
  const topCoins = purchasedCoins.slice(0, 3);
  
  // Get recent 3 trades (most recent first)
  const recentTrades = [...purchasedCoins].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)).slice(0, 3);

  return (
    <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-4 lg:p-6 text-white h-full fade-in">
      
      {/* Profile Section */}
      {showProfile && (
        <div className="text-center space-y-3 fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-xl flex items-center justify-center font-bold shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h2 className="text-lg font-semibold truncate text-cyan-400">{user?.name || 'User'}</h2>
          <p className="text-sm text-gray-400">Virtual Wallet Balance</p>
          <p className="text-xl font-bold text-green-400">₹{balance?.toLocaleString('en-IN')}</p>
        </div>
      )}

      {/* Portfolio Section */}
      {showPortfolio && (
        <div className="mt-4 fade-in" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-md font-semibold mb-3 text-cyan-400 flex items-center gap-2">
            <span>📊</span> Portfolio Overview
          </h3>
          {loading ? (
            <div className="text-center py-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div>
            </div>
          ) : topCoins.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3 bg-gray-800/30 rounded-lg">No coins purchased yet</p>
          ) : (
            <>
              <ul className="text-sm space-y-2">
                {topCoins.map((coin, index) => (
                  <li 
                    key={coin._id} 
                    className="flex justify-between items-center p-2 hover:bg-gray-800/30 rounded-lg transition-colors fade-in"
                    style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
                  >
                    <span className="truncate font-medium">{coin.coinSymbol?.toUpperCase()}</span>
                    <span className="text-cyan-400 font-semibold">{(coin.quantity || 1).toFixed(4)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-sm text-gray-300 border-t border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span>Total Invested:</span>
                  <span className="text-green-400 font-semibold">₹{totalInvested.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent Trades Section */}
      {showRecentTrades && (
        <div className="mt-4 fade-in" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-md font-semibold mb-3 text-cyan-400 flex items-center gap-2">
            <span>🕒</span> Recent Trades
          </h3>
          {loading ? (
            <div className="text-center py-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div>
            </div>
          ) : recentTrades.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3 bg-gray-800/30 rounded-lg">No recent trades</p>
          ) : (
            <ul className="text-sm space-y-2">
              {recentTrades.map((trade, index) => (
                <li 
                  key={trade._id} 
                  className="flex items-center gap-3 p-2 hover:bg-gray-800/30 rounded-lg transition-colors fade-in"
                  style={{ animationDelay: `${0.4 + (index * 0.1)}s` }}
                >
                  <span className="text-green-400 text-lg">✔️</span>
                  <span className="truncate flex-1">
                    Bought <span className="text-cyan-400 font-semibold">{(trade.quantity || 1).toFixed(2)}</span> {trade.coinSymbol?.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Userdata;