import React from "react";
import { FaGlobe, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "@/hooks/useTheme";
import useThemeCheck from "@/hooks/useThemeCheck";

const PreferenceSettings = () => {
  const { toggleTheme } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <FaGlobe className="text-cyan-500" /> Preferences
      </h2>
      
      <div className="rounded-xl p-4 border bg-gray-50 border-gray-200 dark:bg-gray-700/30 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Dark Mode</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle application theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors !bg-gray-100 text-gray-600 hover:bg-gray-200 dark:!bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
          >
            <div className="show-in-light">
                <FaMoon className="text-xl" />
            </div>
            <div className="show-in-dark">
                <FaSun className="text-xl" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSettings;
