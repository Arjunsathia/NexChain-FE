import React, { useEffect, useState, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { getMarketChart, getBinanceKlines } from "@/api/coinApis";
import useThemeCheck from "@/hooks/useThemeCheck";
import useMediaQuery from "@/hooks/useMediaQuery";

const ChartSection = ({ coinId, disableAnimations = false }) => {
  const isLight = useThemeCheck();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [days, setDays] = useState(1);
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
            if (series.length === 0) setData(data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinId, days]);

  const options = useMemo(() => ({
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false },
      background: "transparent",
      animations: { enabled: !disableAnimations },
      sparkline: { enabled: false },
    },
    colors: ["#00E396"],
    stroke: {
      curve: "smooth",
      width: isMobile ? 1.5 : 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    grid: {
      show: true,
      borderColor: isLight ? "#e0e0e0" : "#2e2e2e",
      strokeDashArray: 4,
      padding: {
        top: 10,
        right: isMobile ? 5 : 20,
        bottom: 0,
        left: isMobile ? 10 : 20
      },
      xaxis: {
        lines: { show: false }
      },
      yaxis: {
        lines: { show: true }
      }
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: isLight ? "#64748b" : "#94a3b8",
          fontSize: isMobile ? '10px' : '12px',
          fontWeight: 500
        },
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
          hour: "hh:mm tt",
        },
        datetimeUTC: false,
        offsetY: 0,
      },
      tooltip: {
        enabled: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: {
        show: true,
        stroke: {
          color: '#3b82f6',
          width: 1,
          dashArray: 3,
        },
      },
    },
    yaxis: {
      opposite: false,
      labels: {
        style: {
          colors: isLight ? "#64748b" : "#94a3b8",
          fontSize: isMobile ? '10px' : '11px',
          fontWeight: 600
        },
        formatter: (value) => {
          if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
          return `$${value.toLocaleString()}`;
        },
        offsetX: isMobile ? -5 : 0,
      },
      tickAmount: isMobile ? 4 : 6,
    },
    theme: {
      mode: isLight ? "light" : "dark",
    },
    tooltip: {
      theme: isLight ? "light" : "dark",
      shared: true,
      intersect: false,
      x: {
        format: "dd MMM yyyy, hh:mm tt",
      },
      y: {
        formatter: (v) => `$${v?.toLocaleString()}`
      },
      style: {
        fontSize: '12px',
      }
    },
  }), [isLight, isMobile, disableAnimations]);

  const timeframes = [
    { label: "24H", value: 1 },
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "3M", value: 90 },
    { label: "1Y", value: 365 },
  ];

  return (
    <div
      className={`p-3 sm:p-5 rounded-2xl ${isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 glass-card"
        }`}
    >
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
        </div>
      </div>

      <div className="w-full h-[240px] sm:h-[400px] lg:h-[500px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-[2px] z-50 rounded-xl transition-all duration-300">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        )}

        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height="100%"
        />
      </div>
    </div>
  );
};

export default ChartSection;
