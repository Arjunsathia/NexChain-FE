import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const isLoggedIn = !!localStorage.getItem("NEXCHAIN_USER_TOKEN");
  return isLoggedIn ? <Outlet /> : <Navigate to="/auth" replace />;
}
