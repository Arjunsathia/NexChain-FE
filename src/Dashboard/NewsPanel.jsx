import React from 'react'
import { FaNewspaper, FaArrowRight } from "react-icons/fa";

function NewsPanel() {
  const newsItems = [
    {
      title: "Bitcoin ETF Approval Boosts Market Confidence",
      source: "Crypto Daily",
      time: "2 hours ago"
    },
    {
      title: "Ethereum Upgrade Significantly Reduces Gas Fees",
      source: "Blockchain News",
      time: "5 hours ago"
    },
    {
      title: "Major Exchange Announces Zero Trading Fees Campaign",
      source: "Finance Times",
      time: "1 day ago"
    }
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl p-5 fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-5 fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-400/10 rounded-lg">
            <FaNewspaper className="text-purple-400 text-base" />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Crypto News
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
          Live
        </div>
      </div>
      
      <ul className="space-y-4">
        {newsItems.map((news, index) => (
          <li 
            key={index} 
            className="border-l-4 border-purple-500 pl-4 py-3 bg-gray-700/30 rounded-r-xl hover:bg-gray-700/50 hover:border-cyan-500 transition-all duration-200 cursor-pointer group fade-in"
            style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
          >
            <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
              {news.title}
            </h3>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span className="text-cyan-400">{news.source}</span>
              <span>{news.time}</span>
            </div>
          </li>
        ))}
      </ul>
      
      <button className="w-full mt-5 text-cyan-400 hover:text-cyan-300 text-sm font-semibold py-3 bg-gray-700/30 border border-gray-600 hover:border-cyan-500 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group fade-in" style={{ animationDelay: "0.6s" }}>
        View All News
        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-200" />
      </button>
    </div>
  );
}

export default NewsPanel;