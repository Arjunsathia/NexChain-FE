import React, { memo, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Clock, Pencil, X } from "lucide-react";
import api from "@/api/axiosConfig";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import useMediaQuery from "@/hooks/useMediaQuery";
import useCoinContext from "@/hooks/useCoinContext";
import { EmptyState } from "@/Components/ui/card";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { formatPrice, formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";
import EditOrderModal from "./EditOrderModal";

const TYPE_LABELS = { limit: "Limit", stop_limit: "Stop-limit", stop_market: "Stop-market", market: "Market" };

// The price that matters while waiting: the trigger for stops, otherwise the limit
const watchPrice = (o) => (o.category === "stop_limit" || o.category === "stop_market" ? o.stop_price : o.limit_price);

/** How far the market has to move to reach the order's price */
const Distance = ({ order }) => {
  const live = useLivePrice(order.coin_id, order.coin_symbol);
  const price = live?.current_price;
  const target = watchPrice(order);
  if (!price || !target) return <span className="text-fg-subtle">–</span>;
  const pct = ((target - price) / price) * 100;
  return (
    <span className="tabular text-fg-muted" title={`Market ${formatPrice(price)}`}>
      {pct >= 0 ? "+" : "−"}
      {Math.abs(pct).toFixed(2)}%
    </span>
  );
};

const SideBadge = ({ type }) => (
  <span className={cn("rounded px-1.5 py-px text-[10px] font-bold uppercase", type === "buy" ? "bg-up-soft text-up" : "bg-down-soft text-down")}>
    {type}
  </span>
);

/** Pending limit, stop and OCO orders with edit and cancel */
function OpenOrdersTable({ orders, onChanged }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [editing, setEditing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const { coins } = useCoinContext();
  // Current market logos; the image saved with the order is only a fallback
  const logos = useMemo(() => new Map(coins.map((c) => [c.id, c.image])), [coins]);

  const cancel = async (order) => {
    setCancelling(order._id);
    try {
      const res = await api.put(`/orders/cancel/${order._id}`);
      if (res.data.success) {
        toast.success(res.data.message || "Order cancelled");
        onChanged();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to cancel the order");
    } finally {
      setCancelling(null);
    }
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No open orders"
        description="Limit, stop and OCO orders wait here until the market reaches your price."
        className="py-12"
      />
    );
  }

  const actions = (o) => {
    // Only plain pending orders can be edited; OCO legs and triggered orders can only be cancelled
    const editable = o.status === "pending" && !o.oco_group_id;
    return (
      <div className="flex items-center justify-end gap-1">
        {editable && (
          <button
            type="button"
            onClick={() => setEditing(o)}
            aria-label={`Edit ${o.coin_symbol?.toUpperCase()} order`}
            className="grid size-8 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <Pencil size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={() => cancel(o)}
          disabled={cancelling === o._id}
          className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-fg transition-colors hover:border-down hover:text-down disabled:opacity-50"
        >
          <X size={13} /> Cancel
        </button>
      </div>
    );
  };

  const typeCell = (o) => (
    <span className="text-sm text-fg">
      {o.oco_group_id ? "OCO · " : ""}
      {TYPE_LABELS[o.category] || o.category}
      {o.status === "triggered" && <span className="ml-1.5 text-xs text-warn">Triggered</span>}
    </span>
  );

  const priceCell = (o) => (
    <span className="tabular text-sm text-fg">
      {o.stop_price ? <span className="block text-xs text-fg-subtle">Stop {formatPrice(o.stop_price)}</span> : null}
      {o.limit_price ? formatPrice(o.limit_price) : o.category === "stop_market" ? "Market" : "–"}
    </span>
  );

  return (
    <>
      {isDesktop ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead className="border-b border-line bg-surface-2/60 text-xs text-fg-subtle">
              <tr>
                <th className="py-2.5 pl-4 pr-3 text-left font-medium">Coin</th>
                <th className="px-3 py-2.5 text-left font-medium">Side</th>
                <th className="px-3 py-2.5 text-left font-medium">Type</th>
                <th className="px-3 py-2.5 text-right font-medium">Price</th>
                <th className="px-3 py-2.5 text-right font-medium">Quantity</th>
                <th className="px-3 py-2.5 text-right font-medium">Total</th>
                <th className="px-3 py-2.5 text-right font-medium" title="Move needed for the market to reach this order">
                  To fill
                </th>
                <th className="w-px" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-line last:border-0">
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-2.5">
                      <CoinAvatar src={logos.get(o.coin_id) || o.coin_image} symbol={o.coin_symbol} size={26} />
                      <span className="text-sm font-semibold text-fg">{o.coin_symbol?.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <SideBadge type={o.type} />
                  </td>
                  <td className="px-3 py-3">{typeCell(o)}</td>
                  <td className="px-3 py-3 text-right">{priceCell(o)}</td>
                  <td className="tabular px-3 py-3 text-right text-sm text-fg">
                    {Number(o.quantity).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                  </td>
                  <td className="tabular px-3 py-3 text-right text-sm text-fg">{o.total_value ? formatUSD(o.total_value) : "–"}</td>
                  <td className="px-3 py-3 text-right text-sm">
                    <Distance order={o} />
                  </td>
                  <td className="py-3 pl-2 pr-4">{actions(o)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {orders.map((o) => (
            <li key={o._id} className="space-y-2 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <CoinAvatar src={logos.get(o.coin_id) || o.coin_image} symbol={o.coin_symbol} size={28} />
                <span className="text-sm font-semibold text-fg">{o.coin_symbol?.toUpperCase()}</span>
                <SideBadge type={o.type} />
                <span className="ml-auto">{typeCell(o)}</span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div className="text-xs text-fg-subtle">
                  {priceCell(o)}
                  <span className="tabular block">
                    {Number(o.quantity).toLocaleString(undefined, { maximumFractionDigits: 8 })} · to fill <Distance order={o} />
                  </span>
                </div>
                {actions(o)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <EditOrderModal order={editing} onClose={() => setEditing(null)} onSaved={onChanged} />
    </>
  );
}

export default memo(OpenOrdersTable);
