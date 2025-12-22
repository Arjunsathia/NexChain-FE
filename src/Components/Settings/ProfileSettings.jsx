import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaSave } from "react-icons/fa";
import useUserContext from "@/hooks/useUserContext";
import toast from "react-hot-toast";

import useThemeCheck from "@/hooks/useThemeCheck";

import { SERVER_URL } from "@/api/axiosConfig";

const ProfileSettings = () => {
  const { user } = useUserContext();
  const isLight = useThemeCheck();
  const isDark = !isLight;
  const [formData, setFormData] = useState({
    name: "",
    user_name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ 
        ...prev, 
        name: user.name || "", 
        user_name: user.user_name || "", 
        email: user.email || "" 
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      setIsSaving(false);
      return;
    }

    try {
      
      const updateData = {
        name: formData.name,
        user_name: formData.user_name,
        email: formData.email,
      };
      
      if (formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
      }

      
      const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
      
      const response = await fetch(`${SERVER_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to update profile");
      }

      const data = await response.json();

      if (data.user) {
        toast.success("Profile updated successfully");
        
        localStorage.setItem("NEXCHAIN_USER", JSON.stringify(data.user));
        
        window.location.reload();
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  
  const inputClass = `w-full px-3 sm:px-4 py-2 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-cyan-500 ${
    isDark 
      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400" 
      : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 text-center sm:text-left">
          <div className="relative group">
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center ${isDark ? "border-gray-700 bg-gray-700" : "border-gray-100 bg-gray-100"}`}>
               <span className={`text-4xl font-bold ${isDark ? "text-cyan-400" : "text-blue-600"}`}>
                 {user?.name?.charAt(0).toUpperCase() || "U"}
               </span>
            </div>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{user?.name}</h2>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>@{user?.user_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${inputClass} pl-10 sm:pl-10`}
              />
            </div>
          </div>
        </div>

        <div className={`border-t pt-6 mt-6 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            <FaLock className="text-cyan-500" /> Change Password
          </h3>
          <div className="space-y-4">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              className={inputClass}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                className={inputClass}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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
      </form>
    </>
  );
};

export default ProfileSettings;
