import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from "recharts";
import { FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PerformanceChart = ({ isLight, groupedHoldings, balance, loading }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    bgContainer: isLight ? "bg-white border-gray-200 shadow-sm" : "bg-gray-800/40 backdrop-blur-md border-gray-700/50 shadow-xl",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgRangeButtonActive: isLight ? "bg-cyan-600 text-white" : "bg-cyan-600 text-white",
    bgRangeButtonDefault: isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-gray-300",
    bgRangeContainer: isLight ? "bg-gray-100 border-gray-300" : "bg-gray-800 border-gray-700",
    bgStatCard: isLight ? "bg-gray-50/50 border-gray-200" : "bg-gray-800/30 border-gray-700",
    bgPillPositive: isLight ? "bg-green-100 border-green-300" : "bg-green-500/10 border-green-500/30",
    bgPillNegative: isLight ? "bg-red-100 border-red-300" : "bg-red-500/10 border-red-500/30",
    textPositive: isLight ? "text-green-700" : "text-green-400",
    textNegative: isLight ? "text-red-700" : "text-red-400",
    chartStroke: isLight ? "#9CA3AF" : "#9CA3AF",
    chartGrid: isLight ? "#e5e7eb" : "#374151",
    tooltipBg: isLight ? "bg-white border-gray-300" : "bg-gray-800 border-gray-700",
    tooltipTextPrimary: isLight ? "text-gray-900" : "text-white",
    tooltipTextSecondary: isLight ? "text-gray-500" : "text-gray-400",
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
  }), [isLight]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate current metrics from props
  const currentMetrics = useMemo(() => {
    let totalCurrentValue = 0;
    let totalInvestment = 0;

    if (groupedHoldings && groupedHoldings.length > 0) {
      groupedHoldings.forEach(coin => {
        const currentPrice = coin.currentPrice || 0;
        const currentValue = (coin.totalQuantity || 0) * currentPrice;
        const remainingInvestment = coin.remainingInvestment || 0;

        totalCurrentValue += currentValue;
        totalInvestment += remainingInvestment;
      });
    }

    const portfolioValue = totalCurrentValue + (balance || 0);
    const profitLoss = totalCurrentValue - totalInvestment;
    const profitLossPercentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

    return { 
      currentValue: portfolioValue, totalInvestment, profitLoss, profitLossPercentage,
      investedValue: totalInvestment
    };
  }, [groupedHoldings, balance]);

  // Generate performance data (Simulated for now as we don't have historical DB data)
  const performanceData = useMemo(() => {
    const { totalInvestment, profitLoss, profitLossPercentage } = currentMetrics;
    
    if (totalInvestment === 0) return [];

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    const startingValue = totalInvestment;
    const currentValue = startingValue + profitLoss;
    
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let value, dailyProfitLoss, dailyProfitLossPercentage;

      if (i === 0) {
        value = currentValue;
        dailyProfitLoss = profitLoss;
        dailyProfitLossPercentage = startingValue > 0 ? (dailyProfitLoss / startingValue) * 100 : 0;
      } else {
        const progress = (days - i) / days;
        const targetChange = (profitLossPercentage / 100) * progress;
        
        const volatility = 0.02;
        const seed = i * 12345 + days * 67890;
        const randomChange = (seededRandom(seed) - 0.5) * volatility;
        const totalChange = targetChange + randomChange;
        
        value = startingValue * (1 + totalChange);
        dailyProfitLoss = value - startingValue;
        dailyProfitLossPercentage = startingValue > 0 ? (dailyProfitLoss / startingValue) * 100 : 0;
        
        value = Math.max(value, startingValue * 0.1);
      }

      data.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        value: Math.round(value * 100) / 100,
        profitLoss: dailyProfitLoss,
        profitLossPercentage: dailyProfitLossPercentage,
        investment: startingValue,
        day: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : null,
      });
    }
    
    return data;
  }, [currentMetrics, timeRange]);

  const periodReturns = useMemo(() => {
    if (performanceData.length < 2) return { '7d': 0, '30d': 0, '90d': 0, current: 0 };

    const firstValue = performanceData[0].investment;
    const lastValue = performanceData[performanceData.length - 1].value;
    const totalReturn = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const periodStartIndex = Math.max(0, performanceData.length - days - 1);
    const periodStartValue = performanceData[periodStartIndex]?.investment || firstValue;
    const periodReturn = periodStartValue > 0 ? ((lastValue - periodStartValue) / periodStartValue) * 100 : 0;

    return {
      '7d': timeRange === '7d' ? periodReturn : totalReturn * 0.3,
      '30d': timeRange === '30d' ? periodReturn : totalReturn * 0.6,
      '90d': timeRange === '90d' ? periodReturn : totalReturn,
      current: totalReturn
    };
  }, [performanceData, timeRange]);

  if (loading) return (
    <div className={`rounded-2xl p-6 border ${TC.bgContainer}`}>
      <Skeleton height={300} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
    </div>
  );

  if (currentMetrics.totalInvestment === 0) return <EmptyState isMounted={isMounted} isLight={isLight} TC={TC} />;

  return (
    <div className={`rounded-2xl p-6 border transition-all duration-300 ${TC.bgContainer} ${
      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <Header 
        isLight={isLight}
        timeRange={timeRange} 
        setTimeRange={setTimeRange} 
        TC={TC}
      />
      <StatsGrid 
        isLight={isLight}
        currentMetrics={currentMetrics} 
        periodReturns={periodReturns}
        timeRange={timeRange}
        TC={TC}
      />
      <Chart isLight={isLight} performanceData={performanceData} currentMetrics={currentMetrics} TC={TC} />
    </div>
  );
};

const EmptyState = ({ isMounted, isLight, TC }) => {
  return (
    <div className={`rounded-2xl p-6 border shadow-sm fade-in ${TC.bgContainer} ${
      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2`}>
          <FaChartLine className="text-cyan-500" />
          Portfolio Performance
        </h2>
      </div>
      <div className={`flex flex-col items-center justify-center py-12 fade-in ${TC.textSecondary}`}>
        <div className="text-4xl mb-3">📊</div>
        <p className={`text-center text-base ${TC.textPrimary}`}>No investment data available</p>
        <p className={`text-sm mt-2 text-center ${TC.textSecondary}`}>Start investing to track your performance</p>
      </div>
    </div>
  );
};

const Header = ({ isLight, timeRange, setTimeRange, TC }) => {
  return (
    <div className="flex items-center justify-between mb-6 fade-in">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
          <FaChartLine className="text-cyan-500" />
          Performance
        </h2>
      </div>
      <div className={`flex rounded-lg p-1 border fade-in ${TC.bgRangeContainer}`} style={{ animationDelay: "0.1s" }}>
        {['7d', '30d', '90d'].map((range) => (
          <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1 text-sm rounded-md transition-all ${
            timeRange === range ? TC.bgRangeButtonActive : TC.bgRangeButtonDefault
          }`}>
            {range}
          </button>
        ))}
      </div>
    </div>
  );
};

const StatsGrid = ({ isLight, currentMetrics, periodReturns, timeRange, TC }) => {
  const { totalInvestment, profitLoss, profitLossPercentage } = currentMetrics;
  
  return (
    <div className="grid grid-cols-3 gap-4 mb-6 fade-in" style={{ animationDelay: "0.15s" }}>
      <div className={`border rounded-xl p-4 fade-in ${TC.bgStatCard}`} style={{ animationDelay: "0.2s" }}>
        <p className={`text-xs mb-1 ${TC.textSecondary}`}>Invested</p>
        <p className={`text-lg font-bold ${TC.textPrimary}`}>
          ${totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </div>

      <div className={`border rounded-xl p-4 fade-in ${profitLoss >= 0 ? TC.bgPillPositive : TC.bgPillNegative}`} style={{ animationDelay: "0.25s" }}>
        <p className={`text-xs mb-1 ${TC.textSecondary}`}>Total P&L</p>
        <div className={`flex items-center gap-1 font-bold ${profitLoss >= 0 ? TC.textPositive : TC.textNegative}`}>
          {profitLoss >= 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
          <span>${Math.abs(profitLoss).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div className={`border rounded-xl p-4 fade-in ${periodReturns[timeRange] >= 0 ? TC.bgPillPositive : TC.bgPillNegative}`} style={{ animationDelay: "0.3s" }}>
        <p className={`text-xs mb-1 ${TC.textSecondary}`}>{timeRange} Return</p>
        <div className={`flex items-center gap-1 font-bold ${periodReturns[timeRange] >= 0 ? TC.textPositive : TC.textNegative}`}>
          {periodReturns[timeRange] >= 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
          <span>{Math.abs(periodReturns[timeRange]).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};

const Chart = ({ isLight, performanceData, currentMetrics, TC }) => {
  const isPositive = currentMetrics.profitLoss >= 0;
  const gradientId = `performanceGradient`;

  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="h-64 fade-in flex items-center justify-center text-gray-400" style={{ animationDelay: "0.35s" }}>
        <p className="text-sm">No performance data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.profitLoss >= 0;
      
      return (
        <div className={`rounded-lg p-3 shadow-lg min-w-[150px] fade-in ${TC.tooltipBg}`}>
          <p className={`font-semibold text-sm mb-1 ${TC.tooltipTextPrimary}`}>{data.day || data.date}</p>
          <div className={`text-sm font-bold ${TC.tooltipTextPrimary}`}>
            ${data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-xs mt-1 ${isPositive ? TC.textPositive : TC.textNegative}`}>
            {isPositive ? '+' : ''}{data.profitLossPercentage.toFixed(2)}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 fade-in w-full" style={{ animationDelay: "0.35s" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performanceData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={TC.chartGrid} vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke={TC.chartStroke} 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            stroke={TC.chartStroke} 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: TC.chartStroke, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="none"
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={isPositive ? "#10B981" : "#EF4444"}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;