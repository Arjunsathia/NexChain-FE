import React from "react";
import { MdDeleteForever } from "react-icons/md";

function FeedbackDeleteModal({
  showDeleteModal,
  setShowDeleteModal,

  isLight,
  deleteFeedback,
}) {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div
        className={`w-[90vw] max-w-[320px] sm:max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl animate-in zoom-in duration-300 border ${
          isLight ? "bg-white border-gray-200" : "bg-[#0B0E11] border-white/5"
        }`}
      >
        <div className="text-center">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-xl ${
              isLight ? "bg-red-50 text-red-600" : "bg-red-500/10 text-red-500"
            }`}
          >
            <MdDeleteForever className="text-3xl sm:text-4xl" />
          </div>

          <h3
            className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight ${isLight ? "text-gray-900" : "text-white"}`}
          >
            Delete Feedback
          </h3>

          <p
            className={`text-sm sm:text-base mb-6 sm:mb-8 font-medium leading-relaxed ${isLight ? "text-gray-500" : "text-gray-400"}`}
          >
            This action is permanent and cannot be reversed. Are you sure you
            want to proceed?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                isLight
                  ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={deleteFeedback}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
            >
              <MdDeleteForever className="text-lg" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackDeleteModal;
