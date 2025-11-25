import React, { useState, useEffect, useMemo } from "react";
import {
  FaUser,
  FaLock,
  FaBell,
  FaGlobe,
  FaShieldAlt,
  FaSave,
  FaCamera,
  FaMoon,
  FaSun,
  FaDesktop,
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
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgContent: isLight ? "bg-white/70 border-gray-300 shadow-lg" : "bg-gray-800/30 backdrop-blur-xl border-gray-700/50 shadow-xl",
    bgInput: isLight ? "bg-white border-gray-300 text-gray-900" : "bg-gray-900/50 border-gray-700 text-white",
    borderBase: isLight ? "border-gray-300" : "border-gray-700",
    
    // Switch Toggle
    bgSwitchOff: isLight ? "bg-gray-400" : "bg-gray-700",
    bgSwitchOn: isLight ? "bg-cyan-600" : "bg-cyan-500",
    
    // Maintenance Mode
    bgMaintenance: isLight ? "bg-red-100/50 border-red-300" : "bg-red-500/10 border-red-500/30",
    textMaintenance: isLight ? "text-red-700" : "text-red-400",

    // Theme Picker
    bgThemeDefault: isLight ? "bg-gray-100/70 border-gray-300 text-gray-600 hover:bg-gray-200" : "bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-800",
    bgThemeActive: isLight ? "bg-cyan-100/50 border-cyan-600 text-cyan-700" : "bg-cyan-500/10 border-cyan-500 text-cyan-400",
  }), [isLight]);


  // Mock Data
  const [profile, setProfile] = useState({
    firstName: "Arjun",
    lastName: "Sathia",
    email: "admin@nexchain.com",
    role: "Super Admin",
    bio: "Crypto enthusiast and platform manager.",
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
  });

  const [system, setSystem] = useState({
    theme: "dark",
    language: "en",
    maintenanceMode: false,
  });

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Show success toast (mock)
      alert("Settings saved successfully!");
    }, 1500);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "security", label: "Security", icon: FaShieldAlt },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "system", label: "System", icon: FaDesktop },
  ];

  return (
    <div className={`p-6 space-y-6 fade-in ${TC.textPrimary}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${TC.textPrimary}`}>Settings</h1>
          <p className={`mt-1 ${TC.textSecondary}`}>
            Manage your account and platform preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FaSave />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex overflow-x-auto pb-2 gap-2 border-b ${TC.borderBase} custom-scrollbar`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? `${isLight ? "bg-gray-100/70 text-cyan-600 border-cyan-600" : "bg-gray-800/50 text-cyan-400 border-cyan-400"} border-b-2`
                : `${TC.textSecondary} hover:${TC.textPrimary} ${isLight ? "hover:bg-gray-100/70" : "hover:bg-gray-800/30"}`
            }`}
          >
            <tab.icon
              className={activeTab === tab.id ? (isLight ? "text-cyan-600" : "text-cyan-400") : "text-gray-500"}
            />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className={`rounded-2xl p-6 md:p-8 min-h-[500px] ${TC.bgContent}`}>
        {/* Profile Settings */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1">
                    <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${isLight ? "bg-white" : "bg-gray-900"}`}>
                      <span className={`text-4xl font-bold ${TC.textPrimary}`}>
                        {profile.firstName[0]}
                        {profile.lastName[0]}
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FaCamera className="text-white text-2xl" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className={`text-lg font-semibold ${TC.textPrimary}`}>
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className={isLight ? "text-cyan-600 text-sm" : "text-cyan-400 text-sm"}>{profile.role}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${TC.textSecondary}`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    className={`w-full border rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${TC.bgInput}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${TC.textSecondary}`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    className={`w-full border rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${TC.bgInput}`}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`text-sm font-medium ${TC.textSecondary}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className={`w-full border rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${TC.bgInput}`}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`text-sm font-medium ${TC.textSecondary}`}>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    rows="4"
                    className={`w-full border rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none ${TC.bgInput}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-8 animate-fadeIn max-w-3xl">
            <div className="space-y-6">
              <h3 className={`text-xl font-semibold border-b ${TC.borderBase} pb-4 ${TC.textPrimary}`}>
                Authentication
              </h3>
              
              <div className={`flex items-center justify-between p-4 rounded-xl border ${TC.bgInput.replace("bg-", "bg-").replace("border-", "border-")}`}>
                <div className="flex items-center gap-4">
                  <div className={isLight ? "p-3 bg-cyan-100 rounded-lg text-cyan-600" : "p-3 bg-cyan-500/10 rounded-lg text-cyan-400"}>
                    <FaShieldAlt className="text-xl" />
                  </div>
                  <div>
                    <h4 className={`font-medium ${TC.textPrimary}`}>
                      Two-Factor Authentication
                    </h4>
                    <p className={`text-sm ${TC.textSecondary}`}>
                      Add an extra layer of security to your account
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
                  <div className={`w-11 h-6 ${TC.bgSwitchOff} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${TC.bgSwitchOn}`}></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${TC.textSecondary}`}>
                    Current Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full border rounded-xl pl-10 pr-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${TC.bgInput}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${TC.textSecondary}`}>
                    New Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full border rounded-xl pl-10 pr-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${TC.bgInput}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6">
              <h3 className={`text-xl font-semibold border-b ${TC.borderBase} pb-4 ${TC.textPrimary}`}>
                Session Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${TC.textSecondary}`}>
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        sessionTimeout: e.target.value,
                      })
                    }
                    className={`w-full border rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${TC.bgInput}`}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-8 animate-fadeIn max-w-3xl">
            <div className="space-y-4">
              {[
                { id: "emailAlerts", label: "Email Alerts", desc: "Receive emails about your account activity" },
                { id: "pushNotifications", label: "Push Notifications", desc: "Receive push notifications on your device" },
                { id: "marketingEmails", label: "Marketing Emails", desc: "Receive emails about new features and offers" },
                { id: "securityAlerts", label: "Security Alerts", desc: "Get notified about suspicious login attempts" },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${TC.bgInput.replace("bg-", "bg-").replace("border-", "border-")} hover:border-gray-500 transition-colors`}
                >
                  <div>
                    <h4 className={`font-medium ${TC.textPrimary}`}>{item.label}</h4>
                    <p className={`text-sm ${TC.textSecondary}`}>{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.id]}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          [item.id]: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 ${TC.bgSwitchOff} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${TC.bgSwitchOn}`}></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === "system" && (
          <div className="space-y-8 animate-fadeIn max-w-3xl">
            <div className="space-y-6">
              <h3 className={`text-xl font-semibold border-b ${TC.borderBase} pb-4 ${TC.textPrimary}`}>
                Appearance & Localization
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${TC.textSecondary}`}>Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "light", icon: FaSun, label: "Light" },
                      { id: "dark", icon: FaMoon, label: "Dark" },
                      { id: "system", icon: FaDesktop, label: "System" },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSystem({ ...system, theme: theme.id })}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          system.theme === theme.id
                            ? TC.bgThemeActive
                            : TC.bgThemeDefault
                        }`}
                      >
                        <theme.icon />
                        <span className="text-xs font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${TC.textSecondary}`}>
                    Language
                  </label>
                  <div className="relative">
                    <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select
                      value={system.language}
                      onChange={(e) =>
                        setSystem({ ...system, language: e.target.value })
                      }
                      className={`w-full border rounded-xl pl-10 pr-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${TC.bgInput}`}
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6">
              <h3 className={`text-xl font-semibold border-b ${TC.borderBase} pb-4 ${TC.textPrimary}`}>
                Maintenance
              </h3>
              <div className={`flex items-center justify-between p-4 rounded-xl border ${TC.bgMaintenance}`}>
                <div>
                  <h4 className={`font-medium ${TC.textMaintenance}`}>Maintenance Mode</h4>
                  <p className={`text-sm ${TC.textSecondary}`}>
                    Enable to prevent users from accessing the platform
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={system.maintenanceMode}
                    onChange={(e) =>
                      setSystem({ ...system, maintenanceMode: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 ${TC.bgSwitchOff} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500`}></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;