import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, Suspense } from "react";
import useUserContext from "@/hooks/useUserContext";
import useRoleContext from "@/hooks/useRoleContext";
import { AnimatePresence, motion } from "framer-motion";

import { useTheme } from "@/hooks/useTheme";

const LayoutLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

export default function MainLayout() {
  const { fetchUsers } = useUserContext();
  const { fetchRole } = useRoleContext();
  const { isDark, toggleTheme } = useTheme();
  
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("NEXCHAIN_USER_TOKEN");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    } else {
      fetchUsers();
      fetchRole();
    }
  }, [fetchUsers, isLoggedIn, navigate, fetchRole]);

  return (
    <div className="min-h-screen flex flex-col relative isolate">
      {/* 💡 Background Layers for Smooth Transition */}
      <div 
        className={`fixed inset-0 -z-20 transition-opacity duration-300 ease-in-out ${isDark ? "opacity-0" : "opacity-100"}`}
        style={{ background: "linear-gradient(to top left, #ffffff, #f8fafc, #eff6ff)" }} // Light Gradient
      />
      <div 
        className={`fixed inset-0 -z-20 transition-opacity duration-300 ease-in-out ${isDark ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(to bottom right, #000000, #0b182d, #000000)" }} // Dark Gradient
      />

      {/* 💡 Passing isDark and toggleDarkMode to Navbar */}
      <Navbar isDark={isDark} toggleDarkMode={toggleTheme} />
      
      <main className="flex-1 p-2 sm:p-4 transition-colors duration-300 overflow-hidden">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="w-full h-full"
        >
          <Suspense fallback={<LayoutLoader />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}