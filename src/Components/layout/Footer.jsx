import React, { useState, useMemo } from "react";
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
  FaRocket,
  FaHeart,
} from "react-icons/fa";
import SiteLogo from "../../assets/Img/logo.png";
import SiteLogoLight from "../../assets/Img/logo-2.png";
import { motion } from "framer-motion";
import useUserContext from "@/hooks/useUserContext";
import useThemeCheck from "@/hooks/useThemeCheck";
import FeedbackModal from "../Common/FeedbackModal";

export default function Footer() {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const [showFeedback, setShowFeedback] = useState(false);

  const TC = useMemo(
    () => ({
      bgFooter: isLight
        ? "bg-white/60 backdrop-blur-xl shadow-sm sm:shadow-md border-none"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border-t border-gray-800",

      textTertiary: isLight ? "text-gray-500" : "text-gray-300",
      textSecondary: isLight ? "text-gray-600" : "text-gray-200",


      bgSocial: isLight
        ? "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-cyan-400",

      bgPrimaryBtn:
        "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/20",
    }),
    [isLight],
  );

  const closeModal = () => setShowFeedback(false);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
        className={`
          relative
          ${TC.bgFooter} 
          rounded-t-[32px] sm:rounded-2xl 
          px-6 pt-6 pb-2 sm:px-6 sm:py-8 
          mx-0 mt-0 mb-0 sm:mx-4 sm:my-4
          pb-2
          transition-all duration-500 ease-out border-t border-white/5
          lg:border-none
        `}
      >
        {/* Decorative Top Glow for Mobile */}
        {!isLight && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent sm:hidden" />
        )}

        <div className="max-w-7xl mx-auto px-0 sm:px-0 sm:pt-0">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 mb-2 sm:mb-10">
            {/* Brand & Disclaimer Section */}
            <div className="flex-1 space-y-3 sm:space-y-5 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start">
                <img
                  src={isLight ? SiteLogoLight : SiteLogo}
                  alt="NexChain"
                  className="h-10 w-auto object-contain"
                />
              </div>

              <p
                className={`text-sm leading-relaxed max-w-sm sm:max-w-lg ${TC.textSecondary} mx-auto sm:mx-0`}
              >
                Empowering your financial future.
              </p>

              <div className="flex gap-3 pt-2">
                {[
                  { icon: FaGithub, href: "#", label: "GitHub" },
                  { icon: FaTwitter, href: "#", label: "Twitter" },
                  { icon: FaLinkedin, href: "#", label: "LinkedIn" },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${TC.bgSocial} hover:scale-110 shadow-sm border border-transparent hover:border-white/5`}
                    aria-label={social.label}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links & Actions Container */}
            <div className="flex flex-col sm:flex-row gap-8 lg:gap-16 w-full lg:w-auto">

              {/* Quick Links - STRICTLY HIDDEN on Mobile */}
              <div
                className="hidden lg:flex flex-col gap-y-3 min-w-[120px] text-left"
              >
                <div className="col-span-2 sm:col-span-1">
                  <h4
                    className={`text-xs font-bold uppercase tracking-wider mb-2 sm:mb-0 ${TC.textTertiary}`}
                  >
                    Platform
                  </h4>
                </div>

                {["Dashboard", "Market", "Portfolio", "Learn"].map((item) => (
                  <a
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className={`text-sm font-medium ${isLight ? "text-slate-600" : "text-white"} hover:text-cyan-500 transition-colors py-1`}
                  >
                    {item}
                  </a>
                ))}
              </div>



              {/* Feedback CTA */}
              <div className="space-y-4 sm:space-y-4 sm:w-auto flex flex-col items-center sm:items-start text-center sm:text-left pt-4 sm:pt-0 border-t sm:border-t-0 border-dashed border-gray-700/30">
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${TC.textTertiary}`}
                >
                  Community
                </h4>
                <button
                  onClick={() => setShowFeedback(true)}
                  className={`
                      group w-auto min-w-[200px] mx-auto sm:mx-0 flex items-center justify-center sm:justify-start gap-3 px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-300
                      ${TC.bgPrimaryBtn} hover:shadow-cyan-500/40 shadow-lg shadow-cyan-500/20 transform hover:-translate-y-1
                    `}
                >
                  <FaPaperPlane className="transform group-hover:rotate-12 transition-transform" />
                  <span>Share Feedback</span>
                </button>
                <p
                  className={`text-xs ${TC.textTertiary} max-w-[220px] mx-auto sm:mx-0`}
                >
                  Help us improve NexChain with your ideas.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className={`pt-3 border-t ${isLight ? "border-gray-100" : "border-gray-800"}`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between text-center sm:text-left gap-4">
              <p className={`text-xs font-medium ${TC.textTertiary}`}>
                &copy; {currentYear} NexChain Inc.
              </p>
              <div className="flex justify-center gap-6 text-xs font-bold opacity-100 w-full sm:w-auto">
                <a href="#" className="hover:text-cyan-400 text-slate-400 dark:text-slate-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-cyan-400 text-slate-400 dark:text-slate-300 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>

      <FeedbackModal
        isOpen={showFeedback}
        onClose={closeModal}
      />
    </>
  );
}
