import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, User, ChevronRight, Rocket } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useUserContext from "@/Context/UserContext/useUserContext";
import useRoleContext from "@/Context/RoleContext/useRoleContext";

// Utility to check if light mode is active based on global class
const useThemeCheck = (initialDark) => {
    const [isDark, setIsDark] = useState(initialDark);

    useEffect(() => {
        setIsDark(initialDark);
    }, [initialDark]);

    return isDark;
};

export default function Navbar({ isDark, toggleDarkMode }) {
  const isDarkMode = useThemeCheck(isDark); 

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { role } = useRoleContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    // Base/Container Styles
    bgNavbar: isDarkMode
      ? "bg-gray-800/50 border border-gray-700 shadow-2xl"
      : "bg-white/90 border border-gray-300 shadow-xl",
    textBase: isDarkMode ? "text-gray-300" : "text-gray-700",
    
    // Hover/Interactive - Updated without borders
    hoverBg: isDarkMode 
      ? "hover:bg-gray-700/60 hover:shadow-lg" 
      : "hover:bg-gray-100/80 hover:shadow-md",
    
    // Icons & Mobile Toggle
    iconBase: isDarkMode ? "text-gray-300" : "text-gray-700",
    iconHover: isDarkMode ? "hover:text-cyan-400" : "hover:text-blue-600",
    borderToggle: isDarkMode ? "border-gray-600" : "border-gray-300",

    // Logo/Brand
    brandGradient: isDarkMode ? "bg-gradient-to-r from-cyan-400 to-blue-500" : "bg-gradient-to-r from-blue-600 to-cyan-700",
    
    // Active Navigation Item - Updated without borders
    activeBg: isDarkMode ? "bg-cyan-600/20 shadow-lg" : "bg-blue-100/70 shadow-md",
    activeText: isDarkMode ? "text-cyan-400" : "text-blue-700",
    
    // Profile Button
    bgProfile: isDarkMode ? "from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" : "from-blue-700 to-cyan-800 hover:from-blue-600 hover:to-cyan-700",
    borderProfile: isDarkMode ? "border-cyan-400/30" : "border-blue-700/50",

    // Mobile Menu Drawer
    bgDrawer: isDarkMode ? "bg-gray-900/95 border-r border-gray-700" : "bg-white/95 border-r border-gray-300",
    
    // Mobile User Card
    bgMobileCard: isDarkMode ? "bg-gray-800/50 border border-gray-700" : "bg-gray-100/50 border border-gray-300",
    textMobileRole: isDarkMode ? "text-cyan-400" : "text-blue-600",
    textMobileName: isDarkMode ? "text-white" : "text-gray-900",
    textMobileEmail: isDarkMode ? "text-gray-400" : "text-gray-600",
    
    // Mobile Nav Item - Updated without borders
    bgMobileNavHover: isDarkMode 
      ? "hover:bg-gray-700/60 hover:text-white hover:shadow-lg" 
      : "hover:bg-gray-100/60 hover:text-blue-700 hover:shadow-md",
    textMobileNavInactive: isDarkMode ? "text-gray-300" : "text-gray-700",

    // Mobile Bottom Actions
    bgBottomAction: isDarkMode 
      ? "bg-gray-800/50 border border-gray-600 hover:bg-gray-700/60 hover:shadow-lg text-white" 
      : "bg-gray-100/50 border border-gray-300 hover:bg-gray-200/60 hover:shadow-md text-gray-800",
    
  }), [isDarkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
          ${TC.bgNavbar} rounded-xl px-4 sm:px-6 py-3 my-2 mx-2 sm:mx-4
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
            className={`lg:hidden p-2 rounded-xl transition-all duration-300 border ${TC.borderToggle} ${TC.hoverBg} fade-in`}
          >
            {isMobileMenuOpen ? (
              <X size={18} className={`${TC.iconBase} ${TC.iconHover} transition-colors`} />
            ) : (
              <Menu size={18} className={`${TC.iconBase} ${TC.iconHover} transition-colors`} />
            )}
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
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl transition-all duration-300 border ${TC.borderToggle} ${TC.hoverBg} flex-shrink-0 fade-in transform hover:scale-110`}
            title="Toggle Dark Mode"
            aria-pressed={isDarkMode}
          >
            {isDarkMode ? (
              <Sun size={18} className="text-yellow-400 hover:text-yellow-300 transition-colors" />
            ) : (
              <Moon size={18} className="text-gray-700 hover:text-blue-600 transition-colors" />
            )}
          </button>

          {/* Profile avatar */}
          <button
            onClick={() => user?.id && navigate(`/user-profile/${user.id}`)}
            title={user?.name || "User Profile"}
            className={`
              w-9 h-9 rounded-xl bg-gradient-to-r ${TC.bgProfile} flex items-center justify-center
              font-bold text-white transition-all duration-300
              shadow-lg hover:shadow-xl transform hover:scale-110 border ${TC.borderProfile} fade-in
            `}
          >
            {user?.name?.charAt(0).toUpperCase() || <User size={16} className="text-white" />}
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
              className={`fixed left-0 top-0 h-full w-80 z-[60] lg:hidden shadow-2xl backdrop-blur-sm ${TC.bgDrawer}`}
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
                    className={`p-2 rounded-xl transition-all duration-200 border ${TC.borderToggle} ${TC.hoverBg} transform hover:scale-110`}
                  >
                    <X size={18} className={`${TC.iconBase} ${TC.iconHover} transition-colors`} />
                  </button>
                </div>

                {/* User Profile Section */}
                <div className={`mb-6 p-4 rounded-xl ${TC.bgMobileCard}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${isDarkMode ? "from-cyan-600 to-blue-600" : "from-blue-600 to-cyan-700"} flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
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
                    {/* Rocket Icon in Mobile Menu */}
                    <Rocket className={`h-6 w-6 ${TC.activeText}`} />
                  </div>
                </div>

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
                    className={`w-full p-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${TC.bgBottomAction} border transform hover:scale-105`}
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