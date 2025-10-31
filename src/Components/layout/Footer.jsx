import { useState } from "react";
import { FaGithub, FaTwitter, FaLinkedin, FaStar, FaBug, FaLightbulb, FaPaperPlane } from "react-icons/fa";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [isMounted, setIsMounted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useState(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setFeedback("");
      setFeedbackType("suggestion");
      setShowFeedback(false);
      setIsSubmitting(false);
      // Here you would typically send the feedback to your backend
      // console.log("Feedback submitted:", { type: feedbackType, message: feedback });
    }, 1000);
  };

  return (
    <>
      <footer 
        className={`
          bg-transparent border border-gray-700 shadow-lg rounded-xl px-6 py-8 my-4 mx-4
          transition-all duration-700 ease-out
          ${isMounted ? 'opacity-100 translate-y-0 glow-fade' : 'opacity-0 translate-y-4'}
        `}
        style={{ animationDelay: "0.1s" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Disclaimer Section */}
            <div className="lg:col-span-2">
              <div 
                className={`
                  transition-all duration-500 ease-out
                  ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                `}
                style={{ animationDelay: "0.2s" }}
              >
                <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  Important Disclaimer
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  <span className="font-semibold text-cyan-200">
                    Cryptocurrency investments involve significant risk
                  </span>{" "}
                  and may result in financial loss. Prices are highly volatile and unpredictable. 
                  Always conduct your own research and consult with a qualified financial advisor 
                  before making any investment decisions. NexChain provides market data and 
                  educational content but does not offer financial or investment advice.
                </p>
              </div>
            </div>

            {/* Quick Actions & Social */}
            <div className="space-y-6">
              {/* Feedback Trigger */}
              <div 
                className={`
                  transition-all duration-500 ease-out
                  ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                `}
                style={{ animationDelay: "0.3s" }}
              >
                <button
                  onClick={() => setShowFeedback(true)}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaPaperPlane className="text-sm" />
                  Feedback
                </button>
              </div>

              {/* Social Links */}
              <div 
                className={`
                  transition-all duration-500 ease-out
                  ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                `}
                style={{ animationDelay: "0.4s" }}
              >
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  Connect With Us
                </h4>
                <div className="flex gap-4 justify-center lg:justify-start">
                  {[
                    { icon: FaGithub, label: "GitHub", color: "hover:text-cyan-400" },
                    { icon: FaTwitter, label: "Twitter", color: "hover:text-blue-400" },
                    { icon: FaLinkedin, label: "LinkedIn", color: "hover:text-blue-500" }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className={`
                        p-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-400 transition-all duration-300
                        ${social.color} hover:border-cyan-400/30 hover:bg-gray-700/50 hover:scale-110
                        ${isMounted ? 'opacity-100' : 'opacity-0'}
                      `}
                      aria-label={social.label}
                      style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
                    >
                      <social.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div 
            className={`
              pt-6 border-t border-gray-700 text-center transition-all duration-700 ease-out
              ${isMounted ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} NexChain. All rights reserved.
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Secure • Reliable • Real-time</span>
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowFeedback(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-transparent border border-gray-700 shadow-2xl rounded-2xl backdrop-blur-sm">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                        <FaPaperPlane className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-cyan-400">Quick Feedback</h3>
                        <p className="text-sm text-gray-400">Share your thoughts with us</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmitFeedback} className="p-6 space-y-5">
                  {/* Feedback Type */}
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Feedback Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: "suggestion", icon: FaLightbulb, label: "Suggestion", color: "text-yellow-400" },
                        { type: "bug", icon: FaBug, label: "Bug Report", color: "text-red-400" },
                        { type: "praise", icon: FaStar, label: "Praise", color: "text-cyan-400" }
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setFeedbackType(item.type)}
                          className={`
                            p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2
                            ${feedbackType === item.type
                              ? "bg-cyan-600/20 border-cyan-400/50 text-cyan-400"
                              : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white"
                            }
                          `}
                        >
                          <item.icon className={item.color} />
                          <span className="text-xs font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Your Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      rows="4"
                      className="w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
                      required
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFeedback(false)}
                      className="flex-1 px-4 py-3 bg-transparent text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-200 hover:bg-gray-700/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!feedback.trim() || isSubmitting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="text-sm" />
                          Send Feedback
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}