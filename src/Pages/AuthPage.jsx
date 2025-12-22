import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/Components/ui/input.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Card, CardContent } from "@/Components/ui/card.jsx";
import { Mail, Lock, User, Phone, ArrowLeft, Rocket, ChevronRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { login, postForm } from "@/api/axiosConfig";
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
  role: "",
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { fetchUsers } = useUserContext();
  const [loginData, setLoginData] = useState({ user_name: "", password: "" });
  const [registerData, setRegisterData] = useState(initialRegisterKeys);
  const [activeTab, setActiveTab] = useState("login");
  const [logging, setLogging] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
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
    setLogging(true);
    try {
      
      const loginPayload = {
        email: loginData.user_name, 
        password: loginData.password
      };
      const res = await login("/users/login", loginPayload);
      
      if (res.twoFactorRequired) {
          setTwoFactorRequired(true);
          setUserId(res.user_id);
          setLogging(false);
          toast("2FA Required", { icon: "🔒" });
          return;
      }

      if (res.token) localStorage.setItem("NEXCHAIN_USER_TOKEN", res.token);
      if (res?.user) localStorage.setItem("NEXCHAIN_USER", JSON.stringify(res?.user));
      
      
      await fetchUsers();

      toast.success(`Welcome back, ${res?.user?.name || "User"}!`, {
        className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
        style: {
          background: "#CFFAFE",
          color: "#155E75",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "none",
        },
        iconTheme: { primary: "#0891B2", secondary: "#FFFFFF" },
      });
      if (res?.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Incorrect username or password";
      toast.error(errorMessage, {
        className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
    } finally {
      setLogging(false);
    }
  };

  const handleVerify2FA = async (e) => {
      e.preventDefault();
      setLogging(true);
      try {
          const res = await postForm("/users/verify-login-2fa", { user_id: userId, token: otp });
          
          if (res.token) localStorage.setItem("NEXCHAIN_USER_TOKEN", res.token);
          if (res?.user) localStorage.setItem("NEXCHAIN_USER", JSON.stringify(res?.user || res)); 
          
          
          await fetchUsers();

          toast.success(`Welcome back!`);
          if (res?.user?.role === "admin" || res?.role === "admin") {
              navigate("/admin");
          } else {
              navigate("/dashboard");
          }
      } catch (err) {
          toast.error(err.response?.data?.message || "Invalid 2FA Code");
      } finally {
          setLogging(false);
      }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    
    if (!registerData.email || !registerData.email.includes("@")) {
      toast.error("Please enter a valid email address.", {
        className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
      return;
    }

    
    const hasNumber = /\d/.test(registerData.phone);
    if (!registerData.phone || !hasNumber) {
      toast.error("Please enter a valid phone number.", {
        className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
      return;
    }

    if (registerData.password !== registerData.confirm_password) {
      toast.error("Passwords do not match.", {
        className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
      return;
    }
    setRegistering(true);
    try {
      await postForm("/users", registerData);
      setActiveTab("login");
      setRegisterData(initialRegisterKeys);
      toast.success("Account created successfully", {
        className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
        style: {
          background: "#DCFCE7",
          color: "#166534",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "none",
        },
        iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again";
      toast.error(errorMessage, {
        className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`
        flex items-center justify-center min-h-screen bg-[#000108] text-white px-4 py-10 relative overflow-hidden
      `}
    >
      {}
      <InteractiveGridPattern />
      
      {}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 bg-cyan-400 pointer-events-none" /> 
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 bg-blue-500 pointer-events-none" /> 

      <motion.div 
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-xl relative z-10"
      >
        <Card 
          className={`
            w-full border-0 bg-transparent shadow-none
          `}
        >
          {}
          <div className="relative rounded-3xl overflow-hidden bg-gray-950/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl shadow-black/50">
              {}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              
              <CardContent className="p-5 md:p-10">
              {}
              <div className="text-center mb-6 md:mb-10">
                  <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"
                  >
                      <Rocket className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </motion.div>
                  
                  <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-3 tracking-tight">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">NexChain</span>
                  </h2>
                  <p className="text-gray-400">
                  {activeTab === "login" ? "Access your professional trading dashboard" : "Join the future of digital asset trading"}
                  </p>
              </div>

              {}
              <div className="grid grid-cols-2 bg-gray-900/50 p-1 md:p-1.5 rounded-lg md:rounded-xl border border-gray-800/50 mb-6 relative w-full max-w-[240px] md:max-w-full mx-auto">
                  <motion.div 
                      className="absolute top-1 md:top-1.5 bottom-1 md:bottom-1.5 rounded-md md:rounded-lg bg-gray-800 shadow-sm"
                      initial={false}
                      animate={{ 
                          left: activeTab === "login" ? (isMobile ? "4px" : "6px") : "50%", 
                          width: isMobile ? "calc(50% - 6px)" : "calc(50% - 9px)",
                          x: activeTab === "register" ? (isMobile ? 2 : 3) : 0
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <button
                      onClick={() => setActiveTab("login")}
                      className={`relative z-10 py-1.5 md:py-2.5 text-xs md:text-sm font-semibold rounded-md md:rounded-lg transition-colors duration-200 ${activeTab === "login" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                  >
                      Sign In
                  </button>
                  <button
                      onClick={() => setActiveTab("register")}
                      className={`relative z-10 py-1.5 md:py-2.5 text-xs md:text-sm font-semibold rounded-md md:rounded-lg transition-colors duration-200 ${activeTab === "register" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                  >
                      Create Account
                  </button>
              </div>

              {}
                  <AnimatePresence mode="wait">
                      {twoFactorRequired ? (
                          <motion.form
                              key="2fa"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-5"
                              onSubmit={handleVerify2FA}
                          >
                              <div className="text-center mb-6">
                                  <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                      <Lock className="w-8 h-8 text-cyan-500" />
                                  </div>
                                  <h3 className="text-xl font-bold text-white">Two-Factor Authentication</h3>
                                  <p className="text-gray-400 text-sm mt-2">Enter the 6-digit code from your authenticator app</p>
                              </div>

                              <div className="space-y-2">
                                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Authentication Code</Label>
                                  <div className="relative group">
                                      <Input
                                          type="text"
                                          value={otp}
                                          onChange={(e) => setOtp(e.target.value)}
                                          placeholder="000000"
                                          maxLength={6}
                                          className="bg-gray-900/50 border-gray-800 text-white rounded-xl h-10 md:h-14 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600 text-center text-xl md:text-2xl tracking-[0.5em] font-mono"
                                          required
                                          autoFocus
                                      />
                                  </div>
                              </div>

                              <Button
                                  className="w-full max-w-[240px] md:max-w-full mx-auto flex justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] h-10 md:h-14 text-base md:text-lg mt-2 md:mt-4"
                                  type="submit"
                                  disabled={logging || otp.length !== 6}
                              >
                                  {logging ? (
                                      <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                          <span>Verifying...</span>
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-2">
                                          <span>Verify Code</span>
                                          <ChevronRight className="w-5 h-5" />
                                      </div>
                                  )}
                              </Button>
                              
                              <button 
                                  type="button"
                                  onClick={() => { setTwoFactorRequired(false); setOtp(""); }}
                                  className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
                              >
                                  Back to Login
                              </button>
                          </motion.form>
                      ) : activeTab === "login" ? (
                  <motion.form
                      key="login"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 md:space-y-5"
                      onSubmit={handleLogin}
                  >
                      <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username</Label>
                          <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                  <Input
                                      type="text"
                                      value={loginData.user_name}
                                      onChange={(e) => setLoginData({ ...loginData, user_name: e.target.value })}
                                      placeholder="Enter your username"
                                      className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-10 md:h-14 text-sm md:text-base focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                      required
                                  />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</Label>
                          <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors z-10" />
                              <Input
                                  type={showLoginPassword ? "text" : "password"}
                                  value={loginData.password}
                                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                  placeholder="Enter your password"
                                  className="pl-12 pr-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-10 md:h-14 text-sm md:text-base focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                  required
                              />
                              <button
                                  type="button"
                                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors z-10 bg-transparent border-0 p-0" 
                              >
                                  {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                          </div>
                      </div>

                      <Button
                          className="w-full max-w-[240px] md:max-w-full mx-auto flex justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] h-10 md:h-14 text-base md:text-lg mt-2 md:mt-4"
                          type="submit"
                          disabled={logging}
                      >
                          {logging ? (
                              <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>Authenticating...</span>
                              </div>
                          ) : (
                              <div className="flex items-center gap-2">
                                  <span>Sign In</span>
                                  <ChevronRight className="w-5 h-5" />
                              </div>
                          )}
                      </Button>
                  </motion.form>
                  ) : (
                  <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                      onSubmit={handleRegister}
                  >
                      <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</Label>
                          <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                              <Input
                                  type="text"
                                  value={registerData.name}
                                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                  placeholder="Enter your full name"
                                  className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-10 md:h-14 text-sm md:text-base focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                  required
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</Label>
                          <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                              <Input
                                  type="email"
                                  value={registerData.email}
                                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                  placeholder="Enter your email address"
                                  className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-10 md:h-14 text-sm md:text-base focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                  required
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone</Label>
                              <div className="relative group">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                  <Input
                                      type="tel"
                                      value={registerData.phone}
                                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                      placeholder="Enter your phone number"
                                      className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-10 md:h-14 text-sm md:text-base focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                  />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username</Label>
                              <div className="relative group">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                  <Input
                                      type="text"
                                      value={registerData.user_name}
                                      onChange={(e) => setRegisterData({ ...registerData, user_name: e.target.value })}
                                      placeholder="Choose a username"
                                      className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-10 md:h-14 text-sm md:text-base focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                      required
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</Label>
                              <div className="relative group">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors z-10" />
                                  <Input
                                      type={showRegisterPassword ? "text" : "password"}
                                      value={registerData.password}
                                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                      placeholder="Create a strong password"
                                      className="pl-12 pr-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-10 md:h-14 text-sm md:text-base focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                      required
                                  />
                                  <button
                                      type="button"
                                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors z-10 bg-transparent border-0 p-0" 
                                  >
                                      {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                  </button>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm</Label>
                              <div className="relative group">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors z-10" />
                                  <Input
                                      type={showConfirmPassword ? "text" : "password"}
                                      value={registerData.confirm_password}
                                      onChange={(e) => setRegisterData({ ...registerData, confirm_password: e.target.value })}
                                      placeholder="Confirm your password"
                                      className="pl-12 pr-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-10 md:h-14 text-sm md:text-base focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                      required
                                  />
                                  <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors z-10 bg-transparent border-0 p-0" 
                                  >
                                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                  </button>
                              </div>
                          </div>
                      </div>

                      <Button
                          className="w-full max-w-[240px] md:max-w-full mx-auto flex justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] h-10 md:h-14 text-base md:text-lg mt-2 md:mt-4"
                          type="submit"
                          disabled={registering}
                      >
                          {registering ? (
                              <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>Creating Account...</span>
                              </div>
                          ) : (
                              <div className="flex items-center gap-2">
                                  <span>Create Account</span>
                                  <Sparkles className="w-5 h-5" />
                              </div>
                          )}
                      </Button>
                  </motion.form>
                  )}
              </AnimatePresence>

              {}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800/50">
                  <button
                      className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-all duration-300 text-xs md:text-sm font-medium group"
                      onClick={() => navigate("/")}
                  >
                      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                      Back to Home
                  </button>
                  
                  <button
                      className="text-cyan-500 hover:text-cyan-300 text-xs md:text-sm font-medium transition-colors"
                      onClick={() => navigate("/public-learning")}
                  >
                      Explore Learning Hub
                  </button>
              </div>
              </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;