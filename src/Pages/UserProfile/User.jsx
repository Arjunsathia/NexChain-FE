import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useState, useEffect, Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/Components/UserProfile/Sidebar";
import UserMobileNavbar from "@/Components/UserProfile/UserMobileNavbar";
import { logout } from "@/api/axiosConfig";

const UserLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

export default function User() {
  const navigate = useNavigate();

  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const isLight = useThemeCheck();

  useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      if (desktop && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);
      await logout();
    } catch (error) {
      console.error("Error While Logout", error);
    } finally {
      localStorage.removeItem("NEXCHAIN_USER_TOKEN");
      localStorage.removeItem("NEXCHAIN_USER");
      setIsLogoutLoading(false);
      navigate("/auth");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-start font-sans selection:bg-cyan-500/30 ${isLight ? "text-gray-900" : "text-white"}`}
    >
      { }
      {isDesktop && (
        <div className="sticky top-0 h-screen flex-shrink-0 z-40 hidden lg:flex items-start py-6 pl-4">
          <Sidebar onLogout={handleLogout} isLogoutLoading={isLogoutLoading} />
        </div>
      )}

      { }
      <div className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden">
        { }
        {!isDesktop && (
          <UserMobileNavbar
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onLogout={handleLogout}
            isLogoutLoading={isLogoutLoading}
          />
        )}
        <div className="flex-1 w-full max-w-[1600px] mx-auto overflow-x-hidden p-0 sm:p-4 pb-20 lg:pb-4">
          <Suspense fallback={<UserLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
