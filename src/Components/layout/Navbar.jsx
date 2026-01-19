import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, User, ChevronRight, Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useUserContext from "@/hooks/useUserContext";
import useRoleContext from "@/hooks/useRoleContext";
import NotificationModal from "@/Components/Common/NotificationModal";
import api, { SERVER_URL } from "@/api/axiosConfig";
import { useTheme } from "@/hooks/useTheme";
import useThemeCheck from "@/hooks/useThemeCheck";
import SiteLogo from "../../assets/Img/logo.png";
import SiteLogoLight from "../../assets/Img/logo-2.png";

function NavbarComponent() {
  const { toggleTheme } = useTheme();
  const isLight = useThemeCheck();
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
      { path: "/dashboard", label: "Dashboard" },
      { path: "/cryptolist", label: "Markets" },
      { path: "/portfolio", label: "Portfolio" },
      { path: "/watchlist", label: "Watchlist" },
      { path: "/learning", label: "Learn" },
      ...(role === "admin" || role === "superadmin"
        ? [{ path: "/admin", label: "Admin" }]
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
                transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
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

                <div className="flex-1 space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm font-medium ${isActive(item.path) ? TC.linkActive : TC.linkIdle}`}
                    >
                      {item.label}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>

                {/* User Section at Bottom */}
                <div
                  className={`mt-auto p-4 rounded-2xl ${isLight ? "bg-gray-50" : "bg-gray-900"}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                      <User size={16} />
                    </div>
                    <div className="truncate">
                      <p
                        className={`text-sm font-bold truncate ${TC.textPrimary}`}
                      >
                        {user?.name || "Guest"}
                      </p>
                      <p className={`text-xs ${TC.textSecondary}`}>
                        {role || "Visitor"}
                      </p>
                    </div>
                  </div>
                  {/* Stats Section */}
                  <div>
                    <h3
                      className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${isLight ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Quick Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 backdrop-blur-md ${isLight ? "bg-white/60 border border-blue-100 shadow-sm" : "bg-white/5 border border-white/5 shadow-inner"}`}
                      >
                        <div
                          className={`font-bold text-sm ${isLight ? "text-gray-900" : "text-white"}`}
                        >
                          $
                          {(Number(balance) || 0).toLocaleString("en-IN", {
                            active: true,
                            notation: "compact",
                            maximumFractionDigits: 1,
                          })}
                        </div>
                        <div
                          className={`text-[10px] font-medium ${isLight ? "text-gray-500" : "text-gray-400"}`}
                        >
                          Cash Balance
                        </div>
                      </div>
                      {/* Placeholder/Other stat */}
                      <div
                        className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 backdrop-blur-md ${isLight ? "bg-white/60 border border-blue-100 shadow-sm" : "bg-white/5 border border-white/5 shadow-inner"}`}
                      >
                        <div
                          className={`font-bold text-sm ${isLight ? "text-gray-900" : "text-white"}`}
                        >
                          {unreadCount}
                        </div>
                        <div
                          className={`text-[10px] font-medium ${isLight ? "text-gray-500" : "text-gray-400"}`}
                        >
                          Notifications
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      user ? navigate("/user/settings") : navigate("/auth")
                    }
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
                  >
                    {user ? "Settings" : "Login"}
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
