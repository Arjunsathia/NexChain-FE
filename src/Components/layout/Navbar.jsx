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
          bg-transparent border border-gray-700 shadow-lg rounded-xl px-4 sm:px-6 py-3 my-2 mx-2 sm:mx-4 
          flex items-center justify-between gap-3 relative transition-all duration-700 ease-out
          ${
            isMounted
              ? "opacity-100 translate-y-0 glow-fade"
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
            className="lg:hidden p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-600 hover:border-gray-500"
          >
            {isMobileMenuOpen ? (
              <X size={18} className="text-gray-300" />
            ) : (
              <Menu size={18} className="text-gray-300" />
            )}
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 focus:outline-none transition-transform duration-300 hover:scale-105"
            aria-label="Go to home"
          >
            <div className="hidden sm:flex items-center justify-center">
              <Rocket className="h-6 w-6 text-cyan-400 transform hover:scale-110 transition-transform duration-300 hover:rotate-12" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
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
                cursor-pointer transition-all duration-300 whitespace-nowrap px-4 py-2 rounded-xl mx-1
                border border-transparent hover:border-gray-600
                ${
                  location.pathname === item.path
                    ? "bg-cyan-600/20 text-cyan-400 border-cyan-400/30 shadow-lg"
                    : "hover:text-cyan-300 hover:bg-gray-700/30"
                }
                ${isMounted ? "opacity-100" : "opacity-0"}
              `}
              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right: dark toggle, profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Rocket Icon - Visible on mobile */}
          <div className="sm:hidden flex items-center justify-center mr-1">
            <Rocket className="h-5 w-5 text-cyan-400 transform hover:scale-110 transition-transform duration-300" />
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-600 hover:border-gray-500 flex-shrink-0"
            title="Toggle Dark Mode"
            aria-pressed={isDark}
          >
            {isDark ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-gray-300" />
            )}
          </button>

          {/* Profile avatar */}
          <button
            onClick={() => user?.id && navigate(`/user-profile/${user.id}`)}
            title={user?.name || "User Profile"}
            className={`
              w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center 
              font-bold text-white hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 
              shadow-lg hover:shadow-xl transform hover:scale-105 border border-cyan-400/30
              ${isMounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}
            `}
            style={{ animationDelay: "0.5s" }}
          >
            {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden
            />

            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-transparent border-r border-gray-700 z-[60] lg:hidden shadow-2xl backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
            >
              <div className="h-full bg-gray-900/95 border-r border-gray-700 p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Rocket className="h-6 w-6 text-cyan-400" />

                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      NexChain
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 border border-gray-600"
                  >
                    <X size={18} className="text-gray-300" />
                  </button>
                </div>

                {/* User Profile Section */}
                <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-lg">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-sm truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-cyan-400 text-xs capitalize font-medium">
                        {role}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {user?.email}
                      </p>
                    </div>
                    {/* Rocket Icon in Mobile Menu */}
                    <Rocket className="h-6 w-6 text-cyan-400" />
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
                        w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4 border border-transparent
                        ${
                          location.pathname === item.path
                            ? "bg-cyan-600/20 text-cyan-400 border-cyan-400/30 shadow-lg"
                            : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-600"
                        }
                      `}
                    >
                      <span className="flex-1 font-medium">{item.label}</span>
                      <ChevronRight
                        size={16}
                        className={
                          location.pathname === item.path
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
                    className="w-full bg-gray-800/50 p-4 rounded-xl hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center gap-3 text-white border border-gray-600 hover:border-yellow-400/30"
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
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
