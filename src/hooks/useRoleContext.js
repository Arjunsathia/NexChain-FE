import { useSelector } from "react-redux";

// The role comes from the server session, never from a client-side token decode
const useRoleContext = () => {
  const role = useSelector((state) => state.user.user?.role);

  return {
    role,
    isAdmin: role === "admin" || role === "superadmin",
  };
};

export default useRoleContext;
