import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaChartPie, FaWallet, FaCoins } from "react-icons/fa";
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";

const COLORS = ["#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const PortfolioDistribution = ({ data, loading }) => {
  const { balance } = useWalletContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Group same coins together and calculate total value for each
  const portfolioMap = {};
  
  const coinsList = Array.isArray(data) ? data : [];
  
  coinsList.forEach((coin) => {
    const symbol = coin.coinSymbol?.toUpperCase() || coin.coin_id;
    const name = coin.coinName || `Coin ${symbol}`;
    if (!symbol) return;
    
    if (!portfolioMap[symbol]) {
      portfolioMap[symbol] = {
        name: symbol,
        fullName: name,
        value: 0,
        quantity: 0
      };
    }
    
    portfolioMap[symbol].value += (Number(coin.quantity) || 0) * (Number(coin.coinPriceUSD) || 0);
    portfolioMap[symbol].quantity += Number(coin.quantity) || 0;
  });

  // Convert to array
  const distributionData = Object.values(portfolioMap).filter(item => item.value > 0);

  // Add cash to distribution if there's any balance
  if (balance > 0) {
    distributionData.unshift({
      name: "CASH",
      value: balance,
      fullName: "Virtual Cash",
      quantity: balance
    });
  }

  const totalPortfolioValue = distributionData.reduce((sum, item) => sum + item.value, 0);
  const totalInvested = distributionData.filter(d => d.name !== "CASH").reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return (
      <div className="p-3 xs:p-4 sm:p-6 fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FaChartPie className="text-cyan-400 text-lg" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">Portfolio Distribution</h2>
          </div>
          <div className="w-full h-48 sm:h-56 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
          <div className="mt-4 space-y-3 animate-pulse">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (distributionData.length === 0) {
    return (
      <div className="p-3 xs:p-4 sm:p-6 fade-in" style={{ animationDelay: "0.1s" }}>
        <div 
          className={`
            bg-transparent border border-gray-700 shadow-lg rounded-xl p-4 sm:p-6
            transition-all duration-500 ease-out transform
            ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          `}
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FaChartPie className="text-cyan-400 text-lg" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">Portfolio Distribution</h2>
          </div>
          <div className="w-full h-48 sm:h-56 flex flex-col items-center justify-center text-gray-400 fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="text-4xl sm:text-5xl mb-3">📊</div>
            <p className="text-sm sm:text-base text-center">No portfolio data available</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">Buy coins to see your portfolio distribution</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-white text-sm">{data.fullName || data.name}</p>
          {data.name !== "CASH" && (
            <p className="text-gray-300 text-xs">
              Quantity: {data.quantity.toFixed(4)}
            </p>
          )}
          <p className="text-cyan-400 font-medium">
            ₹{data.value.toLocaleString('en-IN')}
          </p>
          <p className="text-gray-400 text-xs">
            {((data.value / totalPortfolioValue) * 100).toFixed(1)}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry, index) => (
          <div 
            key={`legend-${index}`}
            className="flex items-center gap-2 text-xs fade-in"
            style={{ animationDelay: `${0.4 + (index * 0.1)}s` }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.value}</span>
            <span className="text-cyan-400 font-medium">
              {((entry.payload.value / totalPortfolioValue) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 fade-in" style={{ animationDelay: "0.1s" }}>
      <div 
        className={`
          bg-transparent border border-gray-700 shadow-lg rounded-xl p-4 sm:p-6
          transition-all duration-500 ease-out transform
          ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}
        style={{ animationDelay: "0.2s" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <FaChartPie className="text-cyan-400 text-lg" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">Portfolio Distribution</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live
          </div>
        </div>

        {/* Chart Container */}
        <div 
          className="w-full h-48 sm:h-56 mb-4 fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}
              >
                {distributionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="#1F2937"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Summary */}
        <div 
          className="space-y-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700 fade-in hover:border-cyan-400/30 transition-all duration-300"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <FaCoins className="text-cyan-400" />
              <span>Total Investments:</span>
            </div>
            <span className="text-cyan-400 font-semibold">
              ₹{totalInvested.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <FaWallet className="text-green-400" />
              <span>Cash Balance:</span>
            </div>
            <span className="text-green-400 font-semibold">
              ₹{balance?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 text-gray-300 font-semibold">
              <FaChartPie className="text-white" />
              <span>Total Portfolio:</span>
            </div>
            <span className="text-white font-bold text-base">
              ₹{totalPortfolioValue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Distribution Stats */}
        {distributionData.length > 0 && (
          <div 
            className="mt-4 text-center text-xs text-gray-400 fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex items-center justify-center gap-4">
              <span>{distributionData.length} asset{distributionData.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{distributionData.filter(d => d.name !== "CASH").length} coin{distributionData.filter(d => d.name !== "CASH").length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                Real-time
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioDistribution;