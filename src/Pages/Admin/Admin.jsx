import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import MobileNavbar from "./Components/MobileNavbar";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

function Admin() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const isLight = useThemeCheck();

  useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      // Close mobile menu when switching to desktop
      if (desktop && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMobileMenuOpen]);

  return (
    <div className={`min-h-screen flex font-sans selection:bg-cyan-500/30 ${isLight ? "text-gray-900" : "text-white"}`}>
      {/* Show Sidebar only on desktop - Fixed position */}
      {isDesktop && (
        <div className="sticky top-0 h-screen flex-shrink-0 p-4 z-50">
          <Sidebar />
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Show MobileNavbar only on small and medium screens */}
        {!isDesktop && (
          <div className="sticky top-0 z-50">
            <MobileNavbar
              isOpen={isMobileMenuOpen} 
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            />
          </div>
        )}
        
        {/* Page content - Scrollable area */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Admin;
