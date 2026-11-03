import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CloudOff, SearchX, Snowflake, Sun } from "lucide-react";
import api from "@/api/axiosConfig";
import { freezeCoin, unfreezeCoin } from "@/api/coinApis";
import { fetchCoins } from "@/redux/slices/coinSlice";
import useCoinContext from "@/hooks/useCoinContext";
import useSortedRows from "@/hooks/useSortedRows";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { Card, EmptyState } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Delta } from "@/Components/ui/delta";
import { Segmented } from "@/Components/ui/segmented";
import { Skeleton, SkeletonRows } from "@/Components/ui/skeleton";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { Pagination, SearchInput, SortHeader } from "@/Components/ui/table";
import { FlashPrice } from "@/Components/Crypto/LiveCoinRow";
import ConfirmDialog from "@/Components/Common/ConfirmDialog";
import { formatCompact } from "@/utils/format";
import { cn } from "@/utils/utils";

const PAGE_SIZE = 25;
const usd = (v) => (Number.isFinite(v) ? `$${formatCompact(v, 2)}` : "–");

const SORT_COLUMNS = {
  rank: (c) => c.market_cap_rank,
  name: (c) => c.name?.toLowerCase(),
  price: (c) => c.current_price,
  h24: (c) => c.price_change_percentage_24h,
  mcap: (c) => c.market_cap,
  volume: (c) => c.total_volume,
};

function FreezeButton({ coin, frozen, busy, onToggle }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onToggle(coin, frozen)}
      className={cn(
        "inline-flex w-[104px] items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
        frozen ? "border-line text-fg hover:bg-surface-hover" : "border-line text-fg-muted hover:border-down hover:text-down",
      )}
    >
      {frozen ? <Sun size={13} /> : <Snowflake size={13} />}
      {busy ? "Saving…" : frozen ? "Unfreeze" : "Freeze"}
    </button>
  );
}

/** Live price cells; only this row re-renders on a tick */
const PriceCells = ({ coin }) => {
  const live = useLivePrice(coin.id, coin.symbol);
  return (
    <>
      <td className="px-3 py-2.5 text-right">
        <FlashPrice value={live?.current_price ?? coin.current_price} className="text-sm font-medium text-fg" />
      </td>
      <td className="px-3 py-2.5 text-right text-sm">
        <Delta value={live?.price_change_percentage_24h ?? coin.price_change_percentage_24h} />
      </td>
    </>
  );
};

/** Admin: the coin list users can trade, and which coins are frozen */
export default function AdminCryptocurrencies() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Market data comes from the app-wide list (no extra CoinGecko request)
  const { allCoins = [], coinsLoading } = useCoinContext();

  // Frozen status from our own API, so it is current even if prices are cached
  const { data: frozenIds = [], isLoading: frozenLoading } = useQuery({
    queryKey: ["frozenCoins"],
    queryFn: async () => (await api.get("/coins/frozen")).data.frozenIds || [],
    staleTime: 30_000,
  });
  const frozen = useMemo(() => new Set(frozenIds), [frozenIds]);

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [confirmCoin, setConfirmCoin] = useState(null);
  const lastConfirm = useRef(null);
  if (confirmCoin) lastConfirm.current = confirmCoin;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCoins.filter(
      (c) =>
        (filter === "all" || (filter === "frozen" ? frozen.has(c.id) : !frozen.has(c.id))) &&
        (!q || c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q)),
    );
  }, [allCoins, filter, query, frozen]);

  const { sorted, sort, toggleSort } = useSortedRows(filtered, SORT_COLUMNS, { key: "rank", dir: "asc" });
  useEffect(() => setPage(1), [filter, query, sort]);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const applyToggle = async (coin, isFrozen) => {
    setConfirmCoin(null);
    setBusyId(coin.id);
    try {
      if (isFrozen) await unfreezeCoin(coin.id);
      else await freezeCoin({ coinId: coin.id, symbol: coin.symbol, name: coin.name });
      queryClient.setQueryData(["frozenCoins"], (old = []) => (isFrozen ? old.filter((id) => id !== coin.id) : [...old, coin.id]));
      toast.success(`${coin.name} ${isFrozen ? "is tradable again" : "is frozen"}`);
      queryClient.invalidateQueries({ queryKey: ["frozenCoins"] });
      // Refresh the app-wide list so Markets and search hide or show the coin
      dispatch(fetchCoins());
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Couldn't update the coin");
    } finally {
      setBusyId(null);
    }
  };

  // Freezing affects users, so it asks first; unfreezing applies straight away
  const onToggle = (coin, isFrozen) => (isFrozen ? applyToggle(coin, true) : setConfirmCoin(coin));

  const loading = (coinsLoading && allCoins.length === 0) || frozenLoading;
  const filterOptions = [
    { value: "all", label: `All ${allCoins.length || ""}` },
    { value: "active", label: "Tradable" },
    { value: "frozen", label: `Frozen ${frozen.size || ""}` },
  ];
  const header = (label, key, extra) => <SortHeader label={label} sortKey={key} sort={sort} onSort={toggleSort} {...extra} />;

  return (
    <div className="space-y-4 lg:space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Cryptocurrencies</h1>
        <p className="mt-0.5 text-sm text-fg-subtle">
          The top 100 coins by market cap. Freezing a coin hides it from Markets and blocks new buys; holders can still sell.
        </p>
      </header>

      <Card className="grid grid-cols-3 divide-x divide-line">
        {[
          ["Listed coins", allCoins.length],
          ["Tradable", allCoins.filter((c) => !frozen.has(c.id)).length],
          ["Frozen", frozen.size],
        ].map(([label, value]) => (
          <div key={label} className="px-4 py-3.5">
            <p className="text-xs text-fg-subtle">{label}</p>
            {loading ? <Skeleton className="mt-1.5 h-5 w-10" /> : <p className="tabular mt-1 text-lg font-semibold text-fg">{value}</p>}
          </div>
        ))}
      </Card>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <Segmented label="Filter coins" options={filterOptions} value={filter} onChange={setFilter} />
          <SearchInput value={query} onChange={setQuery} placeholder="Search name or symbol" className="sm:w-64" />
        </div>

        {loading ? (
          <SkeletonRows rows={8} />
        ) : allCoins.length === 0 ? (
          <EmptyState
            icon={CloudOff}
            title="Market data is temporarily unavailable"
            description="The price provider is limiting requests. The list reloads automatically within a minute."
            className="py-14"
          />
        ) : visible.length === 0 ? (
          <EmptyState icon={SearchX} title={filter === "frozen" ? "No frozen coins" : "No coins match"} description={filter === "frozen" ? "Every listed coin is tradable." : "Try another name or symbol."} className="py-14" />
        ) : isDesktop ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="border-b border-line bg-surface-2/60">
                <tr>
                  {header("#", "rank", { align: "left", className: "w-14 pl-4" })}
                  {header("Coin", "name", { align: "left" })}
                  {header("Price", "price")}
                  {header("24h", "h24")}
                  {header("Market cap", "mcap")}
                  {header("Volume (24h)", "volume", { className: "hidden lg:table-cell" })}
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-fg-subtle">Status</th>
                  <th className="w-px" />
                </tr>
              </thead>
              <tbody>
                {visible.map((coin) => {
                  const isFrozen = frozen.has(coin.id);
                  return (
                    <tr key={coin.id} className={cn("border-b border-line last:border-0", isFrozen && "bg-down-soft/40")}>
                      <td className="tabular py-2.5 pl-4 pr-3 text-xs text-fg-subtle">{coin.market_cap_rank ?? "–"}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <CoinAvatar src={coin.image} symbol={coin.symbol} size={26} />
                          <span className="text-sm font-semibold text-fg">{coin.name}</span>
                          <span className="text-xs text-fg-subtle">{coin.symbol?.toUpperCase()}</span>
                        </div>
                      </td>
                      <PriceCells coin={coin} />
                      <td className="tabular px-3 py-2.5 text-right text-sm text-fg">{usd(coin.market_cap)}</td>
                      <td className="tabular hidden px-3 py-2.5 text-right text-sm text-fg-muted lg:table-cell">{usd(coin.total_volume)}</td>
                      <td className="px-3 py-2.5">
                        <Badge tone={isFrozen ? "down" : "up"} dot>
                          {isFrozen ? "Frozen" : "Tradable"}
                        </Badge>
                      </td>
                      <td className="py-2.5 pl-2 pr-4">
                        <FreezeButton coin={coin} frozen={isFrozen} busy={busyId === coin.id} onToggle={onToggle} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((coin) => {
              const isFrozen = frozen.has(coin.id);
              return (
                <li key={coin.id} className="flex items-center gap-3 px-4 py-3">
                  <CoinAvatar src={coin.image} symbol={coin.symbol} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-fg">
                      {coin.symbol?.toUpperCase()} <span className="font-normal text-fg-subtle">#{coin.market_cap_rank}</span>
                    </p>
                    <Badge tone={isFrozen ? "down" : "up"} dot className="mt-1">
                      {isFrozen ? "Frozen" : "Tradable"}
                    </Badge>
                  </div>
                  <FreezeButton coin={coin} frozen={isFrozen} busy={busyId === coin.id} onToggle={onToggle} />
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={sorted.length} onPage={setPage} />
      </Card>

      <ConfirmDialog
        show={!!confirmCoin}
        onClose={() => setConfirmCoin(null)}
        onConfirm={() => applyToggle(lastConfirm.current, false)}
        title={`Freeze ${lastConfirm.current?.name || "this coin"}?`}
        message="It disappears from Markets and search, and new buys and buy orders are blocked. People who already hold it can still sell. You can unfreeze it at any time."
        confirmText="Freeze coin"
        variant="danger"
        icon={Snowflake}
      />
    </div>
  );
}
