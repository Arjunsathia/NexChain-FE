import React, { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Coins } from "lucide-react";
import useSortedRows from "@/hooks/useSortedRows";
import useMediaQuery from "@/hooks/useMediaQuery";
import { EmptyState } from "@/Components/ui/card";
import { SkeletonRows } from "@/Components/ui/skeleton";
import { Delta } from "@/Components/ui/delta";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { SortHeader } from "@/Components/ui/table";
import { FlashPrice } from "@/Components/Crypto/LiveCoinRow";
import { formatPrice, formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";

const SORT_COLUMNS = {
  name: (p) => p.name?.toLowerCase(),
  quantity: (p) => p.quantity,
  avg: (p) => p.avgCost,
  price: (p) => p.price,
  h24: (p) => p.change24,
  value: (p) => p.value,
  pnl: (p) => p.pnl,
  share: (p) => p.allocation,
};

const qty = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 8 });
const signedUSD = (n) => `${n >= 0 ? "+" : "−"}${formatUSD(Math.abs(n))}`;

function ActionButtons({ position, onBuy, onSell, onAlert, compact }) {
  const base = "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors";
  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      {!compact && (
        <button
          type="button"
          onClick={() => onAlert(position)}
          aria-label={`Set a price alert for ${position.symbol}`}
          title="Price alert"
          className="grid size-8 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <Bell size={15} />
        </button>
      )}
      <button type="button" onClick={() => onBuy(position)} className={cn(base, "bg-up-soft text-up hover:bg-up hover:text-white")}>
        Buy
      </button>
      <button type="button" onClick={() => onSell(position)} className={cn(base, "bg-down-soft text-down hover:bg-down hover:text-white")}>
        Sell
      </button>
    </div>
  );
}

/** Open positions valued at live prices */
function HoldingsTable({ positions, loading, onBuy, onSell, onAlert }) {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { sorted, sort, toggleSort } = useSortedRows(positions, SORT_COLUMNS, { key: "value", dir: "desc" });

  if (loading) return <SkeletonRows rows={4} />;
  if (positions.length === 0) {
    return (
      <EmptyState
        icon={Coins}
        title="No open positions"
        description="Coins you buy appear here with their live value and profit or loss."
        className="py-12"
        action={
          <Link to="/cryptolist" className="mt-2 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-brand-fg hover:bg-brand-hover">
            Explore markets
          </Link>
        }
      />
    );
  }

  if (!isDesktop) {
    return (
      <ul className="divide-y divide-line">
        {sorted.map((p) => (
          <li key={p.coinId} className="px-4 py-3">
            <button type="button" onClick={() => navigate(`/coin/coin-details/${p.coinId}`)} className="flex w-full items-center gap-3 text-left">
              <CoinAvatar src={p.image} symbol={p.symbol} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-fg">{p.symbol}</span>
                <span className="tabular block text-xs text-fg-subtle">
                  {qty(p.quantity)} · avg {formatPrice(p.avgCost)}
                </span>
              </span>
              <span className="text-right">
                <span className="tabular block text-sm font-medium text-fg">{formatUSD(p.value)}</span>
                <span className={cn("tabular text-xs", p.pnl >= 0 ? "text-up" : "text-down")}>
                  {signedUSD(p.pnl)} ({p.pnlPct >= 0 ? "+" : "−"}
                  {Math.abs(p.pnlPct).toFixed(2)}%)
                </span>
              </span>
            </button>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-xs text-fg-subtle">
                {formatPrice(p.price)} <Delta value={p.change24} className="ml-1" />
              </span>
              <ActionButtons position={p} onBuy={onBuy} onSell={onSell} onAlert={onAlert} compact />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const header = (label, key, extra) => <SortHeader label={label} sortKey={key} sort={sort} onSort={toggleSort} {...extra} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse">
        <thead className="border-b border-line bg-surface-2/60">
          <tr>
            {header("Asset", "name", { align: "left", className: "pl-4" })}
            {header("Quantity", "quantity")}
            {header("Avg cost", "avg", { className: "hidden lg:table-cell" })}
            {header("Price", "price")}
            {header("24h", "h24")}
            {header("Value", "value")}
            {header("Unrealized P&L", "pnl")}
            {header("Share", "share", { className: "hidden xl:table-cell" })}
            <th className="w-px" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.coinId}
              onClick={() => navigate(`/coin/coin-details/${p.coinId}`)}
              className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface-hover"
            >
              <td className="py-3 pl-4 pr-3">
                <div className="flex items-center gap-3">
                  <CoinAvatar src={p.image} symbol={p.symbol} size={28} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">{p.name}</p>
                    <p className="text-xs text-fg-subtle">{p.symbol}</p>
                  </div>
                </div>
              </td>
              <td className="tabular px-3 py-3 text-right text-sm text-fg">{qty(p.quantity)}</td>
              <td className="tabular hidden px-3 py-3 text-right text-sm text-fg-muted lg:table-cell">{formatPrice(p.avgCost)}</td>
              <td className="px-3 py-3 text-right">
                <FlashPrice value={p.price} className="text-sm font-medium text-fg" />
              </td>
              <td className="px-3 py-3 text-right text-sm">
                <Delta value={p.change24} />
              </td>
              <td className="tabular px-3 py-3 text-right text-sm font-medium text-fg">{formatUSD(p.value)}</td>
              <td className="px-3 py-3 text-right">
                <span className={cn("tabular block text-sm font-medium", p.pnl >= 0 ? "text-up" : "text-down")}>{signedUSD(p.pnl)}</span>
                <Delta value={p.pnlPct} className="text-xs" />
              </td>
              <td className="hidden px-3 py-3 xl:table-cell">
                <div className="ml-auto flex w-24 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.min(p.allocation, 100)}%` }} />
                  </span>
                  <span className="tabular w-9 text-right text-xs text-fg-muted">{p.allocation.toFixed(0)}%</span>
                </div>
              </td>
              <td className="py-3 pl-2 pr-4">
                <ActionButtons position={p} onBuy={onBuy} onSell={onSell} onAlert={onAlert} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(HoldingsTable);
