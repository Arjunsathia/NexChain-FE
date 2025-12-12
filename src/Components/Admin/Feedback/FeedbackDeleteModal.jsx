import React from "react";
import { MdDeleteForever } from "react-icons/md";

function FeedbackDeleteModal({
  showDeleteModal,
  setShowDeleteModal,
  TC,
  isLight,
  deleteFeedback,
}) {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className={`rounded-2xl p-4 sm:p-6 w-[90vw] max-w-[320px] sm:max-w-md mx-auto fade-in shadow-2xl border ${
        isLight ? "bg-white border-gray-200" : "bg-gray-800/90 backdrop-blur-md border-gray-700"
      }`}>
        <div className="text-center">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
            isLight ? "bg-red-100" : "bg-red-500/20"
          }`}>
            <MdDeleteForever className={`text-2xl sm:text-3xl ${isLight ? "text-red-600" : "text-red-400"}`} />
          </div>
          
          <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isLight ? "text-gray-900" : "text-white"}`}>
            Delete Feedback?
          </h3>
          
          <p className={`text-xs sm:text-sm mb-5 sm:mb-6 ${isLight ? "text-gray-600" : "text-gray-400"}`}>
            Are you sure you want to delete this feedback? This action cannot be undone.
          </p>
          
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                isLight ? "bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200" : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
              }`}>
              Cancel
            </button>
            <button
              onClick={deleteFeedback}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg">
              <MdDeleteForever className="text-base sm:text-lg" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackDeleteModal;
