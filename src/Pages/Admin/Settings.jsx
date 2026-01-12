import React, { useState, useMemo, useEffect } from "react";
import { FaCog, FaShieldAlt, FaBell, FaKey, FaSave } from "react-icons/fa";
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      // Glassmorphism Cards - Synced with Admin Sidebar exact styling
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 transform-gpu glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 transform-gpu",

      bgInput: isLight
        ? "bg-gray-100/50 border-gray-200 focus:bg-white focus:border-blue-500 shadow-inner"
        : "bg-white/5 border-white/5 focus:bg-white/10 focus:border-cyan-500 text-white placeholder-gray-500 shadow-inner",

      bgItem: isLight
        ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate"
        : "bg-transparent hover:bg-white/5 isolation-isolate",

      btnPrimary:
        "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm font-bold",
      btnSecondary: isLight
        ? "bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 sm:p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-cyan-500/20"
        : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 p-2 sm:p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-cyan-500/20",

      headerGradient: "from-blue-600 to-cyan-500",
    }),
    [isLight],
  );

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
    <div
      className={`flex-1 p-2 sm:p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary} fade-in`}
    >
      {/* 1. Page Header (Admin Styled) */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 mb-2">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <h1
            className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}
          >
            Admin{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
          <p className={`text-sm font-medium ${TC.textSecondary}`}>
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

      { }
      <div
        className={`flex items-center gap-2 p-1.5 rounded-2xl ${TC.bgCard} shadow-sm border ${isLight ? "border-gray-200" : "border-white/5"} overflow-x-auto no-scrollbar max-w-fit mb-2`}
      >
        {[
          { id: "general", label: "General", icon: FaCog },
          { id: "security", label: "Security", icon: FaShieldAlt },
          { id: "notifications", label: "Notifications", icon: FaBell },
          { id: "api", label: "API", icon: FaKey },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform-gpu active:scale-95 whitespace-nowrap ${activeTab === tab.id
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                : `${TC.textSecondary} hover:bg-gray-100/50 dark:hover:bg-white/5`
              }`}
          >
            <tab.icon
              className={`text-base ${activeTab === tab.id ? "animate-pulse" : ""}`}
            />
            {tab.label}
          </button>
        ))}
      </div>

      { }
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
        <div className="fade-in" style={{ animationDelay: "0.2s" }}>
          <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6 lg:p-8`}>
            { }
            {activeTab === "general" && (
              <GeneralSettings
                settings={settings}
                setSettings={setSettings}
                TC={TC}
              />
            )}

            { }
            {activeTab === "security" && (
              <SecuritySettings
                security={security}
                setSecurity={setSecurity}
                TC={TC}
              />
            )}

            { }
            {activeTab === "notifications" && (
              <NotificationSettings
                notifications={notifications}
                setNotifications={setNotifications}
                TC={TC}
              />
            )}

            { }
            {activeTab === "api" && (
              <ApiSettings
                apiSettings={apiSettings}
                setApiSettings={setApiSettings}
                TC={TC}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
