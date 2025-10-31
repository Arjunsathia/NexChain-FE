// LearningHub.jsx (Compact with YouTube Links)
import React from 'react'
import { FaGraduationCap, FaBook, FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function LearningHub() {
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
      url: "https://youtu.be/LGHsNaIv5os?si=xqkz2g1tzBkchEF-" // Example URL
    },
    { 
      title: "Understanding Bitcoin vs Ethereum", 
      level: "Intermediate",
      url: "https://youtu.be/owFY_z5fF-Y?si=uuTICpciLc05XBkC" // Example URL
    },
    { 
      title: "Hot Wallets vs Cold Wallets Explained", 
      level: "Intermediate",
      url: "https://youtu.be/kf28zqP_F2s?si=BlN0qHdHvc_YkkH-" // Example URL
    },
    { 
      title: "Managing Crypto Market Volatility", 
      level: "Advanced",
      url: "https://youtu.be/3V-ymQ6-6gE?si=3V3V3V3V3V3V3V3V" // Example URL
    }
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner": return "bg-green-500/20 text-green-400";
      case "Intermediate": return "bg-yellow-500/20 text-yellow-400";
      case "Advanced": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleExploreClick = () => {
    navigate("/learning");
  };

  const handleTopicClick = (topic) => {
    if (topic.url) {
      // Open YouTube video in new tab
      window.open(topic.url, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to learning page
      navigate("/learning", { state: { selectedTopic: topic } });
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 shadow-lg rounded-xl p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaGraduationCap className="text-purple-400 text-sm" />
          <h2 className="text-base font-semibold text-cyan-400">Learning</h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <FaBook className="text-xs" />
          Resources
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="space-y-2">
          {learningItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 hover:border-purple-400/30 transition-all duration-200 group cursor-pointer"
              onClick={() => handleTopicClick(item)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="text-white text-xs font-medium group-hover:text-purple-300 transition-colors truncate">
                      {item.title}
                    </h3>
                    <FaExternalLinkAlt className="text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getLevelColor(item.level)}`}>
                      {item.level}
                    </span>
                    <span className="text-gray-500 text-xs">YouTube</span>
                  </div>
                </div>
              </div>
              <FaArrowRight className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-200 text-xs" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-700">
        <span className="text-xs text-gray-400">5 videos</span>
        <button 
          onClick={handleExploreClick}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-medium py-1.5 px-3 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 hover:border-cyan-500 transition-all duration-200"
        >
          Explore
          <FaArrowRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}

export default LearningHub;