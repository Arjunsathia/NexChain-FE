import React from "react";
import { FaCoins, FaExchangeAlt, FaArrowUp } from "react-icons/fa";

function CryptoStats({ coins, TC }) {
  const stats = [
    {
      label: "Total Coins",
      value: coins.length,
      icon: FaCoins,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      label: "Active Trading",
      value: "24/7",
      icon: FaExchangeAlt,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "24h Gainers",
      value: coins.filter((c) => c.price_change_percentage_24h > 0).length,
      icon: FaArrowUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`${TC.bgStatsCard} p-4 sm:p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md h-full`}
        >
          {/* Background Gradient Splash */}
          <div
            className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="flex items-center gap-4 relative z-10 h-full">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg text-white group-hover:shadow-blue-500/40 transition-shadow`}
            >
              <stat.icon className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-[10px] uppercase font-bold tracking-wider leading-none mb-1.5 ${TC.textSecondary}`}
              >
                {stat.label}
              </p>
              <h3
                className={`text-xl sm:text-2xl font-bold leading-tight truncate ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}
              >
                {stat.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CryptoStats;
