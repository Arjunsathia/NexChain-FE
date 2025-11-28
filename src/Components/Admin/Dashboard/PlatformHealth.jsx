import React from "react";
import { FaServer, FaBolt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

function PlatformHealth({ isLoading, TC }) {
  return (
    <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
      <h3
        className={`text-base sm:text-lg font-bold ${TC.textPrimary} mb-3 sm:mb-4 flex items-center gap-2`}
      >
        <FaServer className="text-green-400 text-sm sm:text-base" /> Platform
        Health
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {isLoading ? (
          <>
            <div className={`h-12 rounded-xl ${TC.bgItem} animate-pulse`} />
            <div className={`h-12 rounded-xl ${TC.bgItem} animate-pulse`} />
            <div className={`h-12 rounded-xl ${TC.bgItem} animate-pulse`} />
          </>
        ) : (
          [
            {
              label: "API Latency",
              value: "24ms",
              icon: FaBolt,
              color: "text-yellow-400",
            },
            {
              label: "Database",
              value: "Healthy",
              icon: FaCheckCircle,
              color: "text-green-400",
            },
            {
              label: "Error Rate",
              value: "0.01%",
              icon: FaExclamationTriangle,
              color: "text-red-400",
            },
          ].map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={i}
                className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} transition-colors`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <ItemIcon className={`text-xs sm:text-sm ${item.color}`} />
                  <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>
                    {item.label}
                  </span>
                </div>
                <span
                  className={`text-xs sm:text-sm font-mono font-semibold ${TC.textPrimary}`}
                >
                  {item.value}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PlatformHealth;
