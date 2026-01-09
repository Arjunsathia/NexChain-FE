import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "@/redux/slices/userSlice";
import { refreshBalance } from "@/redux/slices/walletSlice";
import {
  fetchPurchasedCoins,
  fetchTransactionHistory,
} from "@/redux/slices/portfolioSlice";
import { fetchCoins } from "@/redux/slices/coinSlice";

const DataLoader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchCoins());

    const interval = setInterval(() => {
      dispatch(fetchCoins());
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(refreshBalance());
      dispatch(fetchPurchasedCoins());
      dispatch(fetchTransactionHistory());
    }
  }, [dispatch, user?.id]);

  return null;
};

export default DataLoader;
