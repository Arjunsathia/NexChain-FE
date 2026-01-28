import React, { useState, useEffect, Suspense } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/Components/Admin/Sidebar";
import MobileNavbar from "@/Components/Admin/MobileNavbar";

import useThemeCheck from "@/hooks/useThemeCheck";

const AdminLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

function Admin() {
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



  return (
    <div
      className={`min-h-screen flex items-start font-sans selection:bg-cyan-500/30 ${isLight ? "text-gray-900" : "text-white"} transition-colors duration-150`}
    >
      { }
      {isDesktop && (
        <div className="sticky top-0 h-screen flex-shrink-0 z-40 hidden lg:flex items-start py-6 pl-4">
          <Sidebar />
        </div>
      )}

      { }
      <div className="flex-1 flex flex-col min-h-screen relative min-w-0">
        { }
        {!isDesktop && (
          <MobileNavbar
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto overflow-x-hidden p-0 sm:p-4 pb-20 lg:pb-4">
          <Suspense fallback={<AdminLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Admin;
