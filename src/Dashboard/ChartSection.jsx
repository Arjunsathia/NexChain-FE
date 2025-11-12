import React, { useState, useEffect } from "react";
import ApexCharts from "react-apexcharts";
import axios from "axios";
import { FaChartLine, FaChartBar } from "react-icons/fa";

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
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl p-5 text-white fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-5">
        <div className="flex items-center gap-3 fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="p-2 bg-cyan-400/10 rounded-lg">
            {chartType === "line" ? <FaChartLine className="text-cyan-400 text-base" /> : <FaChartBar className="text-cyan-400 text-base" />}
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent capitalize">
              {coinId} Price Chart
            </h2>
            <p className="text-xs text-gray-400">Live market data</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 fade-in" style={{ animationDelay: "0.3s" }}>
          {/* Timeframe Buttons */}
          <div className="flex gap-1 bg-gray-700/50 rounded-xl p-1 border border-gray-600">
            {timeOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeframe(t.value)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  timeframe === t.value 
                    ? "bg-cyan-600 text-white shadow-lg" 
                    : "text-gray-300 hover:text-white hover:bg-gray-600"
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
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-cyan-400 rounded-lg text-sm font-semibold transition-all duration-200 border border-gray-600 hover:border-cyan-500 flex items-center gap-2"
          >
            {chartType === "line" ? <FaChartBar className="text-xs" /> : <FaChartLine className="text-xs" />}
            {chartType === "line" ? "Candlestick" : "Line"}
          </button>
        </div>
      </div>

      <div className="h-[300px] lg:h-[350px] fade-in" style={{ animationDelay: "0.4s" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-3"></div>
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
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm">No chart data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartSection;