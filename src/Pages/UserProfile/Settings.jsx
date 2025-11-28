import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaMoon, FaSun, FaCamera, FaSave, FaEnvelope, FaCog, FaShieldAlt } from "react-icons/fa";
import useUserContext from "@/Context/UserContext/useUserContext";
import toast from "react-hot-toast";
import api from "@/api/axiosConfig";

// Theme Check Utility
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

export default function Settings() {
  const isLight = useThemeCheck();
  const { user, fetchUsers } = useUserContext();
  const navigate = useNavigate();
  
  // Form States
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Security & Notification States
  const [security, setSecurity] = useState({
    twoFactor: false,
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    securityAlerts: true,
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.image || null);
  const [isSaving, setIsSaving] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains("dark"));

  useEffect(() => {
    setFormData(prev => ({ ...prev, name: user?.name || "", email: user?.email || "" }));
    setPreviewImage(user?.image || null);
  }, [user]);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, [isLight]);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    // Password Validation
    if (formData.newPassword || formData.confirmPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New password and confirmation do not match", {
                style: {
                    background: "#FEE2E2",
                    color: "#991B1B",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "12px 16px",
                    border: "none",
                },
                iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
            });
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters", {
                style: {
                    background: "#FEE2E2",
                    color: "#991B1B",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "12px 16px",
                    border: "none",
                },
                iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
            });
            return;
        }
        if (!formData.currentPassword) {
             toast.error("Please enter current password to change it", {
                 style: {
                     background: "#FEE2E2",
                     color: "#991B1B",
                     boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                     borderRadius: "8px",
                     fontWeight: "600",
                     fontSize: "14px",
                     padding: "12px 16px",
                     border: "none",
                 },
                 iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
             });
             return;
        }
    }

    setIsSaving(true);
    
    try {
        let imageBase64 = null;
        if (profileImage) {
            const reader = new FileReader();
            imageBase64 = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(profileImage);
            });
        }

        const updateData = {
            name: formData.name,
            email: formData.email,
            ...(imageBase64 && { image: imageBase64 }),
            // In a real app, you'd save security/notification preferences here too
        };
        
        if (formData.newPassword) {
            updateData.password = formData.newPassword;
            updateData.currentPassword = formData.currentPassword;
        }

        // Send JSON (default content-type)
        const response = await api.put(`/users/${user.id}`, updateData);

        if (response.data) {
            toast.success("Profile updated successfully!", {
                style: {
                    background: "#DCFCE7",
                    color: "#166534",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "12px 16px",
                    border: "none",
                },
                iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
            });
            
            // Update Local Storage
            const updatedUser = { ...user, ...response.data };
            localStorage.setItem("NEXCHAIN_USER", JSON.stringify(updatedUser));
            
            // Refresh Context
            if (fetchUsers) {
                await fetchUsers();
            }
            
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            }));
        }
    } catch (error) {
        console.error("Update error", error);
        toast.error(error.response?.data?.message || "Failed to update profile", {
            style: {
                background: "#FEE2E2",
                color: "#991B1B",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                padding: "12px 16px",
                border: "none",
            },
            iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
        });
    } finally {
        setIsSaving(false);
    }
  };

  // TC (Theme Classes)
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgCard: isLight ? "bg-white shadow-sm border border-gray-200" : "bg-gray-800/50 backdrop-blur-xl border border-gray-700",
    inputBg: isLight ? "bg-gray-50 border-gray-200 text-gray-900" : "bg-gray-900/50 border-gray-700 text-white",
    btnPrimary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25",
    bgItem: isLight ? "bg-gray-50" : "bg-white/5",
  }), [isLight]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
        <header className="mb-8">
            <h1 className={`text-3xl font-bold ${TC.textPrimary}`}>Settings</h1>
            <p className={`mt-2 ${TC.textSecondary}`}>Manage your account settings and preferences</p>
        </header>
        
        {/* Profile Section */}
        <div className={`p-6 rounded-2xl ${TC.bgCard} fade-in`} style={{animationDelay: '0.1s'}}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${TC.textPrimary}`}>
                <FaUser className="text-cyan-500"/> Profile Settings
            </h2>
            
            {/* Photo Upload */}
            <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-cyan-500/20">
                        {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isLight ? "bg-gray-200" : "bg-gray-700"}`}>
                                <FaUser className="text-4xl text-gray-400" />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-cyan-500 rounded-full text-white cursor-pointer hover:bg-cyan-600 transition-colors shadow-lg transform hover:scale-110">
                        <FaCamera size={14} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                </div>
                <div>
                    <h3 className={`font-bold ${TC.textPrimary}`}>Profile Photo</h3>
                    <p className={`text-sm ${TC.textSecondary}`}>Update your profile picture</p>
                </div>
            </div>

            {/* Inputs */}
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className={`block text-sm font-medium mb-2 ${TC.textSecondary}`}>Full Name</label>
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name} 
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${TC.inputBg}`}
                    />
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-2 ${TC.textSecondary}`}>Email Address</label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email} 
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${TC.inputBg}`}
                    />
                </div>
            </div>
        </div>

        {/* Security Section (Updated to match Admin) */}
        <div className={`p-6 rounded-2xl ${TC.bgCard} fade-in`} style={{animationDelay: '0.2s'}}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${TC.textPrimary}`}>
                <FaShieldAlt className="text-cyan-500"/> Security Settings
            </h2>
            
            <div className="space-y-6">
                {/* 2FA Toggle */}
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl ${TC.bgItem} gap-3 sm:gap-4 mb-4`}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-cyan-500/10 rounded-lg text-cyan-500">
                      <FaShieldAlt className="text-base sm:text-xl" />
                    </div>
                    <div>
                      <h4 className={`font-medium text-sm sm:text-base ${TC.textPrimary}`}>Two-Factor Authentication</h4>
                      <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>Add an extra layer of security</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.twoFactor}
                      onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}>Current Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`w-full rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 border ${TC.inputBg}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}>New Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`w-full rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 border ${TC.inputBg}`}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={`block text-xs sm:text-sm font-medium mb-2 ${TC.textSecondary}`}>Confirm Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`w-full rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 border ${TC.inputBg}`}
                      />
                    </div>
                  </div>
                </div>
            </div>
        </div>

        {/* Notification Preferences (New Section) */}
        <div className={`p-6 rounded-2xl ${TC.bgCard} fade-in`} style={{animationDelay: '0.3s'}}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${TC.textPrimary}`}>
                <FaEnvelope className="text-cyan-500"/> Notification Preferences
            </h2>
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
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              ))}
            </div>
        </div>

        {/* Preferences */}
        <div className={`p-6 rounded-2xl ${TC.bgCard} fade-in`} style={{animationDelay: '0.4s'}}>
             <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${TC.textPrimary}`}>
                <FaCog className="text-cyan-500"/> Preferences
            </h2>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className={`font-medium ${TC.textPrimary}`}>Dark Mode</h3>
                    <p className={`text-sm ${TC.textSecondary}`}>Toggle dark mode theme</p>
                </div>
                <button 
                    onClick={toggleTheme}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${isDarkMode ? 'bg-cyan-600' : 'bg-gray-300'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end fade-in" style={{animationDelay: '0.5s'}}>
            <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className={`px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2 ${TC.btnPrimary}`}
            >
                {isSaving ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                    </>
                ) : (
                    <><FaSave /> Save Changes</>
                )}
            </button>
        </div>

     </div>
  );
}
