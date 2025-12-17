import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useCallback } from "react";

const useRoleContext = () => {
  const { user } = useSelector((state) => state.user);
  
  let role = user?.role;

  if (!role) {
    const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
    if (token) {
        try {
            const decoded = jwtDecode(token);
            role = decoded.role;
        } catch(e) {}
    }
  }

  const fetchRole = useCallback(() => {}, []);

  return { role, fetchRole };
};

export default useRoleContext;
