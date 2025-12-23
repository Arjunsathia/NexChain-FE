import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { FaUser, FaEnvelope, FaLock, FaSave, FaCamera, FaTimes, FaSearchPlus, FaSearchMinus } from "react-icons/fa";
import useUserContext from "@/hooks/useUserContext";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { getCroppedImgBlob } from "@/utils/canvasUtils";

import useThemeCheck from "@/hooks/useThemeCheck";

import { SERVER_URL } from "@/api/axiosConfig";

const ProfileSettings = () => {
  const { user, updateUser } = useUserContext();
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Cropper State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

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

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);

      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      const croppedBlob = await getCroppedImgBlob(imageSrc, croppedAreaPixels);
      const file = new File([croppedBlob], "profile_image.jpg", { type: "image/jpeg" });

      await uploadImage(file);

      setIsCropping(false);
      setImageSrc(null);
      setZoom(1);
    } catch (e) {
      console.error(e);
      toast.error("Error cropping image");
      setIsUploading(false);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("NEXCHAIN_USER_TOKEN") || localStorage.getItem("token");

      const response = await fetch(`${SERVER_URL}/api/users/profile-image/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to upload image");
      }

      const data = await response.json();

      if (data.user) {
        toast.success("Profile image updated successfully");
        updateUser(data.user);
      }

    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
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

        updateUser(data.user);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };


  const inputClass = `w-full px-3 sm:px-4 py-2 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-cyan-500 ${isDark
    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
    : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
    }`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;

  return (
    <>
      {/* Cropper Modal - Portaled to Body */}
      {isCropping && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <div className="p-4 flex justify-between items-center border-b border-gray-700/50">
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Adjust Image</h3>
              <button
                onClick={() => { setIsCropping(false); setImageSrc(null); }}
                className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              >
                <FaTimes />
              </button>
            </div>

            <div className="relative h-64 sm:h-80 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
              />
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-4">
                <FaSearchMinus className="text-gray-400" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <FaSearchPlus className="text-gray-400" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setIsCropping(false); setImageSrc(null); }}
                  className={`flex-1 py-2 rounded-xl font-medium transition-colors ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadCroppedImage}
                  disabled={isUploading}
                  className="flex-1 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save & Upload"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 text-center sm:text-left">
          <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
            />
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center relative ${isDark ? "border-gray-700 bg-gray-700" : "border-gray-100 bg-gray-100"}`}>
              {user?.image ? (
                <img
                  src={user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className={`text-4xl font-bold ${isDark ? "text-cyan-400" : "text-blue-600"}`}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaCamera className="text-white text-xl" />
                )}
              </div>
            </div>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{user?.name}</h2>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>@{user?.user_name}</p>
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Click avatar to change</p>
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
