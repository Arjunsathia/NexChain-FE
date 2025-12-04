import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import { useTheme } from "@/Context/ThemeContext";

const NotificationSettings = () => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    securityAlerts: true,
  });

  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  // Theme Classes
  const containerClass = `rounded-xl p-4 border flex items-center justify-between ${
    isDark ? "bg-gray-700/30 border-gray-700" : "bg-gray-50 border-gray-200"
  }`;
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const toggleBg = isDark ? "bg-gray-700 border-gray-600" : "bg-gray-200 border-gray-300";

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
        <FaBell className="text-cyan-500" /> Notification Settings
      </h2>
      
      <div className="space-y-4">
        {[
          { id: "emailAlerts", label: "Email Alerts", desc: "Receive updates via email" },
          { id: "pushNotifications", label: "Push Notifications", desc: "Receive push notifications on your device" },
          { id: "securityAlerts", label: "Security Alerts", desc: "Get notified about suspicious activity" },
        ].map((item) => (
          <div key={item.id} className={containerClass}>
            <div>
              <h3 className={`font-semibold ${textPrimary}`}>{item.label}</h3>
              <p className={`text-sm ${textSecondary}`}>{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name={item.id}
                checked={notifications[item.id]} 
                onChange={handleNotificationChange}
                className="sr-only peer" 
              />
              <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 ${toggleBg}`}></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
