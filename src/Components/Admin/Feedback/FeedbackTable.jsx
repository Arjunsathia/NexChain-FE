import React from "react";
import {
  FaEye,
  FaTrash,
  FaBug,
  FaLightbulb,
  FaStar,
  FaComments,
} from "react-icons/fa";

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
                  <div className="relative">
                    <select
                      value={feedback.status}
                      onChange={(e) =>
                        updateFeedbackStatus(feedback._id, e.target.value)
                      }
                      className={`appearance-none w-full text-[10px] sm:text-xs font-bold rounded-lg pl-3 pr-8 py-2 outline-none transition-all cursor-pointer border shadow-sm capitalize ${feedback.status === "new"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : feedback.status === "in-progress"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : feedback.status === "resolved"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }`}
                    >
                      <option value="new" className="text-gray-900 dark:text-gray-300">New</option>
                      <option value="in-progress" className="text-gray-900 dark:text-gray-300">In Progress</option>
                      <option value="resolved" className="text-gray-900 dark:text-gray-300">Resolved</option>
                      <option value="closed" className="text-gray-900 dark:text-gray-300">Closed</option>
                    </select>
                    {/* Custom Dropdown Arrow */}
                    <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${feedback.status === "new"
                        ? "text-blue-500"
                        : feedback.status === "in-progress"
                          ? "text-amber-500"
                          : feedback.status === "resolved"
                            ? "text-emerald-500"
                            : "text-gray-500"
                      }`}>
                      <svg className="w-2.5 h-2.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
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
