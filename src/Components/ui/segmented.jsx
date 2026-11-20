import * as React from "react";
import { cn } from "@/utils/utils";

/**
 * Compact single-choice control (timeframes, list filters).
 * Phones: 36px-tall options that scroll sideways instead of wrapping; the
 * selected one is kept in view by useScrollRows. From `sm` up it keeps its compact size.
 */
function Segmented({ options, value, onChange, className, size = "sm", label }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "premium-segmented inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-surface-2 p-0.5 no-scrollbar",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-md font-medium transition-colors",
              size === "sm"
                ? "min-h-[var(--control-h-sm)] px-2.5 text-[13px] sm:min-h-0 sm:py-1 sm:text-xs"
                : "min-h-[var(--control-h)] px-3.5 text-sm sm:min-h-0 sm:px-3 sm:py-1.5",
              active
                ? "bg-surface text-fg shadow-card ring-1 ring-line"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export { Segmented };
