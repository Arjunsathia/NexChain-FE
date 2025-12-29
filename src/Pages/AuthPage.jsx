import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/Components/ui/input.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Card, CardContent } from "@/Components/ui/card.jsx";
import { Mail, Lock, User, Phone, ArrowLeft, Rocket, ChevronRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { postForm, setMemoryToken } from "@/api/axiosConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import InteractiveGridPattern from "@/Components/Landing/Background";
import useUserContext from "@/hooks/useUserContext";

const initialRegisterKeys = {
    name: "",
    email: "",
    phone: "",
    user_name: "",
    password: "",
    confirm_password: "",
    role: "user",
};

const AuthPage = () => {
    const navigate = useNavigate();
    const { fetchUsers, setToken } = useUserContext();
    const [loginData, setLoginData] = useState({ user_name: "", password: "" });
    const [registerData, setRegisterData] = useState(initialRegisterKeys);
    const [activeTab, setActiveTab] = useState("login");
    const [loading, setLoading] = useState(false);

    // OTP States
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [emailForOtp, setEmailForOtp] = useState("");

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseMove = (e) => {
        if (containerRef.current) {
            const x = e.clientX;
            const y = e.clientY;
            containerRef.current.style.setProperty("--mouse-x", `${x}px`);
            containerRef.current.style.setProperty("--mouse-y", `${y}px`);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await postForm("/auth/login", {
                email: loginData.user_name,
                password: loginData.password
            });

            if (res.accessToken) {
                setToken(res.accessToken);
                setMemoryToken(res.accessToken);
                localStorage.setItem("NEXCHAIN_USER_TOKEN", res.accessToken);

                if (res?.user) localStorage.setItem("NEXCHAIN_USER", JSON.stringify(res?.user));

                await fetchUsers();
                toast.success(`Welcome back, ${res?.user?.name || "User"}!`);
                navigate("/dashboard");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirm_password) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        try {
            const res = await postForm("/auth/register", registerData);
            setEmailForOtp(res.email);
            setShowOtpInput(true);
            toast.success("Registration successful! Check your email for OTP.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Only used for email verification now
            await postForm("/auth/verify-email-otp", { email: emailForOtp, otp: otpCode });

            toast.success("Email verified! You can now login.");
            setShowOtpInput(false);
            setOtpCode("");
            setActiveTab("login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} onMouseMove={handleMouseMove} className="flex items-center justify-center min-h-screen bg-[#000108] text-white px-4 py-10 relative overflow-hidden">
            <InteractiveGridPattern />

            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 bg-cyan-400 pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 bg-blue-500 pointer-events-none" />

            <motion.div initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="w-full max-w-xl relative z-10">
                <Card className="w-full border-0 bg-transparent shadow-none">
                    <div className="relative rounded-3xl overflow-hidden bg-gray-950/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl shadow-black/50">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

                        <CardContent className="p-5 md:p-10">
                            <div className="text-center mb-6 md:mb-10">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                    <Rocket className="h-6 w-6 md:h-8 md:w-8 text-white" />
                                </motion.div>
                                <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-3 tracking-tight">
                                    {showOtpInput ? "Verification" : "Welcome to "}
                                    {!showOtpInput && <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">NexChain</span>}
                                </h2>
                                <p className="text-gray-400">
                                    {showOtpInput ? `Enter the code sent to ${emailForOtp}` : activeTab === "login" ? "Access your professional trading dashboard" : "Join the future of digital asset trading"}
                                </p>
                            </div>

                            {!showOtpInput && (
                                <div className="grid grid-cols-2 bg-gray-900/50 p-1 md:p-1.5 rounded-lg md:rounded-xl border border-gray-800/50 mb-6 relative w-full max-w-[240px] md:max-w-full mx-auto">
                                    <motion.div className="absolute top-1 md:top-1.5 bottom-1 md:bottom-1.5 rounded-md md:rounded-lg bg-gray-800 shadow-sm" animate={{ left: activeTab === "login" ? (isMobile ? "4px" : "6px") : "50%", width: isMobile ? "calc(50% - 6px)" : "calc(50% - 9px)", }} />
                                    <button onClick={() => setActiveTab("login")} className={`relative z-10 py-1.5 md:py-2.5 text-xs md:text-sm font-semibold rounded-md md:rounded-lg transition-colors duration-200 ${activeTab === "login" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}>Sign In</button>
                                    <button onClick={() => setActiveTab("register")} className={`relative z-10 py-1.5 md:py-2.5 text-xs md:text-sm font-semibold rounded-md md:rounded-lg transition-colors duration-200 ${activeTab === "register" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}>Create Account</button>
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {showOtpInput ? (
                                    <motion.form key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6" onSubmit={handleVerifyOTP}>
                                        <div className="space-y-4">
                                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center block">6-Digit OTP</Label>
                                            <Input
                                                type="text"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                placeholder="000000"
                                                maxLength={6}
                                                className="bg-gray-900/50 border-gray-800 text-white rounded-xl h-14 md:h-20 text-center text-2xl md:text-4xl tracking-[0.5em] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg h-14 text-lg" disabled={loading || otpCode.length !== 6}>
                                            {loading ? "Verifying..." : "Verify OTP"}
                                        </Button>
                                        <button type="button" onClick={() => setShowOtpInput(false)} className="w-full text-center text-sm text-gray-500 hover:text-cyan-400">Back</button>
                                    </motion.form>
                                ) : activeTab === "login" ? (
                                    <motion.form key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5" onSubmit={handleLogin}>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username / Email</Label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                                <Input type="text" value={loginData.user_name} onChange={(e) => setLoginData({ ...loginData, user_name: e.target.value })} placeholder="Enter username or email" className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-12 md:h-14 focus:border-cyan-500/50" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</Label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors z-10" />
                                                <Input type={showLoginPassword ? "text" : "password"} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="Enter your password" className="pl-12 pr-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-12 md:h-14 focus:border-cyan-500/50" required />
                                                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 z-10">{showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                            </div>
                                        </div>
                                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg h-14 text-lg mt-4" disabled={loading}>
                                            {loading ? "Processing..." : "Sign In"}
                                        </Button>
                                    </motion.form>
                                ) : (
                                    <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4" onSubmit={handleRegister}>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</Label>
                                            <div className="relative group"><User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" /><Input value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} placeholder="Full Name" className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-11 focus:border-cyan-500" required /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</Label>
                                            <div className="relative group"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" /><Input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} placeholder="Email Address" className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-11 focus:border-cyan-500" required /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone</Label>
                                                <div className="relative group"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" /><Input value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} placeholder="Phone" className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-11 focus:border-cyan-500" required /></div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username</Label>
                                                <div className="relative group"><User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" /><Input value={registerData.user_name} onChange={(e) => setRegisterData({ ...registerData, user_name: e.target.value })} placeholder="Username" className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-11 focus:border-cyan-500" required /></div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</Label>
                                                <div className="relative group">
                                                    <Input type={showRegisterPassword ? "text" : "password"} value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} placeholder="Password" className="bg-gray-900/50 border-gray-800 text-white rounded-xl h-11 pr-10 focus:border-cyan-500" required />
                                                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm</Label>
                                                <div className="relative group">
                                                    <Input type={showConfirmPassword ? "text" : "password"} value={registerData.confirm_password} onChange={(e) => setRegisterData({ ...registerData, confirm_password: e.target.value })} placeholder="Confirm" className="bg-gray-900/50 border-gray-800 text-white rounded-xl h-11 pr-10 focus:border-cyan-500" required />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg h-11 text-base mt-2" disabled={loading}>
                                            {loading ? "Creating Account..." : "Create Account"}
                                        </Button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800/50">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 text-xs md:text-sm font-medium group" onClick={() => navigate("/")}>
                                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                                </button>
                                <button className="text-cyan-500 hover:text-cyan-300 text-xs md:text-sm font-medium" onClick={() => navigate("/public-learning")}>Explore Learning Hub</button>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default AuthPage;