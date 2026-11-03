import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import useSessionStatus from "@/hooks/useSessionStatus";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import Brand from "@/Components/ui/brand";


/** Layout for public pages (the public learning hub): header and content */
export default function PublicLayout() {
  const { isLight, toggleTheme } = useTheme();
  const { status } = useSessionStatus();
  const { markVisited } = useVisitedRoutes();
  const location = useLocation();
  const signedIn = status === "authenticated";

  useEffect(() => {
    markVisited(location.pathname);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, markVisited]);

  return (
    <div className="public-content-shell flex min-h-screen flex-col bg-canvas text-fg">
      <header className="sticky top-0 z-30 h-[var(--topbar-h)] border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1200px] items-center gap-4 px-4">
          <Brand to="/" className="shrink-0" />
          <NavLink
            to="/public-learning"
            className={({ isActive }) => `hidden text-sm font-medium sm:block ${isActive ? "text-fg" : "text-fg-muted hover:text-fg"}`}
          >
            Learn
          </NavLink>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
              className="grid size-9 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {signedIn ? (
              <Link to="/dashboard" className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-fg hover:bg-brand-hover">
                Open app
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-fg hover:bg-surface-hover sm:block">
                  Sign in
                </Link>
                <Link to="/auth" className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-fg hover:bg-brand-hover">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {/* Pages add their own phone padding (px-3), as they do inside the app */}
      <main className="mx-auto w-full max-w-[1200px] flex-1 sm:px-4 sm:py-6">

        <Outlet />
      </main>
    </div>
  );
}
