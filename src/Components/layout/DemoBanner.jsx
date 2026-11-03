import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical, ArrowUpRight } from "lucide-react";
import { logoutUser } from "@/redux/slices/userSlice";
import useUserContext from "@/hooks/useUserContext";

const hoursLeft = (expiresAt) => {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Number.isFinite(ms) ? Math.max(1, Math.ceil(ms / 3_600_000)) : null;
};

/** Shown on every signed-in page while using a demo sandbox account */
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
  const hours = user.demoExpiresAt ? hoursLeft(user.demoExpiresAt) : null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-line bg-brand-soft px-4 py-2 text-center text-xs text-fg sm:text-[13px]"
    >
      <span className="inline-flex items-center gap-1.5 font-semibold">
        <FlaskConical size={14} className="text-brand" aria-hidden="true" />
        Demo account
      </span>
      <span className="text-fg-muted">
        Virtual funds, private to you{hours ? ` · deleted in ${hours}h` : ""}
      </span>
      <button
        type="button"
        onClick={createAccount}
        className="inline-flex items-center gap-1 font-semibold text-brand underline-offset-2 hover:underline"
      >
        Create a free account to keep your progress
        <ArrowUpRight size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
