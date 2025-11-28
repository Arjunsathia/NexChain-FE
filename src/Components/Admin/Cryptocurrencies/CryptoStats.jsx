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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>
                {stat.label}
              </p>
              <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${TC.textPrimary}`}>
                {stat.value}
              </h3>
            </div>
            <div
              className={`p-2 sm:p-3 rounded-xl ${stat.bg} ${stat.border} border`}
            >
              <stat.icon className={`text-base sm:text-lg ${stat.color}`} />
            </div>
          </div>
          {/* Glow Effect */}
          <div
            className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
          />
        </div>
      ))}
    </div>
  );
}

export default CryptoStats;
