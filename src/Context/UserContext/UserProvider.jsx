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
    // Read fresh data from storage
    const storedToken = localStorage.getItem("NEXCHAIN_USER_TOKEN");
    const storedUser = localStorage.getItem("NEXCHAIN_USER");
    
    // 1. Load from LocalStorage (Fast)
    if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) setUser(parsed);
    }

    // 2. Fetch Fresh Data from Server (Reliable)
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const uId = decoded?.id;
        
        if (uId) {
             // Only set loading if we didn't have local data
            if (!storedUser) setLoading(true);
            
            const data = await getById("/users", uId);
            if (data) {
                setUser(data);
                localStorage.setItem("NEXCHAIN_USER", JSON.stringify(data));
            }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, fetchUsers }}>
      {children}
    </UserContext.Provider>
  );
};
