import React from "react";
import { cn } from "@/utils/utils";

/**
 * One settings card: title and description on top, content, and an optional
 * footer for actions (e.g. Save) with a hint on the left.
 */
export default function SettingsSection({ title, description, action, footer, footerHint, children, className, as: Comp = "section", ...rest }) {
  return (
    <Comp className={cn("premium-card rounded-xl border border-line bg-surface shadow-card", className)} {...rest}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-fg-subtle">{description}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 py-5">{children}</div>
      {footer && (
        <div className="flex flex-col-reverse gap-3 rounded-b-xl border-t border-line bg-surface-2/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-fg-subtle">{footerHint}</p>
          <div className="flex justify-end gap-2">{footer}</div>
        </div>
      )}
    </Comp>
  );
}

/** Labelled input row used inside settings forms */
export function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-down">{error}</p> : hint && <p className="mt-1.5 text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
}
