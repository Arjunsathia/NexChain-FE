import { useSelector, useDispatch } from "react-redux";
import { fetchPurchasedCoins, fetchTransactionHistory, addPurchase, sellCoins } from "@/redux/slices/portfolioSlice";

export const usePurchasedCoins = () => {
  const { purchasedCoins, transactionHistory, loading, error } = useSelector((state) => state.portfolio);
  const dispatch = useDispatch();

  const refetch = () => {
      dispatch(fetchPurchasedCoins());
      dispatch(fetchTransactionHistory());
  };

  return {
    purchasedCoins: Array.isArray(purchasedCoins) ? purchasedCoins : [],
    transactionHistory: Array.isArray(transactionHistory) ? transactionHistory : [],
    loading,
    error,
    refetch,
    refreshPurchasedCoins: () => dispatch(fetchPurchasedCoins()), // Alias
    refreshTransactionHistory: () => dispatch(fetchTransactionHistory()), // Alias
    addPurchase: async (data) => {
        try {
            const res = await dispatch(addPurchase(data)).unwrap();
            return res;
        } catch (err) {
            return { success: false, error: err };
        }
    },
    sellCoins: async (data) => {
        try {
            const res = await dispatch(sellCoins(data)).unwrap();
            return res;
        } catch (err) {
            return { success: false, error: err };
        }
    }
  };
};