import React, { useState } from "react";
import { FaShieldAlt, FaLock, FaQrcode, FaCheckCircle } from "react-icons/fa";
import api from "../../../api/axiosConfig";
import { toast } from "react-hot-toast";

function SecuritySettings({ security, setSecurity, TC }) {
  const [setupData, setSetupData] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/setup-totp");
      setSetupData(res.data);
      setShowSetup(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (otp.length !== 6) return toast.error("Enter 6-digit code");
    setLoading(true);
    try {
      await api.post("/auth/verify-totp", {
        token: otp,
        secret: setupData.secret,
      });
      toast.success("2FA Enabled Successfully!");
      setSecurity({ ...security, twoFactor: true });
      setShowSetup(false);
      setSetupData(null);
      setOtp("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3
          className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${TC.textPrimary}`}
        >
          Security Settings
        </h3>

        <div className={`flex flex-col p-4 rounded-xl ${TC.bgItem} gap-4 mb-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-cyan-500/10 rounded-lg text-cyan-500">
                <FaShieldAlt className="text-base sm:text-xl" />
              </div>
              <div>
                <h4
                  className={`font-medium text-sm sm:text-base ${TC.textPrimary}`}
                >
                  Two-Factor Authentication
                </h4>
                <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>
                  {security.twoFactor
                    ? "Your account is secured with 2FA"
                    : "Add an extra layer of security"}
                </p>
              </div>
            </div>

            {security.twoFactor ? (
              <div className="flex items-center gap-2 text-green-500 font-bold text-sm bg-green-500/10 px-3 py-1.5 rounded-full">
                <FaCheckCircle /> Enabled
              </div>
            ) : (
              <button
                onClick={startSetup}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
              >
                {loading ? "Loading..." : "Enable 2FA"}
              </button>
            )}
          </div>

          {/* SETUP AREA */}
          {showSetup && setupData && (
            <div className="mt-4 p-4 border border-cyan-500/30 rounded-xl bg-cyan-500/5 animate-in fade-in slide-in-from-top-4">
              <h5
                className={`font-bold mb-4 ${TC.textPrimary} flex items-center gap-2`}
              >
                <FaQrcode /> Scan QR Code
              </h5>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="bg-white p-2 rounded-xl w-fit h-fit">
                  <img
                    src={setupData.qrCode}
                    alt="2FA QR"
                    className="w-32 h-32 sm:w-40 sm:h-40"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label
                      className={`text-xs uppercase font-bold tracking-wider ${TC.textSecondary}`}
                    >
                      Manual Entry Code
                    </label>
                    <p
                      className={`font-mono text-lg ${TC.textPrimary} break-all select-all`}
                    >
                      {setupData.secret}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`text-xs uppercase font-bold tracking-wider ${TC.textSecondary} mb-2 block`}
                    >
                      Verify Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        maxLength={6}
                        placeholder="000 000"
                        className={`w-full max-w-[200px] rounded-xl px-4 py-2 text-center tracking-[0.2em] font-mono outline-none border ${TC.bgInput}`}
                      />
                      <button
                        onClick={verifyAndEnable}
                        disabled={otp.length !== 6 || loading}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-bold disabled:opacity-50"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 opacity-50 pointer-events-none">
          {/* Unused Password fields for now, kept for layout but disabled as focus is 2FA */}
          <div>
            <label
              className={`block text-xs sm:text-sm font-bold mb-2 uppercase tracking-wide ${TC.textSecondary}`}
            >
              Current Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className={`w-full rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm outline-none transition-all border ${TC.bgInput}`}
              />
            </div>
          </div>
          <div>
            <label
              className={`block text-xs sm:text-sm font-bold mb-2 uppercase tracking-wide ${TC.textSecondary}`}
            >
              New Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className={`w-full rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm outline-none transition-all border ${TC.bgInput}`}
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-center mt-2 text-yellow-500">
          Password changes currently disabled in this demo.
        </p>
      </div>
    </div>
  );
}

export default SecuritySettings;
