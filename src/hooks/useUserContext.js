import { useSelector, useDispatch } from "react-redux";
import { fetchUser, setUser, setAccessToken } from "@/redux/slices/userSlice";
import { useCallback } from "react";

const useUserContext = () => {
  const { user, accessToken, status, loading, error } = useSelector(
    (state) => state.user,
  );
  const dispatch = useDispatch();
  const fetchUsers = useCallback(() => dispatch(fetchUser()), [dispatch]);
  const updateUser = useCallback(
    (userData) => dispatch(setUser(userData)),
    [dispatch],
  );
  const setToken = useCallback(
    (token) => dispatch(setAccessToken(token)),
    [dispatch],
  );

  return {
    user,
    accessToken,
    status,
    isAuthenticated: status === "authenticated",
    loading,
    error,
    fetchUsers,
    updateUser,
    setToken,
  };
};

export default useUserContext;
