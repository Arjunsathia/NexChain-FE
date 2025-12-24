import React from "react";
import { FaGlobe, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "@/hooks/useTheme";


const PreferenceSettings = ({ TC, isLight }) => {
  const { toggleTheme } = useTheme();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h2 className={`text-lg font-bold mb-5 flex items-center gap-2 ${TC.textPrimary} tracking-tight`}>
        <FaGlobe className="text-cyan-500" /> Platform Preferences
      </h2>

      <div className={`rounded-xl p-5 border transition-all ${TC.bgItem}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className={`font-bold text-sm sm:text-base ${TC.textPrimary}`}>Visual Appearance</h3>
            <p className={`text-[10px] sm:text-xs font-medium ${TC.textSecondary} mt-1`}>
              Customize how NexChain looks on your device
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all border shadow-sm
                ${isLight
                ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                : "bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700"
              }`}
          >
            {isLight ? <FaMoon className="text-xl" /> : <FaSun className="text-xl" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSettings;
