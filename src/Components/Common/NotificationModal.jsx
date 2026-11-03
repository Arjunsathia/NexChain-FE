import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axiosConfig";
import { Segmented } from "@/Components/ui/segmented";
import { formatTimeAgo } from "@/utils/format";
import { categoryLabel, groupByDay, typeOf } from "@/utils/notifications";
import { cn } from "@/utils/utils";
import NotificationDetailsModal from "./NotificationDetailsModal";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

// The top bar's unread badge listens for this
const syncBadge = () => window.dispatchEvent(new CustomEvent("refreshNotifications"));

const RowSkeleton = () => (
  <div className="flex gap-3 px-4 py-3" aria-hidden="true">
    <span className="size-9 shrink-0 animate-pulse rounded-full bg-surface-2" />
    <span className="flex-1 space-y-2 pt-1">
      <span className="block h-3 w-2/3 animate-pulse rounded bg-surface-2" />
      <span className="block h-3 w-full animate-pulse rounded bg-surface-2" />
    </span>
  </div>
);

/** One row: swipe sideways (or use the bin on hover) to delete, tap to open */
const NotificationRow = ({ notification, onOpen, onDelete }) => {
  const meta = typeOf(notification);
  const category = categoryLabel(notification.category);
  const unread = !notification.isRead;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-between bg-down-soft px-5 text-down" aria-hidden="true">
        <Trash2 size={16} />
        <Trash2 size={16} />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        dragDirectionLock
        dragSnapToOrigin
        onDragEnd={(_, info) => Math.abs(info.offset.x) > 110 && onDelete(notification._id)}
        className="notification-item group relative flex gap-3 bg-surface px-4 py-3 transition-colors hover:bg-surface-hover"
      >
        <button
          type="button"
          onClick={(e) => onOpen(notification, e)}
          className="absolute inset-0 z-0"
          aria-label={`${unread ? "Unread: " : ""}${notification.title}`}
        />
        <span className={cn("pointer-events-none relative grid size-9 shrink-0 place-items-center rounded-full", meta.tone)}>
          <meta.Icon size={17} />
        </span>
        <div className="pointer-events-none relative min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className={cn("min-w-0 flex-1 truncate text-sm", unread ? "font-semibold text-fg" : "font-medium text-fg-muted")}>
              {notification.title}
            </p>
            <span className="shrink-0 pt-0.5 text-[11px] text-fg-subtle">{formatTimeAgo(Date.parse(notification.createdAt) / 1000)}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-fg-subtle">{notification.message}</p>
          {category && <p className="mt-1 text-[11px] font-medium text-fg-muted">{category}</p>}
        </div>
        {unread && <span className="pointer-events-none relative mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id);
          }}
          aria-label={`Delete "${notification.title}"`}
          className="relative z-10 -my-1 grid size-7 shrink-0 place-items-center self-center rounded-md text-fg-subtle opacity-0 transition hover:bg-down-soft hover:text-down focus-visible:opacity-100 group-hover:opacity-100 max-sm:hidden"
        >
          <Trash2 size={14} />
        </button>
      </motion.div>
    </motion.li>
  );
};

/** Notifications dropdown under the bell in the top bar */
const NotificationModal = ({ isOpen, onClose, triggerRef }) => {
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const panelRef = useRef(null);
  const loadedRef = useRef(false);

  // Spinner only for the first load; later refreshes swap the list quietly
  const fetchNotifications = useCallback(async () => {
    if (!loadedRef.current) setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(Array.isArray(res.data) ? res.data : []);
      loadedRef.current = true;
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchNotifications();
    else setConfirmClear(false);
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    window.addEventListener("refreshNotifications", fetchNotifications);
    return () => window.removeEventListener("refreshNotifications", fetchNotifications);
  }, [fetchNotifications]);

  // Close on outside click or Escape, but not while the details dialog is on top
  useEffect(() => {
    if (!isOpen || detailsOpen) return undefined;
    const onClick = (event) => {
      if (panelRef.current?.contains(event.target) || triggerRef?.current?.contains(event.target)) return;
      onClose();
    };
    const onKey = (event) => event.key === "Escape" && onClose();
    const timer = setTimeout(() => document.addEventListener("click", onClick), 100);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, triggerRef, detailsOpen]);

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      await api.put(`/notifications/${id}/read`);
      syncBadge();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const openDetails = (notification, e) => {
    e?.stopPropagation();
    setSelected(notification);
    setDetailsOpen(true);
    if (!notification.isRead) markAsRead(notification._id);
  };

  const remove = async (id) => {
    const previous = notifications;
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    setDetailsOpen(false);
    try {
      await api.delete(`/notifications/${id}`);
      syncBadge();
    } catch (error) {
      console.error("Error deleting notification:", error);
      setNotifications(previous);
      toast.error("Couldn't delete the notification");
    }
  };

  // No bulk endpoint: mark each unread one
  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const results = await Promise.allSettled(unread.map((n) => api.put(`/notifications/${n._id}/read`)));
    if (results.some((r) => r.status === "rejected")) {
      toast.error("Some notifications couldn't be marked as read");
      fetchNotifications();
    }
    syncBadge();
  };

  const clearAll = async () => {
    if (!confirmClear) return setConfirmClear(true);
    setConfirmClear(false);
    try {
      await api.delete("/notifications");
      setNotifications([]);
      syncBadge();
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Couldn't clear notifications");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visible = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;
  const groups = useMemo(() => groupByDay(visible), [visible]);

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="fixed top-[calc(var(--topbar-h)+8px)] right-2 left-2 z-[1500] flex max-h-[min(640px,calc(100dvh-var(--topbar-h)-24px))] origin-top-right flex-col overflow-hidden rounded-2xl border border-line bg-surface text-fg shadow-pop sm:left-auto sm:right-4 sm:w-[400px]"
        >
          <header className="flex items-center gap-2 px-4 pt-4 pb-3">
            <h2 className="text-base font-semibold text-fg">Notifications</h2>
            {unreadCount > 0 && (
              <span className="tabular rounded-full bg-brand px-1.5 py-px text-[11px] font-semibold text-brand-fg">{unreadCount}</span>
            )}
            <div className="ml-auto flex items-center gap-0.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close notifications"
                className="grid size-8 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="flex items-center justify-between gap-2 border-b border-line px-4 pb-3">
            <Segmented label="Show" options={FILTERS} value={filter} onChange={setFilter} />
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                onBlur={() => setConfirmClear(false)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  confirmClear ? "bg-down text-white" : "text-fg-subtle hover:bg-down-soft hover:text-down",
                )}
              >
                <Trash2 size={13} /> {confirmClear ? "Clear all?" : "Clear all"}
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
            {loading ? (
              <div className="py-1">
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-11 place-items-center rounded-full bg-surface-2 text-fg-subtle">
                  {filter === "unread" ? <CheckCheck size={20} /> : <Bell size={20} />}
                </span>
                <p className="mt-3 text-sm font-medium text-fg">{filter === "unread" ? "You're all caught up" : "No notifications yet"}</p>
                <p className="mt-1 max-w-[240px] text-xs text-fg-subtle">
                  Filled orders, price alerts and messages from the team will show up here.
                </p>
              </div>
            ) : (
              groups.map(([label, items]) => (
                <section key={label} aria-label={label}>
                  <h3 className="sticky top-0 z-20 bg-surface/95 px-4 pt-3 pb-1.5 text-[11px] font-semibold tracking-wide text-fg-subtle uppercase backdrop-blur-sm">
                    {label}
                  </h3>
                  <ul>
                    <AnimatePresence initial={false}>
                      {items.map((n) => (
                        <NotificationRow key={n._id} notification={n} onOpen={openDetails} onDelete={remove} />
                      ))}
                    </AnimatePresence>
                  </ul>
                </section>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <p className="border-t border-line px-4 py-2 text-center text-[11px] text-fg-subtle sm:hidden">Swipe a notification sideways to delete it</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {typeof document !== "undefined" && createPortal(panel, document.body)}
      <NotificationDetailsModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} notification={selected} onDelete={remove} />
    </>
  );
};

export default NotificationModal;
