import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Menu,
  X,
  User,
  ChevronRight,
  Bell,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Star,
  Newspaper,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useUserContext from "@/hooks/useUserContext";
import useRoleContext from "@/hooks/useRoleContext";
import NotificationModal from "@/Components/Common/NotificationModal";
import { logout } from "@/redux/slices/userSlice";
import api, { SERVER_URL } from "@/api/axiosConfig";
import { useTheme } from "@/hooks/useTheme";
import useThemeCheck from "@/hooks/useThemeCheck";
import SiteLogo from "../../assets/Img/logo.png";
import SiteLogoLight from "../../assets/Img/logo-2.png";

function NavbarComponent() {
  const { toggleTheme } = useTheme();
  const isLight = useThemeCheck();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { role } = useRoleContext();
  const { balance } = useSelector((state) => state.wallet);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let interval;
    const fetchUnreadCount = async () => {
      if (!user) return;
      try {
        const res = await api.get("/notifications");
        const count = Array.isArray(res.data)
          ? res.data.filter((n) => !n.isRead).length
          : 0;
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    if (user) {
      fetchUnreadCount();
      interval = setInterval(fetchUnreadCount, 60000);

      // Listen for socket events to refresh immediately
      window.addEventListener("refreshNotifications", fetchUnreadCount);
    } else {
      setUnreadCount(0);
    }

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("refreshNotifications", fetchUnreadCount);
    };
  }, [user]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Nav items logic
  const TC = useMemo(
    () => ({
      // Removing main nav background
      navContainer: "bg-transparent",

      // New Shared Capsule Style for all 3 islands
      capsule: isLight
        ? "bg-white/80 backdrop-blur-xl shadow-sm border border-slate-200/60 glass-card"
        : "bg-gray-900/90 backdrop-blur-xl shadow-none border border-white/10 glass-card",

      textPrimary: isLight ? "text-slate-900" : "text-white",
      textSecondary: isLight ? "text-slate-600" : "text-slate-400",

      // Navigation Links
      linkIdle: isLight
        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
        : "text-slate-400 hover:text-cyan-400 hover:bg-white/5",

      linkActive: isLight
        ? "text-blue-700 bg-blue-50 font-bold"
        : "text-cyan-400 bg-cyan-950/30 font-bold",

      actionBtnHover: isLight
        ? "hover:bg-slate-100 text-slate-700"
        : "hover:bg-white/10 text-slate-200",
      logoGradient: "from-blue-600 to-cyan-500",
      textGradient:
        "bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent",
    }),
    [isLight],
  );

  const navItems = useMemo(
    () => [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/cryptolist", label: "Markets", icon: TrendingUp },
      { path: "/portfolio", label: "Portfolio", icon: Briefcase },
      { path: "/watchlist", label: "Watchlist", icon: Star },
      { path: "/news", label: "News", icon: Newspaper },
      { path: "/learning", label: "Learn", icon: GraduationCap },
      ...(role === "admin" || role === "superadmin"
        ? [{ path: "/admin", label: "Admin", icon: ShieldCheck }]
        : []),
    ],
    [role],
  );

  // Optimistic Navigation State
  const [activeTab, setActiveTab] = useState(location.pathname);

  // Sync activeTab with location (handles back/forward button)
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const handleNavClick = useCallback(
    (path) => {
      setActiveTab(path); // Instant visual update
      navigate(path);
      setIsMobileMenuOpen(false);
    },
    [navigate],
  );

  const isTabActive = (path) => {
    // Special case for dashboard root
    if (path === "/dashboard") {
      return activeTab === "/dashboard" || activeTab === "/";
    }
    return activeTab.startsWith(path);
  };

  return (
    <>
      <nav
        className={`
                    relative mx-2 sm:mx-6 mt-4 z-50
                    transition-all duration-500 ease-out
                    ${TC.navContainer}
                    ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
                `}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)", // Force GPU layer
        }}
      >
        <div className="relative flex items-center justify-between max-w-[1600px] mx-auto w-full h-full">
          {/* Left Island - Branding */}
          <div
            className={`relative z-20 rounded-full ${TC.capsule} h-[52px] flex items-center px-4 gap-3 sm:gap-4`}
          >
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 -ml-2 rounded-full transition-all duration-200 ${TC.actionBtnHover}`}
              aria-label="Open Menu"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>

            <div
              onClick={() => handleNavClick("/")}
              className="flex items-center justify-center h-full group cursor-pointer"
            >
              <img
                src={isLight ? SiteLogoLight : SiteLogo}
                alt="NexChain"
                className="h-8 sm:h-10 w-auto object-contain transition-all duration-300"
              />
            </div>
          </div>

          {/* Center Island - Navigation */}
          <div
            className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 px-2 h-[52px] rounded-full ${TC.capsule} z-10`}
          >
            {navItems.map((item) => {
              const active = isTabActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`
                                        relative px-6 py-2.5 rounded-full text-sm font-bold transition-colors duration-200 
                                        outline-none select-none
                                        ${active ? "text-white" : TC.textSecondary + (isLight ? " hover:text-slate-900" : " hover:text-white")}
                                    `}
                >
                  {active && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg rounded-full -z-0"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Island - Actions */}
          <div
            className={`flex items-center gap-2 relative z-20 rounded-full ${TC.capsule} h-[52px] px-2.5`}
          >
            {user && (
              <div className="relative">
                <button
                  ref={bellRef}
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${TC.actionBtnHover} relative`}
                >
                  <Bell size={20} strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-[9px] font-black text-white border-1 dark:border-gray-900 shadow-[0_0_10px_rgba(6,182,212,0.4)] animate-in zoom-in duration-300">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationModal
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  triggerRef={bellRef}
                />
              </div>
            )}

            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${TC.actionBtnHover}`}
              aria-label="Toggle Theme"
            >
              {isLight ? (
                <Moon size={20} className="text-indigo-600" />
              ) : (
                <Sun size={20} className="text-amber-400" />
              )}
            </button>

            <button
              onClick={() =>
                user?.id
                  ? navigate(`/user-profile/${user.id}`)
                  : navigate("/auth")
              }
              className="ml-1 w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-blue-500/50 transition-all duration-300 shadow-md"
            >
              {user?.image ? (
                <img
                  src={
                    user.image.startsWith("http")
                      ? user.image
                      : `${SERVER_URL}/uploads/${user.image}`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`;
                  }}
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${TC.logoGradient} text-white font-bold text-sm`}
                >
                  <User size={18} />
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-[2000] lg:hidden sm:backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`fixed top-0 left-0 h-[100dvh] w-[280px] z-[2001] lg:hidden shadow-2xl flex flex-col p-6 transform-gpu ${isLight ? "bg-white" : "bg-gray-950"}`}
                style={{
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Drawer Content */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center justify-start">
                    <img
                      src={isLight ? SiteLogoLight : SiteLogo}
                      alt="NexChain"
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-2 rounded-lg ${TC.actionBtnHover}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                  {navItems.map((item) => {
                    const active = isTabActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center justify-between p-4 mb-2 rounded-2xl transition-all duration-300 group
                          ${active
                            ? isLight
                              ? "bg-blue-50/80 text-blue-600 shadow-sm shadow-blue-500/10 ring-1 ring-blue-500/20"
                              : "bg-gradient-to-r from-blue-900/30 to-blue-800/10 text-cyan-400 border border-blue-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                            : isLight
                              ? "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                              : "text-slate-400 hover:bg-white/5 hover:text-white"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`p-2 rounded-xl transition-all duration-300 ${active
                              ? isLight
                                ? "bg-white text-blue-600 shadow-sm"
                                : "bg-cyan-500/10 text-cyan-400"
                              : isLight
                                ? "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm group-hover:text-blue-600"
                                : "bg-white/5 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300"
                              }`}
                          >
                            <item.icon size={18} strokeWidth={2} />
                          </div>
                          <span className={`font-semibold text-[15px] ${active ? "tracking-wide" : ""}`}>
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`transition-transform duration-300 ${active
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                            }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* User Section at Bottom */}
                <div
                  className={`mt-auto p-5 rounded-3xl border backdrop-blur-xl relative overflow-hidden group
                    ${isLight
                      ? "bg-white/60 border-slate-200/60 shadow-lg shadow-slate-200/50"
                      : "bg-gray-900/40 border-white/5 shadow-2xl shadow-black/20"
                    }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="flex items-center gap-4 mb-5 relative z-10">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white/10 shadow-lg">
                        {user?.image ? (
                          <img
                            src={
                              user.image.startsWith("http")
                                ? user.image
                                : `${SERVER_URL}/uploads/${user.image}`
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${TC.logoGradient} text-white`}>
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-gray-950 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-base font-bold truncate ${TC.textPrimary}`}>
                        {user?.name || "Guest User"}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLight ? "bg-slate-100 text-slate-500 border border-slate-200" : "bg-white/5 text-slate-400 border border-white/5"
                          }`}>
                          {role || "Visitor"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (user) {
                        dispatch(logout());
                        navigate("/auth");
                        setIsMobileMenuOpen(false);
                      } else {
                        navigate("/auth");
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 border mt-2
                      ${user
                        ? isLight
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-red-900/30 text-red-400 hover:bg-red-900/10"
                        : "bg-blue-600 text-white border-transparent hover:bg-blue-700"
                      }`}
                  >
                    {user && <LogOut size={16} />}
                    {user ? "Logout" : "Login"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

const Navbar = React.memo(NavbarComponent);
export default Navbar;
