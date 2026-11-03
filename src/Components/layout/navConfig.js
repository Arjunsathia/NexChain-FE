import {
  LayoutDashboard,
  CandlestickChart,
  Briefcase,
  Star,
  Newspaper,
  GraduationCap,
  ShieldCheck,
  Settings,
  LifeBuoy,
  UserRound,
} from "lucide-react";

// Single source for the sidebar, the mobile drawer and the search palette
export const NAV_GROUPS = [
  {
    label: "Trade",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/cryptolist", label: "Markets", icon: CandlestickChart },
      { to: "/portfolio", label: "Portfolio", icon: Briefcase },
      { to: "/watchlist", label: "Watchlist", icon: Star },
    ],
  },
  {
    label: "Discover",
    items: [
      { to: "/news", label: "News", icon: Newspaper },
      { to: "/learning", label: "Learn", icon: GraduationCap },
    ],
  },
];

export const ADMIN_ITEM = { to: "/admin", label: "Admin", icon: ShieldCheck };

export const ACCOUNT_ITEMS = [
  { to: "/user/settings", label: "Settings", icon: Settings },
  { to: "/user/support", label: "Support", icon: LifeBuoy },
];

export const profileItem = (userId) => ({ to: `/user-profile/${userId}`, label: "Profile", icon: UserRound });

/** Areas with their own tab header (admin console, account). Moving between
 *  their tabs keeps the shell mounted instead of re-animating the page. */
export const sectionKey = (pathname) =>
  pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/user") ? "account" : pathname;
