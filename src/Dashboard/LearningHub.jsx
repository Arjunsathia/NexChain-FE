import React from 'react'
import { FaGraduationCap, FaBook, FaArrowRight, FaExternalLinkAlt, FaYoutube } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function LearningHub({ limit = 3 }) {
  const navigate = useNavigate();
  
  const learningItems = [
    { 
      title: "What is Blockchain Technology?", 
      level: "Beginner",
      url: "https://youtu.be/yubzJw0uiE4?si=tNRoOzjow3DSpSu_"
    },
    { 
      title: "How to Buy Your First Cryptocurrency", 
      level: "Beginner",
      url: "https://youtu.be/LGHsNaIv5os?si=xqkz2g1tzBkchEF-"
    },
    { 
      title: "Understanding Bitcoin vs Ethereum", 
      level: "Intermediate",
      url: "https://youtu.be/owFY_z5fF-Y?si=uuTICpciLc05XBkC"
    },
    { 
      title: "Hot Wallets vs Cold Wallets Explained", 
      level: "Intermediate",
      url: "https://youtu.be/kf28zqP_F2s?si=BlN0qHdHvc_YkkH-"
    },
    { 
      title: "Managing Crypto Market Volatility", 
      level: "Advanced",
      url: "https://youtu.be/3V-ymQ6-6gE?si=3V3V3V3V3V3V3V3V"
    }
  ];

  const displayItems = learningItems.slice(0, limit);

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner": return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "Intermediate": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "Advanced": return "bg-red-500/20 text-red-400 border border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const handleExploreClick = () => {
    navigate("/learning");
  };

  const handleTopicClick = (topic) => {
    if (topic.url) {
      window.open(topic.url, '_blank', 'noopener,noreferrer');
    } else {
      navigate("/learning", { state: { selectedTopic: topic } });
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl p-5 h-full flex flex-col fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-400/10 rounded-lg">
            <FaGraduationCap className="text-purple-400 text-base" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Learning Hub
            </h2>
            <p className="text-xs text-gray-400">
              Educational resources
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FaBook className="text-xs" />
          Videos
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="space-y-3">
          {displayItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl border border-gray-600 hover:bg-gray-700/50 hover:border-purple-400/30 transition-all duration-200 group cursor-pointer fade-in"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              onClick={() => handleTopicClick(item)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <FaYoutube className="text-red-400 text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white text-sm font-semibold group-hover:text-purple-300 transition-colors truncate">
                      {item.title}
                    </h3>
                    <FaExternalLinkAlt className="text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(item.level)}`}>
                      {item.level}
                    </span>
                    <span className="text-gray-500 text-xs">YouTube</span>
                  </div>
                </div>
              </div>
              <FaArrowRight className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-200 text-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-700 fade-in" style={{ animationDelay: "0.6s" }}>
        <span className="text-sm text-gray-400">{displayItems.length} videos</span>
        <button 
          onClick={handleExploreClick}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-semibold py-2 px-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl border border-gray-600 hover:border-purple-400/30 transition-all duration-200"
        >
          Explore
          <FaArrowRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}

export default LearningHub;