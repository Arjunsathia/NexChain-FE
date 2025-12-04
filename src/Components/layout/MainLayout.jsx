import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useUserContext from "@/Context/UserContext/useUserContext";
import useRoleContext from "@/Context/RoleContext/useRoleContext";

import { useTheme } from "@/Context/ThemeContext";

export default function MainLayout() {
  const { fetchUsers } = useUserContext();
  const { fetchRole } = useRoleContext();
  const { isDark, toggleTheme } = useTheme();

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

  // 💡 Gradient classes switched based on isDark state
  const backgroundClass = isDark
    ? "bg-gradient-to-br from-black via-[#0b182d] to-black" // Original Dark Gradient
    : "bg-gradient-to-tl from-white via-slate-50 to-blue-50"; // 💨 Subtle Premium Cool Gradient

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass}`}>
      {/* 💡 Passing isDark and toggleDarkMode to Navbar */}
      <Navbar isDark={isDark} toggleDarkMode={toggleTheme} />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}