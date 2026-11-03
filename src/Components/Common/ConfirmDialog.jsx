import React from "react";
import { AlertTriangle, LogOut, Info } from "lucide-react";
import { Modal, ModalTitle } from "@/Components/ui/modal";
import { cn } from "@/utils/utils";

const VARIANTS = {
  danger: { icon: LogOut, iconClass: "bg-down-soft text-down", button: "bg-down hover:bg-down/90 text-white" },
  info: { icon: Info, iconClass: "bg-brand-soft text-brand", button: "bg-brand hover:bg-brand-hover text-brand-fg" },
  warning: { icon: AlertTriangle, iconClass: "bg-warn/15 text-warn", button: "bg-warn hover:bg-warn/90 text-black" },
};

/**
 * Confirmation dialog.
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onClose - Called when cancelled or dismissed
 * @param {Function} props.onConfirm - Called when the user confirms
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.confirmText]
 * @param {string} [props.cancelText]
 * @param {"warning"|"danger"|"info"} [props.variant]
 * @param {import("react").ComponentType} [props.icon] - Overrides the variant's icon
 */
const ConfirmDialog = ({
  show,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  icon,
}) => {
  const style = VARIANTS[variant] || VARIANTS.warning;
  const Icon = icon || style.icon;

  return (
    <Modal open={!!show} onClose={onClose} size="sm">
      <div className="p-5">
        <div className="flex gap-4">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", style.iconClass)}>
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <ModalTitle className="text-base font-semibold text-fg">{title || "Are you sure?"}</ModalTitle>
            {message && <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{message}</p>}
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn("rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors", style.button)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
