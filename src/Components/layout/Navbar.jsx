import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, User, ChevronRight, Rocket } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
// import logo from "../../assets/Img/logo.png";
import useUserContext from "@/Context/UserContext/useUserContext";
import useRoleContext from "@/Context/RoleContext/useRoleContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { role } = useRoleContext();

  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Close mobile UI when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
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

  // Updated isActive function to handle admin routes
  const isActive = (path) => {
    if (path === "/admin") {
      // For admin, check if current path starts with /admin
      return location.pathname.startsWith("/admin");
    }
    // For other routes, use exact match
    return location.pathname === path;
  };

  const toggleDarkMode = () => {
    setIsDark((s) => !s);
    document.documentElement.classList.toggle("dark");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`
          bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl px-4 sm:px-6 py-3 my-2 mx-2 sm:mx-4 
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
            className="lg:hidden p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-600 hover:border-cyan-400/30 fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {isMobileMenuOpen ? (
              <X size={18} className="text-gray-300 hover:text-cyan-400 transition-colors" />
            ) : (
              <Menu size={18} className="text-gray-300 hover:text-cyan-400 transition-colors" />
            )}
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 focus:outline-none transition-transform duration-300 hover:scale-105 fade-in"
            style={{ animationDelay: "0.3s" }}
            aria-label="Go to home"
          >
            <div className="hidden sm:flex items-center justify-center fade-in" style={{ animationDelay: "0.4s" }}>
              <Rocket className="h-6 w-6 text-cyan-400 transform hover:scale-110 transition-transform duration-300 hover:rotate-12" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 fade-in" style={{ animationDelay: "0.5s" }}>
              NexChain
            </span>
          </button>
        </div>

        {/* Center: Full Desktop navigation (lg and up) */}
        <div className="hidden lg:flex items-center justify-center gap-1 text-sm font-medium text-gray-300 flex-1">
          {navItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`
                cursor-pointer transition-all duration-300 whitespace-nowrap px-4 py-2 rounded-xl mx-1 fade-in
                border border-transparent hover:border-cyan-400/30
                ${
                  isActive(item.path)
                    ? "bg-cyan-600/20 text-cyan-400 border-cyan-400/30 shadow-lg"
                    : "hover:text-cyan-300 hover:bg-gray-700/30"
                }
              `}
              style={{ animationDelay: `${0.6 + index * 0.05}s` }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right: dark toggle, profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Rocket Icon - Visible on mobile */}
          <div className="sm:hidden flex items-center justify-center mr-1 fade-in" style={{ animationDelay: "0.7s" }}>
            <Rocket className="h-5 w-5 text-cyan-400 transform hover:scale-110 transition-transform duration-300" />
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-600 hover:border-cyan-400/30 flex-shrink-0 fade-in"
            style={{ animationDelay: "0.8s" }}
            title="Toggle Dark Mode"
            aria-pressed={isDark}
          >
            {isDark ? (
              <Sun size={18} className="text-yellow-400 hover:text-yellow-300 transition-colors" />
            ) : (
              <Moon size={18} className="text-gray-300 hover:text-cyan-400 transition-colors" />
            )}
          </button>

          {/* Profile avatar */}
          <button
            onClick={() => user?.id && navigate(`/user-profile/${user.id}`)}
            title={user?.name || "User Profile"}
            className={`
              w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center 
              font-bold text-white hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 
              shadow-lg hover:shadow-xl transform hover:scale-105 border border-cyan-400/30 fade-in
            `}
            style={{ animationDelay: "0.9s" }}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden
            />

            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 border-r border-gray-700 z-[60] lg:hidden shadow-2xl backdrop-blur-sm fade-in"
              role="dialog"
              aria-modal="true"
            >
              <div className="h-full bg-gray-900/95 border-r border-gray-700 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 fade-in" style={{ animationDelay: "0.1s" }}>
                  <div className="flex items-center gap-3">
                    <Rocket className="h-6 w-6 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      NexChain
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 border border-gray-600 hover:border-cyan-400/30 fade-in"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <X size={18} className="text-gray-300 hover:text-cyan-400 transition-colors" />
                  </button>
                </div>

                {/* User Profile Section */}
                <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700 fade-in" style={{ animationDelay: "0.3s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-sm truncate fade-in" style={{ animationDelay: "0.4s" }}>
                        {user?.name || "User"}
                      </p>
                      <p className="text-cyan-400 text-xs capitalize font-medium fade-in" style={{ animationDelay: "0.45s" }}>
                        {role}
                      </p>
                      <p className="text-gray-400 text-xs truncate fade-in" style={{ animationDelay: "0.5s" }}>
                        {user?.email}
                      </p>
                    </div>
                    {/* Rocket Icon in Mobile Menu */}
                    <Rocket className="h-6 w-6 text-cyan-400 fade-in" style={{ animationDelay: "0.55s" }} />
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 mb-8">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4 border border-transparent fade-in
                        ${
                          isActive(item.path)
                            ? "bg-cyan-600/20 text-cyan-400 border-cyan-400/30 shadow-lg"
                            : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-cyan-400/30"
                        }
                      `}
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      <span className="flex-1 font-medium">{item.label}</span>
                      <ChevronRight
                        size={16}
                        className={
                          isActive(item.path)
                            ? "text-cyan-400"
                            : "text-gray-400"
                        }
                      />
                    </motion.button>
                  ))}
                </nav>

                {/* Bottom Actions */}
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gray-800/50 p-4 rounded-xl hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center gap-3 text-white border border-gray-600 hover:border-cyan-400/30 fade-in"
                    style={{ animationDelay: "0.9s" }}
                  >
                    {isDark ? (
                      <Sun size={18} className="text-yellow-400" />
                    ) : (
                      <Moon size={18} className="text-gray-300" />
                    )}
                    <span className="font-medium">
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </span>
                  </button>
                  
                  {/* Additional action button */}
                  <button
                    onClick={() => {
                      navigate('/learning');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 text-white border border-cyan-400/30 shadow-lg hover:shadow-xl fade-in"
                    style={{ animationDelay: "1s" }}
                  >
                    <Rocket size={18} className="text-white" />
                    <span className="font-medium">Start Learning</span>
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