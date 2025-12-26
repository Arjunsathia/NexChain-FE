import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import useWalletContext from '@/hooks/useWalletContext';
import { FaCoins, FaWallet, FaChartPie, FaArrowUp, FaArrowDown } from "react-icons/fa";

function Portfolio() {
  const isLight = useThemeCheck();
  const { balance } = useWalletContext();
  const { purchasedCoins = [], loading } = usePurchasedCoins() || { purchasedCoins: [], loading: false };
  const [activeIndex, setActiveIndex] = useState(null);

  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-400" : "text-gray-500",

    bgCard: isLight
      ? "bg-white/80 backdrop-blur-xl shadow-md border border-white/40"
      : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

    bgIcon: isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400",

    headerGradient: "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent",

    // Stats
    bgStatItem: isLight ? "bg-white shadow-sm border border-gray-100" : "bg-gray-800/20 border-none",

    // Tooltip
    bgTooltip: isLight ? "bg-white/95 backdrop-blur-xl shadow-xl border border-gray-100" : "bg-gray-800/95 backdrop-blur-xl shadow-xl border border-gray-700",
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
          type: 'crypto'
        };
      }

      const quantity = Number(coin.quantity) || 0;
      const price = Number(coin.current_price) || Number(coin.coinPriceUSD) || 0;
      portfolioMap[symbol].quantity += quantity;
      portfolioMap[symbol].totalValue += quantity * price;
    });

    let data = Object.values(portfolioMap).filter(item => item.totalValue > 0);

    // sort by value desc
    data.sort((a, b) => b.totalValue - a.totalValue);

    const cashValue = Number(balance) || 0;
    if (cashValue > 0) {
      data.unshift({
        name: 'USD',
        fullName: 'Cash Balance',
        totalValue: cashValue,
        quantity: cashValue,
        type: 'cash'
      });
    }

    // Assign colors after sorting
    const COLORS = [
      '#3B82F6', // Blue
      '#10B981', // Emerald
      '#8B5CF6', // Violet
      '#F59E0B', // Amber
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#6366F1', // Indigo
      '#14B8A6', // Teal
      '#F43F5E', // Rose
    ];

    return data.map((item, index) => ({
      ...item,
      color: item.type === 'cash' ? (isLight ? '#10B981' : '#34D399') : COLORS[index % COLORS.length]
    }));
  }, [purchasedCoins, balance, isLight]);

  const totalPortfolioValue = portfolioData.reduce((sum, item) => sum + (Number(item.totalValue) || 0), 0);
  const investedValue = portfolioData.filter(item => item.type === 'crypto').reduce((sum, item) => sum + item.totalValue, 0);
  const cashValue = Number(balance) || 0;

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalPortfolioValue > 0 ? ((data.totalValue / totalPortfolioValue) * 100).toFixed(1) : 0;

      return (
        <div className={`${TC.bgTooltip} rounded-xl p-4 min-w-[180px]`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.color }} />
            <span className={`font-semibold text-sm ${TC.textPrimary}`}>{data.fullName}</span>
          </div>
          <div className="space-y-1 pl-5">
            <div className={`text-lg font-bold ${TC.textPrimary}`}>
              ${data.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-medium ${TC.textSecondary} flex justify-between`}>
              <span>{percentage}%</span>
              {data.type === 'crypto' && <span>{data.quantity.toFixed(4)} {data.name}</span>}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={6}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - 4}
          outerRadius={outerRadius}
          fill={fill}
          fillOpacity={0.2}
          cornerRadius={6}
        />
      </g>
    );
  };

  if (loading) {
    return (
      <div className={`${TC.bgCard} rounded-xl p-5 h-full`}>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200/20 rounded-full mx-auto w-48"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200/20 rounded w-full"></div>
            <div className="h-4 bg-gray-200/20 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${TC.bgCard} rounded-2xl p-5 h-[380px] flex flex-col transition-all duration-300 relative overflow-hidden group`}>
      {/* Background Decorative Gradient */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-opacity duration-500 ${isLight ? 'opacity-100' : 'opacity-20'}`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${TC.bgIcon} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
            <FaChartPie className="text-lg" />
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${TC.textPrimary}`}>
              Portfolio
            </h2>
            <div className={`text-xs font-medium flex items-center gap-1.5 ${TC.textSecondary}`}>
              <span className="font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">+2.4%</span>
              <span>this week</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xs font-medium mb-0.5 ${TC.textTertiary}`}>Total Value</p>
          <p className={`text-xl font-bold tracking-tight ${TC.textPrimary}`}>
            ${totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {portfolioData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
          <div className="w-16 h-16 rounded-full bg-gray-100/50 flex items-center justify-center mb-3">
            <FaChartPie className="text-2xl text-gray-300" />
          </div>
          <p className={`text-sm font-medium ${TC.textSecondary}`}>Empty Portfolio</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center h-[160px] shrink-0 mb-2">
            {/* Chart */}
            <div className="h-full w-1/2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="totalValue"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    cornerRadius={5}
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                        className="transition-all duration-300 outline-none hover:opacity-90 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text (Total) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className={`text-[10px] font-medium ${TC.textTertiary}`}>Total</span>
                <span className={`text-sm font-bold ${TC.textPrimary}`}>
                  ${(totalPortfolioValue / 1000).toFixed(1)}k
                </span>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="w-1/2 pl-2 space-y-2">
              <div className={`p-3 rounded-xl ${TC.bgStatItem} transition-all duration-200 hover:shadow-md cursor-default group/stat`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`p-1.5 rounded-lg bg-indigo-50/50 text-indigo-500 group-hover/stat:bg-indigo-500 group-hover/stat:text-white transition-colors duration-300`}>
                    <FaCoins size={10} />
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${TC.textTertiary}`}>Invested</span>
                </div>
                <div className={`text-sm font-bold ${TC.textPrimary}`}>
                  ${investedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className={`p-3 rounded-xl ${TC.bgStatItem} transition-all duration-200 hover:shadow-md cursor-default group/stat`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`p-1.5 rounded-lg bg-emerald-50/50 text-emerald-500 group-hover/stat:bg-emerald-500 group-hover/stat:text-white transition-colors duration-300`}>
                    <FaWallet size={10} />
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${TC.textTertiary}`}>Cash</span>
                </div>
                <div className={`text-sm font-bold ${TC.textPrimary}`}>
                  ${cashValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>

          {/* Holdings List (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-2">
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 pl-1 ${TC.textTertiary}`}>
              Your Assets ({portfolioData.filter(i => i.type !== 'cash').length})
            </p>
            <div className="space-y-1">
              {portfolioData.map((item, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer group/item ${activeIndex === index ? (isLight ? 'bg-blue-50' : 'bg-white/10') : 'hover:bg-gray-100/50 dark:hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-1.5 h-8 rounded-full shrink-0 transition-transform duration-300 group-hover/item:scale-y-110" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${TC.textPrimary}`}>{item.fullName}</p>
                      <p className={`text-[10px] font-medium ${TC.textSecondary}`}>
                        {item.type === 'cash' ? 'Fiat' : `${item.quantity.toFixed(4)} ${item.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${TC.textPrimary}`}>
                      ${item.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className={`text-[10px] font-medium ${TC.textSecondary}`}>
                      {totalPortfolioValue > 0 ? ((item.totalValue / totalPortfolioValue) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;