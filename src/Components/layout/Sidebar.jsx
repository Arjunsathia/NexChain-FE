import React from "react";
import { NavLink } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import useRoleContext from "@/hooks/useRoleContext";
import Brand from "@/Components/ui/brand";
import { cn } from "@/utils/utils";
import { NAV_GROUPS, ADMIN_ITEM, ACCOUNT_ITEMS } from "./navConfig";



function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "app-nav-link group relative flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors",
          collapsed && "justify-center px-0",
          isActive ? "bg-brand-soft text-brand" : "text-fg-muted hover:bg-surface-hover hover:text-fg",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand" aria-hidden="true" />
          )}
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.9} className="shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {collapsed && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium text-fg opacity-0 shadow-pop transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

/** Navigation shared by the desktop sidebar and the mobile drawer */
function SidebarNav({ collapsed = false, onNavigate }) {
  const { isAdmin } = useRoleContext();
  const groups = isAdmin ? [...NAV_GROUPS, { label: "Manage", items: [ADMIN_ITEM] }] : NAV_GROUPS;

  return (
    <nav aria-label="Main" className="flex-1 space-y-5 px-3 py-4">
      {groups.map((group) => (
        <div key={group.label}>
          {collapsed ? (
            <div className="mx-auto mb-2 h-px w-6 bg-line first:hidden" aria-hidden="true" />
          ) : (
            <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Logo({ collapsed }) {
  return <Brand compact={collapsed} />;
}

/**
 * Desktop sidebar (lg and up). `collapsed` shows icons only; `locked` means the
 * page has its own section sidebar, so the toggle is hidden.
 */
export function DesktopSidebar({ collapsed, locked, onToggle }) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <aside
      className="app-sidebar fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-surface transition-[width] duration-200 ease-out lg:flex"
      style={{ width: "var(--sidebar-w)" }}
    >
      <div className={cn("flex h-[var(--topbar-h)] shrink-0 items-center border-b border-line", collapsed ? "justify-center" : "px-5")}>
        <Logo collapsed={collapsed} />
      </div>

      <SidebarNav collapsed={collapsed} />

      <div className="space-y-0.5 border-t border-line px-3 py-3">
        {ACCOUNT_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
        {!locked && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg",
              collapsed && "justify-center px-0",
            )}
          >
            <ToggleIcon size={18} />
            {!collapsed && "Collapse"}
          </button>
        )}
      </div>
    </aside>
  );
}

/** Slide-out navigation for phones and tablets */
export function MobileSidebar({ open, onClose, footer }) {
  return (
    <Dialog aria-label="Navigation menu" open={open} onClose={onClose} className="relative z-[2000] lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-[closed]:opacity-0"
      />
      <DialogPanel
        transition
        className="mobile-drawer surface-panel fixed inset-y-0 left-0 flex w-[290px] max-w-[calc(100vw-20px)] flex-col border-r border-line bg-surface transition duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] data-[closed]:-translate-x-full"
      >
        <div className="flex h-[var(--topbar-h)] shrink-0 items-center justify-between border-b border-line px-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-hover hover:text-fg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav onNavigate={onClose} />
          <div className="space-y-0.5 border-t border-line px-3 py-3">
            {ACCOUNT_ITEMS.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onClose} />
            ))}
          </div>
        </div>
        {footer}
      </DialogPanel>
    </Dialog>
  );
}
