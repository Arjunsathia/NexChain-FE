import React from "react";

function ApiSettings({ apiSettings, setApiSettings, TC }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3
          className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${TC.textPrimary}`}
        >
          API Configuration
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label
              className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}
            >
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiSettings.apiKey}
                readOnly
                className={`flex-1 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm outline-none ${TC.bgInput}`}
              />
              <button
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium ${TC.btnPrimary}`}
              >
                Regenerate
              </button>
            </div>
          </div>
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl ${TC.bgItem} gap-3 sm:gap-4`}
          >
            <div>
              <h4
                className={`font-medium text-sm sm:text-base ${TC.textPrimary}`}
              >
                Rate Limiting
              </h4>
              <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>
                Enable API rate limiting
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={apiSettings.rateLimitEnabled}
                onChange={(e) =>
                  setApiSettings({
                    ...apiSettings,
                    rateLimitEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiSettings;
