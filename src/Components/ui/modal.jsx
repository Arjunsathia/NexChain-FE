import * as React from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/utils/utils";
import useKeyboardInset from "@/hooks/useKeyboardInset";

/**
 * Accessible modal: bottom sheet on phones, centered dialog from `sm` up.
 * Handles focus trapping, Escape, scroll locking and enter/exit transitions.
 * Nested modals must be rendered inside this one's children to stay interactive.
 */
function Modal({ open, onClose, children, className, size = "md", label }) {
  const width = { sm: "sm:max-w-sm", md: "sm:max-w-[420px]", lg: "sm:max-w-lg" }[size];
  // Phones: lift the sheet above the on-screen keyboard so its main button stays reachable while typing
  const keyboard = useKeyboardInset(open);
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[9999]" aria-label={label}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/55 transition-opacity duration-200 ease-out data-[closed]:opacity-0 max-sm:duration-300 max-sm:data-[leave]:duration-200"
      />
      <div
        className="fixed inset-0 flex items-end justify-center transition-[padding] duration-150 sm:items-center sm:p-4"
        style={keyboard.inset ? { paddingBottom: keyboard.inset } : undefined}
      >
        <DialogPanel
          transition
          className={cn(
            "relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain border border-line surface-panel bg-surface text-fg shadow-pop",
            "rounded-t-2xl pb-[env(safe-area-inset-bottom)] sm:rounded-2xl sm:pb-0",
            "transition duration-200 ease-[var(--ease-sheet)]",
            "sm:data-[closed]:translate-y-2 sm:data-[closed]:scale-[0.98] sm:data-[closed]:opacity-0",
            // Phones: the whole sheet slides up from the bottom edge
            "max-sm:duration-300 max-sm:data-[leave]:duration-200 max-sm:data-[closed]:translate-y-full",
            "motion-reduce:max-sm:data-[closed]:translate-y-0 motion-reduce:data-[closed]:opacity-0",
            width,
            className,
          )}
          style={keyboard.inset ? { maxHeight: keyboard.height - 8 } : undefined}
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
          className="-mr-1.5 grid size-10 shrink-0 place-items-center rounded-lg sm:size-8 text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export { Modal, ModalHeader, DialogTitle as ModalTitle };
