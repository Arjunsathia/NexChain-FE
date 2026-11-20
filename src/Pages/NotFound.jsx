import { Link } from "react-router-dom";
import useSessionStatus from "@/hooks/useSessionStatus";
import Brand from "@/Components/ui/brand";

/** Unknown address: signed-in people go back to the app, everyone else to the home page */
const NotFound = () => {
  const { status } = useSessionStatus();
  const signedIn = status === "authenticated";

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
      <Brand to={signedIn ? "/dashboard" : "/"} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-6xl font-black text-brand">404</p>
        <h1 className="text-xl font-bold">Page not found</h1>
        <p className="max-w-sm text-sm text-fg-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-2 sm:w-auto sm:max-w-none sm:flex-row">
          <Link
            to={signedIn ? "/dashboard" : "/"}
            className="button-primary inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white"
          >
            {signedIn ? "Go to dashboard" : "Back to home"}
          </Link>
          <Link
            to={signedIn ? "/learning" : "/public-learning"}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-5 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover"
          >
            Browse guides
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
