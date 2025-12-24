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
    FaHeart
} from "react-icons/fa";
import { X } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { postForm } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import useThemeCheck from "@/hooks/useThemeCheck";

export default function Footer() {
    const isLight = useThemeCheck();
    const { user } = useUserContext();
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState("suggestion");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const TC = useMemo(() => ({
        bgFooter: isLight
            ? "bg-white/60 backdrop-blur-xl shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none"
            : "bg-gray-800/40 backdrop-blur-xl shadow-xl shadow-black/20 border-none",

        bgModal: isLight
            ? "bg-white/90 backdrop-blur-xl shadow-2xl shadow-black/30 border-none"
            : "bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-black/80 border-none",

        textPrimary: isLight ? "text-gray-900" : "text-white",
        textSecondary: isLight ? "text-gray-600" : "text-gray-300",
        textTertiary: isLight ? "text-gray-400" : "text-gray-500",

        headingGradient: "bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent",

        bgSocial: isLight
            ? "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-cyan-400",

        inputBg: isLight ? "bg-gray-50/50 text-gray-900 border-gray-200" : "bg-black/20 text-white border-white/10",

        bgBtnFeedbackActive: isLight
            ? "bg-blue-50 text-blue-600 ring-1 ring-blue-500/20"
            : "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
        bgBtnFeedbackDefault: isLight
            ? "bg-gray-50 text-gray-500 hover:bg-gray-100"
            : "bg-white/5 text-gray-400 hover:bg-white/10",

        bgPrimaryBtn: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/20",
        bgCancelBtn: isLight ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-white/5 text-gray-300 hover:bg-white/10",

    }), [isLight]);

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setIsSubmitting(true);
        try {
            const feedbackData = {
                type: feedbackType,
                message: feedback.trim(),
                userEmail: user?.email || "anonymous@nexchain.com",
                userName: user?.name || "Anonymous User",
                userId: user?.id || null,
                pageUrl: window.location.href,
                timestamp: new Date().toISOString(),
                status: "new",
            };

            const response = await postForm("/feedback", feedbackData);

            if (response && (response.success || response._id)) {
                setShowSuccess(true);
                setTimeout(() => {
                    setFeedback("");
                    setFeedbackType("suggestion");
                    setShowFeedback(false);
                    setShowSuccess(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        if (!isSubmitting) setShowFeedback(false);
    };

    const currentYear = new Date().getFullYear();

    return (
        <>
            <motion.footer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
                className={`
          ${TC.bgFooter} rounded-2xl px-5 py-6 sm:px-6 sm:py-8 mx-3 my-3 sm:mx-4 sm:my-4
          transition-all duration-500 ease-out border border-transparent
        `}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-6 sm:mb-8">

                        {/* Brand & Disclaimer Section */}
                        <div className="flex-1 space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <FaRocket size={14} />
                                </div>
                                <h3 className={`text-lg sm:text-xl font-bold ${TC.textPrimary} tracking-tight`}>
                                    NexChain
                                </h3>
                            </div>

                            <p className={`text-sm leading-relaxed max-w-lg ${TC.textSecondary}`}>
                                Empowering your financial future with advanced crypto tools.
                                <span className="opacity-70 mx-1 block sm:inline mt-1 sm:mt-0">
                                    Trading involves risk. Invest responsibly.
                                </span>
                            </p>

                            <div className="flex gap-2 pt-1">
                                {[
                                    { icon: FaGithub, href: "#", label: "GitHub" },
                                    { icon: FaTwitter, href: "#", label: "Twitter" },
                                    { icon: FaLinkedin, href: "#", label: "LinkedIn" },
                                ].map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.href}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${TC.bgSocial} hover:scale-110 shadow-sm`}
                                        aria-label={social.label}
                                    >
                                        <social.icon size={16} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links & Actions */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-8 lg:gap-16 pt-2 sm:pt-0">
                            {/* Quick Links */}
                            <div className="space-y-3 min-w-[120px]">
                                <h4 className={`text-xs font-bold uppercase tracking-wider ${TC.textTertiary}`}>Platform</h4>
                                <div className="flex flex-col space-y-2">
                                    {['Dashboard', 'Market', 'Portfolio', 'Learn'].map((item) => (
                                        <a key={item} href={`/${item.toLowerCase()}`} className={`text-sm font-medium ${TC.textSecondary} hover:text-cyan-500 transition-colors`}>
                                            {item}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Legal */}
                            <div className="space-y-3 min-w-[120px]">
                                <h4 className={`text-xs font-bold uppercase tracking-wider ${TC.textTertiary}`}>Legal</h4>
                                <div className="flex flex-col space-y-2">
                                    {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                                        <a key={item} href="#" className={`text-sm font-medium ${TC.textSecondary} hover:text-cyan-500 transition-colors`}>
                                            {item}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback CTA - Full width on mobile col-span-2 */}
                            <div className="space-y-3 col-span-2 sm:col-span-1 sm:w-auto">
                                <h4 className={`text-xs font-bold uppercase tracking-wider ${TC.textTertiary}`}>Community</h4>
                                <button
                                    onClick={() => setShowFeedback(true)}
                                    className={`
                      group w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300
                      ${TC.bgPrimaryBtn} hover:shadow-cyan-500/30 transform hover:-translate-y-0.5
                    `}
                                >
                                    <FaPaperPlane className="transform group-hover:rotate-12 transition-transform" />
                                    <span>Share Feedback</span>
                                </button>
                                <p className={`text-xs ${TC.textTertiary} max-w-[200px] mx-auto sm:mx-0 text-center sm:text-left`}>
                                    Help us improve NexChain with your ideas.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className={`pt-6 border-t ${isLight ? "border-gray-100" : "border-gray-800"}`}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                            <p className={`text-xs font-medium ${TC.textTertiary}`}>
                                &copy; {currentYear} NexChain Inc. All rights reserved.
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Systems Operational
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                            onClick={closeModal}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                className={`relativ w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${TC.bgModal}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {showSuccess ? (
                                    <div className="p-8 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                            <FaCheckCircle className="text-3xl text-green-500" />
                                        </div>
                                        <h3 className={`text-xl font-bold mb-2 ${TC.textPrimary}`}>Feedback Sent!</h3>
                                        <p className={`text-sm ${TC.textSecondary}`}>Thanks for helping us grow.</p>
                                    </div>
                                ) : (
                                    <div className="p-0">
                                        <div className={`px-5 py-4 border-b flex justify-between items-center ${isLight ? "border-gray-100" : "border-gray-800"}`}>
                                            <h3 className={`font-bold ${TC.textPrimary}`}>Send Feedback</h3>
                                            <button onClick={closeModal} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${TC.textTertiary}`}>
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmitFeedback} className="p-5 space-y-4">
                                            <div>
                                                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${TC.textTertiary}`}>Type</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { id: 'suggestion', icon: FaLightbulb, label: 'Idea' },
                                                        { id: 'bug', icon: FaBug, label: 'Bug' },
                                                        { id: 'praise', icon: FaHeart, label: 'Love' },
                                                    ].map(item => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => setFeedbackType(item.id)}
                                                            className={`
                                         flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all duration-200
                                         ${feedbackType === item.id
                                                                    ? `${TC.bgBtnFeedbackActive} border-blue-500/30`
                                                                    : `${TC.bgBtnFeedbackDefault} border-transparent`
                                                                }
                                      `}
                                                        >
                                                            <item.icon className={feedbackType === item.id ? "text-blue-500" : "opacity-50"} />
                                                            <span className="text-xs font-semibold">{item.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${TC.textTertiary}`}>Message</label>
                                                <textarea
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    rows="3"
                                                    placeholder="Tell us what you think..."
                                                    className={`w-full rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none border ${TC.inputBg}`}
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={closeModal}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${TC.bgCancelBtn}`}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!feedback.trim() || isSubmitting}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${TC.bgPrimaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {isSubmitting ? "Sending..." : "Submit"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
