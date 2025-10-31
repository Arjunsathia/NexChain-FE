import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';

function Portfolio() {
  const { balance } = useWalletContext();
  const { purchasedCoins = [], loading } = usePurchasedCoins() || { purchasedCoins: [], loading: false };

  // Prepare data for pie chart
  const coinsList = Array.isArray(purchasedCoins) ? purchasedCoins : [];

  const portfolioData = coinsList.map((coin, index) => ({
    name: coin.coinSymbol?.toUpperCase() || coin.coin_id || `COIN-${index + 1}`,
    value: (Number(coin.quantity) || 0) * (Number(coin.coinPriceUSD) || 0),
    color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 5]
  })).filter(item => item.value > 0); // filter out zero-value entries

  // Add cash to portfolio if exists
  const cashValue = Number(balance) || 0;
  if (cashValue > 0) {
    portfolioData.unshift({
      name: 'CASH',
      value: cashValue,
      color: '#6B7280'
    });
  }

  const totalPortfolioValue = portfolioData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  if (loading) {
    return (
      <div className="bg-transparent p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Portfolio Summary</h2>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Portfolio Summary</h2>
      
      {portfolioData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400">No portfolio data</p>
          <p className="text-sm text-gray-500 mt-1">Start investing to build your portfolio</p>
        </div>
      ) : (
        <>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
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

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-300">Total Portfolio Value</span>
              <span className="text-xl font-bold text-cyan-400">
                ₹{Number(totalPortfolioValue).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Invested</div>
                <div className="text-green-400 font-semibold">
                  ₹{Math.max(0, Number(totalPortfolioValue) - cashValue).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-center p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Cash</div>
                <div className="text-blue-400 font-semibold">
                  ₹{cashValue.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Portfolio breakdown */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-gray-400">
                    ₹{Number(item.value).toLocaleString('en-IN')}
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
