import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { postForm, setMemoryToken } from "@/api/axiosConfig";
import { setSession } from "@/redux/slices/userSlice";

/**
 * Store a session returned by the API and open the dashboard. The access token
 * stays in memory; the refresh cookie restores it on reload.
 */
export const useCompleteLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return useCallback(
    (res) => {
      setMemoryToken(res.accessToken);
      dispatch(setSession({ user: res.user, accessToken: res.accessToken }));
      navigate("/dashboard");
    },
    [dispatch, navigate],
  );
};

/** "Try the demo": the API creates a private sandbox account and signs in as it */
const useDemoLogin = () => {
  const completeLogin = useCompleteLogin();
  const [loading, setLoading] = useState(false);

  const startDemo = useCallback(async () => {
    setLoading(true);
    const toastId = toast.loading("Setting up your demo workspace…");
    try {
      const res = await postForm("/auth/demo");
      toast.success("Welcome! You have $10,000 in virtual funds.", { id: toastId });
      completeLogin(res);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (!err.response
          ? "We couldn't connect to the server. Please try again shortly."
          : "The demo isn't available right now.");
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [completeLogin]);

  return { startDemo, loading };
};

export default useDemoLogin;
