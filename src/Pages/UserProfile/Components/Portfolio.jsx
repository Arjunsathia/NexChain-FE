import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
import { FaCoins, FaWallet, FaChartPie } from "react-icons/fa";

function Portfolio() {
  const { balance } = useWalletContext();
  const { purchasedCoins = [], loading } = usePurchasedCoins() || { purchasedCoins: [], loading: false };

  const portfolioData = React.useMemo(() => {
    const portfolioMap = {};
    const coinsList = Array.isArray(purchasedCoins) ? purchasedCoins : [];
    
    coinsList.forEach((coin) => {
      const symbol = coin.coinSymbol?.toUpperCase() || coin.coin_id;
      if (!symbol) return;
      
      if (!portfolioMap[symbol]) {
        portfolioMap[symbol] = {
          name: symbol,
          fullName: coin.coinName || coin.coin_name || symbol,
          quantity: 0,
          totalValue: 0,
          color: getColorForSymbol(symbol),
          type: 'crypto'
        };
      }
      
      const quantity = Number(coin.quantity) || 0;
      const price = Number(coin.current_price) || Number(coin.coinPriceUSD) || 0;
      portfolioMap[symbol].quantity += quantity;
      portfolioMap[symbol].totalValue += quantity * price;
    });

    let data = Object.values(portfolioMap).filter(item => item.totalValue > 0);

    const cashValue = Number(balance) || 0;
    if (cashValue > 0) {
      data.unshift({
        name: 'CASH',
        fullName: 'Cash Balance',
        totalValue: cashValue,
        quantity: cashValue,
        color: '#10B981',
        type: 'cash'
      });
    }

    return data;
  }, [purchasedCoins, balance]);

  const totalPortfolioValue = portfolioData.reduce((sum, item) => sum + (Number(item.totalValue) || 0), 0);
  const investedValue = portfolioData.filter(item => item.type === 'crypto').reduce((sum, item) => sum + item.totalValue, 0);
  const cashValue = Number(balance) || 0;

  function getColorForSymbol(symbol) {
    const colors = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    const index = symbol.charCodeAt(0) % colors.length;
    return colors[index];
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalPortfolioValue > 0 ? ((data.totalValue / totalPortfolioValue) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-white text-sm mb-1">{data.fullName || data.name}</p>
          <p className="text-cyan-400 font-bold">
            ${data.totalValue.toLocaleString('en-IN', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
          <p className="text-gray-300 text-xs mt-1">{percentage}% of portfolio</p>
          {data.type === 'crypto' && (
            <p className="text-gray-400 text-xs mt-2">
              Quantity: {data.quantity.toFixed(6)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 h-full fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-400/10 rounded-lg">
            <FaChartPie className="text-cyan-400 text-lg" />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Portfolio
          </h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-700 rounded-xl mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 h-full fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-400/10 rounded-lg">
            <FaChartPie className="text-cyan-400 text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Portfolio
            </h2>
            <p className="text-xs text-gray-400">
              ${totalPortfolioValue.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} total value
            </p>
          </div>
        </div>
      </div>
      
      {portfolioData.length === 0 ? (
        <div className="text-center py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg fade-in">
          <div className="p-3 bg-cyan-400/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <FaChartPie className="text-xl text-cyan-400" />
          </div>
          <p className="text-gray-300 text-base font-semibold mb-1">No portfolio data</p>
          <p className="text-gray-500 text-sm">Start investing to see your portfolio</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="h-48 mb-6 fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="totalValue"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {portfolioData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#1F2937"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="space-y-4 p-4 rounded-lg border border-gray-600 bg-gray-700/30 fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <FaChartPie className="text-cyan-400" />
                <span className="text-sm font-semibold">Total Value</span>
              </div>
              <span className="text-lg font-bold text-white">
                ${totalPortfolioValue.toLocaleString('en-IN', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3 border border-gray-600 text-center bg-gray-800/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FaCoins className="text-cyan-400 text-sm" />
                  <span className="text-xs text-gray-400">Invested</span>
                </div>
                <div className="text-cyan-400 font-bold text-sm">
                  ${investedValue.toLocaleString('en-IN', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
              </div>
              
              <div className="rounded-lg p-3 border border-gray-600 text-center bg-gray-800/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FaWallet className="text-green-400 text-sm" />
                  <span className="text-xs text-gray-400">Cash</span>
                </div>
                <div className="text-green-400 font-bold text-sm">
                  ${cashValue.toLocaleString('en-IN', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
              </div>
            </div>

            {/* Holdings List */}
            <div className="pt-3 border-t border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400 font-semibold">Holdings</span>
                <span className="text-sm text-gray-400">
                  {portfolioData.filter(item => item.type === 'crypto').length} coins
                </span>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {portfolioData.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between py-2 px-2 group hover:bg-gray-600/30 rounded-lg transition-all duration-200 cursor-pointer fade-in"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-md" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </p>
                        {item.type === 'crypto' && (
                          <p className="text-xs text-gray-400 truncate">
                            {item.quantity.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        ${item.totalValue.toLocaleString('en-IN', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {totalPortfolioValue > 0 ? ((item.totalValue / totalPortfolioValue) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Portfolio;