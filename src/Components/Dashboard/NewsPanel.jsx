import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useMemo } from "react";
import { FaNewspaper, FaExternalLinkAlt, FaClock } from "react-icons/fa";

const sampleNews = [
  {
    id: 1,
    title: "Bitcoin Wavers After Trump Says He's 'Not Planning' to Fire Fed Chair",
    image: "https://www.reuters.com/resizer/v2/36GOW2O6FFKOXDYJZZO2TNBBQQ.jpg?auth=f44d122577fc3b59d4a8b0f0210ca9a47838f1815552f8142cffd57295627e96&width=1200&quality=80",
    source: "Decrypt",
    time: "23 minutes ago",
    link: "#"
  },
  {
    id: 2,
    title: "Crypto Bills Squeak Through After Dramatic Standoff on House Floor",
    image: "https://img.etimg.com/thumb/msid-122527431,width-630,resizemode-4,imgsize-1185433/crypto-news-today-live-16-jul-2025.jpg",
    source: "Decrypt",
    time: "25 minutes ago",
    link: "#"
  },
  {
    id: 3,
    title: "Three US crypto bills clear procedural vote after initial failure",
    image: "https://www.livemint.com/lm-img/img/2025/07/14/600x338/stablecoin_1752227240523_1752227247414_1752509439267.jpeg",
    source: "Cointelegraph",
    time: "36 minutes ago",
    link: "#"
  },
  {
    id: 4,
    title: "Roger Ver sues Spain to block US extradition",
    image: "https://images.news18.com/ibnlive/uploads/2025/05/news18-1-10-2025-05-3033bed1f22a910042b74da348fcd302-16x9.png?impolicy=website&width=640&height=360",
    source: "The Block",
    time: "37 minutes ago",
    link: "#"
  },
];

export default function NewsPanel() {
  const isLight = useThemeCheck();

  const TC = useMemo(() => ({
    bgContainer: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100"
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl border border-gray-700/50",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textSource: isLight ? "text-cyan-600" : "text-cyan-400",
    
    // List item styles
    bgItem: isLight 
      ? "hover:bg-gray-50 border-b border-gray-100" 
      : "hover:bg-white/5 border-b border-gray-700/50",
    
    iconColor: isLight ? "text-cyan-600" : "text-cyan-400",
    bgIcon: isLight ? "bg-cyan-100" : "bg-cyan-400/10",
  }), [isLight]);

  return (
    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 fade-in ${TC.bgContainer}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${TC.bgIcon}`}>
            <FaNewspaper className={TC.iconColor} />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Market News
          </h2>
        </div>
        <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border ${isLight ? "border-gray-300 hover:bg-gray-100" : "border-gray-600 hover:bg-gray-700"} ${TC.textSecondary}`}>
           View All
        </button>
      </div>

      {/* List Layout */}
      <div className="flex flex-col gap-2">
        {sampleNews.map((news, index) => (
          <div
            key={news.id}
            className={`
              group flex items-start gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer
              ${isLight ? "hover:shadow-sm" : ""}
              ${index !== sampleNews.length - 1 ? TC.bgItem : "hover:bg-gray-50 dark:hover:bg-white/5"}
            `}
          >
            {/* Image Thumbnail */}
            <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-lg">
               <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
               />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
               <h3 className={`font-semibold text-sm mb-1 leading-snug line-clamp-2 ${TC.textPrimary} group-hover:text-cyan-500 transition-colors`}>
                  {news.title}
               </h3>
               
               <div className="flex items-center justify-between mt-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${TC.textSource}`}>
                     {news.source}
                  </span>
                  <div className={`flex items-center gap-1 text-[10px] ${TC.textSecondary}`}>
                     <FaClock className="text-[10px]" />
                     {news.time}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
