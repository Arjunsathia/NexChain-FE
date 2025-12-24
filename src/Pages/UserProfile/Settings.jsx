import React, { useState, useMemo, useEffect } from "react";
import { FaUser, FaLock, FaGlobe, FaBell, FaIdCard } from "react-icons/fa";

import ProfileSettings from "@/Components/Settings/ProfileSettings";
import SecuritySettings from "@/Components/Settings/SecuritySettings";
import PreferenceSettings from "@/Components/Settings/PreferenceSettings";
import NotificationSettings from "@/Components/Settings/NotificationSettings";
import KYCVerification from "@/Components/Settings/KYCVerification";

import useThemeCheck from "@/hooks/useThemeCheck";

const Settings = () => {
  const isLight = useThemeCheck();
  const [activeTab, setActiveTab] = useState("profile");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      // Glassmorphism Cards - Synced with Admin Sidebar exact styling
      bgCard: isLight
        ? "bg-white/90 backdrop-blur-md shadow-sm md:shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/40 transform-gpu"
        : "bg-gray-900/60 backdrop-blur-md shadow-sm md:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/5 transform-gpu",

      bgInput: isLight
        ? "bg-gray-100/50 border-gray-200 focus:bg-white focus:border-blue-500 shadow-inner"
        : "bg-white/5 border-white/5 focus:bg-white/10 focus:border-cyan-500 text-white placeholder-gray-500 shadow-inner",

      bgItem: isLight
        ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate transition-colors"
        : "bg-transparent hover:bg-white/5 border border-white/5 isolation-isolate transition-colors",

      btnPrimary:
        "px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-sm font-bold flex items-center justify-center gap-2",

      headerGradient: "from-blue-600 to-cyan-500",
    }),
    [isLight]
  );

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "security", label: "Security", icon: FaLock },
    { id: "kyc", label: "Identity", icon: FaIdCard },
    { id: "preferences", label: "Preferences", icon: FaGlobe },
    { id: "notifications", label: "Notifications", icon: FaBell },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div
        className={`transition-all duration-300 ease-out transform-gpu ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
      >
        {/* Header - Matches Dashboard */}
        <header className="mb-6 py-2 px-2">
          <h1 className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}>
            Account <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Settings</span>
          </h1>
          <p className={`text-sm font-medium ${TC.textSecondary}`}>
            Manage your personal information and profile preferences.
          </p>
        </header>

        {/* Tab Navigation - Matches User Requested Style */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl ${TC.bgCard} shadow-sm border ${isLight ? 'border-gray-200' : 'border-white/5'} overflow-x-auto no-scrollbar max-w-fit mb-6`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform-gpu active:scale-95 whitespace-nowrap ${activeTab === tab.id
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                : `${TC.textSecondary} hover:bg-gray-100/50 dark:hover:bg-white/5`
                }`}
            >
              <tab.icon className={`text-base ${activeTab === tab.id ? 'animate-pulse' : 'opacity-70'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Card - Matches Dashboard Style */}
        <div className={`${TC.bgCard} rounded-2xl p-6 sm:p-8 relative overflow-hidden min-h-[500px]`}>
          {/* Decorative Background Gradient (Persistent) */}
          <div className={`absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none transition-opacity duration-500 ${isLight ? 'opacity-100' : 'opacity-20'}`} />

          <div className="relative z-10">
            {activeTab === "profile" && <ProfileSettings TC={TC} isLight={isLight} />}
            {activeTab === "security" && <SecuritySettings TC={TC} isLight={isLight} />}
            {activeTab === "kyc" && <KYCVerification TC={TC} isLight={isLight} />}
            {activeTab === "preferences" && <PreferenceSettings TC={TC} isLight={isLight} />}
            {activeTab === "notifications" && <NotificationSettings TC={TC} isLight={isLight} />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
