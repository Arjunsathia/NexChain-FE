import { useSelector } from "react-redux";

const useCoinContext = () => {
  const { coins, loading, error, lastUpdated } = useSelector((state) => state.coins);
  
  // Standard view: Filter out frozen coins
  const activeCoins = coins.filter(c => !c.isFrozen);

  return {
    coins: activeCoins,
    allCoins: coins, // Use this for Admin panels
    coinsLoading: loading,
    error,
    lastUpdated
  };
};

export default useCoinContext;
