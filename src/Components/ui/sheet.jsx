import * as React from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/utils/utils";

/**
 * Slide-over panel for record details: from the right on desktop, from the
 * bottom on phones. Same focus/Escape handling as Modal; nested dialogs must be
 * rendered inside its children to stay interactive.
 */
function Sheet({ open, onClose, children, className, label }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[9000]" aria-label={label}>
      <DialogBackdrop transition className="fixed inset-0 bg-black/45 transition-opacity duration-200 data-[closed]:opacity-0" />
      <div className="fixed inset-0 flex items-end justify-end sm:items-stretch">
        <DialogPanel
          transition
          className={cn(
            "flex max-h-[92dvh] w-full flex-col overflow-hidden border-line surface-panel bg-surface text-fg shadow-pop",
            "rounded-t-2xl border-t sm:max-h-none sm:max-w-[560px] sm:rounded-none sm:border-l sm:border-t-0",
            "transition duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] data-[closed]:translate-y-8 data-[closed]:opacity-0",
            "sm:data-[closed]:translate-x-8 sm:data-[closed]:translate-y-0",
            className,
          )}
        >
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

/** Sticky header with title, optional subtitle/content and close button */
function SheetHeader({ title, subtitle, onClose, children }) {
  return (
    <div className="flex shrink-0 items-start gap-3 border-b border-line px-5 py-4">
      <div className="min-w-0 flex-1">
        {children || (
          <>
            <DialogTitle className="text-base font-semibold text-fg">{title}</DialogTitle>
            {subtitle && <p className="mt-0.5 text-xs text-fg-subtle">{subtitle}</p>}
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="-mr-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
      >
        <X size={18} />
      </button>
    </div>
  );
}

/** Scrollable body */
function SheetBody({ className, children }) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5", className)}>{children}</div>;
}

export { Sheet, SheetHeader, SheetBody, DialogTitle as SheetTitle };
