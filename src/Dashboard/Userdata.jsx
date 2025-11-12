import useUserContext from '@/Context/UserContext/useUserContext';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
import { useLivePortfolio } from '@/hooks/useLivePortfolio';
import React, { useMemo } from 'react';
import { FaUser, FaChartLine, FaHistory, FaExclamationTriangle, FaWallet, FaCoins, FaExchangeAlt, FaArrowRight, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Userdata({ showProfile = true, showPortfolio = true, showRecentTrades = true }) {
  const { user } = useUserContext();
  const { balance } = useWalletContext();
  const { groupedHoldings, portfolioSummary, loading } = useLivePortfolio();
  const navigate = useNavigate();

  // Get top 4 coins for portfolio display (sorted by current value)
  const topCoins = useMemo(() => {
    return [...groupedHoldings]
      .sort((a, b) => (b.totalCurrentValue || 0) - (a.totalCurrentValue || 0))
      .slice(0, 4)
      .map(coin => ({
        ...coin,
        currentValue: coin.totalCurrentValue || 0,
        profitLoss: coin.profitLoss || 0,
        profitLossPercentage: coin.profitLossPercentage || 0
      }));
  }, [groupedHoldings]);

  // Get recent 4 trades (most recent first)
  const recentTrades = useMemo(() => {
    return [...groupedHoldings]
      .sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0))
      .slice(0, 4)
      .map(coin => ({
        ...coin,
        purchaseValue: coin.remainingInvestment || 0,
        currentValue: coin.totalCurrentValue || 0,
        profitLoss: coin.profitLoss || 0,
        profitLossPercentage: coin.profitLossPercentage || 0,
        purchaseDate: coin.purchaseDate || new Date().toISOString()
      }));
  }, [groupedHoldings]);

  const handleViewAllPortfolio = () => {
    navigate('/portfolio');
  };

  const handleViewAllTrades = () => {
    navigate('/trade-history');
  };

  const handleCoinClick = (coinId) => {
    navigate(`/coin/coin-details/${coinId}`);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl p-5 h-full flex flex-col fade-in" style={{ animationDelay: "0.1s" }}>
      
      {/* Profile Section */}
      {showProfile && (
        <div className="fade-in mb-5" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-400/10 rounded-lg">
                <FaUser className="text-cyan-400 text-base" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Profile
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600 hover:border-cyan-400/30 transition-all duration-200">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-lg flex items-center justify-center font-bold text-white shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">{user?.name || 'User'}</h3>
              <p className="text-gray-400 text-xs truncate mt-1">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <FaWallet className="text-cyan-400 text-sm" />
                Balance
              </div>
              <p className="text-green-400 font-bold text-sm">₹{balance?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Section - Limited to 4 coins */}
      {showPortfolio && (
        <div className="fade-in mb-5" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-400/10 rounded-lg">
                <FaChartLine className="text-cyan-400 text-base" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Top Holdings
              </h2>
            </div>
            {groupedHoldings.length > 4 && (
              <button 
                onClick={handleViewAllPortfolio}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50 px-3 py-1.5 rounded-xl border border-gray-600 hover:border-cyan-400/30 flex items-center gap-1"
              >
                View All
                <FaArrowRight className="text-xs" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 fade-in" style={{ animationDelay: `${0.4 + idx * 0.1}s` }}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-16 h-3 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-12 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : topCoins.length === 0 ? (
            <div className="text-center py-6 flex flex-col items-center justify-center gap-3 bg-gray-700/30 rounded-xl border border-gray-600 fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <FaCoins className="text-lg text-yellow-500" />
              </div>
              <p className="text-gray-400 text-sm">No coins purchased yet</p>
              <button 
                onClick={() => navigate('/cryptolist')}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-xl border border-gray-600 hover:border-cyan-400/30"
              >
                Explore Market
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {topCoins.map((coin, index) => (
                  <div 
                    key={coin.coinId || coin.id} 
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl border border-gray-600 hover:bg-gray-700/50 hover:border-cyan-400/30 transition-all duration-200 cursor-pointer group fade-in"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                    onClick={() => handleCoinClick(coin.coinId)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {coin.image ? (
                        <img 
                          src={coin.image} 
                          alt={coin.coinName} 
                          className="w-10 h-10 rounded-xl border border-gray-600 group-hover:scale-110 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-sm flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                          {coin.coinSymbol?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm group-hover:text-cyan-300 transition-colors truncate">
                            {coin.coinSymbol?.toUpperCase()}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            coin.profitLoss >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {coin.profitLoss >= 0 ? '+' : ''}{coin.profitLossPercentage?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs block truncate">
                          {coin.coinName || 'Crypto Coin'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="mb-1">
                        <span className="font-bold text-cyan-400 text-sm">
                          {(coin.totalQuantity || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-white text-xs font-medium">
                        ₹{coin.totalCurrentValue?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-medium ${
                        coin.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {coin.profitLoss >= 0 ? '+' : ''}₹{Math.abs(coin.profitLoss || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Portfolio Summary */}
              <div className="mt-4 pt-4 border-t border-gray-700 space-y-3 fade-in" style={{ animationDelay: "0.7s" }}>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Invested:</span>
                  <span className="text-white font-semibold">₹{portfolioSummary.remainingInvestment?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Current Value:</span>
                  <span className="text-white font-semibold">₹{portfolioSummary.totalCurrentValue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total P&L:</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${
                      portfolioSummary.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {portfolioSummary.totalProfitLoss >= 0 ? '+' : ''}₹{Math.abs(portfolioSummary.totalProfitLoss || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                      portfolioSummary.totalProfitLossPercentage >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {portfolioSummary.totalProfitLossPercentage >= 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                      {portfolioSummary.totalProfitLossPercentage >= 0 ? '+' : ''}{portfolioSummary.totalProfitLossPercentage?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent Trades Section - Limited to 4 trades */}
      {showRecentTrades && (
        <div className="fade-in flex-1" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-400/10 rounded-lg">
                <FaHistory className="text-cyan-400 text-base" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Recent Trades
              </h2>
            </div>
            {groupedHoldings.length > 4 && (
              <button 
                onClick={handleViewAllTrades}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50 px-3 py-1.5 rounded-xl border border-gray-600 hover:border-cyan-400/30 flex items-center gap-1"
              >
                View All
                <FaArrowRight className="text-xs" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 fade-in" style={{ animationDelay: `${0.5 + idx * 0.1}s` }}>
                  <div className="w-8 h-8 rounded bg-gray-700 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-36 h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-28 h-3 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentTrades.length === 0 ? (
            <div className="text-center py-6 flex flex-col items-center justify-center gap-3 bg-gray-700/30 rounded-xl border border-gray-600 h-full fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <FaExchangeAlt className="text-lg text-yellow-500" />
              </div>
              <p className="text-gray-400 text-sm">No recent trades</p>
              <button 
                onClick={() => navigate('/cryptolist')}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-xl border border-gray-600 hover:border-cyan-400/30"
              >
                Start Trading
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade, index) => (
                <div 
                  key={trade.coinId || trade.id} 
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl border border-gray-600 hover:bg-gray-700/50 hover:border-cyan-400/30 transition-all duration-200 cursor-pointer group fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  onClick={() => handleCoinClick(trade.coinId)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`text-lg group-hover:scale-110 transition-transform duration-200 ${
                      trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <FaExchangeAlt className="text-base" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm group-hover:text-cyan-300 transition-colors">
                          BUY
                        </span>
                        <span className="text-cyan-400 font-bold text-sm">
                          {(trade.totalQuantity || 0).toFixed(2)} {trade.coinSymbol?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">
                          {trade.purchaseDate ? new Date(trade.purchaseDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Recent'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          trade.profitLoss >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLossPercentage?.toFixed(2) || '0.00'}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white text-sm">
                      ₹{trade.totalCurrentValue?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className={`text-xs mt-1 font-medium ${
                      trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.profitLoss >= 0 ? '+' : ''}₹{Math.abs(trade.profitLoss || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {(showPortfolio || showRecentTrades) && !loading && (topCoins.length > 0 || recentTrades.length > 0) && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-700 text-sm text-gray-400 fade-in" style={{ animationDelay: "0.8s" }}>
          <span>User Dashboard</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Userdata;