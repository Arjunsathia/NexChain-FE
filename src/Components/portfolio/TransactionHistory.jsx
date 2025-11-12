import React, { useState, useEffect, useMemo } from "react";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { FaHistory, FaArrowUp, FaArrowDown, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";

const TransactionHistory = () => {
  const { transactionHistory, loading } = usePurchasedCoins();
  const [isMounted, setIsMounted] = useState(false);
  const [filter, setFilter] = useState('all');

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

  if (loading) return <LoadingState />;
  if (!transactionHistory || transactionHistory.length === 0) return <EmptyState isMounted={isMounted} />;

  return (
    <div className="p-4">
      <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl fade-in ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        <Header 
          transactionCount={filteredTransactions.length} 
          filter={filter}
          onFilterChange={setFilter}
        />
        
        <TransactionSummary 
          buyCount={buyTransactions.length}
          sellCount={sellTransactions.length}
          totalBuyValue={totalBuyValue}
          totalSellValue={totalSellValue}
        />

        <TransactionList transactions={filteredTransactions} />
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="p-4">
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 fade-in">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-700 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-gray-700 rounded-lg"></div>
          <div className="h-16 bg-gray-700 rounded-lg"></div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ isMounted }) => (
  <div className="p-4">
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl fade-in ${
      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className="flex flex-col items-center justify-center text-gray-400 py-8 fade-in">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-center text-base">No transactions found</p>
        <p className="text-sm text-gray-500 mt-2 text-center">Your trade history will appear here</p>
      </div>
    </div>
  </div>
);

const Header = ({ transactionCount, filter, onFilterChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 fade-in">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-cyan-400/10 rounded-lg">
        <FaHistory className="text-cyan-400 text-xl" />
      </div>
      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Transaction History
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
          {filter !== 'all' && ` (${filter})`}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-2 fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
        {['all', 'buy', 'sell'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => onFilterChange(filterType)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
              filter === filterType
                ? filterType === 'all' ? 'bg-cyan-600 text-white' 
                : filterType === 'buy' ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {filterType === 'all' ? 'All' : filterType === 'buy' ? 'Buys' : 'Sells'}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const TransactionSummary = ({ buyCount, sellCount, totalBuyValue, totalSellValue }) => (
  <div className="grid grid-cols-2 gap-3 mb-4 fade-in" style={{ animationDelay: "0.15s" }}>
    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-green-500/20 rounded-lg">
          <FaArrowUp className="text-green-400" />
        </div>
        <p className="text-sm text-gray-400">Total Buys</p>
      </div>
      <p className="text-green-400 font-bold text-lg mb-1">
        {buyCount}
      </p>
      <p className="text-gray-400 text-sm">
        ${totalBuyValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
    
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 fade-in" style={{ animationDelay: "0.25s" }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-red-500/20 rounded-lg">
          <FaArrowDown className="text-red-400" />
        </div>
        <p className="text-sm text-gray-400">Total Sells</p>
      </div>
      <p className="text-red-400 font-bold text-lg mb-1">
        {sellCount}
      </p>
      <p className="text-gray-400 text-sm">
        ${totalSellValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  </div>
);

const TransactionList = ({ transactions }) => (
  <div className="space-y-3 max-h-96 overflow-y-auto fade-in" style={{ animationDelay: "0.3s" }}>
    {transactions.map((transaction, index) => (
      <TransactionItem 
        key={transaction._id || `tx-${index}`} 
        transaction={transaction}
        index={index}
      />
    ))}
  </div>
);

const TransactionItem = ({ transaction, index }) => {
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
      className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 transition-all duration-200 hover:bg-gray-800/50 fade-in"
      style={{ animationDelay: `${0.35 + index * 0.03}s` }}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {isBuy ? <FaArrowUp className="text-lg" /> : <FaArrowDown className="text-lg" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-base truncate">
              {transaction.coinName || transaction.coin_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-400">{transaction.coinSymbol?.toUpperCase()}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                isBuy ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
              }`}>
                {isBuy ? 'Bought' : 'Sold'}
              </span>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0 ml-3">
            <p className={`font-bold text-base ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
              {isBuy ? '+' : '-'}{(transaction.quantity || 0).toFixed(6)}
            </p>
            <p className="text-sm text-gray-400">
              ${(transaction.totalValue || transaction.total_cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FaMoneyBillWave className="text-yellow-400/70" />
              ${(transaction.price || transaction.coin_price_usd || 0).toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: (transaction.price || transaction.coin_price_usd || 0) < 1 ? 6 : 2 
              })}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <FaExchangeAlt className="text-cyan-400/70" />
            {formatDateTime(transaction.transactionDate || transaction.purchase_date)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;