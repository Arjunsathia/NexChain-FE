import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "@/api/axiosConfig";
import { Modal, ModalHeader } from "@/Components/ui/modal";
import { formatUSD } from "@/utils/format";

const Field = ({ id, label, unit, value, onChange }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-fg-muted">
      {label}
    </label>
    <div className="flex h-11 items-center rounded-lg border border-line bg-surface focus-within:border-brand">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tabular h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-fg outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="pr-3 text-xs font-medium text-fg-subtle">{unit}</span>
    </div>
  </div>
);

/** Change the price(s) or size of a pending limit / stop order */
export default function EditOrderModal({ order, onClose, onSaved }) {
  // Keep the last order while the modal animates closed
  const lastOrder = useRef(order);
  if (order) lastOrder.current = order;
  const o = lastOrder.current;

  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    setLimitPrice(order.limit_price ?? "");
    setStopPrice(order.stop_price ?? "");
    setQuantity(order.quantity ?? "");
  }, [order]);

  if (!o) return null;
  const hasLimit = o.category === "limit" || o.category === "stop_limit";
  const hasStop = o.category === "stop_limit" || o.category === "stop_market";
  const symbol = o.coin_symbol?.toUpperCase();
  const price = parseFloat(hasLimit ? limitPrice : stopPrice);
  const total = price > 0 && parseFloat(quantity) > 0 ? price * parseFloat(quantity) : null;

  const submit = async (e) => {
    e.preventDefault();
    if (!(parseFloat(quantity) > 0) || (hasLimit && !(parseFloat(limitPrice) > 0)) || (hasStop && !(parseFloat(stopPrice) > 0))) {
      toast.error("Enter a price and quantity greater than zero");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put(`/orders/update/${o._id}`, {
        limit_price: hasLimit ? parseFloat(limitPrice) : undefined,
        stop_price: hasStop ? parseFloat(stopPrice) : undefined,
        quantity: parseFloat(quantity),
      });
      if (res.data.success) {
        toast.success("Order updated");
        onSaved();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update the order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!order} onClose={onClose} size="sm" label="Edit order">
      <form onSubmit={submit}>
        <ModalHeader
          title={`Edit ${o.type} order`}
          subtitle={`${symbol} · ${o.category.replace("_", "-")}`}
          onClose={onClose}
        />
        <div className="space-y-4 px-5 pb-5">
          {hasStop && <Field id="edit-stop" label="Stop price" unit="USD" value={stopPrice} onChange={setStopPrice} />}
          {hasLimit && <Field id="edit-limit" label="Limit price" unit="USD" value={limitPrice} onChange={setLimitPrice} />}
          <Field id="edit-qty" label="Quantity" unit={symbol} value={quantity} onChange={setQuantity} />
          <div className="flex justify-between rounded-lg bg-surface-2 px-3 py-2.5 text-sm">
            <span className="text-fg-muted">Order total</span>
            <span className="tabular font-semibold text-fg">{total ? formatUSD(total) : "–"}</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-line py-2.5 text-sm font-semibold text-fg hover:bg-surface-hover">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-fg hover:bg-brand-hover disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
