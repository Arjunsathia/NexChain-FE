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
    <div className="min-h-screen text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Learning Hub
          </h1>
          <p className="text-base text-gray-400 mt-2">
            Beginner's guides to crypto terms and trading
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {topics.map((topic, idx) => (
            <div
              key={idx}
              className="
                bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 lg:p-6 shadow-2xl 
                transition-all duration-300 ease-in-out transform 
                hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl 
                hover:border-cyan-400/30 will-change-transform
                group cursor-pointer fade-in
              "
              style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}
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
        <div className="mt-8 lg:mt-12 text-center fade-in" style={{ animationDelay: "0.8s" }}>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 lg:p-8 shadow-2xl">
            <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
              Start Your Crypto Journey
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm lg:text-base">
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