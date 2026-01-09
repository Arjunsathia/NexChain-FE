import React from "react";
import {
  FaChartBar,
  FaCalendarDay,
  FaLightbulb,
  FaCheckCircle,
} from "react-icons/fa";

function FeedbackStats({ stats, TC }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
      {[
        {
          label: "Total",
          value: stats.total || 0,
          icon: FaChartBar,
          color: "from-blue-500 to-cyan-500",
        },
        {
          label: "Today",
          value: stats.today || 0,
          icon: FaCalendarDay,
          color: "from-indigo-500 to-blue-500",
        },
        {
          label: "In Progress",
          value: stats.inProgress || 0,
          icon: FaLightbulb,
          color: "from-amber-500 to-orange-500",
        },
        {
          label: "Resolved",
          value: stats.resolved || 0,
          icon: FaCheckCircle,
          color: "from-emerald-500 to-green-500",
        },
      ].map((stat, i) => (
        <div
          key={i}
          className={`${TC.bgStatsCard} p-4 sm:p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md h-full`}
        >
          {/* Background Gradient Splash */}
          <div
            className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="flex items-center gap-4 relative z-10 h-full">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg text-white group-hover:shadow-blue-500/40 transition-shadow`}
            >
              <stat.icon className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-[10px] uppercase font-bold tracking-wider leading-none mb-1.5 ${TC.textSecondary}`}
              >
                {stat.label}
              </p>
              <h3
                className={`text-xl sm:text-2xl font-bold leading-tight truncate ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}
              >
                {stat.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeedbackStats;
