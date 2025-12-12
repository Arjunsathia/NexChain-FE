import React, { useState, useMemo, useEffect } from "react";
import { FaUser, FaLock, FaGlobe, FaBell, FaIdCard, FaSave } from "react-icons/fa";
import useUserContext from "@/Context/UserContext/useUserContext";
import ProfileSettings from "@/Components/Settings/ProfileSettings";
import SecuritySettings from "@/Components/Settings/SecuritySettings";
import PreferenceSettings from "@/Components/Settings/PreferenceSettings";
import NotificationSettings from "@/Components/Settings/NotificationSettings";
import KYCVerification from "@/Components/Settings/KYCVerification";

import { useTheme } from "@/Context/ThemeContext";

const Settings = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useUserContext();
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
    textPrimary: isDark ? "text-white" : "text-gray-900",
    textSecondary: isDark ? "text-gray-400" : "text-gray-600",
    textTertiary: isDark ? "text-gray-500" : "text-gray-500",
    
    bgCard: isDark 
      ? "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20"
      : "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]",
    bgInput: isDark ? "bg-gray-900/50 text-white shadow-inner" : "bg-white text-gray-900 shadow-sm",
    bgItem: isDark ? "bg-white/5" : "bg-gray-50",
    
    btnPrimary: isDark 
      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg hover:shadow-cyan-500/25"
      : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25",
    
    headerGradient: "from-cyan-400 to-blue-500",
  }), [isDark]);



  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "security", label: "Security", icon: FaLock },
    { id: "kyc", label: "Identity", icon: FaIdCard },
    { id: "preferences", label: "Preferences", icon: FaGlobe },
    { id: "notifications", label: "Notifications", icon: FaBell },
  ];

  return (
    <div className={`flex-1 w-full max-w-full overflow-x-hidden p-2 sm:p-4 lg:p-6 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}` }>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="px-2 py-2"> 
          <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}>
            Account Settings
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-xs sm:text-sm`}>
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex w-full max-w-full overflow-x-auto pb-2 gap-2 custom-scrollbar`}>
        {tabs.map((tab) => (
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
          <div className={`${TC.bgCard} w-full overflow-hidden rounded-2xl p-3 sm:p-6 lg:p-8`}>
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "security" && <SecuritySettings />}
            {activeTab === "kyc" && <KYCVerification />}
            {activeTab === "preferences" && <PreferenceSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
