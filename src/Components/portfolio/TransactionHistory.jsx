import React, { useState, useEffect, useMemo } from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaHistory, FaArrowUp, FaArrowDown, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
  const [filter, setFilter] = useState('all');

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    // Card Background (aligned with other dashboard cards, no border)
    bgContainer: isLight
      ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    
    // Header/Icon Colors
    bgIcon: isLight ? "p-2 bg-cyan-100 rounded-lg" : "p-2 bg-cyan-400/10 rounded-lg",
    iconColor: isLight ? "text-cyan-600" : "text-cyan-400",
    
    // Filter Container
    bgFilterContainer: isLight ? "bg-gray-100 border-gray-300" : "bg-gray-800 border-gray-700",
    
    // Filter Button Defaults
    textFilterDefault: isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-gray-300",
    
    // Summary Cards
    bgBuySummary: isLight ? "bg-green-100/50 border-green-300" : "bg-green-500/10 border-green-500/30",
    bgSellSummary: isLight ? "bg-red-100/50 border-red-300" : "bg-red-500/10 border-red-500/30",
    
    // Transaction Item
    bgItem: isLight ? "bg-gray-50 border-gray-200 hover:bg-gray-100" : "bg-white/5 border-white/5 hover:bg-gray-800/40",
    borderItem: isLight ? "border-gray-200" : "border-gray-700",
    
    // Item Icon Circles
    bgBuyIcon: isLight ? "bg-green-100 text-green-600" : "bg-green-500/20 text-green-400",
    bgSellIcon: isLight ? "bg-red-100 text-red-600" : "bg-red-500/20 text-red-400",
    
    // Quantity Text
    textQuantityBuy: isLight ? "text-green-700" : "text-green-400",
    textQuantitySell: isLight ? "text-red-700" : "text-red-400",

    // Pill Text
    bgPillBuy: isLight ? "bg-green-100/50 text-green-600" : "bg-green-400/20 text-green-400",
    bgPillSell: isLight ? "bg-red-100/50 text-red-600" : "bg-red-400/20 text-red-400",
    
    // Price/Date Accents
    textPriceAccent: isLight ? "text-yellow-600/70" : "text-yellow-400/70",
    textDateAccent: isLight ? "text-cyan-600/70" : "text-cyan-400/70",
    
    // Skeleton Colors
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
  }), [isLight]);

  const filteredTransactions = useMemo(() => {
    if (!transactionHistory) return [];
    if (filter === 'all') return transactionHistory;
    return transactionHistory.filter(tx => tx.type === filter);
  }, [transactionHistory, filter]);

  const buyTransactions = useMemo(
    () => transactionHistory?.filter(tx => tx.type === 'buy') || [],
    [transactionHistory]
  );
  
  const sellTransactions = useMemo(
    () => transactionHistory?.filter(tx => tx.type === 'sell') || [],
    [transactionHistory]
  );

  const totalBuyValue = useMemo(
    () => buyTransactions.reduce((sum, tx) => sum + (tx.totalValue || 0), 0),
    [buyTransactions]
  );
  
  const totalSellValue = useMemo(
    () => sellTransactions.reduce((sum, tx) => sum + (tx.totalValue || 0), 0),
    [sellTransactions]
  );

  if (loading) return <LoadingState TC={TC} />;
  if (!transactionHistory || transactionHistory.length === 0) return <EmptyState TC={TC} />;

  return (
    <div
      className={`
        rounded-lg md:rounded-2xl p-3 md:p-6 fade-in
        ${TC.bgContainer}
      `}
    >
      <Header 
        TC={TC}
        transactionCount={filteredTransactions.length} 
        filter={filter}
        onFilterChange={setFilter}
      />
      
      <TransactionSummary 
        TC={TC}
        buyCount={buyTransactions.length}
        sellCount={sellTransactions.length}
        totalBuyValue={totalBuyValue}
        totalSellValue={totalSellValue}
      />

      <TransactionList TC={TC} transactions={filteredTransactions} />
    </div>
  );
};

const LoadingState = ({ TC }) => {
  const skeletonBase = TC.skeletonBase;
  const skeletonHighlight = TC.skeletonHighlight;

  return (
    <div
      className={`
        rounded-2xl p-4 sm:p-6 fade-in
        ${TC.bgContainer}
      `}
    >
      <div className="animate-pulse space-y-4">
        <Skeleton 
          height={24} 
          width={'33%'} 
          baseColor={skeletonBase} 
          highlightColor={skeletonHighlight} 
          borderRadius={8} 
          className="mb-4"
        />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton height={64} baseColor={skeletonBase} highlightColor={skeletonHighlight} borderRadius={12} />
          <Skeleton height={64} baseColor={skeletonBase} highlightColor={skeletonHighlight} borderRadius={12} />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              height={56}
              baseColor={skeletonBase}
              highlightColor={skeletonHighlight}
              borderRadius={12}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ TC }) => {
  return (
    <div
      className={`
        rounded-2xl p-4 sm:p-6 fade-in
        ${TC.bgContainer}
      `}
    >
      <div className={`flex flex-col items-center justify-center py-8 fade-in ${TC.textPrimary}`}>
        <div className="text-4xl mb-3">📝</div>
        <p className="text-center text-base">No transactions found</p>
        <p className={`text-sm mt-2 text-center ${TC.textSecondary}`}>
          Your trade history will appear here
        </p>
      </div>
    </div>
  );
};

const Header = ({ TC, transactionCount, filter, onFilterChange }) => {
  const getFilterClass = (filterType) => {
    if (filter === filterType) {
      if (filterType === 'all') return 'bg-cyan-600 text-white';
      if (filterType === 'buy') return 'bg-green-600 text-white';
      if (filterType === 'sell') return 'bg-red-600 text-white';
    }
    return TC.textFilterDefault; 
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 fade-in">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg shadow-md ${TC.bgIcon}`}>
          <FaHistory className={TC.iconColor + " text-xl sm:text-2xl"} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Transaction History
          </h2>
          <p className={`text-sm mt-1 ${TC.textSecondary}`}>
            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            {filter !== 'all' && ` (${filter})`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 fade-in" style={{ animationDelay: "0.1s" }}>
        <div className={`flex rounded-xl p-1 border shadow-sm ${TC.bgFilterContainer}`}>
          {['all', 'buy', 'sell'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => onFilterChange(filterType)}
              className={`
                px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg
                transition-all duration-200
                ${getFilterClass(filterType)}
              `}
            >
              {filterType === 'all' ? 'All' : filterType === 'buy' ? 'Buys' : 'Sells'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const TransactionSummary = ({ TC, buyCount, sellCount, totalBuyValue, totalSellValue }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6 fade-in" style={{ animationDelay: "0.15s" }}>
      <div
        className={`
          border rounded-lg md:rounded-xl p-2.5 md:p-4 transition-all duration-200 fade-in
          ${TC.bgBuySummary}
        `}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg shadow-sm ${TC.bgBuyIcon}`}>
            <FaArrowUp className={TC.textQuantityBuy} />
          </div>
          <p className={`text-sm ${TC.textSecondary}`}>Total Buys</p>
        </div>
        <p className={`font-bold text-xl mb-1 ${TC.textQuantityBuy}`}>
          {buyCount}
        </p>
        <p className={`text-sm ${TC.textSecondary}`}>
          ${totalBuyValue.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      
      <div
        className={`
          border rounded-lg md:rounded-xl p-2.5 md:p-4 transition-all duration-200 fade-in
          ${TC.bgSellSummary}
        `}
        style={{ animationDelay: "0.25s" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg shadow-sm ${TC.bgSellIcon}`}>
            <FaArrowDown className={TC.textQuantitySell} />
          </div>
          <p className={`text-sm ${TC.textSecondary}`}>Total Sells</p>
        </div>
        <p className={`font-bold text-xl mb-1 ${TC.textQuantitySell}`}>
          {sellCount}
        </p>
        <p className={`text-sm ${TC.textSecondary}`}>
          ${totalSellValue.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
};

const TransactionList = ({ TC, transactions }) => (
  <div
    className="space-y-3 max-h-96 overflow-y-auto fade-in scrollbar-hide"
    style={{ animationDelay: "0.3s" }}
  >
    {/* Scrollbar hide utility */}
    <style jsx>{`
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `}</style>

    {transactions.map((transaction, index) => (
      <TransactionItem 
        key={transaction._id || `tx-${index}`} 
        transaction={transaction}
        index={index}
        TC={TC}
      />
    ))}
  </div>
);

const TransactionItem = ({ transaction, index, TC }) => {
  const isBuy = transaction.type === 'buy';
  
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
      className={`
        flex items-center gap-2 sm:gap-3 p-2 md:p-4 rounded-lg md:rounded-xl border
        transition-all duration-200 hover:shadow-md fade-in
        ${TC.bgItem}
      `}
      style={{ animationDelay: `${0.35 + index * 0.03}s` }}
    >
      <div
        className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0
          ${isBuy ? TC.bgBuyIcon : TC.bgSellIcon}
        `}
      >
        {isBuy ? <FaArrowUp className="text-xs sm:text-lg" /> : <FaArrowDown className="text-xs sm:text-lg" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="min-w-0 flex-1">
            <p className={`font-semibold text-xs sm:text-base truncate ${TC.textPrimary}`}>
              {transaction.coinName || transaction.coin_name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <span className={`text-[10px] sm:text-xs ${TC.textSecondary}`}>
                {transaction.coinSymbol?.toUpperCase()}
              </span>
              <span
                className={`
                  text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium
                  ${isBuy ? TC.bgPillBuy : TC.bgPillSell}
                `}
              >
                {isBuy ? 'Bought' : 'Sold'}
              </span>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0 ml-2 sm:ml-3">
            <p
              className={`
                font-bold text-xs sm:text-base
                ${isBuy ? TC.textQuantityBuy : TC.textQuantitySell}
              `}
            >
              {isBuy ? '+' : '-'}
              {(transaction.quantity || 0).toFixed(6)}
            </p>
            <p className={`text-[10px] sm:text-sm ${TC.textSecondary}`}>
              ${(transaction.totalValue || transaction.total_cost || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
        
        <div
          className={`
            flex items-center justify-between text-[10px] sm:text-sm
            ${TC.textTertiary} pt-1 sm:pt-2 border-t ${TC.borderItem}
          `}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`flex items-center gap-1 ${TC.textPriceAccent}`}>
              <FaMoneyBillWave className="text-[10px] sm:text-xs" />
              ${(transaction.price || transaction.coin_price_usd || 0).toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: (transaction.price || transaction.coin_price_usd || 0) < 1 ? 6 : 2 
              })}
            </span>
          </div>
          <span className={`flex items-center gap-1 ${TC.textDateAccent}`}>
            <FaExchangeAlt className="text-[10px] sm:text-xs" />
            {formatDateTime(transaction.transactionDate || transaction.purchase_date)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
