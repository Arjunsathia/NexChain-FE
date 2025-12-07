import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaQrcode, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "@/api/axiosConfig";
import toast from "react-hot-toast";
import useUserContext from "@/Context/UserContext/useUserContext";
import { useTheme } from "@/Context/ThemeContext";

const SecuritySettings = () => {
  const { user } = useUserContext();
  const { isDark } = useTheme();
  const [security, setSecurity] = useState({
    twoFactor: user?.twoFactorEnabled || false,
  });
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
        setSecurity({ twoFactor: user.twoFactorEnabled });
    }
  }, [user]);

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const res = await api.post("/2fa/setup", { user_id: user.id });
      if (res.data.success) {
        setQrCode(res.data.qrCode);
        setShowSetup(true);
      }
    } catch (error) {
      toast.error("Failed to start 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    try {
      const res = await api.post("/2fa/verify", { user_id: user.id, token: otp });
      if (res.data.success) {
        toast.success("2FA Enabled Successfully");
        setSecurity({ ...security, twoFactor: true });
        setShowSetup(false);
        setOtp("");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
      if(!window.confirm("Are you sure you want to disable 2FA? This will reduce your account security.")) return;
      
      setLoading(true);
      try {
          const res = await api.post("/2fa/disable", { user_id: user.id });
          if(res.data.success) {
              toast.success("2FA Disabled");
              setSecurity({ ...security, twoFactor: false });
          }
      } catch (error) {
          toast.error("Failed to disable 2FA");
      } finally {
          setLoading(false);
      }
  }

  // Theme Classes
  const containerClass = `rounded-xl p-6 border ${
    isDark ? "bg-gray-700/30 border-gray-700" : "bg-gray-50 border-gray-200"
  }`;
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const inputClass = `px-4 py-2 rounded-lg border outline-none w-full sm:w-48 text-center tracking-widest font-mono text-lg focus:ring-2 focus:ring-cyan-500 ${
    isDark 
      ? "bg-gray-700 text-white border-gray-600" 
      : "bg-white text-gray-900 border-gray-300"
  }`;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
        <FaShieldAlt className="text-cyan-500" /> Security Settings
      </h2>
      
      <div className={containerClass}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-semibold text-lg ${textPrimary}`}>Two-Factor Authentication (2FA)</h3>
            <p className={`text-sm mt-1 ${textSecondary}`}>
                {security.twoFactor 
                    ? "Your account is secured with 2FA." 
                    : "Add an extra layer of security to your account."}
            </p>
          </div>
          <div>
              {security.twoFactor ? (
                  <button 
                    onClick={handleDisable2FA}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg text-sm font-semibold transition-colors"
                  >
                      Disable 2FA
                  </button>
              ) : (
                  <button 
                    onClick={handleEnable2FA}
                    disabled={loading}
                    className="px-4 py-2 bg-cyan-500 text-white hover:bg-cyan-600 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-cyan-500/30"
                  >
                      Enable 2FA
                  </button>
              )}
          </div>
        </div>

        {/* 2FA Setup Area */}
        {showSetup && !security.twoFactor && (
            <div className={`mt-6 p-6 rounded-xl border animate-fade-in ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
                <h4 className={`font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
                    <FaQrcode className="text-cyan-500" /> Scan QR Code
                </h4>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            1. Open your authenticator app (Google Authenticator, Authy, etc.) <br/>
                            2. Scan the QR code. <br/>
                            3. Enter the 6-digit code below to verify.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                                type="text" 
                                placeholder="Enter 6-digit code" 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                className={inputClass}
                            />
                            <button 
                                onClick={handleVerify2FA}
                                disabled={loading || otp.length !== 6}
                                className="px-6 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;
