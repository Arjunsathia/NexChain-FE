import React from "react";

const sampleNews = [
  {
    id: 1,
    title: "Bitcoin Wavers After Trump Says He's 'Not Planning' to Fire Fed Chair",
    image: "https://www.reuters.com/resizer/v2/36GOW2O6FFKOXDYJZZO2TNBBQQ.jpg?auth=f44d122577fc3b59d4a8b0f0210ca9a47838f1815552f8142cffd57295627e96&width=1200&quality=80",
    source: "Decrypt",
    time: "23 minutes ago",
  },
  {
    id: 2,
    title: "Crypto Bills Squeak Through After Dramatic Standoff on House Floor",
    image: "https://img.etimg.com/thumb/msid-122527431,width-630,resizemode-4,imgsize-1185433/crypto-news-today-live-16-jul-2025.jpg",
    source: "Decrypt",
    time: "25 minutes ago",
  },
  {
    id: 3,
    title: "Three US crypto bills clear procedural vote after initial failure",
    image: "https://www.livemint.com/lm-img/img/2025/07/14/600x338/stablecoin_1752227240523_1752227247414_1752509439267.jpeg",
    source: "Cointelegraph",
    time: "36 minutes ago",
  },
  {
    id: 4,
    title: "Roger Ver sues Spain to block US extradition",
    image: "https://images.news18.com/ibnlive/uploads/2025/05/news18-1-10-2025-05-3033bed1f22a910042b74da348fcd302-16x9.png?impolicy=website&width=640&height=360",
    source: "The Block",
    time: "37 minutes ago",
  },
];

function NewsSection() {
  return (
    <div className="mt-10 fade-in" style={{ animationDelay: "0.1s" }}>
      <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 fade-in" style={{ animationDelay: "0.2s" }}>
        Latest Crypto News
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {sampleNews.map((news, index) => (
          <div
            key={news.id}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-2xl hover:border-cyan-400/30 transition-all duration-300 group cursor-pointer fade-in"
            style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
          >
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">{news.title}</h3>
              <div className="flex items-center justify-between text-xs">
                <p className="text-cyan-400">{news.source}</p>
                <p className="text-gray-500">{news.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6 fade-in" style={{ animationDelay: "0.7s" }}>
        <button className="bg-gray-700 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 hover:scale-105">
          See More News
        </button>
      </div>
    </div>
  );
}

export default NewsSection;