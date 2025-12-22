import useUserContext from "@/hooks/useUserContext";



export const useUserId = () => {
  const { user } = useUserContext();
  
  const getLocalStorageUser = () => {
    try {
      const userData = localStorage.getItem("NEXCHAIN_USER");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };

  const localStorageUser = getLocalStorageUser();
  
  
  
  const userId = user?.id || user?._id || localStorageUser?.id || localStorageUser?._id;
  

  
  return userId;
};