import { useMemo } from 'react';
import { useSelector } from "react-redux";

const useCoinContext = () => {
  const { coins, loading, error, lastUpdated } = useSelector((state) => state.coins);
  
  // Standard view: Filter out frozen coins
  const activeCoins = useMemo(() => {
    // Safety check in case coins is null/undefined
    if (!Array.isArray(coins)) return [];
    return coins.filter(c => !c.isFrozen);
  }, [coins]);

  return {
    coins: activeCoins,
    allCoins: coins, // Use this for Admin panels
    coinsLoading: loading,
    error,
    lastUpdated
  };
};

export default useCoinContext;
