import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Star, SearchX } from "lucide-react";
import useCoinContext from "@/hooks/useCoinContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import useWatchlistToggle from "@/hooks/useWatchlistToggle";
import useSortedRows from "@/hooks/useSortedRows";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";
import { Card, EmptyState } from "@/Components/ui/card";
import { Delta } from "@/Components/ui/delta";
import { Skeleton, SkeletonRows } from "@/Components/ui/skeleton";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { Pagination, SearchInput } from "@/Components/ui/table";
import WatchlistTable from "@/Components/Watchlist/WatchlistTable";
import AddCoinsModal from "@/Components/Watchlist/AddCoinsModal";
import TradeModal from "@/Components/TradeModal";
import PriceAlertModal from "@/Components/Common/PriceAlertModal";
import { formatUSD } from "@/utils/format";
import { isStablecoin } from "@/utils/coinRegistry";

const PAGE_SIZE = 20;

const SORT_COLUMNS = {
  added: (c) => c.addedIndex,
  name: (c) => c.name?.toLowerCase(),
  price: (c) => c.current_price,
  h24: (c) => c.price_change_percentage_24h,
  d7: (c) => c.price_change_percentage_7d_in_currency,
  mcap: (c) => c.market_cap,
  holding: (c) => (c.holdingQuantity > 0 ? c.holdingQuantity * (c.current_price || 0) : null),
};

const Stat = ({ label, loading, children }) => (
  <div className="min-w-0 px-4 py-3.5">
    <p className="text-xs text-fg-subtle">{label}</p>
    {loading ? <Skeleton className="mt-1.5 h-5 w-20" /> : <div className="mt-1 flex min-w-0 items-center gap-2">{children}</div>}
  </div>
);

const Mover = ({ coin, change }) =>
  coin ? (
    <>
      <CoinAvatar src={coin.image} symbol={coin.symbol} size={20} />
      <span className="truncate text-base font-semibold text-fg">{coin.symbol?.toUpperCase()}</span>
      <Delta value={change} className="text-xs" />
    </>
  ) : (
    <span className="text-base font-semibold text-fg">–</span>
  );

/** Coins the user follows, with live prices and their position in each */
export default function Watchlist() {
  const { coins } = useCoinContext();
  const { purchasedCoins } = usePurchasedCoins();
  const { items, ids, toggle, loading, isError } = useWatchlistToggle();
  const live = useBinanceTicker();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [tradeCoin, setTradeCoin] = useState(null);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [alertCoin, setAlertCoin] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);

  // Saved items plus the latest market data and the user's holding in each
  const rows = useMemo(() => {
    const market = new Map(coins.map((c) => [c.id, c]));
    const held = new Map();
    purchasedCoins.forEach((p) => {
      const id = p.coin_id || p.coinId;
      held.set(id, (held.get(id) || 0) + (p.totalQuantity ?? p.quantity ?? 0));
    });
    return items.map((item, index) => ({
      ...item,
      ...(market.get(item.id) || {}),
      addedIndex: index,
      holdingQuantity: held.get(item.id) || 0,
    }));
  }, [items, coins, purchasedCoins]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((c) => c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const { sorted, sort, toggleSort } = useSortedRows(filtered, SORT_COLUMNS, { key: "added", dir: "desc" });
  useEffect(() => setPage(1), [query, sort]);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary at live prices
  const summary = useMemo(() => {
    const withChange = rows
      .map((c) => ({ coin: c, change: live[c.id]?.price_change_percentage_24h ?? c.price_change_percentage_24h }))
      .filter((r) => Number.isFinite(r.change));
    const byChange = [...withChange].sort((a, b) => b.change - a.change);
    const avg = withChange.length ? withChange.reduce((s, r) => s + r.change, 0) / withChange.length : null;
    const heldValue = rows.reduce(
      (sum, c) => sum + c.holdingQuantity * (live[c.id]?.current_price ?? c.current_price ?? 0),
      0,
    );
    return { avg, best: byChange[0], worst: byChange[byChange.length - 1], heldValue };
  }, [rows, live]);

  const remove = useCallback(
    async (coin) => {
      const ok = await toggle(coin, { silent: true });
      if (!ok) return;
      toast(
        (t) => (
          <span className="flex items-center gap-3">
            {coin.symbol?.toUpperCase()} removed from watchlist
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                toggle(coin, { silent: true });
              }}
              className="font-bold text-brand"
            >
              Undo
            </button>
          </span>
        ),
        { id: `watch-${coin.id}`, duration: 5000 },
      );
    },
    [toggle],
  );

  const openTrade = useCallback((coin) => {
    setTradeCoin(coin);
    setTradeOpen(true);
  }, []);
  const openAlert = useCallback((coin) => {
    setAlertCoin(coin);
    setAlertOpen(true);
  }, []);

  const suggestions = useMemo(() => coins.filter((c) => !isStablecoin(c) && !ids.has(c.id)).slice(0, 6), [coins, ids]);
  const initialLoading = loading && items.length === 0;

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-3 py-4 sm:p-0 lg:space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Watchlist</h1>
          <p className="mt-0.5 text-sm text-fg-subtle">
            {items.length ? `${items.length} coin${items.length === 1 ? "" : "s"} you're following, at live prices.` : "Follow coins to track them in one place."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
        >
          <Plus size={16} /> Add coins
        </button>
      </header>

      {(initialLoading || items.length > 0) && (
        <Card className="grid grid-cols-2 md:grid-cols-4 md:divide-x divide-line [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-line md:[&>*:nth-child(n+3)]:border-t-0">
          <Stat label="Average 24h change" loading={initialLoading}>
            <Delta value={summary.avg} className="text-base font-semibold" />
          </Stat>
          <Stat label="Best today" loading={initialLoading}>
            <Mover coin={summary.best?.coin} change={summary.best?.change} />
          </Stat>
          <Stat label="Worst today" loading={initialLoading}>
            <Mover coin={summary.worst?.coin} change={summary.worst?.change} />
          </Stat>
          <Stat label="Your holdings in these coins" loading={initialLoading}>
            <span className="tabular text-base font-semibold text-fg">{formatUSD(summary.heldValue)}</span>
          </Stat>
        </Card>
      )}

      <Card>
        {initialLoading ? (
          <SkeletonRows rows={6} />
        ) : isError && items.length === 0 ? (
          <EmptyState icon={Star} title="Couldn't load your watchlist" description="Check your connection and refresh the page." className="py-14" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Your watchlist is empty"
            description="Follow coins to see their live prices, 7-day trend and your position in one place."
            className="py-12"
            action={
              <div className="mt-3 flex flex-col items-center gap-3">
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggle(c)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-3 text-xs font-medium text-fg transition-colors hover:border-brand hover:text-brand"
                      >
                        <CoinAvatar src={c.image} symbol={c.symbol} size={20} />
                        <Plus size={12} />
                        {c.symbol?.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => setAddOpen(true)} className="text-xs font-semibold text-brand hover:underline">
                  Browse all coins
                </button>
              </div>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-line p-3 sm:p-4">
              <SearchInput value={query} onChange={setQuery} placeholder="Filter your watchlist" className="w-full md:w-64" />
              {sort.key !== "added" && (
                <button
                  type="button"
                  onClick={() => toggleSort("added")}
                  className="shrink-0 text-xs font-medium text-fg-muted hover:text-fg"
                >
                  Reset order
                </button>
              )}
            </div>
            {visible.length === 0 ? (
              <EmptyState icon={SearchX} title="No coins match your filter" description="Try a different name or symbol." className="py-12" />
            ) : (
              <WatchlistTable
                coins={visible}
                isDesktop={isDesktop}
                sort={sort}
                onSort={toggleSort}
                onRemove={remove}
                onTrade={openTrade}
                onAlert={openAlert}
              />
            )}
            <Pagination page={page} pageSize={PAGE_SIZE} total={sorted.length} onPage={setPage} />
          </>
        )}
      </Card>

      <AddCoinsModal open={addOpen} onClose={() => setAddOpen(false)} watchedIds={ids} onToggle={toggle} />
      <TradeModal show={tradeOpen} onClose={() => setTradeOpen(false)} coin={tradeCoin} type="buy" purchasedCoins={purchasedCoins} />
      <PriceAlertModal show={alertOpen} onClose={() => setAlertOpen(false)} coin={alertCoin} />
    </div>
  );
}
