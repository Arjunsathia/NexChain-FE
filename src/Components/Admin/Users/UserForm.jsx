import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { getById, postForm, updateById } from "@/api/axiosConfig";
import toast from "react-hot-toast";
import { Input } from "@/Components/ui/input.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Mail, Lock, User, Phone, Shield, X } from "lucide-react";

import useThemeCheck from "@/hooks/useThemeCheck";

const initialFormKeys = {
  name: "",
  email: "",
  phone: "",
  user_name: "",
  password: "",
  confirm_password: "",
  role: "",
};

export default function UserForm({ open, handleClose, fetchData, id }) {
  const isLight = useThemeCheck();
  
  // 💡 Theme Classes Helper - Defined once and memoized
  const TC = useMemo(() => ({
    // Modal Colors
    bgBackdrop: "bg-black/60 backdrop-blur-sm", // Unified darker backdrop for focus
    bgPanel: isLight 
      ? "bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)]" 
      : "bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
    
    // Header
    bgHeader: isLight 
      ? "bg-gradient-to-r from-gray-50/80 to-white/80 border-b border-gray-100" 
      : "bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-b border-white/5",
    titleText: isLight ? "text-slate-800" : "text-slate-100",
    subtitleText: isLight ? "text-slate-500" : "text-slate-400",
    
    // Close Button
    btnClose: isLight 
      ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100" 
      : "text-slate-500 hover:text-slate-200 hover:bg-white/10",

    // Form Content
    labelText: isLight ? "text-slate-700 font-medium" : "text-slate-300 font-medium",
    
    // Input/Select Base
    inputBg: isLight 
      ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-cyan-400" 
      : "bg-slate-900/50 border-white/10 text-slate-100 placeholder:text-slate-600 hover:border-cyan-500/50",
    inputFocus: "focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200",
    iconColor: isLight ? "text-slate-400" : "text-slate-500",
    
    // Select Options
    optionBg: isLight ? "bg-white text-slate-900" : "bg-slate-900 text-slate-100",

    // Loading State
    loadingText: isLight ? "text-cyan-600" : "text-cyan-400",
    
    // Action Buttons
    btnCancel: isLight 
      ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300" 
      : "bg-transparent text-slate-400 border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20",
    btnSubmit: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-transparent",

    // Toast Styles
    // Toast Styles
    toastSuccess: {
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
      iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" }
    },
    toastWarning: {
      style: {
        background: "#FEFCE8",
        color: "#854D0E",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        borderRadius: "8px",
        fontWeight: "600",
        fontSize: "14px",
        padding: "12px 16px",
        border: "none",
      },
      iconTheme: { primary: "#EAB308", secondary: "#FFFFFF" }
    },
    toastError: {
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
      iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" }
    },

  }), [isLight]);

  const [formData, setFormData] = useState(initialFormKeys);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
    }
  }, [open]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      const requiredFields = [
        "name",
        "email",
        "phone",
        "user_name",
        "password",
        "confirm_password",
        "role",
      ];
      const emptyField = requiredFields.find((f) => !formData[f]);
      if (emptyField) {
        toast.warning(`${emptyField.replace("_", " ")} is required!`, TC.toastWarning);
        return;
      }
      if (formData.password !== formData.confirm_password) {
        toast.warning("Passwords do not match.", TC.toastWarning);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (id) {
        await updateById("/users", id, formData);
        toast.success("User updated successfully!", TC.toastSuccess);
      } else {
        await postForm("/users", formData);
        toast.success("User created successfully!", TC.toastSuccess);
      }
      fetchData();
      handleClose();
      setFormData(initialFormKeys);
    } catch (err) {
      console.error(err);
      toast.error(id ? "User update failed!" : "User creation failed!", TC.toastError);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getById("/users", id)
      .then((res) =>
        setFormData({
          name: res.name,
          email: res.email,
          phone: res.phone,
          user_name: res.user_name,
          password: "",
          confirm_password: "",
          role: res.role,
        })
      )
      .catch(() => setFormData(initialFormKeys))
      .finally(() => setLoading(false));
  }, [open, id]);

  const handleModalClose = () => {
    setFormData(initialFormKeys);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleModalClose} className="relative z-50">
      <DialogBackdrop 
        className={`
          fixed inset-0 backdrop-blur-sm transition-all duration-500
          ${TC.bgBackdrop}
          ${isMounted ? 'opacity-100' : 'opacity-0'}
        `}
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
          <DialogPanel 
            className={`
              relative transform overflow-hidden rounded-2xl ${TC.bgPanel}
              transition-all duration-500 ease-out w-[90vw] max-w-[340px] sm:max-w-lg
              ${isMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
            `}
          >
            {/* Header */}
            <div className={`px-4 py-3 sm:px-6 sm:py-4 border-b ${TC.bgHeader}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className={`text-lg sm:text-xl font-bold ${TC.titleText}`}>
                      {id ? "Update User" : "Create New User"}
                    </DialogTitle>
                    <p className={`text-xs sm:text-sm ${TC.subtitleText}`}>
                      {id ? "Modify user information" : "Add a new user to the system"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleModalClose}
                  className={`p-1 sm:p-2 rounded-lg transition-all duration-200 ${TC.btnClose}`}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 sm:space-y-5">
              {loading ? (
                <div className="flex justify-center items-center py-8 sm:py-12">
                  <div className={`flex items-center gap-2 sm:gap-3 ${TC.loadingText} text-sm sm:text-base`}>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading user data...
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Full-width Name */}
                  <div>
                    <Label className={`text-[10px] sm:text-xs ${TC.labelText} mb-1 block`}>Full Name</Label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-9 sm:h-10 focus:border-cyan-500 transition-colors text-xs sm:text-sm ${TC.inputBg} ${TC.inputFocus}`}
                        required
                      />
                    </div>
                  </div>

                  {/* Full-width Email */}
                  <div>
                    <Label className={`text-[10px] sm:text-xs ${TC.labelText} mb-1 block`}>Email Address</Label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-9 sm:h-10 focus:border-cyan-500 transition-colors text-xs sm:text-sm ${TC.inputBg} ${TC.inputFocus}`}
                        required
                      />
                    </div>
                  </div>

                  {/* 2-column grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Phone */}
                    <div>
                      <Label className={`text-[10px] sm:text-xs ${TC.labelText} mb-1 block`}>Phone Number</Label>
                      <div className="relative">
                        <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-9 sm:h-10 focus:border-cyan-500 transition-colors text-xs sm:text-sm ${TC.inputBg} ${TC.inputFocus}`}
                          required
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <Label className={`text-[10px] sm:text-xs ${TC.labelText} mb-1 block`}>Username</Label>
                      <div className="relative">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                        <Input
                          name="user_name"
                          value={formData.user_name}
                          onChange={handleChange}
                          placeholder="Choose username"
                          className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-9 sm:h-10 focus:border-cyan-500 transition-colors text-xs sm:text-sm ${TC.inputBg} ${TC.inputFocus}`}
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <Label className={`text-[10px] sm:text-xs ${TC.labelText} mb-1 block`}>
                        Password {id && <span className={`${TC.subtitleText} text-xs`}>(leave blank to keep current)</span>}
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                        <Input
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-9 sm:h-10 focus:border-cyan-500 transition-colors text-xs sm:text-sm ${TC.inputBg} ${TC.inputFocus}`}
                          required={!id}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label className={`text-xs sm:text-sm ${TC.labelText} mb-1 sm:mb-2 block`}>
                        Confirm Password {id && <span className={`${TC.subtitleText} text-xs`}>(optional)</span>}
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                        <Input
                          name="confirm_password"
                          type="password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-9 sm:h-10 focus:border-cyan-500 transition-colors text-xs sm:text-sm ${TC.inputBg} ${TC.inputFocus}`}
                          required={!id}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role Select */}
                  <div>
                    <Label className={`text-xs sm:text-sm ${TC.labelText} mb-1 sm:mb-2 block`}>User Role</Label>
                    <div className="relative">
                      <Shield className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor} z-10`} />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className={`w-full border rounded-lg sm:rounded-xl pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 h-10 sm:h-12 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors appearance-none text-sm sm:text-base ${TC.inputBg} ${TC.inputFocus}`}
                      >
                        <option value="" className={TC.optionBg}>Select a role</option>
                        <option value="user" className={TC.optionBg}>User</option>
                        <option value="admin" className={TC.optionBg}>Admin</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-b-2 ${TC.iconColor} transform rotate-45 -translate-y-1/2`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={`flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t ${isLight ? "border-gray-100" : "border-white/5"}`}>
                <Button
                  type="button"
                  onClick={handleModalClose}
                  className={`px-3 sm:px-4 py-2 border rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm ${TC.btnCancel}`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 sm:px-6 py-2 font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-xs sm:text-sm ${TC.btnSubmit}`}
                >
                  {submitting ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {id ? "Updating..." : "Creating..."}
                    </div>
                  ) : id ? (
                    "Update User"
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}