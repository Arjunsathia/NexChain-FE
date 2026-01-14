import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import useThemeCheck from "@/hooks/useThemeCheck";
import { FaExclamationTriangle } from "react-icons/fa";

/**
 * A reusable, premium confirmation dialog that matches the NexChain design system.
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onClose - Function to call when modal is cancelled or closed
 * @param {Function} props.onConfirm - Function to call when user confirms action
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message/body
 * @param {string} [props.confirmText] - Label for confirm button
 * @param {string} [props.cancelText] - Label for cancel button
 * @param {string} [props.variant] - 'warning', 'danger', 'info' (defaults to warning)
 */
const ConfirmDialog = ({
    show,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning"
}) => {
    const isLight = useThemeCheck();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
        }
    }, [show]);

    if (!show) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case "danger":
                return {
                    iconBg: isLight ? "bg-red-100 text-red-600" : "bg-red-500/10 text-red-500",
                    buttonBg: "from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-red-500/20"
                };
            case "info":
                return {
                    iconBg: isLight ? "bg-blue-100 text-blue-600" : "bg-blue-500/10 text-blue-500",
                    buttonBg: "from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 shadow-blue-500/20"
                };
            default: // warning
                return {
                    iconBg: isLight ? "bg-amber-100 text-amber-600" : "bg-amber-500/10 text-amber-500",
                    buttonBg: "from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/20"
                };
        }
    };

    const styles = getVariantStyles();

    return createPortal(
        <div
            className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none pointer-events-none"
                }`}
            onClick={onClose}
        >
            <div
                className={`w-full max-w-sm rounded-[1.5rem] p-6 transition-all duration-300 transform ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
                    } ${isLight ? "bg-white shadow-2xl" : "bg-gray-900 border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center gap-5">
                    <div className={`p-4 rounded-2xl ${styles.iconBg} transform transition-transform hover:scale-110 duration-300`}>
                        <FaExclamationTriangle size={28} />
                    </div>

                    <div>
                        <h3 className={`text-xl font-extrabold ${isLight ? "text-gray-900" : "text-white"}`}>
                            {title || "Confirmation Required"}
                        </h3>
                        <p className={`text-sm mt-3 leading-relaxed font-medium ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                            {message}
                        </p>
                    </div>

                    <div className="flex w-full gap-3 mt-4">
                        <button
                            onClick={onClose}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${isLight
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                                }`}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onConfirm, 200);
                            }}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transform active:scale-[0.98] transition-all bg-gradient-to-r ${styles.buttonBg}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmDialog;
