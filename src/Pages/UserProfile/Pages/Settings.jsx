import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaMoon, FaSun, FaCamera, FaSave, FaEnvelope, FaCog } from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import useUserContext from "@/Context/UserContext/useUserContext";
import { toast } from "react-toastify";
import { logout } from "@/api/axiosConfig";
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
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
            toast.error("New password and confirmation do not match");
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (!formData.currentPassword) {
             toast.error("Please enter current password to change it");
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
        };
        
        if (formData.newPassword) {
            updateData.password = formData.newPassword;
            updateData.currentPassword = formData.currentPassword;
        }

        // Send JSON (default content-type)
        const response = await api.put(`/users/${user.id}`, updateData);

        if (response.data) {
            toast.success("Profile updated successfully!");
            
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
        toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
        setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);
      await logout();
      localStorage.removeItem("NEXCHAIN_USER_TOKEN");
      localStorage.removeItem("NEXCHAIN_USER");
      navigate("/auth");
    } catch (error) {
      console.error("Error While Logout", error);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  // TC (Theme Classes)
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgCard: isLight ? "bg-white shadow-sm border border-gray-200" : "bg-gray-800/50 backdrop-blur-xl border border-gray-700",
    inputBg: isLight ? "bg-gray-50 border-gray-200 text-gray-900" : "bg-gray-900/50 border-gray-700 text-white",
    btnPrimary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25",
  }), [isLight]);

  return (
    <main className={`min-h-screen  font-sans selection:bg-cyan-500/30`}>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block sticky top-0 h-screen flex-shrink-0 p-4 z-50">
          <Sidebar onLogout={handleLogout} isLogoutLoading={isLogoutLoading} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
             
             <div className="flex-1 w-full max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
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

                {/* Security Section */}
                <div className={`p-6 rounded-2xl ${TC.bgCard} fade-in`} style={{animationDelay: '0.2s'}}>
                    <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${TC.textPrimary}`}>
                        <FaLock className="text-cyan-500"/> Security
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${TC.textSecondary}`}>Current Password</label>
                            <input 
                                type="password" 
                                name="currentPassword"
                                value={formData.currentPassword} 
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${TC.inputBg}`}
                            />
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${TC.textSecondary}`}>New Password</label>
                                <input 
                                    type="password" 
                                    name="newPassword"
                                    value={formData.newPassword} 
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${TC.inputBg}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${TC.textSecondary}`}>Confirm Password</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword} 
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${TC.inputBg}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className={`p-6 rounded-2xl ${TC.bgCard} fade-in`} style={{animationDelay: '0.3s'}}>
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
                <div className="flex justify-end fade-in" style={{animationDelay: '0.4s'}}>
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

             {/* Mobile Sidebar */}
             <div className="lg:hidden w-full p-2 sm:p-4 sticky bottom-0 z-50">
                <Sidebar onLogout={handleLogout} isLogoutLoading={isLogoutLoading} />
             </div>
        </div>
      </div>
    </main>
  );
}
