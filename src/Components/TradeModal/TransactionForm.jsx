import React from "react";
import { Segmented } from "@/Components/ui/segmented";
import { formatPrice, formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";

const ORDER_TYPES = [
  { value: "market", label: "Market" },
  { value: "limit", label: "Limit" },
  { value: "stop_limit", label: "Stop-limit" },
  { value: "stop_market", label: "Stop-market" },
  { value: "oco", label: "OCO" },
];

const PERCENTS = [25, 50, 75, 100];

/** Labelled numeric field with a unit on the right */
function Field({ id, label, hint, unit, value, onChange, placeholder = "0.00" }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-fg-muted">
          {label}
        </label>
        {hint}
      </div>
      <div className="flex h-11 items-center rounded-lg border border-line bg-surface transition-colors focus-within:border-brand">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="tabular h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-fg outline-none placeholder:text-fg-subtle [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="pr-3 text-xs font-medium text-fg-subtle">{unit}</span>
      </div>
    </div>
  );
}

/** Order type, prices, quantity/total, summary and the submit button */
const TransactionForm = React.memo(
  ({
    isBuy,
    symbol,
    currentPrice,
    effectivePrice,
    orderType,
    setOrderType,
    limitPrice,
    handleLimitPriceChange,
    stopPrice,
    setStopPrice,
    coinAmount,
    handleCoinAmountChange,
    usdAmount,
    handleUsdAmountChange,
    maxAvailable,
    setMaxAmount,
    balance,
    holdingQuantity,
    calculateTotal,
    handleSubmit,
    isSubmitting,
    disabledReason,
  }) => {
    const needsStop = orderType === "stop_limit" || orderType === "stop_market" || orderType === "oco";
    const needsLimit = orderType === "limit" || orderType === "stop_limit" || orderType === "oco";
    const limit = parseFloat(limitPrice);
    const instantFill =
      orderType === "limit" && Number.isFinite(limit) && (isBuy ? limit >= currentPrice : limit <= currentPrice);

    const stopLabel = orderType === "oco" ? (isBuy ? "Buy stop (breakout)" : "Stop loss") : "Stop price";
    const limitLabel = orderType === "oco" ? (isBuy ? "Buy limit (dip)" : "Take profit") : "Limit price";

    // Size by quantity for both sides; 100% uses the truncating max helper
    const applyPercent = (pct) => {
      if (pct === 100) return setMaxAmount();
      const qty = maxAvailable * (pct / 100);
      handleCoinAmountChange({ target: { value: qty > 0 ? qty.toFixed(8) : "" } });
    };

    const summary = [
      {
        label: "Available",
        value: isBuy ? formatUSD(balance || 0) : `${(holdingQuantity || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })} ${symbol}`,
      },
      { label: orderType === "market" ? "Market price" : "Order price", value: formatPrice(effectivePrice) },
      { label: "Fee", value: "$0.00" },
    ];

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        <Segmented
          label="Order type"
          options={ORDER_TYPES}
          value={orderType}
          onChange={setOrderType}
          className="w-full overflow-x-auto no-scrollbar [&>button]:flex-1 [&>button]:whitespace-nowrap"
        />

        {(needsStop || needsLimit) && (
          <div className={cn("grid gap-3", needsStop && needsLimit && "grid-cols-2")}>
            {needsStop && (
              <Field
                id="trade-stop"
                label={stopLabel}
                unit="USD"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder={orderType === "oco" ? (isBuy ? "Above market" : "Below market") : "0.00"}
              />
            )}
            {needsLimit && (
              <Field
                id="trade-limit"
                label={limitLabel}
                unit="USD"
                value={limitPrice}
                onChange={handleLimitPriceChange}
                placeholder={orderType === "oco" ? (isBuy ? "Below market" : "Above market") : "0.00"}
                hint={
                  orderType === "limit" &&
                  limitPrice && (
                    <span className={cn("text-[11px] font-medium", instantFill ? "text-warn" : "text-fg-subtle")}>
                      {instantFill ? "Fills instantly" : "Pending"}
                    </span>
                  )
                }
              />
            )}
          </div>
        )}

        <Field id="trade-qty" label="Quantity" unit={symbol} value={coinAmount} onChange={handleCoinAmountChange} placeholder="0.00000000" />

        <div className="grid grid-cols-4 gap-2">
          {PERCENTS.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => applyPercent(pct)}
              disabled={maxAvailable <= 0}
              className="rounded-md border border-line py-1.5 text-xs font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg disabled:pointer-events-none disabled:opacity-40"
            >
              {pct === 100 ? "Max" : `${pct}%`}
            </button>
          ))}
        </div>

        <Field id="trade-total" label="Total" unit="USD" value={usdAmount} onChange={handleUsdAmountChange} />

        <dl className="space-y-1.5 rounded-lg bg-surface-2 px-3 py-2.5 text-xs">
          {summary.map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <dt className="text-fg-subtle">{row.label}</dt>
              <dd className="tabular font-medium text-fg">{row.value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-3 border-t border-line pt-1.5 text-sm">
            <dt className="font-medium text-fg">{isBuy ? "You pay" : "You receive"}</dt>
            <dd className="tabular font-semibold text-fg">{formatUSD(Number(calculateTotal) || 0)}</dd>
          </div>
        </dl>

        {disabledReason && <p className="text-center text-xs text-fg-subtle">{disabledReason}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !!disabledReason || !usdAmount || parseFloat(usdAmount) <= 0}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:pointer-events-none disabled:opacity-50",
            isBuy ? "bg-up hover:bg-up/90" : "bg-down hover:bg-down/90",
          )}
        >
          {isSubmitting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Processing…
            </>
          ) : (
            `${isBuy ? "Buy" : "Sell"} ${symbol}${orderType === "market" ? "" : ` · ${ORDER_TYPES.find((t) => t.value === orderType)?.label}`}`
          )}
        </button>
      </form>
    );
  },
);

TransactionForm.displayName = "TransactionForm";
export default TransactionForm;
