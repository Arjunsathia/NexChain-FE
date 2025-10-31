import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, User, Phone, ArrowLeft, Rocket } from "lucide-react";
import { login, postForm } from "@/api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLogging(true);
    try {
      const res = await login("/users/login", loginData);
      if (res.token) {
        localStorage.setItem("NEXCHAIN_USER_TOKEN", res.token);
      }
      if (res?.user) {
        localStorage.setItem("NEXCHAIN_USER", JSON.stringify(res?.user));
      }

      toast.success(`Welcome back, ${res?.user?.name || "User"}!`, {
        style: {
          background: "#111827",
          color: "#22c55e",
          border: "1px solid #374151",
        },
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Submission failed:", err.response?.data || err.message);
      toast.error("Login failed! Please check your credentials.", {
        style: {
          background: "#111827",
          color: "#ef4444",
          border: "1px solid #374151",
        },
      });
    } finally {
      setLogging(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirm_password) {
      toast.error("Passwords do not match.", {
        style: {
          background: "#111827",
          color: "#ef4444",
          border: "1px solid #374151",
        },
      });
      return;
    }
    setRegistering(true);
    try {
      await postForm("/users", registerData);
      setActiveTab("login");
      setRegisterData(initialRegisterKeys);
      toast.success("Account created successfully! Please login.", {
        style: {
          background: "#111827",
          color: "#22c55e",
          border: "1px solid #374151",
        },
      });
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Registration failed. Please try again.", {
        style: {
          background: "#111827",
          color: "#ef4444",
          border: "1px solid #374151",
        },
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div 
      className={`
        flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-[#0f172a] to-gray-900 
        text-white px-4 transition-all duration-1000 ease-out
        ${isMounted ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <Card 
        className={`
          w-full max-w-xl p-8 shadow-2xl rounded-2xl border border-gray-700 bg-transparent backdrop-blur-sm
          transition-all duration-700 ease-out transform
          ${isMounted ? 'opacity-100 scale-100 glow-fade' : 'opacity-0 scale-95'}
        `}
        style={{ animationDelay: "0.2s" }}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div 
            className={`
              text-center mb-8 transition-all duration-500 ease-out
              ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
            `}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-cyan-400 mb-2">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                NexChain
              </span>
            </h2>
            <p className="text-gray-400 text-sm">
              {activeTab === "login" ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          {/* Tab Navigation */}
          <div 
            className={`
              grid grid-cols-2 bg-gray-800/50 backdrop-blur-sm mb-8 rounded-xl p-1 border border-gray-700
              transition-all duration-500 ease-out
              ${isMounted ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={() => setActiveTab("login")}
              className={`
                py-3 px-4 rounded-lg transition-all duration-300 font-semibold text-sm
                ${activeTab === "login" 
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg transform scale-105" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }
              `}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`
                py-3 px-4 rounded-lg transition-all duration-300 font-semibold text-sm
                ${activeTab === "register" 
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg transform scale-105" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }
              `}
            >
              Create Account
            </button>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {activeTab === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
                onSubmit={handleLogin}
              >
                <div 
                  className={`
                    transition-all duration-500 ease-out
                    ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                  style={{ animationDelay: "0.5s" }}
                >
                  <Label className="text-sm text-gray-300 mb-2 block">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      value={loginData.user_name}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          user_name: e.target.value,
                        })
                      }
                      placeholder="Enter your username"
                      className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div 
                  className={`
                    transition-all duration-500 ease-out
                    ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                  style={{ animationDelay: "0.6s" }}
                >
                  <Label className="text-sm text-gray-300 mb-2 block">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      placeholder="Enter your password"
                      className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div 
                  className={`
                    transition-all duration-500 ease-out
                    ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}
                  style={{ animationDelay: "0.7s" }}
                >
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 h-12 text-base"
                    type="submit"
                    disabled={logging}
                  >
                    {logging ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing In...
                      </div>
                    ) : (
                      "Sign In to Dashboard"
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {activeTab === "register" && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
                onSubmit={handleRegister}
              >
                <div className="space-y-5">
                  {/* Name */}
                  <div 
                    className={`
                      transition-all duration-500 ease-out
                      ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                    `}
                    style={{ animationDelay: "0.5s" }}
                  >
                    <Label className="text-sm text-gray-300 mb-2 block">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter your full name"
                        className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div 
                    className={`
                      transition-all duration-500 ease-out
                      ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                    `}
                    style={{ animationDelay: "0.6s" }}
                  >
                    <Label className="text-sm text-gray-300 mb-2 block">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        placeholder="you@example.com"
                        className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Grid for smaller inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div 
                      className={`
                        transition-all duration-500 ease-out
                        ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                      style={{ animationDelay: "0.7s" }}
                    >
                      <Label className="text-sm text-gray-300 mb-2 block">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="tel"
                          value={registerData.phone}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+1 (555) 000-0000"
                          className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div 
                      className={`
                        transition-all duration-500 ease-out
                        ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                      style={{ animationDelay: "0.8s" }}
                    >
                      <Label className="text-sm text-gray-300 mb-2 block">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          value={registerData.user_name}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              user_name: e.target.value,
                            })
                          }
                          placeholder="Choose a username"
                          className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div 
                      className={`
                        transition-all duration-500 ease-out
                        ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                      style={{ animationDelay: "0.9s" }}
                    >
                      <Label className="text-sm text-gray-300 mb-2 block">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Create a password"
                          className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div 
                      className={`
                        transition-all duration-500 ease-out
                        ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                      style={{ animationDelay: "1.0s" }}
                    >
                      <Label className="text-sm text-gray-300 mb-2 block">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          value={registerData.confirm_password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              confirm_password: e.target.value,
                            })
                          }
                          placeholder="Confirm your password"
                          className="pl-10 bg-transparent text-white border-gray-700 rounded-xl h-12 focus:border-cyan-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className={`
                    transition-all duration-500 ease-out
                    ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}
                  style={{ animationDelay: "1.1s" }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 h-12 text-base"
                    disabled={registering}
                  >
                    {registering ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div 
            className={`
              flex justify-between items-center mt-8 pt-6 border-t border-gray-700
              transition-all duration-700 ease-out
              ${isMounted ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ animationDelay: "1.2s" }}
          >
            <button
              className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-800/50"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
            
            <button
              className="text-cyan-400 hover:text-white border border-cyan-400 hover:border-cyan-300 py-2 px-6 rounded-lg transition-all duration-300 hover:bg-cyan-400/10"
              onClick={() => navigate("/learning")}
            >
              Skip to Learning
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;