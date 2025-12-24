import React from "react";
import { FaShieldAlt, FaLock } from "react-icons/fa";

function SecuritySettings({ security, setSecurity, TC }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3
          className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${TC.textPrimary}`}
        >
          Security Settings
        </h3>

        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl ${TC.bgItem} gap-3 sm:gap-4 mb-4`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-cyan-500/10 rounded-lg text-cyan-500">
              <FaShieldAlt className="text-base sm:text-xl" />
            </div>
            <div>
              <h4
                className={`font-medium text-sm sm:text-base ${TC.textPrimary}`}
              >
                Two-Factor Authentication
              </h4>
              <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>
                Add an extra layer of security
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={security.twoFactor}
              onChange={(e) =>
                setSecurity({ ...security, twoFactor: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label
              className={`block text-xs sm:text-sm font-bold mb-2 uppercase tracking-wide ${TC.textSecondary}`}
            >
              Current Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm outline-none transition-all border ${TC.bgInput}`}
              />
            </div>
          </div>
          <div>
            <label
              className={`block text-xs sm:text-sm font-bold mb-2 uppercase tracking-wide ${TC.textSecondary}`}
            >
              New Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm outline-none transition-all border ${TC.bgInput}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySettings;
