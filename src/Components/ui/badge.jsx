import * as React from "react";
import { cn } from "@/utils/utils";

const TONES = {
  neutral: "bg-surface-2 text-fg-muted",
  brand: "bg-brand-soft text-brand",
  up: "bg-up-soft text-up",
  down: "bg-down-soft text-down",
  warn: "bg-warn/15 text-warn",
  violet: "bg-violet-500/12 text-violet-500",
};

/** Small status label. `dot` adds a leading colored dot. */
function Badge({ tone = "neutral", dot = false, className, children }) {
  return (
    <span className={cn("premium-badge inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium", TONES[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export { Badge };
