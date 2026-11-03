import React from "react";
import { formatPrice } from "@/utils/format";

/** Where the price sits between a low and a high (the 24h range by default) */
export default function DayRange({ low, high, price, lowLabel = "24h low", highLabel = "24h high", className }) {
  if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) return null;
  const pos = Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100));
  return (
    <div className={className}>
      <div className="flex justify-between text-[11px] text-fg-subtle">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <div className="relative mt-1.5 h-1.5 rounded-full bg-surface-2">
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand/40" style={{ width: `${pos}%` }} />
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-brand"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="tabular mt-1.5 flex justify-between text-xs font-medium text-fg">
        <span>{formatPrice(low)}</span>
        <span>{formatPrice(high)}</span>
      </div>
    </div>
  );
}
