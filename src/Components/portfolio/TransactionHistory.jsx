import React, { memo, useEffect, useMemo, useState } from "react";
import { Download, History, SearchX } from "lucide-react";
import useSortedRows from "@/hooks/useSortedRows";
import useMediaQuery from "@/hooks/useMediaQuery";
import useCoinContext from "@/hooks/useCoinContext";
import { EmptyState } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { SkeletonRows } from "@/Components/ui/skeleton";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { SortHeader, Pagination, SearchInput } from "@/Components/ui/table";
import { formatPrice, formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";

const PAGE_SIZE = 15;
const FILTERS = [
  { value: "all", label: "All" },
  { value: "buy", label: "Buys" },
  { value: "sell", label: "Sells" },
];

const when = (tx) => new Date(tx.transactionDate || tx.purchase_date || 0);
const total = (tx) => tx.totalValue ?? tx.total_cost ?? 0;
const dateFormat = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const SORT_COLUMNS = {
  date: (tx) => when(tx).getTime(),
  coin: (tx) => tx.coinSymbol?.toLowerCase(),
  price: (tx) => tx.price,
  quantity: (tx) => tx.quantity,
  total: (tx) => total(tx),
};

/** Download the given trades as a CSV file (opens in Excel / Google Sheets) */
const exportCsv = (rows) => {
  const escape = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    ["Date", "Type", "Coin", "Symbol", "Quantity", "Price (USD)", "Total (USD)"],
    ...rows.map((tx) => [when(tx).toISOString(), tx.type, tx.coinName, tx.coinSymbol?.toUpperCase(), tx.quantity, tx.price, total(tx)]),
  ];
  const blob = new Blob([lines.map((l) => l.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexchain-trades-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const SideBadge = ({ type }) => (
  <span className={cn("rounded px-1.5 py-px text-[10px] font-bold uppercase", type === "buy" ? "bg-up-soft text-up" : "bg-down-soft text-down")}>
    {type === "buy" ? "Buy" : "Sell"}
  </span>
);

/** Every executed buy and sell */
function TransactionHistory({ transactions, loading }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { coins } = useCoinContext();
  const logos = useMemo(() => new Map(coins.map((c) => [c.id, c.image])), [coins]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter(
      (tx) =>
        (filter === "all" || tx.type === filter) &&
        (!q || tx.coinSymbol?.toLowerCase().includes(q) || tx.coinName?.toLowerCase().includes(q)),
    );
  }, [transactions, filter, query]);

  const { sorted, sort, toggleSort } = useSortedRows(filtered, SORT_COLUMNS, { key: "date", dir: "desc" });
  useEffect(() => setPage(1), [filter, query, sort]);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading && transactions.length === 0) return <SkeletonRows rows={5} />;
  if (transactions.length === 0) {
    return <EmptyState icon={History} title="No trades yet" description="Your executed buys and sells will be listed here." className="py-12" />;
  }

  const header = (label, key, extra) => <SortHeader label={label} sortKey={key} sort={sort} onSort={toggleSort} {...extra} />;

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:p-4">
        <Segmented label="Trade type" options={FILTERS} value={filter} onChange={setFilter} />
        <SearchInput value={query} onChange={setQuery} placeholder="Filter by coin" className="sm:w-56" />
        <button
          type="button"
          onClick={() => exportCsv(sorted)}
          disabled={sorted.length === 0}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-fg transition-colors hover:bg-surface-hover disabled:opacity-40 sm:ml-auto"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={SearchX} title="No trades match" description="Try another coin or trade type." className="py-12" />
      ) : isDesktop ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead className="border-b border-line bg-surface-2/60">
              <tr>
                {header("Date", "date", { align: "left", className: "pl-4" })}
                {header("Coin", "coin", { align: "left" })}
                <th className="px-3 py-2.5 text-left text-xs font-medium text-fg-subtle">Side</th>
                {header("Price", "price")}
                {header("Quantity", "quantity")}
                {header("Total", "total", { className: "pr-4" })}
              </tr>
            </thead>
            <tbody>
              {visible.map((tx, i) => (
                <tr key={tx._id || i} className="border-b border-line last:border-0">
                  <td className="tabular py-3 pl-4 pr-3 text-sm text-fg-muted">{dateFormat.format(when(tx))}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <CoinAvatar src={logos.get(tx.coin_id) || tx.image} symbol={tx.coinSymbol} size={24} />
                      <span className="text-sm font-semibold text-fg">{tx.coinSymbol?.toUpperCase()}</span>
                      <span className="hidden truncate text-xs text-fg-subtle lg:inline">{tx.coinName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <SideBadge type={tx.type} />
                  </td>
                  <td className="tabular px-3 py-3 text-right text-sm text-fg">{formatPrice(tx.price)}</td>
                  <td className="tabular px-3 py-3 text-right text-sm text-fg">
                    {Number(tx.quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                  </td>
                  <td className="tabular py-3 pl-3 pr-4 text-right text-sm font-medium text-fg">
                    {tx.type === "buy" ? "−" : "+"}
                    {formatUSD(total(tx))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((tx, i) => (
            <li key={tx._id || i} className="flex items-center gap-3 px-4 py-3">
              <CoinAvatar src={logos.get(tx.coin_id) || tx.image} symbol={tx.coinSymbol} size={30} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                  <SideBadge type={tx.type} /> {tx.coinSymbol?.toUpperCase()}
                </p>
                <p className="truncate text-xs text-fg-subtle">{dateFormat.format(when(tx))}</p>
              </div>
              <div className="text-right">
                <p className="tabular text-sm font-medium text-fg">
                  {tx.type === "buy" ? "−" : "+"}
                  {formatUSD(total(tx))}
                </p>
                <p className="tabular text-xs text-fg-subtle">@ {formatPrice(tx.price)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={sorted.length} onPage={setPage} />
    </>
  );
}

export default memo(TransactionHistory);
