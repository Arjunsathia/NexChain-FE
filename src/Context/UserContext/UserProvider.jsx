import React, { useCallback, useState } from "react";
import { UserContext } from "./UserContext";
import { getById } from "@/api/axiosConfig";
import { jwtDecode } from "jwt-decode";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
  const decodedToken = token ? jwtDecode(token) : {};
  const userIdFromToken = decodedToken?.id;
  const userDataFromLocalStorage = localStorage.getItem("NEXCHAIN_USER");

  const fetchUsers = useCallback(async () => {
    const parsedUserDataFromLocalStorage = JSON.parse(userDataFromLocalStorage);
    if (parsedUserDataFromLocalStorage?.id) {
      setUser(parsedUserDataFromLocalStorage);
    } else {
      try {
        setLoading(true);
        const data = await getById("/users", userIdFromToken);
        setUser(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [userDataFromLocalStorage, userIdFromToken]);

  return (
    <UserContext.Provider value={{ user, loading, fetchUsers }}>
      {children}
    </UserContext.Provider>
  );
};
