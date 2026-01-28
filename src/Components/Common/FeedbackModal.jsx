import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaBug,
    FaLightbulb,
    FaHeart,
    FaCheckCircle,
} from "react-icons/fa";
import { X } from "lucide-react";
import { postForm } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import useThemeCheck from "@/hooks/useThemeCheck";

const FeedbackModal = ({ isOpen, onClose }) => {
    const isLight = useThemeCheck();
    const { user } = useUserContext();
    const [feedback, setFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState("suggestion");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Reset state when opening if needed, but here we just handle close
    // Could add useEffect to reset form on open/close if desired.

    const TC = useMemo(
        () => ({
            bgModal: isLight
                ? "bg-white/90 backdrop-blur-xl shadow-2xl shadow-black/30 border-none"
                : "bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-black/80 border-none",
            textPrimary: isLight ? "text-gray-900" : "text-white",
            textSecondary: isLight ? "text-gray-600" : "text-gray-200",
            textTertiary: isLight ? "text-gray-500" : "text-gray-300",
            inputBg: isLight
                ? "bg-gray-50/50 text-gray-900 border-gray-200"
                : "bg-black/20 text-white border-white/10",
            bgBtnFeedbackActive: isLight
                ? "bg-blue-50 text-blue-600 ring-1 ring-blue-500/20"
                : "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
            bgBtnFeedbackDefault: isLight
                ? "bg-gray-50 text-gray-500 hover:bg-gray-100"
                : "bg-white/5 text-gray-400 hover:bg-white/10",
            bgPrimaryBtn:
                "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/20",
            bgCancelBtn: isLight
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-white/5 text-gray-300 hover:bg-white/10",
        }),
        [isLight]
    );

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
                    setShowSuccess(false);
                    onClose();
                }, 2000);
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) onClose();
    };

    if (typeof document === "undefined") return null;

    return createPortal(
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
                    onClick={handleClose}
                >
                    <div
                        className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 ${TC.bgModal}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {showSuccess ? (
                            <div className="p-8 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                    <FaCheckCircle className="text-3xl text-green-500" />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${TC.textPrimary}`}>
                                    Feedback Sent!
                                </h3>
                                <p className={`text-sm ${TC.textSecondary}`}>
                                    Thanks for helping us grow.
                                </p>
                            </div>
                        ) : (
                            <div className="p-0">
                                <div
                                    className={`px-5 py-4 border-b flex justify-between items-center ${isLight ? "border-gray-100" : "border-gray-800"
                                        }`}
                                >
                                    <h3 className={`font-bold ${TC.textPrimary}`}>
                                        Send Feedback
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${TC.textTertiary}`}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitFeedback} className="p-5 space-y-4">
                                    <div>
                                        <label
                                            className={`text-xs font-bold uppercase tracking-wider mb-2 block ${TC.textTertiary}`}
                                        >
                                            Type
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                {
                                                    id: "suggestion",
                                                    icon: FaLightbulb,
                                                    label: "Idea",
                                                },
                                                { id: "bug", icon: FaBug, label: "Bug" },
                                                { id: "praise", icon: FaHeart, label: "Love" },
                                            ].map((item) => (
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
                                                    <item.icon
                                                        className={
                                                            feedbackType === item.id
                                                                ? "text-blue-500"
                                                                : "opacity-50"
                                                        }
                                                    />
                                                    <span className="text-xs font-semibold">
                                                        {item.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className={`text-xs font-bold uppercase tracking-wider mb-2 block ${TC.textTertiary}`}
                                        >
                                            Message
                                        </label>
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
                                            onClick={handleClose}
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
                    </div>
                </div>
            )}
        </>,
        document.body
    );
};

export default FeedbackModal;
