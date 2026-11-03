import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Coins, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/utils/utils";

const SECTIONS = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Cryptocurrencies", path: "/admin/cryptocurrencies", icon: Coins },
  { label: "Feedback", path: "/admin/feedback", icon: MessageSquare },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

/** Section tabs for the admin console (one row, scrolls on phones) */
export default function AdminTabs() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Admin sections" className="section-navigation flex gap-1 overflow-x-auto no-scrollbar">
      {SECTIONS.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/admin"}
          className={({ isActive }) => {
            const active = isActive || (path === "/admin" && pathname === "/admin/dashboard");
            return cn(
              "relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
              "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full",
              active ? "text-fg after:bg-brand" : "text-fg-muted hover:text-fg",
            );
          }}
        >
          <Icon size={16} strokeWidth={1.9} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
