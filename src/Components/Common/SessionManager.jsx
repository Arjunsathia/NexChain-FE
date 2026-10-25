import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { restoreSession, logout } from "@/redux/slices/userSlice";
import { SESSION_EXPIRED_EVENT } from "@/api/axiosConfig";

/**
 * Restores the session from the refresh cookie on startup, and signs the user
 * out (the route guards then redirect to /auth) when a refresh fails.
 */
const SessionManager = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    const onExpired = () => {
      dispatch(logout());
      queryClient.clear();
      toast.error("Your session has expired. Please log in again.", { id: "session-expired" });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [dispatch, queryClient]);

  return null;
};

export default SessionManager;
