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
        className={`w-full max-w-2xl rounded-2xl overflow-hidden ${TC.modalContent} animate-in fade-in zoom-in duration-300`}
      >
        <div className={`p-6 flex justify-between items-center`}>
          <h2 className={`text-xl font-bold ${TC.textPrimary}`}>
            Feedback Details
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${
              isLight
                ? "text-gray-500 hover:text-red-600 hover:bg-red-100"
                : "text-gray-400 hover:text-white hover:bg-red-500/20"
            }`}
          >
            <FaTimes className="text-lg group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${TC.bgItem}`}>
              <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>
                User
              </p>
              <p
                className={`font-medium flex items-center gap-2 ${TC.textPrimary}`}
              >
                <FaUser className="text-cyan-500" />{" "}
                {selectedFeedback.userEmail || "Anonymous"}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${TC.bgItem}`}>
              <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>
                Date
              </p>
              <p
                className={`font-medium flex items-center gap-2 ${TC.textPrimary}`}
              >
                <FaClock className="text-purple-500" />{" "}
                {new Date(selectedFeedback.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${TC.bgItem}`}>
            <p className={`text-xs uppercase mb-2 ${TC.textSecondary}`}>
              Message
            </p>
            <p className={`leading-relaxed ${TC.textPrimary}`}>
              {selectedFeedback.message}
            </p>
          </div>
          <div>
            <label
              className={`text-xs uppercase mb-2 block ${TC.textSecondary}`}
            >
              Admin Notes
            </label>
            <textarea
              className={`w-full rounded-xl p-4 min-h-[100px] outline-none focus:ring-1 focus:ring-cyan-500/50 ${TC.bgInput}`}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add internal notes..."
            />
          </div>
        </div>
        <div className={`p-6 flex justify-end gap-3`}>
          <button
            onClick={() => setShowModal(false)}
            className={`px-4 py-2 rounded-xl ${TC.btnSecondary}`}
          >
            Close
          </button>
          <button
            onClick={() =>
              updateFeedbackNotes(selectedFeedback._id, editNotes)
            }
            className={`px-4 py-2 rounded-xl ${TC.btnPrimary}`}
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackDetailsModal;
