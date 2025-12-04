import React, { useMemo, useState, useEffect } from "react";
import { FaUser, FaWallet } from "react-icons/fa";
import useUserContext from "@/Context/UserContext/useUserContext";
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";

const SERVER_URL = "http://localhost:5050";

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

function UserProfileCard() {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const { balance } = useWalletContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const TC = useMemo(
    () => ({
      bgContainer: isLight
        ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      bgItem: isLight
        ? "bg-gray-100/50 border-gray-300 hover:bg-gray-100 hover:border-cyan-600/30"
        : "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-cyan-400/30",
      bgIcon: isLight ? "bg-cyan-100" : "bg-cyan-400/10",
      textIcon: isLight ? "text-cyan-600" : "text-cyan-400",
      textWallet: isLight ? "text-green-700" : "text-green-400",
    }),
    [isLight]
  );

  const getUserImage = (user) => {
    if (!user?.image) return null;
    return user.image.startsWith('http') ? user.image : `${SERVER_URL}/${user.image}`;
  };

  return (
    <div
      className={`
        rounded-xl p-4 h-full flex flex-col gap-4 fade-in
        ${TC.bgContainer}
        ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
      style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
    >
      <div className="fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${TC.bgIcon}`}>
              <FaUser className={TC.textIcon + " text-sm"} />
            </div>
            <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Profile
            </h2>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-xl border hover:border-cyan-600/30 transition-all duration-200 group ${TC.bgItem}`}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-sm flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-200 overflow-hidden">
            {getUserImage(user) ? (
              <img 
                src={getUserImage(user)} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-xs truncate ${TC.textPrimary}`}>
              {user?.name || "User"}
            </h3>
            <p className={`text-xs truncate mt-0.5 ${TC.textSecondary}`}>
              {user?.email || "user@example.com"}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`flex items-center gap-1 text-xs mb-1 ${TC.textSecondary}`}
            >
              <FaWallet className={TC.textIcon + " text-xs"} />
              Balance
            </div>
            <p className={`font-bold text-xs ${TC.textWallet}`}>
              ${balance?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileCard;
