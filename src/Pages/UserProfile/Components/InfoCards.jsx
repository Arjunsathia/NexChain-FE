import React, { useMemo } from "react";
import { FaWallet, FaCoins, FaChartLine, FaStar, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
// import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useLivePortfolio } from '@/hooks/useLivePortfolio';

function InfoCards() {
  const { balance } = useWalletContext();
  // const { purchasedCoins } = usePurchasedCoins();
  const { watchlist } = useWatchlist();
  const { groupedHoldings, portfolioSummary } = useLivePortfolio();

  const portfolioStats = useMemo(() => {
    // Use groupedHoldings from useLivePortfolio for accurate count
    const uniqueCoins = groupedHoldings?.length || 0;
    
    // Use portfolioSummary for accurate portfolio values
    const totalInvested = portfolioSummary?.remainingInvestment || 0;
    const currentValue = portfolioSummary?.totalCurrentValue || 0;
    const profitLoss = portfolioSummary?.totalProfitLoss || 0;
    const profitLossPercentage = portfolioSummary?.totalProfitLossPercentage || 0;

    return {
      totalCoins: uniqueCoins,
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercentage
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
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Coins Owned",
      value: portfolioStats.totalCoins,
      icon: FaCoins,
      format: "number",
      description: "Different cryptocurrencies",
      trend: null,
      color: "from-green-500 to-emerald-400"
    },
    {
      title: "Portfolio Value",
      value: portfolioStats.currentValue,
      icon: FaChartLine,
      format: "currency",
      description: "Investment Value",
      trend: portfolioStats.profitLossPercentage,
      trendValue: portfolioStats.profitLoss,
      color: "from-purple-500 to-violet-400"
    },
    {
      title: "Watchlist",
      value: watchlist.length,
      icon: FaStar,
      format: "number",
      description: "Tracked coins",
      trend: null,
      color: "from-amber-500 to-yellow-400"
    },
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case "currency":
        return `$${(value || 0).toLocaleString('en-IN', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`;
      case "number":
        return value.toString();
      default:
        return value;
    }
  };

  const formatTrendValue = (value) => {
    return `$${Math.abs(value || 0).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getTrendColor = (trend) => {
    if (trend === null) return "text-gray-400";
    return trend >= 0 ? "text-green-400" : "text-red-400";
  };

  const getTrendIcon = (trend) => {
    if (trend === null) return null;
    return trend >= 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />;
  };

  const getTrendText = (trend, trendValue) => {
    if (trend === null) return null;
    
    return (
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1">
          {getTrendIcon(trend)}
          <span>{`${trend >= 0 ? '+' : ''}${Math.abs(trend).toFixed(2)}%`}</span>
        </div>
        {trendValue !== undefined && (
          <div className="text-xs opacity-80">
            {trendValue >= 0 ? '+' : '-'}{formatTrendValue(trendValue)}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const trendColor = getTrendColor(card.trend);
        const trendText = getTrendText(card.trend, card.trendValue);
        
        return (
          <div
            key={idx}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl rounded-xl p-4 transition-all duration-300 hover:scale-105 group cursor-pointer fade-in"
            style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 bg-gradient-to-r ${card.color} rounded-lg shadow-lg`}>
                <Icon className="text-white text-base" />
              </div>
              {trendText && (
                <div className={`text-xs font-semibold ${trendColor}`}>
                  {trendText}
                </div>
              )}
            </div>
            
            <p className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
              {formatValue(card.value, card.format)}
            </p>
            
            <p className="text-sm text-gray-400 font-medium">
              {card.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {card.description}
            </p>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}

export default InfoCards;