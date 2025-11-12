import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from "recharts";
import { useLivePortfolio } from '@/hooks/useLivePortfolio';
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";
import { FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa";

const PerformanceChart = () => {
  const { balance } = useWalletContext();
  const { portfolioSummary, loading } = useLivePortfolio();
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const currentMetrics = useMemo(() => {
    const currentValue = (portfolioSummary?.totalCurrentValue || 0) + (balance || 0);
    const totalInvestment = portfolioSummary?.remainingInvestment || 0;
    const profitLoss = portfolioSummary?.totalProfitLoss || 0;
    const profitLossPercentage = portfolioSummary?.totalProfitLossPercentage || 0;

    return { 
      currentValue, 
      totalInvestment, 
      profitLoss, 
      profitLossPercentage,
      investedValue: totalInvestment
    };
  }, [portfolioSummary, balance]);

  const performanceData = useMemo(() => {
    const { totalInvestment, profitLossPercentage } = currentMetrics;
    
    if (totalInvestment === 0) return [];

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    const startingValue = totalInvestment;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let value, dailyProfitLoss, dailyProfitLossPercentage;

      if (i === 0) {
        value = startingValue + currentMetrics.profitLoss;
        dailyProfitLoss = currentMetrics.profitLoss;
        dailyProfitLossPercentage = startingValue > 0 ? (dailyProfitLoss / startingValue) * 100 : 0;
      } else {
        const volatility = 0.02;
        const progress = (days - i) / days;
        const targetChange = (profitLossPercentage / 100) * progress;
        const randomChange = (Math.random() - 0.5) * volatility;
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
        day: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : null
      });
    }
    
    return data;
  }, [currentMetrics, timeRange]);

  const periodReturns = useMemo(() => {
    if (performanceData.length < 2) return { 
      '7d': 0, 
      '30d': 0, 
      '90d': 0,
      current: 0
    };

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

  if (loading) return <LoadingState />;
  if (currentMetrics.totalInvestment === 0) return <EmptyState isMounted={isMounted} />;

  return (
    <div className="p-4">
      <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl fade-in ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        <Header timeRange={timeRange} setTimeRange={setTimeRange} />
        <StatsGrid 
          currentMetrics={currentMetrics} 
          periodReturns={periodReturns}
          timeRange={timeRange}
        />
        <Chart performanceData={performanceData} currentMetrics={currentMetrics} />
        <Footer periodReturns={periodReturns} />
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="p-4">
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 fade-in">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-700 rounded-lg w-1/2"></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-gray-700 rounded-lg"></div>
          <div className="h-16 bg-gray-700 rounded-lg"></div>
          <div className="h-16 bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-48 bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ isMounted }) => (
  <div className="p-4">
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl fade-in ${
      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
          <FaChartLine className="text-cyan-400" />
          Portfolio Performance
        </h2>
      </div>
      <div className="flex flex-col items-center justify-center text-gray-400 py-12 fade-in">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-center text-base">No investment data available</p>
        <p className="text-sm text-gray-500 mt-2 text-center">Start investing to track your performance</p>
      </div>
    </div>
  </div>
);

const Header = ({ timeRange, setTimeRange }) => (
  <div className="flex items-center justify-between mb-4 fade-in">
    <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
      <FaChartLine className="text-cyan-400" />
      Investment Performance
    </h2>
    <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 fade-in" style={{ animationDelay: "0.1s" }}>
      {['7d', '30d', '90d'].map((range) => (
        <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1 text-sm rounded-md transition-all ${
          timeRange === range ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-300'
        }`}>
          {range}
        </button>
      ))}
    </div>
  </div>
);

const StatsGrid = ({ currentMetrics, periodReturns, timeRange }) => {
  const { totalInvestment, profitLoss, profitLossPercentage } = currentMetrics;

  return (
    <div className="grid grid-cols-3 gap-3 mb-4 fade-in" style={{ animationDelay: "0.15s" }}>
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-cyan-400/20 rounded-lg">
            <FaChartLine className="text-cyan-400 text-sm" />
          </div>
          <p className="text-sm text-gray-400">Total Investment</p>
        </div>
        <p className="text-lg font-bold text-cyan-400">
          ${totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Current: ${currentMetrics.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className={`border rounded-lg p-3 fade-in ${
        profitLoss >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
      }`} style={{ animationDelay: "0.25s" }}>
        <div className="flex items-center gap-2 mb-2">
          {profitLoss >= 0 ? (
            <FaArrowUp className="text-green-400 text-sm" />
          ) : (
            <FaArrowDown className="text-red-400 text-sm" />
          )}
          <p className="text-sm text-gray-400">Investment P&L</p>
        </div>
        <p className={`text-lg font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {profitLoss >= 0 ? '+' : ''}${Math.abs(profitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={`text-xs ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          ({profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
        </p>
      </div>

      <div className={`border rounded-lg p-3 fade-in ${
        periodReturns[timeRange] >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
      }`} style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-2 mb-2">
          {periodReturns[timeRange] >= 0 ? (
            <FaArrowUp className="text-green-400 text-sm" />
          ) : (
            <FaArrowDown className="text-red-400 text-sm" />
          )}
          <p className="text-sm text-gray-400">{timeRange.toUpperCase()} Return</p>
        </div>
        <p className={`text-lg font-bold ${periodReturns[timeRange] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {periodReturns[timeRange] >= 0 ? '+' : ''}{periodReturns[timeRange].toFixed(2)}%
        </p>
        <p className="text-xs text-gray-400 mt-1">
          On ${currentMetrics.totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
};

const Chart = ({ performanceData, currentMetrics }) => {
  const isPositive = currentMetrics.profitLoss >= 0;
  const gradientId = `performanceGradient`;

  return (
    <div className="h-48 fade-in" style={{ animationDelay: "0.35s" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performanceData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="none"
            fill={`url(#${gradientId})`}
            fillOpacity={1}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={isPositive ? "#10B981" : "#EF4444"}
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 4, 
              fill: isPositive ? "#059669" : "#DC2626", 
              stroke: isPositive ? "#047857" : "#B91C1C", 
              strokeWidth: 2 
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.profitLoss >= 0;
    
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg min-w-[200px] fade-in">
        <p className="font-semibold text-white text-sm mb-2">{data.day || data.date}</p>
        
        <div className="space-y-2">
          <div>
            <p className="text-cyan-400 font-medium text-sm">
              Value: ${data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-xs">
              Investment: ${data.investment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            P&L: {isPositive ? '+' : ''}${Math.abs(data.profitLoss).toLocaleString('en-IN', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
            <span className="text-xs ml-1">
              ({isPositive ? '+' : ''}{data.profitLossPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const Footer = ({ periodReturns }) => (
  <div className="flex items-center justify-between mt-4 text-sm text-gray-400 fade-in" style={{ animationDelay: "0.4s" }}>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span>Investment performance (excl. cash balance)</span>
    </div>
    <div className="flex items-center gap-4">
      <div className={`text-sm font-medium ${periodReturns['7d'] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        7D: {periodReturns['7d'] >= 0 ? '+' : ''}{periodReturns['7d'].toFixed(2)}%
      </div>
      <div className={`text-sm font-medium ${periodReturns['30d'] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        30D: {periodReturns['30d'] >= 0 ? '+' : ''}{periodReturns['30d'].toFixed(2)}%
      </div>
      <div className={`text-sm font-medium ${periodReturns['90d'] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        90D: {periodReturns['90d'] >= 0 ? '+' : ''}{periodReturns['90d'].toFixed(2)}%
      </div>
    </div>
  </div>
);

export default PerformanceChart;