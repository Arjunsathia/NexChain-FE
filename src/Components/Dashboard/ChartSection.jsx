import React, { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getMarketChart, getBinanceKlines } from "@/api/coinApis";
import useThemeCheck from "@/hooks/useThemeCheck";
import useMediaQuery from "@/hooks/useMediaQuery";
import { FaExpand, FaCompress, FaTimes } from "react-icons/fa";

const ChartSection = ({ coinId, disableAnimations = false }) => {
  const isLight = useThemeCheck();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [days, setDays] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [series, setSeries] = useState(() => {
    try {
      if (coinId) {
        // Preference Binance cache, fallback to Gecko
        const bCacheKey = `chart_binance_${coinId}_${days}`;
        const gCacheKey = `chart_${coinId}_${days}`;

        const bCached = localStorage.getItem(bCacheKey);
        if (bCached) {
          const { data } = JSON.parse(bCached);
          if (data?.prices && Array.isArray(data.prices)) {
            return [{ name: "Price", data: data.prices }];
          }
        }

        const gCached = localStorage.getItem(gCacheKey);
        if (gCached) {
          const { data } = JSON.parse(gCached);
          if (data?.prices && Array.isArray(data.prices)) {
            return [{ name: "Price", data: data.prices }];
          }
        }
      }
    } catch (e) {
      console.warn("Chart cache init error", e);
    }
    return [];
  });
  const [loading, setLoading] = useState(false);

  const validateData = (data) => {
    if (!data || typeof data !== "object") return false;
    if (!Array.isArray(data.prices)) return false;
    if (data.prices.length === 0) return true;

    const first = data.prices[0];
    return (
      Array.isArray(first) &&
      first.length === 2 &&
      typeof first[0] === "number" &&
      !isNaN(first[1])
    );
  };

  useEffect(() => {
    let active = true;

    const fetchChart = async () => {
      if (!coinId) return;

      const cacheKey = `chart_binance_${coinId}_${days}`;
      const now = Date.now();
      const cached = localStorage.getItem(cacheKey);

      // Helper to set data
      const setData = (data) => {
        if (validateData(data)) {
          setSeries([{ name: "Price", data: data.prices }]);
        } else {
          console.warn(`Chart data validation failed for ${coinId}.`);
          setSeries([{ name: "Price", data: [] }]);
        }
      };

      // Check Cache Validity
      if (cached) {
        try {
          const { timestamp, data } = JSON.parse(cached);
          if (now - timestamp < 3 * 60 * 1000) { // 3 min cache for precision
            // Always apply: the series on screen may be another timeframe's
            setData(data);
            return;
          }
        } catch {
          // ignore
        }
      }

      setLoading(true);

      try {
        // 1. Try Binance (High Precision)
        let data = await getBinanceKlines(coinId, days);
        let source = "binance";

        // 2. Fallback to CoinGecko (Historical/Wide Coverage)
        if (!data) {
          data = await getMarketChart(coinId, days);
          source = "coingecko";
        }

        if (active && data) {
          const finalCacheKey = source === "binance" ? cacheKey : `chart_${coinId}_${days}`;
          localStorage.setItem(
            finalCacheKey,
            JSON.stringify({ timestamp: now, data }),
          );
          setData(data);
        }
      } catch (error) {
        console.error("Failed to fetch chart data", error);
        if (active && cached) {
          const { data } = JSON.parse(cached);
          setData(data);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchChart();
    return () => {
      active = false;
    };
  }, [coinId, days]);

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e) => {
        if (e.key === "Escape") setIsFullScreen(false);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isFullScreen]);

  const chartData = useMemo(
    () => (series[0]?.data || []).map(([t, price]) => ({ t, price })),
    [series],
  );

  const axisColor = isLight ? "#64748b" : "#94a3b8";
  const formatTick = useMemo(() => {
    const opts =
      days <= 1
        ? { hour: "2-digit", minute: "2-digit" }
        : days <= 90
          ? { day: "2-digit", month: "short" }
          : { month: "short", year: "2-digit" };
    const fmt = new Intl.DateTimeFormat(undefined, opts);
    return (t) => fmt.format(t);
  }, [days]);
  const formatPrice = (value) =>
    value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value.toLocaleString()}`;
  const tooltipDate = new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeframes = [
    { label: "24H", value: 1 },
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "3M", value: 90 },
    { label: "1Y", value: 365 },
  ];

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${isFullScreen
          ? "fixed inset-0 z-[9999] p-4 sm:p-8 flex flex-col h-screen"
          : "p-3 sm:p-5 rounded-2xl"
        }
        ${isLight
          ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100"
          : "bg-gray-900/95 backdrop-blur-xl border border-gray-700/50"
        }
        glass-card
      `}
    >
      {isFullScreen && (
        <button
          onClick={() => setIsFullScreen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 z-50"
          title="Exit Fullscreen (Esc)"
        >
          <FaTimes size={16} />
        </button>
      )}

      <div className="flex flex-row justify-between items-center mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1 h-4 sm:h-5 bg-blue-500 rounded-full flex-shrink-0" />
          <h3
            className={`font-bold text-[13px] sm:text-lg tracking-tight truncate ${isLight ? "text-gray-900" : "text-white"}`}
          >
            {coinId?.toUpperCase()}
          </h3>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setDays(tf.value)}
              className={`
                px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-lg text-[9px] sm:text-[11px] font-bold transition-all duration-200
                ${days === tf.value
                  ? "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20"
                  : isLight
                    ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }
              `}
            >
              {tf.label}
            </button>
          ))}
          {!isFullScreen && !isMobile && (
            <button
              onClick={() => setIsFullScreen(true)}
              className={`
                p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs transition-all duration-200 ml-1
                ${isLight
                  ? "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                  : "text-gray-500 hover:text-cyan-400 hover:bg-white/5"
                }
              `}
              title="Full Screen View"
            >
              <FaExpand />
            </button>
          )}
        </div>
      </div>

      <div className={`w-full relative ${isFullScreen ? "mt-4 flex-1" : "h-[220px] sm:h-[400px] lg:h-[500px]"}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-[2px] z-50 rounded-xl transition-all duration-300">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: isMobile ? 5 : 20, bottom: 0, left: isMobile ? 0 : 10 }}
          >
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E396" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#00E396" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke={isLight ? "#e0e0e0" : "#2e2e2e"}
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={formatTick}
              tick={{ fill: axisColor, fontSize: isMobile ? 10 : 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={formatPrice}
              tick={{ fill: axisColor, fontSize: isMobile ? 10 : 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickCount={isMobile ? 4 : 6}
              width={isMobile ? 48 : 64}
            />
            <Tooltip
              cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                background: isLight ? "#ffffff" : "#111827",
                border: `1px solid ${isLight ? "#e5e7eb" : "#374151"}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: axisColor }}
              labelFormatter={(t) => tooltipDate.format(t)}
              formatter={(v) => [`$${Number(v).toLocaleString()}`, "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#00E396"
              strokeWidth={isMobile ? 1.5 : 2}
              fill="url(#priceFill)"
              isAnimationActive={!disableAnimations}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartSection;
