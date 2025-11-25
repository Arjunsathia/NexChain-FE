import React, { useState, useEffect, useMemo } from "react";

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
  
  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    
    // Topic Cards
    bgCard: isLight 
      ? "bg-white border-gray-300 shadow-lg hover:border-cyan-600/50" 
      : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl hover:border-cyan-400/30",
    
    // Info Box
    bgInfoBox: isLight 
      ? "bg-gray-100/70 border-gray-300 shadow-lg" 
      : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl",
  }), [isLight]);

  const topics = [
    {
      title: "What is Cryptocurrency?",
      desc: "Learn the basics of cryptocurrency, how it works, and why it's valuable",
    },
    {
      title: "How to Buy and Sell",
      desc: "A step-by-step process for buying and selling cryptocurrencies on exchanges",
    },
    {
      title: "Understanding Blockchain",
      desc: "An introduction to blockchain technology and its role in cryptocurrencies",
    },
    {
      title: "Crypto Wallets Explained",
      desc: "Discover the different types of crypto wallets and how to keep your coins safe",
    },
    {
      title: "Introduction to Trading",
      desc: "Get familiar with the fundamentals of crypto trading and essential strategies",
    },
    {
      title: "Risk Management",
      desc: "How to manage risk and protect your investments in the crypto market",
    },
  ];

  return (
    <div className={`min-h-screen p-4 lg:p-8 ${TC.textPrimary}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Learning Hub
          </h1>
          <p className={`text-base mt-2 ${TC.textSecondary}`}>
            Beginner's guides to crypto terms and trading
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {topics.map((topic, idx) => (
            <div
              key={idx}
              className={`
                rounded-xl p-5 lg:p-6 transition-all duration-300 ease-in-out transform 
                hover:scale-[1.02] hover:-translate-y-1 will-change-transform group cursor-pointer fade-in border
                ${TC.bgCard}
              `}
              style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}
            >
              <h3 className={`text-lg lg:text-xl font-semibold mb-3 transition-colors ${TC.textPrimary} group-hover:text-cyan-600`}>
                {topic.title}
              </h3>
              <p className={`text-sm lg:text-base mb-4 leading-relaxed ${TC.textSecondary}`}>
                {topic.desc}
              </p>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${TC.textTertiary}`}>Beginner Level</span>
                <div className={`text-lg font-bold transition-transform duration-300 group-hover:translate-x-1 ${isLight ? "text-cyan-600" : "text-cyan-400"}`}>
                  →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 lg:mt-12 text-center fade-in" style={{ animationDelay: "0.8s" }}>
          <div className={`rounded-xl p-6 lg:p-8 ${TC.bgInfoBox}`}>
            <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
              Start Your Crypto Journey
            </h3>
            <p className={`max-w-2xl mx-auto text-sm lg:text-base ${TC.textSecondary}`}>
              Explore our comprehensive learning resources designed to help you understand 
              cryptocurrency trading, blockchain technology, and investment strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningHub;