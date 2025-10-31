// ChartSection.jsx
import React, { useState, useEffect } from "react";
import ApexCharts from "react-apexcharts";
import axios from "axios";

function ChartSection({ coinId }) {
  const [chartType, setChartType] = useState("line"); 
  const [timeframe, setTimeframe] = useState("7d");
  const [chartData, setChartData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const timeOptions = [
    // { label: "1H", value: "1h" },
    { label: "24H", value: "24h" },
    { label: "7D", value: "7d" },
    { label: "1M", value: "1m" }
  ];

  useEffect(() => {
    if (coinId) {
      fetchChartData(timeframe, chartType, coinId);
    }
  }, [timeframe, chartType, coinId]);

  const fetchChartData = async (range, type, coinId) => {
    setLoading(true);
    try {
      const daysMap = {
        "1h": 1,
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
              interval: range === "1h" ? "hourly" : "daily",
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

  const chartOptions = {
    chart: {
      type: chartType,
      background: "transparent",
      toolbar: { 
        show: !isMobile,
        tools: {
          download: !isMobile,
          selection: !isMobile,
          zoom: !isMobile,
          zoomin: !isMobile,
          zoomout: !isMobile,
          pan: !isMobile,
          reset: !isMobile
        }
      },
      zoom: { enabled: !isMobile },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      }
    },
    xaxis: {
      type: "datetime",
      labels: { 
        style: { colors: "#9CA3AF" },
        datetimeFormatter: {
          hour: 'HH:mm',
          day: 'MMM dd',
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        formatter: (val) =>
          typeof val === "number" ? `$${val.toLocaleString()}` : "",
        style: { colors: "#9CA3AF" },
      },
    },
    tooltip: {
      x: { format: "MMM dd, HH:mm" },
      theme: "dark",
    },
    grid: { 
      borderColor: "#374151",
      strokeDashArray: 4,
    },
    stroke: {
      curve: "smooth",
      width: chartType === "line" ? 3 : 1,
    },
    fill: {
      type: chartType === "line" ? "gradient" : "solid",
      gradient:
        chartType === "line"
          ? {
              type: "vertical",
              shadeIntensity: 0.5,
              gradientToColors: ["#06B6D4"],
              stops: [0, 100],
            }
          : undefined,
    },
    colors: chartType === "line" ? ["#06B6D4"] : undefined,
  };

  return (
    <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-4 lg:p-6 text-white fade-in">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 mb-4">
        <h2 className="text-lg lg:text-xl font-semibold text-cyan-400 capitalize truncate">
          {coinId} Price Chart
        </h2>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Timeframe Buttons */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {timeOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeframe(t.value)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  timeframe === t.value 
                    ? "bg-cyan-600 text-white shadow-lg" 
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
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
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-700 hover:border-cyan-500"
          >
            {chartType === "line" ? "📊 Candlestick" : "📈 Line"}
          </button>
        </div>
      </div>

      <div className="h-[300px] lg:h-[350px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading chart data...</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <ApexCharts
            type={chartType}
            series={[{ name: "Price", data: chartData }]}
            options={chartOptions}
            height="100%"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p>No chart data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartSection;