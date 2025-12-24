import React, { useState } from "react";
import { FaBell } from "react-icons/fa";


const NotificationSettings = ({ TC, isLight }) => {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    securityAlerts: true,
  });

  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h2 className={`text-lg font-bold mb-5 flex items-center gap-2 ${TC.textPrimary} tracking-tight`}>
        <FaBell className="text-cyan-500" /> Notification Preferences
      </h2>

      <div className="grid gap-4">
        {[
          { id: "emailAlerts", label: "Email Alerts", desc: "Receive market updates & newsletters via email" },
          { id: "pushNotifications", label: "Push Notifications", desc: "Get instant alerts for your trades & security" },
          { id: "securityAlerts", label: "Security Alerts", desc: "Immediate notifications for suspicious login attempts" },
        ].map((item) => (
          <div key={item.id} className={`rounded-xl p-5 border flex items-center justify-between gap-4 transition-all ${TC.bgItem}`}>
            <div>
              <h3 className={`font-bold text-sm sm:text-base ${TC.textPrimary}`}>{item.label}</h3>
              <p className={`text-[10px] sm:text-xs font-medium ${TC.textSecondary} mt-1`}>{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                name={item.id}
                checked={notifications[item.id]}
                onChange={handleNotificationChange}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500/20 transition-all 
                ${isLight ? "bg-gray-200 peer-checked:bg-blue-600" : "bg-gray-700 peer-checked:bg-cyan-500"}
                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm`}></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
