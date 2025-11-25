import React, { useMemo, useState, useEffect } from "react";
import { FaWallet, FaCoins, FaChartLine, FaStar, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useLivePortfolio } from '@/hooks/useLivePortfolio';

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

function InfoCards() {
  const isLight = useThemeCheck();
  const { balance } = useWalletContext();
  const { watchlist } = useWatchlist();
  const { groupedHoldings, portfolioSummary } = useLivePortfolio();

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    bgCard: isLight ? "bg-white border-gray-300 shadow-md" : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-xl",
    textValueHover: isLight ? "group-hover:text-blue-600" : "group-hover:text-cyan-300",
    
    textGreen: isLight ? "text-green-700" : "text-green-400",
    textRed: isLight ? "text-red-700" : "text-red-400",
    textGray: isLight ? "text-gray-700" : "text-gray-400",

  }), [isLight]);


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
    if (trend === null) return TC.textSecondary;
    return trend >= 0 ? TC.textGreen : TC.textRed;
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
          <div className={`text-xs opacity-80 ${TC.textSecondary}`}>
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
            className={`${TC.bgCard} rounded-xl p-4 transition-all duration-300 hover:scale-105 group cursor-pointer fade-in`}
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
            
            <p className={`text-lg font-bold mb-1 transition-colors ${TC.textPrimary} ${TC.textValueHover}`}>
              {formatValue(card.value, card.format)}
            </p>
            
            <p className={`text-sm font-medium ${TC.textSecondary}`}>
              {card.title}
            </p>
            <p className={`text-xs mt-1 ${TC.textTertiary}`}>
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