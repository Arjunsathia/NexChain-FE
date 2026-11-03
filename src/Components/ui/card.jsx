import * as React from "react";
import { cn } from "@/utils/utils";

/** Bordered surface used by every dashboard panel */
function Card({ className, as: Comp = "section", ...props }) {
  return (
    <Comp
      data-slot="card"
      className={cn("premium-card min-w-0 rounded-xl border border-line bg-surface shadow-card", className)}
      {...props}
    />
  );
}

/** Title row: optional icon, title, subtitle, and an action on the right */
function CardHeader({ icon: Icon, title, subtitle, action, className }) {
  return (
    <header className={cn("flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3 sm:flex-nowrap", className)}>
      <div className="flex min-w-0 max-w-full items-center gap-2.5">
        {Icon && (
          <span className="grid place-items-center premium-card-icon size-8 rounded-lg bg-surface-2 text-fg-muted shrink-0">
            <Icon size={15} strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-fg truncate">{title}</h2>
          {subtitle && <p className="text-xs text-fg-subtle truncate">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}

/** Small text link used in card headers ("View all") */
function CardLink({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "text-xs font-medium text-fg-muted hover:text-brand transition-colors inline-flex items-center gap-1 shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Centered placeholder for empty lists and errors */
function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center gap-2 px-6 py-8", className)}>
      {Icon && (
        <span className="grid place-items-center size-10 rounded-full bg-surface-2 text-fg-subtle">
          <Icon size={18} />
        </span>
      )}
      <p className="text-sm font-medium text-fg">{title}</p>
      {description && <p className="text-xs text-fg-subtle max-w-[260px]">{description}</p>}
      {action}
    </div>
  );
}

export { Card, CardHeader, CardLink, EmptyState };
