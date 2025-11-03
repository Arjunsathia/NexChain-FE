import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';

function Portfolio() {
  const { balance } = useWalletContext();
  const { purchasedCoins = [], loading } = usePurchasedCoins() || { purchasedCoins: [], loading: false };

  const portfolioMap = {};
  
  const coinsList = Array.isArray(purchasedCoins) ? purchasedCoins : [];
  
  coinsList.forEach((coin) => {
    const symbol = coin.coinSymbol?.toUpperCase() || coin.coin_id;
    if (!symbol) return;
    
    if (!portfolioMap[symbol]) {
      portfolioMap[symbol] = {
        name: symbol,
        quantity: 0,
        totalValue: 0,
        color: getColorForSymbol(symbol)
      };
    }
    
    portfolioMap[symbol].quantity += Number(coin.quantity) || 0;
    portfolioMap[symbol].totalValue += (Number(coin.quantity) || 0) * (Number(coin.coinPriceUSD) || 0);
  });

  const portfolioData = Object.values(portfolioMap).filter(item => item.totalValue > 0);

  const cashValue = Number(balance) || 0;
  if (cashValue > 0) {
    portfolioData.unshift({
      name: 'CASH',
      totalValue: cashValue,
      quantity: cashValue,
      color: '#6B7280'
    });
  }

  const totalPortfolioValue = portfolioData.reduce((sum, item) => sum + (Number(item.totalValue) || 0), 0);

  function getColorForSymbol(symbol) {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];
    const index = symbol.charCodeAt(0) % colors.length;
    return colors[index];
  }

  if (loading) {
    return (
      <div className="bg-transparent border border-gray-700 rounded-xl p-3 sm:p-4 h-full">
        <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Portfolio</h2>
        <div className="animate-pulse">
          <div className="h-24 sm:h-32 bg-gray-700 rounded mb-2 sm:mb-3"></div>
          <div className="space-y-1">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent border border-gray-700 rounded-xl p-3 sm:p-4 h-full">
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Portfolio</h2>
      
      {portfolioData.length === 0 ? (
        <div className="text-center py-3 sm:py-4">
          <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">📊</div>
          <p className="text-gray-400 text-xs sm:text-sm">No portfolio data</p>
        </div>
      ) : (
        <>
          <div className="h-24 sm:h-32 mb-2 sm:mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={50}
                  paddingAngle={1}
                  dataKey="totalValue"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded-lg text-xs sm:text-sm">
              <span className="text-gray-300">Total Value</span>
              <span className="font-bold text-cyan-400">
                ₹{Number(totalPortfolioValue).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs">
              <div className="text-center p-1 sm:p-2 bg-gray-800/30 rounded">
                <div className="text-gray-400">Invested</div>
                <div className="text-green-400 font-semibold">
                  ₹{Math.max(0, Number(totalPortfolioValue) - cashValue).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-center p-1 sm:p-2 bg-gray-800/30 rounded">
                <div className="text-gray-400">Cash</div>
                <div className="text-blue-400 font-semibold">
                  ₹{cashValue.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="space-y-1 max-h-20 sm:max-h-24 overflow-y-auto text-xs">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-300 truncate">{item.name}</span>
                    {item.name !== 'CASH' && (
                      <span className="text-gray-500 text-xs ml-1 flex-shrink-0">
                        ({item.quantity.toFixed(2)})
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-right flex-shrink-0 ml-2">
                    ₹{Number(item.totalValue).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Portfolio;