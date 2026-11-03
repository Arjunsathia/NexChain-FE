import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import "@/Components/Landing/public.css";
import "@/Components/Landing/public-orbit.css";

/** Native document scrolling; no canvas loop, scroll hijacking, or nested scroll area. */
export default function AnimatedLayout() {
  const { pathname } = useLocation();
  const { markVisited } = useVisitedRoutes();
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    document.documentElement.classList.add("public-pages");
    return () => {
      document.documentElement.classList.remove("public-pages");
      window.history.scrollRestoration = previous;
    };
  }, []);
  useEffect(() => {
    markVisited(pathname);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, markVisited]);
  return <div className="public-shell"><Outlet /></div>;
}
