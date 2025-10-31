import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useUserContext from "@/Context/UserContext/useUserContext";
import useRoleContext from "@/Context/RoleContext/useRoleContext";

export default function MainLayout() {
  const { fetchUsers } = useUserContext();
  const { fetchRole } = useRoleContext();

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-[#0b182d] to-black">
      <Navbar />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}