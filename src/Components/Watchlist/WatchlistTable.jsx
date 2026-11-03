import React, { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { Delta } from "@/Components/ui/delta";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { SortHeader } from "@/Components/ui/table";
import { FlashPrice } from "@/Components/Crypto/LiveCoinRow";
import { StarButton } from "@/Components/Crypto/CoinTable";
import Sparkline from "@/Components/Crypto/Sparkline";
import { formatCompact, formatUSD } from "@/utils/format";

const usd = (v) => (Number.isFinite(v) ? `$${formatCompact(v, 2)}` : "–");
const qtyFormat = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 6 });

const COLUMNS = [
  { key: "name", label: "Coin", align: "left" },
  { key: "price", label: "Price" },
  { key: "h24", label: "24h" },
  { key: "d7", label: "7d", className: "hidden lg:table-cell" },
  { key: "mcap", label: "Market cap", className: "hidden lg:table-cell" },
  { key: null, label: "Last 7 days", className: "hidden xl:table-cell" },
  { key: "holding", label: "Your holding" },
  { key: null, label: "", className: "w-px" },
];

/** Value of the user's position at the live price */
const Holding = ({ quantity, price, symbol }) =>
  quantity > 0 ? (
    <>
      <span className="tabular block text-sm font-medium text-fg">{formatUSD(quantity * (price || 0))}</span>
      <span className="tabular text-xs text-fg-subtle">
        {qtyFormat(quantity)} {symbol}
      </span>
    </>
  ) : (
    <span className="text-xs text-fg-subtle">–</span>
  );

/** Desktop row; re-renders only on this coin's price ticks */
const Row = memo(({ coin, onRemove, onTrade, onAlert }) => {
  const navigate = useNavigate();
  const live = useLivePrice(coin.id, coin.symbol);
  const price = live?.current_price ?? coin.current_price;
  const change24 = live?.price_change_percentage_24h ?? coin.price_change_percentage_24h;
  const symbol = coin.symbol?.toUpperCase();

  return (
    <tr
      onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
      className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface-hover"
    >
      <td className="py-3 pl-3 pr-4">
        <div className="flex items-center gap-2">
          <StarButton active symbol={symbol} onClick={() => onRemove(coin)} />
          <CoinAvatar src={coin.image} symbol={coin.symbol} size={28} />
          <div className="min-w-0">
            <Link
              to={`/coin/coin-details/${coin.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-sm font-semibold text-fg hover:text-brand"
            >
              {coin.name || symbol}
            </Link>
            <span className="text-xs text-fg-subtle">{symbol}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <FlashPrice value={price} className="text-sm font-medium text-fg" />
      </td>
      <td className="px-3 py-3 text-right text-sm">
        <Delta value={change24} />
      </td>
      <td className="hidden px-3 py-3 text-right text-sm lg:table-cell">
        <Delta value={coin.price_change_percentage_7d_in_currency} />
      </td>
      <td className="tabular hidden px-3 py-3 text-right text-sm text-fg lg:table-cell">{usd(coin.market_cap)}</td>
      <td className="hidden px-3 py-2 xl:table-cell">
        <Sparkline data={coin.sparkline_in_7d?.price} className="ml-auto" />
      </td>
      <td className="px-3 py-3 text-right">
        <Holding quantity={coin.holdingQuantity} price={price} symbol={symbol} />
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
Row.displayName = "WatchlistRow";

/** Phone row: coin, holding, price and 24h change */
const MobileRow = memo(({ coin, onRemove, onTrade }) => {
  const navigate = useNavigate();
  const live = useLivePrice(coin.id, coin.symbol);
  const price = live?.current_price ?? coin.current_price;
  const change24 = live?.price_change_percentage_24h ?? coin.price_change_percentage_24h;
  const symbol = coin.symbol?.toUpperCase();

  return (
    <li className="flex items-center gap-2 py-2.5 pl-2 pr-3">
      <StarButton active symbol={symbol} onClick={() => onRemove(coin)} />
      <button type="button" onClick={() => navigate(`/coin/coin-details/${coin.id}`)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
        <CoinAvatar src={coin.image} symbol={coin.symbol} size={30} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-fg">{symbol}</span>
          <span className="tabular block truncate text-xs text-fg-subtle">
            {coin.holdingQuantity > 0 ? `You hold ${formatUSD(coin.holdingQuantity * (price || 0))}` : coin.name}
          </span>
        </span>
        <span className="text-right">
          <FlashPrice value={price} className="block text-sm font-medium text-fg" />
          <Delta value={change24} className="text-xs" />
        </span>
      </button>
      <button type="button" onClick={() => onTrade(coin)} className="ml-1 rounded-md bg-brand-soft px-2.5 py-1.5 text-xs font-semibold text-brand">
        Trade
      </button>
    </li>
  );
});
MobileRow.displayName = "WatchlistMobileRow";

function WatchlistTable({ coins, isDesktop, sort, onSort, onRemove, onTrade, onAlert }) {
  if (!isDesktop) {
    return (
      <ul className="divide-y divide-line">
        {coins.map((coin) => (
          <MobileRow key={coin.id} coin={coin} onRemove={onRemove} onTrade={onTrade} />
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse">
        <thead className="border-b border-line bg-surface-2/60">
          <tr>
            {COLUMNS.map((c, i) => (
              <SortHeader key={c.key || i} label={c.label} sortKey={c.key} align={c.align} className={c.className} sort={sort} onSort={onSort} />
            ))}
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <Row key={coin.id} coin={coin} onRemove={onRemove} onTrade={onTrade} onAlert={onAlert} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(WatchlistTable);
