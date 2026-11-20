import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { logoutUser } from "@/redux/slices/userSlice";
import useUserContext from "@/hooks/useUserContext";

/** Shown on every signed-in page while using a demo sandbox account: one link to sign up */
export default function DemoBanner() {
  const { user } = useUserContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createAccount = useCallback(async () => {
    await dispatch(logoutUser());
    queryClient.clear();
    navigate("/auth?mode=register", { replace: true });
  }, [dispatch, navigate, queryClient]);

  if (!user?.isDemo) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center border-b border-line bg-brand-soft px-4 text-center text-[13px]"
    >
      <button
        type="button"
        onClick={createAccount}
        className="inline-flex min-h-8 items-center gap-1 font-semibold text-brand underline-offset-2 hover:underline max-sm:text-xs sm:min-h-9"
      >
        {/* Phones: a short label so the strip stays slim */}
        <span className="font-medium text-fg-muted sm:hidden">Demo mode ·</span>
        <span className="sm:hidden">Sign up free</span>
        <span className="max-sm:hidden">Create a free account to keep your progress</span>
        <ArrowUpRight size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
