import React from "react";

function GeneralSettings({ settings, setSettings, TC }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3
          className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${TC.textPrimary}`}
        >
          General Settings
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label
              className={`block text-xs sm:text-sm font-bold mb-2 uppercase tracking-wide ${TC.textSecondary}`}
            >
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) =>
                setSettings({ ...settings, platformName: e.target.value })
              }
              className={`w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm outline-none transition-all border ${TC.bgInput}`}
            />
          </div>
          <div>
            <label
              className={`block text-xs sm:text-sm font-bold mb-2 uppercase tracking-wide ${TC.textSecondary}`}
            >
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings({ ...settings, contactEmail: e.target.value })
              }
              className={`w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm outline-none transition-all border ${TC.bgInput}`}
            />
          </div>
          <div>
            <label
              className={`block text-xs sm:text-sm font-bold mb-2 uppercase tracking-wide ${TC.textSecondary}`}
            >
              Support Email
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, supportEmail: e.target.value })
              }
              className={`w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm outline-none transition-all border ${TC.bgInput}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneralSettings;
