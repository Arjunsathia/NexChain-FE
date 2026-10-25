import { Navigate, Outlet } from "react-router-dom";
import SessionLoader from "./SessionGate";
import useSessionStatus from "@/hooks/useSessionStatus";

export default function ProtectedRoute() {
  const { status, checking } = useSessionStatus();
  if (checking) return <SessionLoader />;
  return status === "authenticated" ? <Outlet /> : <Navigate to="/auth" replace />;
}
