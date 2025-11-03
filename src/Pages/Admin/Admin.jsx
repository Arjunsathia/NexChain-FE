import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import MobileNavbar from "./Components/MobileNavbar";

function Admin() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

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
    <div className="min-h-screen text-white flex">
      {/* Show Sidebar only on desktop - Fixed position */}
      {isDesktop && (
        <div className="sticky top-0 h-screen overflow-y-auto flex-shrink-0">
          <Sidebar />
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Show MobileNavbar only on small and medium screens */}
        {!isDesktop && (
          <MobileNavbar
            isOpen={isMobileMenuOpen} 
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          />
        )}
        
        {/* Page content - Scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Admin;