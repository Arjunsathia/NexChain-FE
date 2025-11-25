import React, { useState, useEffect, useMemo } from 'react'
import { FaGraduationCap, FaBook, FaArrowRight, FaExternalLinkAlt, FaYoutube, FaUniversity, FaChartLine, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

function LearningHub() {
  const isLight = useThemeCheck();
  const navigate = useNavigate();
  
  // 💡 Theme Classes Helper (UPDATED bgFooterButton)
  const TC = useMemo(() => ({
    bgContainer: isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-xl",
    bgItem: isLight ? "bg-gray-100/50 border-gray-200 hover:bg-gray-100/80 hover:border-purple-600/30" : "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-purple-400/30",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-500",
    textAccent: isLight ? "text-purple-600" : "text-purple-400",
    textAccentHover: isLight ? "group-hover:text-purple-700" : "group-hover:text-purple-300",
    
    // START CHANGE: Enhance hover background and border using the purple accent
    bgFooterButton: isLight 
      ? "bg-gray-200 border-gray-300 hover:bg-purple-100/60 hover:border-purple-600" // Light: Subtle purple background with solid purple border
      : "bg-gray-700/50 border-gray-600 hover:bg-purple-900/40 hover:border-purple-400", // Dark: Darker purple background with solid purple border
    // END CHANGE
    
    borderFooter: isLight ? "border-gray-300" : "border-gray-700",
    // Icons
    iconLink: isLight ? "text-gray-400 group-hover:opacity-100 hover:text-purple-600" : "text-gray-500",
    iconRight: isLight ? "text-gray-500 group-hover:text-purple-600" : "text-gray-500 group-hover:text-purple-400",
    bgIcon: isLight ? "bg-red-100/50" : "bg-red-500/10", // Default icon background
  }), [isLight]);

  const learningItems = [
    { 
      title: "Blockchain Basics", 
      level: "Beginner",
      duration: "8 min",
      url: "https://youtu.be/yubzJw0uiE4?si=tNRoOzjow3DSpSu_",
      icon: FaUniversity
    },
    { 
      title: "Buying First Crypto", 
      level: "Beginner",
      duration: "12 min",
      url: "https://youtu.be/LGHsNaIv5os?si=xqkz2g1tzBkchEF-",
      icon: FaChartLine
    },
    { 
      title: "Bitcoin vs Ethereum", 
      level: "Intermediate",
      duration: "15 min",
      url: "https://youtu.be/owFY_z5fF-Y?si=uuTICpciLc05XBkC",
      icon: FaUniversity
    },
    { 
      title: "Wallet Security", 
      level: "Intermediate",
      duration: "10 min",
      url: "https://youtu.be/kf28zqP_F2s?si=BlN0qHdHvc_YkkH-",
      icon: FaShieldAlt
    },
    { 
      title: "Market Volatility", 
      level: "Advanced",
      duration: "18 min",
      url: "https://youtu.be/3V-ymQ6-6gE?si=3V3V3V3V3V3V3V3V",
      icon: FaChartLine
    },
    { 
      title: "DeFi Explained", 
      level: "Advanced",
      duration: "20 min",
      url: "https://youtu.be/17QRFlml4pA?si=abc123",
      icon: FaUniversity
    },
    { 
      title: "NFT Fundamentals", 
      level: "Intermediate",
      duration: "14 min",
      url: "https://youtu.be/4dkl5O9LOKg?si=def456",
      icon: FaShieldAlt
    }
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner": return isLight ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400";
      case "Intermediate": return isLight ? "bg-yellow-100 text-yellow-700" : "bg-yellow-500/20 text-yellow-400";
      case "Advanced": return isLight ? "bg-red-100 text-red-700" : "bg-red-500/20 text-red-400";
      default: return isLight ? "bg-gray-100 text-gray-700" : "bg-gray-500/20 text-gray-400";
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
    <div className={`rounded-xl p-4 h-full flex flex-col fade-in border ${TC.bgContainer}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 fade-in">
        <div className="flex items-center gap-2">
          <div className={isLight ? "p-1.5 bg-purple-100 rounded-lg" : "p-1.5 bg-purple-400/10 rounded-lg"}>
            <FaGraduationCap className={isLight ? "text-purple-600 text-sm" : "text-purple-400 text-sm"} />
          </div>
          <h2 className="text-base font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Learning Hub
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto scrollbar-hide space-y-1.5">
          {learningItems.map((item, index) => {
            const Icon = item.icon || FaYoutube;
            return (
              <div 
                key={index} 
                className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 group cursor-pointer fade-in ${TC.bgItem}`}
                onClick={() => handleTopicClick(item)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={TC.bgIcon + " rounded-lg"}>
                    <Icon className={isLight ? "text-red-600 text-sm" : "text-red-400 text-sm"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className={`${TC.textPrimary} text-xs font-semibold ${TC.textAccentHover} transition-colors truncate`}>
                        {item.title}
                      </h3>
                      {/* External Link Icon */}
                      <FaExternalLinkAlt className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${TC.iconLink}`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getLevelColor(item.level)}`}>
                        {item.level}
                      </span>
                      <span className={`text-xs ${TC.textSecondary}`}>{item.duration}</span>
                    </div>
                  </div>
                </div>
                {/* Arrow Icon */}
                <FaArrowRight className={`text-xs group-hover:translate-x-0.5 transition-all duration-200 ${TC.iconRight}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-2 mt-2 border-t ${TC.borderFooter} fade-in`}>
        <span className={`text-xs ${TC.textSecondary}`}>{learningItems.length} videos</span>
        <button 
          onClick={handleExploreClick}
          // Added group class to allow children to use group-hover
          className={`group flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all duration-200 ${TC.textAccent} ${TC.bgFooterButton} ${TC.textAccentHover}`}
        >
          Explore
          {/* Added group-hover transition for the icon */}
          <FaArrowRight className={`text-xs group-hover:translate-x-0.5 transition-all duration-200`} />
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default LearningHub;