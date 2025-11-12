import React from 'react'

function PriceCard({ coin, price, change }) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl p-5 text-center transition-all duration-300 hover:scale-105 hover:border-cyan-400/30 fade-in" style={{ animationDelay: "0.1s" }}>
      <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 fade-in" style={{ animationDelay: "0.2s" }}>
        {coin}
      </h2>
      <p className="text-2xl font-bold text-white mb-2 fade-in" style={{ animationDelay: "0.3s" }}>
        {price}
      </p>
      <p className={`text-sm font-semibold px-3 py-1 rounded-full inline-block ${
        isPositive 
          ? "bg-green-500/20 text-green-400 border border-green-500/30" 
          : "bg-red-500/20 text-red-400 border border-red-500/30"
      } fade-in`} style={{ animationDelay: "0.4s" }}>
        {isPositive ? '+' : ''}{change}%
      </p>
    </div>
  )
}

export default PriceCard