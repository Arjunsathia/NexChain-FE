import React from "react";

function LearningHub() {
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
    <div className="p-4 lg:p-8 text-white fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in" style={{ animationDelay: "0.2s" }}>
          <h1 className="text-2xl lg:text-3xl font-bold text-cyan-400 mb-2">Learning Hub</h1>
          <p className="text-base text-gray-400">
            Beginner's guides to crypto terms and trading
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {topics.map((topic, idx) => (
            <div
              key={idx}
              className="
                bg-transparent border border-gray-700 rounded-xl p-5 lg:p-6 shadow-lg 
                transition-all duration-300 ease-in-out transform 
                hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl 
                hover:border-cyan-400/30 will-change-transform
                group cursor-pointer fade-in
              "
              style={{ animationDelay: `${0.3 + (idx * 0.1)}s` }}
            >
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                {topic.title}
              </h3>
              <p className="text-gray-400 text-sm lg:text-base mb-4 leading-relaxed">
                {topic.desc}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Beginner Level</span>
                <div className="text-cyan-400 text-lg font-bold transition-transform duration-300 group-hover:translate-x-1">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 lg:mt-12 text-center fade-in" style={{ animationDelay: "0.9s" }}>
          <div className="bg-transparent border border-gray-700 rounded-xl p-6 lg:p-8">
            <h3 className="text-xl font-bold text-cyan-400 mb-3">
              Start Your Crypto Journey
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
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