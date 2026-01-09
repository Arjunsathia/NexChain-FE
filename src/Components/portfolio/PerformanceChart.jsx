import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";
import { FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PerformanceChart = ({
  isLight,
  groupedHoldings,
  balance,
  loading,
  disableAnimations = false,
}) => {
  const [timeRange, setTimeRange] = useState("7d");

  const TC = useMemo(
    () => ({
      bgContainer: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card rounded-xl"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 rounded-xl",

      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",

      bgRangeButtonActive:
        "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20",
      bgRangeButtonDefault: isLight
        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
        : "text-gray-400 hover:text-gray-300 hover:bg-white/5",
      bgRangeContainer: isLight
        ? "bg-gray-100/80 border-gray-200"
        : "bg-gray-800/50 border-gray-700/50",

      bgStatCard: isLight ? "bg-gray-50 dark:bg-white/5" : "bg-white/5",

      bgPillPositive: isLight ? "bg-emerald-50" : "bg-emerald-500/10",
      bgPillNegative: isLight ? "bg-rose-50" : "bg-rose-500/10",
      textPositive: isLight ? "text-emerald-600" : "text-emerald-400",
      textNegative: isLight ? "text-rose-600" : "text-rose-400",

      chartStroke: "#9CA3AF",
      chartGrid: isLight ? "#e5e7eb" : "#374151",

      tooltipBg: isLight
        ? "bg-white border border-gray-300 shadow-xl"
        : "bg-gray-900 border border-gray-800 shadow-2xl",
      tooltipTextPrimary: isLight ? "text-gray-900" : "text-white",
      tooltipTextSecondary: isLight ? "text-gray-500" : "text-gray-400",

      skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
      skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
    }),
    [isLight],
  );

  const currentMetrics = useMemo(() => {
    let totalCurrentValue = 0;
    let totalInvestment = 0;

    if (groupedHoldings && groupedHoldings.length > 0) {
      groupedHoldings.forEach((coin) => {
        const currentPrice = coin.currentPrice || 0;
        const currentValue = (coin.totalQuantity || 0) * currentPrice;
        const remainingInvestment = coin.remainingInvestment || 0;

        totalCurrentValue += currentValue;
        totalInvestment += remainingInvestment;
      });
    }

    const portfolioValue = totalCurrentValue + (balance || 0);
    const profitLoss = totalCurrentValue - totalInvestment;
    const profitLossPercentage =
      totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

    return {
      currentValue: portfolioValue,
      totalInvestment,
      profitLoss,
      profitLossPercentage,
      investedValue: totalInvestment,
    };
  }, [groupedHoldings, balance]);

  const performanceData = useMemo(() => {
    const { totalInvestment, profitLoss, profitLossPercentage } =
      currentMetrics;
    if (totalInvestment === 0) return [];

    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
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
        dailyProfitLossPercentage =
          startingValue > 0 ? (dailyProfitLoss / startingValue) * 100 : 0;
      } else {
        const progress = (days - i) / days;
        const targetChange = (profitLossPercentage / 100) * progress;

        const volatility = 0.02;
        const seed = i * 12345 + days * 67890;
        const randomChange = (seededRandom(seed) - 0.5) * volatility;
        const totalChange = targetChange + randomChange;

        value = startingValue * (1 + totalChange);
        dailyProfitLoss = value - startingValue;
        dailyProfitLossPercentage =
          startingValue > 0 ? (dailyProfitLoss / startingValue) * 100 : 0;

        value = Math.max(value, startingValue * 0.1);
      }

      data.push({
        date: date.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        value: Math.round(value * 100) / 100,
        profitLoss: dailyProfitLoss,
        profitLossPercentage: dailyProfitLossPercentage,
        investment: startingValue,
        day: i === 0 ? "Today" : i === 1 ? "Yesterday" : null,
      });
    }

    return data;
  }, [currentMetrics, timeRange]);

  const periodReturns = useMemo(() => {
    if (performanceData.length < 2)
      return { "7d": 0, "30d": 0, "90d": 0, current: 0 };

    const firstValue = performanceData[0].investment;
    const lastValue = performanceData[performanceData.length - 1].value;
    const totalReturn =
      firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const periodStartIndex = Math.max(0, performanceData.length - days - 1);
    const periodStartValue =
      performanceData[periodStartIndex]?.investment || firstValue;
    const periodReturn =
      periodStartValue > 0
        ? ((lastValue - periodStartValue) / periodStartValue) * 100
        : 0;

    return {
      "7d": timeRange === "7d" ? periodReturn : totalReturn * 0.3,
      "30d": timeRange === "30d" ? periodReturn : totalReturn * 0.6,
      "90d": timeRange === "90d" ? periodReturn : totalReturn,
      current: totalReturn,
    };
  }, [performanceData, timeRange]);

  if (loading) {
    return (
      <div className={`rounded-2xl p-6 ${TC.bgContainer}`}>
        <Skeleton
          height={300}
          baseColor={TC.skeletonBase}
          highlightColor={TC.skeletonHighlight}
        />
      </div>
    );
  }

  if (currentMetrics.totalInvestment === 0) {
    return <EmptyState isLight={isLight} TC={TC} />;
  }

  return (
    <div
      className={`
        p-1 h-full flex flex-col
        ${TC.bgContainer}
      `}
    >
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
      <Chart
        isLight={isLight}
        performanceData={performanceData}
        currentMetrics={currentMetrics}
        TC={TC}
        disableAnimations={disableAnimations}
      />
    </div>
  );
};

const EmptyState = ({ TC }) => {
  return (
    <div
      className={`
        rounded-2xl p-6 h-full
        ${TC.bgContainer}
        transition-all duration-300 ease-in-out
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
          <FaChartLine className="text-cyan-500" />
          Portfolio Performance
        </h2>
      </div>
      <div
        className={`flex flex-col items-center justify-center py-12 ${TC.textSecondary} h-full`}
      >
        <div className="text-4xl mb-3">📊</div>
        <p className={`text-center text-base ${TC.textPrimary}`}>
          No investment data available
        </p>
        <p className={`text-sm mt-2 text-center ${TC.textSecondary}`}>
          Start investing to track your performance
        </p>
      </div>
    </div>
  );
};

const Header = ({ timeRange, setTimeRange, TC }) => {
  return (
    <div className="px-4 pt-3 flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2 tracking-tight">
          <FaChartLine className="text-blue-500" size={14} />
          Performance
        </h2>
      </div>
      <div
        className={`flex rounded-lg p-0.5 border shadow-sm ${TC.bgRangeContainer}`}
      >
        {["7d", "30d", "90d"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
              timeRange === range
                ? TC.bgRangeButtonActive
                : TC.bgRangeButtonDefault
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
};

const StatsGrid = ({ currentMetrics, periodReturns, timeRange, TC }) => {
  const { totalInvestment, profitLoss } = currentMetrics;

  return (
    <div className="grid grid-cols-3 gap-2 px-2 mb-4">
      <div className={`rounded-xl p-2 md:p-3 ${TC.bgStatCard}`}>
        <p
          className={`text-[10px] font-bold mb-0.5 uppercase tracking-wider ${TC.textSecondary} opacity-60`}
        >
          Invested
        </p>
        <p className={`text-sm md:text-base font-bold ${TC.textPrimary}`}>
          $
          {totalInvestment.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </p>
      </div>

      <div
        className={`rounded-xl p-2 md:p-3 ${profitLoss >= 0 ? TC.bgPillPositive : TC.bgPillNegative}`}
      >
        <p
          className={`text-[10px] font-bold mb-0.5 uppercase tracking-wider ${TC.textSecondary} opacity-60`}
        >
          Total P&L
        </p>
        <div
          className={`flex items-center gap-1 font-bold text-sm md:text-base ${profitLoss >= 0 ? TC.textPositive : TC.textNegative}`}
        >
          {profitLoss >= 0 ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
          <span>
            $
            {Math.abs(profitLoss).toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>

      <div
        className={`rounded-xl p-2 md:p-3 ${periodReturns[timeRange] >= 0 ? TC.bgPillPositive : TC.bgPillNegative}`}
      >
        <p
          className={`text-[10px] font-bold mb-0.5 uppercase tracking-wider ${TC.textSecondary} opacity-60`}
        >
          {timeRange} Return
        </p>
        <div
          className={`flex items-center gap-1 font-bold text-sm md:text-base ${periodReturns[timeRange] >= 0 ? TC.textPositive : TC.textNegative}`}
        >
          {periodReturns[timeRange] >= 0 ? (
            <FaArrowUp size={8} />
          ) : (
            <FaArrowDown size={8} />
          )}
          <span>{Math.abs(periodReturns[timeRange]).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};

const Chart = ({ performanceData, currentMetrics, TC, disableAnimations }) => {
  const isPositive = currentMetrics.profitLoss >= 0;
  const gradientId = `performanceGradient`;

  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="flex-1 min-h-[250px] flex items-center justify-center text-gray-400">
        <p className="text-sm">No performance data available</p>
      </div>
    );
  }

  const ChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const rowPositive = data.profitLoss >= 0;

      return (
        <div
          className={`rounded-lg p-3 shadow-lg min-w-[150px] ${TC.tooltipBg}`}
        >
          <p className={`font-semibold text-sm mb-1 ${TC.tooltipTextPrimary}`}>
            {data.day || data.date}
          </p>
          <div className={`text-sm font-bold ${TC.tooltipTextPrimary}`}>
            $
            {data.value.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div
            className={`text-xs mt-1 ${rowPositive ? TC.textPositive : TC.textNegative}`}
          >
            {rowPositive ? "+" : ""}
            {data.profitLossPercentage.toFixed(2)}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 min-h-[250px] w-full px-2 pb-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={performanceData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? "#10B981" : "#EF4444"}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? "#10B981" : "#EF4444"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={TC.chartGrid}
            vertical={false}
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            stroke={TC.chartStroke}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            width={40}
            stroke={TC.chartStroke}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={<ChartTooltip TC={TC} />}
            cursor={{
              stroke: TC.chartGrid,
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            isAnimationActive={!disableAnimations}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "#10B981" : "#EF4444"}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            isAnimationActive={!disableAnimations}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
