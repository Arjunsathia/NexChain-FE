import React from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <div
      className={`fixed inset-0 z-[2005] flex items-center justify-center p-2 sm:p-4 ${TC.modalOverlay} animate-in fade-in duration-300`}
    >
      <div
        className={`w-full max-w-[450px] sm:max-w-2xl lg:max-w-4xl rounded-3xl overflow-hidden ${TC.modalContent} animate-in zoom-in duration-300 relative shadow-2xl border ${isLight ? "border-gray-200" : "border-white/5"}`}
      >
        <div
          className={`px-5 py-5 sm:px-8 sm:py-6 flex justify-between items-center bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b ${isLight ? "border-gray-100" : "border-white/5"}`}
        >
          <div>
            <h2 className={`text-xl sm:text-2xl font-black ${TC.textPrimary}`}>
              Feedback Details
            </h2>
            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${TC.textSecondary} mt-1`}>
              In-depth user submission review
            </p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className={`transition-all duration-300 p-2.5 rounded-xl group hover:scale-105 ${isLight
              ? "bg-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50"
              : "bg-white/5 text-gray-400 hover:text-white hover:bg-red-500/20"
              }`}
          >
            <FaTimes className="text-lg group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        <div className="p-5 sm:p-8 space-y-5 sm:space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className={`p-5 rounded-2xl border ${isLight ? "border-gray-100 bg-gray-50/50" : "border-white/5 bg-white/[0.02]"} transition-all hover:bg-white/[0.04] group`}>
              <p
                className={`text-[10px] sm:text-xs uppercase font-black tracking-widest mb-3 ${TC.textSecondary}`}
              >
                User Account
              </p>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shadow-sm border border-blue-500/10">
                  <FaUser className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm sm:text-lg font-black ${TC.textPrimary} truncate`}
                  >
                    {selectedFeedback.userEmail || "Anonymous User"}
                  </p>
                  <p className={`text-[10px] font-bold ${TC.textSecondary} uppercase`}>Verified Contributor</p>
                </div>
              </div>
            </div>
            <div className={`p-5 rounded-2xl border ${isLight ? "border-gray-100 bg-gray-50/50" : "border-white/5 bg-white/[0.02]"} transition-all hover:bg-white/[0.04] group`}>
              <p
                className={`text-[10px] sm:text-xs uppercase font-black tracking-widest mb-3 ${TC.textSecondary}`}
              >
                Submission Time
              </p>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 shadow-sm border border-purple-500/10">
                  <FaClock className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className={`text-sm sm:text-lg font-black ${TC.textPrimary}`}
                  >
                    {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                  </p>
                  <p className={`text-[10px] font-bold ${TC.textSecondary} uppercase`}>
                    {new Date(selectedFeedback.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`p-6 sm:p-8 rounded-3xl border ${isLight ? "border-gray-100 bg-gray-50/50" : "border-white/5 bg-white/[0.02]"} relative overflow-hidden group transition-all hover:bg-white/[0.04]`}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors duration-700" />
            <p
              className={`text-[10px] sm:text-xs uppercase font-black tracking-widest mb-4 ${TC.textSecondary}`}
            >
              Feedback Message
            </p>
            <p
              className={`text-sm sm:text-lg leading-relaxed font-medium ${TC.textPrimary} relative z-10`}
            >
              {selectedFeedback.message}
            </p>
          </div>
          <div className="space-y-4">
            <label
              className={`text-[10px] sm:text-xs uppercase font-black tracking-widest block px-1 ${TC.textSecondary}`}
            >
              Internal Admin Notes
            </label>
            <div className="relative group">
              <textarea
                className={`w-full rounded-2xl p-5 min-h-[140px] text-sm font-bold outline-none transition-all border shadow-inner ${isLight ? "bg-white border-gray-200 focus:border-blue-500" : "bg-black/20 border-white/5 focus:border-cyan-500/50 focus:bg-black/40"}`}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Record any actions taken or internal comments regarding this feedback..."
              />
              <div className="absolute bottom-4 right-4 text-[10px] font-black uppercase text-gray-500 pointer-events-none opacity-50">
                Admin Only
              </div>
            </div>
          </div>
        </div>
        <div
          className={`px-5 py-5 sm:px-8 sm:py-6 flex justify-end gap-3 border-t ${isLight ? "border-gray-100 bg-gray-50/30" : "border-white/5 bg-white/[0.01]"}`}
        >
          <button
            onClick={() => setShowModal(false)}
            className={`px-5 py-2.5 text-sm font-black rounded-xl transition-all duration-300 hover:bg-gray-500/10 ${TC.textSecondary}`}
          >
            Cancel
          </button>
          <button
            onClick={() => updateFeedbackNotes(selectedFeedback._id, editNotes)}
            className={`${TC.btnPrimary} px-6 py-2.5 rounded-xl font-black text-sm shadow-xl active:scale-[0.98] transition-transform`}
          >
            Update Notes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default FeedbackDetailsModal;
