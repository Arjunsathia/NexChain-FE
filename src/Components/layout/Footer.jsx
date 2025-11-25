import React, { useState, useEffect, useMemo } from "react";
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaStar,
  FaBug,
  FaLightbulb,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify"; // Added missing toast import

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

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:5050", // Your backend port
});

export default function Footer() {
  const isLight = useThemeCheck();
  const [isMounted, setIsMounted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 💡 Theme Classes Helper - Updated Shadow Effect
  const TC = useMemo(() => ({
    // Footer & Modal Base - 🚨 Shadow effect enhanced here 🚨
    bgFooter: isLight 
      ? "bg-white/70 border-gray-300 shadow-2xl" 
      : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl",
    bgModal: isLight 
      ? "bg-white/95 border-gray-300 shadow-2xl" 
      : "bg-gray-800/95 backdrop-blur-sm border-gray-700 shadow-2xl",
    
    bgModalHeader: isLight ? "bg-gray-100/90 border-gray-300" : "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700",
    
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-700" : "text-gray-300",
    textTertiary: isLight ? "text-gray-500" : "text-gray-400",
    
    // Disclaimer Accent
    textDisclaimerAccent: isLight ? "text-cyan-700" : "text-cyan-200",
    borderDisclaimer: isLight ? "border-gray-300" : "border-gray-700",
    
    // Social Buttons
    bgSocial: isLight ? "bg-gray-100/70 border-gray-300 text-gray-500 hover:bg-gray-200" : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700/50",
    
    // Input/Textarea
    inputBg: isLight ? "bg-gray-100/70 border-gray-300 text-gray-900 placeholder-gray-500" : "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500",
    
    // Feedback Buttons (Type)
    bgBtnFeedbackActive: isLight ? "bg-cyan-100/50 border-cyan-600/50 text-cyan-700 shadow-md" : "bg-cyan-600/20 border-cyan-400/50 text-cyan-400 shadow-lg",
    bgBtnFeedbackDefault: isLight ? "bg-gray-100/50 border-gray-300 text-gray-500 hover:border-cyan-600/30 hover:text-gray-700" : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-cyan-400/30 hover:text-white",
    
    // Cancel Button
    bgBtnCancel: isLight ? "bg-gray-100/70 text-gray-700 border-gray-300 hover:bg-gray-200" : "bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50",
  }), [isLight]);

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
      
      await api.post(
        "/api/feedback",
        {
          type: feedbackType,
          message: feedback,
          userEmail: "", 
          pageUrl: window.location.href,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setShowSuccess(true);
      
      setTimeout(() => {
        setFeedback("");
        setFeedbackType("suggestion");
        setShowFeedback(false);
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Error submitting feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setShowFeedback(false);
      setFeedback("");
      setFeedbackType("suggestion");
      setShowSuccess(false);
    }
  };

  return (
    <>
      <footer
        className={`
          ${TC.bgFooter} rounded-xl px-6 py-8 my-4 mx-4
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
                <p className={`text-sm leading-relaxed ${TC.textSecondary}`}>
                  <span className={`font-semibold ${TC.textDisclaimerAccent}`}>
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
                  className={`text-sm font-semibold mb-3 uppercase tracking-wide fade-in ${TC.textTertiary}`}
                  style={{ animationDelay: "0.45s" }}
                >
                  Connect With Us
                </h4>
                <div className="flex gap-4 justify-center lg:justify-start">
                  {[
                    {
                      icon: FaGithub,
                      label: "GitHub",
                      color: isLight ? "hover:text-gray-900" : "hover:text-cyan-400",
                    },
                    {
                      icon: FaTwitter,
                      label: "Twitter",
                      color: "hover:text-blue-500",
                    },
                    {
                      icon: FaLinkedin,
                      label: "LinkedIn",
                      color: "hover:text-blue-600",
                    },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className={`
                        p-3 rounded-xl border transition-all duration-300
                        ${TC.bgSocial} ${social.color} hover:border-cyan-600/50 hover:scale-110 fade-in
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
            className={`pt-6 border-t ${TC.borderDisclaimer} text-center fade-in`}
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div
                className={`text-sm fade-in ${TC.textTertiary}`}
                style={{ animationDelay: "0.65s" }}
              >
                © {new Date().getFullYear()} NexChain. All rights reserved.
              </div>
              <div
                className={`flex items-center gap-4 text-xs fade-in ${TC.textTertiary}`}
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
            onClick={closeModal}
          />

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md fade-in">
            <div className={`rounded-2xl ${TC.bgModal}`}>
              
              {/* Success State */}
              {showSuccess ? (
                <div className="p-8 text-center fade-in">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-3xl text-green-400" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${TC.textPrimary}`}>
                    Thank You!
                  </h3>
                  <p className={`mb-6 ${TC.textSecondary}`}>
                    Your feedback has been received. We appreciate your input!
                  </p>
                  <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-4"></div>
                </div>
              ) : (
                /* Normal Form State */
                <>
                  {/* Header */}
                  <div
                    className={`px-6 py-4 border-b rounded-t-2xl fade-in ${TC.bgModalHeader}`}
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
                          <p className={`text-sm ${TC.textTertiary}`}>
                            Share your thoughts with us
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className={`p-2 rounded-lg transition-all duration-200 fade-in disabled:opacity-50 disabled:cursor-not-allowed ${isLight ? "text-gray-500 hover:text-gray-900 hover:bg-gray-200" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
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
                      <label className={`text-sm mb-2 block ${TC.textSecondary}`}>
                        Feedback Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            type: "suggestion",
                            icon: FaLightbulb,
                            label: "Suggestion",
                            color: isLight ? "text-yellow-600" : "text-yellow-400",
                          },
                          {
                            type: "bug",
                            icon: FaBug,
                            label: "Bug Report",
                            color: isLight ? "text-red-600" : "text-red-400",
                          },
                          {
                            type: "praise",
                            icon: FaStar,
                            label: "Praise",
                            color: isLight ? "text-cyan-600" : "text-cyan-400",
                          },
                        ].map((item, index) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setFeedbackType(item.type)}
                            disabled={isSubmitting}
                            className={`
                              p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 fade-in
                              ${
                                feedbackType === item.type
                                  ? TC.bgBtnFeedbackActive
                                  : TC.bgBtnFeedbackDefault
                              }
                              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
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
                      <label className={`text-sm mb-2 block ${TC.textSecondary}`}>
                        Your Feedback
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us what's on your mind..."
                        rows="4"
                        className={`w-full rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 resize-none fade-in disabled:opacity-50 ${TC.inputBg}`}
                        style={{ animationDelay: "0.85s" }}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex gap-3 pt-2 fade-in"
                      style={{ animationDelay: "0.9s" }}
                    >
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className={`flex-1 px-4 py-3 rounded-xl transition-all duration-200 fade-in disabled:opacity-50 disabled:cursor-not-allowed ${TC.bgBtnCancel}`}
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
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}