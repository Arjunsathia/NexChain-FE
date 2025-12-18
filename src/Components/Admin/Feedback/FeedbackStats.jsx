import React from "react";
import { FaChartBar, FaCalendarDay, FaLightbulb, FaCheckCircle } from "react-icons/fa";

function FeedbackStats({ stats, TC }) {
  const statItems = [
    {
      label: "Total",
      value: stats.total || 0,
      icon: FaChartBar,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      label: "Today",
      value: stats.today || 0,
      icon: FaCalendarDay,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "In Progress",
      value: stats.inProgress || 0,
      icon: FaLightbulb,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      label: "Resolved",
      value: stats.resolved || 0,
      icon: FaCheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statItems.map((stat, i) => (
        <div
          key={i}
          className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>
                {stat.label}
              </p>
              <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </h3>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${stat.bg} ${stat.border}`}>
              <stat.icon className={`text-base sm:text-lg ${stat.color}`} />
            </div>
          </div>
          {/* Glow Effect */}
          <div
            className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
          />
        </div>
      ))}
    </div>
  );
}

export default FeedbackStats;
