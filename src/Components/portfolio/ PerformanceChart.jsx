import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";

const generatePerformanceData = (currentValue) => {
  const data = [];
  const baseValue = currentValue * 0.8;
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const fluctuation = (Math.random() - 0.5) * 0.1;
    const value = baseValue * (1 + (i / 6) * 0.2 + fluctuation);
    
    data.push({
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      value: Math.round(value)
    });
  }
  
  return data;
};

const PerformanceChart = () => {
  const { balance } = useWalletContext();
  const { purchasedCoins } = usePurchasedCoins();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const currentPortfolioValue = purchasedCoins.reduce((total, coin) => {
    return total + (coin.coinPriceUSD * (coin.quantity || 1));
  }, 0);

  const totalValue = currentPortfolioValue + (balance || 0);
  const performanceData = generatePerformanceData(totalValue);

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
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">📈 Portfolio Performance</h2>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div 
            className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 sm:p-4 text-center fade-in hover:bg-gray-800/50 transition-all duration-300"
            style={{ animationDelay: "0.3s" }}
          >
            <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Current Value</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400">
              ₹{totalValue.toLocaleString('en-IN')}
            </p>
          </div>
          <div 
            className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 sm:p-4 text-center fade-in hover:bg-gray-800/50 transition-all duration-300"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Virtual Cash</p>
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-green-400">
              ₹{balance?.toLocaleString('en-IN') || '0'}
            </p>
          </div>
        </div>
        
        {/* Chart */}
        <div 
          className="fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Portfolio Value']}
                labelStyle={{ color: '#111827', fontWeight: '600' }}
                contentStyle={{ 
                  background: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#06B6D4', fontWeight: '600' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#06B6D4"
                strokeWidth={3}
                dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#0891B2', stroke: '#0E7490', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Indicator */}
        <div 
          className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400 fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Simulated performance data</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;