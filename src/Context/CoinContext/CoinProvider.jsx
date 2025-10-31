import { CoinContext } from "./CoinContext";
import useLiveCoins from "@/hooks/useLiveCoins";

export const CoinProvider = ({ children }) => {
  const { data: coins = [], isLoading: coinsLoading } = useLiveCoins();

  return (
    <CoinContext.Provider value={{ coins, coinsLoading }}>
      {children}
    </CoinContext.Provider>
  );
};
