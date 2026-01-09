import React from "react";
import { MdDeleteForever } from "react-icons/md";

function RemoveConfirmationModal({ show, onClose, onConfirm, coin, isLight }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in-fast">
      <div
        className={`rounded-2xl p-5 max-w-sm w-full mx-auto fade-in-fast shadow-2xl border ${
          isLight
            ? "bg-white border-gray-200"
            : "bg-gray-800/90 backdrop-blur-md border-gray-700"
        }`}
      >
        <div className="text-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isLight ? "bg-red-100" : "bg-red-500/20"
            }`}
          >
            <MdDeleteForever
              className={`text-2xl ${isLight ? "text-red-600" : "text-red-400"}`}
            />
          </div>

          <h3
            className={`text-lg font-bold mb-1 ${isLight ? "text-gray-900" : "text-white"}`}
          >
            Remove from Watchlist?
          </h3>

          <p
            className={`text-xs sm:text-sm mb-5 ${isLight ? "text-gray-600" : "text-gray-400"}`}
          >
            Are you sure you want to remove{" "}
            <span
              className={`font-semibold ${isLight ? "text-gray-900" : "text-white"}`}
            >
              {coin?.name}
            </span>{" "}
            from your watchlist?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                isLight
                  ? "bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200"
                  : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <MdDeleteForever className="text-sm" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RemoveConfirmationModal;
