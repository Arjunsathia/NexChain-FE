import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "@/redux/slices/userSlice";

/** The one logout used everywhere: server session, store, query cache, caches */
const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await dispatch(logoutUser());
    queryClient.clear(); // drops cached admin and user data
    navigate("/auth", { replace: true });
  }, [dispatch, navigate, queryClient]);
};

export default useLogout;
