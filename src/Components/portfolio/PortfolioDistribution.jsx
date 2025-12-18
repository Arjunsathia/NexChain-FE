import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaChartPie, FaWallet, FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Function to get color based on symbol (same as Portfolio component)
const getColorForSymbol = (symbol) => {
  const colors = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
  if (!symbol) return colors[0];
  const index = symbol.charCodeAt(0) % colors.length;
  return colors[index];
};

const PortfolioDistribution = ({ isLight, groupedHoldings, balance, loading }) => {

  // 💡 Theme Classes Helper - aligned with other components
  const TC = useMemo(() => ({
    // Card Background (Matching PerformanceChart / PortfolioHeader / Sidebar)
    bgContainer: isLight
      ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)]"
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",

    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-400",
    
    // P&L Pill Styling
    bgPillPositive: isLight ? "bg-green-100 border-green-300" : "bg-green-500/10 border-green-500/30",
    bgPillNegative: isLight ? "bg-red-100 border-red-300" : "bg-red-500/10 border-red-500/30",
    
    // Summary Card
    bgSummaryCard: isLight ? "bg-gray-50 border-gray-200" : "bg-white/5 border-white/5",
    borderSummary: isLight ? "border-gray-200" : "border-gray-700",
    
    // Skeleton Colors
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
    
    // Chart specific colors
    chartStroke: isLight ? "#F3F4F6" : "#1F2937", // Matches Portfolio component
    pieLabelColor: isLight ? "#000000" : "#FFFFFF", 
    
    // P&L text colors
    textPositive: isLight ? "text-green-700" : "text-green-400",
    textNegative: isLight ? "text-red-700" : "text-red-400",
  }), [isLight]);

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

    const coinData = groupedHoldings.map((coin) => {
      const currentPrice = coin.currentPrice || 0;
      const currentValue = (coin.totalQuantity || 0) * currentPrice;
      const remainingInvestment = coin.remainingInvestment || 0;
      const profitLoss = currentValue - remainingInvestment;
      const profitLossPercentage = remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

      const symbol = coin.coinSymbol?.toUpperCase() || coin.coinId || coin.coin_id || 'UNKNOWN';
      
      return {
        name: symbol,
        fullName: coin.coinName || 'Unknown Coin',
        value: currentValue,
        quantity: coin.totalQuantity,
        color: getColorForSymbol(symbol),
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
        color: '#10B981',
        type: 'cash'
      });
    }

    return coinData;
  }, [groupedHoldings, balance, isLight]);

  const totalPortfolioValue = useMemo(() => {
    return distributionData.reduce((total, item) => total + (item.value || 0), 0);
  }, [distributionData]);

  const totalProfitLoss = useMemo(() => {
    return distributionData
      .filter(item => item.type === 'crypto')
      .reduce((total, coin) => total + (coin.profitLoss || 0), 0);
  }, [distributionData]);

  const totalInvestment = useMemo(() => {
    return distributionData
      .filter(item => item.type === 'crypto')
      .reduce((total, coin) => {
        const remainingInvestment = coin.value - (coin.profitLoss || 0);
        return total + remainingInvestment;
      }, 0);
  }, [distributionData]);

  const totalProfitLossPercentage = useMemo(() => {
    return totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
  }, [totalInvestment, totalProfitLoss]);

  if (loading) return (
    <div
      className={`
        rounded-2xl p-6 h-full
        ${TC.bgContainer}
      `}
    >
      <Skeleton height={200} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
    </div>
  );

  return (
    <div
      className={`
        rounded-lg md:rounded-2xl p-3 md:p-6 h-full flex flex-col fade-in
        ${TC.bgContainer}
      `}
    >
      <Header isLight={isLight} TC={TC} />
      
      {/* Only show Profit/Loss if there are crypto holdings */}
      {totalInvestment > 0 && (
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
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
          <FaChartPie className="text-cyan-500" />
          Asset Allocation
        </h2>
      </div>
    </div>
  );
};

const ProfitLossSummary = ({ isLight, totalProfitLoss, totalProfitLossPercentage, TC }) => {
  const isPositive = totalProfitLoss >= 0;
  
  const textPL = isPositive ? TC.textPositive : TC.textNegative;
  const bgPill = isPositive ? TC.bgPillPositive : TC.bgPillNegative;
  
  return (
    <div className={`mb-4 p-2.5 md:p-4 rounded-lg md:rounded-xl border fade-in ${bgPill}`} style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${textPL}`}>
            {isPositive ? <FaArrowUp className="text-sm sm:text-base" /> : <FaArrowDown className="text-sm sm:text-base" />}
          </div>
          <div>
            <p className={`text-xs sm:text-sm mb-0.5 ${TC.textSecondary}`}>Total P&L (Crypto)</p>
            <p className={`text-lg sm:text-xl font-bold ${textPL}`}>
              {isPositive ? '+' : ''}${Math.abs(totalProfitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg sm:text-xl font-bold ${textPL}`}>
            {isPositive ? '+' : ''}{totalProfitLossPercentage?.toFixed(2) || '0.00'}%
          </p>
        </div>
      </div>
    </div>
  );
};

const Chart = ({ isLight, distributionData, totalPortfolioValue, TC }) => {
  const strokeColor = isLight ? "#1F2937" : "#1F2937"; // Dark stroke for contrast

  // Custom label component for external positioning with vibrant colors
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 15; // Position labels outside the chart
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={isLight ? "#F59E0B" : "#F59E0B"} // Vibrant orange/yellow for labels
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold"
        style={{ fontSize: '10px', fontWeight: '700' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full min-h-[220px] mb-4 flex-1 rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Pie chart with vibrant colors and external labels */}
          <Pie
            data={distributionData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={35} 
            outerRadius={55} 
            paddingAngle={2}
            label={renderCustomLabel}
            labelLine={false}
            isAnimationActive={false}
          >
            {distributionData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke={strokeColor} 
                strokeWidth={0}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip isLight={isLight} TC={TC} totalPortfolioValue={totalPortfolioValue} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Custom Tooltip component
const CustomTooltip = ({ active, payload, isLight, TC, totalPortfolioValue }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = totalPortfolioValue > 0 ? ((data.value / totalPortfolioValue) * 100).toFixed(1) : 0;
    
    return (
      <div className={`rounded-lg p-3 shadow-lg fade-in border ${isLight ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700"}`}>
        <p className={`font-semibold text-sm mb-1 ${TC.textPrimary}`}>{data.fullName || data.name}</p>
        <p className="font-bold text-lg text-cyan-500">
          ${data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={`text-sm ${TC.textSecondary}`}>{percentage}% of portfolio</p>
        {data.type === 'crypto' && data.quantity && (
          <p className={`text-xs mt-2 ${TC.textSecondary}`}>
            Quantity: {data.quantity.toFixed(6)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PortfolioSummary = ({ isLight, balance, totalPortfolioValue, groupedHoldings, TC }) => {
  return (
    <div className={`space-y-3 p-2.5 md:p-4 rounded-lg md:rounded-xl border fade-in ${TC.bgSummaryCard}`} style={{ animationDelay: "0.2s" }}>
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
          <span>Invested Coins:</span>
          <div className="flex items-center gap-2">
            <span className={TC.textPrimary}>{groupedHoldings.length} coin{groupedHoldings.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDistribution;
