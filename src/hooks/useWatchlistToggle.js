import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getData, postForm, deleteWatchList } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";

// The API has returned the list bare and wrapped over time; accept every shape
const toList = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.watchlist) ? res.watchlist : [];

// Fields the watchlist model stores (it requires image, symbol and current_price)
const toWatchlistItem = (coin) => ({
  id: coin.id,
  name: coin.name,
  image: coin.image,
  symbol: coin.symbol,
  current_price: coin.current_price,
  price_change_percentage_1h_in_currency: coin.price_change_percentage_1h_in_currency,
  price_change_percentage_24h_in_currency: coin.price_change_percentage_24h_in_currency,
  price_change_percentage_24h: coin.price_change_percentage_24h,
  price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
  market_cap: coin.market_cap,
  total_volume: coin.total_volume,
  sparkline_in_7d: { price: coin.sparkline_in_7d?.price },
});

/**
 * The signed-in user's watchlist (shared cache with the dashboard card) and an
 * optimistic toggle that rolls back if the server rejects the change.
 */
export default function useWatchlistToggle() {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const key = useMemo(() => ["watchlist", user?.id], [user?.id]);

  const { data = [], isLoading, isError } = useQuery({
    queryKey: key,
    queryFn: async () => toList(await getData("/watchlist", { user_id: user.id })),
    enabled: !!user?.id,
    staleTime: 30_000,
  });
  const ids = useMemo(() => new Set(data.map((item) => item.id)), [data]);

  /**
   * Adds or removes a coin. `silent` skips the default toast (the watchlist
   * page shows its own with an Undo button). Resolves to whether it succeeded.
   */
  const toggle = useCallback(
    async (coin, { silent = false } = {}) => {
      if (!user?.id) {
        toast.error("Please sign in to manage your watchlist");
        return false;
      }
      // Read the cache rather than the last render, so a quick undo sees the removal
      const previous = queryClient.getQueryData(key) || [];
      const removing = previous.some((item) => item.id === coin.id);
      queryClient.setQueryData(
        key,
        removing ? previous.filter((item) => item.id !== coin.id) : [...previous, toWatchlistItem(coin)],
      );

      try {
        if (removing) await deleteWatchList("/watchlist/remove", { id: coin.id, user_id: user.id });
        else await postForm("/watchlist/add", toWatchlistItem(coin));
        if (!silent) {
          toast.success(`${coin.symbol?.toUpperCase()} ${removing ? "removed from" : "added to"} watchlist`, {
            id: `watch-${coin.id}`,
          });
        }
        return true;
      } catch {
        queryClient.setQueryData(key, previous);
        toast.error("Couldn't update your watchlist. Please try again.");
        return false;
      } finally {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
    [key, queryClient, user?.id],
  );

  return { items: data, ids, toggle, count: data.length, loading: isLoading, isError };
}
