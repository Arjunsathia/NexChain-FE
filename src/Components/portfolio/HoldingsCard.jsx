// HoldingsCard.jsx
import React, { useState, useEffect } from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaWallet, FaCoins, FaChartLine } from "react-icons/fa";
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";
import { useNavigate } from "react-router-dom";

const HoldingsCard = () => {
  const { balance } = useWalletContext();
  const { purchasedCoins, loading } = usePurchasedCoins();
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const holdingsMap = {};

  purchasedCoins.forEach((purchase) => {
    const symbol = purchase.coinSymbol?.toUpperCase();
    const name = purchase.coinName;
    const amount = purchase.quantity || 1;
    const price = purchase.coinPriceUSD;

    if (!symbol || !name || !price) return;

    if (!holdingsMap[symbol]) {
      holdingsMap[symbol] = {
        name,
        symbol,
        amount: 0,
        value: price,
        image: purchase.image
      };
    }

    holdingsMap[symbol].amount += amount;
    holdingsMap[symbol].value = price;
  });

  const holdings = Object.values(holdingsMap);
  console.log("holdings", holdings)
  const totalInvested = holdings.reduce((sum, h) => sum + (h.amount * h.value), 0);
  const totalPortfolioValue = totalInvested + balance;

  if (loading) {
    return (
      <div className="p-3 xs:p-4 sm:p-6 fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FaChartLine className="text-cyan-400 text-lg" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">Portfolio Overview</h2>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-700 rounded-lg mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-700 rounded-lg"></div>
              <div className="h-16 bg-gray-700 rounded-lg"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 xs:p-4 sm:p-6 fade-in" style={{ animationDelay: "0.1s" }}>
      <div 
        className={`
          bg-transparent border border-gray-700 shadow-lg rounded-xl p-4 sm:p-6
          transition-all duration-500 ease-out transform
          ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}
        style={{ animationDelay: "0.2s" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-cyan-400 text-lg" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">Portfolio Overview</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live
          </div>
        </div>
        
        {/* Total Portfolio Value */}
        <div 
          className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl border border-cyan-400/30 fade-in hover:scale-[1.02] transition-all duration-300"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-cyan-300 mb-1">Total Portfolio Value</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                ₹{totalPortfolioValue.toLocaleString('en-IN')}
              </p>
            </div>
            <FaWallet className="text-cyan-400 text-2xl" />
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div 
            className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 sm:p-4 text-center fade-in hover:bg-gray-800/50 transition-all duration-300 group"
            style={{ animationDelay: "0.4s" }}
          >
            <FaWallet className="text-green-400 text-lg mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs text-gray-400 mb-1">Cash Balance</p>
            <p className="text-base sm:text-lg font-semibold text-green-400">
              ₹{balance?.toLocaleString('en-IN')}
            </p>
          </div>
          <div 
            className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 sm:p-4 text-center fade-in hover:bg-gray-800/50 transition-all duration-300 group"
            style={{ animationDelay: "0.5s" }}
          >
            <FaCoins className="text-cyan-400 text-lg mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs text-gray-400 mb-1">Invested</p>
            <p className="text-base sm:text-lg font-semibold text-cyan-400">
              ₹{totalInvested.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Holdings List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <FaCoins className="text-yellow-400" />
              Your Holdings
            </h3>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              {holdings.length} coin{holdings.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {holdings.length === 0 ? (
            <div 
              className="text-center py-6 border border-gray-700 rounded-xl bg-gray-800/30 fade-in hover:border-cyan-400/30 transition-all duration-300"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="text-4xl mb-3">🪙</div>
              <p className="text-gray-400 text-sm">No holdings yet</p>
              <p className="text-gray-500 text-xs mt-1">Start buying coins to build your portfolio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {holdings.map((coin, index) => (
                <div 
                  key={coin.symbol}
                  className={`
                    flex items-center justify-between p-3 sm:p-4 bg-gray-800/30 rounded-xl border border-gray-700
                    transition-all duration-300 ease-out transform hover:scale-[1.02] hover:border-cyan-400/30 hover:bg-gray-800/50
                    fade-in cursor-pointer group
                  `}
                  style={{ animationDelay: `${0.6 + (index * 0.1)}s` }}
                  onClick={()=> navigate(`/coin/coin-details/${coin?.name}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {coin.image && (
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full group-hover:scale-110 transition-transform duration-300" 
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm sm:text-base truncate group-hover:text-cyan-300 transition-colors">
                        {coin.name}
                      </p>
                      <p className="text-xs text-gray-400">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-semibold text-white">
                      {coin.amount.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ₹{(coin.amount * coin.value).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
          <span>Total value includes cash balance</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            Portfolio
          </span>
        </div>
      </div>
    </div>
  );
};

export default HoldingsCard;