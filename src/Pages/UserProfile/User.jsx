import React, { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, LifeBuoy, Settings, UserRound } from "lucide-react";
import useUserContext from "@/hooks/useUserContext";
import { cn } from "@/utils/utils";

/** Account section shell: label, section tabs, then the page */
export default function User() {
  const { user } = useUserContext();
  const sections = [
    { label: "Overview", to: `/user-profile/${user?.id}`, icon: LayoutDashboard },
    { label: "Settings", to: "/user/settings", icon: Settings },
    { label: "Support", to: "/user/support", icon: LifeBuoy },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-3 py-4 sm:p-0">
      <div className="border-b border-line">
        <div className="flex items-center gap-2 pb-2 text-xs text-fg-subtle">
          <UserRound size={15} className="text-brand" />
          <span className="font-medium text-fg-muted">Your account</span>
          {user?.email && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{user.email}</span>
            </>
          )}
        </div>
        <nav aria-label="Account sections" className="section-navigation flex gap-1 overflow-x-auto no-scrollbar">
          {sections.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                cn(
                  "relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full",
                  isActive ? "text-fg after:bg-brand" : "text-fg-muted hover:text-fg",
                )
              }
            >
              <Icon size={16} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Suspense
        fallback={
          <div role="status" className="h-80 animate-pulse rounded-xl border border-line bg-surface">
            <span className="sr-only">Loading</span>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
}
