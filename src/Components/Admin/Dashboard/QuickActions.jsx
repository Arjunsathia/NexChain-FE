import React from "react";
import { FaBolt } from "react-icons/fa";

function QuickActions({ isLoading, handleQuickAction, TC }) {
  return (
    <div className={`${TC.bgCard} rounded-2xl p-3 sm:p-4`}>
      <h3
        className={`text-sm sm:text-lg font-bold ${TC.textPrimary} mb-2 sm:mb-4 flex items-center gap-2`}
      >
        <FaBolt className="text-amber-400 text-xs sm:text-base" /> Quick Actions
      </h3>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-8 sm:h-10 rounded-xl animate-pulse bg-gray-700/30"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {[
            { label: "Add Coin", action: "addCoin" },
            { label: "Users", action: "viewUsers" },
            { label: "Settings", action: "systemSettings" },
            { label: "Reports", action: "generateReport" },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action.action)}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-cyan-500/10"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuickActions;
