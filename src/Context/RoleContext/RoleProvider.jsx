import React, { useCallback, useState } from "react";
import { RoleContext } from "./RoleContext";
import { jwtDecode } from "jwt-decode";
import useUserContext from "../UserContext/useUserContext";

export const RoleProvider = ({ children }) => {
  const { user } = useUserContext();
  const userId = user?.id;
  const [role, setRole] = useState();
  const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
  const decodedToken = token && jwtDecode(token);
  const userRoleFromToken = decodedToken?.role;

  const fetchRole = useCallback(async () => {
    if (userRoleFromToken && userId) {
      setRole(userRoleFromToken);
    }
  }, [userRoleFromToken, userId]);

  return (
    <RoleContext.Provider value={{ role, fetchRole }}>
      {children}
    </RoleContext.Provider>
  );
};
