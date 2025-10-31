import React, { useEffect, useState } from "react";
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
        toast.warning(`${emptyField.replace("_", " ")} is required!`, {
          style: {
            background: "#111827",
            color: "#f59e0b",
            border: "1px solid #374151",
          },
        });
        return;
      }
      if (formData.password !== formData.confirm_password) {
        toast.warning("Passwords do not match.", {
          style: {
            background: "#111827",
            color: "#f59e0b",
            border: "1px solid #374151",
          },
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      if (id) {
        await updateById("/users", id, formData);
        toast.success("User updated successfully!", {
          style: {
            background: "#111827",
            color: "#22c55e",
            border: "1px solid #374151",
          },
        });
      } else {
        await postForm("/users", formData);
        toast.success("User created successfully!", {
          style: {
            background: "#111827",
            color: "#22c55e",
            border: "1px solid #374151",
          },
        });
      }
      fetchData();
      handleClose();
      setFormData(initialFormKeys);
    } catch (err) {
      console.error(err);
      toast.error(id ? "User update failed!" : "User creation failed!", {
        style: {
          background: "#111827",
          color: "#ef4444",
          border: "1px solid #374151",
        },
      });
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
          fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-all duration-500
          ${isMounted ? 'opacity-100' : 'opacity-0'}
        `}
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel 
            className={`
              relative transform overflow-hidden rounded-2xl bg-transparent border border-gray-700 
              shadow-2xl transition-all duration-500 ease-out w-full max-w-lg
              ${isMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
            `}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-cyan-400">
                      {id ? "Update User" : "Create New User"}
                    </DialogTitle>
                    <p className="text-sm text-gray-400">
                      {id ? "Modify user information" : "Add a new user to the system"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex items-center gap-3 text-cyan-400">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading user data...
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Full-width Name */}
                  <div 
                    className={`
                      transition-all duration-300 ease-out
                      ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                    `}
                    style={{ animationDelay: "0.1s" }}
                  >
                    <Label className="text-sm text-gray-300 mb-2 block">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Full-width Email */}
                  <div 
                    className={`
                      transition-all duration-300 ease-out
                      ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                    `}
                    style={{ animationDelay: "0.2s" }}
                  >
                    <Label className="text-sm text-gray-300 mb-2 block">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* 2-column grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div 
                      className={`
                        transition-all duration-300 ease-out
                        ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                      style={{ animationDelay: "0.3s" }}
                    >
                      <Label className="text-sm text-gray-300 mb-2 block">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div 
                      className={`
                        transition-all duration-300 ease-out
                        ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                      style={{ animationDelay: "0.4s" }}
                    >
                      <Label className="text-sm text-gray-300 mb-2 block">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          name="user_name"
                          value={formData.user_name}
                          onChange={handleChange}
                          placeholder="Choose username"
                          className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div 
                      className={`
                        transition-all duration-300 ease-out
                        ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                      style={{ animationDelay: "0.5s" }}
                    >
                      <Label className="text-sm text-gray-300 mb-2 block">
                        Password {id && <span className="text-gray-500">(leave blank to keep current)</span>}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                          required={!id}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div 
                      className={`
                        transition-all duration-300 ease-out
                        ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                      style={{ animationDelay: "0.6s" }}
                    >
                      <Label className="text-sm text-gray-300 mb-2 block">
                        Confirm Password {id && <span className="text-gray-500">(optional)</span>}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          name="confirm_password"
                          type="password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                          required={!id}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role Select */}
                  <div 
                    className={`
                      transition-all duration-300 ease-out
                      ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                    `}
                    style={{ animationDelay: "0.7s" }}
                  >
                    <Label className="text-sm text-gray-300 mb-2 block">User Role</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent text-white border border-gray-700 rounded-xl pl-10 pr-3 py-3 h-12 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors appearance-none"
                      >
                        <option value="" className="bg-gray-800">Select a role</option>
                        <option value="user" className="bg-gray-800">User</option>
                        <option value="admin" className="bg-gray-800">Admin</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-4 h-4 border-r-2 border-b-2 border-gray-400 transform rotate-45 -translate-y-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div 
                className={`
                  flex justify-end gap-3 pt-4 border-t border-gray-700
                  transition-all duration-300 ease-out
                  ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{ animationDelay: "0.8s" }}
              >
                <Button
                  type="button"
                  onClick={handleModalClose}
                  className="px-6 py-2.5 bg-transparent text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-200 hover:bg-gray-700/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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