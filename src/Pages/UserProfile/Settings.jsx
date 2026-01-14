import React, { useState, useMemo, useEffect } from "react";
import { FaUser, FaLock, FaGlobe, FaBell, FaIdCard } from "react-icons/fa";
import { motion } from "framer-motion";

import ProfileSettings from "@/Components/Settings/ProfileSettings";
import SecuritySettings from "@/Components/Settings/SecuritySettings";
import PreferenceSettings from "@/Components/Settings/PreferenceSettings";
import NotificationSettings from "@/Components/Settings/NotificationSettings";
import KYCVerification from "@/Components/Settings/KYCVerification";

import useThemeCheck from "@/hooks/useThemeCheck";

import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import { useLocation } from "react-router-dom";

const Settings = () => {
  const isLight = useThemeCheck();
  const [activeTab, setActiveTab] = useState("profile");
  const location = useLocation();
  const { isVisited } = useVisitedRoutes();
  const [isMounted, setIsMounted] = useState(() => isVisited(location.pathname));

  useEffect(() => {
    if (isMounted) return;
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, [isMounted]);

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      // Glassmorphism Cards - Synced with Admin Sidebar exact styling
      bgCard: isLight
        ? "bg-white/90 backdrop-blur-md shadow-md border border-white/40 transform-gpu"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 transform-gpu",

      bgInput: isLight
        ? "bg-gray-100/50 border-gray-200 focus:bg-white focus:border-blue-500 shadow-inner"
        : "bg-white/5 border-white/5 focus:bg-white/10 focus:border-cyan-500 text-white placeholder-gray-500 shadow-inner",

      bgItem: isLight
        ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate transition-colors"
        : "bg-transparent hover:bg-white/5 border-none isolation-isolate transition-colors",

      btnPrimary:
        "px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-sm font-bold flex items-center justify-center gap-2",

      headerGradient: "from-blue-600 to-cyan-500",
    }),
    [isLight],
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
        className={`transition-all duration-300 ease-out transform-gpu ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
      >
        {/* Header - Matches Dashboard */}
        <header className="mb-6 py-2 px-2 text-center sm:text-left">
          <h1
            className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}
          >
            Account{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
          <p className={`text-sm font-medium ${TC.textSecondary}`}>
            Manage your personal information and profile preferences.
          </p>
        </header>

        {/* Tab Navigation - Smooth Sliding Pill */}
        <div
          className={`p-1.5 rounded-full ${isLight ? "bg-gray-100/80 border border-gray-200" : "bg-gray-900/50 border border-white/5"} backdrop-blur-md inline-flex items-center gap-1 mb-6 relative overflow-visible flex-wrap sm:flex-nowrap`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-5 py-2.5 rounded-full text-sm font-bold transition-colors duration-200 
                flex items-center gap-2 outline-none select-none flex-1 justify-center sm:flex-none
                ${activeTab === tab.id ? "text-white" : TC.textSecondary + " hover:text-gray-900 dark:hover:text-gray-200"}
              `}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg rounded-full z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon
                  className={`text-base ${activeTab === tab.id ? "text-white" : ""}`}
                />
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content Card - Matches Dashboard Style */}
        <div
          className={`${TC.bgCard} rounded-2xl p-4 sm:p-8 relative overflow-hidden min-h-[500px]`}
        >
          {/* Decorative Background Gradient (Persistent) */}
          <div
            className={`absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none transition-opacity duration-500 ${isLight ? "opacity-100" : "opacity-20"}`}
          />

          <div className="relative z-10">
            {activeTab === "profile" && (
              <ProfileSettings TC={TC} isLight={isLight} />
            )}
            {activeTab === "security" && (
              <SecuritySettings TC={TC} isLight={isLight} />
            )}
            {activeTab === "kyc" && (
              <KYCVerification TC={TC} isLight={isLight} />
            )}
            {activeTab === "preferences" && (
              <PreferenceSettings TC={TC} isLight={isLight} />
            )}
            {activeTab === "notifications" && (
              <NotificationSettings TC={TC} isLight={isLight} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
