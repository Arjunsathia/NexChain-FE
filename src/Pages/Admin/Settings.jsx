import React, { useState, useMemo, useEffect } from "react";
import {
  FaCog,
  FaShieldAlt,
  FaBell,
  FaKey,
  FaSave,
} from "react-icons/fa";
import GeneralSettings from "@/Components/Admin/Settings/GeneralSettings";
import SecuritySettings from "@/Components/Admin/Settings/SecuritySettings";
import NotificationSettings from "@/Components/Admin/Settings/NotificationSettings";
import ApiSettings from "@/Components/Admin/Settings/ApiSettings";

import useThemeCheck from "@/hooks/useThemeCheck";

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
              <GeneralSettings settings={settings} setSettings={setSettings} TC={TC} />
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <SecuritySettings security={security} setSecurity={setSecurity} TC={TC} />
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <NotificationSettings notifications={notifications} setNotifications={setNotifications} TC={TC} />
            )}

            {/* API Settings */}
            {activeTab === "api" && (
              <ApiSettings apiSettings={apiSettings} setApiSettings={setApiSettings} TC={TC} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;