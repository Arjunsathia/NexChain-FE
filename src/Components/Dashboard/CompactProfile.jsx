import React, { useState, useEffect } from "react";
import { FaWallet } from "react-icons/fa";
import useUserContext from "@/Context/UserContext/useUserContext";
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(
    !document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isLight;
};

const CompactProfile = () => {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const { balance } = useWalletContext();

  const TC = {
    bgCard: isLight
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textBalance: isLight ? "text-green-700" : "text-green-400",
    textIcon: isLight ? "text-cyan-600" : "text-cyan-400",
  };

  return (
    <div className={`rounded-xl p-4 fade-in ${TC.bgCard}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-sm flex items-center justify-center font-bold text-white shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <h3 className={`font-semibold text-sm truncate ${TC.textPrimary}`}>
              {user?.name || "User"}
            </h3>
            <p className={`text-xs truncate ${TC.textSecondary}`}>
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`flex items-center gap-1 text-xs mb-1 ${TC.textSecondary}`}
          >
            <FaWallet className={`${TC.textIcon} text-xs`} />
            Balance
          </div>
          <p className={`font-bold text-sm ${TC.textBalance}`}>
            ${balance?.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompactProfile;
