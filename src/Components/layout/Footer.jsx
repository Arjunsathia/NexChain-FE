import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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
import { X } from "lucide-react"; 
import axios from "axios";

import { motion, AnimatePresence } from "framer-motion";
import { postForm } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";

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
  const { user } = useUserContext();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 💡 Advanced Theme Classes Helper (Black Shadow Applied)
  const TC = useMemo(() => ({
    // Footer & Modal Base - Fluent Effect + Black Shadow
    bgFooter: isLight 
      ? "bg-white/60 backdrop-blur-xl shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    bgModal: isLight 
      ? "bg-white/90 backdrop-blur-xl shadow-2xl shadow-black/30 border-none" 
      : "bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-black/80 border-none",
    
    bgModalHeader: isLight 
      ? "bg-gray-100/90 border-none" 
      : "bg-gradient-to-r from-gray-800 to-gray-900 border-none",
    
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-700" : "text-gray-300",
    textTertiary: isLight ? "text-gray-500" : "text-gray-400",
    
    // Disclaimer Accent (Matching Navbar's active color)
    textDisclaimerAccent: isLight ? "text-blue-700" : "text-cyan-400",
    borderDisclaimer: isLight ? "border-gray-300/50" : "border-gray-700/50",
    
    // Social Buttons - Added Ring for interactive effect
    bgSocial: isLight 
      ? "bg-white/70 text-gray-500 hover:bg-blue-50/70 ring-2 ring-transparent hover:ring-blue-500/50 shadow-sm" 
      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 ring-2 ring-transparent hover:ring-cyan-400/50 shadow-sm",
    
    // Input/Textarea
    inputBg: isLight ? "bg-gray-100/70 text-gray-900 placeholder-gray-500 border-none shadow-inner" : "bg-gray-800/50 text-white placeholder-gray-500 border-none shadow-inner",
    
    // Feedback Buttons (Type) - Uses Ring for active state
    bgBtnFeedbackActive: isLight 
      ? "bg-blue-100/50 text-blue-700 shadow-md ring-2 ring-blue-500/50 border-none" 
      : "bg-cyan-600/20 text-cyan-400 shadow-lg ring-2 ring-cyan-400/50 border-none",
    bgBtnFeedbackDefault: isLight 
      ? "bg-gray-100/50 text-gray-500 hover:text-gray-700 border-none" 
      : "bg-gray-800/50 text-gray-400 hover:text-white border-none",
    
    // Cancel Button
    bgBtnCancel: isLight 
      ? "bg-gray-100/70 text-gray-700 hover:bg-gray-200/90 ring-2 ring-transparent hover:ring-gray-400/50 border-none" 
      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 ring-2 ring-transparent hover:ring-gray-400/50 border-none",

    // Primary Button (Cohesive Gradient)
    bgPrimaryBtn: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-cyan-500/25",

  }), [isLight]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare feedback data
      const feedbackData = {
        type: feedbackType,
        message: feedback.trim(),
        userEmail: user?.email || "anonymous@nexchain.com",
        userName: user?.name || "Anonymous User",
        userId: user?.id || null,
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
        status: "new",
        priority: "medium",
      };

      // Submit feedback to database using axios directly
      const response = await axios.post("http://localhost:5050/api/feedback", feedbackData);
      
      if (response.data && response.data.success) {
        setShowSuccess(true);
        
        setTimeout(() => {
          setFeedback("");
          setFeedbackType("suggestion");
          setShowFeedback(false);
          setShowSuccess(false);
        }, 2000);
      } else {
        throw new Error("Failed to submit feedback");
      }

    } catch (error) {
      console.error("Error submitting feedback:", error);
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
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
        className={`
          ${TC.bgFooter} rounded-xl px-3 py-4 my-2 mx-2 sm:px-6 sm:py-6 sm:my-4 sm:mx-4
          transition-all duration-700 ease-out
        `}
      >
        <div className="max-w-7xl mx-auto">
          {/* Main Content: Disclaimer & Links */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-y-6 gap-x-2 md:gap-8 mb-4 md:mb-8">
            
            {/* Column 1-3: Disclaimer Section */}
            <div className="col-span-3 md:col-span-3 lg:col-span-3">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <h3 className="text-sm sm:text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 sm:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  Important Disclaimer
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${TC.textSecondary}`}>
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
              </motion.div>
            </div>

            {/* Column 4: Quick Actions */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 space-y-4">
                <h4
                    className={`text-xs sm:text-sm font-semibold mb-2 uppercase tracking-wider ${TC.textTertiary}`}
                >
                    Quick Links
                </h4>
                <div className={`space-y-1 text-xs sm:text-sm ${TC.textSecondary}`}>
                    <a href="/faq" className="block hover:text-cyan-400 transition-colors">FAQ</a>
                    <a href="/terms" className="block hover:text-cyan-400 transition-colors">Terms of Service</a>
                    <a href="/privacy" className="block hover:text-cyan-400 transition-colors">Privacy Policy</a>
                    <a href="/careers" className="block hover:text-cyan-400 transition-colors">Careers</a>
                </div>
            </div>

            {/* Column 5: Feedback & Social */}
            <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-6">
              
              {/* Feedback Trigger */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <button
                  onClick={() => setShowFeedback(true)}
                  className={`w-full ${TC.bgPrimaryBtn} font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2 ring-2 ring-transparent hover:ring-cyan-400/50`}
                >
                  <FaPaperPlane className="text-sm" />
                  Share Feedback
                </button>
              </motion.div>

              {/* Social Links */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <h4
                  className={`text-xs sm:text-sm font-semibold mb-2 uppercase tracking-wider ${TC.textTertiary}`}
                >
                  Connect
                </h4>
                <div className="flex gap-4">
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
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        p-3 rounded-xl transition-all duration-300
                        ${TC.bgSocial} ${social.color} hover:scale-110
                      `}
                      aria-label={social.label}
                    >
                      <social.icon size={18} />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Section: Copyright & Status Indicators */}
          <div
            className={`pt-6 ${TC.borderDisclaimer} text-center`}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div
                className={`text-[10px] sm:text-sm ${TC.textTertiary}`}
              >
                © {new Date().getFullYear()} NexChain. All rights reserved.
              </div>
              <div
                className={`flex items-center gap-4 text-xs ${TC.textTertiary}`}
              >
                <span className="opacity-90">
                  Secure
                </span>
                <div
                  className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                ></div>
                <span className="opacity-90">
                  Reliable
                </span>
                <div
                  className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                ></div>
                <span className="opacity-90">
                  Real-time
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Feedback Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence> 
          {showFeedback && (
            <motion.div
              key="feedback-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            >
              <motion.div
                key="feedback-modal-content"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-[90vw] max-w-[320px] p-0 mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`rounded-xl shadow-2xl ${TC.bgModal} overflow-hidden`}>
                  
                  {/* Success State */}
                  {showSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="p-6 text-center"
                    >
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaCheckCircle className="text-2xl text-green-400" />
                      </div>
                      <h3 className={`text-lg font-bold mb-1 ${TC.textPrimary}`}>
                        Feedback Sent!
                      </h3>
                      <p className={`text-xs mb-4 ${TC.textSecondary}`}>
                        We appreciate your input.
                      </p>
                      <div className="w-10 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto"></div>
                    </motion.div>
                  ) : (
                    /* Normal Form State */
                    <motion.div key="form">
                      {/* Header */}
                      <div
                        className={`px-4 py-3 border-b ${isLight ? "border-gray-100" : "border-gray-800"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center shadow-md"
                            >
                              <FaPaperPlane className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Quick Feedback
                              </h3>
                              <p className={`text-[10px] sm:text-xs ${TC.textTertiary}`}>
                                Share your thoughts
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={closeModal}
                            disabled={isSubmitting}
                            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${TC.textTertiary}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmitFeedback} className="p-4 space-y-4">
                        {/* Feedback Type */}
                        <div>
                          <label className={`text-xs font-medium mb-2 block ${TC.textSecondary}`}>
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
                                label: "Bug",
                                color: isLight ? "text-red-600" : "text-red-400",
                              },
                              {
                                type: "praise",
                                icon: FaStar,
                                label: "Praise",
                                color: isLight ? "text-cyan-600" : "text-cyan-400",
                              },
                            ].map((item) => (
                              <motion.button
                                key={item.type}
                                type="button"
                                onClick={() => setFeedbackType(item.type)}
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                  py-2 px-1 rounded-lg transition-all duration-200 flex flex-col items-center gap-1.5
                                  ${
                                    feedbackType === item.type
                                      ? TC.bgBtnFeedbackActive
                                      : TC.bgBtnFeedbackDefault
                                  }
                                  ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                              >
                                <item.icon className={`text-sm ${item.color}`} />
                                <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center">
                                  {item.label}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Feedback Text */}
                        <div>
                          <label className={`text-xs font-medium mb-2 block ${TC.textSecondary}`}>
                            Your Feedback
                          </label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Tell us what's on your mind..."
                            rows="3"
                            className={`w-full rounded-xl px-3 py-2 text-xs sm:text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 resize-none disabled:opacity-50 ${TC.inputBg}`}
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div
                          className="flex gap-2 pt-1"
                        >
                          <motion.button
                            type="button"
                            onClick={closeModal}
                            disabled={isSubmitting}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${TC.bgBtnCancel}`}
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            type="submit"
                            disabled={!feedback.trim() || isSubmitting}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium ${TC.bgPrimaryBtn} shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50`}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <FaPaperPlane className="text-xs" />
                                Send
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}