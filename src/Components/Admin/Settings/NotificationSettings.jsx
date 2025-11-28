import React from "react";

function NotificationSettings({ notifications, setNotifications, TC }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3
          className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${TC.textPrimary}`}
        >
          Notification Preferences
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {[
            {
              key: "emailAlerts",
              label: "Email Alerts",
              description: "Receive important updates via email",
            },
            {
              key: "pushNotifications",
              label: "Push Notifications",
              description: "Get real-time push notifications",
            },
            {
              key: "securityAlerts",
              label: "Security Alerts",
              description: "Critical security notifications",
            },
          ].map((item) => (
            <div
              key={item.key}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl ${TC.bgItem} gap-3 sm:gap-4`}
            >
              <div>
                <h4
                  className={`font-medium text-sm sm:text-base ${TC.textPrimary}`}
                >
                  {item.label}
                </h4>
                <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>
                  {item.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      [item.key]: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;
