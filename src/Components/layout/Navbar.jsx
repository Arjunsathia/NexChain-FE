import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
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
import ConfirmDialog from "@/Components/Common/ConfirmDialog";

function NavbarComponent() {
  const { toggleTheme } = useTheme();
  const isLight = useThemeCheck();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { role } = useRoleContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let interval;
    const fetchUnreadCount = async () => {
      if (!user?.id) return;
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

    if (user?.id) {
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

  const handleMobileLogout = () => {
    if (user?.id) {
      dispatch(logout());
      navigate("/auth");
      setIsMobileMenuOpen(false);
      setShowLogoutConfirm(false);
    } else {
      navigate("/auth");
    }
  };

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

      // Mobile Header Bar Style
      mobileHeader: isLight
        ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm"
        : "bg-[#0B1221]/80 backdrop-blur-xl border-b border-white/5", // Darker, sleeker mobile header

      // Desktop Capsule Style
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

  // Custom Hamburger Toggle
  const MobileToggle = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="p-2 -ml-2 rounded-lg transition-transform active:scale-95 group"
      aria-label="Toggle Menu"
    >
      <div className="w-6 h-5 flex flex-col justify-between relative cursor-pointer">
        <span
          className={`w-full h-[2.5px] rounded-full transform transition-all duration-300 origin-left ${isLight ? "bg-slate-800" : "bg-white"
            } ${isMobileMenuOpen ? "rotate-45" : ""}`}
        />
        <span
          className={`w-3/4 h-[2.5px] rounded-full transition-all duration-300 ${isLight ? "bg-slate-800" : "bg-cyan-500"
            } ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}
        />
        <span
          className={`w-full h-[2.5px] rounded-full transform transition-all duration-300 origin-left ${isLight ? "bg-slate-800" : "bg-white"
            } ${isMobileMenuOpen ? "-rotate-45" : ""}`}
        />
      </div>
    </button>
  );

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500 ease-out
          lg:static lg:bg-transparent lg:mt-4 lg:mx-6
          ${TC.navContainer}
          ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
        `}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)", // Force GPU layer
        }}
      >
        {/* Mobile Header Container (Full Width) */}
        <div className={`lg:hidden w-full h-[60px] px-6 flex items-center justify-between ${TC.mobileHeader}`}>
          <div className="flex items-center gap-3">
            <MobileToggle />
            <div onClick={() => handleNavClick("/")} className="cursor-pointer">
              <img
                src={isLight ? SiteLogoLight : SiteLogo}
                alt="NexChain"
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.id && (
              <div className="relative">
                <button
                  ref={bellRef}
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${TC.actionBtnHover}`}
                >
                  <Bell size={20} className={isLight ? "text-slate-700" : "text-slate-300"} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-white ring-2 ring-white dark:ring-[#0B1221] shadow-lg">
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
          </div>
        </div>


        {/* Desktop Container (Original Layout) */}
        <div className="hidden lg:relative lg:flex items-center justify-between max-w-[1600px] mx-auto w-full h-full">
          {/* Left Island - Branding */}
          <div
            className={`relative z-20 rounded-full ${TC.capsule} h-[52px] flex items-center px-4 gap-3 sm:gap-4`}
          >
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
            {user?.id && (
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





      {/* Mobile Sidebar (Premium Drawer) */}
      {
        createPortal(
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/60 z-[2000] lg:hidden backdrop-blur-[2px]"
                />

                {/* Drawer */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`
                    fixed top-0 left-0 h-[100dvh] w-[300px] z-[2001] lg:hidden 
                    flex flex-col p-6 shadow-2xl overflow-hidden
                    ${isLight
                      ? "bg-white/95 backdrop-blur-2xl border-r border-slate-200"
                      : "bg-[#0B1221]/95 backdrop-blur-2xl border-r border-white/5"}
                `}
                  style={{
                    willChange: "transform",
                  }}
                >

                  {/* Decorative Glows */}
                  {!isLight && (
                    <>
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
                      <div className="absolute top-[-20%] left-[-20%] w-[200px] h-[200px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
                      <div className="absolute bottom-[-10%] right-[-10%] w-[150px] h-[150px] bg-cyan-600/10 blur-[80px] rounded-full pointer-events-none" />
                    </>
                  )}

                  {/* Drawer Header & Profile */}
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    {user?.id ? (
                      <div
                        onClick={() => {
                          navigate(`/user-profile/${user.id}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/5 shadow-md">
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
                                <User size={18} />
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-[2px] border-[#0B1221]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}>
                            {user?.name || "User"}
                          </h4>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                            {role || "Member"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-start">
                        <img
                          src={isLight ? SiteLogoLight : SiteLogo}
                          alt="NexChain"
                          className="h-9 w-auto object-contain"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={toggleTheme}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${TC.actionBtnHover}`}
                        aria-label="Toggle Theme"
                      >
                        {isLight ? (
                          <Moon size={20} className="text-indigo-600" />
                        ) : (
                          <Sun size={20} className="text-amber-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar relative z-10 px-1">
                    {navItems.map((item) => {
                      const active = isTabActive(item.path);
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={`
                            w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                            ${active
                              ? isLight
                                ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                                : "bg-white/5 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/20"
                              : isLight
                                ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                            }
                        `}
                        >
                          {/* Active Indicator Line */}
                          {active && !isLight && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-500 to-cyan-500" />
                          )}

                          <div className="flex items-center gap-4">
                            <div
                              className={`p-2 rounded-lg transition-all duration-300 ${active
                                ? isLight
                                  ? "bg-white text-blue-600"
                                  : "bg-cyan-500/10 text-cyan-400"
                                : isLight
                                  ? "bg-slate-100/50 text-slate-500 group-hover:bg-white group-hover:text-blue-600"
                                  : "bg-white/5 text-slate-500 group-hover:text-cyan-400"
                                }`}
                            >
                              <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span className="text-[15px] pt-0.5">
                              {item.label}
                            </span>
                          </div>

                          {/* Arrow or Active Dot */}
                          {active ? (
                            <div className={`w-2 h-2 rounded-full ${isLight ? "bg-blue-500" : "bg-cyan-400 shadow-[0_0_5px_cyan]"}`} />
                          ) : (
                            <ChevronRight
                              size={14}
                              className={`opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${isLight ? "text-slate-400" : "text-slate-500"}`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Logout Section at Bottom */}
                  <div className="mt-6 relative z-10 mb-4 px-1">
                    <button
                      onClick={() => {
                        if (user?.id) {
                          setShowLogoutConfirm(true);
                        } else {
                          navigate("/auth");
                        }
                      }}
                      className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 border shadow-sm cursor-pointer
                      ${user?.id
                          ? isLight
                            ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                            : "border-red-900/30 text-red-400 hover:bg-red-900/20 bg-red-900/10"
                          : "bg-blue-600 text-white border-transparent hover:bg-blue-700 shadow-blue-500/20 shadow-lg"
                        }`}
                    >
                      {user?.id ? "Logout" : "Login"}
                      {user?.id && <LogOut size={14} />}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )
      }
      <ConfirmDialog
        show={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleMobileLogout}
        title="Sign Out?"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}

const Navbar = React.memo(NavbarComponent);
export default Navbar;
