import React from "react";
import { FaTimes, FaUser, FaClock } from "react-icons/fa";

function FeedbackDetailsModal({
  selectedFeedback,
  setShowModal,
  TC,
  isLight,
  editNotes,
  setEditNotes,
  updateFeedbackNotes,
}) {
  if (!selectedFeedback) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}
    >
      <div
        className={`w-[90vw] max-w-[320px] sm:max-w-2xl lg:max-w-4xl rounded-2xl overflow-hidden ${TC.modalContent} animate-in fade-in zoom-in duration-300 relative shadow-2xl border ${isLight ? 'border-gray-200' : 'border-white/5'}`}
      >
        <div className={`px-4 py-3 sm:p-6 flex justify-between items-center bg-gradient-to-r ${TC.headerGradient} bg-opacity-10`}>
          <h2 className={`text-lg sm:text-xl font-bold ${TC.textPrimary}`}>
            Feedback Details
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className={`transition-all duration-300 p-2 rounded-xl group hover:scale-110 ${isLight
                ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
                : "text-gray-400 hover:text-white hover:bg-red-500/20"
              }`}
          >
            <FaTimes className="text-base sm:text-lg group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className={`p-4 rounded-xl border ${TC.bgItem}`}>
              <p className={`text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-2 ${TC.textSecondary}`}>
                User Account
              </p>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <FaUser className="w-4 h-4" />
                </div>
                <p className={`text-xs sm:text-base font-bold ${TC.textPrimary}`}>
                  {selectedFeedback.userEmail || "Anonymous User"}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${TC.bgItem}`}>
              <p className={`text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-2 ${TC.textSecondary}`}>
                Submission Time
              </p>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <FaClock className="w-4 h-4" />
                </div>
                <p className={`text-xs sm:text-base font-bold ${TC.textPrimary}`}>
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className={`p-5 rounded-2xl border ${TC.bgItem} relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
            <p className={`text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-3 ${TC.textSecondary}`}>
              Feedback Message
            </p>
            <p className={`text-sm sm:text-base leading-relaxed ${TC.textPrimary} relative z-10`}>
              {selectedFeedback.message}
            </p>
          </div>
          <div className="space-y-3">
            <label
              className={`text-[10px] sm:text-xs uppercase font-bold tracking-wider block ${TC.textSecondary}`}
            >
              Internal Admin Notes
            </label>
            <textarea
              className={`w-full rounded-2xl p-4 min-h-[120px] text-sm font-medium outline-none transition-all border shadow-inner ${TC.bgInput}`}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Record any actions taken or internal comments regarding this feedback..."
            />
          </div>
        </div>
        <div className={`px-4 py-3 sm:p-6 flex justify-end gap-3 border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
          <button
            onClick={() => setShowModal(false)}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 hover:bg-gray-200/50 ${TC.textSecondary}`}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              updateFeedbackNotes(selectedFeedback._id, editNotes)
            }
            className={TC.btnPrimary}
          >
            Update Notes
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackDetailsModal;
