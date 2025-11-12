import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaChartPie, FaWallet, FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useLivePortfolio } from '@/hooks/useLivePortfolio';
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";

const COLORS = ["#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const PortfolioDistribution = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { balance } = useWalletContext();
  const { groupedHoldings, portfolioSummary, loading } = useLivePortfolio();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const distributionData = useMemo(() => {
    if (!groupedHoldings || groupedHoldings.length === 0) {
      return balance > 0 ? [{
        name: "CASH", value: balance, fullName: "Virtual Cash", color: "#10B981", type: 'cash'
      }] : [];
    }

    const coinData = groupedHoldings.map((coin, index) => {
      const remainingInvestment = coin.remainingInvestment || 0;
      const currentValue = coin.totalCurrentValue || 0;
      const profitLoss = currentValue - remainingInvestment;
      const profitLossPercentage = remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

      return {
        name: coin.coinSymbol?.toUpperCase() || 'Unknown',
        fullName: coin.coinName || 'Unknown Coin',
        value: currentValue,
        quantity: coin.totalQuantity,
        color: COLORS[index % COLORS.length],
        type: 'crypto',
        profitLoss,
        profitLossPercentage,
        currentPrice: coin.currentPrice,
      };
    }).filter(coin => coin.value > 0);

    if (balance > 0) {
      coinData.unshift({
        name: "CASH", value: balance, fullName: "Virtual Cash", color: "#10B981", type: 'cash'
      });
    }

    return coinData;
  }, [groupedHoldings, balance]);

  const totalPortfolioValue = useMemo(() => {
    const holdingsValue = groupedHoldings.reduce((total, coin) => total + (coin.totalCurrentValue || 0), 0);
    return holdingsValue + (balance || 0);
  }, [groupedHoldings, balance]);

  const totalProfitLoss = portfolioSummary?.totalProfitLoss || 0;

  if (loading) return <LoadingState />;

  return (
    <div className="p-4">
      <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl fade-in ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        <Header />
        
        {totalProfitLoss !== 0 && (
          <ProfitLossSummary 
            totalProfitLoss={totalProfitLoss}
            totalProfitLossPercentage={portfolioSummary?.totalProfitLossPercentage || 0}
          />
        )}
        
        <Chart distributionData={distributionData} totalPortfolioValue={totalPortfolioValue} />
        
        <PortfolioSummary 
          totalRemainingInvestment={portfolioSummary?.remainingInvestment || 0}
          balance={balance}
          totalProfitLoss={totalProfitLoss}
          totalPortfolioValue={totalPortfolioValue}
          groupedHoldings={groupedHoldings}
        />
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="p-4">
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 fade-in">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-700 rounded-lg w-1/3"></div>
        <div className="h-48 bg-gray-700 rounded-lg"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-700 rounded-lg"></div>
          <div className="h-12 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

const Header = () => (
  <div className="flex items-center justify-between mb-4 fade-in">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-cyan-400/10 rounded-lg">
        <FaChartPie className="text-cyan-400 text-xl" />
      </div>
      <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Portfolio Distribution
      </h2>
    </div>
  </div>
);

const ProfitLossSummary = ({ totalProfitLoss, totalProfitLossPercentage }) => (
  <div className={`mb-4 p-3 rounded-lg border fade-in ${
    totalProfitLoss >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
  }`} style={{ animationDelay: "0.1s" }}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${totalProfitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {totalProfitLoss >= 0 ? <FaArrowUp className="text-green-400" /> : <FaArrowDown className="text-red-400" />}
        </div>
        <div>
          <p className="text-sm text-gray-300 mb-1">Total Profit/Loss</p>
          <p className={`text-xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
        </p>
      </div>
    </div>
  </div>
);

const Chart = ({ distributionData, totalPortfolioValue }) => (
  <div className="w-full h-48 mb-4 fade-in" style={{ animationDelay: "0.15s" }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={distributionData}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={2}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {distributionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="#1F2937" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip totalValue={totalPortfolioValue} />} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const PortfolioSummary = ({ totalRemainingInvestment, balance, totalProfitLoss, totalPortfolioValue, groupedHoldings }) => (
  <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 fade-in" style={{ animationDelay: "0.2s" }}>
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-gray-400">
        <FaCoins className="text-cyan-400" />
        <span>Investment:</span>
      </div>
      <span className="text-cyan-400 font-bold">
        ${totalRemainingInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
    
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-gray-400">
        <FaWallet className="text-green-400" />
        <span>Cash Balance:</span>
      </div>
      <span className="text-green-400 font-bold">
        ${(balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>

    {totalProfitLoss !== 0 && (
      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-700/50">
        <div className="flex items-center gap-2 text-gray-400">
          <div className={`w-3 h-3 rounded-full ${totalProfitLoss >= 0 ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>Net P&L:</span>
        </div>
        <span className={`font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    )}

    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-700/50">
      <div className="flex items-center gap-2 text-gray-300 font-semibold">
        <FaChartPie className="text-white" />
        <span>Total Portfolio:</span>
      </div>
      <span className="text-white font-bold">
        ${totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>

    {groupedHoldings.length > 0 && (
      <div className="flex items-center justify-between text-sm text-gray-400 pt-2">
        <span>Holdings:</span>
        <span>{groupedHoldings.length} coin{groupedHoldings.length !== 1 ? 's' : ''}</span>
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, totalValue }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / totalValue) * 100).toFixed(1);
    
    return (
      <div className="bg-gray-800 border border-gray-700/50 rounded-lg p-3 shadow-lg fade-in">
        <p className="font-semibold text-white text-base mb-2">{data.fullName || data.name}</p>
        <p className="text-cyan-400 font-bold text-lg">
          ${data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-gray-300 text-sm">{percentage}% of portfolio</p>
      </div>
    );
  }
  return null;
};

export default PortfolioDistribution;