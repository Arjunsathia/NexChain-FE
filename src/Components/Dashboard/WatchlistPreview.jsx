import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, ArrowRight } from "lucide-react";
import { getData } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import { Card, CardHeader, CardLink, EmptyState } from "@/Components/ui/card";
import { SkeletonRows } from "@/Components/ui/skeleton";
import LiveCoinRow from "@/Components/Crypto/LiveCoinRow";

// The API has returned the list bare and wrapped over time; accept every shape
const toList = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.watchlist) ? res.watchlist : [];

/** First few watchlist coins with live prices */
function WatchlistPreview() {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: async () => toList(await getData("/watchlist", { user_id: user.id })),
    enabled: !!user?.id,
    staleTime: 0, // show the cached list instantly, refresh in the background
  });
  const coins = data.slice(0, 5);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        icon={Star}
        title="Watchlist"
        subtitle={data.length ? `${data.length} coin${data.length > 1 ? "s" : ""}` : undefined}
        action={
          <CardLink onClick={() => navigate("/watchlist")}>
            View all <ArrowRight size={12} />
          </CardLink>
        }
      />
      {isLoading ? (
        <SkeletonRows rows={5} />
      ) : isError ? (
        <EmptyState icon={Star} title="Couldn't load your watchlist" description="Check your connection and try again." className="flex-1" />
      ) : coins.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Your watchlist is empty"
          description="Star coins on the Markets page to follow them here."
          className="flex-1"
          action={
            <button
              type="button"
              onClick={() => navigate("/cryptolist")}
              className="mt-2 rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-fg hover:bg-surface-hover"
            >
              Browse markets
            </button>
          }
        />
      ) : (
        <div className="divide-y divide-line">
          {coins.map((c) => (
            <LiveCoinRow
              key={c.id}
              id={c.id}
              symbol={c.symbol}
              name={c.name}
              image={c.image}
              price={c.current_price}
              change={c.price_change_percentage_24h}
              onClick={() => navigate(`/coin/coin-details/${c.id}`)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default memo(WatchlistPreview);
