import { useState, useEffect } from "react";
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaStar,
  FaBug,
  FaLightbulb,
  FaPaperPlane,
} from "react-icons/fa";
import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:5050", // Your backend port
});

export default function Footer() {
  const [isMounted, setIsMounted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // Use the api instance instead of axios directly
      await api.post(
        "/api/feedback",
        {
          type: feedbackType,
          message: feedback,
          userEmail: "", // You can get this from user context if available
          pageUrl: window.location.href,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      alert("Thank you for your feedback!");

      setFeedback("");
      setFeedbackType("suggestion");
      setShowFeedback(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <footer
        className={`
          bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl px-6 py-8 my-4 mx-4
          transition-all duration-700 ease-out fade-in
          ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
        style={{ animationDelay: "0.1s" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Disclaimer Section */}
            <div className="lg:col-span-2">
              <div className="fade-in" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  Important Disclaimer
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  <span className="font-semibold text-cyan-200">
                    Cryptocurrency investments involve significant risk
                  </span>{" "}
                  and may result in financial loss. Prices are highly volatile
                  and unpredictable. Always conduct your own research and
                  consult with a qualified financial advisor before making any
                  investment decisions. NexChain provides market data and
                  educational content but does not offer financial or investment
                  advice.
                </p>
              </div>
            </div>

            {/* Quick Actions & Social */}
            <div className="space-y-6">
              {/* Feedback Trigger */}
              <div className="fade-in" style={{ animationDelay: "0.3s" }}>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 fade-in"
                  style={{ animationDelay: "0.35s" }}
                >
                  <FaPaperPlane className="text-sm" />
                  Share Feedback
                </button>
              </div>

              {/* Social Links */}
              <div className="fade-in" style={{ animationDelay: "0.4s" }}>
                <h4
                  className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide fade-in"
                  style={{ animationDelay: "0.45s" }}
                >
                  Connect With Us
                </h4>
                <div className="flex gap-4 justify-center lg:justify-start">
                  {[
                    {
                      icon: FaGithub,
                      label: "GitHub",
                      color: "hover:text-cyan-400",
                    },
                    {
                      icon: FaTwitter,
                      label: "Twitter",
                      color: "hover:text-blue-400",
                    },
                    {
                      icon: FaLinkedin,
                      label: "LinkedIn",
                      color: "hover:text-blue-500",
                    },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className={`
                        p-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-400 transition-all duration-300
                        ${social.color} hover:border-cyan-400/30 hover:bg-gray-700/50 hover:scale-110 fade-in
                      `}
                      aria-label={social.label}
                      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
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
            className="pt-6 border-t border-gray-700 text-center fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div
                className="text-sm text-gray-500 fade-in"
                style={{ animationDelay: "0.65s" }}
              >
                © {new Date().getFullYear()} NexChain. All rights reserved.
              </div>
              <div
                className="flex items-center gap-4 text-xs text-gray-600 fade-in"
                style={{ animationDelay: "0.7s" }}
              >
                <span className="fade-in" style={{ animationDelay: "0.75s" }}>
                  Secure
                </span>
                <div
                  className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse fade-in"
                  style={{ animationDelay: "0.8s" }}
                ></div>
                <span className="fade-in" style={{ animationDelay: "0.85s" }}>
                  Reliable
                </span>
                <div
                  className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse fade-in"
                  style={{ animationDelay: "0.9s" }}
                ></div>
                <span className="fade-in" style={{ animationDelay: "0.95s" }}>
                  Real-time
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      {showFeedback && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 fade-in"
            onClick={() => setShowFeedback(false)}
          />

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md fade-in">
            <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-2xl">
              {/* Header */}
              <div
                className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700 rounded-t-2xl fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg fade-in"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <FaPaperPlane className="h-5 w-5 text-white" />
                    </div>
                    <div className="fade-in" style={{ animationDelay: "0.3s" }}>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Quick Feedback
                      </h3>
                      <p className="text-sm text-gray-400">
                        Share your thoughts with us
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 fade-in"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitFeedback} className="p-6 space-y-5">
                {/* Feedback Type */}
                <div className="fade-in" style={{ animationDelay: "0.5s" }}>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Feedback Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        type: "suggestion",
                        icon: FaLightbulb,
                        label: "Suggestion",
                        color: "text-yellow-400",
                      },
                      {
                        type: "bug",
                        icon: FaBug,
                        label: "Bug Report",
                        color: "text-red-400",
                      },
                      {
                        type: "praise",
                        icon: FaStar,
                        label: "Praise",
                        color: "text-cyan-400",
                      },
                    ].map((item, index) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setFeedbackType(item.type)}
                        className={`
                          p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 fade-in
                          ${
                            feedbackType === item.type
                              ? "bg-cyan-600/20 border-cyan-400/50 text-cyan-400 shadow-lg"
                              : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-cyan-400/30 hover:text-white"
                          }
                        `}
                        style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                      >
                        <item.icon className={item.color} />
                        <span className="text-xs font-medium">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="fade-in" style={{ animationDelay: "0.8s" }}>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Your Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    rows="4"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 resize-none fade-in"
                    style={{ animationDelay: "0.85s" }}
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div
                  className="flex gap-3 pt-2 fade-in"
                  style={{ animationDelay: "0.9s" }}
                >
                  <button
                    type="button"
                    onClick={() => setShowFeedback(false)}
                    className="flex-1 px-4 py-3 bg-gray-800/50 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-200 hover:bg-gray-700/50 fade-in"
                    style={{ animationDelay: "0.95s" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!feedback.trim() || isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 fade-in"
                    style={{ animationDelay: "1s" }}
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
          </div>
        </>
      )}
    </>
  );
}
