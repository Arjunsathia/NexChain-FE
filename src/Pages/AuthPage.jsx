import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, User, Phone, ArrowLeft, Rocket, ChevronRight, Sparkles } from "lucide-react";
import { login, postForm } from "@/api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// =================================================================
// VISUAL COMPONENTS (Ported from Landing.jsx for consistency)
// =================================================================

const GridBeam = ({ delay = 0, duration = 4, top, left, vertical = false }) => (
  <motion.div
    initial={vertical ? { top: '-20%', opacity: 0 } : { left: '-20%', opacity: 0 }}
    animate={vertical ? { top: '120%', opacity: [0, 1, 1, 0] } : { left: '120%', opacity: [0, 1, 1, 0] }}
    transition={{
      repeat: Infinity,
      duration: duration,
      delay: delay,
      ease: "linear",
      repeatDelay: Math.random() * 5 + 2 
    }}
    className={`absolute bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[2px] shadow-[0_0_15px_rgba(34,211,238,0.8)] z-0`}
    style={{
      ...(vertical ? { 
          left: left, 
          width: '1px', 
          height: '200px', 
          background: 'linear-gradient(to bottom, transparent, #22d3ee, transparent)' 
        } : { 
          top: top, 
          height: '1px', 
          width: '200px' 
        })
    }}
  />
);

const InteractiveGridPattern = () => {
  const opacity = "opacity-[0.03]"; 
  const gridColor = '#fff'; 
  const spotlightColor = 'rgba(6,182,212,0.12)'; 

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-full w-full"> 
      <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07]`}></div> 
      <div 
        className={`w-full h-full ${opacity}`} 
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: '30px 30px', 
          backgroundAttachment: 'fixed',
        }}
      ></div>

      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), ${spotlightColor}, transparent 45%)`,
        }}
      ></div>

      <div 
        className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-[2px] shadow-[0_0_15px_rgba(34,211,238,1)] transition-transform duration-75 ease-out will-change-transform z-10" 
        style={{
          left: 0,
          top: 0,
          transform: 'translate(calc(var(--mouse-x) - 4px), calc(var(--mouse-y) - 4px))',
        }}
      ></div>

      <>
        <GridBeam top="10%" delay={0} duration={5} />
        <GridBeam top="40%" delay={1} duration={6} />
        <GridBeam top="70%" delay={0.5} duration={9} />
        <GridBeam left="20%" delay={1.5} duration={6} vertical />
        <GridBeam left="80%" delay={3} duration={5} vertical />
      </>
    </div>
  );
};

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
        style: { background: "#000108", color: "#22d3ee", border: "1px solid #1e293b" },
      });
      navigate("/dashboard");
    } catch (err) {
      toast.error("Login failed! Please check your credentials.", {
        style: { background: "#000108", color: "#ef4444", border: "1px solid #1e293b" },
      });
    } finally {
      setLogging(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirm_password) {
      toast.error("Passwords do not match.", {
        style: { background: "#000108", color: "#ef4444", border: "1px solid #1e293b" },
      });
      return;
    }
    setRegistering(true);
    try {
      await postForm("/users", registerData);
      setActiveTab("login");
      setRegisterData(initialRegisterKeys);
      toast.success("Account created successfully! Please login.", {
        style: { background: "#000108", color: "#22d3ee", border: "1px solid #1e293b" },
      });
    } catch (err) {
      toast.error("Registration failed. Please try again.", {
        style: { background: "#000108", color: "#ef4444", border: "1px solid #1e293b" },
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
        transition-opacity duration-1000 ease-out
        ${isMounted ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <InteractiveGridPattern />
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <Card 
        className={`
          w-full max-w-xl p-1 relative z-10 border-0 bg-transparent shadow-none
          transition-all duration-700 ease-out transform
          ${isMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'}
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
    </div>
  );
};

export default AuthPage;