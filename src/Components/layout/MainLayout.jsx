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

  // Animation variants for instant parallel transition (cross-fade)
  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 1, // Removed zoom for performance
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.1, // Ultra-fast
        ease: "linear", // Linear is perceptually fastest for short durations
      },
    },
    exit: {
      opacity: 0,
      scale: 1,
      transition: {
        duration: 0.1, // Ultra-fast
        ease: "linear",
      },
    },
  };

  // Scroll to top instantly when the pathname changes (navigation start)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
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

      {/* Grid container allows overlapping (parallel) transitions */}
      <main className="flex-1 p-2 sm:p-4 transition-colors duration-300 grid grid-cols-1 grid-rows-1">
        <AnimatePresence>
          <motion.div
            key={pageKey}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full col-start-1 row-start-1 bg-transparent"
            style={{ willChange: "opacity" }}
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
