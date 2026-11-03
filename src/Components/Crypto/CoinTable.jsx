import React, { memo, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Bell, SearchX, CloudOff } from "lucide-react";
import useCoinContext from "@/hooks/useCoinContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import useWatchlistToggle from "@/hooks/useWatchlistToggle";
import { Card, EmptyState } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { Delta } from "@/Components/ui/delta";
import { Skeleton } from "@/Components/ui/skeleton";
import { SortHeader, Pagination, SearchInput } from "@/Components/ui/table";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { FlashPrice } from "./LiveCoinRow";
import Sparkline from "./Sparkline";
import { formatCompact } from "@/utils/format";
import { cn } from "@/utils/utils";

const PAGE_SIZE = 25;

const COLUMNS = [
  { key: "rank", label: "#", align: "left", sort: (c) => c.market_cap_rank ?? Infinity },
  { key: "name", label: "Name", align: "left", sort: (c) => c.name?.toLowerCase() },
  { key: "price", label: "Price", sort: (c) => c.current_price },
  { key: "h1", label: "1h", sort: (c) => c.price_change_percentage_1h_in_currency, className: "hidden xl:table-cell" },
  { key: "h24", label: "24h", sort: (c) => c.price_change_percentage_24h },
  { key: "d7", label: "7d", sort: (c) => c.price_change_percentage_7d_in_currency, className: "hidden lg:table-cell" },
  { key: "mcap", label: "Market cap", sort: (c) => c.market_cap },
  { key: "volume", label: "Volume (24h)", sort: (c) => c.total_volume, className: "hidden lg:table-cell" },
  { key: "chart", label: "Last 7 days", className: "hidden xl:table-cell" },
  { key: "actions", label: "", className: "w-px" },
];

const usd = (v) => (Number.isFinite(v) ? `$${formatCompact(v, 2)}` : "–");

export function StarButton({ active, onClick, symbol }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      className={cn(
        "grid size-7 place-items-center rounded-md transition-colors hover:bg-surface-hover",
        active ? "text-warn" : "text-fg-subtle hover:text-fg",
      )}
    >
      <Star size={15} fill={active ? "currentColor" : "none"} />
    </button>
  );
}

/** Desktop row; re-renders only when this coin's live price changes */
const MarketRow = memo(({ coin, watched, held, onToggleWatch, onTrade, onAlert }) => {
  const navigate = useNavigate();
  const live = useLivePrice(coin.id, coin.symbol);
  const price = live?.current_price ?? coin.current_price;
  const change24 = live?.price_change_percentage_24h ?? coin.price_change_percentage_24h;
  const symbol = coin.symbol?.toUpperCase();

  return (
    <tr
      onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
      className="group cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface-hover"
    >
      <td className="py-3 pl-3 pr-1">
        <div className="flex items-center gap-1">
          <StarButton active={watched} symbol={symbol} onClick={() => onToggleWatch(coin)} />
          <span className="tabular w-7 text-xs text-fg-subtle">{coin.market_cap_rank ?? "–"}</span>
        </div>
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <CoinAvatar src={coin.image} symbol={coin.symbol} size={28} />
          <div className="min-w-0">
            <Link
              to={`/coin/coin-details/${coin.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-sm font-semibold text-fg hover:text-brand"
            >
              {coin.name}
            </Link>
            <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
              {symbol}
              {held && <span className="rounded bg-brand-soft px-1 py-px text-[10px] font-semibold text-brand">Held</span>}
            </span>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-right">
        <FlashPrice value={price} className="text-sm font-medium text-fg" />
      </td>
      <td className="hidden py-3 px-3 text-right text-sm xl:table-cell">
        <Delta value={coin.price_change_percentage_1h_in_currency} />
      </td>
      <td className="py-3 px-3 text-right text-sm">
        <Delta value={change24} />
      </td>
      <td className="hidden py-3 px-3 text-right text-sm lg:table-cell">
        <Delta value={coin.price_change_percentage_7d_in_currency} />
      </td>
      <td className="tabular py-3 px-3 text-right text-sm text-fg">{usd(coin.market_cap)}</td>
      <td className="tabular hidden py-3 px-3 text-right text-sm text-fg-muted lg:table-cell">{usd(coin.total_volume)}</td>
      <td className="hidden py-2 px-3 xl:table-cell">
        <Sparkline data={coin.sparkline_in_7d?.price} className="ml-auto" />
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAlert(coin);
            }}
            aria-label={`Set a price alert for ${symbol}`}
            title="Price alert"
            className="grid size-8 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <Bell size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTrade(coin);
            }}
            className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:border-brand hover:bg-brand hover:text-brand-fg"
          >
            Trade
          </button>
        </div>
      </td>
    </tr>
  );
});
MarketRow.displayName = "MarketRow";

/** Phone row: name, market cap, price and 24h change */
const MobileRow = memo(({ coin, watched, held, onToggleWatch, onTrade }) => {
  const navigate = useNavigate();
  const live = useLivePrice(coin.id, coin.symbol);
  const price = live?.current_price ?? coin.current_price;
  const change24 = live?.price_change_percentage_24h ?? coin.price_change_percentage_24h;
  const symbol = coin.symbol?.toUpperCase();

  return (
    <li className="flex items-center gap-2 py-2.5 pl-2 pr-3">
      <StarButton active={watched} symbol={symbol} onClick={() => onToggleWatch(coin)} />
      <button
        type="button"
        onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <CoinAvatar src={coin.image} symbol={coin.symbol} size={30} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
            {symbol}
            {held && <span className="rounded bg-brand-soft px-1 py-px text-[10px] font-semibold text-brand">Held</span>}
          </span>
          <span className="tabular block truncate text-xs text-fg-subtle">MCap {usd(coin.market_cap)}</span>
        </span>
        <span className="text-right">
          <FlashPrice value={price} className="block text-sm font-medium text-fg" />
          <Delta value={change24} className="text-xs" />
        </span>
      </button>
      <button
        type="button"
        onClick={() => onTrade(coin)}
        className="ml-1 rounded-md bg-brand-soft px-2.5 py-1.5 text-xs font-semibold text-brand"
      >
        Trade
      </button>
    </li>
  );
});
MobileRow.displayName = "MobileRow";

/** Top 100 coins: filters, search, sorting and pagination with live prices */
function CoinTable({ onTrade, onAlert }) {
  const { coins, coinsLoading } = useCoinContext();
  const { purchasedCoins } = usePurchasedCoins();
  const { ids: watchIds, toggle: toggleWatch, count: watchCount } = useWatchlistToggle();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "rank", dir: "asc" });
  const [page, setPage] = useState(1);

  const heldIds = useMemo(
    () => new Set(purchasedCoins.map((p) => p.coin_id || p.coinId)),
    [purchasedCoins],
  );

  const filters = [
    { value: "all", label: "All" },
    { value: "watchlist", label: `Watchlist${watchCount ? ` ${watchCount}` : ""}` },
    { value: "gainers", label: "Gainers" },
    { value: "losers", label: "Losers" },
    { value: "holdings", label: "My holdings" },
  ];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = coins.filter((c) => !q || c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q));
    if (filter === "watchlist") list = list.filter((c) => watchIds.has(c.id));
    if (filter === "holdings") list = list.filter((c) => heldIds.has(c.id));
    if (filter === "gainers") list = list.filter((c) => c.price_change_percentage_24h > 0);
    if (filter === "losers") list = list.filter((c) => c.price_change_percentage_24h < 0);

    // Gainers/losers default to biggest move first unless a column was chosen
    const effective =
      sort.key === "rank" && (filter === "gainers" || filter === "losers")
        ? { key: "h24", dir: filter === "gainers" ? "desc" : "asc" }
        : sort;
    const column = COLUMNS.find((c) => c.key === effective.key);
    const sign = effective.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const va = column.sort(a);
      const vb = column.sort(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      return (va > vb ? 1 : va < vb ? -1 : 0) * sign;
    });
  }, [coins, query, filter, sort, watchIds, heldIds]);

  // Back to the first page whenever the visible set changes
  useEffect(() => setPage(1), [filter, query, sort]);

  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const loading = coinsLoading && coins.length === 0;

  const onSort = (key) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "rank" || key === "name" ? "asc" : "desc" },
    );

  const emptyCopy = {
    watchlist: { title: "Your watchlist is empty", description: "Tap the star next to any coin to follow it here." },
    holdings: { title: "No holdings yet", description: "Coins you buy will show up here." },
  }[filter] || { title: "No coins match your search", description: "Try a different name or symbol." };

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
        <Segmented label="Filter coins" options={filters} value={filter} onChange={setFilter} className="max-w-full overflow-x-auto no-scrollbar" />
        <SearchInput value={query} onChange={setQuery} placeholder="Filter by name or symbol" label="Filter coins" className="md:w-64" />
      </div>

      {loading ? (
        <div className="divide-y divide-line">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="ml-auto h-3.5 w-20" />
              <Skeleton className="hidden h-3.5 w-14 md:block" />
              <Skeleton className="hidden h-3.5 w-20 md:block" />
            </div>
          ))}
        </div>
      ) : coins.length === 0 ? (
        <EmptyState
          icon={CloudOff}
          title="Market data is temporarily unavailable"
          description="The price provider is limiting requests. The list reloads automatically within a minute."
          className="py-14"
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={filter === "watchlist" ? Star : SearchX} title={emptyCopy.title} description={emptyCopy.description} className="py-14" />
      ) : isDesktop ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead className="border-b border-line bg-surface-2/60">
              <tr>
                {COLUMNS.map((column) => (
                  <SortHeader
                    key={column.key}
                    label={column.label}
                    sortKey={column.sort ? column.key : undefined}
                    align={column.align}
                    className={column.className}
                    sort={sort}
                    onSort={onSort}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((coin) => (
                <MarketRow
                  key={coin.id}
                  coin={coin}
                  watched={watchIds.has(coin.id)}
                  held={heldIds.has(coin.id)}
                  onToggleWatch={toggleWatch}
                  onTrade={onTrade}
                  onAlert={onAlert}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((coin) => (
            <MobileRow
              key={coin.id}
              coin={coin}
              watched={watchIds.has(coin.id)}
              held={heldIds.has(coin.id)}
              onToggleWatch={toggleWatch}
              onTrade={onTrade}
            />
          ))}
        </ul>
      )}

      {!loading && <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />}
    </Card>
  );
}

export default memo(CoinTable);
