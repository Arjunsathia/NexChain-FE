import React from "react";

function StatCard({ title, value, icon, description, trend }) {
  const getTrendColor = () => {
    if (!trend) return "text-gray-400";
    if (trend.startsWith("+")) return "text-green-400";
    if (trend.startsWith("-")) return "text-red-400";
    return "text-gray-400";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.startsWith("+")) return "↗";
    if (trend.startsWith("-")) return "↘";
    return "→";
  };

  return (
    <div className="bg-transparent p-3 sm:p-4 lg:p-6 rounded-xl border border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon || "📊"}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
          {value}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-1 sm:mt-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;