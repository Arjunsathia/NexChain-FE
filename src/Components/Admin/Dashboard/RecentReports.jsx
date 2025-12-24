import { FaExclamationTriangle } from "react-icons/fa";

function RecentReports({ reports, isLoading, TC }) {
  const getIconColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'security': return "text-red-400 bg-red-400/10";
      case 'bug': return "text-amber-400 bg-amber-400/10";
      default: return "text-blue-400 bg-blue-400/10";
    }
  };

  return (
    <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2
          className={`text-sm sm:text-lg font-bold ${TC.textPrimary} flex items-center gap-3`}
        >
          <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shadow-sm">
            <FaExclamationTriangle className="text-sm" />
          </div>
          Recent Reports
        </h2>
        <span
          className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-lg ${TC.bgItem} ${TC.textSecondary}`}
        >
          {reports.length} Total
        </span>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`flex gap-3 p-3 rounded-xl ${TC.bgItem} animate-pulse`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-700/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-gray-700/20 rounded" />
                  <div className="h-2 w-1/2 bg-gray-700/20 rounded" />
                </div>
              </div>
            ))}
          </>
        ) : (
          reports.slice(0, 4).map((report, i) => (
            <div
              key={report.id ?? i}
              className={`group flex items-start gap-3 p-3.5 rounded-2xl ${TC.bgItem} transition-all duration-300 hover:shadow-lg hover:shadow-black/5`}
            >
              {/* Icon Indicator */}
              <div className={`mt-0.5 p-2 rounded-lg ${getIconColor(report.type)} flex-shrink-0`}>
                <FaExclamationTriangle className="text-xs" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold text-xs sm:text-sm ${TC.textPrimary} line-clamp-1 mb-1`}>
                    {report.title}
                  </h4>
                  <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md whitespace-nowrap ml-2 ${report.status === "open"
                    ? "bg-red-500/10 text-red-500 border border-red-500/10"
                    : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/10"
                    }`}>
                    {report.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium ${TC.textSecondary} capitalize`}>
                    {report.type}
                  </span>
                  <span className={`text-[10px] ${TC.textTertiary}`}>•</span>
                  <span className={`text-[10px] ${TC.textTertiary}`}>
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {!isLoading && reports.length === 0 && (
          <div className={`text-center ${TC.textSecondary} py-8 text-xs sm:text-sm`}>
            No active reports
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentReports;
