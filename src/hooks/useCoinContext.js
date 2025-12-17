import { useSelector } from "react-redux";

const useCoinContext = () => {
  const { coins, loading, error } = useSelector((state) => state.coins);
  return {
    coins,
    coinsLoading: loading,
    error
  };
};

export default useCoinContext;
