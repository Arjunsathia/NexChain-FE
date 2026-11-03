import * as React from "react";
import { cn } from "@/utils/utils";

/**
 * Signed percentage in gain/loss colors, e.g. "+2.41%".
 * `pill` adds a tinted background for use next to large numbers.
 */
function Delta({ value, pill = false, digits = 2, className }) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return <span className={cn("text-fg-subtle tabular", className)}>–</span>;
  }
  // A change that rounds to zero is neither a gain nor a loss ("−0.00%")
  const flat = Number(Math.abs(n).toFixed(digits)) === 0;
  const up = n >= 0;
  return (
    <span
      className={cn(
        "tabular font-medium whitespace-nowrap",
        flat ? "text-fg-subtle" : up ? "text-up" : "text-down",
        pill && [
          "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs",
          flat ? "bg-surface-2" : up ? "bg-up-soft" : "bg-down-soft",
        ],
        className,
      )}
    >
      {flat ? "" : up ? "+" : "−"}
      {Math.abs(n).toFixed(digits)}%
    </span>
  );
}

export { Delta };
