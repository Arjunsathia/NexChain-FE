import * as React from "react";
import { cn } from "@/utils/utils";

/** Compact single-choice control (timeframes, list filters) */
function Segmented({ options, value, onChange, className, size = "sm", label }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("premium-segmented inline-flex items-center gap-0.5 rounded-lg bg-surface-2 p-0.5", className)}
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
              "rounded-md font-medium transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
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
