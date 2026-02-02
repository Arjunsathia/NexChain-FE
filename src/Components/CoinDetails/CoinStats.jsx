import React from "react";
import { FaChartLine, FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";

function CoinStats({ coin, livePrice, formatCurrency, TC, isLight }) {
  const stats = [
    {
      label: "Market Cap",
      value: formatCurrency(coin.market_data?.market_cap?.usd),
      icon: FaChartLine,
      color: "cyan",
    },
    {
      label: "24h Volume",
      value: formatCurrency(
        livePrice?.volume24h || coin.market_data?.total_volume?.usd,
      ),
      icon: FaCoins,
      color: "purple",
    },
    {
      label: "24h High",
      value: formatCurrency(
        livePrice?.high24h || coin.market_data?.high_24h?.usd,
      ),
      icon: FaArrowUp,
      color: "green",
    },
    {
      label: "24h Low",
      value: formatCurrency(
        livePrice?.low24h || coin.market_data?.low_24h?.usd,
      ),
      icon: FaArrowDown,
      color: "red",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 fade-in"
      style={{ animationDelay: "0.2s" }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`rounded-xl md:rounded-2xl p-3 md:p-4 transition-all duration-300 shadow-sm md:shadow-md hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 ${TC.bgCard}`}
        >
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <div
              className={`p-1.5 md:p-2 rounded-lg ${stat.color === "cyan"
                ? isLight
                  ? "bg-cyan-50 text-cyan-600"
                  : "bg-cyan-500/10 text-cyan-400"
                : stat.color === "purple"
                  ? isLight
                    ? "bg-purple-50 text-purple-600"
                    : "bg-purple-500/10 text-purple-400"
                  : stat.color === "green"
                    ? isLight
                      ? "bg-green-50 text-green-600"
                      : "bg-green-500/10 text-green-400"
                    : isLight
                      ? "bg-red-50 text-red-600"
                      : "bg-red-500/10 text-red-400"
                }`}
            >
              <stat.icon className="text-xs md:text-lg" />
            </div>
          </div>
          <p
            className={`text-sm md:text-xl font-bold truncate ${TC.textPrimary}`}
          >
            {stat.value}
          </p>
          <p className={`text-[10px] md:text-xs mt-0.5 md:mt-1 font-medium ${TC.textSecondary}`}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export default CoinStats;
