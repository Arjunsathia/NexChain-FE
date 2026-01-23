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
import NotificationDetailsModal from "./NotificationDetailsModal";

const NotificationModal = ({ isOpen, onClose, triggerRef }) => {
  const isLight = useThemeCheck();
  const isDark = !isLight;

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
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
      // Don't close if details modal is open
      if (isDetailsModalOpen) return;

      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        (!triggerRef?.current || !triggerRef.current.contains(event.target)) &&
        !event.target.closest('.details-modal-content') &&
        !event.target.closest('.notification-item') // Avoid closing when clicking the item itself
      ) {
        onClose();
      }
    };

    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isOpen, onClose, triggerRef, isDetailsModalOpen]);

  const handleNotificationClick = async (notification, e) => {
    if (e) e.stopPropagation();
    setSelectedNotification(notification);
    setIsDetailsModalOpen(true);

    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

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
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed top-[76px] left-4 right-4 md:left-auto md:right-8 lg:right-20 w-auto md:w-[420px] max-w-[500px] rounded-3xl border z-[9999] overflow-hidden transform-gpu ${isDark
              ? "bg-[#0B1221]/95 text-white border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
              : "bg-white/95 text-gray-900 border-gray-200/50 shadow-[0_30px_90px_rgba(0,0,0,0.1)]"
              } backdrop-blur-3xl`}
            ref={modalRef}
            style={{
              pointerEvents: "auto",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
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
                <AnimatePresence initial={false}>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      {/* Swipe Background (Trash Icon) */}
                      <div className="absolute inset-0 flex items-center justify-between px-6 bg-red-500/10">
                        <FaTrash className="text-red-500 text-lg opacity-40" />
                        <FaTrash className="text-red-500 text-lg opacity-40" />
                      </div>

                      <motion.div
                        drag="x"
                        dragConstraints={{ left: -150, right: 150 }}
                        dragElastic={0.4}
                        dragDirectionLock
                        dragThreshold={10}
                        onDragEnd={(_, info) => {
                          if (Math.abs(info.offset.x) > 110) {
                            handleDelete(notification._id, { stopPropagation: () => { } });
                          }
                        }}
                        onClick={(e) => handleNotificationClick(notification, e)}
                        whileTap={{ scale: 0.995 }}
                        className={`
                            notification-item p-4 transition-colors cursor-pointer relative z-10 border-b
                            ${isDark
                            ? "bg-gray-900 hover:bg-gray-800/80 border-white/5"
                            : "bg-white hover:bg-gray-50 border-gray-100"}
                            ${!notification.isRead ? (isDark ? "shadow-[inset_4px_0_0_#06b6d4]" : "shadow-[inset_4px_0_0_#06b6d4]") : ""}
                          `}
                      >
                        <div className="flex gap-4">
                          <div className="mt-1 flex-shrink-0">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex flex-col mb-1">
                              <div className="flex justify-between items-start gap-2">
                                <h4
                                  className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} ${notification.isRead ? (isDark ? "text-gray-300" : "text-gray-600") : ""}`}
                                >
                                  {notification.title}
                                </h4>
                                <span
                                  className={`text-[9px] font-black uppercase tracking-tighter text-gray-400 whitespace-nowrap px-1.5 py-0.5 rounded-md ${isDark ? "bg-gray-800/80 border border-white/5" : "bg-gray-100 border border-gray-200"}`}
                                >
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p
                              className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-2`}
                            >
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {typeof document !== "undefined" && createPortal(modalContent, document.body)}
      <NotificationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        notification={selectedNotification}
      />
    </>
  );
};

export default NotificationModal;
