import { Navigate, Outlet } from "react-router-dom";
import SessionLoader from "./SessionGate";
import useSessionStatus from "@/hooks/useSessionStatus";

export default function AuthRoute() {
  const { status, checking } = useSessionStatus();
  if (checking) return <SessionLoader />;
  return status === "authenticated" ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
