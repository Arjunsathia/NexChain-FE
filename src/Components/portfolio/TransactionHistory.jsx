import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useState, useMemo } from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaHistory, FaArrowUp, FaArrowDown, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const TransactionHistory = () => {
  const isLight = useThemeCheck();
  const { transactionHistory, loading } = usePurchasedCoins();
  const [filter, setFilter] = useState('all');

  const TC = useMemo(() => ({
    bgContainer: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card rounded-xl"
      : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 rounded-xl",

    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    bgIcon: isLight ? "p-1.5 bg-blue-50 text-blue-600 rounded-lg" : "p-1.5 bg-blue-500/10 text-blue-400 rounded-lg",
    iconColor: isLight ? "text-blue-600" : "text-blue-400",

    bgFilterContainer: isLight ? "bg-gray-100/80 border-gray-200" : "bg-gray-800/50 border-gray-700/50",
    textFilterDefault: isLight ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white",

    bgBuySummary: isLight ? "bg-emerald-50/50 border-emerald-100" : "bg-emerald-500/5 border-emerald-500/10",
    bgSellSummary: isLight ? "bg-rose-50/50 border-rose-100" : "bg-rose-500/5 border-rose-500/10",

    bgItem: isLight ? "bg-white hover:bg-blue-50/50" : "bg-transparent hover:bg-white/5",
    borderItem: isLight ? "border-gray-100" : "border-gray-700/50",

    bgBuyIcon: isLight ? "bg-emerald-100 text-emerald-600" : "bg-emerald-500/20 text-emerald-400",
    bgSellIcon: isLight ? "bg-rose-100 text-rose-600" : "bg-rose-500/20 text-rose-400",

    textQuantityBuy: isLight ? "text-emerald-600" : "text-emerald-400",
    textQuantitySell: isLight ? "text-rose-600" : "text-rose-400",

    bgPillBuy: isLight ? "bg-emerald-100/50 text-emerald-700" : "bg-emerald-400/10 text-emerald-400",
    bgPillSell: isLight ? "bg-rose-100/50 text-rose-700" : "bg-rose-400/10 text-rose-400",

    textPriceAccent: isLight ? "text-amber-600/70" : "text-amber-400/70",
    textDateAccent: isLight ? "text-blue-600/70" : "text-blue-400/70",

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
    <div className={`p-1 ${TC.bgContainer}`}>
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
    <div className={`rounded-xl p-4 sm:p-6 fade-in ${TC.bgContainer}`}>
      <div className="animate-pulse space-y-4">
        <Skeleton height={24} width={'33%'} baseColor={skeletonBase} highlightColor={skeletonHighlight} borderRadius={8} className="mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton height={64} baseColor={skeletonBase} highlightColor={skeletonHighlight} borderRadius={12} />
          <Skeleton height={64} baseColor={skeletonBase} highlightColor={skeletonHighlight} borderRadius={12} />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={56} baseColor={skeletonBase} highlightColor={skeletonHighlight} borderRadius={12} />
          ))}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ TC }) => {
  return (
    <div className={`rounded-xl p-4 sm:p-6 fade-in ${TC.bgContainer}`}>
      <div className={`flex flex-col items-center justify-center py-8 fade-in ${TC.textPrimary}`}>
        <div className="text-4xl mb-3">📝</div>
        <p className="text-center text-base">No transactions found</p>
        <p className={`text-sm mt-2 text-center ${TC.textSecondary}`}>Your trade history will appear here</p>
      </div>
    </div>
  );
};

const Header = ({ TC, transactionCount, filter, onFilterChange }) => {
  const getFilterClass = (filterType) => {
    if (filter === filterType) {
      if (filterType === 'all') return 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20';
      if (filterType === 'buy') return 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20';
      if (filterType === 'sell') return 'bg-rose-600 text-white shadow-lg shadow-rose-500/20';
    }
    return TC.textFilterDefault;
  };

  return (
    <div className="px-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 fade-in">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2 tracking-tight">
          <FaHistory className="text-blue-500" size={14} />
          History
        </h2>
        <span className={`text-[10px] ${TC.textSecondary} px-2 py-0.5 rounded-full border border-white/5 font-bold uppercase tracking-wider`}>
          {transactionCount}
        </span>
      </div>

      <div className="flex items-center gap-2 fade-in">
        <div className={`flex rounded-lg p-0.5 border shadow-sm ${TC.bgFilterContainer}`}>
          {['all', 'buy', 'sell'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => onFilterChange(filterType)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all duration-200 ${getFilterClass(filterType)}`}
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
    <div className="grid grid-cols-2 gap-2 px-2 mb-4 fade-in">
      <div className={`border rounded-xl p-2 md:p-3 transition-all duration-200 fade-in ${TC.bgBuySummary}`}>
        <div className="flex items-center justify-between mb-1">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60`}>Total Buys</p>
          <div className={`p-1 rounded-lg ${TC.bgBuyIcon}`}>
            <FaArrowUp size={8} className={TC.textQuantityBuy} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className={`font-bold text-base ${TC.textQuantityBuy}`}>{buyCount}</p>
          <p className={`text-[10px] font-bold ${TC.textSecondary}`}>
            ${totalBuyValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className={`border rounded-xl p-2 md:p-3 transition-all duration-200 fade-in ${TC.bgSellSummary}`}>
        <div className="flex items-center justify-between mb-1">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60`}>Total Sells</p>
          <div className={`p-1 rounded-lg ${TC.bgSellIcon}`}>
            <FaArrowDown size={8} className={TC.textQuantitySell} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className={`font-bold text-base ${TC.textQuantitySell}`}>{sellCount}</p>
          <p className={`text-[10px] font-bold ${TC.textSecondary}`}>
            ${totalSellValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
};

const TransactionList = ({ TC, transactions }) => (
  <div className="space-y-1.5 max-h-96 overflow-y-auto fade-in scrollbar-hide px-2 pb-2">
    {transactions.map((transaction, index) => (
      <TransactionItem key={transaction._id || `tx-${index}`} transaction={transaction} index={index} TC={TC} />
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
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 fade-in ${TC.bgItem} ${TC.borderItem}`}
      style={{ animationDelay: `${0.1 + index * 0.03}s` }}
    >
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isBuy ? TC.bgBuyIcon : TC.bgSellIcon}`}>
        {isBuy ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0 flex-1">
            <p className={`font-bold text-sm truncate ${TC.textPrimary}`}>
              {transaction.coinName || transaction.coin_name}
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold ${TC.textSecondary} opacity-60`}>
                {transaction.coinSymbol?.toUpperCase()}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${isBuy ? TC.bgPillBuy : TC.bgPillSell}`}>
                {isBuy ? 'Bought' : 'Sold'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className={`font-bold text-sm ${isBuy ? TC.textQuantityBuy : TC.textQuantitySell}`}>
              {isBuy ? '+' : '-'}{(transaction.quantity || 0).toFixed(4)}
            </p>
            <p className={`text-[10px] font-bold ${TC.textSecondary}`}>
              ${(transaction.totalValue || transaction.total_cost || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className={`flex items-center justify-between text-[10px] font-medium pt-1.5 border-t ${TC.borderItem}`}>
          <span className={`flex items-center gap-1 ${TC.textPriceAccent}`}>
            <FaMoneyBillWave size={10} />
            ${(transaction.price || transaction.coin_price_usd || 0).toLocaleString()}
          </span>
          <span className={`flex items-center gap-1 ${TC.textDateAccent}`}>
            <FaExchangeAlt size={10} />
            {formatDateTime(transaction.transactionDate || transaction.purchase_date)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
