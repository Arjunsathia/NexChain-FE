import Navbar from "./Navbar";
import Footer from "./Footer";
import { useOutlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, Suspense } from "react";
import useUserContext from "@/hooks/useUserContext";
import useRoleContext from "@/hooks/useRoleContext";
import { motion, AnimatePresence } from "framer-motion";
import ChatbotWidget from "@/Components/Common/ChatbotWidget";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";

const LayoutLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

export default function MainLayout() {
  const { fetchUsers } = useUserContext();
  const { fetchRole } = useRoleContext();
  const { markVisited } = useVisitedRoutes();

  const location = useLocation();
  // Capture the current outlet element (frozen route)
  const element = useOutlet();

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

  // Mark current route as visited
  useEffect(() => {
    markVisited(location.pathname);
  }, [location.pathname, markVisited]);

  const pageKey = location.pathname.startsWith("/admin")
    ? "admin"
    : location.pathname.startsWith("/user")
      ? "user"
      : location.pathname;



  // Scroll to top instantly when the pathname changes (navigation start)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [location.pathname]);

  return (
    <div className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col relative isolate transition-colors duration-300 scroll-smooth">
      { }
      <div
        className="fixed inset-0 -z-20 transition-opacity duration-500 ease-in-out bg-layer-light"
        style={{
          background: "linear-gradient(to top left, #ffffff, #f8fafc, #eff6ff)",
        }}
      />
      <div
        className="fixed inset-0 -z-20 transition-opacity duration-500 ease-in-out bg-layer-dark"
        style={{
          background:
            "linear-gradient(to bottom right, #000000, #0b182d, #000000)",
        }}
      />

      <Navbar />

      <main className="flex-1 p-2 sm:p-4 transition-colors duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} // Slightly longer but smoother
            className="w-full h-full"
          >
            <Suspense fallback={<LayoutLoader />}>{element}</Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      { }
      <ChatbotWidget />
    </div>
  );
}
