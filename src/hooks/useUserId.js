import useUserContext from "@/Context/UserContext/useUserContext";



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
  
  // Priority: Context user -> LocalStorage user
  // Handle both 'id' and '_id' fields
  const userId = user?.id || user?._id || localStorageUser?.id || localStorageUser?._id;
  
  if (!userId) {
    console.warn("⚠️ No user ID found in context or localStorage");
  }
  
  return userId;
};