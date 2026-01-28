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

    if (!isOpen && !notification) return null;

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
        <>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    />

                    {/* Modal Content */}
                    <div
                        className={`relative w-[92%] md:w-full max-w-md rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.4)] overflow-hidden border animate-in zoom-in duration-300 ${isDark
                            ? "bg-[#0B1221]/95 text-white border-white/10"
                            : "bg-white/95 text-gray-900 border-gray-200/50"
                            } backdrop-blur-3xl`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {notification && (
                            <>
                                {/* Header */}
                                <div
                                    className={`p-5 md:p-7 flex items-start justify-between gap-4`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3.5 rounded-2xl shadow-sm ${getHeaderColor(notification.type)}`}>
                                            <div className="transform scale-110">
                                                {getIcon(notification.type)}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className={`text-lg md:text-xl font-black tracking-tight leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                                                {notification.title}
                                            </h2>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 ${isDark ? "text-cyan-400 opacity-80" : "text-blue-600"
                                                }`}>
                                                {notification.type || "Update"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className={`p-2 rounded-xl transition-all active:scale-90 ${isDark
                                            ? "text-gray-400 hover:bg-white/5 hover:text-white"
                                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                            }`}
                                    >
                                        <FaTimes size={18} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="px-5 md:px-7 pb-2 mt-[-5px]">
                                    {/* Time Info */}
                                    <div className={`flex flex-wrap gap-x-5 gap-y-2 mb-6 text-[11px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-cyan-500/60" />
                                            <span>{formattedDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-cyan-500/60" />
                                            <span>{formattedTime}</span>
                                        </div>
                                    </div>

                                    {notification.category && (
                                        <div
                                            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${isDark
                                                ? "bg-white/5 border-white/5 text-gray-300"
                                                : "bg-gray-50 border-gray-100 text-gray-700"
                                                }`}
                                        >
                                            <span className="font-black text-[10px] uppercase tracking-widest opacity-50">Category:</span>
                                            <span className="font-bold text-sm tracking-tight capitalize">
                                                {notification.category.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <p
                                            className={`text-[15px] leading-[1.6] font-medium whitespace-pre-wrap ${isDark ? "text-slate-300" : "text-slate-600"
                                                }`}
                                        >
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div
                                    className={`p-5 md:p-6 border-t ${isDark
                                        ? "bg-black/20 border-white/5"
                                        : "bg-gray-50/50 border-gray-100"
                                        } flex justify-end`}
                                >
                                    <button
                                        onClick={onClose}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 shadow-lg ${isDark
                                            ? "bg-gray-800 text-white hover:bg-gray-700 shadow-black/40"
                                            : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-gray-200/50"
                                            }`}
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>,
        document.body
    );
};

export default NotificationDetailsModal;
