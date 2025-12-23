import { useSelector, useDispatch } from "react-redux";
import { fetchUser, setUser } from "@/redux/slices/userSlice";
import { useCallback } from "react";

const useUserContext = () => {
  const { user, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fetchUsers = useCallback(() => dispatch(fetchUser()), [dispatch]);
  const updateUser = useCallback((userData) => dispatch(setUser(userData)), [dispatch]);

  return { user, loading, error, fetchUsers, updateUser };
};

export default useUserContext;
