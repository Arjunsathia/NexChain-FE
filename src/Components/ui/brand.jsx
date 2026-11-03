import { Link } from "react-router-dom";
import { Orbit } from "lucide-react";
import { cn } from "@/utils/utils";

/** One brand signature across public pages, app navigation and mobile menus. */
export default function Brand({ to = "/dashboard", compact = false, className }) {
  return <Link to={to} aria-label="NexChain home" className={cn("app-brand", className)}>
    <span className="app-brand-symbol"><Orbit size={22} strokeWidth={1.65} /></span>
    {!compact && <span>NexChain<span className="app-brand-dot">.</span></span>}
  </Link>;
}
