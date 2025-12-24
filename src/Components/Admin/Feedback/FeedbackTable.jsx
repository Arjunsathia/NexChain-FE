import React from "react";
import { FaEye, FaTrash, FaBug, FaLightbulb, FaStar, FaComments } from "react-icons/fa";

function FeedbackTable({
  filteredFeedbacks,
  TC,

  updateFeedbackStatus,
  setSelectedFeedback,
  setEditNotes,
  setShowModal,
  confirmDelete,
}) {
  const getTypeIcon = (type) => {
    const iconConfig = {
      bug: {
        icon: FaBug,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
      },
      suggestion: {
        icon: FaLightbulb,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20",
      },
      praise: {
        icon: FaStar,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
      },
      general: {
        icon: FaComments,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
      },
    };
    const config = iconConfig[type] || iconConfig.general;
    const IconComponent = config.icon;
    return (
      <div
        className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}
      >
        <IconComponent className={`text-sm ${config.color}`} />
      </div>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: {
        bg: "bg-green-500/10",
        text: "text-green-400",
        border: "border-green-500/20",
        dot: "bg-green-400",
      },
      medium: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        border: "border-yellow-500/20",
        dot: "bg-yellow-400",
      },
      high: {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/20",
        dot: "bg-orange-400",
      },
      critical: {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/20",
        dot: "bg-red-400",
      },
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}
      >
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        <span className={`text-xs font-semibold capitalize ${config.text}`}>
          {priority}
        </span>
      </div>
    );
  };

  return (
    <div className={`${TC.bgCard} rounded-2xl overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className={TC.tableHead}>
            <tr>
              <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold">
                Feedback
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold hidden md:table-cell">
                Type & Priority
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold">
                Status
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold hidden sm:table-cell">
                Date
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredFeedbacks.map((feedback) => (
              <tr key={feedback._id} className={`${TC.tableRow}`}>
                <td className="py-3 px-3 sm:py-4 sm:px-6">
                  <div className="max-w-xs sm:max-w-md">
                    <p
                      className={`text-xs sm:text-sm font-medium ${TC.textPrimary} line-clamp-2`}
                    >
                      {feedback.message}
                    </p>
                    {feedback.userEmail && (
                      <p
                        className={`text-[10px] sm:text-xs ${TC.textSecondary} mt-1 truncate`}
                      >
                        {feedback.userEmail}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6 hidden md:table-cell">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(feedback.type)}
                      <span
                        className={`text-xs font-semibold capitalize ${TC.textSecondary}`}
                      >
                        {feedback.type}
                      </span>
                    </div>
                    {getPriorityBadge(feedback.priority)}
                  </div>
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6">
                  <select
                    value={feedback.status}
                    onChange={(e) =>
                      updateFeedbackStatus(feedback._id, e.target.value)
                    }
                    className={`text-[10px] sm:text-xs font-semibold rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 outline-none transition-all cursor-pointer border ${TC.bgInput}`}
                  >
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td
                  className={`py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden sm:table-cell`}
                >
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFeedback(feedback);
                        setEditNotes(feedback.adminNotes || "");
                        setShowModal(true);
                      }}
                      className={TC.btnSecondary}
                      title="View Details"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    <button
                      onClick={() => confirmDelete(feedback)}
                      className={TC.btnDanger}
                      title="Delete"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeedbackTable;
