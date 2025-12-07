import React from "react";
import { FaGlobe, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "@/Context/ThemeContext";

const PreferenceSettings = () => {
  const { isDark, toggleTheme } = useTheme();

  // Theme Classes
  const containerClass = `rounded-xl p-4 border ${
    isDark ? "bg-gray-700/30 border-gray-700" : "bg-gray-50 border-gray-200"
  }`;
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const buttonClass = `p-2 rounded-lg transition-colors ${
    isDark 
      ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" 
      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
  }`;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
        <FaGlobe className="text-cyan-500" /> Preferences
      </h2>
      
      <div className={containerClass}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className={`font-semibold ${textPrimary}`}>Dark Mode</h3>
            <p className={`text-sm ${textSecondary}`}>Toggle application theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={buttonClass}
          >
            {isDark ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSettings;
