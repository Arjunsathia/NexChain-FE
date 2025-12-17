import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, User, ChevronRight, Rocket, Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useUserContext from "@/hooks/useUserContext";
import useRoleContext from "@/hooks/useRoleContext";
import NotificationModal from "@/Components/Common/NotificationModal";
import api from "@/api/axiosConfig";



import useThemeCheck from "@/hooks/useThemeCheck";

export default function Navbar({ isDark, toggleDarkMode }) {
  const isLight = useThemeCheck();
  const isDarkMode = !isLight; 

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { role } = useRoleContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef(null);

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    // Border Class (Matched with Footer: border-none)
    borderThemed: "border-none",
    
    // Base/Container Styles (Matched with Footer)
    bgNavbar: isDarkMode
      ? "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20"
      : "bg-white/60 backdrop-blur-xl shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]",
    textBase: isDarkMode ? "text-gray-400" : "text-gray-600",
    
    // Hover/Interactive
    hoverBg: isDarkMode 
      ? "hover:bg-white/5 hover:text-white transition-colors" 
      : "hover:bg-gray-100/80 hover:text-gray-900 transition-colors",
    
    // Icons & Mobile Toggle
    iconBase: isDarkMode ? "text-gray-400" : "text-gray-600",
    iconHover: isDarkMode ? "hover:text-cyan-400" : "hover:text-blue-600",
    
    // Logo/Brand - (Now handled in JSX, but keeping gradient for mobile if needed)
    brandGradient: "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600",
    
    // Active Navigation Item
    activeBg: isDarkMode 
      ? "bg-gradient-to-t from-cyan-900/60 via-cyan-800/40 to-cyan-500/10 border-b-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]" 
      : "bg-gradient-to-t from-blue-200/80 via-blue-100/50 to-blue-50/20 border-b-2 border-blue-500 text-blue-700 shadow-md",
    activeText: isDarkMode ? "text-cyan-300 font-bold" : "text-blue-700 font-bold",
    
    // Profile Button
    bgProfile: isDarkMode ? "from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-white/10" : "from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border border-gray-200",
    
    // Mobile Menu Drawer
    bgDrawer: isDarkMode ? "bg-[#0B0E14]/95 backdrop-blur-xl border-r border-white/5" : "bg-white/95 backdrop-blur-xl border-r border-gray-100",
    
    // Mobile User Card
    bgMobileCard: isDarkMode ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-gray-100",
    textMobileRole: isDarkMode ? "text-cyan-400" : "text-blue-600",
    textMobileName: isDarkMode ? "text-white" : "text-gray-900",
    textMobileEmail: isDarkMode ? "text-gray-400" : "text-gray-500",
    
    // Mobile Nav Item
    bgMobileNavHover: isDarkMode 
      ? "hover:bg-white/5 hover:text-white" 
      : "hover:bg-gray-50 hover:text-gray-900",
    textMobileNavInactive: isDarkMode ? "text-gray-400" : "text-gray-600",

    // Mobile Bottom Actions
    bgBottomAction: isDarkMode 
      ? "bg-white/5 hover:bg-white/10 text-white border border-white/5" 
      : "bg-gray-100 hover:bg-gray-200 text-gray-800",
  }), [isDarkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications');
        const count = res.data.filter(n => !n.isRead).length;
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    if (user) {
      fetchUnreadCount();
      // Optional: Poll every 60s
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close mobile UI when route changes
  useEffect(() => {
    if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
    }
  }, [location.pathname]);

  // Close with Escape key for better UX
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsNotificationOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isAdmin = role === "admin";

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/cryptolist", label: "Cryptocurrency" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/watchlist", label: "WatchList" },
    { path: "/learning", label: "Learning Hub" },
    ...(isAdmin ? [{ path: "/admin", label: "Admin" }] : []),
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname.startsWith("/admin");
    }
    // Handle root path check for /dashboard
    if (path === "/dashboard") {
        return location.pathname.startsWith("/dashboard") || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };



  return (
    <>
      <nav
        className={`
          ${TC.bgNavbar} ${TC.borderThemed} rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-2 my-2 mx-2 sm:mx-4
          flex items-center justify-between gap-3 relative transition-all duration-200 ease-out fade-in
          ${
            isMounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }
        `}
        style={{ animationDelay: "0.1s" }}
      >
        {/* Left: menu button (mobile & tablet) + logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mobile & Tablet Menu Toggle (small and medium screens only) */}
          <button
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileMenuOpen((s) => !s)}
            className={`lg:hidden p-2 rounded-xl transition-all duration-300 ${TC.hoverBg} fade-in active:scale-90 flex flex-col justify-center items-center gap-1.5 w-10 h-10`}
          >
            <motion.span
              initial={false}
              animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`w-5 h-0.5 rounded-full ${isDarkMode ? "bg-gray-300" : "bg-gray-700"}`}
            />
            <motion.span
              initial={false}
              animate={isMobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`w-5 h-0.5 rounded-full ${isDarkMode ? "bg-gray-300" : "bg-gray-700"}`}
            />
            <motion.span
              initial={false}
              animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`w-5 h-0.5 rounded-full ${isDarkMode ? "bg-gray-300" : "bg-gray-700"}`}
            />
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 focus:outline-none transition-transform duration-300 hover:scale-105 fade-in"
            aria-label="Go to home"
          >
            {/* Rocket Icon - Hidden on small screens, visible on sm and up */}
            <div className={`hidden sm:flex items-center justify-center fade-in bg-gradient-to-tr from-cyan-500 to-blue-600 p-1.5 rounded-lg shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300`}>
              <Rocket className="h-4 w-4 text-white" />
            </div>
            
            <span className={`text-xl sm:text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} font-outfit tracking-tight flex items-baseline relative`}>
              <span>Ne</span>
              <span className="text-3xl mx-0.5 font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] transform translate-y-[1px] inline-block">
                X
              </span>
              <span>Chain</span>
            </span>
          </button>
        </div>

        {/* Center: Full Desktop navigation (lg and up) - Water Fill Effect */}
        <div className={`hidden lg:flex items-center justify-center gap-1 text-sm font-medium ${TC.textBase} flex-1`}>
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`
                  relative overflow-hidden group px-4 py-1.5 rounded-xl mx-0.5 lg:mx-1 transition-all duration-300
                  ${active ? TC.activeBg : 'hover:shadow-md'}
                `}
              >
                {/* Text Content - Ensures z-index is above the fill */}
                <span className={`relative z-10 transition-colors duration-300 font-semibold ${active ? TC.activeText : `${TC.textBase} group-hover:${isDarkMode ? 'text-cyan-300' : 'text-blue-600'}`}`}>
                  {item.label}
                </span>

                {/* Water Fill Overlay */}
                {!active && (
                  <span 
                    className={`
                      absolute bottom-0 left-0 w-full bg-gradient-to-t 
                      ${isDarkMode ? 'from-cyan-900/40 via-cyan-800/20 to-transparent' : 'from-blue-200/60 via-blue-100/40 to-transparent'}
                      h-0 group-hover:h-full transition-all duration-300 ease-in-out
                    `}
                  />
                )}
                
                {/* Bottom Line (Cup base) - Optional subtle touch */}
                {!active && (
                   <span className={`absolute bottom-0 left-0 w-full h-[2px] ${isDarkMode ? 'bg-cyan-500/30' : 'bg-blue-400/30'} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 delay-75`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: dark toggle, profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                ${TC.hoverBg} ${TC.iconBase} ${TC.iconHover}
              `}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              )}
            </button>
            <NotificationModal 
              isOpen={isNotificationOpen} 
              onClose={() => setIsNotificationOpen(false)} 
              isDark={isDarkMode} 
              triggerRef={bellRef}
            />
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={`
              flex w-11 h-6 rounded-full p-0.5 items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              ${isDarkMode ? "bg-gray-700 justify-end" : "bg-cyan-100 justify-start"}
            `}
            title="Toggle Dark Mode"
            aria-pressed={isDarkMode}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
            >
              {isDarkMode ? (
                <Moon size={12} className="text-blue-600" />
              ) : (
                <Sun size={12} className="text-yellow-500" />
              )}
            </motion.div>
          </button>

          {/* Profile avatar */}
          <button
            onClick={() => {
              if (user?.id) {
                navigate(`/user-profile/${user.id}`);
              } else {
                navigate("/auth");
              }
            }}
            title={user?.name || "User Profile"}
            className={`
              w-9 h-9 rounded-xl bg-gradient-to-r ${TC.bgProfile} flex items-center justify-center
              font-bold text-white transition-all duration-300
              shadow-lg hover:shadow-xl transform hover:scale-110 fade-in overflow-hidden
            `}
          >
            {user?.name?.charAt(0).toUpperCase() || <User size={16} className="text-white" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay + drawer (small and medium screens only) */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden
            />

            <motion.aside
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 35, 
                stiffness: 350, 
                mass: 0.8 
              }}
              className={`fixed left-0 top-0 h-[100dvh] w-[85vw] max-w-[320px] z-[60] lg:hidden shadow-2xl ${TC.bgDrawer} ${TC.borderThemed}`}
              role="dialog"
              aria-modal="true"
            >
              <div className={`h-full p-6 flex flex-col items-center`}>
                {/* Header */}
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Rocket className={`h-6 w-6 ${TC.activeText}`} />
                    <h2 className={`text-2xl font-bold text-transparent bg-clip-text ${TC.brandGradient}`}>
                      NexChain
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className={`p-2 rounded-xl transition-all duration-200 ${TC.hoverBg} transform hover:scale-110 active:scale-95`}
                  >
                    <X size={20} className={`${TC.iconBase} ${TC.iconHover} transition-colors`} />
                  </button>
                </div>

                {/* User Profile Section */}
                <button 
                  onClick={() => {
                    if (user?.id) {
                      handleNavigate(`/user-profile/${user.id}`);
                    } else {
                      handleNavigate("/auth");
                    }
                  }}
                  className={`w-full text-left mb-8 p-3 rounded-xl ${TC.bgMobileCard} transition-all duration-200 active:scale-95 group`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${isDarkMode ? "from-cyan-600 to-blue-600" : "from-blue-600 to-cyan-700"} flex items-center justify-center font-bold text-white text-lg shadow-lg overflow-hidden group-hover:scale-105 transition-transform`}>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`${TC.textMobileName} font-semibold text-sm truncate`}>
                        {user?.name || "User"}
                      </p>
                      <p className={`${TC.textMobileRole} text-xs capitalize font-medium`}>
                        {role}
                      </p>
                      <p className={`${TC.textMobileEmail} text-xs truncate`}>
                        {user?.email}
                      </p>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${TC.textTertiary} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                  </div>
                </button>

                {/* Navigation */}
                <nav className="w-full space-y-4 mb-2 flex-1">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: 0.1 + (index * 0.04), // Staggered start
                        ease: "easeOut"
                      }}
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        w-full text-left py-3 px-4 rounded-xl transition-all duration-200 flex items-center gap-4
                        active:scale-[0.98]
                        ${
                          isActive(item.path)
                            ? `${TC.activeBg} ${TC.activeText} font-semibold shadow-sm`
                            : `${TC.textMobileNavInactive} ${TC.bgMobileNavHover} font-medium`
                        }
                      `}
                    >
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-300 ${
                          isActive(item.path)
                            ? `${TC.activeText} translate-x-1`
                            : `${TC.textSecondary} opacity-50`
                        }`}
                      />
                    </motion.button>
                  ))}
                </nav>

                {/* Bottom Actions - Only Dark Mode Toggle */}
                <div className="w-full pb-6 sm:pb-4 mt-auto">
                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-3/4 mx-auto p-2.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2 ${TC.bgBottomAction} transform active:scale-95 shadow-md text-sm`}
                  >
                    {isDarkMode ? (
                      <Sun size={16} className="text-yellow-400" />
                    ) : (
                      <Moon size={16} className="text-gray-700" />
                    )}
                    <span className="font-semibold">
                      {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}