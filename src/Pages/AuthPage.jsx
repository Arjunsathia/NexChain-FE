import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/Components/ui/input.jsx";
import { Button } from "@/Components/ui/button.jsx";
import {
  Rocket,
  Shield,
  Fingerprint,
  Globe,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { postForm, setMemoryToken } from "@/api/axiosConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  const { setToken, updateUser } = useUserContext();

  // Auth State
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ user_name: "", password: "" });
  const [registerData, setRegisterData] = useState(initialRegisterKeys);
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      toast.loading("Authenticating with Google...", { id: "google-auth" });
      try {
        // Send Access Token to Backend
        const res = await postForm("/auth/google", {
          googleAccessToken: tokenResponse.access_token,
        });

        if (res.accessToken) {
          setToken(res.accessToken);
          setMemoryToken(res.accessToken);
          localStorage.setItem("NEXCHAIN_USER_TOKEN", res.accessToken);
          if (res?.user) {
            updateUser(res.user);
            localStorage.setItem("NEXCHAIN_USER", JSON.stringify(res?.user));
          }


          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Google Login Error", err);
        toast.error(err.response?.data?.message || "Google Login failed", {
          id: "google-auth",
        });
      }
    },
    onError: () => toast.error("Google Login Failed"),
  });

  // Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await postForm("/auth/login", {
        email: loginData.user_name,
        password: loginData.password,
      });
      if (res.accessToken) {
        setToken(res.accessToken);
        setMemoryToken(res.accessToken);
        localStorage.setItem("NEXCHAIN_USER_TOKEN", res.accessToken);
        if (res?.user) {
          updateUser(res.user);
          localStorage.setItem("NEXCHAIN_USER", JSON.stringify(res?.user));
        }

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
    if (registerData.password !== registerData.confirm_password)
      return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await postForm("/auth/register", registerData);
      setEmailForOtp(res.email);
      setShowOtpInput(true);
      toast.success("Check your email for OTP.");
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
      await postForm("/auth/verify-email-otp", {
        email: emailForOtp,
        otp: otpCode,
      });
      toast.success("Verified! Please login.");
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
    <div className="relative h-screen w-full bg-transparent text-white flex items-center justify-center overflow-hidden font-sans selection:bg-cyan-500/30">
      <div className="absolute top-4 left-4 z-50 md:top-8 md:left-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-outfit text-sm backdrop-blur-md group"
        >
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[1200px] px-4 md:px-6 grid xl:grid-cols-2 gap-12 items-center justify-items-center">
        {/* Left Side: Brand Narrative - Compacted */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden xl:flex flex-col space-y-8 w-full max-w-[550px]"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-bold tracking-widest uppercase">
              <Globe className="w-3 h-3 animate-spin-slow" />
              Live Network Active
            </div>

            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
              Trade the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
                Future Grid.
              </span>
            </h1>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-xl font-bold text-white">Real-time</p>
                <p className="text-slate-500 text-xs uppercase tracking-wider">
                  Market Data
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-white">Secure</p>
                <p className="text-slate-500 text-xs uppercase tracking-wider">
                  Platform
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Elegant Glass Terminal - Compacted */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group w-full max-w-md mx-auto xl:max-w-none"
        >
          {/* Glowing Aura behind card */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[1.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

          <div className="relative bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] p-6 md:p-8 shadow-2xl">
            {/* Form Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {showOtpInput
                    ? "Verify Email"
                    : activeTab === "login"
                      ? "Welcome Back"
                      : "Create Account"}
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  {showOtpInput
                    ? "Enter the code sent to your email"
                    : "Enter your details to continue"}
                </p>
              </div>
              <Rocket className="w-6 h-6 text-cyan-500 opacity-50" />
            </div>

            {/* Google Social Access - Hidden on OTP */}
            {!showOtpInput && (
              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => googleLogin()}
                  variant="outline"
                  className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group text-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <svg className="w-5 h-5 min-w-[20px]" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    />
                  </svg>
                  <span className="font-semibold tracking-wide">
                    Continue with Google
                  </span>
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase tracking-[0.2em] text-slate-600">
                    <span className="bg-[#0a0a0a] px-3">
                      Or continue with email
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Animated Form Content */}
            <AnimatePresence mode="wait">
              {showOtpInput ? (
                <motion.form
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-4"
                >
                  <Input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="h-16 bg-white/[0.03] border-white/10 rounded-xl focus:border-cyan-500/50 text-center text-3xl tracking-[0.5em] font-mono transition-all px-4"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                  <Button className="group relative w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 text-sm">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Verifying..." : "Verify Email"}
                      <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowOtpInput(false)}
                    className="w-full text-center text-[10px] text-slate-500 hover:text-cyan-400"
                  >
                    Cancel
                  </button>
                </motion.form>
              ) : activeTab === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <Input
                      value={loginData.user_name}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          user_name: e.target.value,
                        })
                      }
                      className="h-11 bg-white/[0.03] border-white/10 rounded-xl focus:border-cyan-500/50 focus:bg-white/[0.06] transition-all px-4 text-sm"
                      placeholder="Email Address"
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="relative space-y-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className="h-11 bg-white/[0.03] border-white/10 rounded-xl focus:border-cyan-500/50 px-4 pr-10 text-sm"
                      placeholder="Password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <Button className="group relative w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 text-sm">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Signing in..." : "Sign In"}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleRegister}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                      className="col-span-2 h-11 bg-white/[0.03] border-white/10 rounded-xl px-4 text-sm"
                      placeholder="Full Name"
                      autoComplete="name"
                      required
                    />
                    <Input
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      className="col-span-2 h-11 bg-white/[0.03] border-white/10 rounded-xl px-4 text-sm"
                      placeholder="Email Address"
                      type="email"
                      autoComplete="email"
                      required
                    />
                    <Input
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          phone: e.target.value,
                        })
                      }
                      className="h-11 bg-white/[0.03] border-white/10 rounded-xl px-4 text-sm"
                      placeholder="Phone Number"
                      autoComplete="tel"
                      required
                    />
                    <Input
                      value={registerData.user_name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          user_name: e.target.value,
                        })
                      }
                      className="h-11 bg-white/[0.03] border-white/10 rounded-xl px-4 text-sm"
                      placeholder="Username"
                      autoComplete="username"
                      required
                    />
                    <Input
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      className="h-11 bg-white/[0.03] border-white/10 rounded-xl px-4 text-sm"
                      placeholder="Password"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                    <Input
                      value={registerData.confirm_password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirm_password: e.target.value,
                        })
                      }
                      className="h-11 bg-white/[0.03] border-white/10 rounded-xl px-4 text-sm"
                      placeholder="Confirm Password"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <Button className="group relative w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 text-sm">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Creating Account..." : "Create Account"}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Elegant Tab Switcher */}
            {!showOtpInput && (
              <div className="mt-6 text-center">
                <p className="text-slate-500 text-xs">
                  {activeTab === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <button
                    onClick={() =>
                      setActiveTab(activeTab === "login" ? "register" : "login")
                    }
                    className="ml-2 text-cyan-400 font-bold hover:text-cyan-300 transition-colors underline-offset-4 hover:underline"
                  >
                    {activeTab === "login" ? "Sign Up" : "Log In"}
                  </button>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
