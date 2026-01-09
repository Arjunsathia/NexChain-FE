import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useMemo } from "react";
import {
  FaWallet,
  FaCoins,
  FaChartLine,
  FaStar,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import useWalletContext from "@/hooks/useWalletContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";

function InfoCards() {
  const isLight = useThemeCheck();
  const { balance } = useWalletContext();
  const { watchlist } = useWatchlist();
  const { groupedHoldings, portfolioSummary } = useLivePortfolio();

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      textTertiary: isLight ? "text-gray-500" : "text-gray-500",

      bgCard: isLight
        ? "bg-white/80 backdrop-blur-xl shadow-md border border-white/40"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      textValueHover: isLight
        ? "group-hover:text-blue-600"
        : "group-hover:text-cyan-300",

      textGreen: isLight ? "text-green-700" : "text-green-400",
      textRed: isLight ? "text-red-700" : "text-red-400",
      textGray: isLight ? "text-gray-700" : "text-gray-400",
    }),
    [isLight],
  );

  const portfolioStats = useMemo(() => {
    const uniqueCoins = groupedHoldings?.length || 0;

    const totalInvested = portfolioSummary?.remainingInvestment || 0;
    const currentValue = portfolioSummary?.totalCurrentValue || 0;
    const profitLoss = portfolioSummary?.totalProfitLoss || 0;
    const profitLossPercentage =
      portfolioSummary?.totalProfitLossPercentage || 0;

    return {
      totalCoins: uniqueCoins,
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercentage,
    };
  }, [groupedHoldings, portfolioSummary]);

  const cards = [
    {
      title: "Cash Balance",
      value: balance || 0,
      icon: FaWallet,
      format: "currency",
      description: "Available Funds",
      trend: null,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Coins Owned",
      value: portfolioStats.totalCoins,
      icon: FaCoins,
      format: "number",
      description: "Different cryptocurrencies",
      trend: null,
      color: "from-green-500 to-emerald-400",
    },
    {
      title: "Portfolio Value",
      value: portfolioStats.currentValue,
      icon: FaChartLine,
      format: "currency",
      description: "Investment Value",
      trend: portfolioStats.profitLossPercentage,
      trendValue: portfolioStats.profitLoss,
      color: "from-purple-500 to-violet-400",
    },
    {
      title: "Watchlist",
      value: watchlist.length,
      icon: FaStar,
      format: "number",
      description: "Tracked coins",
      trend: null,
      color: "from-amber-500 to-yellow-400",
    },
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case "currency":
        return `$${(value || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      case "number":
        return value.toString();
      default:
        return value;
    }
  };

  const formatTrendValue = (value) => {
    return `$${Math.abs(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getTrendColor = (trend) => {
    if (trend === null) return TC.textSecondary;
    return trend >= 0 ? TC.textGreen : TC.textRed;
  };

  const getTrendIcon = (trend) => {
    if (trend === null) return null;
    return trend >= 0 ? (
      <FaArrowUp className="text-xs" />
    ) : (
      <FaArrowDown className="text-xs" />
    );
  };

  const getTrendText = (trend, trendValue) => {
    if (trend === null) return null;

    return (
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1">
          {getTrendIcon(trend)}
          <span>{`${trend >= 0 ? "+" : ""}${Math.abs(trend).toFixed(2)}%`}</span>
        </div>
        {trendValue !== undefined && (
          <div className={`text-xs opacity-80 ${TC.textSecondary}`}>
            {trendValue >= 0 ? "+" : "-"}
            {formatTrendValue(trendValue)}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const trendColor = getTrendColor(card.trend);
        const trendText = getTrendText(card.trend, card.trendValue);

        return (
          <div
            key={idx}
            className={`${TC.bgCard} rounded-2xl p-4 sm:p-5 transition-all duration-300 group cursor-default relative overflow-hidden`}
            style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
          >
            {/* Background Gradient Splash */}
            <div
              className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300`}
            />

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div
                className={`p-2.5 sm:p-3 bg-gradient-to-br ${card.color} rounded-xl shadow-lg shadow-black/5 group-hover:shadow-current/20 transition-all duration-300`}
              >
                <Icon className="text-white text-lg sm:text-xl" />
              </div>
              {trendText && (
                <div
                  className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg ${trendColor.replace("text-", "bg-")}/10 ${trendColor} backdrop-blur-sm`}
                >
                  {trendText}
                </div>
              )}
            </div>

            <div className="relative z-10">
              <p
                className={`text-xs sm:text-sm font-medium uppercase tracking-wider mb-1 ${TC.textSecondary}`}
              >
                {card.title}
              </p>
              <p
                className={`text-xl sm:text-2xl font-bold transition-colors ${TC.textPrimary} ${TC.textValueHover}`}
              >
                {formatValue(card.value, card.format)}
              </p>
              <p className={`text-[10px] sm:text-xs mt-1 ${TC.textTertiary}`}>
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default InfoCards;
