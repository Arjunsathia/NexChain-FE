import React from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Shield, Archive, X } from "lucide-react";

const ActionConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  userName,
  loading,
  TC,
}) => {
  const isArchive = actionType === "archive";
  const isRestore = actionType === "restore";

  // New Action Types
  const isPromoteAdmin = actionType === "promote_admin";
  const isDemoteAdmin = actionType === "demote_admin";
  const isPromoteSuper = actionType === "promote_super";
  const isDemoteSuper = actionType === "demote_super";

  let title = "";
  let description = "";
  let confirmText = "";
  let icon = null;
  let confirmBtnClass = "";

  if (isArchive) {
    title = "Archive Account";
    description = `Are you sure you want to archive ${userName}? The user will not be able to trade or login.`;
    confirmText = "Archive User";
    icon = <Archive className="w-6 h-6 text-orange-500" />;
    confirmBtnClass = "bg-orange-500 hover:bg-orange-600 text-white";
  } else if (isRestore) {
    title = "Restore Account";
    description = `Are you sure you want to restore ${userName}? The user will regain access to trading and login.`;
    confirmText = "Restore User";
    icon = <Archive className="w-6 h-6 text-green-500" />;
    confirmBtnClass = "bg-green-500 hover:bg-green-600 text-white";
  } else if (isPromoteAdmin) {
    title = "Promote to Admin";
    description = `Are you sure you want to promote ${userName} to Admin? They will have limited administrative access.`;
    confirmText = "Promote to Admin";
    icon = <Shield className="w-6 h-6 text-blue-500" />;
    confirmBtnClass = "bg-blue-600 hover:bg-blue-700 text-white";
  } else if (isDemoteAdmin) {
    title = "Revoke Admin Access";
    description = `Are you sure you want to demote ${userName} back to User? They will lose all administrative access.`;
    confirmText = "Revoke Admin";
    icon = <Shield className="w-6 h-6 text-red-500" />;
    confirmBtnClass = "bg-red-600 hover:bg-red-700 text-white";
  } else if (isPromoteSuper) {
    title = "Promote to Super Admin";
    description = `⚠️ CRITICAL: Are you sure you want to promote ${userName} to Super Admin? This action cannot be undone by ordinary admins. They will have FULL system control.`;
    confirmText = "Promote to Super Admin";
    icon = <Shield className="w-6 h-6 text-purple-600" />;
    confirmBtnClass = "bg-purple-600 hover:bg-purple-700 text-white";
  } else if (isDemoteSuper) {
    title = "Demote Super Admin";
    description = `⚠️ CRITICAL: Are you sure you want to demote ${userName} from Super Admin?`;
    confirmText = "Demote Super Admin";
    icon = <Shield className="w-6 h-6 text-orange-600" />;
    confirmBtnClass = "bg-orange-600 hover:bg-orange-700 text-white";
  }

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-[99999]"
      onClose={onClose}
      transition
    >
      <DialogBackdrop
        className={`fixed inset-0 ${TC.modalOverlay} transition duration-300 data-[closed]:opacity-0 ease-out`}
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
            className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 ${TC.bgPanel} border ${TC.border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-full ${isArchive ? "bg-orange-500/10" : isRestore ? "bg-green-500/10" : "bg-blue-500/10"}`}
              >
                {icon}
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 ${TC.textSecondary}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DialogTitle
              as="h3"
              className={`text-lg font-bold leading-6 ${TC.textPrimary} mb-2`}
            >
              {title}
            </DialogTitle>
            <div className="mt-2">
              <p className={`text-sm ${TC.textSecondary}`}>{description}</p>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                className={`px-4 py-2 rounded-xl text-sm font-medium border ${TC.border} ${TC.textSecondary} hover:bg-gray-100 dark:hover:bg-white/5 transition-colors`}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${confirmBtnClass}`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Processing..." : confirmText}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default ActionConfirmModal;
