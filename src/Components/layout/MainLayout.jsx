import Topbar from "./Topbar";
import DemoBanner from "./DemoBanner";
import { DesktopSidebar } from "./Sidebar";
import { sectionKey } from "./navConfig";

import { useOutlet, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import useUserContext from "@/hooks/useUserContext";
import ChatbotWidget from "@/Components/Common/ChatbotWidget";
import DataLoader from "@/Components/Common/DataLoader";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";

const SIDEBAR_KEY = "nexchain:sidebar-collapsed";
const SIDEBAR_WIDTH = { expanded: "240px", collapsed: "68px" };

const readCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
};

const LayoutLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="size-8 rounded-full border-2 border-line border-t-brand animate-spin" />
  </div>
);

export default function MainLayout() {
  const { fetchUsers } = useUserContext();
  const { markVisited } = useVisitedRoutes();
  const location = useLocation();
  const element = useOutlet();

  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, prev ? "0" : "1");
      } catch {
        // preference just won't persist
      }
      return !prev;
    });
  }, []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // ProtectedRoute guarantees a session here; refresh the full profile once
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    markVisited(location.pathname);
    setDrawerOpen(false);
  }, [location.pathname, markVisited]);

  // Start each page at the top
  useEffect(() => {
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  const pageKey = sectionKey(location.pathname);

  return (
    <div
      className="app-shell relative isolate min-h-screen w-full bg-canvas text-fg"
      style={{ "--sidebar-w": collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }}
    >
      {/* Market data and portfolio polling run only for signed-in pages */}
      <DataLoader />
      <DesktopSidebar collapsed={collapsed} onToggle={toggleSidebar} />

      <div className="flex min-h-screen flex-col transition-[padding] duration-200 ease-out lg:pl-[var(--sidebar-w)]">
        <Topbar drawerOpen={drawerOpen} onOpenDrawer={openDrawer} onCloseDrawer={closeDrawer} />
        <DemoBanner />

        {/* Bottom padding keeps the last rows clear of the floating chat button */}
        <main className="w-full min-w-0 flex-1 pb-24 sm:p-4 sm:pb-24 lg:p-6 lg:pb-24">
          {/* Fade the new page in; no exit animation, so navigation never waits */}
          <motion.div
            key={pageKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-full w-full"
          >
            <Suspense fallback={<LayoutLoader />}>{element}</Suspense>
          </motion.div>
        </main>
      </div>

      <ChatbotWidget />
    </div>
  );
}
