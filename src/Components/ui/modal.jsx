import * as React from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/utils/utils";

/**
 * Accessible modal: bottom sheet on phones, centered dialog from `sm` up.
 * Handles focus trapping, Escape, scroll locking and enter/exit transitions.
 * Nested modals must be rendered inside this one's children to stay interactive.
 */
function Modal({ open, onClose, children, className, size = "md", label }) {
  const width = { sm: "sm:max-w-sm", md: "sm:max-w-[420px]", lg: "sm:max-w-lg" }[size];
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[9999]" aria-label={label}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/55 transition-opacity duration-200 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4">
        <DialogPanel
          transition
          className={cn(
            "relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain border border-line surface-panel bg-surface text-fg shadow-pop",
            "rounded-t-2xl sm:rounded-2xl",
            "transition duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "data-[closed]:translate-y-6 data-[closed]:opacity-0 sm:data-[closed]:translate-y-2 sm:data-[closed]:scale-[0.98]",
            width,
            className,
          )}
        >
          {/* Grab handle hints that the sheet can be dismissed on phones */}
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong sm:hidden" aria-hidden="true" />
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

/** Title row with an optional subtitle and a close button */
function ModalHeader({ title, subtitle, onClose, children, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-5 pt-4 pb-3", className)}>
      <div className="min-w-0 flex-1">
        {children || (
          <>
            <DialogTitle className="text-base font-semibold text-fg">{title}</DialogTitle>
            {subtitle && <p className="mt-0.5 text-xs text-fg-subtle">{subtitle}</p>}
          </>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export { Modal, ModalHeader, DialogTitle as ModalTitle };
