import React, { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
import { FaCoins, FaWallet, FaChartPie } from "react-icons/fa";

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

function Portfolio() {
  const isLight = useThemeCheck();
  const { balance } = useWalletContext();
  const { purchasedCoins = [], loading } = usePurchasedCoins() || { purchasedCoins: [], loading: false };

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    bgCard: isLight ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    
    // Header
    bgIcon: "",
    iconColor: isLight ? "text-blue-600" : "text-cyan-400",
    headerGradient: "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",

    // Skeleton
    bgSkeleton: isLight ? "bg-gray-200" : "bg-gray-700",

    // Tooltip
    bgTooltip: isLight ? "bg-white/90 shadow-lg border-none" : "bg-gray-800/90 shadow-lg border-none",
    textTooltipValue: isLight ? "text-blue-600" : "text-cyan-400",

    // Empty State
    bgEmpty: isLight ? "border-dashed border-gray-400" : "border-dashed border-gray-600",
    bgEmptyIcon: "",
    textEmptyIcon: isLight ? "text-blue-600" : "text-cyan-400",
    textEmptyTitle: isLight ? "text-gray-800" : "text-gray-300",
    
    // Stats Section
    bgStatsSection: isLight ? "bg-gray-100/70 border-none" : "bg-gray-700/30 border-none",
    bgStatItem: isLight ? "bg-white border-none shadow-sm" : "bg-gray-800/50 border-none shadow-inner",
    
    // Holding List
    bgHoldingItem: isLight ? "hover:bg-gray-200/50" : "hover:bg-gray-600/30",
    textHoldingItemHover: isLight ? "group-hover:text-blue-600" : "group-hover:text-cyan-300",
    
    // Specific stat colors
    textInvested: isLight ? "text-blue-600" : "text-cyan-400",
    textCash: isLight ? "text-green-600" : "text-green-400",

    // Pie Chart
    strokeColor: isLight ? "#F3F4F6" : "#1F2937", // Light gray or Dark gray for cell stroke
    
  }), [isLight]);


  const portfolioData = useMemo(() => {
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
        // Using dynamic colors for cash based on theme
        color: isLight ? '#10B981' : '#10B981', 
        type: 'cash'
      });
    }

    return data;
  }, [purchasedCoins, balance, isLight]);

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
        <div className={`${TC.bgTooltip} rounded-lg p-3 shadow-xl`}>
          <p className={`font-semibold text-sm mb-1 ${TC.textPrimary}`}>{data.fullName || data.name}</p>
          <p className={`font-bold ${TC.textTooltipValue}`}>
            ${data.totalValue.toLocaleString('en-IN', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
          <p className={`text-xs mt-1 ${TC.textSecondary}`}>{percentage}% of portfolio</p>
          {data.type === 'crypto' && (
            <p className={`text-xs mt-2 ${TC.textSecondary}`}>
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
      <div className={`${TC.bgCard} rounded-xl p-5 h-full fade-in`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`${TC.bgIcon}`}>
            <FaChartPie className={`${TC.iconColor} text-lg`} />
          </div>
          <h2 className={`text-lg font-bold ${TC.headerGradient}`}>
            Portfolio
          </h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className={`h-40 ${TC.bgSkeleton} rounded-xl mb-4`}></div>
          <div className="space-y-3">
            <div className={`h-4 ${TC.bgSkeleton} rounded`}></div>
            <div className={`h-4 ${TC.bgSkeleton} rounded`}></div>
            <div className={`h-4 ${TC.bgSkeleton} rounded`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${TC.bgCard} rounded-lg sm:rounded-xl p-3 sm:p-5 h-full fade-in transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-4 fade-in">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`${TC.bgIcon}`}>
            <FaChartPie className={`${TC.iconColor} text-base sm:text-lg`} />
          </div>
          <div>
            <h2 className={`text-base sm:text-lg font-bold ${TC.headerGradient}`}>
              Portfolio
            </h2>
            <p className={`text-[10px] sm:text-xs ${TC.textSecondary}`}>
              ${totalPortfolioValue.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} total value
            </p>
          </div>
        </div>
      </div>
      
      {portfolioData.length === 0 ? (
        <div className={`text-center py-8 flex flex-col items-center justify-center border-2 border-dashed rounded-lg fade-in ${TC.bgEmpty}`}>
          <div className={`w-12 h-12 flex items-center justify-center mx-auto mb-3 ${TC.bgEmptyIcon}`}>
            <FaChartPie className={`text-xl ${TC.textEmptyIcon}`} />
          </div>
          <p className={`text-base font-semibold mb-1 ${TC.textEmptyTitle}`}>No portfolio data</p>
          <p className={`text-sm ${TC.textTertiary}`}>Start investing to see your portfolio</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="h-40 sm:h-48 mb-4 sm:mb-6 fade-in">
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
                      stroke={TC.strokeColor}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className={`space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg ${TC.bgStatsSection} fade-in`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${TC.textSecondary}`}>
                <FaChartPie className={TC.iconColor} />
                <span className="text-xs sm:text-sm font-semibold">Total Value</span>
              </div>
              <span className={`text-base sm:text-lg font-bold ${TC.textPrimary}`}>
                ${totalPortfolioValue.toLocaleString('en-IN', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className={`rounded-lg p-2 sm:p-3 text-center ${TC.bgStatItem}`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FaCoins className={TC.iconColor} />
                  <span className={`text-[10px] sm:text-xs ${TC.textSecondary}`}>Invested</span>
                </div>
                <div className={`font-bold text-xs sm:text-sm ${TC.textInvested}`}>
                  ${investedValue.toLocaleString('en-IN', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
              </div>
              
              <div className={`rounded-lg p-2 sm:p-3 text-center ${TC.bgStatItem}`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FaWallet className={TC.textCash} />
                  <span className={`text-[10px] sm:text-xs ${TC.textSecondary}`}>Cash</span>
                </div>
                <div className={`font-bold text-xs sm:text-sm ${TC.textCash}`}>
                  ${cashValue.toLocaleString('en-IN', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
              </div>
            </div>

            {/* Holdings List */}
            <div className={`pt-2 sm:pt-3 border-t ${TC.bgStatsSection.replace('bg-', 'border-').replace('/30', '')}`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className={`text-xs sm:text-sm font-semibold ${TC.textSecondary}`}>Holdings</span>
                <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>
                  {portfolioData.filter(item => item.type === 'crypto').length} coins
                </span>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {portfolioData.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between py-1.5 px-2 group rounded-lg transition-all duration-200 cursor-pointer fade-in ${TC.bgHoldingItem}`}
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div 
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 shadow-md" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs sm:text-sm font-medium truncate transition-colors ${TC.textPrimary} ${TC.textHoldingItemHover}`}>
                          {item.name}
                        </p>
                        {item.type === 'crypto' && (
                          <p className={`text-[10px] sm:text-xs truncate ${TC.textSecondary}`}>
                            {item.quantity.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs sm:text-sm font-bold transition-colors ${TC.textPrimary} ${TC.textHoldingItemHover}`}>
                        ${item.totalValue.toLocaleString('en-IN', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                      <p className={`text-[10px] sm:text-xs ${TC.textSecondary}`}>
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