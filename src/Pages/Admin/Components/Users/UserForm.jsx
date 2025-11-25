import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { getById, postForm, updateById } from "@/api/axiosConfig";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Phone, Shield, X } from "lucide-react";

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
    bgBackdrop: isLight ? "bg-gray-900/40" : "bg-gray-900/80",
    bgPanel: isLight ? "bg-white border-gray-300 shadow-2xl" : "bg-transparent border border-gray-700 shadow-2xl",
    
    // Header
    bgHeader: isLight ? "bg-gray-50 border-gray-300" : "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700",
    titleText: isLight ? "text-blue-600" : "text-cyan-400",
    subtitleText: isLight ? "text-gray-500" : "text-gray-400",
    
    // Close Button
    btnClose: isLight ? "text-gray-500 hover:text-gray-900 hover:bg-gray-200" : "text-gray-400 hover:text-white hover:bg-gray-700",

    // Form Content
    labelText: isLight ? "text-gray-700" : "text-gray-300",
    
    // Input/Select Base
    inputBg: isLight ? "bg-white text-gray-900 border-gray-400 placeholder-gray-500" : "bg-transparent text-white border-gray-700",
    inputFocus: "focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500",
    iconColor: isLight ? "text-gray-500" : "text-gray-400",
    
    // Select Options (Needs to override parent bg)
    optionBg: isLight ? "bg-white text-gray-900" : "bg-gray-800 text-white",

    // Loading State
    loadingText: isLight ? "text-blue-600" : "text-cyan-400",
    
    // Action Buttons
    btnCancel: isLight ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300 hover:border-gray-400" : "bg-transparent text-gray-300 hover:text-white border-gray-600 hover:border-gray-500 hover:bg-gray-700/50",
    btnSubmit: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white",

    // Toast Styles (Adjusted for theme)
    toastSuccess: isLight ? { background: "#fff", color: "#16a34a", border: "1px solid #d1d5db" } : { background: "#111827", color: "#22c55e", border: "1px solid #374151" },
    toastWarning: isLight ? { background: "#fff", color: "#f59e0b", border: "1px solid #d1d5db" } : { background: "#111827", color: "#f59e0b", border: "1px solid #374151" },
    toastError: isLight ? { background: "#fff", color: "#ef4444", border: "1px solid #d1d5db" } : { background: "#111827", color: "#ef4444", border: "1px solid #374151" },

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
        toast.warning(`${emptyField.replace("_", " ")} is required!`, { style: TC.toastWarning });
        return;
      }
      if (formData.password !== formData.confirm_password) {
        toast.warning("Passwords do not match.", { style: TC.toastWarning });
        return;
      }
    }

    setSubmitting(true);
    try {
      if (id) {
        await updateById("/users", id, formData);
        toast.success("User updated successfully!", { style: TC.toastSuccess });
      } else {
        await postForm("/users", formData);
        toast.success("User created successfully!", { style: TC.toastSuccess });
      }
      fetchData();
      handleClose();
      setFormData(initialFormKeys);
    } catch (err) {
      console.error(err);
      toast.error(id ? "User update failed!" : "User creation failed!", { style: TC.toastError });
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
              transition-all duration-500 ease-out w-full max-w-md lg:max-w-lg
              ${isMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
            `}
          >
            {/* Header */}
            <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${TC.bgHeader}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
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

            <form onSubmit={handleSubmit} className={`p-4 sm:p-6 space-y-4 sm:space-y-6 ${isLight ? "bg-white" : "bg-gray-800/90"}`}>
              {loading ? (
                <div className="flex justify-center items-center py-8 sm:py-12">
                  <div className={`flex items-center gap-2 sm:gap-3 ${TC.loadingText} text-sm sm:text-base`}>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading user data...
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  {/* Full-width Name */}
                  <div>
                    <Label className={`text-xs sm:text-sm ${TC.labelText} mb-1 sm:mb-2 block`}>Full Name</Label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-10 sm:h-12 focus:border-cyan-500 transition-colors text-sm sm:text-base ${TC.inputBg} ${TC.inputFocus}`}
                        required
                      />
                    </div>
                  </div>

                  {/* Full-width Email */}
                  <div>
                    <Label className={`text-xs sm:text-sm ${TC.labelText} mb-1 sm:mb-2 block`}>Email Address</Label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-10 sm:h-12 focus:border-cyan-500 transition-colors text-sm sm:text-base ${TC.inputBg} ${TC.inputFocus}`}
                        required
                      />
                    </div>
                  </div>

                  {/* 2-column grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Phone */}
                    <div>
                      <Label className={`text-xs sm:text-sm ${TC.labelText} mb-1 sm:mb-2 block`}>Phone Number</Label>
                      <div className="relative">
                        <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-10 sm:h-12 focus:border-cyan-500 transition-colors text-sm sm:text-base ${TC.inputBg} ${TC.inputFocus}`}
                          required
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <Label className={`text-xs sm:text-sm ${TC.labelText} mb-1 sm:mb-2 block`}>Username</Label>
                      <div className="relative">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 ${TC.iconColor}`} />
                        <Input
                          name="user_name"
                          value={formData.user_name}
                          onChange={handleChange}
                          placeholder="Choose username"
                          className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-10 sm:h-12 focus:border-cyan-500 transition-colors text-sm sm:text-base ${TC.inputBg} ${TC.inputFocus}`}
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <Label className={`text-xs sm:text-sm ${TC.labelText} mb-1 sm:mb-2 block`}>
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
                          className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-10 sm:h-12 focus:border-cyan-500 transition-colors text-sm sm:text-base ${TC.inputBg} ${TC.inputFocus}`}
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
                          className={`pl-9 sm:pl-10 border rounded-lg sm:rounded-xl h-10 sm:h-12 focus:border-cyan-500 transition-colors text-sm sm:text-base ${TC.inputBg} ${TC.inputFocus}`}
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
              <div className={`flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t ${isLight ? "border-gray-300" : "border-gray-700"}`}>
                <Button
                  type="button"
                  onClick={handleModalClose}
                  className={`px-4 sm:px-6 py-2 border rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm ${TC.btnCancel}`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 sm:px-8 py-2 font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-xs sm:text-sm ${TC.btnSubmit}`}
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