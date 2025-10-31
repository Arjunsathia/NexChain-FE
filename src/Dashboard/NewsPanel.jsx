// NewsPanel.jsx
import React from 'react'

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
    <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-4 lg:p-6 fade-in">
      <h2 className="text-lg lg:text-xl font-semibold mb-4 text-cyan-400">📰 Latest Crypto News</h2>
      <ul className="space-y-4">
        {newsItems.map((news, index) => (
          <li 
            key={index} 
            className="border-l-4 border-cyan-500 pl-4 py-1 hover:bg-gray-800/30 rounded-r-lg transition-all duration-200 fade-in"
            style={{ animationDelay: `${0.1 + (index * 0.1)}s` }}
          >
            <h3 className="text-white font-medium text-sm mb-1 hover:text-cyan-300 cursor-pointer transition-colors">
              {news.title}
            </h3>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{news.source}</span>
              <span>{news.time}</span>
            </div>
          </li>
        ))}
      </ul>
      <button className="w-full mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium py-2 border border-gray-700 hover:border-cyan-500 rounded-lg transition-all duration-200">
        View All News
      </button>
    </div>
  );
}

export default NewsPanel;