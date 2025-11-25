import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useUserContext from "@/Context/UserContext/useUserContext";
import useRoleContext from "@/Context/RoleContext/useRoleContext";

export default function MainLayout() {
  const { fetchUsers } = useUserContext();
  const { fetchRole } = useRoleContext();

  const isLoggedIn = !!localStorage.getItem("NEXCHAIN_USER_TOKEN");
  const navigate = useNavigate();

  // 💡 State for Dark Mode
  const [isDark, setIsDark] = useState(() => {
    // Initialize based on localStorage or default to dark
    return localStorage.getItem("theme") === "light" ? false : true;
  });

  // 💡 Function to toggle Dark Mode globally
  const toggleDarkMode = () => {
    setIsDark(prevIsDark => {
      const newIsDark = !prevIsDark;
      if (newIsDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newIsDark;
    });
  };

  // Set initial theme based on state
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);


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
    : "bg-gradient-to-br from-gray-50 via-cyan-50 to-gray-200"; // Perfect Light Gradient

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass}`}>
      {/* 💡 Passing isDark and toggleDarkMode to Navbar */}
      <Navbar isDark={isDark} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}