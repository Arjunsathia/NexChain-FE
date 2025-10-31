import { Navigate, Outlet } from "react-router-dom";

export default function AuthRoute() {
  const isLoggedIn = !!localStorage.getItem("NEXCHAIN_USER_TOKEN");
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
