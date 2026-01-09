import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaCamera,
  FaTimes,
  FaSearchPlus,
  FaSearchMinus,
  FaPhone,
  FaShieldAlt,
} from "react-icons/fa";
import useUserContext from "@/hooks/useUserContext";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { getCroppedImgBlob } from "@/utils/canvasUtils";

import api, { SERVER_URL } from "@/api/axiosConfig";
// import { Link } from 'react-router-dom'; // Unused

const ProfileSettings = ({ TC, isLight }) => {
  const { user, updateUser } = useUserContext();
  const isDark = !isLight;

  const [formData, setFormData] = useState({
    name: "",
    user_name: "",
    email: "",
    phone: "",
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
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        user_name: user.user_name || "",
        email: user.email || "",
        phone: user.phone || "",
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
      e.target.value = "";
    }
  };

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      const croppedBlob = await getCroppedImgBlob(imageSrc, croppedAreaPixels);
      const file = new File([croppedBlob], "profile_image.jpg", {
        type: "image/jpeg",
      });

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
      // Use the configured axios instance which handles headers/tokens automatically
      const response = await api.put(
        `/users/profile-image/${user.id}`,
        formData,
      );
      const data = response.data;

      if (data.user) {
        toast.success("Profile image updated successfully");
        updateUser(data.user);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to upload image";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast.error("New passwords do not match");
      setIsSaving(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        user_name: formData.user_name,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
      }

      // Use authenticated api instance instead of raw fetch
      const response = await api.put(`/users/${user.id}`, updateData);
      const data = response.data;

      if (data.user) {
        toast.success("Profile updated successfully");
        updateUser(data.user);
      }
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 animate-in fade-in duration-300"
      >
        {/* Section 1: Avatar & Basic Info */}
        <div
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pb-8 border-b border-dashed"
          style={{ borderColor: isLight ? "#e5e7eb" : "rgba(255,255,255,0.1)" }}
        >
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => !isUploading && fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
            />
            <div
              className={`w-28 h-28 rounded-2xl overflow-hidden border-2 flex items-center justify-center relative shadow-lg ${isLight ? "border-white bg-gray-100 shadow-blue-500/10" : "border-gray-700 bg-gray-800 shadow-black/40"}`}
            >
              {user?.image ? (
                <img
                  src={
                    user.image.startsWith("http")
                      ? user.image
                      : `${SERVER_URL}/uploads/${user.image}`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span
                  className={`text-4xl font-bold ${isLight ? "text-blue-600" : "text-cyan-400"}`}
                >
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                {isUploading ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaCamera className="text-white text-2xl drop-shadow-md" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <FaCamera size={12} />
            </div>
          </div>

          <div className="text-center sm:text-left pt-2">
            <h2
              className={`text-2xl font-bold ${TC.textPrimary} mb-1 tracking-tight`}
            >
              {user?.name}
            </h2>
            <p className={`font-medium ${TC.textSecondary} mb-3`}>
              @{user?.user_name}
            </p>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider ${isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400"}`}
            >
              <FaShieldAlt className="text-xs" /> Personal Account
            </div>
          </div>
        </div>

        {/* Section 2: Personal Details */}
        <div>
          <h3
            className={`text-lg font-bold mb-5 flex items-center gap-2 ${TC.textPrimary} tracking-tight`}
          >
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label
                className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}
              >
                Full Name
              </label>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
                  placeholder="Your Full Name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}
              >
                Username
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-cyan-500 transition-colors">
                  @
                </span>
                <input
                  type="text"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
                  placeholder="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}
              >
                Email Address
              </label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}
              >
                Phone Number
              </label>
              <div className="relative group">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Security */}
        <div
          className={`pt-6 border-t border-dashed`}
          style={{ borderColor: isLight ? "#e5e7eb" : "rgba(255,255,255,0.1)" }}
        >
          <h3
            className={`text-lg font-bold mb-5 flex items-center gap-2 ${TC.textPrimary} tracking-tight`}
          >
            Security Settings
          </h3>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label
                className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}
              >
                Current Password
              </label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Enter current password to change"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}
                >
                  New Password
                </label>
                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Min. 8 characters"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-dashed"
          style={{ borderColor: isLight ? "#e5e7eb" : "rgba(255,255,255,0.1)" }}
        >
          <button type="submit" disabled={isSaving} className={TC.btnPrimary}>
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Cropper Modal - Portaled to Body */}
      {isCropping &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
              className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}
            >
              <div
                className={`p-5 flex justify-between items-center border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}
              >
                <h3
                  className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Adjust Image
                </h3>
                <button
                  onClick={() => {
                    setIsCropping(false);
                    setImageSrc(null);
                  }}
                  className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
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

              <div className="p-6 space-y-6">
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

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsCropping(false);
                      setImageSrc(null);
                    }}
                    className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                      isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadCroppedImage}
                    disabled={isUploading}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
          document.body,
        )}
    </>
  );
};

export default ProfileSettings;
