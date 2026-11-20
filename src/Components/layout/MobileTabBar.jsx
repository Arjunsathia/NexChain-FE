import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Menu as MenuIcon } from "lucide-react";
import { cn } from "@/utils/utils";
import { NAV_GROUPS } from "./navConfig";

// The four main trading pages, taken from the shared navigation config
const TABS = NAV_GROUPS[0].items;
// "More": a grid icon for the phone sheet, the menu icon for the tablet drawer
const MoreIcon = (props) => (
  <>
    <LayoutGrid {...props} className="sm:hidden" />
    <MenuIcon {...props} className="hidden sm:block" />
  </>
);
// Coin detail pages belong to Markets
const isTabActive = (to, pathname) => pathname.startsWith(to) || (to === "/cryptolist" && pathname.startsWith("/coin"));

const tabClass = (active) =>
  cn(
    "group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-2xs font-semibold transition-colors",
    "max-sm:min-w-14",
    active ? "text-brand" : "text-fg-subtle hover:text-fg max-sm:font-medium",
  );

const iconWrap = (active) =>
  cn(
    "grid h-7 w-12 place-items-center rounded-full transition-colors",
    "max-sm:h-8 max-sm:w-14 max-sm:transition-all max-sm:duration-200",
    active ? "bg-brand-soft max-sm:bg-brand max-sm:text-brand-fg max-sm:shadow-[0_2px_6px_-3px_color-mix(in_srgb,var(--brand)_50%,transparent)]" : "max-sm:group-active:scale-95",
  );

function Tab({ active, icon: Icon, label }) {
  return (
    <>
      <span className={iconWrap(active)}>
        <Icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
      </span>
      <span className="max-w-full truncate">{label}</span>
    </>
  );
}

/**
 * Bottom navigation below lg (the sidebar takes over from there).
 * Full width and docked to the bottom edge; on phones it is taller, with a filled active pill.
 * "More" opens the remaining pages (a bottom sheet on phones, the drawer on tablets).
 */
export default function MobileTabBar({ drawerOpen, onOpenDrawer }) {
  const { pathname } = useLocation();
  const inTabs = TABS.some(({ to }) => isTabActive(to, pathname));
  const moreActive = drawerOpen || !inTabs;

  return (
    <nav
      aria-label="Main"
      className={cn(
        "mobile-tabbar fixed inset-x-0 bottom-0 z-[var(--z-tabbar)] border-t border-line pb-[env(safe-area-inset-bottom)] lg:hidden",
        // Tablets keep their original look
        "sm:bg-surface/95 sm:backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-xl items-stretch gap-1 px-2 py-1.5 sm:h-[var(--tabbar-h)] sm:py-1">
        {TABS.map(({ to, label, icon }) => {
          const active = !drawerOpen && isTabActive(to, pathname);
          return (
            <Link key={to} to={to} aria-current={active ? "page" : undefined} className={tabClass(active)}>
              <Tab active={active} icon={icon} label={label} />
            </Link>
          );
        })}
        <button type="button" onClick={onOpenDrawer} aria-expanded={drawerOpen} aria-haspopup="dialog" aria-label="More pages" className={tabClass(moreActive)}>
          <Tab active={moreActive} icon={MoreIcon} label="More" />
        </button>
      </div>
    </nav>
  );
}
