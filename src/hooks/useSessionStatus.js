import { useSelector } from "react-redux";

/** `checking` stays true until the startup session check has finished */
const useSessionStatus = () => {
  const status = useSelector((state) => state.user.status);
  return { status, checking: status === "idle" || status === "loading" };
};

export default useSessionStatus;
