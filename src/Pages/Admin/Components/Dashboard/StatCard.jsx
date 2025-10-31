import React from "react";

function StatCard({ title, value, icon, description, trend }) {
  // Determine trend color and icon
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
    <div className="bg-transparent p-4 sm:p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon || "📊"}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-white">
          {value}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;
