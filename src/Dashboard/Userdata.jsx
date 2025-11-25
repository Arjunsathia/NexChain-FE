import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FaUser, FaChartLine, FaHistory, FaWallet, FaCoins, FaExchangeAlt, FaArrowRight, FaArrowUp, FaArrowDown, FaMoneyBillWave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useUserContext from '@/Context/UserContext/useUserContext';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
import { useLivePortfolio } from '@/hooks/useLivePortfolio';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';

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

function Userdata({ showProfile = true, showPortfolio = true, showRecentTrades = true }) {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const { balance } = useWalletContext();
  const { groupedHoldings, loading: portfolioLoading } = useLivePortfolio();
  const { transactionHistory, loading: transactionsLoading } = usePurchasedCoins();
  const navigate = useNavigate();
  
  const [livePrices, setLivePrices] = useState({});
  const ws = useRef(null);
  const livePricesRef = useRef({});

  // 💡 Theme Classes Helper (UPDATED to include dedicated footer button classes)
  const TC = useMemo(() => ({
    bgContainer: isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgItem: isLight ? "bg-gray-100/50 border-gray-300 hover:bg-gray-100 hover:border-cyan-600/30" : "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-cyan-400/30",
    borderItem: isLight ? "border-gray-300" : "border-gray-700/50",
    bgIcon: isLight ? "bg-cyan-100" : "bg-cyan-400/10",
    textIcon: isLight ? "text-cyan-600" : "text-cyan-400",
    textWallet: isLight ? "text-green-700" : "text-green-400",
    bgWallet: isLight ? "bg-green-100" : "bg-green-400/10",
    bgTradeIcon: (isBuy) => isBuy ? (isLight ? "bg-green-100/70 text-green-600" : "bg-green-500/20 text-green-400") : (isLight ? "bg-red-100/70 text-red-600" : "bg-red-500/20 text-red-400"),
    textPriceAccent: isLight ? "text-yellow-600/70" : "text-yellow-400/70",
    textDateAccent: isLight ? "text-cyan-600/70" : "text-cyan-400/70",
    textPLPositive: isLight ? "text-green-700" : "text-green-400",
    textPLNegative: isLight ? "text-red-700" : "text-red-400",
    bgPLPositive: isLight ? "bg-green-100/50" : "bg-green-500/20",
    bgPLNegative: isLight ? "bg-red-100/50" : "bg-red-500/20",
    bgLoading: isLight ? "bg-gray-200" : "bg-gray-700",
    bgEmpty: isLight ? "bg-gray-100/70 border-gray-300" : "bg-gray-700/30 border-gray-600",
    textEmpty: isLight ? "text-gray-500" : "text-gray-400",

    // NEW: Dedicated button classes for proper hover effect (using cyan accent)
    bgFooterButton: isLight 
      ? "bg-gray-200 border-gray-300 hover:bg-cyan-100/70 hover:border-cyan-500" 
      : "bg-gray-700/50 border-gray-600 hover:bg-cyan-900/40 hover:border-cyan-400",
    textFooterButton: isLight ? "text-cyan-600" : "text-cyan-400",
    textHoverAccent: isLight 
      ? "group-hover:text-cyan-700" 
      : "group-hover:text-cyan-300",
  }), [isLight]);

  // Update ref when livePrices changes
  useEffect(() => { livePricesRef.current = livePrices; }, [livePrices]);

  // WebSocket setup for live price updates (omitted body for brevity, assumes logic remains)
  useEffect(() => {
    if (groupedHoldings.length === 0) return;

    const symbols = groupedHoldings
      .map(coin => {
        const symbolMap = {
          bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt", cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt", "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt", "stellar": "xlmusdt", "cosmos": "atomusdt", "monero": "xmusdt", "ethereum-classic": "etcusdt", "bitcoin-cash": "bchusdt", "filecoin": "filusdt", "theta": "thetausdt", "vechain": "vetusdt", "tron": "trxusdt"
        };
        return symbolMap[coin.coinId] ? `${symbolMap[coin.coinId]}@ticker` : null;
      })
      .filter(Boolean);

    if (symbols.length === 0) return;

    const streams = symbols.join('/');

    try {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

      ws.current.onopen = () => { console.log('WebSocket connected for user data live prices'); };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace('@ticker', '');
          const coinData = message.data;
          
          const symbolToCoinId = {
            "btcusdt": "bitcoin", "ethusdt": "ethereum", "bnbusdt": "binancecoin", "xrpusdt": "ripple", "adausdt": "cardano", "solusdt": "solana", "dogeusdt": "dogecoin", "dotusdt": "polkadot", "maticusdt": "matic-network", "ltcusdt": "litecoin", "linkusdt": "chainlink", "xlmusdt": "stellar", "atomusdt": "cosmos", "xmusdt": "monero", "etcusdt": "ethereum-classic", "bchusdt": "bitcoin-cash", "filusdt": "filecoin", "thetausdt": "theta", "vetusdt": "vechain", "trxusdt": "tron"
          };

          const coinId = symbolToCoinId[symbol];
          if (coinId) {
            setLivePrices(prev => ({
              ...prev,
              [coinId]: {
                current_price: parseFloat(coinData.c), price_change_percentage_24h: parseFloat(coinData.P), price_change_24h: parseFloat(coinData.p),
              }
            }));
          }
        }
      };

      ws.current.onerror = (error) => { console.error('User data WebSocket error:', error); };
      ws.current.onclose = () => { console.log('User data WebSocket disconnected'); };

    } catch (error) { console.error('User data WebSocket setup failed:', error); }

    return () => {
      if (ws.current) { ws.current.close(); }
    };
  }, [groupedHoldings]);

  // Get all coins for portfolio display with live data
  const allCoins = useMemo(() => {
    const holdingsWithLiveData = groupedHoldings.map(coin => {
      const livePriceData = livePrices[coin.coinId];
      if (livePriceData) {
        const currentPrice = livePriceData.current_price;
        const currentValue = (coin.totalQuantity || 0) * currentPrice;
        const remainingInvestment = coin.remainingInvestment || 0;
        const profitLoss = currentValue - remainingInvestment;
        const profitLossPercentage = remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

        return {
          ...coin, currentPrice: currentPrice, priceChange24h: livePriceData.price_change_percentage_24h,
          totalCurrentValue: currentValue, profitLoss: profitLoss, profitLossPercentage: profitLossPercentage, hasLiveData: true
        };
      }
      
      return {
        ...coin, currentPrice: coin.currentPrice || coin.current_price, totalCurrentValue: coin.totalCurrentValue || 0,
        profitLoss: coin.profitLoss || 0, profitLossPercentage: coin.profitLossPercentage || 0, hasLiveData: false
      };
    });

    return holdingsWithLiveData
      .sort((a, b) => (b.totalCurrentValue || 0) - (a.totalCurrentValue || 0))
      .map(coin => ({
        ...coin,
        currentValue: coin.totalCurrentValue || 0,
        profitLoss: coin.profitLoss || 0,
        profitLossPercentage: coin.profitLossPercentage || 0
      }));
  }, [groupedHoldings, livePrices]);

  // Get recent transactions (last 4)
  const recentTransactions = useMemo(() => {
    if (!transactionHistory) return [];
    return transactionHistory
      .sort((a, b) => new Date(b.transactionDate || b.purchase_date) - new Date(a.transactionDate || a.purchase_date))
      .slice(0, 4);
  }, [transactionHistory]);

  // Calculate portfolio summary with live data
  const livePortfolioSummary = useMemo(() => {
    const totalCurrentValue = allCoins.reduce((sum, coin) => sum + (coin.totalCurrentValue || 0), 0);
    const totalInvestment = allCoins.reduce((sum, coin) => sum + (coin.remainingInvestment || 0), 0);
    const totalProfitLoss = totalCurrentValue - totalInvestment;
    const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    return {
      totalCurrentValue, remainingInvestment: totalInvestment, totalProfitLoss,
      totalProfitLossPercentage, hasLiveData: Object.keys(livePrices).length > 0
    };
  }, [allCoins, livePrices]);

  const handleViewAllPortfolio = () => { navigate('/portfolio'); };
  const handleViewAllTrades = () => { navigate('/trade-history'); };
  const handleCoinClick = (coinId) => { navigate(`/coin/coin-details/${coinId}`); };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className={`rounded-xl p-4 h-full flex flex-col gap-4 fade-in border ${TC.bgContainer}`}>
      
      {/* Compact Profile Section */}
      {showProfile && (
        <div className="fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${TC.bgIcon}`}>
                <FaUser className={TC.textIcon + " text-sm"} />
              </div>
              <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Profile
              </h2>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl border hover:border-cyan-600/30 transition-all duration-200 group ${TC.bgItem}`}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-sm flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-xs truncate ${TC.textPrimary}`}>{user?.name || 'User'}</h3>
              <p className={`text-xs truncate mt-0.5 ${TC.textSecondary}`}>{user?.email || 'user@example.com'}</p>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-xs mb-1 ${TC.textSecondary}`}>
                <FaWallet className={TC.textIcon + " text-xs"} />
                Balance
              </div>
              <p className={`font-bold text-xs ${TC.textWallet}`}>${balance?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Section */}
      {showPortfolio && (
        <div className="fade-in flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${TC.bgIcon}`}>
                <FaChartLine className={TC.textIcon + " text-sm"} />
              </div>
              <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Holdings
              </h2>
            </div>
          </div>

          {portfolioLoading ? (
            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 fade-in">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-lg ${TC.bgLoading} animate-pulse`}></div>
                    <div className="flex-1 space-y-1.5">
                      <div className={`w-16 h-3 ${TC.bgLoading} rounded animate-pulse`}></div>
                      <div className={`w-12 h-2 ${TC.bgLoading} rounded animate-pulse`}></div>
                    </div>
                  </div>
                  <div className={`w-10 h-3 ${TC.bgLoading} rounded animate-pulse`}></div>
                </div>
              ))}
            </div>
          ) : allCoins.length === 0 ? (
            <div className={`text-center py-4 flex flex-col items-center justify-center gap-2 rounded-xl border flex-1 fade-in ${TC.bgEmpty}`}>
              <div className={`p-2 rounded-full ${TC.bgIcon}`}>
                <FaCoins className={TC.textIcon + " text-base"} />
              </div>
              <p className={`text-xs ${TC.textEmpty}`}>No coins purchased yet</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Scrollable coins list */}
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2">
                {allCoins.slice(0, 6).map((coin) => (
                  <div 
                    key={coin.coinId || coin.id} 
                    className={`flex items-center justify-between p-2 rounded-lg border hover:border-cyan-600/30 transition-all duration-200 cursor-pointer group fade-in ${TC.bgItem}`}
                    onClick={() => handleCoinClick(coin.coinId)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {coin.image ? (
                        <img 
                          src={coin.image} 
                          alt={coin.coinName} 
                          className={`w-8 h-8 rounded-lg border ${TC.borderItem} group-hover:scale-110 transition-transform duration-200`}
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-xs flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                          {coin.coinSymbol?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`font-semibold text-xs transition-colors truncate ${TC.textPrimary} ${isLight ? "group-hover:text-cyan-600" : "group-hover:text-cyan-300"}`}>
                            {coin.coinSymbol?.toUpperCase()}
                          </span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                            coin.profitLoss >= 0 ? TC.bgPLPositive : TC.bgPLNegative
                          }`}>
                            {coin.profitLoss >= 0 ? '+' : ''}{coin.profitLossPercentage?.toFixed(1) || '0.0'}%
                          </span>
                        </div>
                        <span className={`text-xs block truncate ${TC.textSecondary}`}>
                          {(coin.totalQuantity || 0).toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={TC.textIcon + " font-bold text-xs"}>
                        ${coin.totalCurrentValue?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div className={`text-xs font-medium ${
                        coin.profitLoss >= 0 ? TC.textPLPositive : TC.textPLNegative
                      }`}>
                        {coin.profitLoss >= 0 ? '+' : ''}${Math.abs(coin.profitLoss || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Portfolio Summary */}
              <div className={`pt-3 mt-2 border-t ${TC.borderItem} space-y-2 fade-in`}>
                <div className={`flex justify-between items-center text-xs ${TC.textSecondary}`}>
                  <span>Invested:</span>
                  <span className={TC.textPrimary + " font-semibold"}>${livePortfolioSummary.remainingInvestment?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                <div className={`flex justify-between items-center text-xs ${TC.textSecondary}`}>
                  <span>Current:</span>
                  <span className={TC.textPrimary + " font-semibold"}>${livePortfolioSummary.totalCurrentValue?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                <div className={`flex justify-between items-center text-xs ${TC.textSecondary}`}>
                  <span>P&L:</span>
                  <div className="flex items-center gap-1">
                    <span className={`font-bold ${
                      livePortfolioSummary.totalProfitLoss >= 0 ? TC.textPLPositive : TC.textPLNegative
                    }`}>
                      {livePortfolioSummary.totalProfitLoss >= 0 ? '+' : ''}${Math.abs(livePortfolioSummary.totalProfitLoss || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                      livePortfolioSummary.totalProfitLossPercentage >= 0 ? TC.bgPLPositive : TC.bgPLNegative
                    }`}>
                      {livePortfolioSummary.totalProfitLossPercentage >= 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                      {livePortfolioSummary.totalProfitLossPercentage >= 0 ? '+' : ''}{livePortfolioSummary.totalProfitLossPercentage?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View All Portfolio Button (APPLYING NEW HOVER CLASSES) */}
          <button 
            onClick={handleViewAllPortfolio}
            className={`
              w-full mt-3 text-xs font-semibold py-2 rounded-lg transition-all duration-200 
              flex items-center justify-center gap-1 group fade-in border 
              ${TC.bgFooterButton} 
              ${TC.textFooterButton} 
              ${TC.textHoverAccent}
            `}
          >
            View All Holdings
            <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>
      )}

      {/* Recent Transactions Section */}
      {showRecentTrades && (
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
                  <div className={`w-6 h-6 rounded ${TC.bgLoading} animate-pulse`}></div>
                  <div className="flex-1 space-y-1.5">
                    <div className={`w-24 h-3 ${TC.bgLoading} rounded animate-pulse`}></div>
                    <div className={`w-20 h-2 ${TC.bgLoading} rounded animate-pulse`}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className={`text-center py-4 flex flex-col items-center justify-center gap-2 rounded-xl border flex-1 fade-in ${TC.bgEmpty}`}>
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
                  const isBuy = transaction.type === 'buy';
                  
                  return (
                    <div 
                      key={transaction._id || `tx-${index}`}
                      className={`flex items-center gap-2 p-2 rounded-lg border hover:border-cyan-600/30 transition-all duration-200 cursor-pointer group fade-in ${TC.bgItem}`}
                      onClick={() => handleCoinClick(transaction.coinId || transaction.coin_id)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isBuy ? TC.bgTradeIcon(true) : TC.bgTradeIcon(false)
                      }`}>
                        {isBuy ? <FaArrowUp className="text-sm" /> : <FaArrowDown className="text-sm" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="min-w-0 flex-1">
                            <p className={`font-semibold text-xs truncate ${TC.textPrimary}`}>
                              {transaction.coinName || transaction.coin_name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-xs ${TC.textSecondary}`}>{transaction.coinSymbol?.toUpperCase()}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                isBuy ? TC.bgPLPositive : TC.bgPLNegative
                              }`}>
                                {isBuy ? 'Bought' : 'Sold'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className={`font-bold text-xs ${isBuy ? TC.textPLPositive : TC.textPLNegative}`}>
                              {isBuy ? '+' : '-'}{(transaction.quantity || 0).toFixed(4)}
                            </p>
                            <p className={`text-xs ${TC.textSecondary}`}>
                              ${(transaction.totalValue || transaction.total_cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`flex items-center justify-between text-xs ${TC.textSecondary} pt-1 border-t ${TC.borderItem}`}>
                          <div className="flex items-center gap-1">
                            <FaMoneyBillWave className={TC.textPriceAccent + " text-xs"} />
                            ${(transaction.price || transaction.coin_price_usd || 0).toLocaleString('en-IN', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: (transaction.price || transaction.coin_price_usd || 0) < 1 ? 6 : 2 
                            })}
                          </div>
                          <span className="flex items-center gap-1">
                            <FaExchangeAlt className={TC.textDateAccent + " text-xs"} />
                            {formatDateTime(transaction.transactionDate || transaction.purchase_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* View All Trades Button (APPLYING NEW HOVER CLASSES) */}
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
      )}
      
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

export default Userdata;