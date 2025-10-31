// TransactionHistory.jsx
import React, { useState, useEffect } from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaHistory, FaArrowUp } from "react-icons/fa";

const TransactionHistory = () => {
  const { purchasedCoins, loading } = usePurchasedCoins();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-3 xs:p-4 sm:p-6 fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FaHistory className="text-cyan-400 text-lg" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">Transaction History</h2>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700 animate-pulse fade-in"
                style={{ animationDelay: `${0.2 + (i * 0.1)}s` }}
              >
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!purchasedCoins || purchasedCoins.length === 0) {
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
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FaHistory className="text-cyan-400 text-lg" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">Transaction History</h2>
          </div>
          <div className="flex flex-col items-center justify-center text-gray-400 py-8 fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="text-4xl sm:text-5xl mb-3">📝</div>
            <p className="text-center text-sm sm:text-base">No transactions found</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">Your purchase history will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedTransactions = [...purchasedCoins].sort((a, b) => 
    new Date(b.purchaseDate) - new Date(a.purchaseDate)
  );

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
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <FaHistory className="text-cyan-400 text-lg" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">Transaction History</h2>
          </div>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {sortedTransactions.map((transaction, index) => (
            <div 
              key={transaction._id}
              className={`
                flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-800/30 rounded-xl border border-gray-700
                transition-all duration-300 ease-out transform hover:scale-[1.02] hover:border-cyan-400/30 hover:bg-gray-800/50
                fade-in cursor-pointer group
              `}
              style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
            >
              <div className="relative">
                <img 
                  src={transaction.image} 
                  alt={transaction.coinName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <FaArrowUp className="text-white text-xs" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm sm:text-base truncate group-hover:text-cyan-300 transition-colors">
                      {transaction.coinName}
                    </p>
                    <p className="text-xs text-gray-400">{transaction.coinSymbol?.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400 text-sm sm:text-base">
                      +{(transaction.quantity || 1).toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ₹{((transaction.quantity || 1) * transaction.coinPriceUSD).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span>🕒</span>
                  {new Date(transaction.purchaseDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
          <span>Showing {sortedTransactions.length} recent transactions</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            All purchases
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;