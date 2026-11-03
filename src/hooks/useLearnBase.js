import { useLocation } from "react-router-dom";

/** "/public-learning" for signed-out visitors, "/learning" inside the app */
export default function useLearnBase() {
  return useLocation().pathname.startsWith("/public-learning") ? "/public-learning" : "/learning";
}
