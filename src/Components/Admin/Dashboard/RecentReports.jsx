import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

function RecentReports({ reports, isLoading, TC }) {
  return (
    <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2
          className={`text-base sm:text-lg font-bold ${TC.textPrimary} flex items-center gap-2`}
        >
          <FaExclamationTriangle className="text-red-400 text-sm sm:text-base" />{" "}
          Recent Reports
        </h2>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-lg ${TC.bgItem} ${TC.textSecondary}`}
        >
          {reports.length} Total
        </span>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`p-3 sm:p-4 rounded-xl ${TC.bgItem} animate-pulse`}
              />
            ))}
          </>
        ) : (
          reports.slice(0, 4).map((report, i) => (
            <div
              key={report.id ?? i}
              className={`p-3 sm:p-4 rounded-xl ${TC.bgItem} transition-all duration-200 group`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4
                  className={`font-medium text-sm sm:text-base ${TC.textPrimary} transition-colors line-clamp-1`}
                >
                  {report.title}
                </h4>
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                    report.status === "open"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${TC.textSecondary} capitalize`}>
                  {report.type}
                </span>
                <span className={`text-xs ${TC.textSecondary}`}>
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          ))
        )}
        {!isLoading && reports.length === 0 && (
          <div className={`text-center ${TC.textSecondary} py-8 text-sm`}>
            No active reports
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentReports;
