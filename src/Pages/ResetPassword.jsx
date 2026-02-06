import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { postForm } from "../api/axiosConfig";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (!token || !id) {
            return toast.error("Invalid Reset Link");
        }

        setLoading(true);
        try {
            const res = await postForm("/auth/reset-password", {
                ...formData,
                token,
                id,
            });
            toast.success(res.message);
            navigate("/auth");
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-slate-400 text-sm">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="h-11 bg-white/[0.03] border-white/10 rounded-xl px-4 pr-10 text-sm w-full"
                                placeholder="New Password"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-500 hover:text-cyan-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <Input
                            type={showPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="h-11 bg-white/[0.03] border-white/10 rounded-xl px-4 text-sm w-full"
                            placeholder="Confirm New Password"
                            required
                        />
                    </div>

                    <Button
                        disabled={loading}
                        className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl mt-6 transition-all"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/auth")}
                            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
