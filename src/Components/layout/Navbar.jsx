import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, User, ChevronRight, Rocket, Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useUserContext from "@/Context/UserContext/useUserContext";
import useRoleContext from "@/Context/RoleContext/useRoleContext";
import NotificationModal from "@/Components/Common/NotificationModal";
import api from "@/api/axiosConfig";

const SERVER_URL = "http://localhost:5050";

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

  // 💡 Theme Classes Helper - BORDER ADDED (Subtle/Themed)
  const TC = useMemo(() => ({
    // Border Class (Removed)
    borderThemed: "border-none",
    
    // Base/Container Styles 
    bgNavbar: isDarkMode
      ? "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20"
      : "bg-white/80 backdrop-blur-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)]",
    textBase: isDarkMode ? "text-gray-300" : "text-gray-700",
    
    // Hover/Interactive
    hoverBg: isDarkMode 
      ? "hover:bg-gray-700/60 hover:shadow-lg hover:shadow-cyan-500/10" 
      : "hover:bg-gray-100/80 hover:shadow-md",
    
    // Icons & Mobile Toggle
    iconBase: isDarkMode ? "text-gray-300" : "text-gray-700",
    iconHover: isDarkMode ? "hover:text-cyan-400" : "hover:text-blue-600",
    borderToggle: "", 
    
    // Logo/Brand
    brandGradient: isDarkMode ? "bg-gradient-to-r from-cyan-400 to-blue-500" : "bg-gradient-to-r from-blue-600 to-cyan-700",
    
    // Active Navigation Item
    activeBg: isDarkMode ? "bg-cyan-600/20 shadow-lg shadow-cyan-500/20" : "bg-blue-100/70 shadow-md",
    activeText: isDarkMode ? "text-cyan-400" : "text-blue-700",
    
    // Profile Button
    bgProfile: isDarkMode ? "from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" : "from-blue-700 to-cyan-800 hover:from-blue-600 hover:to-cyan-700",
    borderProfile: "", 
    
    // Mobile Menu Drawer
    bgDrawer: isDarkMode ? "bg-gray-900/95 backdrop-blur-xl shadow-2xl border-none" : "bg-white/95 backdrop-blur-xl shadow-2xl border-none",
    
    // Mobile User Card
    bgMobileCard: isDarkMode ? "bg-gray-800/50 shadow-inner" : "bg-gray-100/50 shadow-inner",
    textMobileRole: isDarkMode ? "text-cyan-400" : "text-blue-600",
    textMobileName: isDarkMode ? "text-white" : "text-gray-900",
    textMobileEmail: isDarkMode ? "text-gray-400" : "text-gray-600",
    
    // Mobile Nav Item
    bgMobileNavHover: isDarkMode 
      ? "hover:bg-gray-700/60 hover:text-white hover:shadow-lg hover:shadow-cyan-500/10" 
      : "hover:bg-gray-100/60 hover:text-blue-700 hover:shadow-md",
    textMobileNavInactive: isDarkMode ? "text-gray-300" : "text-gray-700",

    // Mobile Bottom Actions
    bgBottomAction: isDarkMode 
      ? "bg-gray-800/50 hover:bg-gray-700/60 hover:shadow-lg text-white" 
      : "bg-gray-100/50 hover:bg-gray-200/60 hover:shadow-md text-gray-800",
    
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

  const getUserImage = (user) => {
    if (!user?.image) return null;
    return user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`;
  };

  return (
    <>
      <nav
        className={`
          ${TC.bgNavbar} ${TC.borderThemed} rounded-xl px-4 sm:px-6 py-3 my-2 mx-2 sm:mx-4
          flex items-center justify-between gap-3 relative transition-all duration-700 ease-out fade-in
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
            <div className="hidden sm:flex items-center justify-center fade-in">
              <Rocket className={`h-6 w-6 ${TC.activeText} transform hover:scale-110 transition-transform duration-300 hover:rotate-12`} />
            </div>
            <span className={`text-xl sm:text-2xl font-bold text-transparent bg-clip-text ${TC.brandGradient} fade-in`}>
              NexChain
            </span>
          </button>
        </div>

        {/* Center: Full Desktop navigation (lg and up) */}
        <div className={`hidden lg:flex items-center justify-center gap-1 text-sm font-medium ${TC.textBase} flex-1`}>
          {navItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`
                cursor-pointer transition-all duration-300 whitespace-nowrap px-4 py-2 rounded-xl mx-1 fade-in
                transform hover:scale-105
                ${
                  isActive(item.path)
                    ? `${TC.activeBg} ${TC.activeText}`
                    : `${TC.hoverBg} ${TC.textBase} ${TC.iconHover}`
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right: dark toggle, profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
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
            <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} isDark={isDarkMode} />
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={`
              w-11 h-6 rounded-full p-0.5 flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50
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
            {getUserImage(user) ? (
              <img 
                src={getUserImage(user)} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() || <User size={16} className="text-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay + drawer (small and medium screens only) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden
            />

            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed left-0 top-0 h-full w-80 z-[60] lg:hidden shadow-2xl ${TC.bgDrawer} ${TC.borderThemed}`}
              role="dialog"
              aria-modal="true"
            >
              <div className={`h-full p-6`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Rocket className={`h-6 w-6 ${TC.activeText}`} />
                    <h2 className={`text-2xl font-bold text-transparent bg-clip-text ${TC.brandGradient}`}>
                      NexChain
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className={`p-2 rounded-xl transition-all duration-200 ${TC.hoverBg} transform hover:scale-110`}
                  >
                    <X size={18} className={`${TC.iconBase} ${TC.iconHover} transition-colors`} />
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
                  className={`w-full text-left mb-6 p-4 rounded-xl ${TC.bgMobileCard} transition-transform active:scale-95`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${isDarkMode ? "from-cyan-600 to-blue-600" : "from-blue-600 to-cyan-700"} flex items-center justify-center font-bold text-white text-lg shadow-lg overflow-hidden`}>
                      {getUserImage(user) ? (
                        <img 
                          src={getUserImage(user)} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || "U"
                      )}
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
                    {/* Rocket Icon in Mobile Menu */}
                    <Rocket className={`h-6 w-6 ${TC.activeText}`} />
                  </div>
                </button>

                {/* Navigation */}
                <nav className="space-y-2 mb-8">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4
                        transform hover:translate-x-2
                        ${
                          isActive(item.path)
                            ? `${TC.activeBg} ${TC.activeText}`
                            : `${TC.textMobileNavInactive} ${TC.bgMobileNavHover}`
                        }
                      `}
                    >
                      <span className="flex-1 font-medium">{item.label}</span>
                      <ChevronRight
                        size={16}
                        className={
                          isActive(item.path)
                            ? TC.activeText
                            : TC.textSecondary
                        }
                      />
                    </motion.button>
                  ))}
                </nav>

                {/* Bottom Actions - Only Dark Mode Toggle */}
                <div className="absolute bottom-6 left-6 right-6">
                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full p-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${TC.bgBottomAction} transform hover:scale-105`}
                  >
                    {isDarkMode ? (
                      <Sun size={18} className="text-yellow-400" />
                    ) : (
                      <Moon size={18} className="text-gray-700" />
                    )}
                    <span className="font-medium">
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