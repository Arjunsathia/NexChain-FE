import React from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Loader2 } from "lucide-react";

function UserDeleteModal({
  showDeleteModal,
  setShowDeleteModal,
  userToDelete,
  handleDelete,
  deleteLoading,
  TC,
  isLight,
}) {
  if (!showDeleteModal) return null;

  // Use Portal to ensure modal is always on top (z-index 9999) and immune to parent overflow/transforms
  return createPortal(
    <div
      className={`fixed inset-0 z-[100000] flex items-center justify-center p-4 ${TC?.modalOverlay || "bg-black/60 backdrop-blur-sm"
        }`}
    >
      <div
        className={`w-[90vw] max-w-[320px] sm:max-w-md rounded-2xl animate-in fade-in zoom-in duration-200 shadow-2xl transition-all ${TC?.modalContent || (isLight ? "bg-white border border-gray-100" : "bg-[#1A1D26] border border-gray-800")
          }`}
      >
        <div className={`px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center border-b ${isLight ? "border-gray-100" : "border-gray-800"}`}>
          <h3 className={`text-lg sm:text-xl font-bold ${TC?.textPrimary || (isLight ? "text-gray-900" : "text-white")}`}>Delete User?</h3>
          <button
            onClick={() => setShowDeleteModal(false)}
            className={`transition-all duration-200 p-1.5 rounded-lg hover:rotate-90 transform group ${isLight
              ? "text-gray-500 hover:text-red-600 hover:bg-red-100"
              : "text-gray-400 hover:text-white hover:bg-red-500/20"
              }`}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="p-4 sm:p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 animate-bounce-short">
            <Trash2 className="text-red-500 w-8 h-8" />
          </div>
          <p className={`mb-6 text-sm sm:text-base ${TC?.textSecondary || (isLight ? "text-gray-500" : "text-gray-400")}`}>
            Are you sure you want to delete{" "}
            <span className={`font-bold ${isLight ? "text-gray-900" : "text-white"}`}>{userToDelete?.name}</span>? This action
            cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className={`px-5 py-2.5 text-sm sm:text-base rounded-xl font-semibold transition-colors ${isLight
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-5 py-2.5 text-sm sm:text-base rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}{" "}
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default UserDeleteModal;
