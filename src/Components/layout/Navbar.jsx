import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, User, ChevronRight, Rocket, Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useUserContext from "@/hooks/useUserContext";
import useRoleContext from "@/hooks/useRoleContext";
import NotificationModal from "@/Components/Common/NotificationModal";
import api from "@/api/axiosConfig";
import { useTheme } from "@/hooks/useTheme";

export default function Navbar() {
  const { toggleTheme } = useTheme(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { role } = useRoleContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef(null);

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
        // console.error("Failed to fetch notifications", error);
      }
    };
    if (user) {
      fetchUnreadCount();
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
          bg-[var(--nav-bg)] border-none rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-2 my-2 mx-2 sm:mx-4
          flex items-center justify-between gap-3 relative transition-all duration-200 ease-out fade-in
          backdrop-blur-xl shadow-sm
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
          {/* Mobile & Tablet Menu Toggle */}
          <button
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileMenuOpen((s) => !s)}
            className={`lg:hidden p-2 rounded-xl transition-all duration-300 hover:bg-[var(--nav-hover-bg)] text-[var(--nav-text)] fade-in active:scale-90 flex flex-col justify-center items-center gap-1.5 w-10 h-10`}
          >
            <motion.span
              animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className={`w-5 h-0.5 rounded-full bg-[var(--nav-text)]`}
            />
            <motion.span
              animate={isMobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              className={`w-5 h-0.5 rounded-full bg-[var(--nav-text)]`}
            />
            <motion.span
              animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className={`w-5 h-0.5 rounded-full bg-[var(--nav-text)]`}
            />
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 focus:outline-none transition-transform duration-300 hover:scale-105 fade-in"
            aria-label="Go to home"
          >
            {/* Rocket Icon */}
            <div className={`hidden sm:flex items-center justify-center fade-in bg-gradient-to-tr from-cyan-500 to-blue-600 p-1.5 rounded-lg shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300`}>
              <Rocket className="h-4 w-4 text-white" />
            </div>
            
            <span className={`text-xl sm:text-2xl font-bold text-[var(--foreground)] font-outfit tracking-tight flex items-baseline relative`}>
              <span>Ne</span>
              <span className="text-3xl mx-0.5 font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] transform translate-y-[1px] inline-block">
                X
              </span>
              <span>Chain</span>
            </span>
          </button>
        </div>

        {/* Center: Full Desktop navigation */}
        <div className={`hidden lg:flex items-center justify-center gap-1 text-sm font-medium text-[var(--nav-text)] flex-1`}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`
                  relative overflow-hidden group px-4 py-1.5 rounded-xl mx-0.5 lg:mx-1 transition-all duration-300
                  ${active ? 'bg-[var(--nav-item-active-bg)] shadow-md' : 'hover:bg-[var(--nav-hover-bg)] hover:shadow-sm'}
                `}
              >
                <span className={`relative z-10 transition-colors duration-300 font-semibold ${active ? 'text-[var(--nav-item-active-text)]' : 'text-[var(--nav-text)] group-hover:text-[var(--nav-hover-text)]'}`}>
                  {item.label}
                </span>
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
                hover:bg-[var(--nav-hover-bg)] text-[var(--nav-text)] hover:text-[var(--nav-hover-text)]
              `}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--background)]"></span>
              )}
            </button>
            <NotificationModal 
              isOpen={isNotificationOpen} 
              onClose={() => setIsNotificationOpen(false)} 
              triggerRef={bellRef}
            />
          </div>

          {/* Dark mode toggle - CSS Based State with Background Swap */}
          <button
            onClick={toggleTheme}
            className={`
              relative w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              bg-[var(--card-bg)] border border-[var(--card-border)] transition-colors duration-300
              flex items-center
            `}
            title="Toggle Dark Mode"
          >
            <div
              className="w-4 h-4 bg-white dark:bg-gray-200 rounded-full shadow-sm flex items-center justify-center toggle-knob"
            >
              <div className="show-in-light">
                <Sun size={12} className="text-yellow-500" />
              </div>
              <div className="show-in-dark">
                <Moon size={12} className="text-blue-600" />
              </div>
            </div>
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
              w-9 h-9 rounded-xl 
              !bg-gray-100 border border-gray-300 dark:!bg-gray-800 dark:border-gray-600
              flex items-center justify-center
              font-bold text-gray-700 dark:text-gray-200 transition-all duration-300
              shadow-lg hover:shadow-xl transform hover:scale-110 fade-in overflow-hidden
            `}
          >
            {user?.name?.charAt(0).toUpperCase() || <User size={16} className="text-[var(--nav-text)]" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
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
            />

            <motion.aside
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 35, stiffness: 350, mass: 0.8 }}
              className={`fixed left-0 top-0 h-[100dvh] w-[85vw] max-w-[320px] z-[60] lg:hidden shadow-2xl bg-[var(--background)] border-r border-[var(--border)]`}
            >
              <div className={`h-full p-6 flex flex-col items-center`}>
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Rocket className={`h-6 w-6 text-[var(--primary)]`} />
                    <h2 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600`}>
                      NexChain
                    </h2>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className={`p-2 rounded-xl hover:bg-[var(--nav-hover-bg)] text-[var(--nav-text)]`}>
                    <X size={20} />
                  </button>
                </div>

                <button 
                  onClick={() => user?.id ? handleNavigate(`/user-profile/${user.id}`) : handleNavigate("/auth")}
                  className={`w-full text-left mb-8 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] group`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-700 flex items-center justify-center font-bold text-white text-lg`}>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[var(--foreground)] font-semibold text-sm truncate`}>{user?.name || "User"}</p>
                      <p className={`text-[var(--primary)] text-xs capitalize font-medium`}>{role}</p>
                    </div>
                  </div>
                </button>

                <nav className="w-full space-y-4 mb-2 flex-1">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 + (index * 0.04) }}
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        w-full text-left py-3 px-4 rounded-xl transition-all duration-200 flex items-center gap-4
                        ${isActive(item.path) ? 'bg-[var(--nav-item-active-bg)] text-[var(--nav-item-active-text)] font-semibold' : 'text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] font-medium'}
                      `}
                    >
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight size={16} className={isActive(item.path) ? "text-[var(--primary)]" : "opacity-50"} />
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}