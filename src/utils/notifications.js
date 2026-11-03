import { BellRing, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

// Look of each notification type (Notification.type in the API)
export const NOTIFICATION_TYPES = {
  success: { Icon: CircleCheck, tone: "bg-up-soft text-up", label: "Success", badge: "up" },
  error: { Icon: CircleAlert, tone: "bg-down-soft text-down", label: "Problem", badge: "down" },
  warning: { Icon: TriangleAlert, tone: "bg-warn/10 text-warn", label: "Heads up", badge: "warn" },
  alert: { Icon: BellRing, tone: "bg-brand-soft text-brand", label: "Price alert", badge: "brand" },
  info: { Icon: Info, tone: "bg-brand-soft text-brand", label: "Update", badge: "brand" },
};
export const typeOf = (n) => NOTIFICATION_TYPES[n?.type] || NOTIFICATION_TYPES.info;

const CATEGORIES = { limit: "Limit order", stop_limit: "Stop-limit order", stop_market: "Stop order" };
export const categoryLabel = (c) => (c ? CATEGORIES[c] || c.replace(/_/g, " ") : null);

/** Where a notification's follow-up lives, if anywhere */
export const followUpOf = (n) => {
  if (n?.type === "alert") return { to: "/user/settings?tab=alerts", label: "Manage price alerts" };
  if (n?.category && CATEGORIES[n.category]) return { to: "/portfolio", label: "View orders" };
  return null;
};

const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today" / "Yesterday" / "Earlier" buckets, newest first, empty ones dropped */
export const groupByDay = (items) => {
  const today = dayStart(new Date());
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  for (const n of items) {
    const t = dayStart(new Date(n.createdAt));
    (t === today ? groups.Today : t === today - 86_400_000 ? groups.Yesterday : groups.Earlier).push(n);
  }
  return Object.entries(groups).filter(([, list]) => list.length);
};
