import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Sun, Moon, Bell, LogOut, ShieldCheck, ChevronDown, Wallet } from "lucide-react";
import useUserContext from "@/hooks/useUserContext";
import useRoleContext from "@/hooks/useRoleContext";
import useLogout from "@/hooks/useLogout";
import api from "@/api/axiosConfig";
import { useTheme } from "@/hooks/useTheme";
import { formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";
import NotificationModal from "@/Components/Common/NotificationModal";
import ConfirmDialog from "@/Components/Common/ConfirmDialog";
import GlobalSearch from "./GlobalSearch";
import Brand from "@/Components/ui/brand";
import { MobileSidebar } from "./Sidebar";
import MoreSheet from "./MoreSheet";
import UserAvatar from "./UserAvatar";
import useMediaQuery from "@/hooks/useMediaQuery";
import { ACCOUNT_ITEMS, profileItem } from "./navConfig";

const Avatar = UserAvatar;

const ADMIN_LINK = { to: "/admin", label: "Admin panel", icon: ShieldCheck };

const iconButton =
  "control-button relative grid size-9 place-items-center rounded-xl text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg";

/** Unread notification count: polled every minute, refreshed on socket events */
function useUnreadCount(userId) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!userId) {
      setCount(0);
      return undefined;
    }
    const load = async () => {
      try {
        const res = await api.get("/notifications");
        setCount(Array.isArray(res.data) ? res.data.filter((n) => !n.isRead).length : 0);
      } catch {
        // keep the last known count
      }
    };
    load();
    const interval = setInterval(load, 60000);
    window.addEventListener("refreshNotifications", load);
    return () => {
      clearInterval(interval);
      window.removeEventListener("refreshNotifications", load);
    };
  }, [userId]);
  return count;
}

/** Slim header above the page: search, balance, notifications, theme and account */
function TopbarComponent({ drawerOpen, onCloseDrawer }) {
  const { toggleTheme, isLight } = useTheme();
  const signOut = useLogout();
  const { user } = useUserContext();
  const { isAdmin } = useRoleContext();
  const balance = useSelector((state) => state.wallet.balance);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const bellRef = useRef(null);
  const unreadCount = useUnreadCount(user?.id);
  // Phones: the full logo, and "More" opens a bottom sheet instead of the side drawer
  const isPhone = useMediaQuery("(max-width: 639px)");

  const accountLinks = [...(user?.id ? [profileItem(user.id)] : []), ...ACCOUNT_ITEMS, ...(isAdmin ? [ADMIN_LINK] : [])];

  const handleLogout = async () => {
    setConfirmLogout(false);
    onCloseDrawer();
    await signOut();
  };

  const menuItem =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fg-muted data-[focus]:bg-surface-hover data-[focus]:text-fg";

  return (
    <>
      <header className="app-topbar sticky top-0 z-30 h-[var(--topbar-h)] border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="flex h-full items-center gap-2 px-3 sm:px-4 lg:px-6">
          {/* Below lg the bottom tab bar's "More" opens the menu drawer */}
          <Brand compact={!isPhone} className="shrink-0 lg:hidden" />

          <GlobalSearch className="w-full max-w-md" />

          <div className="ml-auto flex items-center gap-2 max-sm:ml-0 sm:gap-1.5">
            {user?.id && Number.isFinite(balance) && (
              <Link
                to="/portfolio"
                className="mr-1 hidden items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5 transition-colors hover:border-line-strong sm:flex"
                title="Available balance"
              >
                <Wallet size={14} className="text-fg-subtle" />
                <span className="tabular text-sm font-semibold text-fg">{formatUSD(balance)}</span>
              </Link>
            )}

            {user?.id && (
              <div className="relative">
                <button
                  ref={bellRef}
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className={iconButton}
                  aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-down px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} triggerRef={bellRef} />
              </div>
            )}

            {/* On phones the theme switch lives in the More sheet */}
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(iconButton, "hidden sm:grid")}
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user?.id && (
              <Menu as="div" className="relative sm:ml-1">
                <MenuButton aria-label="Account menu" className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-surface-hover data-[open]:bg-surface-hover sm:rounded-lg sm:p-1">
                  <Avatar user={user} size={isPhone ? 36 : 32} />
                  <ChevronDown size={14} className="hidden text-fg-subtle sm:block" />
                </MenuButton>
                <MenuItems
                  anchor={{ to: "bottom end", gap: 8 }}
                  transition
                  className="z-[60] w-60 origin-top-right rounded-xl border border-line bg-surface p-1.5 shadow-pop outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                >
                  <div className="flex items-center gap-3 px-2.5 py-2.5">
                    <Avatar user={user} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fg">{user.name || "Trader"}</p>
                      <p className="truncate text-xs text-fg-subtle">{user.email}</p>
                    </div>
                  </div>
                  <div className="my-1 h-px bg-line" />
                  {accountLinks.map(({ to, label, icon: Icon }) => (
                    <MenuItem key={to}>
                      <Link to={to} className={menuItem}>
                        <Icon size={16} /> {label}
                      </Link>
                    </MenuItem>
                  ))}
                  <div className="my-1 h-px bg-line" />
                  <MenuItem>
                    <button type="button" onClick={() => setConfirmLogout(true)} className={cn(menuItem, "text-down data-[focus]:bg-down-soft data-[focus]:text-down")}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            )}
          </div>
        </div>
      </header>

      {isPhone && (
        <MoreSheet
          open={drawerOpen}
          onClose={onCloseDrawer}
          onSignOut={() => {
            onCloseDrawer();
            setConfirmLogout(true);
          }}
        />
      )}

      <MobileSidebar
        open={drawerOpen && !isPhone}
        onClose={onCloseDrawer}
        footer={
          user?.id && (
            <div className="space-y-3 border-t border-line p-4">
              <div className="flex items-center gap-3">
                <Avatar user={user} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg">{user.name || "Trader"}</p>
                  {Number.isFinite(balance) && <p className="tabular text-xs text-fg-subtle">{formatUSD(balance)} available</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-sm font-semibold text-down transition-colors hover:bg-down-soft"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )
        }
      />

      <ConfirmDialog
        show={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Sign out?"
        message="You'll need to sign in again to access your portfolio."
        confirmText="Sign out"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}

const Topbar = React.memo(TopbarComponent);
export default Topbar;
