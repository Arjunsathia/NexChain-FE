import React from "react";
import { FaTrophy } from "react-icons/fa";

function AdditionalStats({ coin, formatNumber, formatCurrency, TC, isLight }) {
  const stats = [
    {
      label: "Circulating Supply",
      value: `${formatNumber(coin.market_data?.circulating_supply)} ${coin.symbol?.toUpperCase()}`,
    },
    {
      label: "Total Supply",
      value: `${formatNumber(coin.market_data?.total_supply)} ${coin.symbol?.toUpperCase()}`,
    },
    {
      label: "All Time High",
      value: formatCurrency(coin.market_data?.ath?.usd),
    },
    {
      label: "ATH Date",
      value: new Date(coin.market_data?.ath_date?.usd).toLocaleDateString(),
    },
    {
      label: "All Time Low",
      value: formatCurrency(coin.market_data?.atl?.usd),
    },
    {
      label: "ATL Date",
      value: new Date(coin.market_data?.atl_date?.usd).toLocaleDateString(),
    },
  ];

  return (
    <div
      className={`order-4 rounded-xl md:rounded-2xl p-3 md:p-6 fade-in ${TC.bgCard}`}
      style={{ animationDelay: "0.4s" }}
    >
      <h3 className="text-sm md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
        <FaTrophy className="text-yellow-500 text-xs md:text-base" />
        Additional Statistics
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`p-2 md:p-3 rounded-lg ${isLight ? "bg-gray-50/50" : "bg-gray-800/40"
              }`}
          >
            <p className={`text-[10px] md:text-xs mb-1 ${TC.textSecondary}`}>{stat.label}</p>
            <p
              className={`text-xs md:text-sm font-bold truncate ${TC.textPrimary}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdditionalStats;
