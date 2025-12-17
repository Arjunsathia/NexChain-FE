import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "@/redux/slices/userSlice";
import { useCallback } from "react";

const useUserContext = () => {
  const { user, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fetchUsers = useCallback(() => dispatch(fetchUser()), [dispatch]);
  return { user, loading, error, fetchUsers };
};

export default useUserContext;
