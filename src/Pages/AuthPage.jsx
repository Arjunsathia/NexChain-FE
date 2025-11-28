import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, User, Phone, ArrowLeft, Rocket, ChevronRight, Sparkles } from "lucide-react";
import { login, postForm } from "@/api/axiosConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import InteractiveGridPattern from "@/Components/Landing/Background"; // Import from Landing

// =================================================================
// MAIN AUTH PAGE COMPONENT
// =================================================================

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
  const [loginData, setLoginData] = useState({ user_name: "", password: "" });
  const [registerData, setRegisterData] = useState(initialRegisterKeys);
  const [activeTab, setActiveTab] = useState("login");
  const [logging, setLogging] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);

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
      const res = await login("/users/login", loginData);
      if (res.token) localStorage.setItem("NEXCHAIN_USER_TOKEN", res.token);
      if (res?.user) localStorage.setItem("NEXCHAIN_USER", JSON.stringify(res?.user));

      toast.success(`Welcome back, ${res?.user?.name || "User"}!`, {
        style: {
          background: "#CFFAFE",
          color: "#155E75",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          padding: "12px 16px",
          border: "none",
        },
        iconTheme: { primary: "#0891B2", secondary: "#FFFFFF" },
      });
      navigate("/dashboard");
    } catch (err) {
      toast.error("Incorrect username or password", {
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
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
    } finally {
      setLogging(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Email Validation
    if (!registerData.email || !registerData.email.includes("@")) {
      toast.error("Please enter a valid email address.", {
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
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
      return;
    }

    // Phone Validation
    const hasNumber = /\d/.test(registerData.phone);
    if (!registerData.phone || !hasNumber) {
      toast.error("Please enter a valid phone number.", {
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
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
      return;
    }

    if (registerData.password !== registerData.confirm_password) {
      toast.error("Passwords do not match.", {
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
        iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
      });
    } catch (err) {
      toast.error("Registration failed. Please try again", {
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
        flex items-center justify-center min-h-screen bg-[#000108] text-white px-4 relative overflow-hidden
      `}
    >
      {/* Use Landing Page Background */}
      <InteractiveGridPattern />
      
      {/* Background Glows (Matching Landing) */}
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
          {/* Glass Card Container */}
          <div className="relative rounded-3xl overflow-hidden bg-gray-950/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl shadow-black/50">
              {/* Top Highlight Line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              
              <CardContent className="p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-10">
                  <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"
                  >
                      <Rocket className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">NexChain</span>
                  </h2>
                  <p className="text-gray-400">
                  {activeTab === "login" ? "Access your professional trading dashboard" : "Join the future of digital asset trading"}
                  </p>
              </div>

              {/* Tab Navigation */}
              <div className="grid grid-cols-2 bg-gray-900/50 p-1.5 rounded-xl border border-gray-800/50 mb-8 relative">
                  <motion.div 
                      className="absolute top-1.5 bottom-1.5 rounded-lg bg-gray-800 shadow-sm"
                      initial={false}
                      animate={{ 
                          left: activeTab === "login" ? "6px" : "50%", 
                          width: "calc(50% - 9px)",
                          x: activeTab === "register" ? 3 : 0
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <button
                      onClick={() => setActiveTab("login")}
                      className={`relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${activeTab === "login" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                  >
                      Sign In
                  </button>
                  <button
                      onClick={() => setActiveTab("register")}
                      className={`relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${activeTab === "register" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                  >
                      Create Account
                  </button>
              </div>

              {/* Forms */}
              <AnimatePresence mode="wait">
                  {activeTab === "login" ? (
                  <motion.form
                      key="login"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
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
                                  className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-14 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                  required
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</Label>
                          <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                              <Input
                                  type="password"
                                  value={loginData.password}
                                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                  placeholder="Enter your password"
                                  className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-14 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                  required
                              />
                          </div>
                      </div>

                      <Button
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] h-14 text-lg mt-4"
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
                                  placeholder="John Doe"
                                  className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-14 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
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
                                  placeholder="john@example.com"
                                  className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-14 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
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
                                      placeholder="+1 234..."
                                      className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-14 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
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
                                      placeholder="@username"
                                      className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-14 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                      required
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</Label>
                              <div className="relative group">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                  <Input
                                      type="password"
                                      value={registerData.password}
                                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                      placeholder="••••••••"
                                      className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-14 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                      required
                                  />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm</Label>
                              <div className="relative group">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                  <Input
                                      type="password"
                                      value={registerData.confirm_password}
                                      onChange={(e) => setRegisterData({ ...registerData, confirm_password: e.target.value })}
                                      placeholder="••••••••"
                                      className="pl-12 bg-gray-900/50 border-gray-800 text-white rounded-xl h-14 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                      required
                                  />
                              </div>
                          </div>
                      </div>

                      <Button
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] h-14 text-lg mt-4"
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

              {/* Footer Actions */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800/50">
                  <button
                      className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-all duration-300 text-sm font-medium group"
                      onClick={() => navigate("/")}
                  >
                      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                      Back to Home
                  </button>
                  
                  <button
                      className="text-cyan-500 hover:text-cyan-300 text-sm font-medium transition-colors"
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