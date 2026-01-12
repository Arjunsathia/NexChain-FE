import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { getMarketChart } from "@/api/coinApis";
import useThemeCheck from "@/hooks/useThemeCheck";

const ChartSection = ({ coinId, disableAnimations = false }) => {
  const isLight = useThemeCheck();
  const [days, setDays] = useState(1);
  const [series, setSeries] = useState(() => {
    try {
      if (coinId) {
        // Use the default days value (1) directly or use the state variable if available
        // Since we just declared `days`, it should be available.
        const cacheKey = `chart_${coinId}_${days}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data } = JSON.parse(cached);
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

      const cacheKey = `chart_${coinId}_${days}`;
      const now = Date.now();
      const cached = localStorage.getItem(cacheKey);

      // If we already have data, check if it matches cache
      let shouldFetch = true;

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
          // 5 minutes TTL
          if (now - timestamp < 5 * 60 * 1000) {
            // Cache is valid.
            if (series.length === 0) {
              setData(data);
            }
            shouldFetch = false;
          }
        } catch {
          // ignore
        }
      }

      if (!shouldFetch) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch from API
      try {
        const data = await getMarketChart(coinId, days);

        if (active) {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ timestamp: now, data }),
          );
          setData(data);
        }
      } catch (error) {
        console.error("Failed to fetch chart data", error);

        // If API fails, fallback to stale cache if available
        if (active) {
          if (cached) {
            const { data } = JSON.parse(cached);
            setData(data);
          } else {
            setSeries([{ name: "Price", data: [] }]);
          }
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

  const options = {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false },
      background: "transparent",
      animations: { enabled: !disableAnimations },
    },
    colors: ["#00E396"],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    grid: {
      show: true,
      borderColor: isLight ? "#e0e0e0" : "#2e2e2e",
      strokeDashArray: 4,
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: { colors: isLight ? "#333" : "#888" },
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
          hour: "hh:mm tt", // Updated to 12h format for better readability
        },
        datetimeUTC: false, // Critical Fix: Force local time
      },
      tooltip: {
        enabled: false, // Disable x-axis tooltip to reduce clutter
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isLight ? "#333" : "#888" },
        formatter: (value) => `$${value.toLocaleString()}`,
      },
    },
    theme: {
      mode: isLight ? "light" : "dark",
    },
    tooltip: {
      theme: isLight ? "light" : "dark",
      x: {
        format: "dd MMM yyyy hh:mm tt", // Full date with 12h time
      },
    },
  };

  const timeframes = [
    { label: "24h", value: 1 },
    { label: "7d", value: 7 },
    { label: "30d", value: 30 },
    { label: "3m", value: 90 },
    { label: "1y", value: 365 },
  ];

  return (
    <div
      className={`p-4 rounded-2xl ${isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 glass-card"
        }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`font-bold text-lg ${isLight ? "text-gray-900" : "text-white"}`}
        >
          Price Chart ({coinId?.toUpperCase()})
        </h3>
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setDays(tf.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${days === tf.value
                ? "bg-blue-600 text-white shadow-lg"
                : isLight
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[350px] sm:h-[450px] lg:h-[560px] relative">
        { }
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-[1px] z-10 rounded-xl transition-all duration-300">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              { }
            </div>
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
