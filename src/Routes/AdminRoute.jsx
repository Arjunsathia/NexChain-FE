import { Navigate, Outlet } from "react-router-dom";
import useRoleContext from "@/hooks/useRoleContext";

// UI guard only; every admin endpoint is also checked by the server
export default function AdminRoute() {
  const { isAdmin } = useRoleContext();
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
