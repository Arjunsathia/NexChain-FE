import React, { useMemo } from "react";
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { useWatchlist } from '@/hooks/useWatchlist';

function InfoCards() {
  const { balance } = useWalletContext();
  const { purchasedCoins } = usePurchasedCoins();
  const { watchlist } = useWatchlist();

  const { totalCoins, totalInvested } = useMemo(() => {
    const uniqueCoins = [...new Set(purchasedCoins.map(coin => coin.coin_id))].length;
    const invested = purchasedCoins.reduce((total, coin) => {
      return total + (coin.coinPriceUSD * (coin.quantity || 1));
    }, 0);
    
    return {
      totalCoins: uniqueCoins,
      totalInvested: invested
    };
  }, [purchasedCoins]);

  const profitLoss = totalInvested > 0 ? ((Math.random() - 0.5) * 10).toFixed(2) : "0.00";
  const profitLossColor = profitLoss >= 0 ? "text-green-400" : "text-red-400";
  const profitLossSign = profitLoss >= 0 ? "+" : "";

  const cards = [
    {
      title: "Total Balance",
      value: `₹${balance?.toLocaleString('en-IN')}`,
      icon: "💰",
      description: "Virtual Wallet",
      trend: "+5.2%"
    },
    {
      title: "Coins Owned",
      value: totalCoins.toString(),
      icon: "🪙",
      description: "Different cryptocurrencies",
      trend: `+${totalCoins}`
    },
    {
      title: "Profit / Loss",
      value: `${profitLossSign}${profitLoss}%`,
      color: profitLossColor,
      icon: "📈",
      description: "Overall performance",
      trend: `${profitLossSign}${profitLoss}%`
    },
    {
      title: "Watchlist",
      value: watchlist.length.toString(),
      icon: "⭐",
      description: "Tracked coins",
      trend: `+${watchlist.length}`
    },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="p-3 sm:p-4 rounded-xl shadow-lg border border-gray-700 
                     hover:shadow-xl hover:scale-105 
                     transition-all duration-300 ease-out cursor-pointer
                     relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="text-2xl sm:text-3xl transform group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <div className={`text-sm sm:text-lg font-semibold ${card.color || "text-white"}`}>
                {card.value}
              </div>
            </div>
            <h3 className="text-sm sm:text-lg font-semibold text-gray-200 mb-1 group-hover:text-white transition-colors">
              {card.title}
            </h3>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
              {card.description}
            </p>
            
            {card.trend && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-700/50">
                <span className="text-xs text-green-400 font-medium">
                  {card.trend}
                </span>
                <span className="text-xs text-gray-500 ml-1">this month</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

export default InfoCards;