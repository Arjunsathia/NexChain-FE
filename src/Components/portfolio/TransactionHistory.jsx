import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaHistory, FaArrowUp, FaArrowDown, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";

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

const TransactionHistory = () => {
  const isLight = useThemeCheck();
  const { transactionHistory, loading } = usePurchasedCoins();
  const [isMounted, setIsMounted] = useState(false);
  const [filter, setFilter] = useState('all');

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    bgContainer: isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    bgIcon: isLight ? "p-2 bg-cyan-100 rounded-lg" : "p-2 bg-cyan-400/10 rounded-lg",
    iconColor: isLight ? "text-cyan-600" : "text-cyan-400",
    bgFilterContainer: isLight ? "bg-gray-100 border-gray-300" : "bg-gray-800 border-gray-700",
    
    // Summary Cards
    bgBuySummary: isLight ? "bg-green-100/50 border-green-300" : "bg-green-500/10 border-green-500/30",
    bgSellSummary: isLight ? "bg-red-100/50 border-red-300" : "bg-red-500/10 border-red-500/30",
    
    // Transaction Item
    bgItem: isLight ? "bg-gray-100/50 border-gray-300 hover:bg-gray-100" : "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50",
    borderItem: isLight ? "border-gray-300" : "border-gray-700/50",
    
    // Item Icon Circles
    bgBuyIcon: isLight ? "bg-green-100 text-green-600" : "bg-green-500/20 text-green-400",
    bgSellIcon: isLight ? "bg-red-100 text-red-600" : "bg-red-500/20 text-red-400",
    
    // Price/Date Accents
    textPriceAccent: isLight ? "text-yellow-600/70" : "text-yellow-400/70",
    textDateAccent: isLight ? "text-cyan-600/70" : "text-cyan-400/70",

  }), [isLight]);


  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!transactionHistory) return [];
    if (filter === 'all') return transactionHistory;
    return transactionHistory.filter(tx => tx.type === filter);
  }, [transactionHistory, filter]);

  const buyTransactions = useMemo(() => 
    transactionHistory?.filter(tx => tx.type === 'buy') || [], 
    [transactionHistory]
  );
  
  const sellTransactions = useMemo(() => 
    transactionHistory?.filter(tx => tx.type === 'sell') || [], 
    [transactionHistory]
  );

  const totalBuyValue = useMemo(() => 
    buyTransactions.reduce((sum, tx) => sum + (tx.totalValue || 0), 0), 
    [buyTransactions]
  );
  
  const totalSellValue = useMemo(() => 
    sellTransactions.reduce((sum, tx) => sum + (tx.totalValue || 0), 0), 
    [sellTransactions]
  );

  if (loading) return <LoadingState isLight={isLight} />;
  if (!transactionHistory || transactionHistory.length === 0) return <EmptyState isMounted={isMounted} isLight={isLight} />;

  return (
    <div className={`rounded-2xl p-6 shadow-sm fade-in ${TC.bgContainer} ${
      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <Header 
        isLight={isLight}
        transactionCount={filteredTransactions.length} 
        filter={filter}
        onFilterChange={setFilter}
      />
      
      <TransactionSummary 
        isLight={isLight}
        buyCount={buyTransactions.length}
        sellCount={sellTransactions.length}
        totalBuyValue={totalBuyValue}
        totalSellValue={totalSellValue}
      />

      <TransactionList isLight={isLight} transactions={filteredTransactions} />
    </div>
  );
};

const LoadingState = ({ isLight }) => {
  const bgClasses = isLight ? "bg-white border-gray-300" : "bg-gray-800/50 backdrop-blur-sm border-gray-700";
  const skeletonFg = isLight ? "bg-gray-200" : "bg-gray-700";

  return (
    <div className={`rounded-xl p-4 fade-in ${bgClasses}`}>
      <div className="animate-pulse space-y-4">
        <div className={`h-6 ${skeletonFg} rounded-lg w-1/3`}></div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`h-16 ${skeletonFg} rounded-lg`}></div>
          <div className={`h-16 ${skeletonFg} rounded-lg`}></div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-14 ${skeletonFg} rounded-lg`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ isMounted, isLight }) => {
  const bgClasses = isLight ? "bg-white border-gray-300" : "bg-gray-800/50 backdrop-blur-sm border-gray-700";
  const textPrimary = isLight ? "text-gray-700" : "text-gray-400";
  const textSecondary = isLight ? "text-gray-500" : "text-gray-500";

  return (
    <div className={`rounded-xl p-4 shadow-2xl fade-in ${bgClasses} ${
      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={`flex flex-col items-center justify-center py-8 fade-in ${textPrimary}`}>
        <div className="text-4xl mb-3">📝</div>
        <p className="text-center text-base">No transactions found</p>
        <p className={`text-sm mt-2 text-center ${textSecondary}`}>Your trade history will appear here</p>
      </div>
    </div>
  );
};

const Header = ({ isLight, transactionCount, filter, onFilterChange }) => {
  const TC = {
    iconColor: isLight ? "text-cyan-600" : "text-cyan-400",
    bgIcon: isLight ? "p-2 bg-cyan-100 rounded-lg" : "p-2 bg-cyan-400/10 rounded-lg",
    textCount: isLight ? "text-gray-600" : "text-gray-400",
    bgFilterContainer: isLight ? "bg-gray-100 border-gray-300" : "bg-gray-800 border-gray-700",
    textFilterDefault: isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-gray-300",
  };
  
  const getFilterClass = (filterType) => {
    if (filter === filterType) {
      if (filterType === 'all') return isLight ? 'bg-cyan-600 text-white' : 'bg-cyan-600 text-white';
      if (filterType === 'buy') return isLight ? 'bg-green-600 text-white' : 'bg-green-500 text-white';
      if (filterType === 'sell') return isLight ? 'bg-red-600 text-white' : 'bg-red-500 text-white';
    }
    return TC.textFilterDefault;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 fade-in">
      <div className="flex items-center gap-3">
        <div className={TC.bgIcon}>
          <FaHistory className={TC.iconColor + " text-xl"} />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Transaction History
          </h2>
          <p className={`text-sm mt-1 ${TC.textCount}`}>
            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            {filter !== 'all' && ` (${filter})`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 fade-in" style={{ animationDelay: "0.1s" }}>
        <div className={`flex rounded-lg p-1 border ${TC.bgFilterContainer}`}>
          {['all', 'buy', 'sell'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => onFilterChange(filterType)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${getFilterClass(filterType)}`}
            >
              {filterType === 'all' ? 'All' : filterType === 'buy' ? 'Buys' : 'Sells'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const TransactionSummary = ({ isLight, buyCount, sellCount, totalBuyValue, totalSellValue }) => {
  const TC = {
    bgBuy: isLight ? "bg-green-100/50 border-green-300" : "bg-green-500/10 border-green-500/30",
    bgSell: isLight ? "bg-red-100/50 border-red-300" : "bg-red-500/10 border-red-500/30",
    textCountBuy: isLight ? "text-green-700" : "text-green-400",
    textCountSell: isLight ? "text-red-700" : "text-red-400",
    textValue: isLight ? "text-gray-600" : "text-gray-400",
    bgIconBuy: isLight ? "bg-green-100" : "bg-green-500/20",
    bgIconSell: isLight ? "bg-red-100" : "bg-red-500/20",
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-4 fade-in" style={{ animationDelay: "0.15s" }}>
      <div className={`border rounded-lg p-3 fade-in ${TC.bgBuy}`} style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg ${TC.bgIconBuy}`}>
            <FaArrowUp className={TC.textCountBuy} />
          </div>
          <p className={`text-sm ${TC.textValue}`}>Total Buys</p>
        </div>
        <p className={`font-bold text-lg mb-1 ${TC.textCountBuy}`}>
          {buyCount}
        </p>
        <p className={`text-sm ${TC.textValue}`}>
          ${totalBuyValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      
      <div className={`border rounded-lg p-3 fade-in ${TC.bgSell}`} style={{ animationDelay: "0.25s" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg ${TC.bgIconSell}`}>
            <FaArrowDown className={TC.textCountSell} />
          </div>
          <p className={`text-sm ${TC.textValue}`}>Total Sells</p>
        </div>
        <p className={`font-bold text-lg mb-1 ${TC.textCountSell}`}>
          {sellCount}
        </p>
        <p className={`text-sm ${TC.textValue}`}>
          ${totalSellValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

const TransactionList = ({ isLight, transactions }) => (
  <div className="space-y-3 max-h-96 overflow-y-auto fade-in" style={{ animationDelay: "0.3s" }}>
    {transactions.map((transaction, index) => (
      <TransactionItem 
        key={transaction._id || `tx-${index}`} 
        transaction={transaction}
        index={index}
        isLight={isLight}
      />
    ))}
  </div>
);

const TransactionItem = ({ transaction, index, isLight }) => {
  const isBuy = transaction.type === 'buy';
  const TC = {
    bgItem: isLight ? "bg-gray-100/50 border-gray-300 hover:bg-gray-100" : "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    borderItem: isLight ? "border-gray-300" : "border-gray-700/50",
    
    // Item Icon Circles
    bgBuyIcon: isLight ? "bg-green-100 text-green-600" : "bg-green-500/20 text-green-400",
    bgSellIcon: isLight ? "bg-red-100 text-red-600" : "bg-red-500/20 text-red-400",
    
    // Quantity Text
    textQuantityBuy: isLight ? "text-green-700" : "text-green-400",
    textQuantitySell: isLight ? "text-red-700" : "text-red-400",

    // Pill Text
    bgPillBuy: isLight ? "bg-green-100/50 text-green-600" : "bg-green-400/20 text-green-400",
    bgPillSell: isLight ? "bg-red-100/50 text-red-600" : "bg-red-400/20 text-red-400",
    
    // Accent Text
    textPriceAccent: isLight ? "text-yellow-600/70" : "text-yellow-400/70",
    textDateAccent: isLight ? "text-cyan-600/70" : "text-cyan-400/70",
  };
  
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date not available';
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 fade-in ${TC.bgItem}`}
      style={{ animationDelay: `${0.35 + index * 0.03}s` }}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isBuy ? TC.bgBuyIcon : TC.bgSellIcon
      }`}>
        {isBuy ? <FaArrowUp className="text-lg" /> : <FaArrowDown className="text-lg" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0 flex-1">
            <p className={`font-semibold text-base truncate ${TC.textPrimary}`}>
              {transaction.coinName || transaction.coin_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm ${TC.textSecondary}`}>{transaction.coinSymbol?.toUpperCase()}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                isBuy ? TC.bgPillBuy : TC.bgPillSell
              }`}>
                {isBuy ? 'Bought' : 'Sold'}
              </span>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0 ml-3">
            <p className={`font-bold text-base ${isBuy ? TC.textQuantityBuy : TC.textQuantitySell}`}>
              {isBuy ? '+' : '-'}{(transaction.quantity || 0).toFixed(6)}
            </p>
            <p className={`text-sm ${TC.textSecondary}`}>
              ${(transaction.totalValue || transaction.total_cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center justify-between text-sm ${TC.textTertiary} pt-2 border-t ${TC.borderItem}`}>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 ${TC.textPriceAccent}`}>
              <FaMoneyBillWave />
              ${(transaction.price || transaction.coin_price_usd || 0).toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: (transaction.price || transaction.coin_price_usd || 0) < 1 ? 6 : 2 
              })}
            </span>
          </div>
          <span className={`flex items-center gap-1 ${TC.textDateAccent}`}>
            <FaExchangeAlt />
            {formatDateTime(transaction.transactionDate || transaction.purchase_date)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;