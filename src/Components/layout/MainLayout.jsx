import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, Suspense } from "react";
import useUserContext from "@/hooks/useUserContext";
import useRoleContext from "@/hooks/useRoleContext";
import { motion } from "framer-motion";
import ChatbotWidget from "@/Components/Common/ChatbotWidget";

const LayoutLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

export default function MainLayout() {
  const { fetchUsers } = useUserContext();
  const { fetchRole } = useRoleContext();

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

  const pageKey = location.pathname.startsWith("/admin") ? "admin" : location.pathname.startsWith("/user") ? "user" : location.pathname;

  return (
    <div className="min-h-screen flex flex-col relative isolate transition-colors duration-300">
      { }
      <div
        className="fixed inset-0 -z-20 transition-opacity duration-500 ease-in-out bg-layer-light"
        style={{ background: "linear-gradient(to top left, #ffffff, #f8fafc, #eff6ff)" }}
      />
      <div
        className="fixed inset-0 -z-20 transition-opacity duration-500 ease-in-out bg-layer-dark"
        style={{ background: "linear-gradient(to bottom right, #000000, #0b182d, #000000)" }}
      />

      <Navbar />

      <main className="flex-1 p-2 sm:p-4 transition-colors duration-300">
        <motion.div
          key={pageKey}
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

      { }
      <ChatbotWidget />
    </div>
  );
}