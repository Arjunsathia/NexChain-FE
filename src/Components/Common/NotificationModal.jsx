import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FaBell,
  FaTrash,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import api from "@/api/axiosConfig";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import useThemeCheck from "@/hooks/useThemeCheck";

const NotificationModal = ({ isOpen, onClose, triggerRef }) => {
  const isLight = useThemeCheck();
  const isDark = !isLight;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener("refreshNotifications", fetchNotifications);
    return () =>
      window.removeEventListener("refreshNotifications", fetchNotifications);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        (!triggerRef?.current || !triggerRef.current.contains(event.target))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose, triggerRef]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification removed");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to remove notification");
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500" />;
      case "warning":
        return <FaExclamationTriangle className="text-yellow-500" />;
      case "error":
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div style={{ display: "contents" }}>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed top-16 right-2 md:top-20 md:right-20 w-[92vw] max-w-[300px] md:max-w-none md:w-[400px] rounded-3xl border z-[9999] overflow-hidden transform-gpu ${isDark
              ? "bg-gray-900/90 backdrop-blur-2xl text-white border-gray-700/50 shadow-[0_0_50px_rgba(0,0,0,0.6)]"
              : "bg-white/80 backdrop-blur-2xl text-gray-900 border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
              }`}
            ref={modalRef}
            style={{ pointerEvents: "auto" }}
          >
            { }
            <div
              className={`p-3 md:p-4 border-b flex justify-between items-center ${isDark
                ? "border-gray-700/50 bg-gray-900/50"
                : "border-gray-100 bg-white/50"
                }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${isDark ? "bg-cyan-500/10" : "bg-cyan-50"}`}
                >
                  <FaBell className="text-cyan-500" />
                </div>
                <h3
                  className={`font-bold text-base md:text-lg ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Notifications
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDark
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-cyan-100 text-cyan-700"
                    }`}
                >
                  {notifications.length}
                </span>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className={`text-xs text-red-500 hover:text-red-400 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                    }`}
                >
                  <FaTrash className="text-[10px]" /> Clear All
                </button>
              )}
            </div>

            { }
            <div
              className={`max-h-[60vh] md:max-h-[450px] overflow-y-auto custom-scrollbar bg-transparent`}
            >
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-400 text-sm">Loading updates...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
                  >
                    <FaBell className="text-2xl opacity-20" />
                  </div>
                  <p
                    className={`font-medium mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    No notifications yet
                  </p>
                  <p className="text-xs text-gray-500">
                    We&apos;ll let you know when something arrives
                  </p>
                </div>
              ) : (
                <div
                  className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-100"}`}
                >
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleMarkAsRead(notification._id)}
                      className={`p-4 transition-colors cursor-pointer relative group ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                        } ${!notification.isRead
                          ? isDark
                            ? "bg-cyan-900/10"
                            : "bg-cyan-50/40"
                          : isDark
                            ? "bg-gray-900"
                            : "bg-white"
                        }`}
                    >
                      <div className="flex gap-4">
                        <div className="mt-1 flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4
                              className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} ${notification.isRead ? (isDark ? "text-gray-300" : "text-gray-700") : ""}`}
                            >
                              {notification.title}
                            </h4>
                            <span
                              className={`text-[10px] text-gray-400 whitespace-nowrap px-1.5 py-0.5 rounded ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                            >
                              {new Date(
                                notification.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p
                            className={`text-sm leading-relaxed line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {notification.message}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(notification._id, e)}
                          className={`opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all self-start -mr-2 -mt-2 ${isDark ? "hover:bg-red-900/20" : "hover:bg-red-50"
                            }`}
                          title="Remove"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                      {!notification.isRead && (
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-8 bg-cyan-500 rounded-r-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
};

export default NotificationModal;
