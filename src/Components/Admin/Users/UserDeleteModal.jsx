import React from "react";
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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}
    >
      <div
        className={`w-full max-w-md rounded-2xl ${TC.modalContent} animate-in fade-in zoom-in duration-200`}
      >
        <div className={`p-6 flex justify-between items-center`}>
          <h3 className={`text-xl font-bold ${TC.textPrimary}`}>Delete User?</h3>
          <button
            onClick={() => setShowDeleteModal(false)}
            className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${
              isLight
                ? "text-gray-500 hover:text-red-600 hover:bg-red-100"
                : "text-gray-400 hover:text-white hover:bg-red-500/20"
            }`}
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-red-500 w-8 h-8" />
          </div>
          <p className={`mb-6 ${TC.textSecondary}`}>
            Are you sure you want to delete{" "}
            <span className="font-bold">{userToDelete?.name}</span>? This action
            cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className={`px-5 py-2.5 rounded-xl ${
                isLight
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}{" "}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDeleteModal;
