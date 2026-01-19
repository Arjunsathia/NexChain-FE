import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    FaTimes,
    FaCheckCircle,
    FaExclamationTriangle,
    FaExclamationCircle,
    FaInfoCircle,
    FaCalendarAlt,
    FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useThemeCheck from "@/hooks/useThemeCheck";

const NotificationDetailsModal = ({ isOpen, onClose, notification }) => {
    const isLight = useThemeCheck();
    const isDark = !isLight;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <FaCheckCircle className="text-green-500 text-3xl" />;
            case "warning":
                return <FaExclamationTriangle className="text-yellow-500 text-3xl" />;
            case "error":
                return <FaExclamationCircle className="text-red-500 text-3xl" />;
            default:
                return <FaInfoCircle className="text-blue-500 text-3xl" />;
        }
    };

    const getHeaderColor = (type) => {
        switch (type) {
            case "success":
                return "bg-green-500/10 border-green-500/20";
            case "warning":
                return "bg-yellow-500/10 border-yellow-500/20";
            case "error":
                return "bg-red-500/10 border-red-500/20";
            default:
                return "bg-blue-500/10 border-blue-500/20";
        }
    };

    const formattedDate = notification
        ? new Date(notification.createdAt).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    const formattedTime = notification
        ? new Date(notification.createdAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "";

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${isDark
                                ? "bg-gray-900 border-gray-700"
                                : "bg-white border-gray-200"
                            }`}
                    >
                        {notification && (
                            <>
                                {/* Header */}
                                <div
                                    className={`p-6 border-b ${isDark ? "border-gray-800" : "border-gray-100"
                                        } flex items-start justify-between gap-4`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${getHeaderColor(notification.type)}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                                {notification.title}
                                            </h2>
                                            <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                                                }`}>
                                                {notification.type || "Notification"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className={`p-2 rounded-lg transition-colors ${isDark
                                                ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                            }`}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Time Info */}
                                    <div className={`flex flex-wrap gap-4 mb-6 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="opacity-70" />
                                            <span>{formattedDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaClock className="opacity-70" />
                                            <span>{formattedTime}</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`prose ${isDark ? "prose-invert" : ""
                                            } max-w-none`}
                                    >
                                        <p
                                            className={`text-base leading-relaxed whitespace-pre-wrap ${isDark ? "text-gray-300" : "text-gray-600"
                                                }`}
                                        >
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div
                                    className={`p-4 border-t ${isDark
                                            ? "bg-gray-900/50 border-gray-800"
                                            : "bg-gray-50 border-gray-100"
                                        } flex justify-end`}
                                >
                                    <button
                                        onClick={onClose}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                                                ? "bg-gray-800 text-white hover:bg-gray-700"
                                                : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default NotificationDetailsModal;
