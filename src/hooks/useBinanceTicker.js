import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  subscribeAll,
  subscribeCoin,
  getAllSnapshot,
  getCoinSnapshot,
  trackCoin,
} from "@/lib/tickerStore";

export { getBinancePair as coinToSymbol } from "@/utils/coinRegistry";

/** All live prices keyed by CoinGecko id; re-renders once per batch */
export function useBinanceTicker() {
  return useSyncExternalStore(subscribeAll, getAllSnapshot);
}

/**
 * Live price for one coin; re-renders only when that coin updates.
 * Pass `symbol` to stream coins outside the core list.
 */
export function useLivePrice(coinId, symbol) {
  useEffect(() => {
    if (coinId) trackCoin(coinId, symbol);
  }, [coinId, symbol]);

  const subscribe = useCallback((listener) => subscribeCoin(coinId, listener), [coinId]);
  const getSnapshot = useCallback(() => getCoinSnapshot(coinId), [coinId]);
  return useSyncExternalStore(subscribe, getSnapshot);
}
