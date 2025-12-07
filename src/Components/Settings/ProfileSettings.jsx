import React, { useState, useEffect, useCallback } from "react";
import { FaUser, FaEnvelope, FaLock, FaCamera, FaSave, FaTimes, FaCheck } from "react-icons/fa";
import useUserContext from "@/Context/UserContext/useUserContext";
import toast from "react-hot-toast";

import { useTheme } from "@/Context/ThemeContext";
import Cropper from 'react-easy-crop';
import getCroppedImg from "@/utils/cropImage";

const SERVER_URL = "http://localhost:5050";

const ProfileSettings = () => {
  const { user } = useUserContext();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    user_name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Image State
  const [profileImage, setProfileImage] = useState(null); // Blob to upload
  const [previewImage, setPreviewImage] = useState(null); // Display URL
  
  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null); // Raw image for cropper

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ 
        ...prev, 
        name: user.name || "", 
        user_name: user.user_name || "", 
        email: user.email || "" 
      }));
      if (user.image) {
        setPreviewImage(user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`);
      } else {
        setPreviewImage(null);
      }
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImageSrc(reader.result);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels);
      setProfileImage(croppedImageBlob);
      setPreviewImage(URL.createObjectURL(croppedImageBlob));
      setIsCropping(false);
      setTempImageSrc(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImageSrc(null);
  };

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
      const updateData = new FormData();
      updateData.append("name", formData.name);
      updateData.append("user_name", formData.user_name);
      updateData.append("email", formData.email);
      
      if (formData.currentPassword) {
        updateData.append("currentPassword", formData.currentPassword);
        updateData.append("newPassword", formData.newPassword);
      }

      if (profileImage) {
        // Append the blob with a filename
        updateData.append("image", profileImage, "profile.jpg");
      }

      // Use fetch for reliable file upload
      const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
      
      const response = await fetch(`${SERVER_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type header, let browser set it with boundary
        },
        body: updateData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to update profile");
      }

      const data = await response.json();

      if (data.user) {
        toast.success("Profile updated successfully");
        // Update local storage to reflect changes
        localStorage.setItem("NEXCHAIN_USER", JSON.stringify(data.user));
        // Reload to update context and navbar image
        window.location.reload();
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Input Class Helper
  const inputClass = `w-full px-3 sm:px-4 py-2 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-cyan-500 ${
    isDark 
      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400" 
      : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;

  return (
    <>
      {/* Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crop Profile Photo</h3>
              <button onClick={handleCropCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            
            <div className="relative w-full h-80 bg-gray-900">
              <Cropper
                image={tempImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-cyan-500"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={handleCropCancel}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCropSave}
                  className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <FaCheck /> Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 text-center sm:text-left">
          <div className="relative group">
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${isDark ? "border-gray-700 bg-gray-700" : "border-gray-100 bg-gray-100"}`}>
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="w-full h-full p-6 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-600 transition-colors shadow-lg">
              <FaCamera className="text-sm" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
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
                className={`${inputClass} pl-10`}
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
