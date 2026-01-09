import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaQrcode } from "react-icons/fa";
import api from "@/api/axiosConfig";
import toast from "react-hot-toast";
import useUserContext from "@/hooks/useUserContext";

const SecuritySettings = ({ TC, isLight }) => {
  const { user } = useUserContext();
  const isDark = !isLight;
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
    } catch {
      toast.error("Failed to start 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    try {
      const res = await api.post("/2fa/verify", {
        user_id: user.id,
        token: otp,
      });
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
    if (
      !window.confirm(
        "Are you sure you want to disable 2FA? This will reduce your account security.",
      )
    )
      return;

    setLoading(true);
    try {
      const res = await api.post("/2fa/disable", { user_id: user.id });
      if (res.data.success) {
        toast.success("2FA Disabled");
        setSecurity({ ...security, twoFactor: false });
      }
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h3
        className={`text-lg font-bold mb-5 flex items-center gap-2 ${TC.textPrimary} tracking-tight`}
      >
        <FaShieldAlt className="text-cyan-500" /> Security Configuration
      </h3>

      {/* 2FA Section */}
      <div
        className={`pb-8 border-b border-dashed`}
        style={{ borderColor: isLight ? "#e5e7eb" : "rgba(255,255,255,0.1)" }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className={`font-bold text-lg ${TC.textPrimary}`}>
              Two-Factor Authentication (2FA)
            </h3>
            <p className={`text-sm mt-1 ${TC.textSecondary}`}>
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
                className="px-5 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={handleEnable2FA}
                disabled={loading}
                className={TC.btnPrimary}
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>

        {/* QR Code Setup */}
        {showSetup && !security.twoFactor && (
          <div
            className={`mt-8 p-6 rounded-2xl border animate-in slide-in-from-top-4 duration-300 ${isDark ? "bg-black/20 border-white/5" : "bg-gray-50 border-gray-100"}`}
          >
            <h4
              className={`font-bold mb-6 flex items-center gap-2 ${TC.textPrimary}`}
            >
              <FaQrcode className="text-cyan-500" /> Scan QR Code
            </h4>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-white p-3 rounded-xl shadow-lg">
                <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
              </div>
              <div className="flex-1 space-y-6 text-center md:text-left">
                <p className={`text-sm leading-relaxed ${TC.textSecondary}`}>
                  1. Open your authenticator app (Google Authenticator, Authy,
                  etc.) <br />
                  2. Scan the QR code. <br />
                  3. Enter the 6-digit code below to verify.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className={`px-4 py-3 rounded-xl border outline-none w-full sm:w-48 text-center tracking-widest font-mono text-lg transition-all ${TC.bgInput}`}
                  />
                  <button
                    onClick={handleVerify2FA}
                    disabled={loading || otp.length !== 6}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
