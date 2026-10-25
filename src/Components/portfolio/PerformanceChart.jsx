import React, { useState, useMemo, useEffect } from "react";
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
import { useSelector } from "react-redux";
import api from "@/api/axiosConfig";

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

  // Stabilized Chart Data: Only updates when Time Range changes or initial data loads
  const [chartData, setChartData] = useState([]);

  // Use a Ref to pass live data to tooltip without re-rendering the Chart component
  const tooltipDataRef = React.useRef(currentMetrics);
  useEffect(() => {
    tooltipDataRef.current = currentMetrics;
  }, [currentMetrics]);

  // Real history: hourly snapshots recorded by the server (daily points for
  // ranges over a day), ending with a live point. Refetched when the range
  // changes or holdings change, not on every price tick.
  const [historySince, setHistorySince] = useState(null);
  const userId = useSelector((state) => state.user.user?.id);
  const hasHoldings = currentMetrics.totalInvestment > 0;

  useEffect(() => {
    if (!userId || !hasHoldings) {
      setChartData([]);
      return;
    }
    let active = true;
    const isIntraday = timeRange === "1d";
    api
      .get(`/purchases/performance/${userId}`, { params: { range: timeRange } })
      .then(({ data }) => {
        if (!active) return;
        setHistorySince(data.historySince ? new Date(data.historySince) : null);
        setChartData(
          (data.points || []).map((p) => {
            const date = new Date(p.at);
            const profitLoss = p.holdingsValue - p.invested;
            return {
              date: p.live
                ? isIntraday ? "Now" : "Today"
                : isIntraday
                  ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
                  : date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              value: Math.round(p.holdingsValue * 100) / 100,
              profitLoss,
              profitLossPercentage: p.invested > 0 ? (profitLoss / p.invested) * 100 : 0,
              investment: p.invested,
              day: p.live ? (isIntraday ? "Now" : "Today") : null,
              fullDate: date,
            };
          }),
        );
      })
      .catch(() => active && setChartData([]));
    return () => {
      active = false;
    };
  }, [userId, timeRange, hasHoldings, groupedHoldings?.length]);

  const periodReturns = useMemo(() => {
    if (chartData.length < 2)
      return { "1d": 0, "7d": 0, "30d": 0, "90d": 0, current: 0 };

    // Change in unrealized P/L across the range, relative to the current cost
    // basis, so buying more coins mid-range doesn't count as a gain
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const totalReturn =
      last.investment > 0 ? ((last.profitLoss - first.profitLoss) / last.investment) * 100 : 0;

    const periodReturn = totalReturn;

    return {
      "1d": periodReturn,
      "7d": periodReturn,
      "30d": periodReturn,
      "90d": periodReturn,
      current: totalReturn,
    };
  }, [chartData]);

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
        chartData={chartData}
        tooltipDataRef={tooltipDataRef}
        isPositive={currentMetrics.profitLoss >= 0}
        TC={TC}
        disableAnimations={disableAnimations}
      />
      {historySince && (
        <p className={`px-4 pb-3 text-[11px] ${TC.textSecondary}`}>
          Tracking since {historySince.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </p>
      )}
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
        {["1d", "7d", "30d", "90d"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${timeRange === range
              ? TC.bgRangeButtonActive
              : TC.bgRangeButtonDefault
              }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div >
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
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
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
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
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

// 1. Move Tooltip OUTSIDE and use Ref for live data
const ChartTooltip = ({ active, payload, TC, tooltipDataRef }) => {
  if (active && payload && payload.length) {
    let data = payload[0].payload;

    // Retrieve live metrics seamlessly from Ref without triggering Chart re-render
    const currentMetrics = tooltipDataRef?.current;

    // Override 'Today' data point with live metrics
    if (data.day === "Today" && currentMetrics) {
      data = {
        ...data,
        value: currentMetrics.currentValue,
        profitLoss: currentMetrics.profitLoss,
        profitLossPercentage: currentMetrics.profitLossPercentage
      };
    }

    const rowPositive = data.profitLoss >= 0;

    return (
      <div
        className={`rounded-lg p-3 shadow-lg min-w-[150px] ${TC.tooltipBg}`}
      >
        <p className={`font-semibold text-xs mb-2 ${TC.tooltipTextPrimary} opacity-70`}>
          {data.day || data.date}
        </p>

        {/* P&L Amount */}
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className={`text-xs ${TC.textSecondary}`}>P&L:</span>
          <span className={`text-sm font-bold ${rowPositive ? TC.textPositive : TC.textNegative}`}>
            {rowPositive ? "+" : "-"}$
            {Math.abs(data.profitLoss).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* Percentage */}
        <div className="flex items-center justify-between gap-4">
          <span className={`text-xs ${TC.textSecondary}`}>Return:</span>
          <span
            className={`text-xs font-medium ${rowPositive ? TC.textPositive : TC.textNegative}`}
          >
            {rowPositive ? "+" : ""}
            {data.profitLossPercentage.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// 2. Wrap Chart in React.memo to prevent re-renders (fixing Axis flicker)
const Chart = React.memo(({ chartData, isPositive, tooltipDataRef, TC, disableAnimations }) => {
  const gradientId = `performanceGradient`;

  const [shouldAnimate, setShouldAnimate] = useState(!disableAnimations);

  useEffect(() => {
    if (disableAnimations) return;

    setShouldAnimate(true);
    const timer = setTimeout(() => {
      setShouldAnimate(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [chartData?.length, disableAnimations]);

  if (!chartData || chartData.length < 2) {
    return (
      <div className="flex-1 min-h-[250px] flex items-center justify-center text-gray-400 px-6 text-center">
        <p className="text-sm">
          {chartData?.length
            ? "Your performance history is recorded every hour. Check back soon to see the chart."
            : "No performance data yet. Buy a coin to start tracking performance."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[250px] w-full px-2 pb-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
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
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={<ChartTooltip TC={TC} tooltipDataRef={tooltipDataRef} />}
            cursor={{
              stroke: TC.chartGrid,
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            isAnimationActive={shouldAnimate}
            animationDuration={1500}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "#10B981" : "#EF4444"}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            isAnimationActive={shouldAnimate}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

Chart.displayName = "Chart";

export default React.memo(PerformanceChart);
