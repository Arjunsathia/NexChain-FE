import React, { useState, useMemo, useEffect } from "react";
import {
  FaCog,
  FaShieldAlt,
  FaBell,
  FaKey,
  FaSave,
  FaLock,
} from "react-icons/fa";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

const AdminSettings = () => {
  const isLight = useThemeCheck();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setContentLoaded(true), 300);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Theme Classes
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    
    bgCard: isLight 
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    bgInput: isLight ? "bg-white text-gray-900 shadow-sm" : "bg-gray-900/50 text-white shadow-inner",
    bgItem: isLight ? "bg-gray-50" : "bg-white/5",
    
    btnPrimary: isLight 
      ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25" 
      : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg hover:shadow-cyan-500/25",
    
    headerGradient: "from-cyan-400 to-blue-500",
  }), [isLight]);

  // Settings State
  const [settings, setSettings] = useState({
    platformName: "NexChain",
    contactEmail: "contact@nexchain.com",
    supportEmail: "support@nexchain.com",
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    securityAlerts: true,
  });

  const [apiSettings, setApiSettings] = useState({
    apiKey: "••••••••••••••••",
    rateLimitEnabled: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1500);
  };

  return (
    <div className={`flex-1 p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}>
            Settings
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-xs sm:text-sm`}>
            Manage system configuration and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-3 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 ${TC.btnPrimary} disabled:opacity-50 w-full sm:w-auto justify-center shadow-lg transition-all duration-200 hover:shadow-xl`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FaSave /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex overflow-x-auto pb-2 gap-2 custom-scrollbar`}>
        {[
          { id: "general", label: "General", icon: FaCog },
          { id: "security", label: "Security", icon: FaShieldAlt },
          { id: "notifications", label: "Notifications", icon: FaBell },
          { id: "api", label: "API", icon: FaKey },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-400"
                : `${TC.textSecondary} hover:bg-gray-800/50`
            }`}
          >
            <tab.icon className="text-sm sm:text-base" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6 lg:p-8`}>
          <div className="space-y-6">
            <div className="h-8 w-48 bg-gray-700/30 rounded animate-pulse mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-32 bg-gray-700/30 rounded animate-pulse mb-2" />
                  <div className="h-12 w-full bg-gray-700/30 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Content */
        <div 
          className={`transition-all duration-500 ease-in-out ${
            contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6 lg:p-8`}>
            {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${TC.textPrimary}`}>General Settings</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}>
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className={`w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 ${TC.bgInput}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className={`w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 ${TC.bgInput}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}>
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className={`w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 ${TC.bgInput}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${TC.textPrimary}`}>
                Security Settings
              </h3>
              
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl ${TC.bgItem} gap-3 sm:gap-4 mb-4`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-cyan-500/10 rounded-lg text-cyan-500">
                    <FaShieldAlt className="text-base sm:text-xl" />
                  </div>
                  <div>
                    <h4 className={`font-medium text-sm sm:text-base ${TC.textPrimary}`}>
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
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}>
                    Current Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 border ${TC.bgInput}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}>
                    New Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 border ${TC.bgInput}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${TC.textPrimary}`}>
                Notification Preferences
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { key: "emailAlerts", label: "Email Alerts", description: "Receive important updates via email" },
                  { key: "pushNotifications", label: "Push Notifications", description: "Get real-time push notifications" },
                  { key: "securityAlerts", label: "Security Alerts", description: "Critical security notifications" },
                ].map((item) => (
                  <div key={item.key} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl ${TC.bgItem} gap-3 sm:gap-4`}>
                    <div>
                      <h4 className={`font-medium text-sm sm:text-base ${TC.textPrimary}`}>{item.label}</h4>
                      <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={(e) =>
                          setNotifications({ ...notifications, [item.key]: e.target.checked })
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
        )}

        {/* API Settings */}
        {activeTab === "api" && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${TC.textPrimary}`}>API Configuration</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}>
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiSettings.apiKey}
                      readOnly
                      className={`flex-1 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm outline-none ${TC.bgInput}`}
                    />
                    <button className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium ${TC.btnPrimary}`}>
                      Regenerate
                    </button>
                  </div>
                </div>
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl ${TC.bgItem} gap-3 sm:gap-4`}>
                  <div>
                    <h4 className={`font-medium text-sm sm:text-base ${TC.textPrimary}`}>Rate Limiting</h4>
                    <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>Enable API rate limiting</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={apiSettings.rateLimitEnabled}
                      onChange={(e) =>
                        setApiSettings({ ...apiSettings, rateLimitEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;