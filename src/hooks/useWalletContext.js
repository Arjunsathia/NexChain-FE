import { useSelector, useDispatch } from "react-redux";
import {
  refreshBalance,
  setBalance,
  resetBalance,
} from "@/redux/slices/walletSlice";
import { useCallback } from "react";

const useWalletContext = () => {
  const { balance, loading, error } = useSelector((state) => state.wallet);
  const dispatch = useDispatch();

  const refreshBalanceFunc = useCallback(
    () => dispatch(refreshBalance()),
    [dispatch],
  );
  const setBalanceFunc = useCallback(
    (amount) => dispatch(setBalance(amount)),
    [dispatch],
  );
  const resetBalanceFunc = useCallback(
    () => dispatch(resetBalance()),
    [dispatch],
  );

  return {
    balance,
    loading,
    error,
    refreshBalance: refreshBalanceFunc,
    setBalance: setBalanceFunc,
    resetBalance: resetBalanceFunc,
  };
};

export default useWalletContext;
