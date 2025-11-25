import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaChartPie, FaWallet, FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Slightly adjusted COLORS array for better visual separation if many coins are present
const COLORS = ["#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const PortfolioDistribution = ({ isLight, groupedHoldings, balance, loading }) => {
  const [isMounted, setIsMounted] = useState(false);

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    bgContainer: isLight ? "bg-white border-gray-200 shadow-sm" : "bg-gray-800/40 backdrop-blur-md border-gray-700/50 shadow-xl",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-400",
    bgPillPositive: isLight ? "bg-green-100 border-green-300" : "bg-green-500/10 border-green-500/30",
    bgPillNegative: isLight ? "bg-red-100 border-red-300" : "bg-red-500/10 border-red-500/30",
    bgSummaryCard: isLight ? "bg-gray-50/50 border-gray-200" : "bg-gray-800/30 border-gray-700/50",
    borderSummary: isLight ? "border-gray-200" : "border-gray-700/50",
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
    // Chart specific colors
    chartStroke: isLight ? "#FFFFFF" : "#1F2937", 
    // Increased contrast for pie labels: black in light mode, pure white in dark mode
    pieLabelColor: isLight ? "#000000" : "#FFFFFF", 
    
    // Subtle background gradient for the chart area
    bgChartAccent: isLight ? "bg-gradient-to-br from-gray-50/70 to-white" : "bg-gradient-to-br from-gray-800/70 to-gray-900/50",
    
  }), [isLight]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const distributionData = useMemo(() => {
    if (!groupedHoldings || groupedHoldings.length === 0) {
      return balance > 0 ? [{
        name: "CASH", 
        value: balance, 
        fullName: "Virtual Cash", 
        color: "#10B981", 
        type: 'cash'
      }] : [];
    }

    const coinData = groupedHoldings.map((coin, index) => {
      const currentPrice = coin.currentPrice || 0;
      const currentValue = (coin.totalQuantity || 0) * currentPrice;
      const remainingInvestment = coin.remainingInvestment || 0;
      const profitLoss = currentValue - remainingInvestment;
      const profitLossPercentage = remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

      return {
        name: coin.coinSymbol?.toUpperCase() || 'Unknown',
        fullName: coin.coinName || 'Unknown Coin',
        value: currentValue,
        quantity: coin.totalQuantity,
        color: COLORS[index % COLORS.length],
        type: 'crypto',
        profitLoss,
        profitLossPercentage,
        currentPrice: currentPrice,
      };
    }).filter(coin => coin.value > 0);

    if (balance > 0) {
      coinData.unshift({
        name: "CASH", 
        value: balance, 
        fullName: "Virtual Cash", 
        color: "#10B981", // Green for Cash
        type: 'cash'
      });
    }

    return coinData;
  }, [groupedHoldings, balance]);

  const totalPortfolioValue = useMemo(() => {
    return distributionData.reduce((total, item) => total + (item.value || 0), 0);
  }, [distributionData]);

  const totalProfitLoss = useMemo(() => {
    return distributionData
      .filter(item => item.type === 'crypto')
      .reduce((total, coin) => total + (coin.profitLoss || 0), 0);
  }, [distributionData]);

  const totalProfitLossPercentage = useMemo(() => {
    const totalInvestment = distributionData
      .filter(item => item.type === 'crypto')
      .reduce((total, coin) => {
        const remainingInvestment = coin.value - (coin.profitLoss || 0);
        return total + remainingInvestment;
      }, 0);
    
    return totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
  }, [distributionData, totalProfitLoss]);

  if (loading) return (
    <div className={`rounded-2xl p-6 border ${TC.bgContainer} h-full`}>
      <Skeleton height={200} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
    </div>
  );

  return (
    <div className={`rounded-2xl p-6 border shadow-sm fade-in h-full flex flex-col ${TC.bgContainer} ${
      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <Header isLight={isLight} TC={TC} />
      
      {/* Only show Profit/Loss if there are crypto holdings */}
      {groupedHoldings.length > 0 && totalPortfolioValue > balance && (
        <ProfitLossSummary 
          isLight={isLight}
          totalProfitLoss={totalProfitLoss}
          totalProfitLossPercentage={totalProfitLossPercentage}
          TC={TC}
        />
      )}
      
      <Chart 
        isLight={isLight}
        distributionData={distributionData} 
        totalPortfolioValue={totalPortfolioValue} 
        TC={TC}
      />
      
      <PortfolioSummary 
        isLight={isLight}
        balance={balance}
        totalProfitLoss={totalProfitLoss}
        totalPortfolioValue={totalPortfolioValue}
        groupedHoldings={groupedHoldings}
        TC={TC}
      />
    </div>
  );
};

const Header = ({ isLight, TC }) => {
  return (
    <div className="flex items-center justify-between mb-4 fade-in">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
          <FaChartPie className="text-cyan-500" />
          Allocation
        </h2>
      </div>
    </div>
  );
};

const ProfitLossSummary = ({ isLight, totalProfitLoss, totalProfitLossPercentage, TC }) => {
  const isPositive = totalProfitLoss >= 0;
  
  // Adjusted text color reliance
  const textPL = isPositive ? "text-green-500" : "text-red-500";
  const bgIcon = isPositive ? (isLight ? "bg-green-200 text-green-700" : "bg-green-500/20 text-green-400") : (isLight ? "bg-red-200 text-red-700" : "bg-red-500/20 text-red-400");
  
  return (
    <div className={`mb-4 p-3 rounded-xl border fade-in ${isPositive ? TC.bgPillPositive : TC.bgPillNegative}`} style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgIcon}`}>
            {isPositive ? <FaArrowUp className="text-sm" /> : <FaArrowDown className="text-sm" />}
          </div>
          <div>
            <p className={`text-xs mb-0.5 ${TC.textSecondary}`}>Total Profit/Loss</p>
            <p className={`text-lg font-bold ${textPL}`}>
              {isPositive ? '+' : ''}${Math.abs(totalProfitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${textPL}`}>
            {isPositive ? '+' : ''}{totalProfitLossPercentage?.toFixed(2) || '0.00'}%
          </p>
        </div>
      </div>
    </div>
  );
};

const Chart = ({ isLight, distributionData, totalPortfolioValue, TC }) => {
  const strokeColor = isLight ? "#FFFFFF" : "#1F2937"; 
  const pieLabelColor = TC.pieLabelColor;

  return (
    // Applied chart accent background for better definition
    <div className={`w-full h-48 mb-4 flex-1 fade-in rounded-xl ${TC.bgChartAccent}`} style={{ animationDelay: "0.15s" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={distributionData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75} // Slightly increased outer radius
            paddingAngle={2}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
            // Ensuring the text fill is the high contrast color
            style={{ fill: pieLabelColor, filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))' }} 
            isAnimationActive={false}
          >
            {distributionData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke={strokeColor} 
                strokeWidth={3}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip isLight={isLight} TC={TC} totalPortfolioValue={totalPortfolioValue} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Custom Tooltip component moved outside to simplify logic and use props
const CustomTooltip = ({ active, payload, isLight, TC, totalPortfolioValue }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalPortfolioValue) * 100).toFixed(1);
      
      return (
        <div className={`rounded-lg p-3 shadow-lg fade-in border ${isLight ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700"}`}>
          <p className={`font-semibold text-base mb-1 ${TC.textPrimary}`}>{data.fullName || data.name}</p>
          <p className="font-bold text-lg text-cyan-500">
            ${data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm ${TC.textSecondary}`}>{percentage}% of portfolio</p>
        </div>
      );
    }
    return null;
  };

const PortfolioSummary = ({ isLight, balance, totalProfitLoss, totalPortfolioValue, groupedHoldings, TC }) => {
  return (
    <div className={`space-y-3 p-4 rounded-xl border fade-in ${TC.bgSummaryCard}`} style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between text-sm">
        <div className={`flex items-center gap-2 ${TC.textSecondary}`}>
          <FaWallet className="text-green-500" />
          <span>Cash Balance:</span>
        </div>
        <span className="font-bold text-green-500">
          ${(balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className={`flex items-center justify-between text-sm pt-2 border-t ${TC.borderSummary}`}>
        <div className={`flex items-center gap-2 font-semibold ${TC.textSecondary}`}>
          <FaChartPie className={TC.textPrimary} />
          <span>Total Portfolio:</span>
        </div>
        <span className={`font-bold ${TC.textPrimary}`}>
          ${totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {groupedHoldings.length > 0 && (
        <div className={`flex items-center justify-between text-sm ${TC.textSecondary} pt-2`}>
          <span>Holdings:</span>
          <div className="flex items-center gap-2">
            <span className={TC.textPrimary}>{groupedHoldings.length} coin{groupedHoldings.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDistribution;