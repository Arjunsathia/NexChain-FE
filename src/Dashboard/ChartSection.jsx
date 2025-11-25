import React, { useState, useEffect, useMemo } from "react";
import ApexCharts from "react-apexcharts";
import axios from "axios";
import { FaChartLine, FaChartBar } from "react-icons/fa";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

function ChartSection({ coinId }) {
  const isLight = useThemeCheck();
  const [chartType, setChartType] = useState("line"); 
  const [timeframe, setTimeframe] = useState("7d");
  const [chartData, setChartData] = useState([]);
  const [, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    bgContainer: isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-xl",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-300",
    textTertiary: isLight ? "text-gray-500" : "text-gray-400",
    bgButtonDefault: isLight ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200/80" : "text-gray-300 hover:text-white hover:bg-gray-600",
    bgControls: isLight ? "bg-gray-100/70 border-gray-300" : "bg-gray-700/50 border-gray-600",
    bgToggleDefault: isLight ? "bg-gray-100/70 hover:bg-gray-200/80 border-gray-300" : "bg-gray-700/50 hover:bg-gray-600/50 border-gray-600",
    chartTheme: isLight ? "light" : "dark",
    chartGridColor: isLight ? "#E5E7EB" : "#374151",
    chartAxisColor: isLight ? "#6B7280" : "#9CA3AF",
    chartLineColor: isLight ? "#0284C7" : "#06B6D4",
    chartCandleUp: isLight ? "#059669" : "#10B981",
    chartCandleDown: isLight ? "#DC2626" : "#EF4444",
  }), [isLight]);


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const timeOptions = [
    { label: "24H", value: "24h" },
    { label: "7D", value: "7d" },
    { label: "1M", value: "1m" }
  ];

  useEffect(() => {
    if (coinId) {
      fetchChartData(timeframe, chartType, coinId);
    }
  }, [timeframe, chartType, coinId, isLight]); // Rerun chart fetch/setup on theme change

  const fetchChartData = async (range, type, coinId) => {
    setLoading(true);
    try {
      const daysMap = {
        "24h": 1,
        "7d": 7,
        "1m": 30,
      };
      const days = daysMap[range] || 1;

      if (type === "candlestick") {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
          {
            params: {
              vs_currency: "usd",
              days,
            },
          }
        );
        const formatted = response.data.map(
          ([timestamp, open, high, low, close]) => ({
            x: new Date(timestamp),
            y: [open, high, low, close],
          })
        );
        setChartData(formatted);
      } else {
        const priceRes = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
          {
            params: {
              vs_currency: "usd",
              days,
              interval: range === "24h" ? "hourly" : "daily",
            },
          }
        );
        const lineData = priceRes.data.prices.map(([timestamp, price]) => ({
          x: new Date(timestamp),
          y: parseFloat(price.toFixed(2)),
        }));
        setChartData(lineData);
      }
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // 💡 Chart options for line chart (Dynamically themed)
  const lineChartOptions = {
    chart: {
      type: "line",
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    xaxis: {
      type: "datetime",
      labels: { 
        style: { colors: [TC.chartAxisColor], fontSize: '11px' },
        datetimeFormatter: { hour: 'HH:mm', day: 'MMM dd' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        formatter: (val) => `$${val.toLocaleString()}`,
        style: { colors: [TC.chartAxisColor], fontSize: '11px' },
      },
    },
    tooltip: {
      x: { format: "MMM dd, HH:mm" },
      theme: TC.chartTheme, // Set tooltip theme
    },
    grid: { 
      borderColor: TC.chartGridColor, // Themed grid color
      strokeDashArray: 3,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: [TC.chartLineColor],
        stops: [0, 100],
      },
    },
    colors: [TC.chartLineColor], // Themed line color
    dataLabels: { enabled: false },
    legend: { show: false }
  };

  // 💡 Chart options for candlestick chart (Dynamically themed)
  const candlestickChartOptions = {
    chart: {
      type: "candlestick",
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    xaxis: {
      type: "datetime",
      labels: { 
        style: { colors: [TC.chartAxisColor], fontSize: '11px' },
        datetimeFormatter: { hour: 'HH:mm', day: 'MMM dd' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        formatter: (val) => `$${val.toLocaleString()}`,
        style: { colors: [TC.chartAxisColor], fontSize: '11px' },
      },
    },
    tooltip: {
      x: { format: "MMM dd, HH:mm" },
      theme: TC.chartTheme, // Set tooltip theme
    },
    grid: { 
      borderColor: TC.chartGridColor, // Themed grid color
      strokeDashArray: 3,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: TC.chartCandleUp, // Themed upward color
          downward: TC.chartCandleDown // Themed downward color
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { show: false }
  };

  const chartOptions = chartType === "line" ? lineChartOptions : candlestickChartOptions;

  return (
    <div className={`rounded-xl p-4 fade-in h-full flex flex-col border ${TC.bgContainer} ${TC.textPrimary}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 fade-in">
        <div className="flex items-center gap-2">
          <div className={isLight ? "p-1.5 bg-cyan-100 rounded-lg" : "p-1.5 bg-cyan-400/10 rounded-lg"}>
            {chartType === "line" ? <FaChartLine className="text-cyan-400 text-sm" /> : <FaChartBar className="text-cyan-400 text-sm" />}
          </div>
          <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent capitalize">
            {coinId} Chart
          </h2>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2 fade-in">
          {/* Timeframe Buttons */}
          <div className={`flex gap-1 rounded-lg p-1 border ${TC.bgControls}`}>
            {timeOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeframe(t.value)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-200 ${
                  timeframe === t.value 
                    ? "bg-cyan-600 text-white" 
                    : TC.bgButtonDefault
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          
          {/* Chart Type Toggle */}
          <button
            onClick={() =>
              setChartType(chartType === "line" ? "candlestick" : "line")
            }
            className={`p-2 text-cyan-400 rounded-lg text-xs transition-all duration-200 border hover:border-cyan-500 ${TC.bgToggleDefault}`}
            title={chartType === "line" ? "Switch to Candlestick" : "Switch to Line"}
          >
            {chartType === "line" ? <FaChartBar className="text-xs" /> : <FaChartLine className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[320px] fade-in">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
              <p className={TC.textTertiary + " text-xs"}>Loading chart...</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          // 💡 ApexCharts rendering uses dynamic options
          <ApexCharts
            type={chartType}
            series={chartType === "candlestick" ? [{ data: chartData }] : [{ name: "Price", data: chartData }]}
            options={chartOptions}
            height="100%"
          />
        ) : (
          <div className={`flex items-center justify-center h-full ${TC.textTertiary}`}>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-xs">No chart data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartSection;