import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { getMarketChart } from "@/api/coinApis";
import useThemeCheck from "@/hooks/useThemeCheck";

const ChartSection = ({ coinId }) => {
  const isLight = useThemeCheck();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(1); // 1 = 24h

  // Fetch Chart Data
  useEffect(() => {
    const fetchChart = async () => {
      if (!coinId) return;
      setLoading(true);
      try {
        const data = await getMarketChart(coinId, days);
        if (data && Array.isArray(data.prices)) {
          setSeries([{ name: "Price", data: data.prices }]);
        } else {
           console.warn("Chart data prices missing or invalid format", data);
           setSeries([{ name: "Price", data: [] }]);
        }
      } catch (error) {
        console.error("Failed to fetch chart data", error);
        setSeries([{ name: "Price", data: [] }]);
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [coinId, days]);

  // Chart Options
  const options = {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false },
      background: "transparent",
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
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm'
        }
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
      x: { format: "dd MMM HH:mm" },
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
    <div className={`p-4 rounded-2xl transition-all ${
      isLight 
        ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100" 
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl border border-gray-700/50"
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-bold text-lg ${isLight ? "text-gray-900" : "text-white"}`}>
          Price Chart ({coinId?.toUpperCase()})
        </h3>
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setDays(tf.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                days === tf.value
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
        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-[1px] z-10 rounded-xl transition-all duration-300">
             <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                {/* <span className="text-xs font-medium text-blue-500">Updating...</span> */}
             </div>
          </div>
        )}
        
        <ReactApexChart options={options} series={series} type="area" height="100%" />
      </div>
    </div>
  );
};

export default ChartSection;
